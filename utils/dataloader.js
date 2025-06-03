// *************** IMPORT CORE ***************
// Essential core module imports or dependencies needed for the module's operation.

// *************** IMPORT LIBRARY ***************
// Third-party libraries or packages used in this module.
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
// Other internal modules this module depends on.
const Student = require('../modules/student/student.model');

// *************** LOADER CONFIGURATION ***************
// Data loaders for efficient batching and caching.

/**
 * Batch function to load students by an array of school_ids
 * Used to optimize database queries by batching multiple requests
 * @param {Array<string>} schoolIds - Array of school ObjectIds to fetch students for
 * @returns {Promise<Array<Array<Student>>>} - Array of arrays of students grouped by school_id
 * @throws {Error} - If there's an error fetching students from the database
 */
async function BatchStudentsBySchoolId(schoolIds) {
  // *************** START: Batch loading students ***************
  const students = await Student.find({ school_id: { $in: schoolIds } });
  
  // Group students by their respective school_ids for DataLoader response format
  return schoolIds.map(schoolId => students.filter(s => s.school_id.toString() === schoolId.toString()));
  // *************** END: Batch loading students ***************
}

// Create the DataLoader instance with batch loading function
const StudentsBySchoolIdLoader = new DataLoader(BatchStudentsBySchoolId);

// *************** EXPORT MODULE ***************
// Final exports for the module's functionality.
module.exports = {
  StudentsBySchoolIdLoader,
};
