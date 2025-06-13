// *************** IMPORT MODULE ***************
const StudentTypeDefs = require('./student.typedef');
const StudentResolvers = require('./student.resolver');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: StudentTypeDefs,
  resolvers: {
    Query: StudentResolvers.Query,
    Mutation: StudentResolvers.Mutation
  }
};
