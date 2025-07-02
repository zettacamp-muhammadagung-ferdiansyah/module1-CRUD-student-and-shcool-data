// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * *************** Validates pagination parameters for all modules
 * @function ValidatePaginationParameters
 * @param {Object} params - Parameters object
 * @param {number} params.page - Page number (0-based, where 0 is the first page)
 * @param {number} params.limit - Number of items per page
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidatePaginationParameters({ page, limit }) {
  // *************** Check if page is a number and not NaN
  if (typeof page !== 'number' || isNaN(page)) {
    throw new ApolloError('Page must be a number', 'INVALID_PAGINATION');
  }
  // *************** Check if limit is a number and not NaN
  if (typeof limit !== 'number' || isNaN(limit)) {
    throw new ApolloError('Limit must be a number', 'INVALID_PAGINATION');
  }
  // *************** Check if page is negative
  if (page < 0) {
    throw new ApolloError('Page cannot be negative', 'INVALID_PAGINATION');
  }
  // *************** Check if limit is less than or equal to zero
  if (limit <= 0) {
    throw new ApolloError('Limit must be greater than zero', 'INVALID_PAGINATION');
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidatePaginationParameters
};
