// *************** IMPORT MODULE ***************
const User = require('./user.model');
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');

// *************** IMPORT UTILITIES ***************
const { LogError } = require('../../utils/error-logger');

// *************** IMPORT VALIDATOR ***************
const { IsRequiredString, IsValidDateString } = require('../../validation/validation');

// *************** QUERY ***************
/**
 * Retrieves all users that haven't been soft deleted
 *
 * @async
 * @function GetAllUsers
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object containing filter parameters
 * @param {object} [args.filter] - Filter criteria for users
 * @throws {ApolloError} Throws ApolloError if an error occurs during retrieval
 * @returns {Promise<Array>} Array of user objects
 */
async function GetAllUsers(parent, { filter = {} }) {
  try {
    // *************** Build query with filters
    let query = {
      $and: [
        // *************** Filter by status, not by deleted_at
        { status: filter && filter.status ? filter.status : 'active' } // Default to active users
      ]
    };
    
    // *************** Add name filter if provided
    if (filter && filter.name) {
      query.$and.push({ 
        $or: [
          { first_name: { $regex: filter.name, $options: 'i' } },
          { last_name: { $regex: filter.name, $options: 'i' } }
        ]
      });
    }
    
    // *************** Add role filter if provided
    if (filter && filter.role) {
      query.$and.push({ role: filter.role });
    }

    // *************** Retrieve Users
    const users = await User.find(query);
    return users;
  } catch (error) {
    throw await LogError(error, 'DATABASE_ERROR', 'GetAllUsers', 'query', { filter });
  }
}

/**
 * Retrieves a single user by ID
 *
 * @async
 * @function GetUserById
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object containing id
 * @param {string} args.id - The ID of the user to retrieve
 * @throws {ApolloError} Throws ApolloError if user ID is not provided or an error occurs
 * @returns {Promise<object|null>} The user object or null if not found
 */
async function GetUserById(parent, { id }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('User ID is required', 'USER_ID_REQUIRED');
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid User ID format', 'INVALID_ID_FORMAT');
    }

    // *************** Retrieve User using status instead of deleted_at
    const user = await User.findOne({ _id: id, status: 'active' });
    if (!user) {
      throw new ApolloError('User not found', 'USER_NOT_FOUND');
    }
    return user;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR', 'GetUserById', 'query', { id });
  }
}

// *************** MUTATION ***************
/**
 * Creates a new user
 *
 * @async
 * @function CreateUser
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The user data
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
    if (!IsRequiredString(first_name)) {
      throw new ApolloError('First name is required', 'VALIDATION_ERROR');
    }
    if (!IsRequiredString(last_name)) {
      throw new ApolloError('Last name is required', 'VALIDATION_ERROR');
    }
    if (!IsRequiredString(password)) {
      throw new ApolloError('Password is required', 'VALIDATION_ERROR');
    }
    if (!IsRequiredString(role)) {
      throw new ApolloError('Role is required', 'VALIDATION_ERROR');
    }

    // *************** Create User
    const user = await User.create({ first_name, last_name, email, password, role });
    return user;
  } catch (error) {
    const errorCode = error.code === 11000 ? 'DUPLICATE_EMAIL' : (error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR');
    const errorMessage = error.code === 11000 ? 'Email already exists' : error.message;
    const customError = new Error(errorMessage);
    customError.stack = error.stack;
    
    // *************** Redact password in error logs
    throw await LogError(customError, errorCode, 'CreateUser', 'mutation', 
      { first_name, last_name, email, password: '[REDACTED]', role });
  }
}

/**
 * Updates an existing user
 *
 * @async
 * @function UpdateUser
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The update data
 * @param {string} args.id - User ID to update
 * @param {string} [args.first_name] - Updated first name
 * @param {string} [args.last_name] - Updated last name
 * @param {string} [args.email] - Updated email
 * @param {string} [args.password] - Updated password
 * @param {string} [args.role] - Updated role
 * @param {string} [args.status] - Updated status
 * @throws {ApolloError} Throws ApolloError if validation fails or update error occurs
 * @returns {Promise<object|null>} The updated user object or null if not found
 */
async function UpdateUser(parent, { id, first_name, last_name, email, password, role, status }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('User ID is required', 'USER_ID_REQUIRED');
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid User ID format', 'INVALID_ID_FORMAT');
    }

    // *************** Build update object with only provided fields
    const updateData = {};
    
    if (first_name !== undefined) {
      if (!IsRequiredString(first_name)) {
        throw new ApolloError('Invalid first name', 'VALIDATION_ERROR');
      }
      updateData.first_name = first_name;
    }

    if (last_name !== undefined) {
      if (!IsRequiredString(last_name)) {
        throw new ApolloError('Invalid last name', 'VALIDATION_ERROR');
      }
      updateData.last_name = last_name;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (password !== undefined) {
      if (!IsRequiredString(password)) {
        throw new ApolloError('Invalid password', 'VALIDATION_ERROR');
      }
      updateData.password = password;
    }

    if (role !== undefined) {
      if (!IsRequiredString(role)) {
        throw new ApolloError('Invalid role', 'VALIDATION_ERROR');
      }
      updateData.role = role;
    }
    
    if (status !== undefined) {
      if (!['active', 'deleted'].includes(status)) {
        throw new ApolloError('Invalid status value. Must be "active" or "deleted"', 'VALIDATION_ERROR');
      }
      updateData.status = status;
    }

    // *************** Update User
    const user = await User.findByIdAndUpdate(id, updateData);
    if (!user) {
      throw new ApolloError('User not found', 'USER_NOT_FOUND');
    }
    
    // *************** Retrieve updated user
    const updatedUser = await User.findById(id);
    return updatedUser;
  } catch (error) {
    const requestParams = { id, first_name, last_name, email, password: password ? '[REDACTED]' : undefined, role, status };
    const errorCode = error.code === 11000 ? 'DUPLICATE_EMAIL' : (error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR');
    const errorMessage = error.code === 11000 ? 'Email already exists' : error.message;
    const customError = new Error(errorMessage);
    customError.stack = error.stack;
    
    throw await LogError(customError, errorCode, 'UpdateUser', 'mutation', requestParams);
  }
}

/**
 * Soft deletes a user by setting status to 'deleted' and updating deleted_at timestamp
 *
 * @async
 * @function DeleteUser
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object
 * @param {string} args.id - User ID to delete
 * @throws {ApolloError} Throws ApolloError if user ID is not provided or deletion error occurs
 * @returns {Promise<object|null>} The deleted user object or null if not found
 */
async function DeleteUser(parent, { id }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('User ID is required', 'USER_ID_REQUIRED');
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid User ID format', 'INVALID_ID_FORMAT');
    }

    // *************** Set status to deleted AND update deleted_at timestamp
    const user = await User.findByIdAndUpdate(
      id,
      { 
        status: 'deleted',
        deleted_at: new Date().toISOString() 
      }
    );
    if (!user) {
      throw new ApolloError('User not found', 'USER_NOT_FOUND');
    }
    
    // *************** Retrieve updated user
    const updatedUser = await User.findById(id);
    return updatedUser;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : 'DATABASE_ERROR', 'DeleteUser', 'mutation', { id });
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
