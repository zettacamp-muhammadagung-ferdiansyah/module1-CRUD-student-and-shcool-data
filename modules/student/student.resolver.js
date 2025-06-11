// *************** IMPORT MODULE ***************
const Student = require('./student.model');
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');
const validator = require('validator');

// *************** IMPORT UTILITIES ***************
const { LogError } = require('../../utils/error-logger');

// *************** IMPORT VALIDATOR ***************
const { IsRequiredString, IsValidObjectId, IsValidDateString, ErrorCode } = require('../../validation/validation');

// *************** QUERY ***************
/**
 * Retrieves all students that haven't been soft deleted
 *
 * @async
 * @function GetAllStudents
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object containing filter parameters
 * @param {object} [args.filter] - Filter criteria for students
 * @throws {ApolloError} Throws ApolloError if an error occurs during retrieval
 * @returns {Promise<Array>} Array of student objects
 */
async function GetAllStudents(parent, { filter = {} }) {
  try {
    // *************** Build query with filters
    const andConditions = [
      // *************** Filter by status, not by deleted_at
      { status: filter && filter.status ? filter.status : 'active' } // Default to active students
    ];
    
    // *************** Add name filter if provided
    if (filter && filter.name) {
      andConditions[andConditions.length] = { 
        $or: [
          { first_name: { $regex: filter.name, $options: 'i' } },
          { last_name: { $regex: filter.name, $options: 'i' } }
        ]
      };
    }

    // *************** Create query with MongoDB $and operator for filter conditions
    const query = { $and: andConditions };

    // *************** Retrieve Students
    const students = await Student.find(query);
    return students;
  } catch (error) {
    throw await LogError(error, 'DATABASE_ERROR', 'GetAllStudents', 'query', { filter });
  }
}

/**
 * Retrieves a single student by ID
 *
 * @async
 * @function GetStudentById
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object containing id
 * @param {string} args.id - The ID of the student to retrieve
 * @throws {ApolloError} Throws ApolloError if student ID is not provided or an error occurs
 * @returns {Promise<object|null>} The student object or null if not found
 */
async function GetStudentById(parent, { id }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('Student ID is required', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid Student ID format', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }

    // *************** Retrieve Student using status instead of deleted_at
    const student = await Student.findOne({ _id: id, status: 'active' });
    if (!student) {
      throw new ApolloError('Student not found', ErrorCode.RESOURCE_NOT_FOUND, {
        field: 'id'
      });
    }
    return student;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : ErrorCode.SERVER_ERROR, 'GetStudentById', 'query', { id });
  }
}

// *************** MUTATION ***************
/**
 * Creates a new student
 *
 * @async
 * @function CreateStudent
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The student data
 * @param {string} args.first_name - Student's first name
 * @param {string} args.last_name - Student's last name
 * @param {string} args.email - Student's email
 * @param {Date} [args.date_of_birth] - Student's date of birth
 * @param {string} args.school_id - ID of the school the student belongs to
 * @throws {ApolloError} Throws ApolloError if validation fails or creation error occurs
 * @returns {Promise<object>} The created student object
 */
async function CreateStudent(parent, { first_name, last_name, email, date_of_birth, school_id }) {
  try {
    // *************** Validate Input - using validator.js and improved error handling
    IsRequiredString(first_name, 'First name');
    IsRequiredString(last_name, 'Last name');
    
    if (!school_id) {
      throw new ApolloError('School ID is required', ErrorCode.INVALID_INPUT, {
        field: 'school_id'
      });
    }
    
    //*************** Validate school ID format
    if (!mongoose.Types.ObjectId.isValid(school_id)) {
      throw new ApolloError('Invalid School ID format', ErrorCode.INVALID_INPUT, {
        field: 'school_id'
      });
    }
    
    // *************** Validate email if provided
    if (email && !validator.isEmail(email)) {
      throw new ApolloError('Invalid email format', ErrorCode.INVALID_INPUT, {
        field: 'email'
      });
    }
    
    // *************** Validate date_of_birth if provided
    if (date_of_birth) {
      IsValidDateString(date_of_birth, 'Date of birth');
    }

    // *************** Create Student
    const student = await Student.create({ first_name, last_name, email, date_of_birth, school_id });
    return student;
  } catch (error) {
    const errorCode = error.code === 11000 ? ErrorCode.INVALID_INPUT : (error.extensions && error.extensions.code ? error.extensions.code : ErrorCode.SERVER_ERROR);
    const errorMessage = error.code === 11000 ? 'Email already exists' : error.message;
    const customError = new Error(errorMessage);
    customError.stack = error.stack;
    
    // Add field metadata for duplicate email errors
    const extensions = error.code === 11000 ? { field: 'email' } : (error.extensions || {});
    
    throw await LogError(
      Object.assign(customError, { extensions }), 
      errorCode, 
      'CreateStudent', 
      'mutation', 
      { first_name, last_name, email, date_of_birth, school_id }
    );
  }
}

