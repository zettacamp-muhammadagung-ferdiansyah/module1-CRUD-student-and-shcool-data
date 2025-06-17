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
 * @param {object} student_input - Input object containing student data
 * @param {string} student_input.first_name - Student's first name
 * @param {string} student_input.last_name - Student's last name
 * @param {string} student_input.email - Student's email
 * @param {string} [student_input.date_of_birth] - Student's date of birth
 * @param {string} student_input.school_id - School ID
 */
function ValidateCreateStudentParameters(student_input) {
  // ***************  Check if input is provided
  if (!student_input) {
    throw new ApolloError('Input object must be provided', 'INVALID_INPUT');
  }

  // *************** Validate required fields
  if (!student_input.first_name || typeof student_input.first_name !== 'string') {
    throw new ApolloError('First name must be a string', 'INVALID_INPUT');
  }
  
  if (!student_input.last_name || typeof student_input.last_name !== 'string') {
    throw new ApolloError('Last name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate email
  if (!student_input.email || typeof student_input.email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate date_of_birth if provided
  if (student_input.date_of_birth && typeof student_input.date_of_birth !== 'string') {
    throw new ApolloError('Date of birth must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate school_id
  ValidateMongoId(student_input.school_id);
}

/**
 * Validates parameters for UpdateStudent resolver
 * 
 * @function ValidateUpdateStudentParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - Student ID
 * @param {object} params.student_input - Input object with fields to update
 * @param {string} [params.student_input.first_name] - Updated first name
 * @param {string} [params.student_input.last_name] - Updated last name
 * @param {string} [params.student_input.email] - Updated email
 * @param {string} [params.student_input.date_of_birth] - Updated date of birth
 * @param {string} [params.student_input.school_id] - Updated school ID
 */
function ValidateUpdateStudentParameters({ id, student_input }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
  
  // *************** Check if input is provided
  if (!student_input) {
    throw new ApolloError('Input object must be provided for update', 'INVALID_INPUT');
  }
  
  // *************** Validate first_name if provided
  if (student_input.first_name && typeof student_input.first_name !== 'string') {
    throw new ApolloError('First name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate last_name if provided
  if (student_input.last_name && typeof student_input.last_name !== 'string') {
    throw new ApolloError('Last name must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate email if provided
  if (student_input.email && typeof student_input.email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate date_of_birth if provided
  if (student_input.date_of_birth && typeof student_input.date_of_birth !== 'string') {
    throw new ApolloError('Date of birth must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate school_id if provided
  if (student_input.school_id) {
    ValidateMongoId(student_input.school_id);
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
