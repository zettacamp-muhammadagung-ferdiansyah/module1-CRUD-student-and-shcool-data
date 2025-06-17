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
  
  input SchoolInput {
    name: String
    address: String
  }
  
  extend type Query {
    GetAllSchools: [School]
    GetSchoolById(id: ID!): School
  }
  extend type Mutation {
    CreateSchool(school_input: SchoolInput!): School 
    UpdateSchool(id: ID!, school_input: SchoolInput!): School
    DeleteSchool(id: ID!): School
  }
`;

// *************** EXPORT MODULE ***************
module.exports = SchoolTypeDefs;
