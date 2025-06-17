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
 * @param {object} params - Parameters to validate
 * @param {object} params.schoolInput - Input object containing school data
 * @param {string} params.schoolInput.name - School name
 * @param {string} [params.schoolInput.address] - School address
 */
function ValidateCreateSchoolParameters({ schoolInput }) {
  // ***************  Check if input is provided
  if (!schoolInput) {
    throw new ApolloError('Input object must be provided', 'INVALID_INPUT');
  }

  // ***************  Check if name is a string or exists
  if (!schoolInput.name || typeof schoolInput.name !== 'string') {
    throw new ApolloError('School name is required and must be a non-empty string', 'INVALID_INPUT');
  }
  // ***************  Check if address is a string if provided
  if (schoolInput.address && typeof schoolInput.address !== 'string') {
    throw new ApolloError('School address must be a string', 'INVALID_INPUT');
  }
}

/**
 * Validates parameters for UpdateSchool resolver
 * 
 * @function ValidateUpdateSchoolParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - School ID
 * @param {object} params.schoolInput - Input object with fields to update
 * @param {string} [params.schoolInput.name] - Updated school name
 * @param {string} [params.schoolInput.address] - Updated school address
 */
function ValidateUpdateSchoolParameters({ id, schoolInput }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
  
  // *************** Check if input is provided
  if (!schoolInput) {
    throw new ApolloError('Input object must be provided for update', 'INVALID_INPUT');
  }
  
  // *************** Check if name is a string if provided
  if (schoolInput.name && typeof schoolInput.name !== 'string') {
    throw new ApolloError('School name must be a string', 'INVALID_INPUT');
  }
  // *************** Check if address is a string if provided
  if (schoolInput.address && typeof schoolInput.address !== 'string') {
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
