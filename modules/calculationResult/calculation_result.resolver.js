// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const CalculationResultModel = require('./calculation_result.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');
const { ValidatePaginationParameters } = require('../../utils/validator/pagination.validator');
const { ValidateTriggerCalculationParameters } = require('./calculation_result.validator');

// *************** IMPORT UTILITIES ***************
const { QueueTranscriptCalculation, GetWorkerStatus } = require('../../utils/worker.manager');

// *************** QUERY ***************
/**
 * Retrieves a single calculation result by ID.
 *
 * @async
 * @function GetCalculationResultById
 * @param {string} args.id - MongoDB ObjectId of the calculation result to retrieve
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if calculation result doesn't exist
 * @returns {Promise<Object>} The calculation result object
 */
async function GetCalculationResultById(_, { id }) {
  try {
    // *************** Validate ID
    ValidateMongoId(id);

    // *************** Find calculation result by ID
    const calculationResult = await CalculationResultModel.findById(id).lean();

    // *************** Check if calculation result exists
    if (!calculationResult) {
      throw new ApolloError('Calculation result not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Return the calculation result
    return calculationResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/calculationResult/calculation_result.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetCalculationResultById',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a student's latest calculation result.
 *
 * @async
 * @function GetStudentLatestCalculationResult
 * @param {string} args.studentId - MongoDB ObjectId of the student
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if no calculation result exists for the student
 * @returns {Promise<Object>} The latest calculation result for the student
 */
async function GetStudentLatestCalculationResult(_, { studentId }) {
  try {
    // *************** Validate ID
    ValidateMongoId(studentId);

    // *************** Find latest calculation result for student
    const calculationResult = await CalculationResultModel.findOne(
      { student_id: studentId },
      {},
      { sort: { calculation_date: -1 } }
    ).lean();

    // *************** Check if calculation result exists
    if (!calculationResult) {
      throw new ApolloError('No calculation result found for this student', 'RESOURCE_NOT_FOUND');
    }

    // *************** Return the calculation result
    return calculationResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/calculationResult/calculation_result.resolver.js',
      parameter_input: JSON.stringify({ studentId }),
      function_name: 'GetStudentLatestCalculationResult',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a paginated list of calculation results.
 *
 * @async
 * @function GetAllCalculationResults
 * @param {number} args.page - Page number for pagination (0-based, where 0 is the first page)
 * @param {number} args.limit - Number of calculation results per page
 * @throws {ApolloError} If query fails or pagination parameters are invalid
 * @returns {Promise<Object>} Paginated result with calculation results data, total count, page, and limit
 */
async function GetAllCalculationResults(_, { page, limit }) {
  try {
    // *************** Validate pagination parameters
    ValidatePaginationParameters({ page, limit });

    // *************** Calculate skip value for pagination
    const skip = page * limit;

    // *************** Execute queries sequentially
    const calculationResults = await CalculationResultModel.find({})
      .sort({ calculation_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // *************** Prepare paginated result
    const paginatedResult = {
      data: calculationResults,
      page,
      length: calculationResults.length,
    };

    // *************** Return paginated result
    return paginatedResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/calculationResult/calculation_result.resolver.js',
      parameter_input: JSON.stringify({ page, limit }),
      function_name: 'GetAllCalculationResults',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a paginated list of calculation results for a specific student.
 *
 * @async
 * @function GetCalculationResultsByStudent
 * @param {string} args.student_id - MongoDB ObjectId of the student
 * @param {number} args.page - Page number for pagination (0-based, where 0 is the first page)
 * @param {number} args.limit - Number of calculation results per page
 * @throws {ApolloError} If query fails or pagination parameters are invalid
 * @returns {Promise<Object>} Paginated result with calculation results data for the student
 */
async function GetCalculationResultsByStudent(_, { student_id, page, limit }) {
  try {
    // *************** Validate student ID
    ValidateMongoId(student_id);

    // *************** Validate pagination parameters
    ValidatePaginationParameters({ page, limit });

    // *************** Calculate skip value for pagination
    const skip = page * limit;

    // *************** Execute query for student's calculation results
    const calculationResults = await CalculationResultModel.find({ student_id })
      .sort({ calculation_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // *************** Prepare paginated result
    const paginatedResult = {
      data: calculationResults,
      page,
      length: calculationResults.length,
    };

    // *************** Return paginated result
    return paginatedResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/calculationResult/calculation_result.resolver.js',
      parameter_input: JSON.stringify({ student_id, page, limit }),
      function_name: 'GetCalculationResultsByStudent',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Manually triggers calculation for a student's block.
 *
 * @async
 * @function TriggerCalculation
 * @param {string} args.studentId - MongoDB ObjectId of the student
 * @param {string} args.blockId - MongoDB ObjectId of the block
 * @throws {ApolloError} If parameters are invalid or queuing fails
 * @returns {Promise<Object>} Object indicating that calculation was triggered
 */
async function TriggerCalculation(_, { studentId, blockId }, context) {
  try {
    // *************** Validate input parameters
    ValidateTriggerCalculationParameters({ studentId, blockId });

    // *************** Get current user ID from context
    const calculatedBy = (context && context.user && context.user._id) || '000000000000000000000000';

    // *************** Queue the calculation
    QueueTranscriptCalculation({
      studentId,
      blockId,
      calculatedBy: calculatedBy.toString()
    });

    // *************** Return success response
    return {
      success: true,
      message: 'Calculation queued successfully'
    };
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/calculationResult/calculation_result.resolver.js',
      parameter_input: JSON.stringify({ studentId, blockId }),
      function_name: 'TriggerCalculation',
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(`Failed to trigger calculation: ${error.message}`);
  }
}

/**
 * Gets the current status of calculation workers.
 *
 * @function GetCalculationWorkerStatus
 * @returns {Object} Status information including active workers and queued tasks
 */
function GetCalculationWorkerStatus() {
  try {
    // *************** Get worker status
    const status = GetWorkerStatus();
    
    // *************** Return status with timestamp
    return {
      ...status,
      timestamp: new Date(),
    };
  } catch (error) {
    // *************** Log error to console (non-critical)
    console.error('Failed to get worker status:', error);
    
    // *************** Return error status
    return {
      error: error.message,
      timestamp: new Date(),
    };
  }
}

// *************** LOADER ***************
/**
 * Loads the student associated with a calculation result using DataLoader.
 *
 * @async
 * @function GetStudentByCalculationResult
 * @param {Object} parent - The parent resolver object containing the calculation result data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to a student document
 */
async function GetStudentByCalculationResult(parent, _, context) {
  try {
    // *************** Guard against null parent or context
    if (!parent || !context) return null;
    // *************** Return null if no student_id is associated
    if (!parent.student_id) return null;
    // *************** Guard against missing loader
    if (!context.loaders || !context.loaders.StudentLoader) return null;
    // *************** Load student using DataLoader
    return await context.loaders.StudentLoader.load(parent.student_id);
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/calculationResult/calculation_result.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'GetStudentByCalculationResult',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Failed to load student: ${error.message}`);
  }
}

/**
 * Loads the school associated with a calculation result using DataLoader.
 *
 * @async
 * @function GetSchoolByCalculationResult
 * @param {Object} parent - The parent resolver object containing the calculation result data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to a school document
 */
async function GetSchoolByCalculationResult(parent, _, context) {
  try {
    // *************** Guard against null parent or context
    if (!parent || !context) return null;
    // *************** Return null if no school_id is associated
    if (!parent.school_id) return null;
    // *************** Guard against missing loader
    if (!context.loaders || !context.loaders.SchoolLoader) return null;
    // *************** Load school using DataLoader
    return await context.loaders.SchoolLoader.load(parent.school_id);
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/calculationResult/calculation_result.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'GetSchoolByCalculationResult',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Failed to load school: ${error.message}`);
  }
}

/**
 * Loads the user who created the calculation result using DataLoader.
 *
 * @async
 * @function GetCreatedByUser
 * @param {Object} parent - The parent resolver object containing the calculation result data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to a user document
 */
async function GetCreatedByUser(parent, _, context) {
  try {
    // *************** Guard against null parent or context
    if (!parent || !context) return null;
    // *************** Return null if no created_by is associated
    if (!parent.created_by) return null;
    // *************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) return null;
    // *************** Load user using DataLoader
    return await context.loaders.UserLoader.load(parent.created_by);
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/calculationResult/calculation_result.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'GetCreatedByUser',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Failed to load user: ${error.message}`);
  }
}

/**
 * Loads the user who updated the calculation result using DataLoader.
 *
 * @async
 * @function GetUpdatedByUser
 * @param {Object} parent - The parent resolver object containing the calculation result data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to a user document
 */
async function GetUpdatedByUser(parent, _, context) {
  try {
    // *************** Guard against null parent or context
    if (!parent || !context) return null;
    // *************** Return null if no updated_by is associated
    if (!parent.updated_by) return null;
    // *************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) return null;
    // *************** Load user using DataLoader
    return await context.loaders.UserLoader.load(parent.updated_by);
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/calculationResult/calculation_result.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'GetUpdatedByUser',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Failed to load user: ${error.message}`);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetCalculationResultById,
    GetLatestCalculationResultByStudent: GetStudentLatestCalculationResult,
    GetAllCalculationResults,
    GetCalculationWorkerStatus,
    GetCalculationResultsByStudent
  },
  Mutation: {
    TriggerCalculation
  },
  CalculationResult: {
    student: GetStudentByCalculationResult,
    school: GetSchoolByCalculationResult,
    created_by: GetCreatedByUser,
    updated_by: GetUpdatedByUser
  }
};
