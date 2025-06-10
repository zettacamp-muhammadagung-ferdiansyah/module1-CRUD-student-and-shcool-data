// *************** IMPORT MODULE ***************
const School = require('./school.model');
const Student = require('../student/student.model');
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');

// *************** IMPORT UTILITIES ***************
const { LogError } = require('../../utils/error-logger');

// *************** IMPORT VALIDATOR ***************
const { IsRequiredString, IsValidDateString } = require('../../validation/validation');

// *************** QUERY ***************
/**
 * Retrieves all schools based on filter criteria
 *
 * @async
 * @function GetAllSchools
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object containing filter parameters
 * @param {object} [args.filter] - Filter criteria for schools
 * @param {string} [args.filter.status] - Filter by school status ('active' or 'deleted')
 * @param {string} [args.filter.name] - Filter schools by name (case-insensitive partial match)
 * @param {boolean} [args.filter.hasStudents] - Filter schools that have students
 * @throws {ApolloError} Throws ApolloError if an error occurs during retrieval
 * @returns {Promise<Array>} Array of school objects matching the filter criteria
 */
async function GetAllSchools(parent, { filter = {} }) {
  try {
    // *************** Build query with filters
    let query = {
      $and: [
        // *************** Only filter by status, not by deleted_at
        { status: filter.status || 'active' } // ***************  Default to active schools
      ]
    };
    
    // *************** Add name filter if provided
    if (filter.name) {
      query.$and.push({ name: { $regex: filter.name, $options: 'i' } });
    }
    
    // ***************  Add check for schools with students if needed
    if (filter.hasStudents) {
      query.$and.push({ students: { $exists: true, $ne: [] } });
    }

    // *************** Retrieve Schools
    const schools = await School.find(query);
    return schools;
  } catch (error) {
    throw await LogError(error, 'DATABASE_ERROR', 'GetAllSchools', 'query', { filter });
  }
}

/**
 * Retrieves a single active school by its unique identifier. This function first validates
 * that the provided ID exists and has a valid MongoDB ObjectId format. It then queries the
 * database for a school with matching ID that has status set to 'active'. If such a
 * school exists, it returns the complete school object with all its fields. If no matching
 * school is found or the ID is invalid, appropriate error codes are thrown.
 *
 * @async
 * @function GetSchoolById
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object containing the school ID
 * @param {string} args.id - MongoDB ObjectId of the school to retrieve
 * @throws {ApolloError} Throws 'SCHOOL_ID_REQUIRED' if ID is not provided
 * @throws {ApolloError} Throws 'INVALID_ID_FORMAT' if ID format is invalid
 * @throws {ApolloError} Throws 'SCHOOL_NOT_FOUND' if school with given ID doesn't exist or is not active
 * @throws {ApolloError} Throws 'DATABASE_ERROR' if a database error occurs
 * @returns {Promise<object>} The school object with matching ID and active status
 */
async function GetSchoolById(parent, { id }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('School ID is required', 'SCHOOL_ID_REQUIRED');
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid School ID format', 'INVALID_ID_FORMAT');
    }

    // *************** Retrieve School using status instead of deleted_at
    const school = await School.findOne({ _id: id, status: 'active' }); //.lean
    if (!school) {
      throw new ApolloError('School not found', 'SCHOOL_NOT_FOUND');
    }
    return school;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR', 'GetSchoolById', 'query', { id });
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
 * @param {string} args.name - Name of the school (required)
 * @param {string} [args.address] - Address of the school (optional)
 * @throws {ApolloError} Throws ApolloError if validation fails or creation error occurs
 * @returns {Promise<object>} The created school object
 */
async function CreateSchool(parent, { name, address }) {
  try {
    // *************** Validate Input
    if (!IsRequiredString(name)) {
      throw new ApolloError('School name is required', 'VALIDATION_ERROR');
    }

    // *************** Create School
    const school = await School.create({ name, address });
    return school;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR', 'CreateSchool', 'mutation', { name, address });
  }
}

/**
 * Updates an existing school
 *
 * @async
 * @function UpdateSchool
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The update data
 * @param {string} args.id - School ID to update
 * @param {string} [args.name] - Updated school name
 * @param {string} [args.address] - Updated school address
 * @param {string} [args.status] - Updated school status ('active' or 'deleted')
 * @throws {ApolloError} Throws ApolloError if validation fails or update error occurs
 * @returns {Promise<object|null>} The updated school object or null if not found
 */
async function UpdateSchool(parent, { id, name, address, status }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('School ID is required', 'SCHOOL_ID_REQUIRED');
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid School ID format', 'INVALID_ID_FORMAT');
    }

    // *************** Build update object with only provided fields
    const updateData = {};
    
    if (name !== undefined) {
      if (!IsRequiredString(name)) {
        throw new ApolloError('Invalid school name', 'VALIDATION_ERROR');
      }
      updateData.name = name;
    }

    if (address !== undefined) {
      updateData.address = address;
    }
    
    if (status !== undefined) {
      if (!['active', 'deleted'].includes(status)) {
        throw new ApolloError('Invalid status value. Must be "active" or "deleted"', 'VALIDATION_ERROR');
      }
      updateData.status = status;
    }

    // *************** Update School
    const school = await School.findByIdAndUpdate(id, updateData);
    if (!school) {
      throw new ApolloError('School not found', 'SCHOOL_NOT_FOUND');
    }
    
    // *************** Retrieve updated school
    const updatedSchool = await School.findById(id);
    return updatedSchool;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR', 'UpdateSchool', 'mutation', { id, name, address, status });
  }
}

/**
 * Soft deletes a school by setting status to 'deleted' and updating deleted_at timestamp
 *
 * @async
 * @function DeleteSchool
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object
 * @param {string} args.id - School ID to delete
 * @throws {ApolloError} Throws 'SCHOOL_ID_REQUIRED' if ID is not provided
 * @throws {ApolloError} Throws 'INVALID_ID_FORMAT' if ID format is invalid
 * @throws {ApolloError} Throws 'SCHOOL_NOT_FOUND' if school with given ID doesn't exist
 * @throws {ApolloError} Throws 'DATABASE_ERROR' if a database error occurs
 * @returns {Promise<object>} The deleted school object
 */
async function DeleteSchool(parent, { id }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('School ID is required', 'SCHOOL_ID_REQUIRED');
    }

    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid School ID format', 'INVALID_ID_FORMAT');
    }

    // *************** Set status to deleted AND update deleted_at timestamp
    const school = await School.findByIdAndUpdate(
      id,
      { 
        status: 'deleted',
        deleted_at: new Date().toISOString() 
      }
    );
    if (!school) {
      throw new ApolloError('School not found', 'SCHOOL_NOT_FOUND');
    }
    
    // *************** Retrieve updated school
    const updatedSchool = await School.findById(id);
    return updatedSchool;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR', 'DeleteSchool', 'mutation', { id });
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
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(parent.id)) {
      throw new ApolloError('Invalid School ID format', 'INVALID_ID_FORMAT');
    }
    
    // *************** Get the status of the school first to make sure we only return students from active schools
    const school = await School.findById(parent.id);
    
    // *************** Filter deleted schools
    if (school && school.status === 'deleted') {
      return [];
    }
    // *************** Retrieve Students by School
    return await Student.find({ school_id: parent.id, status: 'active' });
  } catch (error) {
    throw await LogError(error, 'DATABASE_ERROR', 'GetStudentsBySchool', 'query', { school_id: parent.id });
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
