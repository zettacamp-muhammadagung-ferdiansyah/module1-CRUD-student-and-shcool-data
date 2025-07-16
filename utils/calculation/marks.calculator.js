// *************** MARKS CALCULATOR UTILITY 


/**
 * Calculates the average score for a test based on its notations.
 *
 * @function CalculateTestAverageScore
 * @param {Array<Object>} notationResults - Array of notation result objects, each with achieved_marks.
 * @returns {number} The average score (sum of achieved_marks / number of notations). Returns 0 if no notations.
 */
function CalculateTestAverageMark(notationResults) {
  // *************** Validate input: must be a non-empty array
  if (!Array.isArray(notationResults) || notationResults.length === 0) {
    return 0;
  }
// *************** Sum all achieved marks from notations
  const totalAchievedMark = notationResults.reduce((totalMark, notation) => {
    return totalMark + (notation.achieved_marks || 0);
  }, 0);
// *************** Calculate average mark by dividing total by number of notations
  return totalAchievedMark / notationResults.length;
}

/**
 * Calculates the weighted mark for a test.
 *
 * @function CalculateTestWeightedMark
 * @param {Array<Object>} notationResults - Array of notation result objects, each with achieved_marks.
 * @param {number} weight - The test's weight factor (0.1-1).
 * @returns {number} The weighted test mark (average mark * weight). Returns 0 if inputs are invalid.
 */
function CalculateTestWeightedMark(notationResults, weight) {
  // *************** Validate input: must be a non-empty array and weight must be a number
  if (!Array.isArray(notationResults) || notationResults.length === 0 || typeof weight !== 'number') {
    return 0;
  }
  // *************** Calculate average mark for the test
  const averageMark = CalculateTestAverageMark(notationResults);
  // *************** Multiply average mark by test weight
  return averageMark * weight;
}


/**
 * Calculates the total score for a subject by summing all test scores (already weighted).
 *
 * @function CalculateSubjectTotalScore
 * @param {Array<Object>} testResults - Array of test result objects, each with notation_results and weight.
 * @returns {number} The total subject score (sum of all test weighted scores). Returns 0 if no tests.
 */
function CalculateSubjectTotalMark(testResults, coefficient) {
  // *************** Validate input: must be a non-empty array and coefficient must be a number
  if (!Array.isArray(testResults) || testResults.length === 0 || typeof coefficient !== 'number') {
    return 0;
  }
// *************** Sum all test marks (each test mark is already weighted)
  const totalTestMarks = testResults.reduce((totalTestMarksAccumulator, testResult) => {
    return totalTestMarksAccumulator + CalculateTestWeightedMark(testResult.notation_results, testResult.weight);
  }, 0);
// *************** Multiply total test marks by subject coefficient
  return totalTestMarks * coefficient;
}


/**
 * Calculates the block score as the weighted average of subject scores by coefficient.
 *
 * @function CalculateBlockTotalScore
 * @param {Array<Object>} subjectResults - Array of subject result objects, each with subject_score and coefficient.
 * @returns {number} The block's average score (weighted average of subject scores). Returns 0 if inputs are invalid.
 */
function CalculateBlockTotalMark(subjectResults) {
  // *************** Validate input: must be a non-empty array
  if (!Array.isArray(subjectResults) || subjectResults.length === 0) {
    return 0;
  }
// *************** Sum all subject marks
  const totalSubjectMarks = subjectResults.reduce((totalSubjectMarksAccumulator, subjectResult) => {
    return totalSubjectMarksAccumulator + (subjectResult.subject_mark || 0);
  }, 0);
// *************** Sum all subject coefficients
  const totalCoefficient = subjectResults.reduce((totalCoefficientAccumulator, subjectResult) => {
    return totalCoefficientAccumulator + (subjectResult.coefficient || 1);
  }, 0);
// *************** Avoid division by zero
  if (totalCoefficient === 0) {
    return 0;
  }
// *************** Calculate block mark as total subject marks divided by total coefficients
  return totalSubjectMarks / totalCoefficient;
}


/**
 * Calculates the final mark across all blocks (average of block scores).
 *
 * @function CalculateFinalMark
 * @param {Array<Object>} blockResults - Array of block result objects, each with block_score.
 * @returns {number} The final overall mark (average of all block scores). Returns 0 if inputs are invalid.
 */
function CalculateFinalMark(blockResults) {
  // *************** Validate input: must be a non-empty array
  if (!Array.isArray(blockResults) || blockResults.length === 0) {
    return 0;
  }
// *************** Sum all block marks
  const totalBlockMarks = blockResults.reduce((totalBlockMarksAccumulator, blockResult) => {
    return totalBlockMarksAccumulator + (blockResult.block_mark || 0);
  }, 0);
// *************** Calculate final mark as average of all block marks
  return totalBlockMarks / blockResults.length;
}

// *************** EXPORT MODULE ***************
module.exports = {
  CalculateTestAverageMark,
  CalculateTestWeightedMark,
  CalculateSubjectTotalMark,
  CalculateBlockTotalMark,
  CalculateFinalMark
};
