// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const Mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');
const SchoolModel = require('../school/school.model');

// *************** IMPORT VALIDATOR ***************
const StudentValidators = require('./student.validator');

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
async function GetAllStudents() {
  try {
    // *************** Query to retrieve only active students
    const students = await StudentModel.find({ status: 'active' });
    return students;
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
 * Retrieves a single active student by ID. Validates ID format and existence
 * before fetching the student data. Only returns students with 'active' status.
 *
 * @async
 * @function GetStudentById
 * @param {object} parent - The parent object (unused in this function)
 * @param {string} args.id - MongoDB ObjectId of the student to retrieve
 * @throws {ApolloError} Throws 'INVALID_INPUT' if ID is not provided or has invalid format
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if student with given ID doesn't exist or is not active
 * @throws {ApolloError} Throws 'DATABASE_ERROR' if a database error occurs
 * @returns {Promise<object>} The student object with matching ID and active status
 */
async function GetStudentById(parent, { id }) {
  try {
    // *************** Validate Input
    StudentValidators.ValidateGetStudentByIdParameters({ id });

    // *************** Retrieve Student using status active
    const student = await StudentModel.findOne({ _id: id, status: 'active' });
    if (!student) {
      throw new ApolloError('Student not found', 'RESOURCE_NOT_FOUND');
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
    StudentValidators.ValidateCreateStudentParameters({ first_name, last_name, email, date_of_birth, school_id });

    // *************** Create Student
    const student = await StudentModel.create({ first_name, last_name, email, date_of_birth, school_id });
    
    // *************** Update School with new student ID
    if (school_id) {
      await SchoolModel.findByIdAndUpdate(
        school_id,
        { $addToSet: { students: student._id } }
      );
    }
    
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
    StudentValidators.ValidateUpdateStudentParameters({ id, first_name, last_name, email, date_of_birth, school_id });

    // *************** First, get the current student to check if school_id is changing
    const currentStudent = await StudentModel.findById(id);
    if (!currentStudent) {
      throw new ApolloError('Student not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Handle school change if school_id is provided and different
    if (school_id && currentStudent.school_id.toString() !== school_id) {
      // *************** 1. Remove student from old school's students array
      await SchoolModel.findByIdAndUpdate(
        currentStudent.school_id,
        { $pull: { students: currentStudent._id } }
      );
      
      // *************** 2. Add student to new school's students array
      await SchoolModel.findByIdAndUpdate(
        school_id,
        { $addToSet: { students: currentStudent._id } }
      );
    }

    // *************** Build update object with direct value assignment
    const updateData = { first_name, last_name, email, date_of_birth, school_id };

    // *************** Update Student
    const updatedStudent = await StudentModel.findByIdAndUpdate(
      id,
      updateData,
      //***************  Return the updated document
      { new: true } 
    );

    return updatedStudent;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ id, first_name, last_name, email, date_of_birth, school_id }),
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
 * @param {string} args.id - Student ID to delete
 * @throws {ApolloError} Throws ApolloError if student ID is not provided or deletion error occurs
 * @returns {Promise<object|null>} The deleted student object or null if not found
 */
async function DeleteStudent(parent, { id }) {
  try {
    // *************** Validate Input
    StudentValidators.ValidateDeleteStudentParameters({ id });

    // *************** Get the student first to get the school_id
    const student = await StudentModel.findById(id);
    if (!student) {
      throw new ApolloError('Student not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Remove student from school's students array
    if (student.school_id) {
      await SchoolModel.findByIdAndUpdate(
        student.school_id,
        { $pull: { students: student._id } }
      );
    }

    // *************** Set status to deleted AND update deleted_at timestamp
    const updatedStudent = await StudentModel.findByIdAndUpdate(
      id,
      {
        status: 'deleted',
        deleted_at: new Date().toISOString()
      }
    );
    
    return updatedStudent;
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

// *************** LOADER *************** 
/**
 * Retrieves the school associated with a specific student using DataLoader.
 *
 * @async
 * @function GetSchoolByStudent
 * @param {Object} parent - The parent resolver object containing the student data.
 * @param {Object} _ - The arguments parameter (unused in this resolver).
 * @param {Object} context - The context object containing loaders.
 * @returns {Promise<Object>} A promise that resolves to the school document.
 */
async function GetSchoolByStudent(parent, _, context) {
  try {
    // *************** If there's no school_id in parent, return null
    if (!parent.school_id) {
      return null;
    }
    
    // *************** Use the SchoolLoader from context to load the school
    return await context.loaders.SchoolLoader.load(parent.school_id);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ school_id: parent.school_id }),
      function_name: 'GetSchoolByStudent',
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
  Student: {
    school: GetSchoolByStudent,
  },
};
