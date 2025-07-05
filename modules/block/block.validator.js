// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

// *************** VALIDATOR ***************

/**
 * Validates parameters for creating a block
 *
 * @function ValidateCreateBlockParameters
 * @param {Object} blockInput - Block input data
 * @param {string} blockInput.name - Name of the block (required)
 * @param {string} [blockInput.description] - Description of the block
 * @param {Array<string>} [blockInput.subject_ids] - Array of subject IDs
 * @param {string} blockInput.created_by - User ID of creator (required)
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidateCreateBlockParameters(blockInput) {
  // *************** Check if input is provided
  if (!blockInput) {
    throw new ApolloError('Input object must be provided', 'INVALID_INPUT');
  }

  // *************** Validate name (required, must be non-empty string)
  if (typeof blockInput.name !== 'string' || blockInput.name.trim() === '') {
    throw new ApolloError('Block name is required and must be a non-empty string', 'INVALID_INPUT');
  }

  // *************** Validate description if provided
  if (blockInput.description && typeof blockInput.description !== 'string') {
    throw new ApolloError('Block description must be a string', 'INVALID_INPUT');
  }

  // *************** Validate subject_ids if provided
  if (blockInput.subject_ids) {
    if (!Array.isArray(blockInput.subject_ids)) {
      throw new ApolloError('Subject IDs must be an array', 'INVALID_INPUT');
    }
    // *************** Validate each subject ID
    blockInput.subject_ids.forEach((subjectId) => {
      ValidateMongoId(subjectId);
    });
  }

  // *************** Validate created_by (required, must be valid MongoId)
  ValidateMongoId(blockInput.created_by);
}

/**
 * Validates parameters for updating a block
 *
 * @function ValidateUpdateBlockParameters
 * @param {Object} params - Parameters object
 * @param {string} params.id - Block ID (required)
 * @param {Object} params.blockInput - Block input data
 * @param {string} params.blockInput.name - Name of the block (required)
 * @param {string} [params.blockInput.description] - Description of the block
 * @param {Array<string>} [params.blockInput.subject_ids] - Array of subject IDs
 * @param {string} params.blockInput.updated_by - User ID of updater (required)
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidateUpdateBlockParameters({ id, blockInput }) {
  // *************** Validate ID (required, must be valid MongoId)
  ValidateMongoId(id);

  // *************** Check if input is provided
  if (!blockInput) {
    throw new ApolloError('Input object must be provided', 'INVALID_INPUT');
  }

  // *************** Validate name (required, must be non-empty string)
  if (typeof blockInput.name !== 'string' || blockInput.name.trim() === '') {
    throw new ApolloError('Block name is required and must be a non-empty string', 'INVALID_INPUT');
  }

  // *************** Validate description if provided
  if (blockInput.description && typeof blockInput.description !== 'string') {
    throw new ApolloError('Block description must be a string', 'INVALID_INPUT');
  }

  // *************** Validate subject_ids if provided
  if (blockInput.subject_ids) {
    if (!Array.isArray(blockInput.subject_ids)) {
      throw new ApolloError('Subject IDs must be an array', 'INVALID_INPUT');
    }
    // *************** Validate each subject ID
    blockInput.subject_ids.forEach((subjectId) => {
      ValidateMongoId(subjectId);
    });
  }

  // *************** Validate updated_by (required, must be valid MongoId)
  ValidateMongoId(blockInput.updated_by);
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateBlockParameters,
  ValidateUpdateBlockParameters,
};
