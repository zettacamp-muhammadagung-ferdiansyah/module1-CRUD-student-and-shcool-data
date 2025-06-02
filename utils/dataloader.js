// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const Student = require('../models/Student');

// *************** DATALOADER FOR STUDENTS BY SCHOOL_ID ***************
/**
 * Batch function to load students by an array of school_ids
 * @param {Array<string>} schoolIds
 * @returns {Promise<Array<Array<Student>>>}
 */
async function batchStudentsBySchoolId(schoolIds) {
  const students = await Student.find({ school_id: { $in: schoolIds } });
  // Group students by school_id
  return schoolIds.map(schoolId => students.filter(s => s.school_id.toString() === schoolId.toString()));
}

const studentsBySchoolIdLoader = new DataLoader(batchStudentsBySchoolId);

module.exports = {
  studentsBySchoolIdLoader,
};
