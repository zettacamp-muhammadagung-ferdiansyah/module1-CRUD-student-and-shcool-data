// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates parameters for GetUserById resolver
 * 
 * @function ValidateGetUserByIdParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - User ID
 */
function ValidateGetUserByIdParameters({ id }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
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
  if (!first_name || typeof first_name !== 'string') {
    throw new ApolloError('First name is required and must be a non-empty string', 'INVALID_INPUT');
  }
  
  if (!last_name || typeof last_name !== 'string') {
    throw new ApolloError('Last name is required and must be a non-empty string', 'INVALID_INPUT');
  }
  
  if (!password || typeof password !== 'string') {
    throw new ApolloError('Password is required and must be a non-empty string', 'INVALID_INPUT');
  }
  
  if (!role || typeof role !== 'string') {
    throw new ApolloError('Role is required and must be a non-empty string', 'INVALID_INPUT');
  }

  if (email && typeof email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
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
 */
function ValidateUpdateUserParameters({ id, first_name, last_name, email, password, role }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
  
  // *************** Validate first_name if provided
  if (first_name !== undefined && (!first_name || typeof first_name !== 'string')) {
    throw new ApolloError('First name must be a non-empty string', 'INVALID_INPUT');
  }
  
  // *************** Validate last_name if provided
  if (last_name !== undefined && (!last_name || typeof last_name !== 'string')) {
    throw new ApolloError('Last name must be a non-empty string', 'INVALID_INPUT');
  }
  
  // *************** Validate email if provided
  if (email !== undefined && email !== null && typeof email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate password if provided
  if (password !== undefined && (!password || typeof password !== 'string')) {
    throw new ApolloError('Password must be a non-empty string', 'INVALID_INPUT');
  }
  
  // *************** Validate role if provided
  if (role !== undefined && (!role || typeof role !== 'string')) {
    throw new ApolloError('Role must be a non-empty string', 'INVALID_INPUT');
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
