// *************** IMPORT LIBRARY ***************
const { gql } = require("apollo-server");

const BlockTypeDefs = gql`
  enum BlockStatus {
    active
    deleted
  }

  enum BlockRuleType {
    SUBJECT_RESULT
    SUBJECT_MARK
    BLOCK_AVERAGE
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

  type BlockRule {
    logical_operator: LogicalOperator
    type: BlockRuleType!
    subject_id: ID
    operator: ComparisonOperator
    value: Float
  }

  type BlockPassingCriteria {
    expected_outcome: ExpectedOutcome!
    rules: [BlockRule!]!
  }

  type Block {
    _id: ID!
    name: String!
    description: String
    subject_ids: [Subject]
    passing_criteria: [BlockPassingCriteria]
    status: BlockStatus
    createdAt: Date
    created_by: User
    updatedAt: Date
    updated_by: User
    deleted_at: Date
    deleted_by: User
  }

  input BlockRuleInput {
    logical_operator: LogicalOperator
    type: BlockRuleType!
    subject_id: ID
    operator: ComparisonOperator
    value: Float
  }

  input BlockPassingCriteriaInput {
    expected_outcome: ExpectedOutcome!
    rules: [BlockRuleInput!]!
  }

  input CreateBlockInput {
    name: String!
    description: String
    subject_ids: [ID!]
    passing_criteria: [BlockPassingCriteriaInput]
    created_by: ID!
  }

  input UpdateBlockInput {
    name: String!
    description: String
    subject_ids: [ID!]
    passing_criteria: [BlockPassingCriteriaInput]
    updated_by: ID!
  }

  type PaginatedBlock {
    data: [Block]
    page: Int
    length: Int
  }

  extend type Query {
    GetAllBlocks(page: Int!, limit: Int!): PaginatedBlock
    GetBlockById(id: ID!): Block
  }

  extend type Mutation {
    CreateBlock(block_input: CreateBlockInput!): Block
    UpdateBlock(id: ID!, block_input: UpdateBlockInput!): Block
    DeleteBlock(id: ID!, deleted_by: ID!): String
  }
`;

// *************** EXPORT MODULE ***************
module.exports = BlockTypeDefs;
