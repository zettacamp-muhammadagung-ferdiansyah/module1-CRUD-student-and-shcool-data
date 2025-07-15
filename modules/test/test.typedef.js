// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const TestTypeDefs = gql`
  enum TestStatus {
    active
    published
    deleted
  }

  enum TestRuleType {
    NOTATION_SCORE
    TOTAL_SCORE
  }

  type TestRule {
    logical_operator: LogicalOperator
    type: TestRuleType!
    notation_index: Int
    operator: ComparisonOperator
    value: Float
  }

  type TestCriteria {
    expected_outcome: ExpectedOutcome!
    rules: [TestRule!]!
  }

  type Notation {
    notation_text: String!
    max_points: Float!
  }

  input NotationInput {
    notation_text: String!
    max_points: Float!
  }

  input TestRuleInput {
    logical_operator: LogicalOperator
    type: TestRuleType!
    notation_index: Int
    operator: ComparisonOperator
    value: Float
  }

  input TestCriteriaInput {
    expected_outcome: ExpectedOutcome!
    rules: [TestRuleInput!]!
  }

  type Test {
    _id: ID!
    subject_id: Subject
    school_id: School
    name: String!
    description: String
    weight: Float!
    notations: [Notation!]!
    passing_criteria: [TestCriteria]
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
    passing_criteria: [TestCriteriaInput]
    created_by: ID!
  }

  input UpdateTestInput {
    subject_id: ID!
    school_id: ID!
    name: String!
    description: String
    weight: Float!
    notations: [NotationInput!]!
    passing_criteria: [TestCriteriaInput]
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
