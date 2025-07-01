// *************** IMPORT MODULE ***************
const TestTypeDefs = require('./test.typedef');
const TestResolvers = require('./test.resolver');
const TestLoaderModule = require('./test.loader');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: TestTypeDefs,
  resolvers: {
    Query: TestResolvers.Query,
    Mutation: TestResolvers.Mutation,
    Test: TestResolvers.Test
  },
  TestLoader: TestLoaderModule.TestLoader
};
