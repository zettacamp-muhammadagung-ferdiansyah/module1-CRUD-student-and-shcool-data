// *************** CRITERIA EVALUATOR UTILITY

/**
 * Compares two values using the specified operator.
 *
 * @function CompareValues
 * @param {number} actualValue - The actual value to compare.
 * @param {string} operator - The comparison operator ("GTE", "GT", "LTE", "LT", "EQ").
 * @param {number} expectedValue - The threshold value to compare against.
 * @returns {boolean} True if the comparison is satisfied, false otherwise.
 */
function CompareValues(actualValue, operator, expectedValue) {
  switch (operator) {
    case "GTE":
      return actualValue >= expectedValue;
    case "GT":
      return actualValue > expectedValue;
    case "LTE":
      return actualValue <= expectedValue;
    case "LT":
      return actualValue < expectedValue;
    case "EQ":
      return actualValue === expectedValue;
    default:

  switch (rule.type) {
    case "NOTATION_SCORE": {
      // *************** Find the specific notation result by notation_id or notation_text
      if (Array.isArray(testResult.notation_results)) {
        let notation = null;
        if (rule.notation_id !== undefined && rule.notation_id !== null) {
          notation = testResult.notation_results.find(notationResult => notationResult.notation_id === rule.notation_id);
        } else if (rule.notation_text) {
          notation = testResult.notation_results.find(notationResult => notationResult.notation_text === rule.notation_text);
        } else if (rule.notation_index !== undefined) {
          notation = testResult.notation_results.find(notationResult => notationResult.notation_id === rule.notation_index);
        }
        actualValue = notation ? notation.achieved_marks : 0;
      } else {
        return false;
      }
      break;
    }
    case "TOTAL_SCORE": {
      // *************** Use total_marks from testResult
      actualValue = testResult.total_marks || 0;
      break;
    }
    case "TEST_AVERAGE": {
      // *************** Use average_mark from testResult
      actualValue = testResult.average_mark || 0;
      break;
    }
    case "TEST_MARK": {
      // *************** Use weighted_mark as the real test score (already multiplied by weight)
      actualValue = typeof testResult.weighted_mark === 'number' ? testResult.weighted_mark : 0;
      break;
    }
    default:
      return false;
  }
    for (const [ruleIndex, rule] of criteriaGroup.rules.entries()) {
      const ruleResult = EvaluateSubjectRule(
        rule,
        subjectResult,
        testResultsMap
      );
      if (ruleIndex === 0) {
        groupResult = ruleResult;
      } else if (rule.logical_operator === 'AND') {
        groupResult = groupResult && ruleResult;
      } else if (rule.logical_operator === 'OR') {
        groupResult = groupResult || ruleResult;
      }
    }

    // *************** Track if this group is PASS or FAIL and if it is satisfied
    if (criteriaGroup.expected_outcome === 'PASS') {
      hasPassCriteria = true;
      if (groupResult) passSatisfied = true;
    } else if (criteriaGroup.expected_outcome === 'FAIL') {
      hasFailCriteria = true;
      if (groupResult) failSatisfied = true;
    }
  }

  // *************** Return result based on satisfied groups and what groups exist
  if (hasPassCriteria && passSatisfied) return 'PASS'; // *************** Any PASS group satisfied
  if (hasFailCriteria && failSatisfied) return 'FAIL'; // *************** Any FAIL group satisfied
  if (hasPassCriteria) return 'FAIL'; // *************** Only PASS groups exist, none satisfied
  if (hasFailCriteria) return 'PASS'; // *************** Only FAIL groups exist, none satisfied
  return null; //***************  No groups exist
}

/**
 * Evaluates a single rule within a test's criteria.
 *
 * @function EvaluateTestRule
 * @param {Object} rule - The rule object to evaluate.
 * @param {Object} testResult - The test result data object.
 * @returns {boolean} True if the rule is satisfied, false otherwise.
 */
