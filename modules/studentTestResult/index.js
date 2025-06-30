// *************** IMPORT MODULE ***************
const StudentTestResultTypeDefs = require('./student_test_result.typedef');
const StudentTestResultResolvers = require('./student_test_result.resolver');
const StudentTestResultLoaderModule = require('./student_test_result.loader');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: StudentTestResultTypeDefs,
  resolvers: {
    Query: StudentTestResultResolvers.Query,
    Mutation: StudentTestResultResolvers.Mutation,
    StudentTestResult: StudentTestResultResolvers.StudentTestResult
  },
  StudentTestResultLoader: StudentTestResultLoaderModule.StudentTestResultLoader
};
