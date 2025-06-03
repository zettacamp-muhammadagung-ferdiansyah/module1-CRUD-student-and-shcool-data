// *************** IMPORT LIBRARY ***************
// Third-party libraries or packages used in this module.
const { gql } = require('apollo-server');
const { merge } = require('lodash');

// *************** IMPORT MODULE ***************
// Other internal modules this module depends on.
const userTypeDefs = require('../modules/user/user.typedef');
const userResolvers = require('../modules/user/user.resolver');
const studentTypeDefs = require('../modules/student/student.typedef');
const studentResolvers = require('../modules/student/student.resolver');
const schoolTypeDefs = require('../modules/school/school.typedef');
const schoolResolvers = require('../modules/school/school.resolver');
const schoolTypeResolvers = require('../modules/school/school.resolver').school;

// *************** TYPE DEFINITIONS ***************
// GraphQL type definitions combining all module schemas.

/**
 * Combines all GraphQL type definitions
 * Includes base scalar types and empty Query/Mutation types
 * @type {Array<DocumentNode>} Array of GraphQL type definitions
 */
const typeDefs = [
  // *************** START: Base schema definitions ***************
  gql`
    scalar Date
    type Query { _: Boolean }
    type Mutation { _: Boolean }
  `,
  userTypeDefs,
  studentTypeDefs,
  schoolTypeDefs,
  // *************** END: Base schema definitions ***************
];

// *************** RESOLVER CONFIGURATION ***************
// Combines all module resolvers into a single resolver map.

/**
 * Merges all module resolvers
 * Combines Query, Mutation, and Type resolvers from all modules
 * @type {Object} Combined GraphQL resolvers
 */
const resolvers = merge(
  {},
  // *************** START: Resolver combination ***************
  { 
    Query: { 
      ...userResolvers.Query, 
      ...studentResolvers.Query, 
      ...schoolResolvers.Query 
    } 
  },
  { 
    Mutation: { 
      ...userResolvers.Mutation, 
      ...studentResolvers.Mutation, 
      ...schoolResolvers.Mutation 
    } 
  },
  { School: schoolTypeResolvers }
  // *************** END: Resolver combination ***************
);

// *************** EXPORT MODULE ***************
// Final exports for the module's functionality.
module.exports = { 
  typeDefs, 
  resolvers 
};