function EvaluateTestRule(rule, testResult) {
  // *************** Default to false if required data is missing
  if (!rule || !testResult) {
    return false;
  }

  // *************** Get the actual value based on rule type
  let actualValue;

  switch (rule.type) {
    case "NOTATION_SCORE": {
      // *************** Find the specific notation result by notation_id or notation_text
      if (Array.isArray(testResult.notation_results)) {
        let notation = null;
        if (rule.notation_id !== undefined && rule.notation_id !== null) {
          notation = testResult.notation_results.find(notationResult => notationResult.notation_id === rule.notation_id);
        } else if (rule.notation_text) {
          notation = testResult.notation_results.find(notationResult => notationResult.notation_text === rule.notation_text);
        } else if (rule.notation_index !== undefined) {
          notation = testResult.notation_results.find(notationResult => notationResult.notation_id === rule.notation_index);
        }
        actualValue = notation ? notation.achieved_marks : 0;
      } else {
        return false;
      }
      break;
    }
    case "TOTAL_SCORE": {
      // *************** Use total_marks from testResult
      actualValue = testResult.total_marks || 0;
      break;
    }
    case "TEST_AVERAGE": {
      // *************** Use average_mark from testResult
      actualValue = testResult.average_mark || 0;
      break;
    }
    default:
      return false;
  }

  // *************** Compare the actual value with the expected value using the rule's operator
  return CompareValues(actualValue, rule.operator, rule.value);
}

/**
 * Evaluates a single rule within a subject's criteria.
 *
 * @function EvaluateSubjectRule
 * @param {Object} rule - The rule object to evaluate.
 * @param {Object} subjectResult - The subject result data object.
 * @param {Object} testResultsMap - Map of test results by test ID.
 * @returns {boolean} True if the rule is satisfied, false otherwise.
 */
function EvaluateSubjectRule(rule, subjectResult, testResultsMap) {
  // *************** Default to false if required data is missing
  if (!rule || !subjectResult) {
    return false;
  }

  // *************** Get the actual value based on rule type
  let actualValue;


  switch (rule.type) {
    case "TEST_RESULT":
      // *************** Check if a specific test was passed
      if (rule.test_id && testResultsMap[rule.test_id]) {
        // *************** The actual value is 1 if passed, 0 if failed, to be compared with 1 (EQ)
        actualValue = testResultsMap[rule.test_id].status === "PASS" ? 1 : 0;
        // *************** Override the comparison to check for equality with 1 (pass)
        return CompareValues(actualValue, "EQ", 1);
      }
      return false;

    case "TEST_MARK": {
      // *************** Get the weighted mark for a specific test (real test score)
      if (rule.test_id && testResultsMap[rule.test_id]) {
        const testResult = testResultsMap[rule.test_id];
        actualValue = typeof testResult.weighted_mark === 'number' ? testResult.weighted_mark : 0;
      } else {
        return false;
      }
      break;
    }

    case "SUBJECT_AVERAGE":
      // *************** Use the overall subject average
      actualValue = subjectResult.average_score || 0;
      break;

    default:
      return false;
  }

  // *************** Compare the actual value with the expected value using the rule's operator
  return CompareValues(actualValue, rule.operator, rule.value);
}

/**
 * Evaluates a single rule within a block's criteria.
 *
 * @function EvaluateBlockRule
 * @param {Object} rule - The rule object to evaluate.
 * @param {Object} blockResult - The block result data object.
 * @param {Object} subjectResultsMap - Map of subject results by subject ID.
 * @returns {boolean} True if the rule is satisfied, false otherwise.
 */
function EvaluateBlockRule(rule, blockResult, subjectResultsMap) {
  // *************** Default to false if required data is missing
  if (!rule || !blockResult) {
    return false;
  }

  // *************** Get the actual value based on rule type
  let actualValue;

  switch (rule.type) {
    case "SUBJECT_RESULT":
      // *************** Check if a specific subject was passed
      if (rule.subject_id && subjectResultsMap[rule.subject_id]) {
        // *************** The actual value is 1 if passed, 0 if failed, to be compared with 1 (EQ)
        actualValue =
          subjectResultsMap[rule.subject_id].status === "PASS" ? 1 : 0;
        // *************** Override the comparison to check for equality with 1 (pass)
        return CompareValues(actualValue, "EQ", 1);
      }
      return false;

    case "SUBJECT_MARK":
      // *************** Get the mark for a specific subject
      if (rule.subject_id && subjectResultsMap[rule.subject_id]) {
        actualValue = subjectResultsMap[rule.subject_id].average_score || 0;
      } else {
        return false;
      }
      break;

    case "BLOCK_AVERAGE":
      // *************** Use the overall block average
      actualValue = blockResult.average_score || 0;
      break;

    default:
      return false;
  }

  // *************** Compare the actual value with the expected value using the rule's operator
  return CompareValues(actualValue, rule.operator, rule.value);
}

