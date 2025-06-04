// *************** IMPORT MODULE ***************
const Student = require('./student.model');
const { ApolloError } = require('apollo-server');
const ErrorLogModel = require('../../error-logs/error-log.model');
// *************** IMPORT HELPER FUNCTION ***************
const { HandleResolverError } = require('../../helpers/graphqlHelper');
// *************** IMPORT VALIDATOR ***************
const { IsNonEmptyString, IsValidEmail, IsValidDate } = require('../../validation/validation');

// *************** QUERY ***************
/**
 * Retrieves all students that haven't been soft deleted
 *
 * @async
 * @function GetStudents
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object (unused in this function)
 * @throws {ApolloError} Throws ApolloError if an error occurs during retrieval
 * @returns {Promise<Array>} Array of student objects
 */
async function GetAllStudents(parent, args) {
  try {
    // *************** Retrieve Students
    const students = await Student.find({ deleted_at: null });
    return students;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify(args),
      function_name: 'GetStudents',
      error: String(error),
    });

    throw new ApolloError(error.message, 'DATABASE_ERROR');
  }
}

/**
 * Retrieves a single student by ID
 *
 * @async
 * @function GetStudent
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

    // *************** Retrieve Student
    const student = await Student.findOne({ _id: id, deleted_at: null });
    if (!student) {
      throw new ApolloError('Student not found', 'STUDENT_NOT_FOUND');
    }
    return student;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetStudent',
      error: String(error),
    });

    throw new ApolloError(error.message, 'DATABASE_ERROR');
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
async function CreateStudent(parent, args) {
  try {
    // *************** Validate Input
    if (!IsNonEmptyString(args.first_name)) {
      throw new ApolloError('First name is required', 'VALIDATION_ERROR');
    }
    if (!IsNonEmptyString(args.last_name)) {
      throw new ApolloError('Last name is required', 'VALIDATION_ERROR');
    }
    if (!IsValidEmail(args.email)) {
      throw new ApolloError('Invalid email format', 'VALIDATION_ERROR');
    }
    if (args.date_of_birth && !IsValidDate(args.date_of_birth)) {
      throw new ApolloError('Invalid date of birth', 'VALIDATION_ERROR');
    }
    if (!args.school_id) {
      throw new ApolloError('School ID is required', 'VALIDATION_ERROR');
    }

    // *************** Create Student
    const student = await Student.create(args);
    return student;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify(args),
      function_name: 'CreateStudent',
      error: String(error),
    });

    if (error.code === 11000) {
      throw new ApolloError('Email already exists', 'DUPLICATE_EMAIL');
    }
    throw new ApolloError(error.message, 'DATABASE_ERROR');
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
 * @throws {ApolloError} Throws ApolloError if validation fails or update error occurs
 * @returns {Promise<object|null>} The updated student object or null if not found
 */
async function UpdateStudent(parent, { id, ...rest }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('Student ID is required', 'STUDENT_ID_REQUIRED');
    }
    if (rest.email && !IsValidEmail(rest.email)) {
      throw new ApolloError('Invalid email format', 'VALIDATION_ERROR');
    }
    if (rest.first_name && !IsNonEmptyString(rest.first_name)) {
      throw new ApolloError('Invalid first name', 'VALIDATION_ERROR');
    }
    if (rest.last_name && !IsNonEmptyString(rest.last_name)) {
      throw new ApolloError('Invalid last name', 'VALIDATION_ERROR');
    }
    if (rest.date_of_birth && !IsValidDate(rest.date_of_birth)) {
      throw new ApolloError('Invalid date of birth', 'VALIDATION_ERROR');
    }

    // *************** Update Student
    const student = await Student.findByIdAndUpdate(id, rest, { new: true });
    if (!student) {
      throw new ApolloError('Student not found', 'STUDENT_NOT_FOUND');
    }
    return student;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ id, ...rest }),
      function_name: 'UpdateStudent',
      error: String(error),
    });

    if (error.code === 11000) {
      throw new ApolloError('Email already exists', 'DUPLICATE_EMAIL');
    }
    throw new ApolloError(error.message, 'DATABASE_ERROR');
  }
}

/**
 * Soft deletes a student by setting deleted_at timestamp
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

    // *************** Soft Delete Student
    const student = await Student.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!student) {
      throw new ApolloError('Student not found', 'STUDENT_NOT_FOUND');
    }
    return student;
  } catch (error) {
    // *************** Log the error
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'DeleteStudent',
      error: String(error),
    });

    throw new ApolloError(error.message, 'DATABASE_ERROR');
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    Students: GetAllStudents,
    Student: GetStudentById,
  },
  Mutation: {
    CreateStudent,
    UpdateStudent,
    DeleteStudent,
  },
};
