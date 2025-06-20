// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const StudentTypeDefs = gql`
  type Student {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: String!
    school_id: ID!
    school: School
    status: StudentStatus
    deleted_at: Date
  }
  
  enum StudentStatus {
    active
    deleted
  }
  
  input CreateStudentInput {
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: String
    school_id: ID!
  }
  
  input UpdateStudentInput {
    first_name: String
    last_name: String
    email: String
    date_of_birth: String
    school_id: ID
  }
  
  extend type Query {
    GetAllStudents: [Student]
    GetStudentById(id: ID!): Student
  }
  extend type Mutation {
    CreateStudent(student_input: CreateStudentInput!): Student
    UpdateStudent(id: ID!, student_input: UpdateStudentInput!): Student
    DeleteStudent(id: ID!): Student
  }
`;

// *************** EXPORT MODULE ***************
module.exports = StudentTypeDefs;
