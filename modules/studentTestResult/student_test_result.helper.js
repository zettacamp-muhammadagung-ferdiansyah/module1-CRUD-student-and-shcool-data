// *************** STUDENT TEST RESULT HELPER FUNCTIONS 

/**
 * Calculates the average mark from an array of mark objects
 * @param {Array} marks - Array of mark objects with 'mark' property
 * @returns {number} The calculated average mark
 */
function CalculateAverageMark(marks) {
  if (!marks || marks.length === 0) {
    return 0;
  }

  const totalMarks = marks.reduce((total, markObject) => {
    return total + (markObject.mark || 0);
  }, 0);

  return totalMarks / marks.length;
}

// *************** EXPORT MODULE ***************
module.exports = {
  CalculateAverageMark,
};
