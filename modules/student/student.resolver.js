// *************** IMPORT MODULE ***************
const Student = require('./student.model');
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');

// *************** IMPORT UTILITIES ***************
const ErrorLogModel = require('../../error-logs/error-log.model');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateGetStudentByIdParameters,
  ValidateCreateStudentParameters,
  ValidateUpdateStudentParameters,
  ValidateDeleteStudentParameters
} = require('./student.validator');

// *************** QUERY ***************
/**
 * Retrieves all students that haven't been soft deleted
 *
 * @async
 * @function GetAllStudents
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object
 * @throws {ApolloError} Throws ApolloError if an error occurs during retrieval
 * @returns {Promise<Array>} Array of student objects
 */
async function GetAllStudents(parent, {}) {
  try {
    // *************** Query to retrieve only active students
    return await Student.find({ status: 'active' });
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({}),
      function_name: 'GetAllStudents',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
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
    ValidateGetStudentByIdParameters({ id });

    // *************** Retrieve Student using status instead of deleted_at
    const student = await Student.findOne({ _id: id, status: 'active' });
    if (!student) {
      throw new ApolloError('Student not found', 'RESOURCE_NOT_FOUND',);
    }
    return student;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetStudentById',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
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
    ValidateCreateStudentParameters({ first_name, last_name, email, date_of_birth, school_id });

    // *************** Create Student
    const student = await Student.create({ first_name, last_name, email, date_of_birth, school_id });
    return student;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ first_name, last_name, email, date_of_birth, school_id }),
      function_name: 'CreateStudent',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
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
    ValidateUpdateStudentParameters({ id, first_name, last_name, email, date_of_birth, school_id, status });

    // *************** Build update object with only provided fields
    const updateData = {};
    // *************** Add each field to the update object only if it was provided in the request
    if (first_name !== undefined) {
      updateData.first_name = first_name; // *************** Add first_name field if provided
    }
    if (last_name !== undefined) {
      updateData.last_name = last_name; // *************** Add last_name field if provided
    }
    if (email !== undefined) {
      updateData.email = email; // *************** Add email field if provided
    }
    if (date_of_birth !== undefined) {
      updateData.date_of_birth = date_of_birth; // *************** Add date_of_birth field if provided
    }
    if (school_id !== undefined) {
      updateData.school_id = school_id; // *************** Add school_id field if provided
    }
    if (status !== undefined) {
      updateData.status = status; // *************** Add status field if provided
    }

    // *************** Update Student
    const student = await Student.findByIdAndUpdate(id, updateData);
    if (!student) {
      throw new ApolloError('Student not found', 'RESOURCE_NOT_FOUND');
    }
    
    return student;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ id, first_name, last_name, email, date_of_birth, school_id, status }),
      function_name: 'UpdateStudent',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
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
    ValidateDeleteStudentParameters({ id });

    // *************** Set status to deleted AND update deleted_at timestamp
    const student = await Student.findByIdAndUpdate(
      id,
      { 
        status: 'deleted',
        deleted_at: new Date().toISOString() 
      }
    );
    if (!student) {
      throw new ApolloError('Student not found', 'RESOURCE_NOT_FOUND');
    }
    
    return student;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'DeleteStudent',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
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
