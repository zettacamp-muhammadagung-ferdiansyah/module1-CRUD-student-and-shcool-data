// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for batch-loading active student test result data by their IDs.
 * This optimizes queries by collecting individual student test result ID requests
 * and fetching them in a single database query.
 * 
 * @returns {DataLoader} - An instance of DataLoader for fetching student test results by ID
 */
function StudentTestResultLoader() {
  return new DataLoader(async (studentTestResultIds) => {
    try {
      // *************** Fetch active student test results with matching IDs
      const studentTestResults = await StudentTestResultModel.find({
        _id: { $in: studentTestResultIds },
        student_test_result_status: 'ACTIVE'
      }).lean();

      // *************** Map results to maintain original order
      const studentTestResultsById = new Map(
        studentTestResults.map(result => [String(result._id), result])
      );

      // *************** Return student test results in the same order as requested IDs
      return studentTestResultIds.map(id => studentTestResultsById.get(String(id)) || null);
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/studentTestResult/student_test_result.loader.js',
        parameter_input: JSON.stringify({ studentTestResultIds }),
        function_name: 'StudentTestResultLoader',
        error: String(error.stack),
      });

      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load student test results: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  StudentTestResultLoader
};
