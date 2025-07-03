// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.model');
const SubjectModel = require('../subject/subject.model');
const TaskModel = require('../task/task.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

// *************** IMPORT VALIDATOR ***************
const TestValidators = require('./test.validator');
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');
const { ValidatePaginationParameters } = require('../../utils/validator/pagination.validator');

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
    ValidatePaginationParameters({ page, limit });

    // *************** Calculate skip value for pagination
    const skip = page * limit;

    // *************** Execute queries sequentially 
    const tests = await TestModel.find({ test_status: 'active' })
      .skip(skip)
      .limit(limit)
      .lean();

    // *************** Return paginated result
    return {
      data: tests,
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
    const test = await TestModel.findOne({ _id: id, test_status: 'active' }).lean();
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
    // *************** Create sanitized test object with only allowed fields
    const testData = {
      subject_id: test_input.subject_id,
      name: test_input.name,
      description: test_input.description,
      weight: test_input.weight,
      notations: test_input.notations,
      test_status: 'active',
      created_by: test_input.created_by,
      updated_by: test_input.updated_by
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
    // *************** Create sanitized update object with only allowed fields
    const updateData = {
      subject_id: test_input.subject_id,
      name: test_input.name,
      description: test_input.description,
      weight: test_input.weight,
      notations: test_input.notations,
      updated_by: test_input.updated_by
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
    if (test.test_status === 'DELETED') {
      throw new ApolloError('Test is already deleted', 'ALREADY_DELETED');
    }

    // *************** Soft delete the test
    await TestModel.updateOne(
      { _id: id },
      {
        test_status: 'DELETED',
        deleted_at: new Date(),
        deleted_by
      }
    );
    
    // *************** Remove test from subject's test_ids array
    if (test.subject_id) {
      await SubjectModel.findByIdAndUpdate(
        test.subject_id,
        { $pull: { test_ids: test._id } }
      );
    }
    // *************** Return deleted
  return  "test has been deleted"
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

/**
 * Publishes a test and assigns a corrector by creating an ASSIGN_CORRECTOR task.
 *
 * This function performs the following steps:
 * 1. Validates the test ID and user ID
 * 2. Updates the test status from "active" to "PUBLISHED" and sets `published_date`
 * 3. Creates a new task of type `ASSIGN_CORRECTOR` with `PROGRESS` status for the corrector
 *
 * @async
 * @function PublishTest
 * @param {string} args.id - The ID of the test to publish
 * @param {object} args.input - The input payload
 * @param {string} args.input.user_id - The ID of the user to be assigned as corrector
 * @param {string} [args.input.due_date] - Optional due date for the corrector's task
 * @returns {Promise<{ id: string }>} - Returns an object containing the published test ID
 * @throws {ApolloError} - Throws an error if validation or any DB operation fails
 */
async function PublishTest(_, { id, input }) { //perlu validate input
  try {
    // *************** Validate input for PublishTest
    ValidateMongoId(id);
    TestValidators.ValidatePublishTestInput(input);

    // *************** Find and validate test
    const test = await TestModel.findOne({ 
      _id: id,
      test_status: 'active'
    }).lean();

    if (!test) {
      throw new ApolloError('Test not found or not in active status', 'RESOURCE_NOT_FOUND');
    }

    // *************** Update Test to Published status
    const publishResult = await TestModel.updateOne(
      { _id: id, test_status: 'active' },
      { 
        $set: { 
          test_status: 'PUBLISHED',
          published_date: new Date(),
          updated_by: input.user_id,
          updated_at: new Date()
        }
      }
    );

    if (!publishResult || publishResult.modifiedCount === 0) {
      throw new ApolloError('Failed to publish test', 'INTERNAL_SERVER_ERROR');
    }

    // *************** Prepare and create assign corrector task 
    const assignCorrectorPayload = {
      test_id: id,
      user_id: input.user_id,
      task_type: 'ASSIGN_CORRECTOR',
      task_status: 'ACTIVE',
      due_date: input.due_date ? new Date(input.due_date) : null,
      created_by: input.user_id,
      updated_by: input.user_id,
      title: input.title,
      description: input.description
    };

    const task = await TaskModel.create(assignCorrectorPayload);
    if (!task) {
      throw new ApolloError('Failed to create assign corrector task', 'TASK_CREATION_FAILED');
    }

    // *************** Return the full Test object
    const updatedTest = await TestModel.findById(id).lean();
    return updatedTest;

  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify({ id, input }),
      function_name: 'PublishTest',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************
/**
 * Retrieves the subject associated with a specific test using DataLoader.
 *
 * @async
 * @function GetSubjectByTest
 * @param {Object} parent - The parent resolver object containing the test data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object|null>} A promise that resolves to the subject document or null if not found
 */
async function GetSubjectByTest(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) {
      return null;
    }
    // ************** Return null if no subject_id is associated with the test
    if (!parent.subject_id) {
      return null;
    }
    // *************** Ensure SubjectLoader is available in context
    if (!context.loaders || !context.loaders.SubjectLoader) {
      console.error('SubjectLoader is not available in the context');
      return null;
    }
    // *************** Load the subject using DataLoader for efficient batching and caching
    const subject = await context.loaders.SubjectLoader.load(parent.subject_id);
    return subject;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify({ id: parent._id }),
      function_name: 'GetSubjectByTest',
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Loads the user who created the test using DataLoader.
 *
 * @async
 * @function CreatedByUser
 * @param {object} parent - The test object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function CreatedByUser(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) return null;
    // ************** Return null if no created_by is associated
    if (!parent.created_by) return null;
    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      console.error('UserLoader is not available in the context');
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.created_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'CreatedByUser',
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(`Unable to load creator user: ${error.message}`, 'USER_FETCH_FAILED');
  }
}

/**
 * Loads the user who last updated the test using DataLoader.
 *
 * @async
 * @function UpdatedByUser
 * @param {object} parent - The test object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function UpdatedByUser(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) return null;
    // ************** Return null if no updated_by is associated
    if (!parent.updated_by) return null;
    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      console.error('UserLoader is not available in the context');
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.updated_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'UpdatedByUser',
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(`Unable to load updater user: ${error.message}`, 'USER_FETCH_FAILED');
  }
}

/**
 * Loads the user who deleted the test using DataLoader.
 *
 * @async
 * @function DeletedByUser
 * @param {object} parent - The test object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function DeletedByUser(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) return null;
    // ************** Return null if no deleted_by is associated
    if (!parent.deleted_by) return null;
    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      console.error('UserLoader is not available in the context');
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.deleted_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/test/test.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'DeletedByUser',
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(`Unable to load deleter user: ${error.message}`, 'USER_FETCH_FAILED');
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
    PublishTest
  },
  Test: {
    subject: GetSubjectByTest,
    created_by: CreatedByUser,
    updated_by: UpdatedByUser,
    deleted_by: DeletedByUser,
  }
};
