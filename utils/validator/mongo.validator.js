// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const Mongoose = require('mongoose');

/**
 * *************** Validates if the provided ID is a valid MongoDB ObjectId
 * @function ValidateMongoId
 * @param {string} id - The ID to validate
 */
function ValidateMongoId(id) {
  // *************** Check if ID exists
  if (!id) {
    throw new ApolloError('ID is required', 'INVALID_INPUT');
  }
  // *************** Check if ID is a valid MongoDB ObjectId
  if (!Mongoose.Types.ObjectId.isValid(id)) {
    throw new ApolloError('Invalid ID format', 'INVALID_INPUT');
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateMongoId
};
