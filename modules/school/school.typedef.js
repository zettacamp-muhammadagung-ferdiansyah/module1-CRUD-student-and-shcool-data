// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** TYPE DEFINITIONS ***************
/**
 * GraphQL type definitions for School entity and related queries/mutations.
 *
 * @typedef {object} School
 * @property {ID} id - Unique identifier for the school.
 * @property {String} name - Name of the school.
 * @property {String} address - Address of the school.
 * @property {Student[]} students - List of students enrolled in the school.
 * @property {Date} deleted_at - Soft delete timestamp, null if active.
 *
 * @typedef {object} Query
 * @property {School[]} Schools - Retrieve all schools.
 * @property {School} School - Retrieve a school by ID.
 *
 * @typedef {object} Mutation
 * @property {School} CreateSchool - Create a new school.
 * @property {School} UpdateSchool - Update an existing school.
 * @property {School} DeleteSchool - Delete a school by ID.
 */
const SchoolTypeDefs = gql`
  type School {
    id: ID!
    name: String!
    address: String
    students: [Student]
    deleted_at: Date
  }
  extend type Query {
    Schools: [School]
    School(id: ID!): School
  }
  extend type Mutation {
    CreateSchool(name: String!, address: String): School
    UpdateSchool(id: ID!, name: String, address: String, deleted_at: Date): School
    DeleteSchool(id: ID!): School
  }
`;

// *************** EXPORT MODULE ***************
module.exports = SchoolTypeDefs;
