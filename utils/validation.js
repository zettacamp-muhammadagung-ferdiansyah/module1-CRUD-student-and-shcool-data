// *************** IMPORT CORE ***************
// No core modules required for this utility

// *************** IMPORT LIBRARY ***************
// No third-party libraries required for this utility

// *************** VALIDATION FUNCTIONS ***************

/**
 * Validates if a value is a non-empty string
 * @param {string} value - The value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a value is a valid email
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidEmail(email) {
  // Simple regex for demonstration
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/**
 * Validates if a value is a valid date
 * @param {string|Date} date - The date to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidDate(date) {
  return !isNaN(Date.parse(date));
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isValidDate,
};