/**
 * Determines if a block result meets the block's passing criteria.
 *
 * @function EvaluateBlockCriteria
 * @param {Array<Object>} criteria - Array of criteria group objects, each with rules.
 * @param {Object} blockResult - The block result data object.
 * @param {Object} subjectResultsMap - Map of subject results by subject ID.
 * @returns {boolean} True if passing criteria are met, false otherwise.
 */
function EvaluateBlockCriteria(criteria, blockResult, subjectResultsMap) {
  // *************** If no criteria defined, return null (no result)
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return null;
  }

  // *************** Track if there are PASS/FAIL groups and if any are satisfied
  let hasPassCriteria = false;
  let hasFailCriteria = false;
  let passSatisfied = false;
  let failSatisfied = false;

  // *************** Evaluate all criteria groups (both PASS and FAIL)
  for (const criteriaGroup of criteria) {
    if (!Array.isArray(criteriaGroup.rules) || criteriaGroup.rules.length === 0) continue;

    let groupResult = null;
    // *************** Evaluate all rules in this group
    for (const [ruleIndex, rule] of criteriaGroup.rules.entries()) {
      const ruleResult = EvaluateBlockRule(
        rule,
        blockResult,
        subjectResultsMap
      );
      if (ruleIndex === 0) {
        groupResult = ruleResult;
      } else if (rule.logical_operator === 'AND') {
        groupResult = groupResult && ruleResult;
      } else if (rule.logical_operator === 'OR') {
        groupResult = groupResult || ruleResult;
      }
    }

    // *************** Track if this group is PASS or FAIL and if it is satisfied
    if (criteriaGroup.expected_outcome === 'PASS') {
      hasPassCriteria = true;
      if (groupResult) passSatisfied = true;
    } else if (criteriaGroup.expected_outcome === 'FAIL') {
      hasFailCriteria = true;
      if (groupResult) failSatisfied = true;
    }
  }

  // *************** Return result based on satisfied groups and what groups exist
  if (hasPassCriteria && passSatisfied) return 'PASS'; // Any PASS group satisfied
  if (hasFailCriteria && failSatisfied) return 'FAIL'; // Any FAIL group satisfied
  if (hasPassCriteria) return 'FAIL'; // Only PASS groups exist, none satisfied
  if (hasFailCriteria) return 'PASS'; // Only FAIL groups exist, none satisfied
  return null; // No groups exist
}

/**
 * Returns a detailed evaluation of test criteria, including rule breakdowns.
 *
 * @function EvaluateTestCriteriaDetailed
 * @param {Array<Object>} criteria - Array of criteria group objects, each with rules.
 * @param {Object} testResult - The test result data object.
 * @returns {Object} An object with { passed: boolean, criteria_evaluation: Array }.
 */
/**
 * Returns a detailed evaluation of test criteria, including rule breakdowns.
 * Handles both PASS and FAIL groups, and does not default to PASS if no criteria.
 *
 * @function EvaluateTestCriteriaDetailed
 * @param {Array<Object>} criteria - Array of criteria group objects, each with rules.
 * @param {Object} testResult - The test result data object.
 * @returns {Object} An object with { result: 'PASS'|'FAIL'|null, criteria_evaluation: Array }.
 */
