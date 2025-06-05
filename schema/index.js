// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');
const { merge } = require('lodash');

// *************** IMPORT MODULE ***************
const UserTypeDefs = require('../modules/user/user.typedef');
const UserResolvers = require('../modules/user/user.resolver');
const StudentTypeDefs = require('../modules/student/student.typedef');
const StudentResolvers = require('../modules/student/student.resolver');
const SchoolTypeDefs = require('../modules/school/school.typedef');
const SchoolResolvers = require('../modules/school/school.resolver');
const SchoolTypeResolvers = require('../modules/school/school.resolver').school;

// *************** BASE TYPE DEFINITIONS ***************
/**
 * Main GraphQL schema configuration that combines all type definitions and resolvers
 * @module Schema
 */
const BaseTypeDefs = gql`
  scalar Date
  type Query { _: Boolean }
  type Mutation { _: Boolean }
`;

// *************** COMBINED TYPE DEFINITIONS ***************
const TypeDefs = [
  BaseTypeDefs,
  UserTypeDefs,
  StudentTypeDefs,
  SchoolTypeDefs
];

// *************** QUERY RESOLVERS ***************
const QueryResolvers = {
  ...UserResolvers.Query,
  ...StudentResolvers.Query,
  ...SchoolResolvers.Query
};

// *************** MUTATION RESOLVERS ***************
const MutationResolvers = {
  ...UserResolvers.Mutation,
  ...StudentResolvers.Mutation,
  ...SchoolResolvers.Mutation
};

// *************** COMBINED RESOLVERS ***************
const Resolvers = {
  Query: QueryResolvers,
  Mutation: MutationResolvers,
  School: SchoolTypeResolvers
};

// *************** EXPORT MODULE ***************
module.exports = { 
  typeDefs: TypeDefs, 
  resolvers: Resolvers 
};
