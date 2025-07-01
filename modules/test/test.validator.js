// *************** IMPORT LIBRARY ***************
const Mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates parameters for creating or updating a test
 *
 * @function ValidateCreateUpdateTestParameters
 * @param {Object} params - Parameters for validation
 * @param {string} [params.id] - Test ID (required for update, not for create)
 * @param {Object} params.testInput - Input object containing test data
 * @throws {ApolloError} If any validation fails
 */
function ValidateCreateUpdateTestParameters({ id, testInput }) {
  // *************** Validate ID if provided (required for update)
  if (id) {
    ValidateMongoId(id);
  }

  // *************** Validate required fields
  if (!testInput) {
    throw new ApolloError('Test input is required', 'INVALID_INPUT');
  }

  // *************** Validate subject_id
  if (!testInput.subject_id) {
    throw new ApolloError('Subject ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(testInput.subject_id);

  // *************** Validate name
  if (!testInput.name) {
    throw new ApolloError('Test name is required', 'INVALID_INPUT');
  }
  if (typeof testInput.name !== 'string') {
    throw new ApolloError('Test name must be a string', 'INVALID_INPUT');
  }

  // *************** Validate description if provided
  if (testInput.description && typeof testInput.description !== 'string') {
    throw new ApolloError('Description must be a string', 'INVALID_INPUT');
  }

  // *************** Validate weight
  if (testInput.weight === undefined || testInput.weight === null) {
    throw new ApolloError('Weight is required', 'INVALID_INPUT');
  }
  if (typeof testInput.weight !== 'number') {
    throw new ApolloError('Weight must be a number', 'INVALID_INPUT');
  }
  if (testInput.weight < 0) {
    throw new ApolloError('Weight cannot be negative', 'INVALID_INPUT');
  }

  // *************** Validate notations
  if (!testInput.notations) {
    throw new ApolloError('Notations are required', 'INVALID_INPUT');
  }
  if (!Array.isArray(testInput.notations)) {
    throw new ApolloError('Notations must be an array', 'INVALID_INPUT');
  }
  if (testInput.notations.length === 0) {
    throw new ApolloError('At least one notation is required', 'INVALID_INPUT');
  }

  // *************** Validate each notation
  testInput.notations.forEach((notation, index) => {
    if (!notation.notation_text) {
      throw new ApolloError(`Notation text is required for notation at index ${index}`, 'INVALID_INPUT');
    }
    if (typeof notation.notation_text !== 'string') {
      throw new ApolloError(`Notation text must be a string for notation at index ${index}`, 'INVALID_INPUT');
    }
    
    if (notation.max_points === undefined || notation.max_points === null) {
      throw new ApolloError(`Max points is required for notation at index ${index}`, 'INVALID_INPUT');
    }
    if (typeof notation.max_points !== 'number') {
      throw new ApolloError(`Max points must be a number for notation at index ${index}`, 'INVALID_INPUT');
    }
    if (notation.max_points < 0) {
      throw new ApolloError(`Max points cannot be negative for notation at index ${index}`, 'INVALID_INPUT');
    }
  });
}

/**
 * Validates pagination parameters
 *
 * @function ValidatePaginationParameters
 * @param {Object} params - Parameters object
 * @param {number} params.page - Page number (0-based, where 0 is the first page)
 * @param {number} params.limit - Number of items per page
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidatePaginationParameters({ page, limit }) {
  // *************** Check if page is a number
  if (typeof page !== 'number') {
    throw new ApolloError('Page must be a number', 'INVALID_PAGINATION');
  }
  // *************** Check if limit is a number
  if (typeof limit !== 'number') {
    throw new ApolloError('Limit must be a number', 'INVALID_PAGINATION');
  }
}

/**
 * Validates that the total weight of all tests for a subject doesn't exceed 1
 *
 * @async
 * @function ValidateTestWeight
 * @param {Object} params - Parameters object
 * @param {string} params.subject_id - ID of the subject
 * @param {number} params.weight - Weight of the test being added or updated
 * @param {string} [params.test_id] - ID of the test being updated (to exclude from calculation)
 * @param {Object} params.TestModel - Mongoose model for tests
 * @throws {ApolloError} Throws error if the total weight would exceed 1
 */
async function ValidateTestWeight({ subject_id, weight, test_id, TestModel }) {
  // *************** Build query to get existing tests
  const query = {
    subject_id,
    test_status: 'active'
  };
  
  // *************** If test_id is provided (for updates), exclude it from the query
  if (test_id) {
    query._id = { $ne: test_id };
  }
  
  // *************** Get existing tests for this subject
  const existingTests = await TestModel.find(query).lean();
  
  // *************** Calculate sum of weights for existing tests
  const existingWeightSum = existingTests.reduce((sum, test) => sum + test.weight, 0);
  
  // *************** Check if adding/updating the test would exceed weight limit
  if (existingWeightSum + weight > 1) {
    throw new ApolloError(
      `Total weight for all tests in this subject would exceed 1. ` +
      `Current total${test_id ? ' (excluding this test)' : ''}: ${existingWeightSum}, ` +
      `${test_id ? 'Updated' : 'New'} test weight: ${weight}, ` +
      `Maximum allowed: 1`, 
      'VALIDATION_ERROR'
    );
  }
}

/**
 * Validates input for publishing a test (assigning a corrector)
 *
 * @function ValidatePublishTestInput
 * @param {Object} input - The input object for PublishTest
 * @throws {ApolloError} If any validation fails
 */
function ValidatePublishTestInput(input) {
  if (!input) {
    throw new ApolloError('PublishTest input is required', 'INVALID_INPUT');
  }
  if (!input.user_id) {
    throw new ApolloError('User ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(input.user_id);

  if (!input.title || typeof input.title !== 'string') {
    throw new ApolloError('Title is required and must be a string', 'INVALID_INPUT');
  }
  if (input.description && typeof input.description !== 'string') {
    throw new ApolloError('Description must be a string', 'INVALID_INPUT');
  }
  if (input.due_date && isNaN(Date.parse(input.due_date))) {
    throw new ApolloError('Due date must be a valid date', 'INVALID_INPUT');
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateUpdateTestParameters,
  ValidatePaginationParameters,
  ValidateTestWeight,
  ValidatePublishTestInput
};
