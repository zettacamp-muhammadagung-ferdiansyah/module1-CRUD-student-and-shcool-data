// *************** IMPORT MODULE ***************
const School = require('./school.model');
const Student = require('../student/student.model');
const { ApolloError } = require('apollo-server');
const ErrorLogModel = require('../../error-logs/error-log.model');

// *************** IMPORT HELPER FUNCTION ***************
const { HandleResolverError } = require('../../helpers/graphqlHelper');

// *************** IMPORT VALIDATOR ***************
const { IsNonEmptyString } = require('../../validation/validation');

// *************** QUERY ***************
/**
 * Retrieves all schools that haven't been soft deleted
 *
 * @async
 * @function GetSchools
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object (unused in this function)
 * @throws {ApolloError} Throws ApolloError if an error occurs during retrieval
 * @returns {Promise<Array>} Array of school objects
 */
async function GetAllSchools(parent, args) {
  try {
    // *************** Retrieve Schools
    const schools = await School.find({ deleted_at: null });
    return schools;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify(args),
      function_name: 'GetSchools',
      error: String(error),
    });

    throw new ApolloError(error.message, 'DATABASE_ERROR');
  }
}

/**
 * Retrieves a single school by ID
 *
 * @async
 * @function GetSchool
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object containing id
 * @throws {ApolloError} Throws ApolloError if school ID is not provided or an error occurs
 * @returns {Promise<object|null>} The school object or null if not found
 */
async function GetSchoolById(parent, { id }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('School ID is required', 'SCHOOL_ID_REQUIRED');
    }

    // *************** Retrieve School
    const school = await School.findOne({ _id: id, deleted_at: null });
    if (!school) {
      throw new ApolloError('School not found', 'SCHOOL_NOT_FOUND');
    }
    return school;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetSchool',
      error: String(error),
    });

    throw new ApolloError(error.message, 'DATABASE_ERROR');
  }
}

// *************** MUTATION ***************
/**
 * Creates a new school
 *
 * @async
 * @function CreateSchool
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The school data
 * @throws {ApolloError} Throws ApolloError if validation fails or creation error occurs
 * @returns {Promise<object>} The created school object
 */
async function CreateSchool(parent, args) {
  try {
    // *************** Validate Input
    if (!IsNonEmptyString(args.name)) {
      throw new ApolloError('School name is required', 'VALIDATION_ERROR');
    }

    // *************** Create School
    const school = await School.create(args);
    return school;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify(args),
      function_name: 'CreateSchool',
      error: String(error),
    });

    throw new ApolloError(error.message, 'DATABASE_ERROR');
  }
}

/**
 * Updates an existing school
 *
 * @async
 * @function UpdateSchool
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The update data
 * @throws {ApolloError} Throws ApolloError if validation fails or update error occurs
 * @returns {Promise<object|null>} The updated school object or null if not found
 */
async function UpdateSchool(parent, { id, ...rest }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('School ID is required', 'SCHOOL_ID_REQUIRED');
    }
    if (rest.name && !IsNonEmptyString(rest.name)) {
      throw new ApolloError('Invalid school name', 'VALIDATION_ERROR');
    }

    // *************** Update School
    const school = await School.findByIdAndUpdate(id, rest, { new: true });
    if (!school) {
      throw new ApolloError('School not found', 'SCHOOL_NOT_FOUND');
    }
    return school;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id, ...rest }),
      function_name: 'UpdateSchool',
      error: String(error),
    });

    throw new ApolloError(error.message, 'DATABASE_ERROR');
  }
}

/**
 * Soft deletes a school by setting deleted_at timestamp
 *
 * @async
 * @function DeleteSchool
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object
 * @throws {ApolloError} Throws ApolloError if school ID is not provided or deletion error occurs
 * @returns {Promise<object|null>} The deleted school object or null if not found
 */
async function DeleteSchool(parent, { id }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('School ID is required', 'SCHOOL_ID_REQUIRED');
    }

    // *************** Soft Delete School
    const school = await School.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!school) {
      throw new ApolloError('School not found', 'SCHOOL_NOT_FOUND');
    }
    return school;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'DeleteSchool',
      error: String(error),
    });

    throw new ApolloError(error.message, 'DATABASE_ERROR');
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
    // *************** Retrieve Students by School
    return await Student.find({ school_id: parent.id, deleted_at: null });
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ school_id: parent.id }),
      function_name: 'GetStudentsBySchool',
      error: String(error),
    });

    throw new ApolloError(error.message, 'DATABASE_ERROR');
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
  school: {
    students: GetStudentsBySchool,
  },
};
