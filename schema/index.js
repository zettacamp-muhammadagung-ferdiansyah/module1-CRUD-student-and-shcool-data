// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** IMPORT MODULES ***************
const UserModule = require('../modules/user');
const StudentModule = require('../modules/student');
const SchoolModule = require('../modules/school');

// *************** QUERY
const BaseTypeDefs = gql`
  type Query { _: Boolean }
  type Mutation { _: Boolean }
`;

const TypeDefs = [
  BaseTypeDefs,
  UserModule.typeDefs,
  StudentModule.typeDefs,
  SchoolModule.typeDefs
];

const QueryResolvers = {
  ...UserModule.resolvers.Query,
  ...StudentModule.resolvers.Query,
  ...SchoolModule.resolvers.Query
};

// *************** MUTATION 
const MutationResolvers = {
  ...UserModule.resolvers.Mutation,
  ...StudentModule.resolvers.Mutation,
  ...SchoolModule.resolvers.Mutation
};

const Resolvers = {
  Query: QueryResolvers,
  Mutation: MutationResolvers,
  School: SchoolModule.resolvers.School
};

// *************** EXPORT MODULE ***************
module.exports = { 
  typeDefs: TypeDefs, 
  resolvers: Resolvers 
};
