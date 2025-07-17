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
  // *************** Validate object and not empty
  if (!subjectInput || typeof subjectInput !== 'object') {
    throw new ApolloError('Subject input must be an object', 'INVALID_INPUT');
  }

  // *************** Validate block_id
  if (!subjectInput.block_id) {
    throw new ApolloError('Block ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(subjectInput.block_id);

  // *************** Validate name
  if (typeof subjectInput.name !== 'string' || subjectInput.name.trim() === '') {
    throw new ApolloError('Subject name is required and must be a non-empty string', 'INVALID_INPUT');
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
  
  // *************** Validate passing_criteria if provided
  if (subjectInput.passing_criteria) {
    ValidatePassingCriteria(subjectInput.passing_criteria);
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

  // *************** Validate object and not empty
  if (!subjectInput || typeof subjectInput !== 'object') {
    throw new ApolloError('Subject input must be an object', 'INVALID_INPUT');
  }

  // *************** Validate block_id
  if (!subjectInput.block_id) {
    throw new ApolloError('Block ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(subjectInput.block_id);

  // *************** Validate name
  if (typeof subjectInput.name !== 'string' || subjectInput.name.trim() === '') {
    throw new ApolloError('Subject name is required and must be a non-empty string', 'INVALID_INPUT');
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
  
  // *************** Validate passing_criteria if provided
  if (subjectInput.passing_criteria) {
    ValidatePassingCriteria(subjectInput.passing_criteria);
  }

  // *************** Validate updated_by (required, must be valid MongoId)
  ValidateMongoId(subjectInput.updated_by);
}

/**
 * Validates a passing criteria object
 * 
 * @function ValidatePassingCriteria
 * @param {Array} passingCriteria - Array of passing criteria objects
 * @throws {ApolloError} If any validation fails
 */
function ValidatePassingCriteria(passingCriteria) {
  if (!Array.isArray(passingCriteria)) {
    throw new ApolloError('Passing criteria must be an array', 'INVALID_INPUT');
  }
  
  passingCriteria.forEach((criteria, index) => {
    // *************** Validate expected outcome
    if (!criteria.expected_outcome || !['PASS', 'FAIL'].includes(criteria.expected_outcome)) {
      throw new ApolloError(`Invalid expected_outcome in passing criteria at index ${index}`, 'INVALID_INPUT');
    }
    
    // *************** Validate rules
    if (!Array.isArray(criteria.rules) || criteria.rules.length === 0) {
      throw new ApolloError(`Rules must be a non-empty array in passing criteria at index ${index}`, 'INVALID_INPUT');
    }
    
    criteria.rules.forEach((rule, ruleIndex) => {
      // *************** Validate rule type
      if (!rule.type || !['TEST_RESULT', 'TEST_MARK', 'SUBJECT_AVERAGE'].includes(rule.type)) {
        throw new ApolloError(`Invalid rule type in rule ${ruleIndex} of criteria ${index}`, 'INVALID_INPUT');
      }
      
      // *************** Validate logical operator (if not first rule)
      if (ruleIndex > 0 && (!rule.logical_operator || !['AND', 'OR'].includes(rule.logical_operator))) {
        throw new ApolloError(`Logical operator required for rule ${ruleIndex} of criteria ${index}`, 'INVALID_INPUT');
      }
      
      // *************** First rule should not have logical operator
      if (ruleIndex === 0 && rule.logical_operator) {
        throw new ApolloError(`First rule should not have a logical operator in criteria ${index}`, 'INVALID_INPUT');
      }
      
      // *************** Validate test_id for test-specific rules
      if (['TEST_RESULT', 'TEST_MARK'].includes(rule.type) && !rule.test_id) {
        throw new ApolloError(`Test ID required for ${rule.type} rule ${ruleIndex} of criteria ${index}`, 'INVALID_INPUT');
      }
      
      // *************** Validate test_id format if provided
      if (rule.test_id) {
        ValidateMongoId(rule.test_id);
      }
      
      // *************** Validate operator
      if (!rule.operator || !['GTE', 'GT', 'LTE', 'LT', 'EQ'].includes(rule.operator)) {
        throw new ApolloError(`Invalid operator in rule ${ruleIndex} of criteria ${index}`, 'INVALID_INPUT');
      }
      
      // *************** Validate value
      if (typeof rule.value !== 'number') {
        throw new ApolloError(`Value must be a number in rule ${ruleIndex} of criteria ${index}`, 'INVALID_INPUT');
      }
    });
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateSubjectParameters,
  ValidateUpdateSubjectParameters,
  ValidatePassingCriteria,
};
