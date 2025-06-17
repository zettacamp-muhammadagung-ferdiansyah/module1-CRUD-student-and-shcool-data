// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const Mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.model');
const StudentModel = require('../student/student.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

// *************** IMPORT VALIDATOR ***************
const SchoolValidators = require('./school.validator');

// *************** QUERY ***************
/**
 * Retrieves all active schools from the database. Filters out any schools
 * that have been marked as deleted by checking their status field.
 *
 * @async
 * @function GetAllSchools
 * @throws {ApolloError} Throws ApolloError if an error occurs during retrieval
 * @returns {Promise<Array>} Array of active school objects
 */
async function GetAllSchools() {
  try {
    // *************** Retrieve Schools with active status directly
    const schools = await SchoolModel.find({ status: 'active' });
    return schools;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({}),
      function_name: 'GetAllSchools',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a single active school by ID. Validates ID format and existence
 * before fetching the school data. Only returns schools with 'active' status.
 *
 * @async
 * @function GetSchoolById
 * @param {object} parent - The parent object (unused in this function)
 * @param {string} args.id - MongoDB ObjectId of the school to retrieve
 * @throws {ApolloError} Throws 'INVALID_INPUT' if ID is not provided or has invalid format
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if school with given ID doesn't exist or is not active
 * @throws {ApolloError} Throws 'DATABASE_ERROR' if a database error occurs
 * @returns {Promise<object>} The school object with matching ID and active status
 */
async function GetSchoolById(parent, { id }) {
  try {
    // *************** Validate Input
    SchoolValidators.ValidateGetSchoolByIdParameters({ id });

    // *************** Retrieve School using status instead of deleted_at
    const school = await SchoolModel.findOne({ _id: id, status: 'active' }); 
    if (!school) {
      throw new ApolloError('School not found', 'RESOURCE_NOT_FOUND');
    }
    return school;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetSchoolById',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new school
 *
 * @async
 * @function CreateSchool
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args.school_input - Input object containing school data
 * @param {string} args.school_input.name - Name of the school (required)
 * @param {string} [args.school_input.address] - Address of the school (optional)
 * @throws {ApolloError} Throws ApolloError if validation fails or creation error occurs
 * @returns {Promise<object>} The created school object
 */
async function CreateSchool(parent, { school_input }) {
  try {
    // *************** Validate Input
    SchoolValidators.ValidateCreateSchoolParameters({ schoolInput: school_input });

    // *************** Create School
    const school = await SchoolModel.create(school_input);
    return school;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify(school_input),
      function_name: 'CreateSchool',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing school
 *
 * @async
 * @function UpdateSchool
 * @param {object} parent - The parent object (unused in this function)
 * @param {string} args.id - School ID to update
 * @param {object} args.school_input - Input object containing updated school data
 * @param {string} [args.school_input.name] - Updated school name
 * @param {string} [args.school_input.address] - Updated school address
 * @throws {ApolloError} Throws ApolloError if validation fails or update error occurs
 * @returns {Promise<object|null>} The updated school object or null if not found
 */
async function UpdateSchool(parent, { id, school_input }) {
  try {
    // *************** Validate Input
    SchoolValidators.ValidateUpdateSchoolParameters({ id, schoolInput: school_input });

    // *************** Update School
    const school = await SchoolModel.findByIdAndUpdate(id, school_input);
    if (!school) {
      throw new ApolloError('School not found', 'RESOURCE_NOT_FOUND');
    } 
    
    return school;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id, school_input }),
      function_name: 'UpdateSchool',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a school by setting status to 'deleted' and updating deleted_at timestamp
 *
 * @async
 * @function DeleteSchool
 * @param {object} parent - The parent object (unused in this function)
 * @param {string} args.id - School ID to delete
 * @throws {ApolloError} Throws 'INVALID_INPUT' if ID is not provided or has invalid format
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if school with given ID doesn't exist
 * @throws {ApolloError} Throws 'DATABASE_ERROR' if a database error occurs
 * @returns {Promise<object>} The deleted school object
 */
async function DeleteSchool(parent, { id }) {
  try {
    // *************** Validate Input
    SchoolValidators.ValidateDeleteSchoolParameters({ id });

    // *************** Set status to deleted AND update deleted_at timestamp
    const school = await SchoolModel.findByIdAndUpdate(
      id,
      { 
        status: 'deleted',
        deleted_at: new Date().toISOString() 
      }
    );
    if (!school) {
      throw new ApolloError('School not found', 'RESOURCE_NOT_FOUND');
    }
    
    return school;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'DeleteSchool',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** LOADER *************** 
/**
 * Retrieves students associated with a specific school using DataLoader.
 *
 * @async
 * @function GetStudentsBySchool
 * @param {Object} parent - The parent resolver object containing the school ID.
 * @param {Object} _ - The arguments parameter (unused in this resolver).
 * @param {Object} context - The context object containing loaders.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of student documents.
 */
async function GetStudentsBySchool(parent, _, context) {
  try {
    // ************** Return empty array if no students are associated with the school
    if (!parent.students || !parent.students.length) {
      return [];
    }
    
    //************** Use the StudentLoader to load each student by ID
    const students = await context.loaders.StudentLoader.loadMany(parent.students);
    return students;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id: parent.id }),
      function_name: 'GetStudentsBySchool',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}


// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllSchools,
    GetSchoolById,
  },
  Mutation: {
    CreateSchool,
    UpdateSchool,
    DeleteSchool,
  },
  School: { 
    students: GetStudentsBySchool,
  },
};
