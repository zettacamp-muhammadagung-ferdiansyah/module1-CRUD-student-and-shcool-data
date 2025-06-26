// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const SubjectTypeDefs = gql`
  
  enum SubjectStatus {
    active
    deleted
  }

  type Subject {
    _id: ID!
    block_id: ID!
    name: String!
    description: String
    coefficient: Float!
    test_ids: [ID!]
    tests: [Test]
    status: SubjectStatus!
    createdAt: Date!
    created_by: String
    updatedAt: Date!
    updated_by: String
    deleted_at: Date
    deleted_by: String
  }

  input SubjectInput {
    block_id: ID!
    name: String!
    description: String
    coefficient: Float!
    test_ids: [ID!]
  }

  type PaginatedSubject {
    data: [Subject]
    total: Int
    page: Int
    limit: Int
  }

  extend type Query {
    GetAllSubjects(page: Int!, limit: Int!): PaginatedSubject
    GetSubjectById(id: ID!): Subject
  }
  
  extend type Mutation {
    CreateSubject(subject_input: SubjectInput!): Subject
    UpdateSubject(id: ID!, subject_input: SubjectInput!): Subject
    DeleteSubject(id: ID!, deleted_by: ID!): Subject
  }
`;

// *************** EXPORT MODULE ***************
module.exports = SubjectTypeDefs;
