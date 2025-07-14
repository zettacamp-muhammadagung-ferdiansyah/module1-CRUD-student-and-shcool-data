// *************** MARKS CALCULATOR UTILITY 
/**
 * Utility functions for calculating marks at different levels of the academic hierarchy.
 * These functions implement the core mathematical calculations required for the transcript system.
 */

/**
 * *************** Calculates the weighted mark for a test based on its weight
 * @function CalculateTestWeightedMark
 * @param {number} mark - The test's average mark (0-20)
 * @param {number} weight - The test's weight factor (0-1)
 * @returns {number} The weighted test mark
 */
function CalculateTestWeightedMark(mark, weight) {
  // Validate inputs
  if (typeof mark !== 'number' || typeof weight !== 'number') {
    return 0;
  }
  
  // Apply test weight to the mark
  return mark * weight;
}

/**
 * *************** Calculates the total mark for a subject based on test results and subject coefficient
 * @function CalculateSubjectTotalMark
 * @param {Array} testResults - Array of test result objects with marks and weights
 * @param {number} coefficient - The subject's coefficient for weighted calculations
 * @returns {number} The total subject mark
 */
function CalculateSubjectTotalMark(testResults, coefficient) {
  // Validate inputs
  if (!Array.isArray(testResults) || testResults.length === 0 || typeof coefficient !== 'number') {
    return 0;
  }
  
  // Calculate the sum of weighted test marks
  const totalWeightedMarks = testResults.reduce((sum, test) => {
    const weightedMark = CalculateTestWeightedMark(test.average_mark || 0, test.weight || 0);
    return sum + weightedMark;
  }, 0);
  
  // Calculate the total weight of all tests
  const totalWeight = testResults.reduce((sum, test) => sum + (test.weight || 0), 0);
  
  // If there are no weights, return 0 to avoid division by zero
  if (totalWeight === 0) {
    return 0;
  }
  
  // Calculate the weighted average and apply the subject coefficient
  return (totalWeightedMarks / totalWeight) * coefficient;
}

/**
 * *************** Calculates the total mark for a block based on subject results
 * @function CalculateBlockTotalMark
 * @param {Array} subjectResults - Array of subject result objects with total marks and coefficients
 * @returns {number} The block's average mark
 */
function CalculateBlockTotalMark(subjectResults) {
  // Validate inputs
  if (!Array.isArray(subjectResults) || subjectResults.length === 0) {
    return 0;
  }
  
  // Calculate the sum of weighted subject marks
  const totalWeightedMarks = subjectResults.reduce((sum, subject) => {
    return sum + (subject.total_mark || 0) * (subject.coefficient || 1);
  }, 0);
  
  // Calculate the total coefficient sum
  const totalCoefficient = subjectResults.reduce((sum, subject) => {
    return sum + (subject.coefficient || 1);
  }, 0);
  
  // If there are no coefficients, return 0 to avoid division by zero
  if (totalCoefficient === 0) {
    return 0;
  }
  
  // Calculate the weighted average of subject marks
  return totalWeightedMarks / totalCoefficient;
}

/**
 * *************** Calculates the final mark across all blocks
 * @function CalculateFinalMark
 * @param {Array} blockResults - Array of block result objects with total marks
 * @returns {number} The final overall mark
 */
function CalculateFinalMark(blockResults) {
  // Validate inputs
  if (!Array.isArray(blockResults) || blockResults.length === 0) {
    return 0;
  }
  
  // Calculate the sum of all block marks
  const totalMarks = blockResults.reduce((sum, block) => {
    return sum + (block.total_mark || 0);
  }, 0);
  
  // Calculate the average mark across all blocks
  return totalMarks / blockResults.length;
}

// *************** EXPORT MODULE ***************
module.exports = {
  CalculateTestWeightedMark,
  CalculateSubjectTotalMark,
  CalculateBlockTotalMark,
  CalculateFinalMark
};
