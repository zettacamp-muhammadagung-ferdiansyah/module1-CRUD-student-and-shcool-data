// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');
const { mergeTypeDefs } = require('@graphql-tools/merge');

// *************** IMPORT MODULES ***************
const UserModule = require('../modules/user');
const StudentModule = require('../modules/student');
const SchoolModule = require('../modules/school');

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
  SchoolModule.typeDefs
]);
