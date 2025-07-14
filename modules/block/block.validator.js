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
  }  // *************** Validate passing_criteria if provided
  if (blockInput.passing_criteria) {
    ValidatePassingCriteria(blockInput.passing_criteria, true); // true = creation mode (lenient)
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

  // *************** Validate passing_criteria if provided
  if (blockInput.passing_criteria) {
    if (!Array.isArray(blockInput.passing_criteria)) {
      throw new ApolloError('Passing criteria must be an array', 'INVALID_INPUT');
    }

    // *************** Validate each passing criteria
    blockInput.passing_criteria.forEach((criteria) => {
      // *************** Validate expected_outcome
      if (!criteria.expected_outcome || !['PASS', 'FAIL'].includes(criteria.expected_outcome)) {
        throw new ApolloError('Expected outcome must be either PASS or FAIL', 'INVALID_INPUT');
      }

      // *************** Validate rules
      if (!Array.isArray(criteria.rules) || criteria.rules.length === 0) {
        throw new ApolloError('Each passing criteria must have at least one rule', 'INVALID_INPUT');
      }

      // *************** Validate each rule
      criteria.rules.forEach((rule, index) => {
        // *************** First rule shouldn't have logical operator
        if (index === 0 && rule.logical_operator) {
          throw new ApolloError('First rule should not have a logical operator', 'INVALID_INPUT');
        }

        // *************** Subsequent rules must have logical operator
        if (index > 0 && (!rule.logical_operator || !['AND', 'OR'].includes(rule.logical_operator))) {
          throw new ApolloError('Subsequent rules must have a logical operator (AND/OR)', 'INVALID_INPUT');
        }

        // Validate rule type
        if (!rule.type || !['SUBJECT_RESULT', 'SUBJECT_MARK', 'BLOCK_AVERAGE'].includes(rule.type)) {
          throw new ApolloError('Rule type must be SUBJECT_RESULT, SUBJECT_MARK, or BLOCK_AVERAGE', 'INVALID_INPUT');
        }

        // *************** Validate subject_id for subject-specific rules
        if ((rule.type === 'SUBJECT_RESULT' || rule.type === 'SUBJECT_MARK')) {
          if (rule.subject_id && rule.subject_id !== "") {
            ValidateMongoId(rule.subject_id);
          }
        
        }

        // *************** Validate operator and value
        if (!rule.operator || !['GTE', 'GT', 'LTE', 'LT', 'EQ'].includes(rule.operator)) {
          throw new ApolloError('Rule operator must be GTE, GT, LTE, LT, or EQ', 'INVALID_INPUT');
        }

        if (typeof rule.value !== 'number') {
          throw new ApolloError('Rule value must be a number', 'INVALID_INPUT');
        }
      });
    });
  }

  // *************** Validate updated_by (required, must be valid MongoId)
  ValidateMongoId(blockInput.updated_by);
}

/**
 * Validates the structure of passing criteria
 * 
 * @function ValidatePassingCriteria
 * @param {Array} passingCriteria - Array of passing criteria objects
 * @param {boolean} isCreate - Whether this is for block creation (more lenient) or update (stricter)
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidatePassingCriteria(passingCriteria, isCreate = false) {
  if (!Array.isArray(passingCriteria)) {
    throw new ApolloError('Passing criteria must be an array', 'INVALID_INPUT');
  }
  
  // *************** Validate each passing criteria
  passingCriteria.forEach((criteria) => {
    // *************** Validate expected_outcome
    if (!criteria.expected_outcome || !['PASS', 'FAIL'].includes(criteria.expected_outcome)) {
      throw new ApolloError('Expected outcome must be either PASS or FAIL', 'INVALID_INPUT');
    }
    
    // *************** Validate rules
    if (!Array.isArray(criteria.rules) || criteria.rules.length === 0) {
      throw new ApolloError('Each passing criteria must have at least one rule', 'INVALID_INPUT');
    }
    
    // *************** Validate each rule
    criteria.rules.forEach((rule, index) => {
      // *************** First rule shouldn't have logical operator
      if (index === 0 && rule.logical_operator) {
        throw new ApolloError('First rule should not have a logical operator', 'INVALID_INPUT');
      }
      
      // *************** Subsequent rules must have logical operator
      if (index > 0 && (!rule.logical_operator || !['AND', 'OR'].includes(rule.logical_operator))) {
        throw new ApolloError('Subsequent rules must have a logical operator (AND/OR)', 'INVALID_INPUT');
      }
      
      // *************** Validate rule type
      if (!rule.type || !['SUBJECT_RESULT', 'SUBJECT_MARK', 'BLOCK_AVERAGE'].includes(rule.type)) {
        throw new ApolloError('Rule type must be SUBJECT_RESULT, SUBJECT_MARK, or BLOCK_AVERAGE', 'INVALID_INPUT');
      }
      
      // *************** Validate subject_id for subject-specific rules
      if ((rule.type === 'SUBJECT_RESULT' || rule.type === 'SUBJECT_MARK')) {
        if (rule.subject_id && rule.subject_id !== "") {
          ValidateMongoId(rule.subject_id);
        } else if (!isCreate && rule.subject_id === "") {
          throw new ApolloError('Subject ID cannot be empty for subject-specific rules', 'INVALID_INPUT');
        }
      }
      
      // *************** Validate operator and value
      if (!rule.operator || !['GTE', 'GT', 'LTE', 'LT', 'EQ'].includes(rule.operator)) {
        throw new ApolloError('Rule operator must be GTE, GT, LTE, LT, or EQ', 'INVALID_INPUT');
      }
      
      if (typeof rule.value !== 'number') {
        throw new ApolloError('Rule value must be a number', 'INVALID_INPUT');
      }
    });
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateBlockParameters,
  ValidateUpdateBlockParameters,
  ValidatePassingCriteria,
};
