// *************** IMPORT LIBRARY ***************
const Mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates parameters for creating a test
 *
 * @function ValidateCreateTestParameters
 * @param {Object} testInput - Input object containing test data
 * @throws {ApolloError} If any validation fails
 */
function ValidateCreateTestParameters(testInput) {
  // *************** Validate object and not empty
  if (!testInput || typeof testInput !== 'object') {
    throw new ApolloError('Test input must be an object', 'INVALID_INPUT');
  }

  // *************** Validate subject_id
  if (!testInput.subject_id) {
    throw new ApolloError('Subject ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(testInput.subject_id);

  // *************** Validate name
  if (typeof testInput.name !== 'string' || testInput.name.trim() === '') {
    throw new ApolloError('Test name is required and must be a non-empty string', 'INVALID_INPUT');
  }

  // *************** Validate description if provided
  if (testInput.description && typeof testInput.description !== 'string') {
    throw new ApolloError('Description must be a string', 'INVALID_INPUT');
  }

  // *************** Validate weight
  if (typeof testInput.weight !== 'number' || testInput.weight < 0) {
    throw new ApolloError('Weight is required and must be a non-negative number', 'INVALID_INPUT');
  }

  // *************** Validate notations
  if (!testInput.notations || !Array.isArray(testInput.notations) || testInput.notations.length === 0) {
    throw new ApolloError('Notations are required and must be a non-empty array', 'INVALID_INPUT');
  }

  // *************** Validate each notation
  testInput.notations.forEach((notation, index) => {
    if (!notation.notation_text || typeof notation.notation_text !== 'string') {
      throw new ApolloError(`Notation text is required and must be a string for notation at index ${index}`, 'INVALID_INPUT');
    }
    if (typeof notation.max_marks !== 'number' || notation.max_marks < 0) {
      throw new ApolloError(`Max marks is required and must be a non-negative number for notation at index ${index}`, 'INVALID_INPUT');
    }
  });
  
  // *************** Validate passing criteria if provided
  if (testInput.passing_criteria && Array.isArray(testInput.passing_criteria)) {
    testInput.passing_criteria.forEach((criteria, criteriaIndex) => {
      // *************** Validate expected outcome
      if (!criteria.expected_outcome || !['PASS', 'FAIL'].includes(criteria.expected_outcome)) {
        throw new ApolloError(`Expected outcome must be either PASS or FAIL for criteria at index ${criteriaIndex}`, 'INVALID_INPUT');
      }
      
      // *************** Validate rules
      if (!criteria.rules || !Array.isArray(criteria.rules) || criteria.rules.length === 0) {
        throw new ApolloError(`Rules are required and must be a non-empty array for criteria at index ${criteriaIndex}`, 'INVALID_INPUT');
      }
      
      criteria.rules.forEach((rule, ruleIndex) => {
        // *************** Validate rule type
        if (!rule.type || !['NOTATION_SCORE', 'TOTAL_SCORE'].includes(rule.type)) {
          throw new ApolloError(`Rule type must be either NOTATION_SCORE or TOTAL_SCORE for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        // *************** First rule should not have logical operator
        if (ruleIndex === 0 && rule.logical_operator) {
          throw new ApolloError(`First rule should not have a logical operator in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        // *************** Validate logical operator if not first rule
        if (ruleIndex > 0 && !rule.logical_operator) {
          throw new ApolloError(`Logical operator is required for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        if (ruleIndex > 0 && rule.logical_operator && !['AND', 'OR'].includes(rule.logical_operator)) {
          throw new ApolloError(`Logical operator must be either AND or OR for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        // *************** Validate notation_index for NOTATION_SCORE rules
        if (rule.type === 'NOTATION_SCORE') {
          if (typeof rule.notation_index !== 'number' || rule.notation_index < 0 || rule.notation_index >= testInput.notations.length) {
            throw new ApolloError(`Invalid notation_index for rule at index ${ruleIndex} in criteria ${criteriaIndex}. Must be between 0 and ${testInput.notations.length - 1}`, 'INVALID_INPUT');
          }
        }
        
        // *************** Validate operator
        if (!rule.operator || !['GTE', 'GT', 'LTE', 'LT', 'EQ'].includes(rule.operator)) {
          throw new ApolloError(`Operator must be one of GTE, GT, LTE, LT, EQ for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        // *************** Validate value
        if (typeof rule.value !== 'number') {
          throw new ApolloError(`Value must be a number for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
      });
    });
  }

  // *************** Validate created_by (required, must be valid MongoId)
  ValidateMongoId(testInput.created_by);
}

/**
 * Validates parameters for updating a test
 *
 * @function ValidateUpdateTestParameters
 * @param {Object} params - Parameters for validation
 * @param {string} params.id - Test ID (required)
 * @param {Object} params.testInput - Input object containing test data
 * @throws {ApolloError} If any validation fails
 */
function ValidateUpdateTestParameters({ id, testInput }) {
  // *************** Validate ID (required, must be valid MongoId)
  ValidateMongoId(id);

  // *************** Validate object and not empty
  if (!testInput || typeof testInput !== 'object') {
    throw new ApolloError('Test input must be an object', 'INVALID_INPUT');
  }

  // *************** Validate subject_id
  if (!testInput.subject_id) {
    throw new ApolloError('Subject ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(testInput.subject_id);

  // *************** Validate name
  if (typeof testInput.name !== 'string' || testInput.name.trim() === '') {
    throw new ApolloError('Test name is required and must be a non-empty string', 'INVALID_INPUT');
  }

  // *************** Validate description if provided
  if (testInput.description && typeof testInput.description !== 'string') {
    throw new ApolloError('Description must be a string', 'INVALID_INPUT');
  }

  // *************** Validate weight
  if (typeof testInput.weight !== 'number' || testInput.weight < 0) {
    throw new ApolloError('Weight is required and must be a non-negative number', 'INVALID_INPUT');
  }

  // *************** Validate notations
  if (!testInput.notations || !Array.isArray(testInput.notations) || testInput.notations.length === 0) {
    throw new ApolloError('Notations are required and must be a non-empty array', 'INVALID_INPUT');
  }

  // *************** Validate each notation
  testInput.notations.forEach((notation, index) => {
    if (!notation.notation_text || typeof notation.notation_text !== 'string') {
      throw new ApolloError(`Notation text is required and must be a string for notation at index ${index}`, 'INVALID_INPUT');
    }
    if (typeof notation.max_marks !== 'number' || notation.max_marks < 0) {
      throw new ApolloError(`Max marks is required and must be a non-negative number for notation at index ${index}`, 'INVALID_INPUT');
    }
  });
  
  // *************** Validate passing criteria if provided
  if (testInput.passing_criteria && Array.isArray(testInput.passing_criteria)) {
    testInput.passing_criteria.forEach((criteria, criteriaIndex) => {
      // *************** Validate expected outcome
      if (!criteria.expected_outcome || !['PASS', 'FAIL'].includes(criteria.expected_outcome)) {
        throw new ApolloError(`Expected outcome must be either PASS or FAIL for criteria at index ${criteriaIndex}`, 'INVALID_INPUT');
      }
      
      // *************** Validate rules
      if (!criteria.rules || !Array.isArray(criteria.rules) || criteria.rules.length === 0) {
        throw new ApolloError(`Rules are required and must be a non-empty array for criteria at index ${criteriaIndex}`, 'INVALID_INPUT');
      }
      
      criteria.rules.forEach((rule, ruleIndex) => {
        // *************** Validate rule type
        if (!rule.type || !['NOTATION_SCORE', 'TOTAL_SCORE'].includes(rule.type)) {
          throw new ApolloError(`Rule type must be either NOTATION_SCORE or TOTAL_SCORE for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        // *************** First rule should not have logical operator
        if (ruleIndex === 0 && rule.logical_operator) {
          throw new ApolloError(`First rule should not have a logical operator in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        // *************** Validate logical operator if not first rule
        if (ruleIndex > 0 && !rule.logical_operator) {
          throw new ApolloError(`Logical operator is required for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        if (ruleIndex > 0 && rule.logical_operator && !['AND', 'OR'].includes(rule.logical_operator)) {
          throw new ApolloError(`Logical operator must be either AND or OR for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        // *************** Validate notation_index for NOTATION_SCORE rules
        if (rule.type === 'NOTATION_SCORE') {
          if (typeof rule.notation_index !== 'number' || rule.notation_index < 0 || rule.notation_index >= testInput.notations.length) {
            throw new ApolloError(`Invalid notation_index for rule at index ${ruleIndex} in criteria ${criteriaIndex}. Must be between 0 and ${testInput.notations.length - 1}`, 'INVALID_INPUT');
          }
        }
        
        // *************** Validate operator
        if (!rule.operator || !['GTE', 'GT', 'LTE', 'LT', 'EQ'].includes(rule.operator)) {
          throw new ApolloError(`Operator must be one of GTE, GT, LTE, LT, EQ for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
        
        // *************** Validate value
        if (typeof rule.value !== 'number') {
          throw new ApolloError(`Value must be a number for rule at index ${ruleIndex} in criteria ${criteriaIndex}`, 'INVALID_INPUT');
        }
      });
    });
  }

  // *************** Validate updated_by (required, must be valid MongoId)
  ValidateMongoId(testInput.updated_by);
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
    test_status: 'active',
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
 * @param {Object} params - The input object for PublishTest
 * @param {string} params.id - The test ID to publish
 * @param {Object} params.input - The input payload
 * @throws {ApolloError} If any validation fails
 */
function ValidatePublishTestInput({ id, input }) {
  // ***************  Validate ID
  ValidateMongoId(id);

  // *************** Validate input
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
  ValidateCreateTestParameters,
  ValidateUpdateTestParameters,
  ValidateTestWeight,
  ValidatePublishTestInput,
};