function EvaluateTestCriteriaDetailed(criteria, testResult) {
  // *************** If no criteria defined, return null and empty evaluation
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return {
      result: null,
      criteria_evaluation: [],
    };
  }

  // *************** Stores detailed evaluation results for each criteria group
  const evaluationResults = [];
  // *************** Tracks if any PASS group is satisfied
  let passSatisfied = false;
  // *************** Tracks if any FAIL group is satisfied
  let failSatisfied = false;
  // *************** Tracks if there is at least one PASS group
  let hasPassCriteria = false;
  // *************** Tracks if there is at least one FAIL group
  let hasFailCriteria = false;

  // *************** Evaluate all criteria groups (both PASS and FAIL)
  for (const group of criteria) {
    if (!Array.isArray(group.rules) || group.rules.length === 0) continue;

    let groupResult = null;
    const ruleEvaluations = [];
    // *************** Evaluate all rules in this group and collect details
    // *************** Evaluate each rule in the group, step by step
    group.rules.forEach((rule, ruleIdx) => {
      // *************** 1. Evaluate the rule using the test result
      const ruleResult = EvaluateTestRule(rule, testResult);

      // *************** 2. Determine the actual value used for comparison, based on rule type
      let actualValue = 0;
      if (rule.type === "NOTATION_SCORE" && rule.notation_index !== undefined) {
        // *************** If the rule is about a specific notation, get the achieved marks for that notation
        const notation = testResult.notation_results && testResult.notation_results.find(
          (notation) => notation.notation_id === rule.notation_index
        );
        actualValue = notation ? notation.achieved_marks : 0;
      } else if (rule.type === "TOTAL_SCORE") {
        // *************** If the rule is about the total score, use total_marks from test result
        actualValue = testResult.total_marks || 0;
      } else if (rule.type === "TEST_AVERAGE") {
        // *************** If the rule is about the test average, use weighted_mark from test result (real test score)
        actualValue = typeof testResult.weighted_mark === 'number' ? testResult.weighted_mark : 0;
      }

      // *************** 3. Store the evaluation details for this rule, including all relevant info
      ruleEvaluations.push({
        type: rule.type, // *************** The type of rule (NOTATION_SCORE, TOTAL_SCORE, etc)
        logical_operator: rule.logical_operator || null, // *************** Logical operator to combine with previous rule
        target_id: rule.notation_index !== undefined ? String(rule.notation_index) : null, // The notation index if relevant
        operator: rule.operator, // *************** The comparison operator (GTE, EQ, etc)
        value: rule.value, // *************** The expected value
        actual_value: actualValue, // *************** The actual value used for comparison
        passed: ruleResult, // *************** Whether this rule was satisfied
      });

      // *************** 4. Combine rule results using logical operators (AND/OR) to get the group result
      if (ruleIdx === 0) {
        // *************** The first rule sets the initial group result
        groupResult = ruleResult;
      } else if (rule.logical_operator === 'AND') {
        // *************** Combine with previous result using AND
        groupResult = groupResult && ruleResult;
      } else if (rule.logical_operator === 'OR') {
        // *************** Combine with previous result using OR
        groupResult = groupResult || ruleResult;
      }
    });
    evaluationResults.push({
      expected_outcome: group.expected_outcome,
      result: groupResult,
      rule_evaluations: ruleEvaluations,
    });
    // *************** Track if this group is PASS or FAIL and if it is satisfied
    if (group.expected_outcome === 'PASS') {
      hasPassCriteria = true;
      if (groupResult) passSatisfied = true;
    } else if (group.expected_outcome === 'FAIL') {
      hasFailCriteria = true;
      if (groupResult) failSatisfied = true;
    }
  }

  // *************** Return result based on satisfied groups and what groups exist
  let result = null;
  if (hasPassCriteria && passSatisfied) result = 'PASS';
  else if (hasFailCriteria && failSatisfied) result = 'FAIL';
  else if (hasPassCriteria) result = 'FAIL';
  else if (hasFailCriteria) result = 'PASS';

  return {
    result,
    criteria_evaluation: evaluationResults,
  };
}

/**
 * Returns a detailed evaluation of subject criteria, including rule breakdowns.
 *
 * @function EvaluateSubjectCriteriaDetailed
 * @param {Array<Object>} criteria - Array of criteria group objects, each with rules.
 * @param {Object} subjectResult - The subject result data object.
 * @param {Object} testResultsMap - Map of test results by test ID.
 * @returns {Object} An object with { passed: boolean, criteria_evaluation: Array }.
 */
/**
 * Returns a detailed evaluation of subject criteria, including rule breakdowns.
 * Handles both PASS and FAIL groups, and does not default to PASS if no criteria.
 *
 * @function EvaluateSubjectCriteriaDetailed
 * @param {Array<Object>} criteria - Array of criteria group objects, each with rules.
 * @param {Object} subjectResult - The subject result data object.
 * @param {Object} testResultsMap - Map of test results by test ID.
 * @returns {Object} An object with { result: 'PASS'|'FAIL'|null, criteria_evaluation: Array }.
 */
