// *************** IMPORT MODULE ***************
const School = require('./school.model');
const Student = require('../student/student.model');
// *************** IMPORT HELPER FUNCTION ***************
const { HandleResolverError } = require('../../helpers/graphqlHelper');
// *************** IMPORT VALIDATOR ***************
const { IsNonEmptyString } = require('../../validation/validation');

// *************** QUERY ***************
const Query = {
  Schools: HandleResolverError(function() {
    return School.find();
  }),
  School: HandleResolverError(function(_, { id }) {
    return School.findById(id);
  }),
};

// *************** MUTATION ***************
const Mutation = {
  CreateSchool: HandleResolverError(async function(_, args) {
    if (!IsNonEmptyString(args.name)) throw new Error('School name required');
    return School.create(args);
  }),
  UpdateSchool: HandleResolverError(async function(_, { id, ...rest }) {
    if (rest.name && !IsNonEmptyString(rest.name)) throw new Error('Invalid school name');
    return School.findByIdAndUpdate(id, rest, { new: true });
  }),
  DeleteSchool: HandleResolverError(async function(_, { id }) {
    return School.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true });
  }),
};

// *************** LOADER ***************
const SchoolType = {
  students: HandleResolverError(async function(parent) {
    // parent.id is the school id
    return Student.find({ school_id: parent.id });
  }),
};

// *************** EXPORT MODULE ***************
module.exports = {
  Query,
  Mutation,
  school: SchoolType,
};
