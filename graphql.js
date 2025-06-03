// *************** IMPORT LIBRARY ***************
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const User = require('./models/User');
const Student = require('./models/Student');
const School = require('./models/School');

// *************** IMPORT VALIDATOR ***************
const { IsNonEmptyString, IsValidEmail, IsValidDate } = require('./validation/validation');

// *************** IMPORT HELPER FUNCTION ***************
const { HandleResolverError } = require('./helpers/graphqlHelper');
const { StudentsBySchoolIdLoader } = require('./utils/dataloader');

// *************** DATABASE CONNECTION ***************
/**
 * Connect to MongoDB database
 */
mongoose.connect('mongodb://localhost:27017/module1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// *************** TYPE DEFINITIONS ***************
const defaultTypeDefs = gql`
  scalar Date

  type user {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    role: String!
    deleted_at: Date
  }

  type student {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    date_of_birth: Date
    school_id: ID!
    deleted_at: Date
  }

  type school {
    id: ID!
    name: String!
    address: String
    Students: [student] # Changed to PascalCase to match resolver
    deleted_at: Date
  }

  type Query {
    Users: [user]
    User(id: ID!): user
    Students: [student]
    Student(id: ID!): student
    Schools: [school]
    School(id: ID!): school
  }

  type Mutation {
    CreateUser(first_name: String!, last_name: String!, email: String!, password: String!, role: String!): user
    UpdateUser(id: ID!, first_name: String, last_name: String, email: String, password: String, role: String, deleted_at: Date): user
    DeleteUser(id: ID!): user

    CreateStudent(first_name: String!, last_name: String!, email: String!, date_of_birth: Date, school_id: ID!): student
    UpdateStudent(id: ID!, first_name: String, last_name: String, email: String, date_of_birth: Date, school_id: ID, deleted_at: Date): student
    DeleteStudent(id: ID!): student

    CreateSchool(name: String!, address: String): school
    UpdateSchool(id: ID!, name: String, address: String, deleted_at: Date): school
    DeleteSchool(id: ID!): school
  }
`;

// *************** QUERY ***************
/**
 * Query resolvers for data retrieval
 */
const Query = {
  /**
   * Get all users
   */
  Users: HandleResolverError(function() { return User.find(); }),
  /**
   * Get user by ID
   * @param {object} _
   * @param {object} args
   * @param {string} args.id
   */
  User: HandleResolverError(function(_, { id }) { return User.findById(id); }),
  /**
   * Get all students
   */
  Students: HandleResolverError(function() { return Student.find(); }),
  /**
   * Get student by ID
   * @param {object} _
   * @param {object} args
   * @param {string} args.id
   */
  Student: HandleResolverError(function(_, { id }) { return Student.findById(id); }),
  /**
   * Get all schools
   */
  Schools: HandleResolverError(function() { return School.find(); }),
  /**
   * Get school by ID
   * @param {object} _
   * @param {object} args
   * @param {string} args.id
   */
  School: HandleResolverError(function(_, { id }) { return School.findById(id); }),
};

// *************** MUTATION ***************
/**
 * Mutation resolvers for data changes
 */
const Mutation = {
  /**
   * Create a new user
   */
  CreateUser: HandleResolverError(async function(_, args) {
    // *************** START: Input Validation ***************
    if (!IsNonEmptyString(args.first_name)) throw new Error('First name required');
    if (!IsNonEmptyString(args.last_name)) throw new Error('Last name required');
    if (!IsValidEmail(args.email)) throw new Error('Invalid email');
    if (!IsNonEmptyString(args.password)) throw new Error('Password required');
    if (!IsNonEmptyString(args.role)) throw new Error('Role required');
    // *************** END: Input Validation ***************
    return User.create(args);
  }),
  /**
   * Update a user
   */
  UpdateUser: HandleResolverError(async function(_, { id, ...rest }) {
    // *************** START: Input Validation ***************
    if (rest.email && !IsValidEmail(rest.email)) throw new Error('Invalid email');
    if (rest.first_name && !IsNonEmptyString(rest.first_name)) throw new Error('Invalid first name');
    if (rest.last_name && !IsNonEmptyString(rest.last_name)) throw new Error('Invalid last name');
    // *************** END: Input Validation ***************
    return User.findByIdAndUpdate(id, rest, { new: true });
  }),
  /**
   * Soft delete a user
   */
  DeleteUser: HandleResolverError(async function(_, { id }) {
    return User.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true });
  }),
  /**
   * Create a new student
   */
  CreateStudent: HandleResolverError(async function(_, args) {
    // *************** START: Input Validation ***************
    if (!IsNonEmptyString(args.first_name)) throw new Error('First name required');
    if (!IsNonEmptyString(args.last_name)) throw new Error('Last name required');
    if (!IsValidEmail(args.email)) throw new Error('Invalid email');
    if (args.date_of_birth && !IsValidDate(args.date_of_birth)) throw new Error('Invalid date of birth');
    if (!args.school_id) throw new Error('School ID required');
    // *************** END: Input Validation ***************
    return Student.create(args);
  }),
  /**
   * Update a student
   */
  UpdateStudent: HandleResolverError(async function(_, { id, ...rest }) {
    if (rest.email && !IsValidEmail(rest.email)) throw new Error('Invalid email');
    if (rest.first_name && !IsNonEmptyString(rest.first_name)) throw new Error('Invalid first name');
    if (rest.last_name && !IsNonEmptyString(rest.last_name)) throw new Error('Invalid last name');
    if (rest.date_of_birth && !IsValidDate(rest.date_of_birth)) throw new Error('Invalid date of birth');
    return Student.findByIdAndUpdate(id, rest, { new: true });
  }),
  /**
   * Soft delete a student
   */
  DeleteStudent: HandleResolverError(async function(_, { id }) {
    return Student.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true });
  }),
  /**
   * Create a new school
   */
  CreateSchool: HandleResolverError(async function(_, args) {
    if (!IsNonEmptyString(args.name)) throw new Error('School name required');
    return School.create(args);
  }),
  /**
   * Update a school
   */
  UpdateSchool: HandleResolverError(async function(_, { id, ...rest }) {
    if (rest.name && !IsNonEmptyString(rest.name)) throw new Error('Invalid school name');
    return School.findByIdAndUpdate(id, rest, { new: true });
  }),
  /**
   * Soft delete a school
   */
  DeleteSchool: HandleResolverError(async function(_, { id }) {
    return School.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true });
  }),
};

// *************** LOADER ***************
/**
 * Loader for School.Students field
 */
const SchoolType = {
  Students: HandleResolverError(async function(parent, _, { loaders }) {
    // Use DataLoader for efficient batch loading
    return loaders.StudentsBySchoolIdLoader.load(parent.id);
  }),
};

// *************** EXPORT MODULE ***************
const server = new ApolloServer({
  typeDefs: defaultTypeDefs,
  resolvers: {
    Query,
    Mutation,
    school: SchoolType,
  },
  context: () => ({
    loaders: {
      StudentsBySchoolIdLoader,
    },
  }),
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
