// *************** IMPORT CORE ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const ErrorLog = require('../error-logs/error-log.model');

/**
 * Logs an error to the database and returns an ApolloError
 * 
 * @param {Error} error - The error object
 * @param {string} errorCode - The error code to use
 * @param {string} resolver - The name of the resolver where the error occurred
 * @param {string} operationType - The type of operation (query/mutation)
 * @param {object} requestParams - The request parameters
 * @param {string} [userId] - The ID of the user who performed the operation
 * @returns {ApolloError} An Apollo error object
 */
async function LogError(error, errorCode, resolver, operationType, requestParams, userId = null) {
  try {
    // *************** Create error log entry
    await ErrorLog.create({
      message: error.message,
      code: errorCode,
      stack: error.stack,
      resolver,
      operation_type: operationType,
      user_id: userId,
      request_params: requestParams
    });
  } catch (logError) {
    // *************** If logging fails, log to console but don't interrupt the flow
    console.error('Failed to log error:', logError);
  }
  
  // *************** Return an ApolloError for the GraphQL response
  return new ApolloError(error.message, errorCode);
}

// *************** EXPORT MODULE ***************
module.exports = {
  LogError
};
