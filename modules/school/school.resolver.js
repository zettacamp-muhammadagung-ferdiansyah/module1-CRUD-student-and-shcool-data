// *************** IMPORT MODULE ***************
const School = require('./school.model');
const Student = require('../student/student.model');
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');

// *************** IMPORT UTILITIES ***************
const ErrorLogModel = require('../../error-logs/error-log.model');

// *************** IMPORT VALIDATOR ***************
const { 
  ValidateGetSchoolByIdParameters,
  ValidateCreateSchoolParameters,
  ValidateUpdateSchoolParameters,
  ValidateDeleteSchoolParameters
} = require('./school.validator');

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
    return await School.find({ status: 'active' });
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
    ValidateGetSchoolByIdParameters({ id });

    // *************** Retrieve School using status instead of deleted_at
    const school = await School.findOne({ _id: id, status: 'active' }); 
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
 * @param {string} args.name - Name of the school (required)
 * @param {string} [args.address] - Address of the school (optional)
 * @throws {ApolloError} Throws ApolloError if validation fails or creation error occurs
 * @returns {Promise<object>} The created school object
 */
async function CreateSchool(parent, { name, address }) {
  try {
    // *************** Validate Input
    ValidateCreateSchoolParameters({ name, address });

    // *************** Create School
    const school = await School.create({ name, address });
    return school;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ name, address }),
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
 * @param {string} [args.name] - Updated school name
 * @param {string} [args.address] - Updated school address
 * @throws {ApolloError} Throws ApolloError if validation fails or update error occurs
 * @returns {Promise<object|null>} The updated school object or null if not found
 */
async function UpdateSchool(parent, { id, name, address }) {
  try {
    // *************** Validate Input
    ValidateUpdateSchoolParameters({ id, name, address });

    // *************** Build update object with direct value assignment
    const updateData = { name, address };

    // *************** Update School
    const school = await School.findByIdAndUpdate(id, updateData);
    if (!school) {
      throw new ApolloError('School not found', 'RESOURCE_NOT_FOUND');
    } 
    
    return school;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id, name, address }),
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
    ValidateDeleteSchoolParameters({ id });

    // *************** Set status to deleted AND update deleted_at timestamp
    const school = await School.findByIdAndUpdate(
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
 * Retrieves all students associated with a specific school.
 *
 * @async
 * @function GetStudentsBySchool
 * @param {Object} parent - The parent resolver object, typically contains the school ID.
 * @param {string} parent.id - The ID of the school to retrieve students for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of student documents.
 * @throws {ApolloError} If a database error occurs, throws an ApolloError with code 'DATABASE_ERROR'.
 */

async function GetStudentsBySchool(parent) {
  try {
    // *************** Get the status of the school first to make sure we only return students from active schools
    const school = await School.findById(parent.id);
    
    // *************** Filter deleted schools
    if (school && school.status === 'deleted') {
      return [];
    }
    // *************** Retrieve Students by School
    return await Student.find({ school_id: parent.id, status: 'active' });
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
