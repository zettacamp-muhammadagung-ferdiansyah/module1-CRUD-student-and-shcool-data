// *************** VALIDATOR FUNCTIONS ***************
// Validation functions for data integrity and consistency.

/**
 * Validates if a value is a non-empty string
 * @param {string} value - The value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function IsNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a value is a valid email
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function IsValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/**
 * Validates if a value is a valid date
 * @param {string|Date} date - The date to validate
 * @returns {boolean} - True if valid, false otherwise
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