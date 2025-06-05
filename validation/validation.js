// *************** VALIDATOR FUNCTIONS ***************
/**
 * Collection of validation functions for data integrity
 * @module Validation
 */

/**
 * Validates if a value is a non-empty string
 * @function IsNonEmptyString
 * @param {string} value - The string value to validate
 * @returns {boolean} True if the value is a non-empty string, false otherwise
 * @example
 * IsNonEmptyString("test") // returns true
 * IsNonEmptyString("") // returns false
 * IsNonEmptyString(null) // returns false
 */
function IsNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a string is a valid email address
 * @function IsValidEmail
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email format is valid, if email is missing any required parts, contains spaces, 
 *                    or doesn't match standard email format
 * @example
 * IsValidEmail("test@example.com") // returns true
 * IsValidEmail("invalid.email") // returns false
 */
function IsValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/**
 * Validates if a value can be converted to a valid Date object
 * @function IsValidDate
 * @param {string|Date} date - The date value to validate, can be a Date object or a date string
 * @returns {boolean} True if the value represents a valid date, false if The value is null or undefined
 *                   
 * @example
 * IsValidDate("2025-06-04") // returns true
 * IsValidDate("invalid date") // returns false
 * IsValidDate(new Date()) // returns true
 */
function IsValidDate(date) {
  return !isNaN(Date.parse(date));
}

// *************** EXPORT MODULE ***************
module.exports = {
  IsNonEmptyString,
  IsValidEmail,
  IsValidDate,
};