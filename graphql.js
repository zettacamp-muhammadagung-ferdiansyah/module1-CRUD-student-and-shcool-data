const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const School = require('./models/School');

// Connect to MongoDB (adjust URI as needed)
mongoose.connect('mongodb://localhost:27017/module1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// GraphQL type definitions
defaultTypeDefs = gql`
  scalar Date

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
    deletedAt: Date
  }

  type Student {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    dateOfBirth: Date
    schoolId: ID!
    deletedAt: Date
  }

  type School {
    id: ID!
    name: String!
    address: String
    students: [Student]
    deletedAt: Date
  }

  type Query {
    users: [User]
    user(id: ID!): User
    students: [Student]
    student(id: ID!): Student
    schools: [School]
    school(id: ID!): School
  }

  type Mutation {
    createUser(firstName: String!, lastName: String!, email: String!, password: String!, role: String!): User
    updateUser(id: ID!, firstName: String, lastName: String, email: String, password: String, role: String, deletedAt: Date): User
    deleteUser(id: ID!): User

    createStudent(firstName: String!, lastName: String!, email: String!, dateOfBirth: Date, schoolId: ID!): Student
    updateStudent(id: ID!, firstName: String, lastName: String, email: String, dateOfBirth: Date, schoolId: ID, deletedAt: Date): Student
    deleteStudent(id: ID!): Student

    createSchool(name: String!, address: String): School
    updateSchool(id: ID!, name: String, address: String, deletedAt: Date): School
    deleteSchool(id: ID!): School
  }
`;

// GraphQL resolvers
const resolvers = {
  Query: {
    users: () => User.find(),
    user: (_, { id }) => User.findById(id),
    students: () => Student.find(),
    student: (_, { id }) => Student.findById(id),
    schools: () => School.find(),
    school: (_, { id }) => School.findById(id),
  },
  School: {
    students: async (parent) => Student.find({ schoolId: parent.id }),
  },
  Mutation: {
    createUser: (_, args) => User.create(args),
    updateUser: async (_, { id, ...rest }) => User.findByIdAndUpdate(id, rest, { new: true }),
    deleteUser: async (_, { id }) => User.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }),

    createStudent: (_, args) => Student.create(args),
    updateStudent: async (_, { id, ...rest }) => Student.findByIdAndUpdate(id, rest, { new: true }),
    deleteStudent: async (_, { id }) => Student.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }),

    createSchool: (_, args) => School.create(args),
    updateSchool: async (_, { id, ...rest }) => School.findByIdAndUpdate(id, rest, { new: true }),
    deleteSchool: async (_, { id }) => School.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }),
  },
};

const server = new ApolloServer({
  typeDefs: defaultTypeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
