// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const StudentModel = require('../modules/student/student.model');
const ErrorLogModel = require('../error-logs/error-log.model');

/**
 * Batch function to efficiently load students by their school IDs
 * @async
 * @function BatchStudentsBySchoolId
 * @param {Array<mongoose.Types.ObjectId>} schoolIds - Array of school IDs to fetch students for
 * @returns {Promise<Array<Array<StudentModel>>>} Array of arrays containing students for each school
 * @throws {Error} If there's an error fetching students from the database
 */

async function BatchStudentsBySchoolId(schoolIds) {
  try {
    // *************** Validate input to ensure data sanity
    if (!Array.isArray(schoolIds) || !schoolIds.length) {
      return [];
    }
     
    //  *************** Check that all IDs are valid MongoDB ObjectIDs
    const validIds = schoolIds.filter(function(id) {
      return id && id.toString().match(/^[0-9a-fA-F]{24}$/);
    });
    if (!validIds.length) {
      return schoolIds.map(function() {
        return [];
      });
    }
    
    const students = await StudentModel.find({ 
      school_id: { $in: validIds },
      status: 'active' 
    });
    
    // *************** Store result in variable before returning
    const result = schoolIds.map(function(schoolId) {
      return students.filter(function(s) {
        return s.school_id.toString() === schoolId.toString();
      });
    });
    
    return result;
  } catch (error) {
    // *************** Log error with relevant context for debugging
    await ErrorLogModel.create({
      path: 'utils/dataloader.js',
      parameter_input: JSON.stringify({ schoolIds }),
      function_name: 'BatchStudentsBySchoolId',
      error: String(error.stack),
    });
    
    // *************** Return empty arrays as fallback to maintain expected response structure
    return schoolIds.map(function() {
      return [];
    });
  }
}

// **************** Create DataLoader instance
const StudentsBySchoolIdLoader = new DataLoader(BatchStudentsBySchoolId);

// *************** EXPORT MODULE ***************
module.exports = {
  StudentsBySchoolIdLoader
};
