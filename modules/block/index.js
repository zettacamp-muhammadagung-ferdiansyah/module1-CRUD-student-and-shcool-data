// *************** IMPORT MODULE ***************
const BlockTypeDefs = require('./block.typedef');
const BlockResolvers = require('./block.resolver');
const BlockLoaderModule = require('./block.loader');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: BlockTypeDefs,
  resolvers: {
    Query: BlockResolvers.Query,
    Mutation: BlockResolvers.Mutation,
    Block: BlockResolvers.Block
  },
  BlockLoader: BlockLoaderModule.BlockLoader
};
