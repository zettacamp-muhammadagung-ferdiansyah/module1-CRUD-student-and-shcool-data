// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates parameters for CreateStudent and UpdateStudent resolvers
 * 
 * @function ValidateCreateUpdateStudentParameters
 * @param {object} params - Parameters to validate
 * @param {string} [params.id] - Student ID (required for update, not for create)
 * @param {object} params.studentInput - Input object with fields to update or create
 * @param {string} [params.studentInput.first_name] - Student's first name
 * @param {string} [params.studentInput.last_name] - Student's last name
 * @param {string} [params.studentInput.email] - Student's email
 * @param {string} [params.studentInput.date_of_birth] - Student's date of birth
 * @param {string} [params.studentInput.school_id] - School ID
 */
function ValidateCreateUpdateStudentParameters({ id, studentInput }) {
  // *************** Check if ID is valid when provided (for updates)
  if (id) {
    ValidateMongoId(id);
  }
  
  // *************** Check if input is provided
  if (!studentInput) {
    throw new ApolloError('Input object must be provided', 'INVALID_INPUT');
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

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateUpdateStudentParameters,
};
