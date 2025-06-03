// *************** IMPORT MODULE ***************
const Student = require('./student.model');
// *************** IMPORT HELPER FUNCTION ***************
const { HandleResolverError } = require('../../helpers/graphqlHelper');
// *************** IMPORT VALIDATOR ***************
const { IsNonEmptyString, IsValidEmail, IsValidDate } = require('../../validation/validation');

// *************** QUERY ***************
const Query = {
  Students: HandleResolverError(function(_, args) {
    return Student.find();
  }),
  Student: HandleResolverError(function(_, { id }) {
    return Student.findById(id);
  }),
};

// *************** MUTATION ***************
const Mutation = {
  CreateStudent: HandleResolverError(async function(_, args) {
    if (!IsNonEmptyString(args.first_name)) throw new Error('First name required');
    if (!IsNonEmptyString(args.last_name)) throw new Error('Last name required');
    if (!IsValidEmail(args.email)) throw new Error('Invalid email');
    if (args.date_of_birth && !IsValidDate(args.date_of_birth)) throw new Error('Invalid date of birth');
    if (!args.school_id) throw new Error('School ID required');
    return Student.create(args);
  }),
  UpdateStudent: HandleResolverError(async function(_, { id, ...rest }) {
    if (rest.email && !IsValidEmail(rest.email)) throw new Error('Invalid email');
    if (rest.first_name && !IsNonEmptyString(rest.first_name)) throw new Error('Invalid first name');
    if (rest.last_name && !IsNonEmptyString(rest.last_name)) throw new Error('Invalid last name');
    if (rest.date_of_birth && !IsValidDate(rest.date_of_birth)) throw new Error('Invalid date of birth');
    return Student.findByIdAndUpdate(id, rest, { new: true });
  }),
  DeleteStudent: HandleResolverError(async function(_, { id }) {
    return Student.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true });
  }),
};

// *************** EXPORT MODULE ***************
module.exports = {
  Query,
  Mutation,
};
