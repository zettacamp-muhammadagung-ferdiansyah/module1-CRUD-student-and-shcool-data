// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** TYPE DEFINITIONS ***************
/**
 * GraphQL type definitions for User entity and related queries/mutations.
 *
 * @typedef {object} User
 * @property {ID} id - Unique identifier for the user.
 * @property {String} first_name - First name of the user.
 * @property {String} last_name - Last name of the user.
 * @property {String} email - Email address of the user.
 * @property {String} role - Role of the user (e.g., admin, student).
 * @property {Date} deleted_at - Soft delete timestamp, null if active.
 *
 * @typedef {object} Query
 * @property {User[]} Users - Retrieve all users.
 * @property {User} User - Retrieve a user by ID.
 *
 * @typedef {object} Mutation
 * @property {User} CreateUser - Create a new user.
 * @property {User} UpdateUser - Update an existing user.
 * @property {User} DeleteUser - Delete a user by ID.
 */
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
    Users: [User]
    User(id: ID!): User
  }
  extend type Mutation {
    CreateUser(first_name: String!, last_name: String!, email: String!, password: String!, role: String!): User
    UpdateUser(id: ID!, first_name: String, last_name: String, email: String, password: String, role: String, deleted_at: Date): User
    DeleteUser(id: ID!): User
  }
`;

// *************** EXPORT MODULE ***************
module.exports = UserTypeDefs;