function EvaluateSubjectCriteriaDetailed(criteria, subjectResult, testResultsMap) {
  // *************** If no criteria defined, return null and empty evaluation
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return {
      result: null,
      criteria_evaluation: [],
    };
  }

  // *************** Stores detailed evaluation results for each criteria group
  const evaluationResults = [];
  // *************** Tracks if any PASS group is satisfied
  let passSatisfied = false;
  // *************** Tracks if any FAIL group is satisfied
  let failSatisfied = false;
  // *************** Tracks if there is at least one PASS group
  let hasPassCriteria = false;
  // *************** Tracks if there is at least one FAIL group
  let hasFailCriteria = false;

  // *************** Evaluate all criteria groups (both PASS and FAIL)
  for (const group of criteria) {
    if (!Array.isArray(group.rules) || group.rules.length === 0) continue;

    let groupResult = null;
    const ruleEvaluations = [];
    // *************** Evaluate each rule in the group, step by step
    group.rules.forEach((rule, ruleIdx) => {
      // *************** 1. Evaluate the rule using the subject result and test results map
      const ruleResult = EvaluateSubjectRule(rule, subjectResult, testResultsMap);

      // *************** 2. Determine the actual value used for comparison, based on rule type
      let actualValue = 0;
      if (rule.type === "TEST_RESULT" && rule.test_id) {
        // *************** If the rule is about a test result, set 1 if the test was passed, 0 if failed
        actualValue = testResultsMap[rule.test_id] && testResultsMap[rule.test_id].status === "PASS" ? 1 : 0;
      } else if (rule.type === "TEST_MARK" && rule.test_id) {
        // *************** If the rule is about a test mark, use the weighted mark (final score) for the specific test
        actualValue = testResultsMap[rule.test_id] ? testResultsMap[rule.test_id].weighted_mark || 0 : 0;
      } else if (rule.type === "SUBJECT_AVERAGE") {
        // *************** If the rule is about the subject average, use the overall subject average score
        actualValue = subjectResult.average_score || 0;
      }

      // *************** 3. Store the evaluation details for this rule, including all relevant info
      ruleEvaluations.push({
        type: rule.type, // *************** The type of rule (TEST_RESULT, TEST_MARK, etc)
        logical_operator: rule.logical_operator || null, // *************** Logical operator to combine with previous rule
        target_id: rule.test_id ? String(rule.test_id) : null, // *************** The test id if relevant
        operator: rule.operator, // *************** The comparison operator (GTE, EQ, etc)
        value: rule.value, // *************** The expected value
        actual_value: actualValue, // *************** The actual value used for comparison
        passed: ruleResult, // *************** Whether this rule was satisfied
      });

      // *************** 4. Combine rule results using logical operators (AND/OR) to get the group result
      if (ruleIdx === 0) {
        // *************** The first rule sets the initial group result
        groupResult = ruleResult;
      } else if (rule.logical_operator === 'AND') {
        // *************** Combine with previous result using AND
        groupResult = groupResult && ruleResult;
      } else if (rule.logical_operator === 'OR') {
        // *************** Combine with previous result using OR
        groupResult = groupResult || ruleResult;
      }
    });
    evaluationResults.push({
      expected_outcome: group.expected_outcome,
      result: groupResult,
      rule_evaluations: ruleEvaluations,
    });
    // *************** Track if this group is PASS or FAIL and if it is satisfied
    if (group.expected_outcome === 'PASS') {
      hasPassCriteria = true;
      if (groupResult) passSatisfied = true;
    } else if (group.expected_outcome === 'FAIL') {
      hasFailCriteria = true;
      if (groupResult) failSatisfied = true;
    }
  }

  // *************** Return result based on satisfied groups and what groups exist
  let result = null;
  if (hasPassCriteria && passSatisfied) result = 'PASS';
  else if (hasFailCriteria && failSatisfied) result = 'FAIL';
  else if (hasPassCriteria) result = 'FAIL';
  else if (hasFailCriteria) result = 'PASS';

  return {
    result,
    criteria_evaluation: evaluationResults,
  };
}

/**
 * Returns a detailed evaluation of block criteria, including rule breakdowns.
 *
 * @function EvaluateBlockCriteriaDetailed
 * @param {Array<Object>} criteria - Array of criteria group objects, each with rules.
 * @param {Object} blockResult - The block result data object.
 * @param {Object} subjectResultsMap - Map of subject results by subject ID.
 * @returns {Object} An object with { passed: boolean, criteria_evaluation: Array }.
 */
/**
 * Returns a detailed evaluation of block criteria, including rule breakdowns.
 * Handles both PASS and FAIL groups, and does not default to PASS if no criteria.
 *
 * @function EvaluateBlockCriteriaDetailed
 * @param {Array<Object>} criteria - Array of criteria group objects, each with rules.
 * @param {Object} blockResult - The block result data object.
 * @param {Object} subjectResultsMap - Map of subject results by subject ID.
 * @returns {Object} An object with { result: 'PASS'|'FAIL'|null, criteria_evaluation: Array }.
 */
