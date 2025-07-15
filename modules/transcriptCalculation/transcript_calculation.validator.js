// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

// *************** VALIDATOR ***************

/**
 * Validates parameters for calculating student block results
 *
 * @function ValidateCalculateStudentBlockResultsParameters
 * @param {Object} params - Parameters object
 * @param {string} params.studentId - Student ID (required)
 * @param {string} params.blockId - Block ID (required)
 * @param {string} params.calculatedBy - User ID of calculator (required)
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidateCalculateStudentBlockResultsParameters({ studentId, blockId, calculatedBy }) {
  // *************** Validate student ID (required, must be valid MongoId)
  if (!studentId) {
    throw new ApolloError('Student ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(studentId);

  // *************** Validate block ID (required, must be valid MongoId)
  if (!blockId) {
    throw new ApolloError('Block ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(blockId);

  // *************** Validate calculated by (required, must be valid MongoId) (can be system-generated)
  if (!calculatedBy) {
    throw new ApolloError('Calculated by ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(calculatedBy);
}

/**
 * Validates parameters for saving calculation result
 *
 * @function ValidateSaveCalculationResultParameters
 * @param {Object} params - Parameters object
 * @param {string} params.studentId - Student ID (required)
 * @param {Object} params.blockResult - Block result object (required)
 * @param {string} params.calculatedBy - User ID of calculator (required)
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidateSaveCalculationResultParameters({ studentId, blockResult, calculatedBy }) {
  // *************** Validate student ID (required, must be valid MongoId)
  if (!studentId) {
    throw new ApolloError('Student ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(studentId);

  // *************** Validate block result (required, must be object)
  if (!blockResult || typeof blockResult !== 'object') {
    throw new ApolloError('Block result is required and must be an object', 'INVALID_INPUT');
  }

  // *************** Validate calculated by (required, must be valid MongoId) (can be system-generated)
  if (!calculatedBy) {
    throw new ApolloError('Calculated by ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(calculatedBy);
}

/**
 * Validates parameters for complete transcript calculation
 *
 * @function ValidateCalculateStudentCompleteTranscriptParameters
 * @param {Object} params - Parameters object
 * @param {string} params.studentId - Student ID (required)
 * @param {Array} [params.blockIds] - Array of block IDs (optional)
 * @param {string} params.calculatedBy - User ID of calculator (required)
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidateCalculateStudentCompleteTranscriptParameters({ studentId, blockIds, calculatedBy }) {
  // *************** Validate student ID (required, must be valid MongoId)
  if (!studentId) {
    throw new ApolloError('Student ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(studentId);

  // *************** Validate block IDs if provided
  if (blockIds) {
    if (!Array.isArray(blockIds)) {
      throw new ApolloError('Block IDs must be an array', 'INVALID_INPUT');
    }
    // *************** Validate each block ID
    blockIds.forEach((blockId) => {
      ValidateMongoId(blockId);
    });
  }

  // *************** Validate calculated by (required, must be valid MongoId)
  // *************** Note: Can be user ID or system-generated ObjectId
  if (!calculatedBy) {
    throw new ApolloError('Calculated by ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(calculatedBy);
}


// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCalculateStudentBlockResultsParameters,
  ValidateSaveCalculationResultParameters,
  ValidateCalculateStudentCompleteTranscriptParameters,
};
