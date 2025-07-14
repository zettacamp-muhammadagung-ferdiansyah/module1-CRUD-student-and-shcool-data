// *************** IMPORT LIBRARY ***************
const { gql } = require("apollo-server");

const BlockTypeDefs = gql`
  enum BlockStatus {
    active
    deleted
  }

  type Block {
    _id: ID!
    name: String!
    description: String
    subject_ids: [Subject]
    status: BlockStatus
    createdAt: Date
    created_by: User
    updatedAt: Date
    updated_by: User
    deleted_at: Date
    deleted_by: User
  }

  input CreateBlockInput {
    name: String!
    description: String
    subject_ids: [ID!]
    created_by: ID!
  }

  input UpdateBlockInput {
    name: String!
    description: String
    subject_ids: [ID!]
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
