// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');
const TestModel = require('../test/test.model');
const TaskModel = require('../task/task.model');
const UserModel = require('../user/user.model');

// *************** IMPORT VALIDATOR ***************
const StudentTestResultValidators = require('./student_test_result.validator');
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');
const { ValidatePaginationParameters } = require('../../utils/validator/pagination.validator');

// *************** QUERY ***************
/**
 * Retrieves a paginated list of active student test results.
 *
 * @async
 * @function GetAllStudentTestResults
 * @param {number} args.page - Page number for pagination (0-based, where 0 is the first page)
 * @param {number} args.limit - Number of student test results per page
 * @throws {ApolloError} If query fails or pagination parameters are invalid
 * @returns {Promise<Object>} Paginated result with student test results data, total count, page, and limit
 */
async function GetAllStudentTestResults(_, { page, limit }) {
  try {
    // *************** Validate pagination parameters
    ValidatePaginationParameters({ page, limit });

    // *************** Calculate skip value for pagination
    const skip = page * limit;

    // *************** Execute queries sequentially
    const studentTestResults = await StudentTestResultModel.find({ student_test_result_status: 'active' }).skip(skip).limit(limit).lean();

    // *************** Prepare paginated result
    const paginatedResult = {
      data: studentTestResults,
      page,
      length: studentTestResults.length,
    };

    // *************** Return paginated result
    return paginatedResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ page, limit }),
      function_name: 'GetAllStudentTestResults',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a single active student test result by ID.
 *
 * @async
 * @function GetStudentTestResultById
 * @param {string} args.id - MongoDB ObjectId of the student test result to retrieve
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if student test result doesn't exist or is not active
 * @returns {Promise<Object>} The student test result object
 */
