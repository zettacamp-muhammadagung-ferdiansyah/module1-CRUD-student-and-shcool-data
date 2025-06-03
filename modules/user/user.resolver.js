// *************** IMPORT MODULE ***************
const User = require('./user.model');
// *************** IMPORT HELPER FUNCTION ***************
const { HandleResolverError } = require('../../helpers/graphqlHelper');
// *************** IMPORT VALIDATOR ***************
const { IsNonEmptyString, IsValidEmail } = require('../../validation/validation');

// *************** QUERY ***************
const Query = {
  Users: HandleResolverError(function() {
    return User.find();
  }),
  User: HandleResolverError(function(_, { id }) {
    return User.findById(id);
  }),
};

// *************** MUTATION ***************
const Mutation = {
  CreateUser: HandleResolverError(async function(_, args) {
    if (!IsNonEmptyString(args.first_name)) throw new Error('First name required');
    if (!IsNonEmptyString(args.last_name)) throw new Error('Last name required');
    if (!IsValidEmail(args.email)) throw new Error('Invalid email');
    if (!IsNonEmptyString(args.password)) throw new Error('Password required');
    if (!IsNonEmptyString(args.role)) throw new Error('Role required');
    return User.create(args);
  }),
  UpdateUser: HandleResolverError(async function(_, { id, ...rest }) {
    if (rest.email && !IsValidEmail(rest.email)) throw new Error('Invalid email');
    if (rest.first_name && !IsNonEmptyString(rest.first_name)) throw new Error('Invalid first name');
    if (rest.last_name && !IsNonEmptyString(rest.last_name)) throw new Error('Invalid last name');
    return User.findByIdAndUpdate(id, rest, { new: true });
  }),
  DeleteUser: HandleResolverError(async function(_, { id }) {
    return User.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true });
  }),
};

// *************** EXPORT MODULE ***************
module.exports = {
  Query,
  Mutation,
};
