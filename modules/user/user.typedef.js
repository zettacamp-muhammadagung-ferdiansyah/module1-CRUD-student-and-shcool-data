// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const UserTypeDefs = gql`
  type User {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    role: String!
    status: UserStatus
    deleted_at: String
  }
  
  enum UserStatus {
    active
    deleted
  }
  
  input CreateUserInput {
    first_name: String!
    last_name: String!
    email: String!
    password: String!
    role: String!
  }
  
  input UpdateUserInput {
    first_name: String
    last_name: String
    email: String
    password: String
    role: String
  }
  
  extend type Query {
    GetAllUsers: [User]
    GetUserById(id: ID!): User
  }
  extend type Mutation {
    CreateUser(user_input: CreateUserInput!): User
    UpdateUser(id: ID!, user_input: UpdateUserInput!): User
    DeleteUser(id: ID!): User
  }
`;

// *************** EXPORT MODULE ***************
module.exports = UserTypeDefs;
