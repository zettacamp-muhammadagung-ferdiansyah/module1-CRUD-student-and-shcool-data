// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

/**
 * GraphQL type definitions for Student entity and related queries/mutations.
 *
 * @typedef {object} Student
 * @property {ID} id - Unique identifier for the student.
 * @property {String} first_name - First name of the student.
 * @property {String} last_name - Last name of the student.
 * @property {String} email - Email address of the student.
 * @property {Date} date_of_birth - Date of birth of the student.
 * @property {ID} school_id - ID of the school the student is enrolled in.
 * @property {String} status - Status of the student ('active' or 'deleted').
 * @property {Date} deleted_at - Soft delete timestamp, null if active (deprecated).
 *
 * @typedef {object} Query
 * @property {Student[]} GetAllStudents - Retrieve all students with optional filtering.
 * @property {Student} GetStudentById - Retrieve a student by ID.
 *
 * @typedef {object} Mutation
 * @property {Student} CreateStudent - Create a new student.
 * @property {Student} UpdateStudent - Update an existing student.
 * @property {Student} DeleteStudent - Delete a student by ID (sets status to 'deleted' and updates deleted_at).
 */
const StudentTypeDefs = gql`
  type Student {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: String
    school_id: ID!
    status: StudentStatus
    deleted_at: String
  }
  
  enum StudentStatus {
    active
    deleted
  }
  
  input StudentFilter {
    name: String
    status: StudentStatus
    school_id: ID
  }
  
  extend type Query {
    GetAllStudents(filter: StudentFilter): [Student]
    GetStudentById(id: ID!): Student
  }
  extend type Mutation {
    CreateStudent(first_name: String!, last_name: String!, email: String!, date_of_birth: String, school_id: ID!): Student
    UpdateStudent(id: ID!, first_name: String, last_name: String, email: String, date_of_birth: String, school_id: ID, status: StudentStatus): Student
    DeleteStudent(id: ID!): Student
  }
`;

// *************** EXPORT MODULE ***************
module.exports = StudentTypeDefs;
