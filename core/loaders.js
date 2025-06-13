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
  // *************** INITIALIZE STUDENT LOADER
  // *************** Store the StudentLoader instance in a variable so we can add properties to it
  // *************** This allows us to access StudentLoaders.StudentLoader() once and then extend it
  const studentLoader = StudentLoaders.StudentLoader();
  
  // *************** EXTEND STUDENT LOADER
  // *************** Attach the StudentsBySchoolLoader as a property of the StudentLoader object
  // *************** This maintains the functionality while keeping the main loader object clean
  // *************** Now it can be accessed through context.loaders.StudentLoader.bySchool
  studentLoader.bySchool = StudentLoaders.StudentsBySchoolLoader();
  
  // *************** Return main loader
  return {
    UserLoader: UserLoader(),
    StudentLoader: studentLoader,
    SchoolLoader: SchoolLoader(),
  };
}

// *************** EXPORT MODULE ***************
module.exports = LoaderModule;
