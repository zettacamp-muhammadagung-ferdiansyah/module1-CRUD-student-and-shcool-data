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
  
  input UserFilter {
    name: String
    status: UserStatus
    role: String
  }
  
  extend type Query {
    GetAllUsers(filter: UserFilter): [User]
    GetUserById(id: ID!): User
  }
  extend type Mutation {
    CreateUser(first_name: String!, last_name: String!, email: String!, password: String!, role: String!): User
    UpdateUser(id: ID!, first_name: String, last_name: String, email: String, password: String, role: String, status: UserStatus): User
    DeleteUser(id: ID!): User
  }
`;

// *************** EXPORT MODULE ***************
module.exports = UserTypeDefs;
