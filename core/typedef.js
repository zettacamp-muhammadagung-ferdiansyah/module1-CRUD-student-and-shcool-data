// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');
const { mergeTypeDefs } = require('@graphql-tools/merge');

// *************** IMPORT MODULES ***************
const UserModule = require('../modules/user');
const StudentModule = require('../modules/student');
const SchoolModule = require('../modules/school');
const BlockModule = require('../modules/block');
const SubjectModule = require('../modules/subject');
const TestModule = require('../modules/test');
const StudentTestResultModule = require('../modules/studentTestResult');
const TaskModule = require('../modules/task');

// *************** Base Type Declarations
const BaseTypeDefs = gql`
  type Query
  type Mutation
  scalar Date
`;

// *************** EXPORT MODULE ***************
module.exports = mergeTypeDefs([
  BaseTypeDefs,
  UserModule.typeDefs,
  StudentModule.typeDefs,
  SchoolModule.typeDefs,
  BlockModule.typeDefs,
  SubjectModule.typeDefs,
  TestModule.typeDefs,
  StudentTestResultModule.typeDefs,
  TaskModule.typeDefs
]);
