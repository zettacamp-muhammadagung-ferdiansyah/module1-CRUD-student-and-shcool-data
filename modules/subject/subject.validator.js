// *************** IMPORT LIBRARY ***************
const Mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates parameters for creating or updating a subject
 *
 * @function ValidateCreateUpdateSubjectParameters
 * @param {Object} params - Parameters for validation
 * @param {string} [params.id] - Subject ID (required for update, not for create)
 * @param {Object} params.subjectInput - Input object containing subject data
 * @throws {ApolloError} If any validation fails
 */
function ValidateCreateUpdateSubjectParameters({ id, subjectInput }) {
  // *************** Validate ID if provided (required for update)
  if (id) {
    ValidateMongoId(id);
  }

  // *************** Validate required fields
  if (!subjectInput) {
    throw new ApolloError('Subject input is required', 'INVALID_INPUT');
  }

  // *************** Validate block_id
  if (!subjectInput.block_id) {
    throw new ApolloError('Block ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(subjectInput.block_id);

  // *************** Validate name
  if (!subjectInput.name) {
    throw new ApolloError('Subject name is required', 'INVALID_INPUT');
  }
  if (typeof subjectInput.name !== 'string') {
    throw new ApolloError('Subject name must be a string', 'INVALID_INPUT');
  }

  // *************** Validate description if provided
  if (subjectInput.description && typeof subjectInput.description !== 'string') {
    throw new ApolloError('Description must be a string', 'INVALID_INPUT');
  }

  // *************** Validate coefficient
  if (subjectInput.coefficient === undefined || subjectInput.coefficient === null) {
    throw new ApolloError('Coefficient is required', 'INVALID_INPUT');
  }
  if (typeof subjectInput.coefficient !== 'number') {
    throw new ApolloError('Coefficient must be a number', 'INVALID_INPUT');
  }
  if (subjectInput.coefficient < 0) {
    throw new ApolloError('Coefficient cannot be negative', 'INVALID_INPUT');
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

  // *************** Validate updated_by
  if (!subjectInput.updated_by) {
    throw new ApolloError('updated_by is required', 'INVALID_INPUT');
  }
  ValidateMongoId(subjectInput.updated_by);
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateUpdateSubjectParameters,
};
