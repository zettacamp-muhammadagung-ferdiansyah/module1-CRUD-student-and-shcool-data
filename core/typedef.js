// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');
const { mergeTypeDefs } = require('@graphql-tools/merge');

// *************** IMPORT MODULES ***************
const UserModule = require('../modules/user');
const StudentModule = require('../modules/student');
const SchoolModule = require('../modules/school');

// *************** Base Type Declarations
// *************** These empty root type definitions are REQUIRED when using 'extend type' in the modules
// *************** Without these declarations, Apollo Server would throw an error: "Cannot extend type Query because it is not defined"
// *************** Each module uses 'extend type Query' and 'extend type Mutation' which requires these base types to exist first
const BaseTypeDefs = gql`
  type Query
  type Mutation
`;

// *************** EXPORT MODULE ***************
module.exports = mergeTypeDefs([
  BaseTypeDefs,
  UserModule.typeDefs,
  StudentModule.typeDefs,
  SchoolModule.typeDefs
]);
