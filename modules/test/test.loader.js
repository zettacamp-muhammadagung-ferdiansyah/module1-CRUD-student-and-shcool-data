// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for batch-loading active test data by their IDs.
 * This optimizes queries by collecting individual test ID requests
 * and fetching them in a single database query.
 * 
 * @returns {DataLoader} - An instance of DataLoader for fetching tests by ID
 */
function TestLoader() {
  return new DataLoader(async (testIds) => {
    try {
      // *************** Fetch active tests with matching IDs (mimic subject loader)
      const tests = await TestModel.find({
        _id: { $in: testIds },
        test_status: 'active'
      }).lean();

      // *************** Map results to maintain original order
      const testsById = new Map(
        tests.map(test => [String(test._id), test])
      );

      // *************** Return tests in the same order as requested IDs
      return testIds.map(id => testsById.get(String(id)) || null);
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/test/test.loader.js',
        parameter_input: JSON.stringify({ testIds }),
        function_name: 'TestLoader',
        error: String(error.stack),
      });

      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load tests: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  TestLoader
};
