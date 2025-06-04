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
 * @property {Date} deleted_at - Soft delete timestamp, null if active.
 *
 * @typedef {object} Query
 * @property {Student[]} Students - Retrieve all students.
 * @property {Student} Student - Retrieve a student by ID.
 *
 * @typedef {object} Mutation
 * @property {Student} CreateStudent - Create a new student.
 * @property {Student} UpdateStudent - Update an existing student.
 * @property {Student} DeleteStudent - Delete a student by ID.
 */
const StudentTypeDefs = gql`
  type Student {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: Date
    school_id: ID!
    deleted_at: Date
  }
  extend type Query {
    GetAllStudents: [Student]
    GetStudentById(id: ID!): Student
  }
  extend type Mutation {
    CreateStudent(first_name: String!, last_name: String!, email: String!, date_of_birth: Date, school_id: ID!): Student
    UpdateStudent(id: ID!, first_name: String, last_name: String, email: String, date_of_birth: Date, school_id: ID, deleted_at: Date): Student
    DeleteStudent(id: ID!): Student
  }
`;

// *************** EXPORT MODULE ***************
module.exports = StudentTypeDefs;
