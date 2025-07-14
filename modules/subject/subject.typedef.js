// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const SubjectTypeDefs = gql`
  enum SubjectStatus {
    active
    deleted
  }

  enum SubjectRuleType {
    TEST_RESULT
    TEST_MARK
    SUBJECT_AVERAGE
  }

  enum LogicalOperator {
    AND
    OR
  }

  enum ComparisonOperator {
    GTE
    GT
    LTE
    LT
    EQ
  }

  enum ExpectedOutcome {
    PASS
    FAIL
  }

  type SubjectRule {
    logical_operator: LogicalOperator
    type: SubjectRuleType!
    test_id: ID
    operator: ComparisonOperator
    value: Float
  }

  type SubjectPassingCriteria {
    expected_outcome: ExpectedOutcome!
    rules: [SubjectRule!]!
  }

  type Subject {
    _id: ID!
    block_id: ID!
    name: String!
    description: String
    coefficient: Float!
    test_ids: [Test]
    passing_criteria: [SubjectPassingCriteria]
    status: SubjectStatus!
    createdAt: Date!
    created_by: User
    updatedAt: Date!
    updated_by: User
    deleted_at: Date
    deleted_by: User
  }


  input CreateSubjectInput {
    block_id: ID!
    name: String!
    description: String
    coefficient: Float!
    test_ids: [ID!]
    passing_criteria: [SubjectPassingCriteriaInput]
    created_by: ID!
  }

  input UpdateSubjectInput {
    block_id: ID!
    name: String!
    description: String
    coefficient: Float!
    test_ids: [ID!]
    passing_criteria: [SubjectPassingCriteriaInput]
    updated_by: ID!
  }

  input SubjectRuleInput {
    logical_operator: LogicalOperator
    type: SubjectRuleType!
    test_id: ID
    operator: ComparisonOperator!
    value: Float!
  }

  input SubjectPassingCriteriaInput {
    expected_outcome: ExpectedOutcome!
    rules: [SubjectRuleInput!]!
  }

  type PaginatedSubject {
    data: [Subject]
    page: Int
    length: Int
  }

  extend type Query {
    GetAllSubjects(page: Int!, limit: Int!): PaginatedSubject
    GetSubjectById(id: ID!): Subject
  }

  extend type Mutation {
    CreateSubject(subject_input: CreateSubjectInput!): Subject
    UpdateSubject(id: ID!, subject_input: UpdateSubjectInput!): Subject
    DeleteSubject(id: ID!, deleted_by: ID!): String
  }
`;

// *************** EXPORT MODULE ***************
module.exports = SubjectTypeDefs;
