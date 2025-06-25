// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

// *************** VALIDATOR ***************
/**
 * Validates parameters for creating or updating a block
 *
 * @function ValidateCreateUpdateBlockParameters
 * @param {Object} params - Parameters object
 * @param {string} [params.id] - Block ID (required for update only)
 * @param {Object} params.blockInput - Block input data
 * @param {string} params.blockInput.name - Name of the block
 * @param {string} [params.blockInput.description] - Description of the block
 * @param {Array<string>} [params.blockInput.subject_ids] - Array of subject IDs
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidateCreateUpdateBlockParameters({ id, blockInput }) {
  // *************** Check if ID exists and is valid for updates only
  if (id) {
    ValidateMongoId(id);
  }
  
  // *************** Check if input is provided
  if (!blockInput) {
    throw new ApolloError('Input object must be provided', 'INVALID_INPUT');
  }
  
  // *************** Check if name is a string if provided
  if (blockInput.name && typeof blockInput.name !== 'string') {
    throw new ApolloError('Block name must be a string', 'INVALID_INPUT');
  }

  // *************** Check if description is a string if provided
  if (blockInput.description && typeof blockInput.description !== 'string') {
    throw new ApolloError('Block description must be a string', 'INVALID_INPUT');
  }

  // *************** Check if subject_ids is an array if provided
  if (blockInput.subject_ids && !Array.isArray(blockInput.subject_ids)) {
    throw new ApolloError('Subject IDs must be an array', 'INVALID_INPUT');
  }

  // *************** Validate each subject ID if provided
  if (blockInput.subject_ids && Array.isArray(blockInput.subject_ids)) {
    blockInput.subject_ids.forEach(subjectId => {
      ValidateMongoId(subjectId);
    });
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateUpdateBlockParameters,
};