async function GetStudentTestResultById(_, { id }) {
  try {
    // *************** Validate ID
    ValidateMongoId(id);

    // *************** Find student test result by ID
    const studentTestResult = await StudentTestResultModel.findOne({
      _id: id,
      student_test_result_status: 'active',
    }).lean();

    // *************** Check if student test result exists
    if (!studentTestResult) {
      throw new ApolloError('Student test result not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Return the student test result
    return studentTestResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetStudentTestResultById',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new student test result
 *
 * @async
 * @function CreateStudentTestResult
 * @param {Object} args.student_test_result_input - Input containing student test result data
 * @param {string} args.student_test_result_input.student_id - ID of the student this result belongs to
 * @param {string} args.student_test_result_input.test_id - ID of the test being evaluated
 * @param {Array<Object>} args.student_test_result_input.marks - Array of mark objects with notation_text and mark
 * @throws {ApolloError} If validation fails or creation error occurs
 * @returns {Promise<Object>} The created student test result object
 */
async function CreateStudentTestResult(_, { student_test_result_input }) {
  try {
    // *************** Validate input parameters
    StudentTestResultValidators.ValidateCreateStudentTestResultParameters(student_test_result_input);

    // *************** Create sanitized student test result object with only required fields from input
    const studentTestResultData = {
      student_id: student_test_result_input.student_id,
      test_id: student_test_result_input.test_id,
      marks: student_test_result_input.marks,
      student_test_result_status: 'active',
    };

    // *************** Calculate the total marks and average mark from the provided marks
    const totalMarks = student_test_result_input.marks.reduce((total, markObject) => {
      return total + markObject.mark;
    }, 0);
    studentTestResultData.average_mark = totalMarks / student_test_result_input.marks.length;
    studentTestResultData.mark_entry_date = new Date();

    // *************** Add optional fields if they exist
    if (student_test_result_input.created_by) {
      studentTestResultData.created_by = student_test_result_input.created_by;
    }

    // *************** Create student test result
    const newStudentTestResult = await StudentTestResultModel.create(studentTestResultData);

    // *************** Return the created student test result
    return newStudentTestResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ student_test_result_input }),
      function_name: 'CreateStudentTestResult',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing student test result.
 *
 * This mutation updates the fields of a student test result document based on the provided input.
 * It recalculates the average mark if marks are provided, updates only the fields present in the input,
 * and returns the updated student test result object.
 *
 * @async
 * @function UpdateStudentTestResult
 * @param {string} args.id - The ID of the student test result to update.
 * @param {Object} args.student_test_result_input - The input object containing updated fields.
 * @param {string} [args.student_test_result_input.student_id] - (Optional) The updated student ID.
 * @param {string} [args.student_test_result_input.test_id] - (Optional) The updated test ID.
 * @param {Array<Object>} [args.student_test_result_input.marks] - (Optional) Array of updated marks.
 * @param {string} [args.student_test_result_input.updated_by] - (Optional) The user ID performing the update.
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if the student test result does not exist or is not active.
 * @returns {Promise<Object>} The updated student test result object.
 */
async function UpdateStudentTestResult(_, { id, student_test_result_input }) {
  try {
    // *************** Validate input parameters
    StudentTestResultValidators.ValidateUpdateStudentTestResultParameters({
      id,
      studentTestResultInput: student_test_result_input,
    });

    // *************** Find the current student test result document by ID and status
    const currentStudentTestResult = await StudentTestResultModel.findOne({
      _id: id,
      student_test_result_status: 'active',
    });

    if (!currentStudentTestResult) {
      throw new ApolloError('Student test result not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Calculate the total marks and average mark if marks are provided
    let marks = currentStudentTestResult.marks;
    let average_mark = currentStudentTestResult.average_mark;
    if (student_test_result_input.marks && student_test_result_input.marks.length) {
      marks = student_test_result_input.marks;
      const totalMarks = marks.reduce((total, markObject) => {
        return total + markObject.mark;
      }, 0);
      average_mark = totalMarks / marks.length;
    }

    // *************** Build update payload 
    const updatePayload = {
      student_id: student_test_result_input.student_id,
      test_id: student_test_result_input.test_id,
      marks,
      average_mark,
      mark_entry_date: new Date(),
      updated_by: student_test_result_input.updated_by,
    };

    // *************** Update and return the updated student test result document in one step
    const updatedStudentTestResult = await StudentTestResultModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true }
    ).lean();

    if (!updatedStudentTestResult) {
      throw new ApolloError('Student test result not found after update', 'RESOURCE_NOT_FOUND');
    }

    return updatedStudentTestResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ id, student_test_result_input }),
      function_name: 'UpdateStudentTestResult',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}
/**
 * Soft deletes a student test result by setting status to 'DELETED'
 *
 * @async
 * @function DeleteStudentTestResult
 * @param {string} args.id - Student test result ID to delete
 * @param {string} args.deleted_by - User ID performing the deletion
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if student test result doesn't exist
 * @throws {ApolloError} Throws 'ALREADY_DELETED' if student test result is already deleted
 * @returns {Promise<Object>} The deleted student test result object
 */
async function DeleteStudentTestResult(_, { id, deleted_by }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Soft delete the student test result in a single fetch
    const deletedStudentTestResult = await StudentTestResultModel.findByIdAndUpdate(
      id,
      {
        $set: {
          student_test_result_status: 'deleted',
          deleted_at: new Date(),
          deleted_by,
        },
      }
    );

    if (!deletedStudentTestResult || deletedStudentTestResult.student_test_result_status !== 'active') {
      throw new ApolloError('Student test result not found or already deleted', 'RESOURCE_NOT_FOUND');
    }

    return 'student test result has been deleted';
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ id, deleted_by }),
      function_name: 'DeleteStudentTestResult',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Creates a new student test result, marks ENTER_MARKS task as completed, and creates VALIDATE_MARKS task.
 *
 * @async
 * @function EnterMarks
 * @param {Object} args.input - Input for creating student test result
 * @throws {ApolloError} If validation or creation fails
 * @returns {Promise<Object>} The created student test result object
 */
async function EnterMarks(_, { input }) {
  try {
    // *************** Validate input parameters
    StudentTestResultValidators.ValidateCreateStudentTestResultParameters(input);

    // *************** Find the ENTER_MARKS task and ensure it is active
    const test = await TestModel.findById(input.test_id).lean();
    if (!test) {
      throw new ApolloError('Test not found', 'RESOURCE_NOT_FOUND');
    }
    // *************** Find and mark ENTER_MARKS task as COMPLETED in one query
    const enterMarksTask = await TaskModel.findOneAndUpdate(
      {
        test_id: input.test_id,
        school_id: test.school_id,
        student_id: input.student_id,
        task_type: 'ENTER_MARKS',
        task_status: 'active',
      },
      {
        $set: {
          task_status: 'completed',
          updated_by: input.created_by,
          completed_by: input.created_by,
          completed_at: new Date(),
        },
      }
    );
    if (!enterMarksTask) {
      throw new ApolloError('Enter Marks task not found or not active', 'RESOURCE_NOT_FOUND');
    }

    // *************** Prepare payload for StudentTestResult
    const createStudentTestResultPayload = {
      student_id: input.student_id,
      test_id: input.test_id,
      marks: input.marks,
      student_test_result_status: 'active',
      created_by: input.created_by,
    };
    // *************** Calculate the total marks and average mark
    const totalMarks = input.marks.reduce((total, markObject) => {
      return total + markObject.mark;
    }, 0);
    createStudentTestResultPayload.average_mark = totalMarks / input.marks.length;
    createStudentTestResultPayload.mark_entry_date = new Date();
    // *************** Create StudentTestResult
    const newStudentTestResult = await StudentTestResultModel.create(createStudentTestResultPayload);

    // *************** Prepare payload for VALIDATE_MARKS task (with required fields)
    const validator = await UserModel.findOne({ role: 'ACADEMIC_DIRECTOR', status: 'active' }).lean();
    if (!validator) {
      throw new ApolloError('Academic director not found', 'NOT_FOUND');
    }
    const createValidateMarkPayload = {
      task_type: 'VALIDATE_MARKS',
      test_id: newStudentTestResult.test_id, 
      school_id: test.school_id,
      user_id: validator._id, 
      student_id: newStudentTestResult.student_id, 
      due_date: input.due_date || null,
      task_status: 'active',
      title: test ? test.name : 'Validate Marks',
      description: test ? test.description : 'Validate marks for assigned test',
      created_by: input.created_by,
      updated_by: input.created_by,
    };
    const createTask = await TaskModel.create(createValidateMarkPayload);
    if (!createTask) {
      throw new ApolloError('Failed to create VALIDATE_MARKS task', 'NOT_FOUND');
    }

    // *************** Return the created student test result
    return newStudentTestResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ input }),
      function_name: 'EnterMarks',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Validates student marks and completes the VALIDATE_MARKS task.
 *
 * @async
 * @function ValidateMarks
 * @throws {ApolloError} If validation or update fails
 * @returns {Promise<Object>} The validated student test result object
 */
async function ValidateMarks(_, { id }) {
  try {
    // *************** Validate ID
    ValidateMongoId(id);

    // *************** First, find the student test result with populated test to get test details
    const studentTestResult = await StudentTestResultModel.findOne({
      _id: id,
      student_test_result_status: 'active'
    }).populate({ path: 'test_id', select: 'school_id name description' }).lean();

    if (!studentTestResult) {
      throw new ApolloError('Student test result not found or not active', 'RESOURCE_NOT_FOUND');
    }

    const test = studentTestResult.test_id;
    if (!test) {
      throw new ApolloError('Test not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Update student test result without populate (so test_id remains as ObjectId)
    const validatedStudentTestResult = await StudentTestResultModel.findOneAndUpdate(
      { _id: id, student_test_result_status: 'active' },
      {
        $set: {
          student_test_result_status: 'validated',
          updated_at: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!validatedStudentTestResult) {
      throw new ApolloError('Student test result not found or not active', 'RESOURCE_NOT_FOUND');
    }

    // *************** Mark the VALIDATE_MARKS task for this student as COMPLETED
    await TaskModel.updateOne(
      {
        test_id: test._id,
        school_id: test.school_id,
        user_id: validatedStudentTestResult.user_id,
        student_id: validatedStudentTestResult.student_id, 
        task_type: 'VALIDATE_MARKS',
        task_status: 'active',
      },
      {
        $set: {
          task_status: 'completed',
          updated_at: new Date(),
        },
      }
    );

    // *************** Return the validated student test result (with test_id as ObjectId)
    return validatedStudentTestResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'ValidateMarks',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************
/**
 * Loads the student associated with a test result using DataLoader.
 *
 * @async
 * @function GetStudentByStudentTestResult
 * @param {Object} parent - The parent resolver object containing the student test result data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to a student document
 */
async function GetStudentByStudentTestResult(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) {
      return null;
    }

    // ************** Return null if no student_id is associated
    if (!parent.student_id) {
      return null;
    }

    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.StudentLoader) {
      return null;
    }

    // *************** Load student using DataLoader
    const student = await context.loaders.StudentLoader.load(parent.student_id);

    // *************** Check if student exists
    if (!student) {
      return null;
    }

    return student;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'GetStudentByStudentTestResult',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(`Failed to load student: ${error.message}`);
  }
}

/**
 * Loads the test associated with a student test result using DataLoader.
 *
 * @async
 * @function GetTestByStudentTestResult
 * @param {Object} parent - The parent resolver object containing the student test result data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to a test document
 */
async function GetTestByStudentTestResult(parent, _, context) {
  try {
    if (!parent || !context) return null;
    if (!parent.test_id) return null;
    if (!context.loaders || !context.loaders.TestLoader) return null;
    const test = await context.loaders.TestLoader.load(parent.test_id);
    if (!test) return null;
    return test;
  } catch (error) {
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'GetTestByStudentTestResult',
      error: String(error.stack),
    });
    throw new ApolloError(`Failed to load test: ${error.message}`);
  }
}
/**
 * Loads the user who created the student test result using DataLoader.
 *
 * @async
 * @function CreatedByUser
 * @param {object} parent - The student test result object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function CreatedByUser(parent, _, context) {
  try {
    // *************** Guard against null parent or context
    if (!parent || !context) return null;
    // *************** Return null if no created_by is associated
    if (!parent.created_by) return null;
    // *************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      return null;
    }
    // *************** Load user using DataLoader
    return await context.loaders.UserLoader.load(parent.created_by);
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'CreatedByUser',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Unable to load creator user: ${error.message}`, 'USER_FETCH_FAILED');
  }
}

/**
 * Loads the user who last updated the student test result using DataLoader.
 *
 * @async
 * @function UpdatedByUser
 * @param {object} parent - The student test result object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function UpdatedByUser(parent, _, context) {
  try {
    // *************** Guard against null parent or context
    if (!parent || !context) return null;
    // *************** Return null if no updated_by is associated
    if (!parent.updated_by) return null;
    // *************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      return null;
    }
    // *************** Load user using DataLoader
    return await context.loaders.UserLoader.load(parent.updated_by);
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'UpdatedByUser',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Unable to load updater user: ${error.message}`, 'USER_FETCH_FAILED');
  }
}

/**
 * Loads the user who deleted the student test result using DataLoader.
 *
 * @async
 * @function DeletedByUser
 * @param {object} parent - The student test result object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function DeletedByUser(parent, _, context) {
  try {
    // *************** Guard against null parent or context
    if (!parent || !context) return null;
    // *************** Return null if no deleted_by is associated
    if (!parent.deleted_by) return null;
    // *************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      return null;
    }
    // *************** Load user using DataLoader
    return await context.loaders.UserLoader.load(parent.deleted_by);
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/studentTestResult/student_test_result.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'DeletedByUser',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Unable to load deleter user: ${error.message}`, 'USER_FETCH_FAILED');
  }
}

// *************** EXPORT MODULE **************
module.exports = {
  Query: {
    GetAllStudentTestResults,
    GetStudentTestResultById,
  },
  Mutation: {
    CreateStudentTestResult,
    UpdateStudentTestResult,
    DeleteStudentTestResult,
    EnterMarks,
    ValidateMarks,
  },
  StudentTestResult: {
    student_id: GetStudentByStudentTestResult,
    test_id: GetTestByStudentTestResult,
    created_by: CreatedByUser,
    updated_by: UpdatedByUser,
    deleted_by: DeletedByUser,
  },
};
