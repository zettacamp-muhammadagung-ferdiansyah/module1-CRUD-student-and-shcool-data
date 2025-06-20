// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const SchoolTypeDefs = gql`
  type School {
    _id: ID!
    name: String!
    commercial_name: String!
    address: String!
    city: String!
    country: String!
    zipcode: String!
    logo: String!
    students: [Student]
    status: SchoolStatus
    deleted_at: Date
  }
  
  enum SchoolStatus {
    active
    deleted
  }
  
  input SchoolInput {
    name: String!
    commercial_name: String!
    address: String!
    city: String!
    country: String!
    zipcode: String!
    logo: String
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
