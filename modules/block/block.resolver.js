// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

// *************** IMPORT VALIDATOR ***************
const BlockValidators = require('./block.validator');
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

// *************** QUERY ***************
/**
 * Retrieves a paginated list of active blocks.
 *
 * @async
 * @function GetAllBlocks
 * @param {number} args.page - Page number for pagination (0-based, where 0 is the first page)
 * @param {number} args.limit - Number of blocks per page
 * @throws {ApolloError} If query fails or pagination parameters are invalid
 * @returns {Promise<Object>} Paginated result with blocks data, total count, page, and limit
 */
async function GetAllBlocks(_, { page, limit }) {
  try {
    // *************** Validate pagination parameters
    BlockValidators.ValidatePaginationParameters({ page, limit });

    // *************** Calculate skip value for pagination
    const skip = page * limit;

    // *************** Execute queries sequentially 
    const blocks = await BlockModel.find({ status: 'active' })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await BlockModel.countDocuments({ status: 'active' });

    // *************** Return paginated result
    return {
      data: blocks,
      total,
      page,
      limit
    };
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/block/block.resolver.js',
      parameter_input: JSON.stringify({ page, limit }),
      function_name: 'GetAllBlocks',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a single active block by ID.
 *
 * @async
 * @function GetBlockById
 * @param {string} args.id - MongoDB ObjectId of the block to retrieve
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if block doesn't exist or is not active
 * @returns {Promise<Object>} The block object
 */
async function GetBlockById(_, { id }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Find active block by ID
    const block = await BlockModel.findOne({ _id: id, status: 'active' }).lean();
    if (!block) {
      throw new ApolloError('Block not found', 'RESOURCE_NOT_FOUND');
    }

    return block;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/block/block.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetBlockById',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new block
 *
 * @async
 * @function CreateBlock
 * @param {Object} args.block_input - Input containing block data
 * @param {string} args.block_input.name - Name of the block (required)
 * @param {string} [args.block_input.description] - Description of the block
 * @param {Array<string>} [args.block_input.subject_ids] - Array of subject IDs
 * @param {string} [args.block_input.created_by] - User ID of creator
 * @throws {ApolloError} If validation fails or creation error occurs
 * @returns {Promise<Object>} The created block object
 */
async function CreateBlock(_, { block_input }) {
  try {
    // *************** Validate Input
    BlockValidators.ValidateCreateUpdateBlockParameters({ blockInput: block_input });

    // *************** Create sanitized block object with only allowed fields
    const blockData = {
      name: block_input.name,
      description: block_input.description,
      subject_ids: block_input.subject_ids || [],
      status: 'active'
    };

    // *************** Add optional fields if they exist
    if (block_input.created_by) blockData.created_by = block_input.created_by;
    if (block_input.updated_by) blockData.updated_by = block_input.updated_by;

    // *************** Create Block
    const block = await BlockModel.create(blockData);
    return block;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/block/block.resolver.js',
      parameter_input: JSON.stringify(block_input),
      function_name: 'CreateBlock',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing block
 *
 * @async
 * @function UpdateBlock
 * @param {string} args.id - Block ID to update
 * @param {Object} args.block_input - Input containing updated block data
 * @param {string} [args.block_input.name] - Updated name
 * @param {string} [args.block_input.description] - Updated description
 * @param {Array<string>} [args.block_input.subject_ids] - Updated subject IDs
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if block doesn't exist
 * @returns {Promise<Object>} The updated block object
 */
async function UpdateBlock(_, { id, block_input }) {
  try {
    // *************** Validate Input
    BlockValidators.ValidateCreateUpdateBlockParameters({ id, blockInput: block_input });

    // *************** Create sanitized update object with only allowed fields
    const updateData = {
      name: block_input.name,
      description: block_input.description,
      subject_ids: block_input.subject_ids
    };

    // *************** Add optional fields if they exist
    if (block_input.updated_by) updateData.updated_by = block_input.updated_by;
    updateData.updated_at = new Date();

    // *************** Update Block
    const block = await BlockModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!block) {
      throw new ApolloError('Block not found', 'RESOURCE_NOT_FOUND');
    }

    return block;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/block/block.resolver.js',
      parameter_input: JSON.stringify({ id, block_input }),
      function_name: 'UpdateBlock',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a block by setting status to 'deleted'
 *
 * @async
 * @function DeleteBlock
 * @param {string} args.id - Block ID to delete
 * @param {string} args.deleted_by - User ID performing the deletion
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if block doesn't exist
 * @throws {ApolloError} Throws 'ALREADY_DELETED' if block is already deleted
 * @returns {Promise<Object>} The deleted block object
 */
async function DeleteBlock(_, { id, deleted_by }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Get the block first to check if it exists
    const block = await BlockModel.findById(id).lean();
    if (!block) {
      throw new ApolloError('Block not found', 'RESOURCE_NOT_FOUND');
    }

    // *************** Check if block is already deleted
    if (block.status === 'deleted') {
      throw new ApolloError('Block is already deleted', 'ALREADY_DELETED');
    }

    // *************** Soft delete the block
    await BlockModel.findByIdAndUpdate(
      id,
      {
        status: 'deleted',
        deleted_at: new Date(),
        deleted_by
      }
    ).lean();

    return block;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/block/block.resolver.js',
      parameter_input: JSON.stringify({ id, deleted_by }),
      function_name: 'DeleteBlock',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** LOADER *************** 
/**
 * Retrieves subjects associated with a specific block using DataLoader.
 *
 * @async
 * @function GetSubjectsByBlock
 * @param {Object} parent - The parent resolver object containing the block data
 * @param {Object} _ - The arguments (unused)
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of subject documents
 */
async function GetSubjectsByBlock(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) {
      return [];
    }
    
    // ************** Return empty array if no subject_ids are associated with the block
    if (!parent.subject_ids || !parent.subject_ids.length) {
      return [];
    }
    
    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.SubjectLoader) {
      console.error('SubjectLoader is not available in the context');
      return [];
    }
    
    //************** Use the SubjectLoader to load each subject by ID
    const subjects = await context.loaders.SubjectLoader.loadMany(parent.subject_ids);
    return subjects;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/block/block.resolver.js',
      parameter_input: JSON.stringify({ id: parent._id }),
      function_name: 'GetSubjectsByBlock',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllBlocks,
    GetBlockById,
  },
  Mutation: {
    CreateBlock,
    UpdateBlock,
    DeleteBlock,
  },
  Block: {
    subjects: GetSubjectsByBlock,
  },
};
