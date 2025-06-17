// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const Mongoose = require('mongoose');

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
 * Validates parameters for CreateUser resolver
 * 
 * @function ValidateCreateUserParameters
 * @param {object} input - Input object containing user data
 * @param {string} input.first_name - User's first name
 * @param {string} input.last_name - User's last name
 * @param {string} input.email - User's email
 * @param {string} input.password - User's password
 * @param {string} input.role - User's role
 */
function ValidateCreateUserParameters(input) {
  // ***************  Check if input is provided
  if (!input) {
    throw new ApolloError('Input object must be provided', 'INVALID_INPUT');
  }

  // *************** Validate required fields
  if (!input.first_name || typeof input.first_name !== 'string') {
    throw new ApolloError('First name must be a string', 'INVALID_INPUT');
  }
  
  if (!input.last_name || typeof input.last_name !== 'string') {
    throw new ApolloError('Last name must be a string', 'INVALID_INPUT');
  }
  
  if (!input.password || typeof input.password !== 'string') {
    throw new ApolloError('Password must be a string', 'INVALID_INPUT');
  }
  
  if (!input.role || typeof input.role !== 'string') {
    throw new ApolloError('Role must be a string', 'INVALID_INPUT');
  }

  if (!input.email || typeof input.email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
}

/**
 * Validates parameters for UpdateUser resolver
 * 
 * @function ValidateUpdateUserParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - User ID
 * @param {object} params.input - Input object with fields to update
 * @param {string} [params.input.first_name] - Updated first name
 * @param {string} [params.input.last_name] - Updated last name
 * @param {string} [params.input.email] - Updated email
 * @param {string} [params.input.password] - Updated password
 * @param {string} [params.input.role] - Updated role
 */
function ValidateUpdateUserParameters({ id, input }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
  
  // ***************  Check if input is provided
  if (!input) {
    throw new ApolloError('Input object must be provided for update', 'INVALID_INPUT');
  }
  
  // *************** Validate first_name if provided
  if (input.first_name && typeof input.first_name !== 'string') {
    throw new ApolloError('First name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate last_name if provided
  if (input.last_name && typeof input.last_name !== 'string') {
    throw new ApolloError('Last name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate email if provided
  if (input.email && typeof input.email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate password if provided
  if (input.password && typeof input.password !== 'string') {
    throw new ApolloError('Password must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate role if provided
  if (input.role && typeof input.role !== 'string') {
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
  ValidateCreateUserParameters,
  ValidateUpdateUserParameters,
  ValidateDeleteUserParameters
};
