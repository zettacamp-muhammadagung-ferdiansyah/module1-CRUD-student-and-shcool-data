const { gql } = require('apollo-server');

const schoolTypeDefs = gql`
  type School {
    id: ID!
    name: String!
    address: String
    students: [Student]
    deleted_at: Date
  }
  extend type Query {
    Schools: [School]
    School(id: ID!): School
  }
  extend type Mutation {
    CreateSchool(name: String!, address: String): School
    UpdateSchool(id: ID!, name: String, address: String, deleted_at: Date): School
    DeleteSchool(id: ID!): School
  }
`;

module.exports = schoolTypeDefs;
