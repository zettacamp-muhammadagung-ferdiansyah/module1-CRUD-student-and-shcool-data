// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');
const { mergeResolvers } = require('@graphql-tools/merge');

// *************** IMPORT MODULES ***************
const UserModule = require('../modules/user');
const StudentModule = require('../modules/student');
const SchoolModule = require('../modules/school');

// *************** QUERY
const BaseTypeDefs = gql`
  type Query
  type Mutation
`;

// *************** TYPEDEFS
const TypeDefs = [
  BaseTypeDefs,
  UserModule.typeDefs,
  StudentModule.typeDefs,
  SchoolModule.typeDefs
];

// *************** RESOLVERS

const Resolvers = mergeResolvers([
  UserModule.resolvers,
  StudentModule.resolvers,
  SchoolModule.resolvers
]);

// *************** EXPORT MODULE ***************
module.exports = { 
  typeDefs: TypeDefs, 
  resolvers: Resolvers 
};
