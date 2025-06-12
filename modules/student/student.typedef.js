// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

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
