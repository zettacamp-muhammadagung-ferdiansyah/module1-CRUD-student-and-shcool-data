// *************** IMPORT MODULE ***************
const UserLoader = require('../modules/user').UserLoader;
const StudentLoader = require('../modules/student').StudentLoader;
const SchoolLoader = require('../modules/school').SchoolLoader;

/**
 * Creates and initializes all DataLoader instances for the application
 * Centralizes loader instantiation to maintain consistent caching behavior
 * 
 * @returns {Object} - Object containing all initialized DataLoader instances
 */
function LoaderModule() {
  // *************** RETURN MAIN LOADERS
  return {
    UserLoader: UserLoader(),
    StudentLoader: StudentLoader(),
    SchoolLoader: SchoolLoader(),
  };
}

// *************** EXPORT MODULE ***************
module.exports = LoaderModule;
