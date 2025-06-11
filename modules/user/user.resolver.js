// *************** IMPORT MODULE ***************
const User = require('./user.model');
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');
const validator = require('validator');

// *************** IMPORT UTILITIES ***************
const { LogError } = require('../../utils/error-logger');

// *************** IMPORT VALIDATOR ***************
const { IsRequiredString, IsValidObjectId, IsValidDateString, ErrorCode } = require('../../validation/validation');

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
    const andConditions = [
      // *************** Filter by status, not by deleted_at
      { status: filter && filter.status ? filter.status : 'active' } // Default to active users
    ];
    
    // *************** Add name filter if provided
    if (filter && filter.name) {
      andConditions[andConditions.length] = { 
        $or: [
          { first_name: { $regex: filter.name, $options: 'i' } },
          { last_name: { $regex: filter.name, $options: 'i' } }
        ]
      };
    }
    
    // *************** Add role filter if provided
    if (filter && filter.role) {
      andConditions[andConditions.length] = { role: filter.role };
    }

    // *************** Create query with MongoDB $and operator for filter conditions
    const query = { $and: andConditions };

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
      throw new ApolloError('User ID is required', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid User ID format', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }

    // *************** Retrieve User using status instead of deleted_at
    const user = await User.findOne({ _id: id, status: 'active' });
    if (!user) {
      throw new ApolloError('User not found', ErrorCode.RESOURCE_NOT_FOUND, {
        field: 'id'
      });
    }
    return user;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : ErrorCode.SERVER_ERROR, 'GetUserById', 'query', { id });
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
    IsRequiredString(first_name, 'First name');
    IsRequiredString(last_name, 'Last name');
    IsRequiredString(password, 'Password');
    IsRequiredString(role, 'Role');
    
    // *************** Validate email if provided
    if (email && !validator.isEmail(email)) {
      throw new ApolloError('Invalid email format', ErrorCode.INVALID_INPUT, {
        field: 'email'
      });
    }

    // *************** Create User
    const user = await User.create({ first_name, last_name, email, password, role });
    return user;
  } catch (error) {
    const errorCode = error.code === 11000 ? ErrorCode.INVALID_INPUT : (error.extensions && error.extensions.code ? error.extensions.code : ErrorCode.SERVER_ERROR);
    const errorMessage = error.code === 11000 ? 'Email already exists' : error.message;
    const customError = new Error(errorMessage);
    customError.stack = error.stack;
    
    // Add field metadata for duplicate email errors
    const extensions = error.code === 11000 ? { field: 'email' } : (error.extensions || {});
    
    // *************** Redact password in error logs
    throw await LogError(
      Object.assign(customError, { extensions }),
      errorCode, 
      'CreateUser', 
      'mutation', 
      { first_name, last_name, email, password: '[REDACTED]', role }
    );
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
      throw new ApolloError('User ID is required', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid User ID format', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }

    // *************** Build update object with only provided fields
    const updateData = {};
    
    if (first_name !== undefined) {
      IsRequiredString(first_name, 'First name');
      updateData.first_name = first_name;
    }

    if (last_name !== undefined) {
      IsRequiredString(last_name, 'Last name');
      updateData.last_name = last_name;
    }

    if (email !== undefined) {
      if (email && !validator.isEmail(email)) {
        throw new ApolloError('Invalid email format', ErrorCode.INVALID_INPUT, {
          field: 'email'
        });
      }
      updateData.email = email;
    }

    if (password !== undefined) {
      IsRequiredString(password, 'Password');
      updateData.password = password;
    }

    if (role !== undefined) {
      IsRequiredString(role, 'Role');
      updateData.role = role;
    }
    
    if (status !== undefined) {
      const validStatus = ['active', 'deleted'];
      if (!validStatus.includes(status)) {
        throw new ApolloError(
          `Invalid status value. Must be one of: ${validStatus.join(', ')}`, 
          ErrorCode.INVALID_INPUT, 
          {
            field: 'status',
            allowedValues: validStatus
          }
        );
      }
      updateData.status = status;
    }

    // *************** Update User
    const user = await User.findByIdAndUpdate(id, updateData);
    if (!user) {
      throw new ApolloError('User not found', ErrorCode.RESOURCE_NOT_FOUND, {
        field: 'id'
      });
    }
    
    // *************** Retrieve updated user
    const updatedUser = await User.findById(id);
    return updatedUser;
  } catch (error) {
    const requestParams = { id, first_name, last_name, email, password: password ? '[REDACTED]' : undefined, role, status };
    const errorCode = error.code === 11000 ? ErrorCode.INVALID_INPUT : (error.extensions && error.extensions.code ? error.extensions.code : ErrorCode.SERVER_ERROR);
    const errorMessage = error.code === 11000 ? 'Email already exists' : error.message;
    const customError = new Error(errorMessage);
    customError.stack = error.stack;
    
    // Add field metadata for duplicate email errors
    const extensions = error.code === 11000 ? { field: 'email' } : (error.extensions || {});
    
    throw await LogError(
      Object.assign(customError, { extensions }),
      errorCode, 
      'UpdateUser', 
      'mutation', 
      requestParams
    );
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
      throw new ApolloError('User ID is required', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
    }
    
    // *************** Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApolloError('Invalid User ID format', ErrorCode.INVALID_INPUT, {
        field: 'id'
      });
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
      throw new ApolloError('User not found', ErrorCode.RESOURCE_NOT_FOUND, {
        field: 'id'
      });
    }
    
    // *************** Retrieve updated user
    const updatedUser = await User.findById(id);
    return updatedUser;
  } catch (error) {
    throw await LogError(error, error.extensions && error.extensions.code ? error.extensions.code : ErrorCode.SERVER_ERROR, 'DeleteUser', 'mutation', { id });
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
