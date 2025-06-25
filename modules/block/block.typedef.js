// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const BlockTypeDefs = gql`
  enum BlockStatus {
    active
    deleted
  }

  type Block {
    _id: ID!
    name: String!
    description: String
    subject_ids: [ID!]
    subjects: [Subject]
    status: BlockStatus
    createdAt: Date
    created_by: String
    updatedAt: Date
    updated_by: String
    deleted_at: Date
    deleted_by: String
  }

  input BlockInput {
    name: String!
    description: String
    subject_ids: [ID!]
    created_by: String
    updated_by: String
  }

  type PaginatedBlock {
    data: [Block]
    total: Int
    page: Int
    limit: Int
  }

  extend type Query {
    GetAllBlocks(page: Int!, limit: Int!): PaginatedBlock
    GetBlockById(id: ID!): Block
  }
  
  extend type Mutation {
    CreateBlock(block_input: BlockInput!): Block
    UpdateBlock(id: ID!, block_input: BlockInput!): Block
    DeleteBlock(id: ID!, deleted_by: ID!): Block
  }
`;

// *************** EXPORT MODULE ***************
module.exports = BlockTypeDefs;
