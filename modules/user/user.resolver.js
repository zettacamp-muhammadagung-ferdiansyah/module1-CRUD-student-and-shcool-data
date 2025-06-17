// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

// *************** IMPORT VALIDATOR ***************
const UserValidators = require('./user.validator');

// *************** QUERY ***************
/**
 * Retrieves all active users from the database. Filters out any users
 * that have been marked as deleted by checking their status field.
 *
 * @async
 * @function GetAllUsers
 * @param {object} parent - The parent object (unused in this function)
 * @throws {ApolloError} Throws ApolloError if an error occurs during retrieval
 * @returns {Promise<Array>} Array of active user objects
 */
async function GetAllUsers() {
  try {
    // *************** Query to retrieve only active users
    const users = await UserModel.find({ status: 'active' });
    return users;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/user/user.resolver.js',
      parameter_input: JSON.stringify({}),
      function_name: 'GetAllUsers',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a single user by ID
 *
 * @async
 * @function GetUserById
 * @param {object} parent - The parent object (unused in this function)
 * @param {string} args.id - The ID of the user to retrieve
 * @throws {ApolloError} Throws ApolloError if user ID is not provided or an error occurs
 * @returns {Promise<object|null>} The user object or null if not found
 */
async function GetUserById(parent, { id }) {
  try {
    // *************** Validate Input
    UserValidators.ValidateGetUserByIdParameters({ id });

    // *************** Retrieve User using status active
    const user = await UserModel.findOne({ _id: id, status: 'active' });
    if (!user) {
      throw new ApolloError('User not found', 'RESOURCE_NOT_FOUND',);
    }
    return user;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/user/user.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetUserById',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new user
 *
 * @async
 * @function CreateUser
 * @param {object} parent - The parent object (unused in this function)
 * @param {string} args.first_name - User's first name
 * @param {string} args.last_name - User's last name
 * @param {string} args.email - User's email
 * @param {string} args.password - User's password
 * @param {string} args.role - User's role
 * @throws {ApolloError} Throws ApolloError if validation fails or creation error occurs
 * @returns {Promise<object>} The created user object
 */
async function CreateUser(parent, { first_name, last_name, email, password, role }) {
  try {
    // *************** Validate Input
    UserValidators.ValidateCreateUserParameters({ first_name, last_name, email, password, role });

    // *************** Create User
    const user = await UserModel.create({ first_name, last_name, email, password, role });
    return user;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/user/user.resolver.js',
      parameter_input: JSON.stringify({ first_name, last_name, email, role }),
      function_name: 'CreateUser',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing user
 *
 * @async
 * @function UpdateUser
 * @param {object} parent - The parent object (unused in this function)
 * @param {string} args.id - User ID to update
 * @param {string} [args.first_name] - Updated first name
 * @param {string} [args.last_name] - Updated last name
 * @param {string} [args.email] - Updated email
 * @param {string} [args.password] - Updated password
 * @param {string} [args.role] - Updated role
 * @throws {ApolloError} Throws ApolloError if validation fails or update error occurs
 * @returns {Promise<object|null>} The updated user object or null if not found
 */
async function UpdateUser(parent, { id, first_name, last_name, email, password, role }) {
  try {
    // *************** Validate Input
    UserValidators.ValidateUpdateUserParameters({ id, first_name, last_name, email, password, role });

    // *************** Build update object with direct value assignment
    const updateData = { first_name, last_name, email, password, role };

    // *************** Update User
    const user = await UserModel.findByIdAndUpdate(id, updateData);
    if (!user) {
      throw new ApolloError('User not found', 'RESOURCE_NOT_FOUND');
    }
    
    return user;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/user/user.resolver.js',
      parameter_input: JSON.stringify({ id, first_name, last_name, role }),
      function_name: 'UpdateUser',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a user by setting status to 'deleted' and updating deleted_at timestamp
 *
 * @async
 * @function DeleteUser
 * @param {object} parent - The parent object (unused in this function)
 * @param {string} args.id - User ID to delete
 * @throws {ApolloError} Throws ApolloError if user ID is not provided or deletion error occurs
 * @returns {Promise<object|null>} The deleted user object or null if not found
 */
async function DeleteUser(parent, { id }) {
  try {
    // *************** Validate Input
    UserValidators.ValidateDeleteUserParameters({ id });

    // *************** Set status to deleted AND update deleted_at timestamp
    const user = await UserModel.findByIdAndUpdate(
      id,
      { 
        status: 'deleted',
        deleted_at: new Date().toISOString() 
      }
    );
    if (!user) {
      throw new ApolloError('User not found', 'RESOURCE_NOT_FOUND');
    }
    
    return user;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/user/user.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'DeleteUser',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllUsers,
    GetUserById,
  },
  Mutation: {
    CreateUser,
    UpdateUser,
    DeleteUser,
  },
};
