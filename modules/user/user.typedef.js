// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

/**
 * GraphQL type definitions for User entity and related queries/mutations.
 *
 * @typedef {object} User
 * @property {ID} id - Unique identifier for the user.
 * @property {String} first_name - First name of the user.
 * @property {String} last_name - Last name of the user.
 * @property {String} email - Email address of the user.
 * @property {String} role - Role of the user in the system.
 * @property {String} status - Status of the user ('active' or 'deleted').
 * @property {Date} deleted_at - Soft delete timestamp, null if active (deprecated).
 *
 * @typedef {object} Query
 * @property {User[]} GetAllUsers - Retrieve all users with optional filtering.
 * @property {User} GetUserById - Retrieve a user by ID.
 *
 * @typedef {object} Mutation
 * @property {User} CreateUser - Create a new user.
 * @property {User} UpdateUser - Update an existing user.
 * @property {User} DeleteUser - Delete a user by ID (sets status to 'deleted' and updates deleted_at).
 */
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
