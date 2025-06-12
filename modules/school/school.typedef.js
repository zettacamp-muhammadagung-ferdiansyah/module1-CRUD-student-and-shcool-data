// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const SchoolTypeDefs = gql`
  type School {
    id: ID!
    name: String!
    address: String
    students: [Student]
    status: SchoolStatus
    deleted_at: String
  }
  
  enum SchoolStatus {
    active
    deleted
  }
  
  extend type Query {
    GetAllSchools: [School]
    GetSchoolById(id: ID!): School
  }
  extend type Mutation {
    CreateSchool(name: String!, address: String): School
    UpdateSchool(id: ID!, name: String, address: String): School
    DeleteSchool(id: ID!): School
  }
`;

// *************** EXPORT MODULE ***************
module.exports = SchoolTypeDefs;
