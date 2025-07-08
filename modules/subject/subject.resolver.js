// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.model');
const BlockModel = require('../block/block.model');
const TestModel = require('../test/test.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

// *************** IMPORT VALIDATOR ***************
const SubjectValidators = require('./subject.validator');
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');
const { ValidatePaginationParameters } = require('../../utils/validator/pagination.validator');

// *************** QUERY ***************
/**
 * Retrieves a paginated list of active subjects.
 *
 * @async
 * @function GetAllSubjects
 * @param {number} args.page - Page number for pagination (0-based, where 0 is the first page)
 * @param {number} args.limit - Number of subjects per page
 * @throws {ApolloError} If query fails or pagination parameters are invalid
 * @returns {Promise<Object>} Paginated result with subjects data, total count, page, and limit
 */
async function GetAllSubjects(_, { page, limit }) {
  try {
    // *************** Validate pagination parameters
    ValidatePaginationParameters({ page, limit });

    // *************** Calculate skip value for pagination
    const skip = page * limit;


    // *************** Execute queries sequentially
    const subjects = await SubjectModel.find({ status: 'active' }).skip(skip).limit(limit).lean();

    // *************** Prepare paginated result
    const paginatedResult = {
      data: subjects,
      page,
      length: subjects.length,
    };

    // *************** Return paginated result
    return paginatedResult;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/subject/subject.resolver.js',
      parameter_input: JSON.stringify({ page, limit }),
      function_name: 'GetAllSubjects',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a single active subject by ID.
 *
 * @async
 * @function GetSubjectById
 * @param {string} args.id - MongoDB ObjectId of the subject to retrieve
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if subject doesn't exist or is not active
 * @returns {Promise<Object>} The subject object
 */
async function GetSubjectById(_, { id }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Find active subject by ID
    const subject = await SubjectModel.findOne({ _id: id, status: 'active' }).lean();
    if (!subject) {
      throw new ApolloError('Subject not found', 'RESOURCE_NOT_FOUND');
    }

    return subject;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/subject/subject.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetSubjectById',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new subject
 *
 * @async
 * @function CreateSubject
 * @param {Object} args.subject_input - Input containing subject data
 * @param {string} args.subject_input.block_id - ID of the block this subject belongs to
 * @param {string} args.subject_input.name - Name of the subject
 * @param {string} [args.subject_input.description] - Description of the subject
 * @param {number} args.subject_input.coefficient - Coefficient for score calculations
 * @param {Array<string>} [args.subject_input.test_ids] - Array of test IDs
 * @param {string} [args.subject_input.created_by] - User ID of creator
 * @throws {ApolloError} If validation fails or creation error occurs
 * @returns {Promise<Object>} The created subject object
 */
async function CreateSubject(_, { subject_input }) {
  try {
    // *************** Validate input parameters
    SubjectValidators.ValidateCreateSubjectParameters(subject_input);

    // *************** Verify block exists and is active
    const block = await BlockModel.findOne({
      _id: subject_input.block_id,
      status: 'active',
    }).lean();
    if (!block) {
      throw new ApolloError('Block not found or deleted', 'RESOURCE_NOT_FOUND');
    }

    // *************** Create sanitized subject object with only allowed fields
    const subjectData = {
      block_id: subject_input.block_id,
      name: subject_input.name,
      description: subject_input.description,
      coefficient: subject_input.coefficient,
      test_ids: subject_input.test_ids || [],
      status: 'active',
      created_by: subject_input.created_by,
    };

    // *************** Create Subject
    const subject = await SubjectModel.create(subjectData);

    // *************** Update the Block's subject_ids array to include this subject
    if (subject.block_id) {
      await BlockModel.findByIdAndUpdate(subject.block_id, { $addToSet: { subject_ids: subject._id } });
    }

    return subject;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/subject/subject.resolver.js',
      parameter_input: JSON.stringify(subject_input),
      function_name: 'CreateSubject',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing subject
 *
 * @async
 * @function UpdateSubject
 * @param {string} args.id - Subject ID to update
 * @param {Object} args.subject_input - Input containing updated subject data
 * @param {string} [args.subject_input.block_id] - Updated block ID
 * @param {string} [args.subject_input.name] - Updated name
 * @param {string} [args.subject_input.description] - Updated description
 * @param {number} [args.subject_input.coefficient] - Updated coefficient
 * @param {Array<string>} [args.subject_input.test_ids] - Updated test IDs
 * @param {string} [args.subject_input.updated_by] - User ID of updater
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if subject doesn't exist
 * @returns {Promise<Object>} The updated subject object
 */
async function UpdateSubject(_, { id, subject_input }) {
  try {
    // *************** Validate input parameters
    SubjectValidators.ValidateUpdateSubjectParameters({ id, subjectInput: subject_input });

    // *************** Verify block exists and is active
    const block = await BlockModel.findOne({
      _id: subject_input.block_id,
      status: 'active',
    }).lean();
    if (!block) {
      throw new ApolloError('Block not found or deleted', 'RESOURCE_NOT_FOUND');
    }

    // *************** Create sanitized update object with only allowed fields
    const updateData = {
      block_id: subject_input.block_id,
      name: subject_input.name,
      description: subject_input.description,
      coefficient: subject_input.coefficient,
      test_ids: subject_input.test_ids,
      updated_by: subject_input.updated_by,
      updatedAt: new Date(),
    };

    // *************** Find the old subject
    const oldSubject = await SubjectModel.findById(id).lean();
    if (!oldSubject) {
      throw new ApolloError('Subject not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Update Subject
    const subject = await SubjectModel.findByIdAndUpdate(id, updateData, { new: true }).lean();

    // *************** Update block's subject_ids if block_id has changed
    if (subject.block_id && oldSubject.block_id && !subject.block_id.equals(oldSubject.block_id)) {
      // ***************  Remove subject from old block
      await BlockModel.findByIdAndUpdate(oldSubject.block_id, { $pull: { subject_ids: subject._id } });

      // *************** Add subject to new block
      await BlockModel.findByIdAndUpdate(subject.block_id, { $addToSet: { subject_ids: subject._id } });
    } else if (subject.block_id && (!oldSubject.block_id || oldSubject.block_id === null)) {
      // *************** If subject didn't have a block_id before but now has one
      await BlockModel.findByIdAndUpdate(subject.block_id, { $addToSet: { subject_ids: subject._id } });
    }

    return subject;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/subject/subject.resolver.js',
      parameter_input: JSON.stringify({ id, subject_input }),
      function_name: 'UpdateSubject',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a subject by setting status to 'deleted'
 *
 * @async
 * @function DeleteSubject
 * @param {string} args.id - Subject ID to delete
 * @param {string} args.deleted_by - User ID performing the deletion
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if subject doesn't exist
 * @throws {ApolloError} Throws 'ALREADY_DELETED' if subject is already deleted
 * @returns {Promise<Object>} The deleted subject object
 */
async function DeleteSubject(_, { id, deleted_by }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Find the subject by id and ensure it is active
    const subject = await SubjectModel.findOne({ _id: id, status: 'active' }).lean();
    if (!subject) {
      throw new ApolloError('Subject not found or already deleted', 'RESOURCE_NOT_FOUND');
    }

    // *************** Soft delete the subject
    await SubjectModel.updateOne(
      { _id: id },
      {
        status: 'deleted',
        deleted_at: new Date(),
        deleted_by,
      }
    );

    // *************** Also soft delete all tests within the subject
    if (subject.test_ids && subject.test_ids.length) {
      await TestModel.updateMany(
        { _id: { $in: subject.test_ids }, status: 'active' },
        {
          $set: {
            status: 'deleted',
            deleted_at: new Date(),
            deleted_by,
          },
        }
      );
    }

    // *************** Remove subject from related block's subject_ids array
    if (subject.block_id) {
      await BlockModel.findByIdAndUpdate(subject.block_id, { $pull: { subject_ids: subject._id } });
    }

    return 'subject and its tests have been deleted';
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/subject/subject.resolver.js',
      parameter_input: JSON.stringify({ id, deleted_by }),
      function_name: 'DeleteSubject',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************
/**
 * Retrieves tests associated with a specific subject using DataLoader.
 *
 * @async
 * @function GetTestsBySubject
 * @param {Object} parent - The parent resolver object containing the subject data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of test documents
 */
async function GetTestsBySubject(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) {
      return [];
    }

    // ************** Return empty array if no test_ids are associated with the subject
    if (!parent.test_ids || !parent.test_ids.length) {
      return [];
    }

    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.TestLoader) {
      return [];
    }

    // ************** Use the TestLoader to load each test by ID
    const tests = await context.loaders.TestLoader.loadMany(parent.test_ids);
    return tests;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/subject/subject.resolver.js',
      parameter_input: JSON.stringify({ id: parent._id }),
      function_name: 'GetTestsBySubject',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Loads the user who created the subject using DataLoader.
 *
 * @async
 * @function CreatedByUser
 * @param {object} parent - The subject object.
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
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.created_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/subject/subject.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'CreatedByUser',
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(`Unable to load creator user: ${error.message}`, 'USER_FETCH_FAILED');
  }
}

/**
 * Loads the user who last updated the subject using DataLoader.
 *
 * @async
 * @function UpdatedByUser
 * @param {object} parent - The subject object.
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
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.updated_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/subject/subject.resolver.js',
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: 'UpdatedByUser',
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(`Unable to load updater user: ${error.message}`, 'USER_FETCH_FAILED');
  }
}

/**
 * Loads the user who deleted the subject using DataLoader.
 *
 * @async
 * @function DeletedByUser
 * @param {object} parent - The subject object.
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
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.deleted_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/subject/subject.resolver.js',
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
    GetAllSubjects,
    GetSubjectById,
  },
  Mutation: {
    CreateSubject,
    UpdateSubject,
    DeleteSubject,
  },
  Subject: {
    test_id: GetTestsBySubject,
    created_by: CreatedByUser,
    updated_by: UpdatedByUser,
    deleted_by: DeletedByUser,
  },
};
