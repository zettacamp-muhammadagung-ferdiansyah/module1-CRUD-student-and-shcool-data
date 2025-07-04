// *************** IMPORT LIBRARY ***************
const Mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');


/**
 * Validates parameters for creating a subject
 *
 * @function ValidateCreateSubjectParameters
 * @param {Object} subjectInput - Input object containing subject data
 * @throws {ApolloError} If any validation fails
 */
function ValidateCreateSubjectParameters(subjectInput) {
  // *************** Check if input is provided
  if (!subjectInput) {
    throw new ApolloError('Subject input is required', 'INVALID_INPUT');
  }

  // *************** Validate block_id
  if (!subjectInput.block_id) {
    throw new ApolloError('Block ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(subjectInput.block_id);

  // *************** Validate name
  if (typeof subjectInput.name !== 'string' || subjectInput.name === '') {
    throw new ApolloError('Subject name is required and must be a string', 'INVALID_INPUT');
  }

  // *************** Validate description if provided
  if (subjectInput.description && typeof subjectInput.description !== 'string') {
    throw new ApolloError('Description must be a string', 'INVALID_INPUT');
  }

  // *************** Validate coefficient
  if (typeof subjectInput.coefficient !== 'number' || subjectInput.coefficient < 0) {
    throw new ApolloError('Coefficient is required and must be a non-negative number', 'INVALID_INPUT');
  }

  // *************** Validate test_ids if provided
  if (subjectInput.test_ids) {
    if (!Array.isArray(subjectInput.test_ids)) {
      throw new ApolloError('Test IDs must be an array', 'INVALID_INPUT');
    }
    // *************** Validate each test ID
    subjectInput.test_ids.forEach((testId) => {
      ValidateMongoId(testId);
    });
  }

  // *************** Validate created_by
  if (!subjectInput.created_by) {
    throw new ApolloError('created_by is required', 'INVALID_INPUT');
  }
  ValidateMongoId(subjectInput.created_by);
}

/**
 * Validates parameters for updating a subject
 *
 * @function ValidateUpdateSubjectParameters
 * @param {Object} params - Parameters for validation
 * @param {string} params.id - Subject ID (required)
 * @param {Object} params.subjectInput - Input object containing subject data
 * @throws {ApolloError} If any validation fails
 */
function ValidateUpdateSubjectParameters({ id, subjectInput }) {
  // *************** Validate ID (required, must be valid MongoId)
  ValidateMongoId(id);

  // *************** Check if input is provided
  if (!subjectInput) {
    throw new ApolloError('Subject input is required', 'INVALID_INPUT');
  }

  // *************** Validate block_id
  if (!subjectInput.block_id) {
    throw new ApolloError('Block ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(subjectInput.block_id);

  // *************** Validate name
  if (typeof subjectInput.name !== 'string' || subjectInput.name === '') {
    throw new ApolloError('Subject name is required and must be a string', 'INVALID_INPUT');
  }

  // *************** Validate description if provided
  if (subjectInput.description && typeof subjectInput.description !== 'string') {
    throw new ApolloError('Description must be a string', 'INVALID_INPUT');
  }

  // *************** Validate coefficient
  if (typeof subjectInput.coefficient !== 'number' || subjectInput.coefficient < 0) {
    throw new ApolloError('Coefficient is required and must be a non-negative number', 'INVALID_INPUT');
  }

  // *************** Validate test_ids if provided
  if (subjectInput.test_ids) {
    if (!Array.isArray(subjectInput.test_ids)) {
      throw new ApolloError('Test IDs must be an array', 'INVALID_INPUT');
    }
    // *************** Validate each test ID
    subjectInput.test_ids.forEach((testId) => {
      ValidateMongoId(testId);
    });
  }

  // *************** Validate updated_by (required, must be valid MongoId)
  ValidateMongoId(subjectInput.updated_by);
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateSubjectParameters,
  ValidateUpdateSubjectParameters,
};
