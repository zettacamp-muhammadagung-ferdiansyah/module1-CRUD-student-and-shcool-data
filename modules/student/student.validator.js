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
 * @param {object} params.studentInput - Input object containing student data
 * @param {string} params.studentInput.first_name - Student's first name
 * @param {string} params.studentInput.last_name - Student's last name
 * @param {string} params.studentInput.email - Student's email
 * @param {string} [params.studentInput.date_of_birth] - Student's date of birth
 * @param {string} params.studentInput.school_id - School ID
 */
function ValidateCreateStudentParameters({ studentInput }) {
  // ***************  Check if input is provided
  if (!studentInput) {
    throw new ApolloError('Input object must be provided', 'INVALID_INPUT');
  }

  // *************** Validate required fields
  if (!studentInput.first_name || typeof studentInput.first_name !== 'string') {
    throw new ApolloError('First name must be a string', 'INVALID_INPUT');
  }
  
  if (!studentInput.last_name || typeof studentInput.last_name !== 'string') {
    throw new ApolloError('Last name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate email
  if (!studentInput.email || typeof studentInput.email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate date_of_birth if provided
  if (studentInput.date_of_birth && typeof studentInput.date_of_birth !== 'string') {
    throw new ApolloError('Date of birth must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate school_id
  ValidateMongoId(studentInput.school_id);
}

/**
 * Validates parameters for UpdateStudent resolver
 * 
 * @function ValidateUpdateStudentParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - Student ID
 * @param {object} params.studentInput - Input object with fields to update
 * @param {string} [params.studentInput.first_name] - Updated first name
 * @param {string} [params.studentInput.last_name] - Updated last name
 * @param {string} [params.studentInput.email] - Updated email
 * @param {string} [params.studentInput.date_of_birth] - Updated date of birth
 * @param {string} [params.studentInput.school_id] - Updated school ID
 */
function ValidateUpdateStudentParameters({ id, studentInput }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
  
  // *************** Check if input is provided
  if (!studentInput) {
    throw new ApolloError('Input object must be provided for update', 'INVALID_INPUT');
  }
  
  // *************** Validate first_name if provided
  if (studentInput.first_name && typeof studentInput.first_name !== 'string') {
    throw new ApolloError('First name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate last_name if provided
  if (studentInput.last_name && typeof studentInput.last_name !== 'string') {
    throw new ApolloError('Last name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate email if provided
  if (studentInput.email && typeof studentInput.email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate date_of_birth if provided
  if (studentInput.date_of_birth && typeof studentInput.date_of_birth !== 'string') {
    throw new ApolloError('Date of birth must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate school_id if provided
  if (studentInput.school_id) {
    ValidateMongoId(studentInput.school_id);
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
