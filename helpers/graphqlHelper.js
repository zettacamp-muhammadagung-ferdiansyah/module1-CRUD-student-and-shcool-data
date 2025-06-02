// *************** IMPORT CORE ***************
// No core modules required for this helper

// *************** IMPORT LIBRARY ***************
// No third-party libraries required for this helper

// *************** HELPER FUNCTIONS ***************

/**
 * Handles async resolver errors and returns a consistent error message
 * @param {Function} fn - The async resolver function
 * @returns {Function} - Wrapped resolver
 */
function handleResolverError(fn) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      // Log error here if needed
      throw new Error(error.message || 'Internal server error');
    }
  };
}

module.exports = {
  handleResolverError,
};
