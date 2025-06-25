// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for batch-loading active user data by their IDs.
 * This optimizes GraphQL resolvers by collecting individual user ID requests
 * and fetching them in a single database query to prevent N+1 query problems.
 * 
 * @returns {DataLoader} - An instance of DataLoader for fetching users by ID
 */
function UserLoader() {
  return new DataLoader(async (userIds) => {
    try {
      // *************** Fetch active users with matching IDs
      const users = await UserModel.find({
        _id: { $in: userIds },
        status: 'active'
      });

      // *************** Map results to maintain original order
      const usersById = new Map(
        users.map(user => [String(user._id), user])
      );

      // *************** Return users in the same order as requested IDs
      return userIds.map(id => usersById.get(String(id)) || null);
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/user/user.loader.js',
        parameter_input: JSON.stringify({ userIds }),
        function_name: 'UserLoader',
        error: String(error.stack),
      });

      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load users: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  UserLoader
};
