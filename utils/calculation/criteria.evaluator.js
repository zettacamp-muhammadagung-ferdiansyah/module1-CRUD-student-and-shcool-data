// *************** CRITERIA EVALUATOR UTILITY
/**
 * Utility functions for evaluating passing criteria at different levels of the academic hierarchy.
 * These functions implement the rule-based evaluation logic for the transcript system.
 */

/**
 * *************** Compares two values using the specified operator
 * @function CompareValues
 * @param {number} actualValue - The actual value to compare
 * @param {string} operator - The comparison operator (GTE, GT, LTE, LT, EQ)
 * @param {number} expectedValue - The threshold value to compare against
 * @returns {boolean} The result of the comparison
 */
function CompareValues(actualValue, operator, expectedValue) {
  switch (operator) {
    case "GT":
      return actualValue > expectedValue;
    case "GTE":
      return actualValue >= expectedValue;
    case "LT":
      return actualValue < expectedValue;
    case "LTE":
      return actualValue <= expectedValue;
    case "EQ":
      // *************** For floating point equality
      return Math.abs(actualValue - expectedValue) < Number.EPSILON;
    default:
      return false;
  }
}

/**
 * *************** Evaluates a single rule within a test's criteria
 * @function EvaluateTestRule
 * @param {Object} rule - The rule to evaluate
 * @param {Object} testResult - The test result data
 * @returns {boolean} The result of the rule evaluation
 */
function EvaluateTestRule(rule, testResult) {
  // *************** Default to false if required data is missing
  if (!rule || !testResult) {
    return false;
  }

  // *************** Get the actual value based on rule type
  let actualValue;

  switch (rule.type) {
    case "NOTATION_SCORE":
      // *************** Find the specific notation result if notation_index is provided
      if (
        rule.notation_index !== undefined &&
        Array.isArray(testResult.notation_results)
      ) {
        const notation = testResult.notation_results.find(
          (n) => n.notation_id === rule.notation_index
        );
        actualValue = notation ? notation.achieved_points : 0;
      } else {
        return false;
      }
      break;

    case "TOTAL_SCORE":
      // *************** Use the overall test score
      actualValue = testResult.percentage || 0;
      break;

    default:
      return false;
  }

  // *************** Compare the actual value with the expected value using the rule's operator
  return CompareValues(actualValue, rule.operator, rule.value);
}

/**
 * *************** Determines if a test result meets the test's passing criteria
 * @function EvaluateTestCriteria
 * @param {Array} criteria - Array of criteria objects with rules
 * @param {Object} testResult - The test result data
 * @returns {boolean} True if passing criteria are met, false otherwise
 */
function EvaluateTestCriteria(criteria, testResult) {
  // *************** If no criteria defined, default to pass
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return true;
  }

  // *************** For each criteria group with expected outcome "PASS"
  for (const criteriaGroup of criteria) {
    // *************** Skip criteria groups that don't have the "PASS" expected outcome
    if (criteriaGroup.expected_outcome !== "PASS") {
      continue;
    }

    // *************** If no rules in this group, continue to next group
    if (
      !Array.isArray(criteriaGroup.rules) ||
      criteriaGroup.rules.length === 0
    ) {
      continue;
    }

    // *************** Evaluate all rules in this criteria group
    let criteriaResult = true;
    let prevResult = true;

    for (let i = 0; i < criteriaGroup.rules.length; i++) {
      const rule = criteriaGroup.rules[i];
      const ruleResult = EvaluateTestRule(rule, testResult);

      // *************** Apply logical operator if not the first rule
      if (i > 0 && rule.logical_operator) {
        if (rule.logical_operator === "AND") {
          criteriaResult = criteriaResult && ruleResult;
        } else if (rule.logical_operator === "OR") {
          criteriaResult = criteriaResult || ruleResult;
        }
      } else {
        // *************** First rule just sets the initial value
        criteriaResult = ruleResult;
      }

      prevResult = ruleResult;
    }

    // *************** If this criteria group is satisfied, the test passes
    if (criteriaResult) {
      return true;
    }
  }

  // *************** If no passing criteria were satisfied, the test fails
  return false;
}

/**
 * *************** Evaluates a single rule within a subject's criteria
 * @function EvaluateSubjectRule
 * @param {Object} rule - The rule to evaluate
 * @param {Object} subjectResult - The subject result data
 * @param {Object} testResultsMap - Map of test results by ID
 * @returns {boolean} The result of the rule evaluation
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

    case "TEST_MARK":
      // *************** Get the mark for a specific test
      if (rule.test_id && testResultsMap[rule.test_id]) {
        actualValue = testResultsMap[rule.test_id].percentage || 0;
      } else {
        return false;
      }
      break;

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
 * *************** Determines if a subject result meets the subject's passing criteria
 * @function EvaluateSubjectCriteria
 * @param {Array} criteria - Array of criteria objects with rules
 * @param {Object} subjectResult - The subject result data
 * @param {Object} testResultsMap - Map of test results by ID
 * @returns {boolean} True if passing criteria are met, false otherwise
 */
