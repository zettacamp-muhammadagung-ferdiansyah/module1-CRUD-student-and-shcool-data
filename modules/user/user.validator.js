// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates parameters for GetUserById resolver
 * 
 * @function ValidateGetUserByIdParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - User IDa
 */
function ValidateGetUserByIdParameters({ id }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
}

/**
 * Validates parameters for UpdateUser resolver
 * 
 * @function ValidateCreateUpdateUserParameters
 * @param {object} params - Parameters to validate
 * @param {string} [params.id] - User ID
 * @param {object} params.userInput - Input object with fields to update
 * @param {string} [params.userInput.first_name] - Updated first name
 * @param {string} [params.userInput.last_name] - Updated last name
 * @param {string} [params.userInput.email] - Updated email
 * @param {string} [params.userInput.password] - Updated password
 * @param {string} [params.userInput.role] - Updated role
 */
function ValidateCreateUpdateUserParameters({ id, userInput }) {
  // *************** Check if ID exists and is valid
  if (id) {
      ValidateMongoId(id);
    }
  
  // ***************  Check if input is provided
  if (!userInput) {
    throw new ApolloError('Input object must be provided for update', 'INVALID_INPUT');
  }
  
  // *************** Validate first_name if provided
  if (userInput.first_name && typeof userInput.first_name !== 'string') {
    throw new ApolloError('First name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate last_name if provided
  if (userInput.last_name && typeof userInput.last_name !== 'string') {
    throw new ApolloError('Last name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate email if provided
  if (userInput.email && typeof userInput.email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate password if provided
  if (userInput.password && typeof userInput.password !== 'string') {
    throw new ApolloError('Password must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate role if provided
  if (userInput.role && typeof userInput.role !== 'string') {
    throw new ApolloError('Role must be a string', 'INVALID_INPUT');
  }
}

/**
 * *************** Validates parameters for DeleteUser resolver
 * 
 * @function ValidateDeleteUserParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - User ID
 */
function ValidateDeleteUserParameters({ id }) {
  // *************** check if ID exists and is valid
  ValidateMongoId(id);
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateGetUserByIdParameters,
  ValidateCreateUpdateUserParameters,
  ValidateDeleteUserParameters
};
