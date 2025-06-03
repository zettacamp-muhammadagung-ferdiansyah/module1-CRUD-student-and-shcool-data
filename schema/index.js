// Combines all typeDefs and resolvers from modules
const { gql } = require('apollo-server');
const { merge } = require('lodash');
const userTypeDefs = require('../modules/user/user.typedef');
const userResolvers = require('../modules/user/user.resolver');
const studentTypeDefs = require('../modules/student/student.typedef');
const studentResolvers = require('../modules/student/student.resolver');
const schoolTypeDefs = require('../modules/school/school.typedef');
const schoolResolvers = require('../modules/school/school.resolver');
const schoolTypeResolvers = require('../modules/school/school.resolver').school;

const typeDefs = [
  gql`
    scalar Date
    type Query { _: Boolean }
    type Mutation { _: Boolean }
  `,
  userTypeDefs,
  studentTypeDefs,
  schoolTypeDefs,
];

const resolvers = merge(
  {},
  { Query: { ...userResolvers.Query, ...studentResolvers.Query, ...schoolResolvers.Query } },
  { Mutation: { ...userResolvers.Mutation, ...studentResolvers.Mutation, ...schoolResolvers.Mutation } },
  { School: schoolTypeResolvers } // Use PascalCase to match typeDefs
);

module.exports = { typeDefs, resolvers };
