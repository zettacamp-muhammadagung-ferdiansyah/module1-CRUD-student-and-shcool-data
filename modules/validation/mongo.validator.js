// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** Regex Pattern
const OBJECT_ID_REGEX_PATTERN = /^[0-9a-fA-F]{24}$/;

/**
 * Validates if the given objectId is a valid MongoDB ObjectId.
 *
 * @function ValidateObjectId
 * @param {string} objectId - The ObjectId to be validated.
 * @param {string} [fieldName='ObjectId'] - Name of the field for error messages
 * @throws {ApolloError} If the objectId is missing, does not match the regex pattern, or is not a valid MongoDB ObjectId.
 */
function ValidateObjectId(objectId, fieldName = 'ObjectId') {
  // *************** Check if objectId is provided
  if (!objectId) {
    throw new ApolloError(`${fieldName} is required.`, 'INVALID_INPUT', { field: fieldName });
  }

  // *************** Cast param to string
  objectId = String(objectId);

  // *************** Check if objectId matches the regex pattern
  if (!OBJECT_ID_REGEX_PATTERN.test(objectId)) {
    throw new ApolloError(`${fieldName} does not match the required pattern.`, 'INVALID_INPUT', { field: fieldName });
  }

  // *************** Check if objectId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(objectId)) {
    throw new ApolloError(`Invalid ${fieldName}.`, 'INVALID_INPUT', { field: fieldName });
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateObjectId };
