// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.model');
const SubjectModel = require('../subject/subject.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

// *************** IMPORT VALIDATOR ***************
const TestValidators = require('./test.validator');
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

// *************** QUERY ***************
/**
 * Retrieves a paginated list of active tests.
 *
 * @async
 * @function GetAllTests
 * @param {number} args.page - Page number for pagination (0-based, where 0 is the first page)
 * @param {number} args.limit - Number of tests per page
 * @throws {ApolloError} If query fails or pagination parameters are invalid
 * @returns {Promise<Object>} Paginated result with tests data, total count, page, and limit
 */
async function GetAllTests(_, { page, limit }) {
  try {
    // *************** Validate pagination parameters
    TestValidators.ValidatePaginationParameters({ page, limit });

    // *************** Calculate skip value for pagination
    const skip = page * limit;

    // *************** Execute queries in parallel
    const [tests, total] = await Promise.all([
      TestModel.find({ status: 'active' })
        .skip(skip)
        .limit(limit)
        .lean(),
      TestModel.countDocuments({ status: 'active' })
    ]);

    // *************** Return paginated result
    return {
      data: tests,
      total,
      page,
      limit
    };
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify({ page, limit }),
      function_name: 'GetAllTests',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a single active test by ID.
 *
 * @async
 * @function GetTestById
 * @param {string} args.id - MongoDB ObjectId of the test to retrieve
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if test doesn't exist or is not active
 * @returns {Promise<Object>} The test object
 */
async function GetTestById(_, { id }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Find active test by ID
    const test = await TestModel.findOne({ _id: id, status: 'active' }).lean();
    if (!test) {
      throw new ApolloError('Test not found', 'RESOURCE_NOT_FOUND');
    }

    return test;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetTestById',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new test
 *
 * @async
 * @function CreateTest
 * @param {Object} args.test_input - Input containing test data
 * @param {string} args.test_input.subject_id - ID of the subject this test belongs to
 * @param {string} args.test_input.name - Name of the test
 * @param {string} [args.test_input.description] - Description of the test
 * @param {number} args.test_input.weight - Weight for score calculations
 * @param {Array<Object>} args.test_input.notations - Array of notation objects
 * @throws {ApolloError} If validation fails or creation error occurs
 * @returns {Promise<Object>} The created test object
 */
async function CreateTest(_, { test_input }) {
  try {
    // *************** Validate Input
    TestValidators.ValidateCreateUpdateTestParameters({ testInput: test_input });

    // *************** Verify subject exists
    const subject = await SubjectModel.findOne({ 
      _id: test_input.subject_id, 
      status: 'active' 
    }).lean();
    
    if (!subject) {
      throw new ApolloError('Subject not found or deleted', 'RESOURCE_NOT_FOUND');
    }

    // *************** Validate that total test weights for this subject don't exceed 1
    await TestValidators.ValidateTestWeight({
      subject_id: test_input.subject_id,
      weight: test_input.weight,
      TestModel
    });

    // *************** Create sanitized test object with only allowed fields
    const testData = {
      subject_id: test_input.subject_id,
      name: test_input.name,
      description: test_input.description,
      weight: test_input.weight,
      notations: test_input.notations,
      status: 'active',
      created_by: test_input.created_by || 'system',
      updated_by: test_input.updated_by || 'system'
    };

    // *************** Create Test
    const test = await TestModel.create(testData);
    
    // *************** Update the Subject's test_ids array to include this test
    await SubjectModel.findByIdAndUpdate(
      test.subject_id,
      { $addToSet: { test_ids: test._id } }
    );
    
    return test;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify(test_input),
      function_name: 'CreateTest',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing test
 *
 * @async
 * @function UpdateTest
 * @param {string} args.id - Test ID to update
 * @param {Object} args.test_input - Input containing updated test data
 * @param {string} [args.test_input.subject_id] - Updated subject ID
 * @param {string} [args.test_input.name] - Updated name
 * @param {string} [args.test_input.description] - Updated description
 * @param {number} [args.test_input.weight] - Updated weight
 * @param {Array<Object>} [args.test_input.notations] - Updated notations
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if test doesn't exist
 * @returns {Promise<Object>} The updated test object
 */
async function UpdateTest(_, { id, test_input }) {
  try {
    // *************** Validate Input
    TestValidators.ValidateCreateUpdateTestParameters({ id, testInput: test_input });

    // *************** Verify subject exists
    const subject = await SubjectModel.findOne({ 
      _id: test_input.subject_id, 
      status: 'active' 
    }).lean();
    
    if (!subject) {
      throw new ApolloError('Subject not found or deleted', 'RESOURCE_NOT_FOUND');
    }

    // *************** Get the original test to check for subject_id change
    const oldTest = await TestModel.findById(id).lean();
    if (!oldTest) {
      throw new ApolloError('Test not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Validate that total test weights for this subject don't exceed 1
    await TestValidators.ValidateTestWeight({
      subject_id: test_input.subject_id,
      weight: test_input.weight,
      test_id: id,
      TestModel
    });

    // *************** Create sanitized update object with only allowed fields
    const updateData = {
      subject_id: test_input.subject_id,
      name: test_input.name,
      description: test_input.description,
      weight: test_input.weight,
      notations: test_input.notations,
      updated_by: test_input.updated_by || 'system'
    };

    // *************** Update Test
    const test = await TestModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    
    // *************** Handle subject_id change if it has changed
    if (test.subject_id && oldTest.subject_id && !test.subject_id.equals(oldTest.subject_id)) {
      // *************** Remove test from old subject's test_ids
      await SubjectModel.findByIdAndUpdate(
        oldTest.subject_id,
        { $pull: { test_ids: test._id } }
      );
      
      // *************** Add test to new subject's test_ids
      await SubjectModel.findByIdAndUpdate(
        test.subject_id,
        { $addToSet: { test_ids: test._id } }
      );
    }

    return test;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify({ id, test_input }),
      function_name: 'UpdateTest',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a test by setting status to 'deleted'
 *
 * @async
 * @function DeleteTest
 * @param {string} args.id - Test ID to delete
 * @param {string} args.deleted_by - User ID performing the deletion
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if test doesn't exist
 * @throws {ApolloError} Throws 'ALREADY_DELETED' if test is already deleted
 * @returns {Promise<Object>} The deleted test object
 */
async function DeleteTest(_, { id, deleted_by }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Get the test first to check if it exists
    const test = await TestModel.findById(id).lean();
    if (!test) {
      throw new ApolloError('Test not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Check if test is already deleted
    if (test.status === 'deleted') {
      throw new ApolloError('Test is already deleted', 'ALREADY_DELETED');
    }

    // *************** Soft delete the test
    const updatedTest = await TestModel.findByIdAndUpdate(
      id,
      {
        status: 'deleted',
        deleted_at: new Date(),
        deleted_by
      }
    ).lean();
    
    // *************** Remove test from subject's test_ids array
    if (test.subject_id) {
      await SubjectModel.findByIdAndUpdate(
        test.subject_id,
        { $pull: { test_ids: test._id } }
      );
    }

    return updatedTest;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify({ id, deleted_by }),
      function_name: 'DeleteTest',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllTests,
    GetTestById,
  },
  Mutation: {
    CreateTest,
    UpdateTest,
    DeleteTest,
  }
};
