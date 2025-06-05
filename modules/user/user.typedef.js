// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** TYPE DEFINITIONS ***************
const UserTypeDefs = gql`
  type User {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    role: String!
    deleted_at: Date
  }
  extend type Query {
    GetAllUsers: [User]
    GetUserById(id: ID!): User
  }
  extend type Mutation {
    CreateUser(first_name: String!, last_name: String!, email: String!, password: String!, role: String!): User
    UpdateUser(id: ID!, first_name: String, last_name: String, email: String, password: String, role: String, deleted_at: Date): User
    DeleteUser(id: ID!): User
  }
`;

// *************** EXPORT MODULE ***************
module.exports = UserTypeDefs;
