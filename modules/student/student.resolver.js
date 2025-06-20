// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');
const SchoolModel = require('../school/school.model');

// *************** IMPORT VALIDATOR ***************
const StudentValidators = require('./student.validator');
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

// *************** QUERY ***************
/**
 * Retrieves all students that haven't been soft deleted
 *
 * @async
 * @function GetAllStudents
 * @throws {ApolloError} Throws ApolloError with the original error message if retrieval fails
 * @returns {Promise<Array>} Array of student objects
 */
async function GetAllStudents() {
  try {
    // *************** Query to retrieve only active students
    const students = await StudentModel.find({ status: 'active' }).lean();
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
 * @param {string} args.id - MongoDB ObjectId of the student to retrieve
 * @throws {ApolloError} Throws 'INVALID_INPUT' if ID is not provided or has invalid format
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if student with given ID doesn't exist or is not active
 * @returns {Promise<object>} The student object with matching ID and active status
 */
async function GetStudentById(_, { id }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Retrieve Student using status active
    const student = await StudentModel.findOne({ _id: id, status: 'active' }).lean();
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
 * @param {object} args.student_input - Input object containing student data
 * @param {string} args.student_input.first_name - Student's first name
 * @param {string} args.student_input.last_name - Student's last name
 * @param {string} args.student_input.email - Student's email
 * @param {Date} [args.student_input.date_of_birth] - Student's date of birth
 * @param {string} args.student_input.school_id - ID of the school the student belongs to
 * @returns {Promise<object>} The created student object
 */
async function CreateStudent(_, { student_input }) {
  try {
    // *************** Validate Input
    StudentValidators.ValidateCreateUpdateStudentParameters({ studentInput: student_input });

    // *************** Create sanitized student object with only allowed fields
    const studentData = {
      first_name: student_input.first_name,
      last_name: student_input.last_name,
      email: student_input.email,
      school_id: student_input.school_id,
      status: 'active'
    };

    // *************** Add optional fields if they exist
    if (student_input.date_of_birth) studentData.date_of_birth = student_input.date_of_birth;

    // *************** Create Student
    const student = await StudentModel.create(studentData);
    
    // *************** Update School with new student ID
    if (student_input.school_id) {
      await SchoolModel.findByIdAndUpdate(
        student_input.school_id,
        { $addToSet: { students: student._id } }
      ).lean();
    }
    
    return student;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify(student_input),
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
 * @param {string} args.id - Student ID to update
 * @param {object} args.student_input - Input object with fields to update
 * @param {string} [args.student_input.first_name] - Updated first name
 * @param {string} [args.student_input.last_name] - Updated last name
 * @param {string} [args.student_input.email] - Updated email
 * @param {Date} [args.student_input.date_of_birth] - Updated date of birth
 * @param {string} [args.student_input.school_id] - Updated school ID
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if student with given ID doesn't exist
 * @returns {Promise<object|null>} The updated student object or null if not found
 */
async function UpdateStudent(_, { id, student_input }) {
  try {
    // *************** Validate Input
    StudentValidators.ValidateCreateUpdateStudentParameters({ id, studentInput: student_input });

    // *************** First, get the current student to check if school_id is changing
    const currentStudent = await StudentModel.findById(id).lean();
    if (!currentStudent) {
      throw new ApolloError('Student not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Create sanitized student object with only allowed fields
    const updateData = {
      first_name: student_input.first_name,
      last_name: student_input.last_name,
      email: student_input.email,
      school_id: student_input.school_id,
      status: 'active'
    };

    // *************** Add optional fields if they exist
    if (student_input.date_of_birth) updateData.date_of_birth = student_input.date_of_birth;

    // *************** Handle school change if school_id is provided and different
    if (student_input.school_id && currentStudent.school_id.toString() !== student_input.school_id) {
      // *************** 1. Remove student from old school's students array
      await SchoolModel.findByIdAndUpdate(
        currentStudent.school_id,
        { $pull: { students: currentStudent._id } }
      ).lean();
      
      // *************** 2. Add student to new school's students array
      await SchoolModel.findByIdAndUpdate(
        student_input.school_id,
        { $addToSet: { students: currentStudent._id } }
      ).lean();
    }

    // *************** Update Student
    const updatedStudent = await StudentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    return updatedStudent;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/student/student.resolver.js',
      parameter_input: JSON.stringify({ id, student_input }),
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
 * @param {string} args.id - Student ID to delete
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if student with given ID doesn't exist
 * @throws {ApolloError} Throws 'ALREADY_DELETED' if student is already deleted
 * @returns {Promise<object|null>} The deleted student object or null if not found
 */
async function DeleteStudent(_, { id }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Get the student first to get the school_id
    const student = await StudentModel.findById(id).lean();
    if (!student) {
      throw new ApolloError('Student not found', 'RESOURCE_NOT_FOUND');
    }
    
    // *************** Check if student is already deleted
    if (student.status === 'deleted') {
      throw new ApolloError('Student is already deleted', 'ALREADY_DELETED');
    }

    // *************** Remove student from school's students array
    if (student.school_id) {
      await SchoolModel.findByIdAndUpdate(
        student.school_id,
        { $pull: { students: student._id } }
      ).lean();
    }

    // *************** Set status to deleted AND update deleted_at timestamp
    const updatedStudent = await StudentModel.findByIdAndUpdate(
      id,
      {
        status: 'deleted',
        deleted_at: new Date()
      }
    ).lean();
    
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
 * @param {Object} context - The context object containing loaders.
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to the school document.
 */
async function GetSchoolByStudent(parent, _, context) {
  try {
    // *************** Guard against null parent or context
    if (!parent || !context) {
      return null;
    }
    
    // *************** If there's no school_id in parent, return null
    if (!parent.school_id) {
      return null;
    }
    
    // *************** Guard against missing loader
    if (!context.loaders || !context.loaders.SchoolLoader) {
      console.error('SchoolLoader is not available in the context');
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
