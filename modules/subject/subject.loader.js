// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for batch-loading active subject data by their IDs.
 * This optimizes queries by collecting individual subject ID requests
 * and fetching them in a single database query.
 *
 * @returns {DataLoader} - An instance of DataLoader for fetching subjects by ID
 */
function SubjectLoader() {
  return new DataLoader(async (subjectIds) => {
    try {
      // *************** Fetch active subjects with matching IDs
      const subjects = await SubjectModel.find({
        _id: { $in: subjectIds },
        status: 'active',
      }).lean();

      // *************** Map results to maintain original order
      const subjectsById = new Map(subjects.map((subject) => [String(subject._id), subject]));

      // *************** Return subjects in the same order as requested IDs
      return subjectIds.map((id) => subjectsById.get(String(id)) || null);
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/subject/subject.loader.js',
        parameter_input: JSON.stringify({ subjectIds }),
        function_name: 'SubjectLoader',
        error: String(error.stack),
      });

      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load subjects: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  SubjectLoader,
};
