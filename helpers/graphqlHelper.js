// *************** IMPORT CORE ***************
// Essential core module imports or dependencies needed for the module's operation.

// *************** IMPORT LIBRARY ***************
// Third-party libraries or packages used in this module.

// *************** HELPER FUNCTIONS ***************
// Helper functions separated from the main logic for reuse and clarity.

/**
 * Handles asynchronous resolver execution and error handling
 * Ensures consistent error response format across GraphQL resolvers
 * @param {Function} fn - The async resolver function to be wrapped
 * @returns {Function} - A wrapped resolver that handles errors consistently
 * @throws {Error} - Returns original error message or default internal server error
 */
function HandleResolverError(fn) {
  // *************** START: Error handler wrapper function ***************
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      // Capture and transform error to appropriate GraphQL error format
      throw new Error(error.message || 'Internal server error');
    }
  };
  // *************** END: Error handler wrapper function ***************
}

// *************** EXPORT MODULE ***************
// Final exports for the module's functionality.
module.exports = {
  HandleResolverError,
};
