// Student GraphQL typeDefs
const { gql } = require('apollo-server');

const studentTypeDefs = gql`
  type Student {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: Date
    school_id: ID!
    deleted_at: Date
  }
  extend type Query {
    Students: [Student]
    Student(id: ID!): Student
  }
  extend type Mutation {
    CreateStudent(first_name: String!, last_name: String!, email: String!, date_of_birth: Date, school_id: ID!): Student
    UpdateStudent(id: ID!, first_name: String, last_name: String, email: String, date_of_birth: Date, school_id: ID, deleted_at: Date): Student
    DeleteStudent(id: ID!): Student
  }
`;

module.exports = studentTypeDefs;
