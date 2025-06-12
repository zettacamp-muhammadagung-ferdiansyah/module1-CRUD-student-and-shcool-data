// *************** IMPORT VALIDATORS ***************
const { ValidateObjectId } = require('../../validation/mongo.validator');
const { ValidateRequiredString, ValidateEmail } = require('../../validation/string.validator');
const { ValidateDate } = require('../../validation/date.validator');
const { ApolloError } = require('apollo-server');

/**
 * Validates parameters for GetStudentById resolver
 * 
 * @function ValidateGetStudentByIdParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - Student ID
 */
function ValidateGetStudentByIdParameters({ id }) {
  ValidateObjectId(id, 'Student ID');
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
  ValidateRequiredString(first_name, 'First name');
  ValidateRequiredString(last_name, 'Last name');
  
  // *************** Validate email
  if (email) {
    ValidateEmail(email, 'Email');
  }
  
  // *************** Validate date_of_birth if provided
  if (date_of_birth) {
    ValidateDate(date_of_birth, 'Date of birth');
  }
  
  // *************** Validate school_id
  ValidateObjectId(school_id, 'School ID');
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
 * @param {string} [params.status] - Updated status
 */
function ValidateUpdateStudentParameters({ id, first_name, last_name, email, date_of_birth, school_id, status }) {
  ValidateObjectId(id, 'Student ID');
  
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
  
  // *************** Validate date_of_birth if provided
  if (date_of_birth !== undefined) {
    ValidateDate(date_of_birth, 'Date of birth');
  }
  
  // *************** Validate school_id if provided
  if (school_id !== undefined) {
    ValidateObjectId(school_id, 'School ID');
  }
  
  // *************** Validate status if provided
  if (status !== undefined && !['active', 'deleted'].includes(status)) {
    throw new ApolloError(
      'Student status must be either "active" or "deleted".',
      'INVALID_INPUT',
      { field: 'status' }
    );
  }
}

/**
 * Validates parameters for DeleteStudent resolver
 * 
 * @function ValidateDeleteStudentParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - Student ID
 */
function ValidateDeleteStudentParameters({ id }) {
  ValidateObjectId(id, 'Student ID');
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateGetStudentByIdParameters,
  ValidateCreateStudentParameters,
  ValidateUpdateStudentParameters,
  ValidateDeleteStudentParameters
};
