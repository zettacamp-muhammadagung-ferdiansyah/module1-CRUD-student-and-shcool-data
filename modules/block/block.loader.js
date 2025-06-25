// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for Block documents.
 * This loader efficiently fetches blocks by their IDs in batches to reduce database queries.
 * Only active blocks are returned; soft-deleted blocks will return null.
 *
 * @function BlockLoader
 * @returns {DataLoader} A configured DataLoader instance for Block documents
 */
function BlockLoader() {
  return new DataLoader(async (blockIds) => {
    try {
      // *************** Query for active blocks with IDs in the provided array
      const blocks = await BlockModel.find({ 
        _id: { $in: blockIds }, 
        status: 'active' 
      }).lean();

      // *************** Map results back to the original ID order
      const blockMap = {};
      blocks.forEach(block => {
        blockMap[block._id.toString()] = block;
      });

      // *************** Return blocks in the same order as the input IDs
      return blockIds.map(id => blockMap[id.toString()] || null);
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/block/block.loader.js',
        parameter_input: JSON.stringify({ blockIds }),
        function_name: 'BlockLoader',
        error: String(error.stack),
      });
      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load blocks: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  BlockLoader
};
