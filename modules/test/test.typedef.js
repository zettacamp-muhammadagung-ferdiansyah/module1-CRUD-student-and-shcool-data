// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const TestTypeDefs = gql`
  enum TestStatus {
    active
    published
    deleted
  }

  type Notation {
    notation_text: String!
    max_points: Float!
  }

  input NotationInput {
    notation_text: String!
    max_points: Float!
  }

  type Test {
    _id: ID!
    subject_id: ID!
    subject: Subject
    school_id: ID!
    school: School
    name: String!
    description: String
    weight: Float!
    notations: [Notation!]!
    test_status: TestStatus!
    published_date: Date
    createdAt: Date!
    created_by: User
    updatedAt: Date!
    updated_by: User
    deleted_at: Date
    deleted_by: User
  }

  input CreateTestInput {
    subject_id: ID!
    school_id: ID!
    name: String!
    description: String
    weight: Float!
    notations: [NotationInput!]!
    created_by: ID!
  }

  input UpdateTestInput {
    subject_id: ID!
    school_id: ID!
    name: String!
    description: String
    weight: Float!
    notations: [NotationInput!]!
    updated_by: ID!
  }

  type PaginatedTest {
    data: [Test]
    page: Int
    length: Int
  }

  input PublishTestInput {
    user_id: ID!
    due_date: Date
    title: String!
    description: String
  }

  extend type Query {
    GetAllTests(page: Int!, limit: Int!): PaginatedTest
    GetTestById(id: ID!): Test
  }

  extend type Mutation {
    CreateTest(test_input: CreateTestInput!): Test
    UpdateTest(id: ID!, test_input: UpdateTestInput!): Test
    DeleteTest(id: ID!, deleted_by: ID!): String
    PublishTest(id: ID!, input: PublishTestInput!): Test!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = TestTypeDefs;
