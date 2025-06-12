// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** Validation Error Codes
const ErrorCode = {
  INVALID_INPUT: 'INVALID_INPUT',       // *************** For input validation errors 
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',  // *************** For when resources aren't found
  SERVER_ERROR: 'SERVER_ERROR'          //*************** For unexpected server errors
};

/**
 * Validates if a value is a required non-empty string.
 * This function performs two checks:
 * 1. Ensures the value is of type 'string'
 * 2. Ensures the string is not empty after trimming whitespace
 * 
 * If validation fails, an ApolloError is thrown with a descriptive message
 * indicating which field failed validation and why.
 * 
 * @function IsRequiredString
 * @param {any} value - The value to validate as a required string
 * @param {string} fieldName - Name of the field being validated (used in error messages)
 * @throws {ApolloError} Throws INVALID_INPUT if the value is not a string or is empty
 * @example
 * // Will validate successfully and return "example"
 * IsRequiredString("example", "username")
 * 
 * // Will throw: ApolloError with INVALID_INPUT code
 * IsRequiredString("", "username")
 * 
 * // Will throw: ApolloError with INVALID_INPUT code
 * IsRequiredString(null, "username")
 * 
 * @returns {string} The validated and trimmed string value
 */
function IsRequiredString(value, fieldName) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new ApolloError(
      `${fieldName} is required and must be a non-empty string.`,
      ErrorCode.INVALID_INPUT,
      { field: fieldName }
    );
  }
  return value.trim();
}

/**
 * Validates if a value is a valid MongoDB ObjectId.
 * This function performs several checks:
 * 1. Ensures the ID is not undefined or null
 * 2. Validates that the ID conforms to MongoDB's ObjectId format using mongoose
 * 
 * MongoDB ObjectIds are 24-character hexadecimal strings that must meet specific
 * formatting requirements. This function uses Mongoose's built-in validation to ensure
 * that the ID would be accepted by MongoDB as a valid ObjectId.
 * 
 * If validation fails, an ApolloError is thrown with a specific error code depending
 * on which validation step failed.
 * 
 * @function IsValidObjectId
 * @param {any} id - The ID value to validate as a MongoDB ObjectId
 * @param {string} [fieldName='ID'] - Name of the ID field being validated (used in error messages)
 * @throws {ApolloError} Throws INVALID_INPUT if id is undefined, null, or not a valid MongoDB ObjectId format
 * @example
 * // Will validate successfully and return "507f1f77bcf86cd799439011"
 * IsValidObjectId("507f1f77bcf86cd799439011", "schoolId")
 * 
 * // Will throw: ApolloError with INVALID_INPUT code
 * IsValidObjectId(null, "schoolId")
 * 
 * // Will throw: ApolloError with INVALID_INPUT code
 * IsValidObjectId("invalid-id", "schoolId")
 * 
 * @returns {string} The validated ID as a string
 */
function IsValidObjectId(id, fieldName = 'ID') {
  if (id === undefined || id === null) {
    throw new ApolloError(
      `${fieldName} is required.`,
      ErrorCode.INVALID_INPUT,
      { field: fieldName }
    );
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApolloError(
      `${fieldName} is not a valid ID format.`,
      ErrorCode.INVALID_INPUT,
      { field: fieldName }
    );
  }
  
  return id.toString();
}

/**
 * Validates if a string is in a valid date format
 * 
 * @function IsValidDateString
 * @param {string} value - The string to validate as a date
 * @param {string} fieldName - Name of the field being validated (used in error messages)
 * @throws {ApolloError} Throws INVALID_INPUT if the value is not a valid date format
 * @example
 * // Will validate successfully and return "2023-06-10"
 * IsValidDateString("2023-06-10", "birth date")
 * 
 * // Will throw: ApolloError("birth date must be a valid date format.", "INVALID_INPUT", { field: "birth date" })
 * IsValidDateString("not-a-date", "birth date")
 * 
 * @returns {string} The original string if it's a valid date
 */
function IsValidDateString(value, fieldName = 'Date') {
  if (!value) return null;
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ApolloError(
      `${fieldName} must be a valid date format.`,
      ErrorCode.INVALID_INPUT,
      { field: fieldName }
    );
  }
  
  return value;
}

// *************** EXPORT MODULE ***************
module.exports = {
  IsRequiredString,
  IsValidObjectId,
  IsValidDateString,
  ErrorCode
};