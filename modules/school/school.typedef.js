// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

/**
 * GraphQL type definitions for School entity and related queries/mutations.
 *
 * @typedef {object} School
 * @property {ID} id - Unique identifier for the school.
 * @property {String} name - Name of the school.
 * @property {String} address - Address of the school.
 * @property {Student[]} students - List of students enrolled in the school.
 * @property {String} status - Status of the school ('active' or 'deleted').
 * @property {Date} deleted_at - Soft delete timestamp, null if active (deprecated).
 *
 * @typedef {object} Query
 * @property {School[]} Schools - Retrieve all schools.
 * @property {School} School - Retrieve a school by ID.
 *
 * @typedef {object} Mutation
 * @property {School} CreateSchool - Create a new school.
 * @property {School} UpdateSchool - Update an existing school.
 * @property {School} DeleteSchool - Delete a school by ID (sets status to 'deleted' and updates deleted_at).
 */
const SchoolTypeDefs = gql`
  type School {
    id: ID!
    name: String!
    address: String
    students: [Student]
    status: SchoolStatus
    deleted_at: String
  }
  
  enum SchoolStatus {
    active
    deleted
  }
  
  input SchoolFilter {
    name: String
    status: SchoolStatus
    hasStudents: Boolean
  }
  
  extend type Query {
    GetAllSchools(filter: SchoolFilter): [School]
    GetSchoolById(id: ID!): School
  }
  extend type Mutation {
    CreateSchool(name: String!, address: String): School
    UpdateSchool(id: ID!, name: String, address: String, status: SchoolStatus): School
    DeleteSchool(id: ID!): School
  }
`;

// *************** EXPORT MODULE ***************
module.exports = SchoolTypeDefs;
