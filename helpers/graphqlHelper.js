// *************** IMPORT CORE ***************

// *************** IMPORT LIBRARY ***************

// *************** HELPER FUNCTIONS ***************
/**
 * Handles asynchronous resolver execution and error handling
 * Ensures consistent error response format across GraphQL resolvers
 * @param {Function} fn - The async resolver function to be wrapped
 * @returns {Function} - A wrapped resolver that handles errors consistently
 * @throws {Error} - Returns original error message or default internal server error
 */
function HandleResolverError(fn) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      throw new Error(error.message || 'Internal server error');
    }
  };
}

// *************** EXPORT MODULE ***************
module.exports = {
  HandleResolverError,
};