/**
 * Updates an existing student
 *
 * @async
 * @function UpdateStudent
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The update data
 * @param {string} args.id - Student ID to update
 * @param {string} [args.first_name] - Updated first name
 * @param {string} [args.last_name] - Updated last name
 * @param {string} [args.email] - Updated email
 * @param {Date} [args.date_of_birth] - Updated date of birth
 * @param {string} [args.school_id] - Updated school ID
 * @param {string} [args.status] - Updated status
 * @throws {ApolloError} Throws ApolloError if validation fails or update error occurs
 * @returns {Promise<object|null>} The updated student object or null if not found
 */
async function UpdateStudent(parent, { id, first_name, last_name, email, date_of_birth, school_id, status }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('Student ID is required', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid Student ID format', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }

    // *************** Build update object with only provided fields
    const updateData = {};
    
    if (first_name !== undefined) {
      IsRequiredString(first_name, 'First name');
      updateData.first_name = first_name;
    }

    if (last_name !== undefined) {
      IsRequiredString(last_name, 'Last name');
      updateData.last_name = last_name;
    }

    if (email !== undefined) {
      if (email && !validator.isEmail(email)) {
        throw new ApolloError('Invalid email format', ErrorCode.INVALID_INPUT, {
          field: 'email'
        });
      }
      updateData.email = email;
    }    if (date_of_birth !== undefined) {
      IsValidDateString(date_of_birth, 'Date of birth');
      updateData.date_of_birth = date_of_birth;
    }

    if (school_id !== undefined) {
      // **************** Validate school ID format
      if (!mongoose.Types.ObjectId.isValid(school_id)) {
        throw new ApolloError('Invalid School ID format', ErrorCode.INVALID_INPUT, {
          field: 'school_id'
        });
      }
      updateData.school_id = school_id;
    }

    if (status !== undefined) {
      const validStatus = ['active', 'deleted'];
      if (!validStatus.includes(status)) {
        throw new ApolloError(
          `Invalid status value. Must be one of: ${validStatus.join(', ')}`, 
          ErrorCode.INVALID_INPUT, 
          {
            field: 'status',
            allowedValues: validStatus
          }
        );
      }
      updateData.status = status;
    }

    // *************** Update Student
    const student = await Student.findByIdAndUpdate(id, updateData);
    if (!student) {
      throw new ApolloError('Student not found', ErrorCode.RESOURCE_NOT_FOUND, {
        field: 'id'
      });
    }
    
    // *************** Retrieve updated student
    const updatedStudent = await Student.findById(id);
    return updatedStudent;
  } catch (error) {
    const requestParams = { id, first_name, last_name, email, date_of_birth, school_id, status };
    const errorCode = error.code === 11000 ? ErrorCode.INVALID_INPUT : (error.extensions && error.extensions.code ? error.extensions.code : ErrorCode.SERVER_ERROR);
    const errorMessage = error.code === 11000 ? 'Email already exists' : error.message;
    const customError = new Error(errorMessage);
    customError.stack = error.stack;
    
    // Add field metadata for duplicate email errors
    const extensions = error.code === 11000 ? { field: 'email' } : (error.extensions || {});
    
    throw await LogError(
      Object.assign(customError, { extensions }),
      errorCode, 
      'UpdateStudent', 
      'mutation', 
      requestParams
    );
  }
}

/**
 * Soft deletes a student by setting status to 'deleted' and updating deleted_at timestamp
 *
 * @async
 * @function DeleteStudent
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object
 * @param {string} args.id - Student ID to delete
 * @throws {ApolloError} Throws ApolloError if student ID is not provided or deletion error occurs
 * @returns {Promise<object|null>} The deleted student object or null if not found
 */
async function DeleteStudent(parent, { id }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('Student ID is required', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid Student ID format', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }

    // *************** Set status to deleted AND update deleted_at timestamp
    const student = await Student.findByIdAndUpdate(
      id,
      { 
        status: 'deleted',
        deleted_at: new Date().toISOString() 
      }
    );
    if (!student) {
      throw new ApolloError('Student not found', ErrorCode.RESOURCE_NOT_FOUND, {
        field: 'id'
      });
    }
    
    // *************** Retrieve updated student
    const updatedStudent = await Student.findById(id);
    return updatedStudent;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : ErrorCode.SERVER_ERROR, 'DeleteStudent', 'mutation', { id });
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllStudents,
    GetStudentById,
  },
  Mutation: {
    CreateStudent,
    UpdateStudent,
    DeleteStudent,
  },
};
