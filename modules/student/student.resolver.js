// *************** IMPORT MODULE ***************
const Student = require('./student.model');
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { IsRequiredString, IsEmailFormat, IsValidDateFormat } = require('../../validation/validation');

// *************** QUERY ***************
/**
 * Retrieves all students that haven't been soft deleted
 *
 * @async
 * @function GetAllStudents
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
    throw new ApolloError(error.message, 'DATABASE_ERROR');
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

    // *************** Retrieve Student
    const student = await Student.findOne({ _id: id, deleted_at: null });
    if (!student) {
      throw new ApolloError('Student not found', 'STUDENT_NOT_FOUND');
    }
    return student;
  } catch (error) {
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
    if (!IsRequiredString(args.first_name)) {
      throw new ApolloError('First name is required', 'VALIDATION_ERROR');
    }
    if (!IsRequiredString(args.last_name)) {
      throw new ApolloError('Last name is required', 'VALIDATION_ERROR');
    }
    if (!IsEmailFormat(args.email)) {
      throw new ApolloError('Invalid email format', 'VALIDATION_ERROR');
    }
    if (args.date_of_birth && !IsValidDateFormat(args.date_of_birth)) {
      throw new ApolloError('Invalid date of birth', 'VALIDATION_ERROR');
    }
    if (!args.school_id) {
      throw new ApolloError('School ID is required', 'VALIDATION_ERROR');
    }

    // *************** Create Student
    const student = await Student.create(args);
    return student;
  } catch (error) {
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
async function UpdateStudent(parent, { id, first_name, last_name, email, date_of_birth, school_id }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('Student ID is required', 'STUDENT_ID_REQUIRED');
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
      if (!IsEmailFormat(email)) {
        throw new ApolloError('Invalid email format', 'VALIDATION_ERROR');
      }
      updateData.email = email;
    }

    if (date_of_birth !== undefined) {
      if (!IsValidDateFormat(date_of_birth)) {
        throw new ApolloError('Invalid date of birth', 'VALIDATION_ERROR');
      }
      updateData.date_of_birth = date_of_birth;
    }

    if (school_id !== undefined) {
      updateData.school_id = school_id;
    }

    // *************** Update Student
    const student = await Student.findByIdAndUpdate(id, updateData, { new: true });
    if (!student) {
      throw new ApolloError('Student not found', 'STUDENT_NOT_FOUND');
    }
    return student;
  } catch (error) {
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
    throw new ApolloError(error.message, 'DATABASE_ERROR');
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
