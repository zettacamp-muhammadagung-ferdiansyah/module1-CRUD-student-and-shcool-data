// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** IMPORT MODULES ***************
const UserModule = require('../modules/user');
const StudentModule = require('../modules/student');
const SchoolModule = require('../modules/school');

// *************** QUERY
const BaseTypeDefs = gql`
  type Query
  type Mutation
`;

const TypeDefs = [
  BaseTypeDefs,
  UserModule.typeDefs,
  StudentModule.typeDefs,
  SchoolModule.typeDefs
];

// *************** RESOLVERS
const Resolvers = {
  Query: Object.assign({},
    UserModule.resolvers.Query,
    StudentModule.resolvers.Query,
    SchoolModule.resolvers.Query
  ),
  Mutation: Object.assign({},
    UserModule.resolvers.Mutation,
    StudentModule.resolvers.Mutation,
    SchoolModule.resolvers.Mutation
  ),
  School: SchoolModule.resolvers.School
};

// *************** EXPORT MODULE ***************
module.exports = { 
  typeDefs: TypeDefs, 
  resolvers: Resolvers 
};
