// *************** IMPORT MODULE ***************
const UserLoader = require('../modules/user/user.loader');
const StudentLoaders = require('../modules/student/student.loader');
const SchoolLoader = require('../modules/school/school.loader');

/**
 * Creates and initializes all DataLoader instances for the application
 * Centralizes loader instantiation to maintain consistent caching behavior
 * 
 * @returns {Object} - Object containing all initialized DataLoader instances
 */
function LoaderModule() {
  return {
    UserLoader: UserLoader(),
    StudentLoader: StudentLoaders.StudentLoader(),
    SchoolLoader: SchoolLoader(),
    StudentsBySchoolLoader: StudentLoaders.StudentsBySchoolLoader()
  };
}

// *************** EXPORT MODULE ***************
module.exports = LoaderModule;
