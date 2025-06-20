// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

// *************** IMPORT VALIDATOR ***************
const UserValidators = require('./user.validator');
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

// *************** QUERY ***************
/**
 * Retrieves all active users from the database. Filters out any users
 * that have been marked as deleted by checking their status field.
 *
 * @async
 * @function GetAllUsers
 * @throws {ApolloError} Throws ApolloError with the original error message if retrieval fails
 * @returns {Promise<Array>} Array of active user objects
 */
async function GetAllUsers() {
  try {
    // *************** Query to retrieve only active users
    const users = await UserModel.find({ status: 'active' }).lean();
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
 * @param {string} args.id - The ID of the user to retrieve
 * @throws {ApolloError} Throws 'INVALID_INPUT' if ID is not provided or has invalid format
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if user with given ID doesn't exist or is not active
 * @returns {Promise<object|null>} The user object or null if not found
 */
async function GetUserById(_, { id }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Retrieve User using status active
    const user = await UserModel.findOne({ _id: id, status: 'active' }).lean();
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
 * @param {object} args.user_input - Input object containing user data
 * @param {string} args.user_input.first_name - User's first name
 * @param {string} args.user_input.last_name - User's last name
 * @param {string} args.user_input.email - User's email
 * @param {string} args.user_input.password - User's password
 * @param {string} args.user_input.role - User's role
 * @returns {Promise<object>} The created user object
 */
async function CreateUser(_, { user_input }) {
  try {
    // *************** Validate Input
    UserValidators.ValidateCreateUpdateUserParameters({ userInput: user_input });

    // *************** Create sanitized user object with only allowed fields
    const userData = {
      first_name: user_input.first_name,
      last_name: user_input.last_name,
      email: user_input.email,
      password: user_input.password,
      role: user_input.role,
      status: 'active'
    };

    // *************** Create User
    const user = await UserModel.create(userData);
    return user;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/user/user.resolver.js',
      parameter_input: JSON.stringify(user_input),
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
 * @param {string} args.id - User ID to update
 * @param {object} args.user_input - Input object with fields to update
 * @param {string} [args.user_input.first_name] - Updated first name
 * @param {string} [args.user_input.last_name] - Updated last name
 * @param {string} [args.user_input.email] - Updated email
 * @param {string} [args.user_input.password] - Updated password
 * @param {string} [args.user_input.role] - Updated role
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if user with given ID doesn't exist
 * @returns {Promise<object|null>} The updated user object or null if not found
 */
async function UpdateUser(_, { id, user_input }) {
  try {
    // *************** Validate Input
    UserValidators.ValidateCreateUpdateUserParameters({ id, userInput: user_input });

    // *************** Create sanitized user object with only allowed fields
    const updateData = {
      first_name: user_input.first_name,
      last_name: user_input.last_name,
      email: user_input.email,
      password: user_input.password,
      role: user_input.role,
      status: 'active'
    };

    // *************** Update User
    const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!user) {
      throw new ApolloError('User not found', 'RESOURCE_NOT_FOUND');
    }
    
    return user;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/user/user.resolver.js',
      parameter_input: JSON.stringify({ id, user_input }),
      function_name: 'UpdateUser',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Deletes (soft delete) a user by ID
 * 
 * @async
 * @function DeleteUser
 * @param {object} args - GraphQL arguments
 * @param {string} args.id - MongoDB ObjectId of the user to delete
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if user with given ID doesn't exist
 * @throws {ApolloError} Throws 'ALREADY_DELETED' if user is already deleted
 * @returns {Promise<object>} The deleted user object
 */
async function DeleteUser(_, { id }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Get the user first to check if it exists
    const user = await UserModel.findById(id).lean();
    if (!user) {
      throw new ApolloError('User not found', 'RESOURCE_NOT_FOUND');
    }
    
    // *************** Check if user is already deleted
    if (user.status === 'deleted') {
      throw new ApolloError('User is already deleted', 'ALREADY_DELETED');
    }

    // *************** Set status to deleted AND update deleted_at timestamp
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { 
        status: 'deleted',
        deleted_at: new Date()
      }
    ).lean();

    return updatedUser;
  } catch (error) {
    throw new ApolloError(error.message, error.code || 'DELETE_ERROR');
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