function EvaluateBlockCriteriaDetailed(criteria, blockResult, subjectResultsMap) {
  // *************** If no criteria defined, return null and empty evaluation
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return {
      result: null,
      criteria_evaluation: [],
    };
  }

  // *************** Stores detailed evaluation results for each criteria group
  const evaluationResults = [];
  // *************** Tracks if any PASS group is satisfied
  let passSatisfied = false;
  // *************** Tracks if any FAIL group is satisfied
  let failSatisfied = false;
  // *************** Tracks if there is at least one PASS group
  let hasPassCriteria = false;
  // *************** Tracks if there is at least one FAIL group
  let hasFailCriteria = false;

  // *************** Evaluate all criteria groups (both PASS and FAIL)
  for (const group of criteria) {
    if (!Array.isArray(group.rules) || group.rules.length === 0) continue;

    let groupResult = null;
    const ruleEvaluations = [];
    // *************** Evaluate all rules in this group and collect details
    // *************** Evaluate each rule in the group, step by step
    group.rules.forEach((rule, ruleIdx) => {
      // *************** 1. Evaluate the rule using the block result and subject results map
      const ruleResult = EvaluateBlockRule(rule, blockResult, subjectResultsMap);

      // *************** 2. Determine the actual value used for comparison, based on rule type
      let actualValue = 0;
      if (rule.type === "SUBJECT_RESULT" && rule.subject_id) {
        // *************** If the rule is about a subject result, set 1 if the subject was passed, 0 if failed
        actualValue = subjectResultsMap[rule.subject_id] && subjectResultsMap[rule.subject_id].status === "PASS" ? 1 : 0;
      } else if (rule.type === "SUBJECT_MARK" && rule.subject_id) {
        // *************** If the rule is about a subject mark, get the average score for the specific subject
        actualValue = subjectResultsMap[rule.subject_id] ? subjectResultsMap[rule.subject_id].average_score || 0 : 0;
      } else if (rule.type === "BLOCK_AVERAGE") {
        // *************** If the rule is about the block average, use the overall block average score
        actualValue = blockResult.average_score || 0;
      }

      // *************** 3. Store the evaluation details for this rule, including all relevant info
      ruleEvaluations.push({
        type: rule.type, // *************** The type of rule (SUBJECT_RESULT, SUBJECT_MARK, etc)
        logical_operator: rule.logical_operator || null, // *************** Logical operator to combine with previous rule
        target_id: rule.subject_id ? String(rule.subject_id) : null, // *************** The subject id if relevant
        operator: rule.operator, // *************** The comparison operator (GTE, EQ, etc)
        value: rule.value, // *************** The expected value
        actual_value: actualValue, // *************** The actual value used for comparison
        passed: ruleResult, // *************** Whether this rule was satisfied
      });

      // *************** 4. Combine rule results using logical operators (AND/OR) to get the group result
      if (ruleIdx === 0) {
        // *************** The first rule sets the initial group result
        groupResult = ruleResult;
      } else if (rule.logical_operator === 'AND') {
        // *************** Combine with previous result using AND
        groupResult = groupResult && ruleResult;
      } else if (rule.logical_operator === 'OR') {
        // *************** Combine with previous result using OR
        groupResult = groupResult || ruleResult;
      }
    });
    evaluationResults.push({
      expected_outcome: group.expected_outcome,
      result: groupResult,
      rule_evaluations: ruleEvaluations,
    });
    // *************** Track if this group is PASS or FAIL and if it is satisfied
    if (group.expected_outcome === 'PASS') {
      hasPassCriteria = true;
      if (groupResult) passSatisfied = true;
    } else if (group.expected_outcome === 'FAIL') {
      hasFailCriteria = true;
      if (groupResult) failSatisfied = true;
    }
  }

  // *************** Return result based on satisfied groups and what groups exist
  let result = null;
  if (hasPassCriteria && passSatisfied) result = 'PASS';
  else if (hasFailCriteria && failSatisfied) result = 'FAIL';
  else if (hasPassCriteria) result = 'FAIL';
  else if (hasFailCriteria) result = 'PASS';

  return {
    result,
    criteria_evaluation: evaluationResults,
  };
}

// *************** EXPORT MODULE ***************
module.exports = {
  EvaluateTestCriteriaDetailed,
  EvaluateSubjectCriteriaDetailed,
  EvaluateBlockCriteriaDetailed,
  CompareValues,
  EvaluateTestRule,
  EvaluateSubjectRule,
  EvaluateBlockRule,
};
