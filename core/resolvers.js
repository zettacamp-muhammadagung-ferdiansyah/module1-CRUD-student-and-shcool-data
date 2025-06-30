// *************** IMPORT LIBRARY ***************
const { mergeResolvers } = require('@graphql-tools/merge');

// *************** IMPORT MODULE ***************
const UserModule = require('../modules/user');
const StudentModule = require('../modules/student');
const SchoolModule = require('../modules/school');
const BlockModule = require('../modules/block');
const SubjectModule = require('../modules/subject');
const TestModule = require('../modules/test');
const StudentTestResultModule = require('../modules/studentTestResult');
const TaskModule = require('../modules/task');

// *************** EXPORT MODULE ***************
module.exports = mergeResolvers([
  UserModule.resolvers,
  StudentModule.resolvers,
  SchoolModule.resolvers,
  BlockModule.resolvers,
  SubjectModule.resolvers,
  TestModule.resolvers,
  StudentTestResultModule.resolvers,
  TaskModule.resolvers
]);
