// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');

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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApolloError('Invalid ID format', 'INVALID_INPUT');
  }
}

module.exports = {
  ValidateMongoId
};
