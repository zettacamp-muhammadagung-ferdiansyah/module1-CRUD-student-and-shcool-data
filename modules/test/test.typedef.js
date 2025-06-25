// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const TestTypeDefs = gql`
  enum TestStatus {
    active
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

  "Type definition for Test"
  type Test {
    _id: ID!
    test_id: String!
    subject_id: ID!
    name: String!
    description: String
    weight: Float!
    notations: [Notation!]!
    status: TestStatus!
    created_at: Date!
    created_by: String
    updated_at: Date!
    updated_by: String
    deleted_at: Date
    deleted_by: String
  }

  "Input type for creating/updating tests"
  input TestInput {
    test_id: String!
    subject_id: ID!
    name: String!
    description: String
    weight: Float!
    notations: [NotationInput!]!
  }

  "Paginated response type for tests"
  type PaginatedTest {
    data: [Test]
    total: Int
    page: Int
    limit: Int
  }

  extend type Query {
    GetAllTests(page: Int!, limit: Int!): PaginatedTest
    GetTestById(id: ID!): Test
  }
  
  extend type Mutation {
    CreateTest(test_input: TestInput!): Test
    UpdateTest(id: ID!, test_input: TestInput!): Test
    DeleteTest(id: ID!, deleted_by: ID!): Test
  }
`;

// *************** EXPORT MODULE ***************
module.exports = TestTypeDefs;
