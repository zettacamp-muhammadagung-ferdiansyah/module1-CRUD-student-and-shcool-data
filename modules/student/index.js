// *************** IMPORT MODULE ***************
const StudentTypeDefs = require('./student.typedef');
const StudentResolvers = require('./student.resolver');
const { StudentLoader, StudentsBySchoolLoader } = require('./student.loader');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: StudentTypeDefs,
  resolvers: {
    Query: StudentResolvers.Query,
    Mutation: StudentResolvers.Mutation
  },
  StudentLoader
};
