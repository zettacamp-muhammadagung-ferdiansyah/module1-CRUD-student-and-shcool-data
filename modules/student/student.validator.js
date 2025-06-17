// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const Mongoose = require('mongoose');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates parameters for GetStudentById resolver
 * 
 * @function ValidateGetStudentByIdParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - Student ID
 */
function ValidateGetStudentByIdParameters({ id }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
}

/**
 * Validates parameters for CreateStudent resolver
 * 
 * @function ValidateCreateStudentParameters
 * @param {object} params - Parameters to validate
 * @param {object} params - Input object containing student data
 * @param {string} params.first_name - Student's first name
 * @param {string} params.last_name - Student's last name
 * @param {string} params.email - Student's email
 * @param {string} [params.date_of_birth] - Student's date of birth
 * @param {string} params.school_id - School ID
 */
function ValidateCreateStudentParameters(input) {
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
  
  // *************** Validate email
  if (!input.email || typeof input.email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate date_of_birth if provided
  if (input.date_of_birth && typeof input.date_of_birth !== 'string') {
    throw new ApolloError('Date of birth must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate school_id
  ValidateMongoId(input.school_id);
}

/**
 * Validates parameters for UpdateStudent resolver
 * 
 * @function ValidateUpdateStudentParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - Student ID
 * @param {object} params.input - Input object with fields to update
 * @param {string} [params.input.first_name] - Updated first name
 * @param {string} [params.input.last_name] - Updated last name
 * @param {string} [params.input.email] - Updated email
 * @param {string} [params.input.date_of_birth] - Updated date of birth
 * @param {string} [params.input.school_id] - Updated school ID
 */
function ValidateUpdateStudentParameters({ id, input }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
  
  // *************** Check if input is provided
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
  
  // *************** Validate date_of_birth if provided
  if (input.date_of_birth && typeof input.date_of_birth !== 'string') {
    throw new ApolloError('Date of birth must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate school_id if provided
  if (input.school_id) {
    ValidateMongoId(input.school_id);
  }
}

/**
 * *************** Validates parameters for DeleteStudent resolver
 * 
 * @function ValidateDeleteStudentParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - Student ID
 */
function ValidateDeleteStudentParameters({ id }) {
  // *************** check if ID exists and is valid
  ValidateMongoId(id);
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateGetStudentByIdParameters,
  ValidateCreateStudentParameters,
  ValidateUpdateStudentParameters,
  ValidateDeleteStudentParameters
};
