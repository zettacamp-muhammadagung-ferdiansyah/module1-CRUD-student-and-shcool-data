// User GraphQL typeDefs
const { gql } = require('apollo-server');

const userTypeDefs = gql`
  type User {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    role: String!
    deleted_at: Date
  }
  extend type Query {
    Users: [User]
    User(id: ID!): User
  }
  extend type Mutation {
    CreateUser(first_name: String!, last_name: String!, email: String!, password: String!, role: String!): User
    UpdateUser(id: ID!, first_name: String, last_name: String, email: String, password: String, role: String, deleted_at: Date): User
    DeleteUser(id: ID!): User
  }
`;

module.exports = userTypeDefs;
