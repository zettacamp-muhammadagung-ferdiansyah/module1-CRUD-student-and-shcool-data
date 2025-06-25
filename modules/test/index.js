// *************** IMPORT MODULE ***************
const TestTypeDefs = require('./test.typedef');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: TestTypeDefs,
  resolvers: {
    Query: {},
    Mutation: {}
  }
};
