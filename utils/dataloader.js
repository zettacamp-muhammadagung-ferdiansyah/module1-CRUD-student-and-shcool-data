// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const Student = require('../modules/student/student.model');

/**
 * DataLoader configuration for batch loading related data
 * Efficiently loads students by their school IDs to prevent N+1 queries
 */

/**
 * Batch function to efficiently load students by their school IDs
 * @async
 * @function BatchStudentsBySchoolId
 * @param {Array<mongoose.Types.ObjectId>} schoolIds - Array of school IDs to fetch students for
 * @returns {Promise<Array<Array<Student>>>} Array of arrays containing students for each school
 * @throws {Error} If there's an error fetching students from the database
 */
async function BatchStudentsBySchoolId(schoolIds) {
  const students = await Student.find({ school_id: { $in: schoolIds } });
  return schoolIds.map(schoolId => 
    students.filter(s => s.school_id.toString() === schoolId.toString())
  );
}

// **************** Create DataLoader instance
const StudentsBySchoolIdLoader = new DataLoader(BatchStudentsBySchoolId);

// *************** EXPORT MODULE ***************
module.exports = {
  StudentsBySchoolIdLoader
};
