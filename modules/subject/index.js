// *************** IMPORT MODULE ***************
const SubjectTypeDefs = require('./subject.typedef');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: SubjectTypeDefs,
  resolvers: {
    Query: {},
    Mutation: {}
  }
};
