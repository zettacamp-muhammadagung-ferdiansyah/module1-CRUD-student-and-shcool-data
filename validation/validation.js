/**
 * @param {string} value - String to validate
 * @returns {boolean} True if non-empty string
 */
function IsRequiredString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function IsEmailFormat(email) { 
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return emailRegex.test(email);
}

/**
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if valid date
 */
function IsValidDateFormat(date) {
  const parsedDate = Date.parse(date);
  return !isNaN(parsedDate);
}

// *************** EXPORT MODULE ***************
module.exports = {
  IsRequiredString,
  IsEmailFormat, 
  IsValidDateFormat
};