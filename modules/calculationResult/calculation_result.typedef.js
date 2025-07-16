// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const CalculationResultTypeDefs = gql`
  enum CalculationStatus {
    PASS
    FAIL
    INCOMPLETE
  }

  type NotationResult {
    notation_id: Int!
    notation_text: String!
    max_marks: Float!
    achieved_marks: Float!
    percentage: Float!
  }

  type TestResult {
    test_id: ID!
    test_name: String!
    status: CalculationStatus!
    weight: Float!
    total_marks: Float!
    max_marks: Float!
    percentage: Float!
    weighted_mark: Float!
    notation_results: [NotationResult!]!
    criteria_evaluation: [CriteriaEvaluation!]
    createdAt: Date!
  }

  type CriteriaEvaluation {
    expected_outcome: String!
    result: Boolean!
    rule_evaluations: [RuleEvaluation!]!
  }

  type RuleEvaluation {
    type: String!
    logical_operator: String
    target_id: ID
    operator: String!
    value: Float!
    actual_value: Float!
    passed: Boolean!
  }

  type SubjectResult {
    subject_id: ID!
    subject_name: String!
    status: CalculationStatus!
    coefficient: Float!
    average_score: Float!
    test_results: [TestResult!]!
    criteria_evaluation: [CriteriaEvaluation!]
    createdAt: Date!
  }

  type BlockResult {
    block_id: ID!
    block_name: String!
    status: CalculationStatus!
    average_score: Float!
    subject_results: [SubjectResult!]!
    criteria_evaluation: [CriteriaEvaluation!]
    createdAt: Date!
  }

  type CalculationResult {
    _id: ID!
    student_id: ID!
    school_id: ID!
    calculation_date: Date!
    status: CalculationStatus!
    block_results: [BlockResult!]!
    student: Student
    school: School
    created_by: User
    updated_by: User
    createdAt: Date!
    updatedAt: Date!
  }

  type PaginatedCalculationResult {
    data: [CalculationResult]
    page: Int
    length: Int
  }

  type CalculationWorkerStatus {
    activeWorkers: Int
    queuedTasks: Int
    error: String
    timestamp: Date!
  }

  type TriggerCalculationResponse {
    success: Boolean!
    message: String!
  }

  extend type Query {
    GetAllCalculationResults(page: Int!, limit: Int!): PaginatedCalculationResult
    GetCalculationResultById(id: ID!): CalculationResult
    GetCalculationResultsByStudent(student_id: ID!, page: Int!, limit: Int!): PaginatedCalculationResult
    GetLatestCalculationResultByStudent(student_id: ID!): CalculationResult
    GetCalculationWorkerStatus: CalculationWorkerStatus
  }

  extend type Mutation {
    TriggerCalculation(studentId: ID!, blockId: ID!): TriggerCalculationResponse
  }
`;

// *************** EXPORT MODULE ***************
module.exports = CalculationResultTypeDefs;
