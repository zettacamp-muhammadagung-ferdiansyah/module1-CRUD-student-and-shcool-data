// *************** IMPORT VALIDATORS ***************
const { ValidateObjectId } = require('../../validation/mongo.validator');
const { ValidateRequiredString, ValidateEmail } = require('../../validation/string.validator');
const { ApolloError } = require('apollo-server');

/**
 * Validates parameters for GetUserById resolver
 * 
 * @function ValidateGetUserByIdParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - User ID
 */
function ValidateGetUserByIdParameters({ id }) {
  ValidateObjectId(id, 'User ID');
}

/**
 * Validates parameters for CreateUser resolver
 * 
 * @function ValidateCreateUserParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.first_name - User's first name
 * @param {string} params.last_name - User's last name
 * @param {string} params.email - User's email
 * @param {string} params.password - User's password
 * @param {string} params.role - User's role
 */
function ValidateCreateUserParameters({ first_name, last_name, email, password, role }) {
  // *************** Validate required fields
  ValidateRequiredString(first_name, 'First name');
  ValidateRequiredString(last_name, 'Last name');
  ValidateRequiredString(password, 'Password');
  ValidateRequiredString(role, 'Role');
  
  // *************** Validate email
  if (email) {
    ValidateEmail(email, 'Email');
  }
}

/**
 * Validates parameters for UpdateUser resolver
 * 
 * @function ValidateUpdateUserParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - User ID
 * @param {string} [params.first_name] - Updated first name
 * @param {string} [params.last_name] - Updated last name
 * @param {string} [params.email] - Updated email
 * @param {string} [params.password] - Updated password
 * @param {string} [params.role] - Updated role
 * @param {string} [params.status] - Updated status
 */
function ValidateUpdateUserParameters({ id, first_name, last_name, email, password, role, status }) {
  ValidateObjectId(id, 'User ID');
  
  // *************** Validate first_name if provided
  if (first_name !== undefined) {
    ValidateRequiredString(first_name, 'First name');
  }
  
  // *************** Validate last_name if provided
  if (last_name !== undefined) {
    ValidateRequiredString(last_name, 'Last name');
  }
  
  // *************** Validate email if provided
  if (email !== undefined && email !== null) {
    ValidateEmail(email, 'Email');
  }
  
  // *************** Validate password if provided
  if (password !== undefined) {
    ValidateRequiredString(password, 'Password');
  }
  
  // *************** Validate role if provided
  if (role !== undefined) {
    ValidateRequiredString(role, 'Role');
  }
  
  // *************** Validate status if provided
  if (status !== undefined && !['active', 'deleted'].includes(status)) {
    throw new ApolloError(
      'User status must be either "active" or "deleted".',
      'INVALID_INPUT',
      { field: 'status' }
    );
  }
}

/**
 * Validates parameters for DeleteUser resolver
 * 
 * @function ValidateDeleteUserParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - User ID
 */
function ValidateDeleteUserParameters({ id }) {
  ValidateObjectId(id, 'User ID');
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateGetUserByIdParameters,
  ValidateCreateUserParameters,
  ValidateUpdateUserParameters,
  ValidateDeleteUserParameters
};