function EvaluateSubjectCriteria(criteria, subjectResult, testResultsMap) {
  // *************** If no criteria defined, default to pass
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return true;
  }

  // *************** For each criteria group with expected outcome "PASS"
  for (const criteriaGroup of criteria) {
    // *************** Skip criteria groups that don't have the "PASS" expected outcome
    if (criteriaGroup.expected_outcome !== "PASS") {
      continue;
    }

    // *************** If no rules in this group, continue to next group
    if (
      !Array.isArray(criteriaGroup.rules) ||
      criteriaGroup.rules.length === 0
    ) {
      continue;
    }

    // *************** Evaluate all rules in this criteria group
    let criteriaResult = true;
    let prevResult = true;

    for (let i = 0; i < criteriaGroup.rules.length; i++) {
      const rule = criteriaGroup.rules[i];
      const ruleResult = EvaluateSubjectRule(
        rule,
        subjectResult,
        testResultsMap
      );

      // *************** Apply logical operator if not the first rule
      if (i > 0 && rule.logical_operator) {
        if (rule.logical_operator === "AND") {
          criteriaResult = criteriaResult && ruleResult;
        } else if (rule.logical_operator === "OR") {
          criteriaResult = criteriaResult || ruleResult;
        }
      } else {
        // *************** First rule just sets the initial value
        criteriaResult = ruleResult;
      }

      prevResult = ruleResult;
    }

    // *************** If this criteria group is satisfied, the subject passes
    if (criteriaResult) {
      return true;
    }
  }

  // *************** If no passing criteria were satisfied, the subject fails
  return false;
}

/**
 * *************** Evaluates a single rule within a block's criteria
 * @function EvaluateBlockRule
 * @param {Object} rule - The rule to evaluate
 * @param {Object} blockResult - The block result data
 * @param {Object} subjectResultsMap - Map of subject results by ID
 * @returns {boolean} The result of the rule evaluation
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
 * *************** Determines if a block result meets the block's passing criteria
 * @function EvaluateBlockCriteria
 * @param {Array} criteria - Array of criteria objects with rules
 * @param {Object} blockResult - The block result data
 * @param {Object} subjectResultsMap - Map of subject results by ID
 * @returns {boolean} True if passing criteria are met, false otherwise
 */
function EvaluateBlockCriteria(criteria, blockResult, subjectResultsMap) {
  // *************** If no criteria defined, default to pass
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return true;
  }

  // ***************  For each criteria group with expected outcome "PASS"
  for (const criteriaGroup of criteria) {
    // *************** Skip criteria groups that don't have the "PASS" expected outcome
    if (criteriaGroup.expected_outcome !== "PASS") {
      continue;
    }

    // ***************  If no rules in this group, continue to next group
    if (
      !Array.isArray(criteriaGroup.rules) ||
      criteriaGroup.rules.length === 0
    ) {
      continue;
    }

    // ***************  Evaluate all rules in this criteria group
    let criteriaResult = true;
    let prevResult = true;

    for (let i = 0; i < criteriaGroup.rules.length; i++) {
      const rule = criteriaGroup.rules[i];
      const ruleResult = EvaluateBlockRule(
        rule,
        blockResult,
        subjectResultsMap
      );

      // *************** Apply logical operator if not the first rule
      if (i > 0 && rule.logical_operator) {
        if (rule.logical_operator === "AND") {
          criteriaResult = criteriaResult && ruleResult;
        } else if (rule.logical_operator === "OR") {
          criteriaResult = criteriaResult || ruleResult;
        }
      } else {
        // *************** First rule just sets the initial value
        criteriaResult = ruleResult;
      }

      prevResult = ruleResult;
    }

    // *************** If this criteria group is satisfied, the block passes
    if (criteriaResult) {
      return true;
    }
  }

  // *************** If no passing criteria were satisfied, the block fails
  return false;
}

// *************** EXPORT MODULE ***************
module.exports = {
  EvaluateTestCriteria,
  EvaluateSubjectCriteria,
  EvaluateBlockCriteria,
  CompareValues,
  EvaluateTestRule,
  EvaluateSubjectRule,
  EvaluateBlockRule,
};
