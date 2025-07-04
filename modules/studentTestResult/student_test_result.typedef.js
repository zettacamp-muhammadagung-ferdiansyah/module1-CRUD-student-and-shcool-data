// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const StudentTestResultTypeDefs = gql`
  enum StudentTestResultStatus {
    ACTIVE
    VALIDATED
    DELETED
  }

  type Mark {
    notation_text: String!
    mark: Float!
  }

  input MarkInput {
    notation_text: String!
    mark: Float!
  }

  type StudentTestResult {
    _id: ID!
    student_id: ID!
    test_id: ID!
    marks: [Mark!]!
    average_mark: Float!
    mark_entry_date: Date!
    student_test_result_status: StudentTestResultStatus!
    created_by: User
    updated_by: User
    deleted_by: User
    deleted_at: Date
    createdAt: Date
    updatedAt: Date
    student: Student
    test: Test
  }


input CreateStudentTestResultInput {
  student_id: ID!
  test_id: ID!
  marks: [MarkInput!]!
  created_by: ID!
  due_date: Date
}

input UpdateStudentTestResultInput {
  student_id: ID!
  test_id: ID!
  marks: [MarkInput!]!
  updated_by: ID!
  due_date: Date
}

  type PaginatedStudentTestResult {
    data: [StudentTestResult]
    page: Int
    length: Int
  }

  extend type Query {
    GetAllStudentTestResults(page: Int!, limit: Int!): PaginatedStudentTestResult
    GetStudentTestResultById(id: ID!): StudentTestResult
    GetStudentTestResultsByStudent(student_id: ID!, page: Int!, limit: Int!): PaginatedStudentTestResult
    GetStudentTestResultsByTest(test_id: ID!, page: Int!, limit: Int!): PaginatedStudentTestResult
  }

  extend type Mutation {
    CreateStudentTestResult(student_test_result_input: CreateStudentTestResultInput!): StudentTestResult
    UpdateStudentTestResult(id: ID!, student_test_result_input: UpdateStudentTestResultInput!): StudentTestResult
    DeleteStudentTestResult(id: ID!, deleted_by: ID!): String
    EnterMarks(input: CreateStudentTestResultInput!): StudentTestResult
    ValidateMarks(id: ID!): StudentTestResult
  }
`;

// *************** EXPORT MODULE ***************
module.exports = StudentTestResultTypeDefs;
