// *************** IMPORT MODULE ***************
const User = require('./user.model');
const { ApolloError } = require('apollo-server');


// *************** IMPORT VALIDATOR ***************
const { IsRequiredString, IsEmailFormat } = require('../../validation/validation');

// *************** QUERY ***************
/**
 * Retrieves all users that haven't been soft deleted
 *
 * @async
 * @function GetAllUsers
 * @param {object} parent - The parent object (unused in this function)
 * @param {object} args - The arguments object (unused in this function)
 * @throws {ApolloError} Throws ApolloError if an error occurs during retrieval
 * @returns {Promise<Array>} Array of user objects
 */
async function GetAllUsers(parent, args) {
  try {
    // *************** Retrieve Users
    const users = await User.find({ deleted_at: null });
    return users;
  } catch (error) {
    throw new ApolloError(error.message, 'DATABASE_ERROR');
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

    // *************** Retrieve User
    const user = await User.findOne({ _id: id, deleted_at: null });
    if (!user) {
      throw new ApolloError('User not found', 'USER_NOT_FOUND');
    }
    return user;
  } catch (error) {
    throw new ApolloError(error.message, 'DATABASE_ERROR');
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
async function CreateUser(parent, args) {
  try {
    // *************** Validate Input
    if (!IsRequiredString(args.first_name)) {
      throw new ApolloError('First name is required', 'VALIDATION_ERROR');
    }
    if (!IsRequiredString(args.last_name)) {
      throw new ApolloError('Last name is required', 'VALIDATION_ERROR');
    }
    if (!IsEmailFormat(args.email)) {
      throw new ApolloError('Invalid email format', 'VALIDATION_ERROR');
    }
    if (!IsRequiredString(args.password)) {
      throw new ApolloError('Password is required', 'VALIDATION_ERROR');
    }
    if (!IsRequiredString(args.role)) {
      throw new ApolloError('Role is required', 'VALIDATION_ERROR');
    }

    // *************** Create User
    const user = await User.create(args);
    return user;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApolloError('Email already exists', 'DUPLICATE_EMAIL');
    }
    throw new ApolloError(error.message, 'DATABASE_ERROR');
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
 * @throws {ApolloError} Throws ApolloError if validation fails or update error occurs
 * @returns {Promise<object|null>} The updated user object or null if not found
 */
async function UpdateUser(parent, { id, first_name, last_name, email, password, role }) {
  try {
    // *************** Validate Input
    if (!id) {
      throw new ApolloError('User ID is required', 'USER_ID_REQUIRED');
    }

    // Build update object with only provided fields
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
      if (!IsEmailFormat(email)) {
        throw new ApolloError('Invalid email format', 'VALIDATION_ERROR');
      }
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

    // *************** Update User
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      throw new ApolloError('User not found', 'USER_NOT_FOUND');
    }
    return user;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApolloError('Email already exists', 'DUPLICATE_EMAIL');
    }
    throw new ApolloError(error.message, 'DATABASE_ERROR');
  }
}

/**
 * Soft deletes a user by setting deleted_at timestamp
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

    // *************** Soft Delete User
    const user = await User.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!user) {
      throw new ApolloError('User not found', 'USER_NOT_FOUND');
    }
    return user;
  } catch (error) {
    throw new ApolloError(error.message, 'DATABASE_ERROR');
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
