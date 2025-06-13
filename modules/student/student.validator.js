// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');

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
 * @param {string} params.first_name - Student's first name
 * @param {string} params.last_name - Student's last name
 * @param {string} params.email - Student's email
 * @param {string} [params.date_of_birth] - Student's date of birth
 * @param {string} params.school_id - School ID
 */
function ValidateCreateStudentParameters({ first_name, last_name, email, date_of_birth, school_id }) {
  // *************** Validate required fields
  if (!first_name || typeof first_name !== 'string') {
    throw new ApolloError('First name is required and must be a non-empty string', 'INVALID_INPUT');
  }
  
  if (!last_name || typeof last_name !== 'string') {
    throw new ApolloError('Last name is required and must be a non-empty string', 'INVALID_INPUT');
  }
  
  // *************** Validate email
  if (email && typeof email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate date_of_birth if provided
  if (date_of_birth && typeof date_of_birth !== 'string') {
    throw new ApolloError('Date of birth must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate school_id
  ValidateMongoId(school_id);
}

/**
 * Validates parameters for UpdateStudent resolver
 * 
 * @function ValidateUpdateStudentParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - Student ID
 * @param {string} [params.first_name] - Updated first name
 * @param {string} [params.last_name] - Updated last name
 * @param {string} [params.email] - Updated email
 * @param {string} [params.date_of_birth] - Updated date of birth
 * @param {string} [params.school_id] - Updated school ID
 */
function ValidateUpdateStudentParameters({ id, first_name, last_name, email, date_of_birth, school_id }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
  
  // *************** Validate first_name if provided
  if (first_name && (!first_name || typeof first_name !== 'string')) {
    throw new ApolloError('First name must be a non-empty string', 'INVALID_INPUT');
  }
  
  // *************** Validate last_name if provided
  if (last_name && (!last_name || typeof last_name !== 'string')) {
    throw new ApolloError('Last name must be a non-empty string', 'INVALID_INPUT');
  }
  
  // *************** Validate email if provided
  if (email && typeof email !== 'string') {
    throw new ApolloError('Email must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate date_of_birth if provided
  if (date_of_birth && typeof date_of_birth !== 'string') {
    throw new ApolloError('Date of birth must be a string', 'INVALID_INPUT');
  }
  
  // *************** Validate school_id
  ValidateMongoId(school_id);
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
