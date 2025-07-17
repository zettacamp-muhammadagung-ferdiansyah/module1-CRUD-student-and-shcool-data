// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const Mongoose = require('mongoose');

// *************** IMPORT VALIDATORS ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates a calculation result input object before creating or updating.
 * 
 * @function ValidateCalculationResultInput
 * @param {Object} input - The calculation result input to validate
 * @throws {ApolloError} If validation fails
 * @returns {void}
 */
function ValidateCalculationResultInput(input) {
  // *************** Check if input exists
  if (!input) {
    throw new ApolloError('Calculation result input is required', 'VALIDATION_ERROR');
  }

  // *************** Validate student ID
  if (input.student_id) {
    ValidateMongoId(input.student_id);
  }

  // *************** Validate school ID
  if (input.school_id) {
    ValidateMongoId(input.school_id);
  }

  // *************** Validate status
  if (input.status && !['PASS', 'FAIL', 'INCOMPLETE'].includes(input.status)) {
    throw new ApolloError('Invalid status. Must be one of: PASS, FAIL, INCOMPLETE', 'VALIDATION_ERROR');
  }

  // *************** Validate block results if provided
  if (Array.isArray(input.block_results)) {
    input.block_results.forEach((blockResult, blockIdx) => {
      if (!blockResult.block_id) {
        throw new ApolloError(`Block ID is required for block result at index ${blockIdx}`, 'VALIDATION_ERROR');
      }
      ValidateMongoId(blockResult.block_id);
      if (!blockResult.block_name) {
        throw new ApolloError(`Block name is required for block result at index ${blockIdx}`, 'VALIDATION_ERROR');
      }
      if (!blockResult.status || !['PASS', 'FAIL', 'INCOMPLETE'].includes(blockResult.status)) {
        throw new ApolloError(`Invalid status for block result at index ${blockIdx}. Must be one of: PASS, FAIL, INCOMPLETE`, 'VALIDATION_ERROR');
      }
      if (typeof blockResult.average_score !== 'number') {
        throw new ApolloError(`Average score must be a number for block result at index ${blockIdx}`, 'VALIDATION_ERROR');
      }
      // Validate subject_results
      if (Array.isArray(blockResult.subject_results)) {
        blockResult.subject_results.forEach((subjectResult, subjectIdx) => {
          if (Array.isArray(subjectResult.test_results)) {
            subjectResult.test_results.forEach((testResult, testIdx) => {
              if (typeof testResult.weighted_mark !== 'number') {
                throw new ApolloError(`weighted_mark must be a number for test result at block ${blockIdx}, subject ${subjectIdx}, test ${testIdx}`, 'VALIDATION_ERROR');
              }
            });
          }
        });
      }
    });
  }
}

/**
 * Validates parameters for triggering a calculation
 *
 * @function ValidateTriggerCalculationParameters
 * @param {Object} params - Parameters object
 * @param {string} params.studentId - Student ID (required)
 * @param {string} params.blockId - Block ID (required)
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidateTriggerCalculationParameters({ studentId, blockId }) {
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
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCalculationResultInput,
  ValidateTriggerCalculationParameters
};
