// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for batch-loading active student data by their IDs.
 * This optimizes queries by collecting individual student ID requests
 * and executing a single database query instead of multiple queries.
 * 
 * @returns {DataLoader} - An instance of DataLoader for fetching students by ID
 */
function StudentLoader() {
  const loader = new DataLoader(async (studentIds) => {
    try {
      // *************** Fetch only active students with matching IDs
      const students = await StudentModel.find({
        _id: { $in: studentIds },
        status: 'active'
      });

      // *************** Map results to maintain original order
      const studentsById = new Map(
        students.map(student => [String(student._id), student])
      );

      // *************** Return students in the same order as requested IDs
      return studentIds.map(id => studentsById.get(String(id)) || null);
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/student/student.loader.js',
        parameter_input: JSON.stringify({ studentIds }),
        function_name: 'StudentLoader',
        error: String(error.stack),
      });

      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load students: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
  
  return loader;
}

// *************** EXPORT MODULE ***************
module.exports = {
  StudentLoader,
};
