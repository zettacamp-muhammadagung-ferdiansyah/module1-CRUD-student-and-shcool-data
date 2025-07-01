// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const TestTypeDefs = gql`
  enum TestStatus {
    active
    PUBLISHED
    DELETED
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
    name: String!
    description: String
    weight: Float!
    notations: [Notation!]!
    test_status: TestStatus!
    published_date: Date
    createdAt: Date!
    created_by: String
    updatedAt: Date!
    updated_by: String
    deleted_at: Date
    deleted_by: String
  }

  input TestInput {
    subject_id: ID!
    name: String!
    description: String
    weight: Float!
    notations: [NotationInput!]!
  }

  type PaginatedTest {
    data: [Test]
    total: Int
    page: Int
    limit: Int
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
    CreateTest(test_input: TestInput!): Test
    UpdateTest(id: ID!, test_input: TestInput!): Test
    DeleteTest(id: ID!, deleted_by: ID!): Test
    PublishTest(id: ID!, input: PublishTestInput!): Test!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = TestTypeDefs;
