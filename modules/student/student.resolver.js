// *************** IMPORT MODULE ***************
const Student = require('./student.model');
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');

// *************** IMPORT UTILITIES ***************
const { LogError } = require('../../utils/error-logger');

// *************** IMPORT VALIDATOR ***************
const { IsRequiredString, IsValidDateString } = require('../../validation/validation');

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
    let query = {
      $and: [
        // *************** Filter by status, not by deleted_at
        { status: filter && filter.status ? filter.status : 'active' } // Default to active students
      ]
    };
    
    // *************** Add name filter if provided
    if (filter && filter.name) {
      query.$and.push({ 
        $or: [
          { first_name: { $regex: filter.name, $options: 'i' } },
          { last_name: { $regex: filter.name, $options: 'i' } }
        ]
      });
    }

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
      throw new ApolloError('Student ID is required', 'STUDENT_ID_REQUIRED');
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid Student ID format', 'INVALID_ID_FORMAT');
    }

    // *************** Retrieve Student using status instead of deleted_at
    const student = await Student.findOne({ _id: id, status: 'active' });
    if (!student) {
      throw new ApolloError('Student not found', 'STUDENT_NOT_FOUND');
    }
    return student;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR', 'GetStudentById', 'query', { id });
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
    // *************** Validate Input
    if (!IsRequiredString(first_name)) {
      throw new ApolloError('First name is required', 'VALIDATION_ERROR');
    }
    if (!IsRequiredString(last_name)) {
      throw new ApolloError('Last name is required', 'VALIDATION_ERROR');
    }
    if (!school_id) {
      throw new ApolloError('School ID is required', 'VALIDATION_ERROR');
    }
    
    //*************** Validate school ID format
    if (!mongoose.Types.ObjectId.isValid(school_id)) {
      throw new ApolloError('Invalid School ID format', 'INVALID_ID_FORMAT');
    }
    
    // *************** Validate date_of_birth if provided
    if (date_of_birth) {
      IsValidDateString(date_of_birth, 'Date of birth');
    }

    // *************** Create Student
    const student = await Student.create({ first_name, last_name, email, date_of_birth, school_id });
    return student;
  } catch (error) {
    const errorCode = error.code === 11000 ? 'DUPLICATE_EMAIL' : (error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR');
    const errorMessage = error.code === 11000 ? 'Email already exists' : error.message;
    const customError = new Error(errorMessage);
    customError.stack = error.stack;
    
    throw await LogError(customError, errorCode, 'CreateStudent', 'mutation', { first_name, last_name, email, date_of_birth, school_id });
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
      throw new ApolloError('Student ID is required', 'STUDENT_ID_REQUIRED');
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid Student ID format', 'INVALID_ID_FORMAT');
    }

    // *************** Build update object with only provided fields
    const updateData = {};
    
    if (first_name !== undefined) {
      if (!IsRequiredString(first_name)) {
        throw new ApolloError('Invalid first name', 'VALIDATION_ERROR');
      }
      updateData.first_name = first_name;
    }

    if (last_name !== undefined) {
      if (!IsRequiredString(last_name)) {
        throw new ApolloError('Invalid last name', 'VALIDATION_ERROR');
      }
      updateData.last_name = last_name;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (date_of_birth !== undefined) {
      IsValidDateString(date_of_birth, 'Date of birth');
      updateData.date_of_birth = date_of_birth;
    }

    if (school_id !== undefined) {
      // **************** Validate school ID format
      if (!mongoose.Types.ObjectId.isValid(school_id)) {
        throw new ApolloError('Invalid School ID format', 'INVALID_ID_FORMAT');
      }
      updateData.school_id = school_id;
    }
    
    if (status !== undefined) {
      if (!['active', 'deleted'].includes(status)) {
        throw new ApolloError('Invalid status value. Must be "active" or "deleted"', 'VALIDATION_ERROR');
      }
      updateData.status = status;
    }

    // *************** Update Student
    const student = await Student.findByIdAndUpdate(id, updateData);
    if (!student) {
      throw new ApolloError('Student not found', 'STUDENT_NOT_FOUND');
    }
    
    // *************** Retrieve updated student
    const updatedStudent = await Student.findById(id);
    return updatedStudent;
  } catch (error) {
    const requestParams = { id, first_name, last_name, email, date_of_birth, school_id, status };
    const errorCode = error.code === 11000 ? 'DUPLICATE_EMAIL' : (error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR');
    const errorMessage = error.code === 11000 ? 'Email already exists' : error.message;
    const customError = new Error(errorMessage);
    customError.stack = error.stack;
    
    throw await LogError(customError, errorCode, 'UpdateStudent', 'mutation', requestParams);
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
      throw new ApolloError('Student ID is required', 'STUDENT_ID_REQUIRED');
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid Student ID format', 'INVALID_ID_FORMAT');
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
      throw new ApolloError('Student not found', 'STUDENT_NOT_FOUND');
    }
    
    // *************** Retrieve updated student
    const updatedStudent = await Student.findById(id);
    return updatedStudent;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR', 'DeleteStudent', 'mutation', { id });
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
