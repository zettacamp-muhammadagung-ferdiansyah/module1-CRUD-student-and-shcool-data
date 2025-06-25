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
