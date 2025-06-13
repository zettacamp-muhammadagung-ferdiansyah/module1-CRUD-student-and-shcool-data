// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for batch-loading active school data by their IDs.
 * This optimizes queries by collecting individual school ID requests
 * and fetching them in a single database query.
 * 
 * @returns {DataLoader} - An instance of DataLoader for fetching schools by ID
 */
function SchoolLoader() {
  return new DataLoader(async function(schoolIds) {
    try {
      // *************** Fetch active schools with matching IDs
      const schools = await SchoolModel.find({
        _id: { $in: schoolIds },
        status: 'active'
      });

      // *************** Map results to maintain original order
      const schoolsById = new Map(
        schools.map(function(school) {
          return [String(school._id), school];
        })
      );

      // *************** Return schools in the same order as requested IDs
      return schoolIds.map(function(id) {
        return schoolsById.get(String(id)) || null;
      });
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/school/school.loader.js',
        parameter_input: JSON.stringify({ schoolIds }),
        function_name: 'SchoolLoader',
        error: String(error.stack),
      });

      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load schools: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = SchoolLoader;
