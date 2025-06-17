// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const Mongoose = require('mongoose');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates parameters for GetSchoolById resolver
 * 
 * @function ValidateGetSchoolByIdParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - School ID
 */
function ValidateGetSchoolByIdParameters({ id }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
}

/**
 * Validates parameters for CreateSchool resolver
 * 
 * @function ValidateCreateSchoolParameters
 * @param {object} school_input - Input object containing school data
 * @param {string} school_input.name - School name
 * @param {string} [school_input.address] - School address
 */
function ValidateCreateSchoolParameters(school_input) {
  // ***************  Check if input is provided
  if (!school_input) {
    throw new ApolloError('Input object must be provided', 'INVALID_INPUT');
  }

  // ***************  Check if name is a string or exists
  if (!school_input.name || typeof school_input.name !== 'string') {
    throw new ApolloError('School name is required and must be a non-empty string', 'INVALID_INPUT');
  }
  // ***************  Check if address is a string if provided
  if (school_input.address && typeof school_input.address !== 'string') {
    throw new ApolloError('School address must be a string', 'INVALID_INPUT');
  }
}

/**
 * Validates parameters for UpdateSchool resolver
 * 
 * @function ValidateUpdateSchoolParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - School ID
 * @param {object} params.school_input - Input object with fields to update
 * @param {string} [params.school_input.name] - Updated school name
 * @param {string} [params.school_input.address] - Updated school address
 */
function ValidateUpdateSchoolParameters({ id, school_input }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
  
  // *************** Check if input is provided
  if (!school_input) {
    throw new ApolloError('Input object must be provided for update', 'INVALID_INPUT');
  }
  
  // *************** Check if name is a string if provided
  if (school_input.name && typeof school_input.name !== 'string') {
    throw new ApolloError('School name must be a string', 'INVALID_INPUT');
  }
  // *************** Check if address is a string if provided
  if (school_input.address && typeof school_input.address !== 'string') {
    throw new ApolloError('School address must be a string', 'INVALID_INPUT');
  }
}

/**
 * *************** Validates parameters for DeleteSchool resolver
 * 
 * @function ValidateDeleteSchoolParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - School ID
 */
function ValidateDeleteSchoolParameters({ id }) {
  // *************** check if ID exists and is valid
  ValidateMongoId(id);
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateGetSchoolByIdParameters,
  ValidateCreateSchoolParameters,
  ValidateUpdateSchoolParameters,
  ValidateDeleteSchoolParameters
};
