// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

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
 * Validates parameters for UpdateSchool resolver
 * 
 * @function ValidateCreateUpdateSchoolParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - School ID
 * @param {object} params.schoolInput - Input object with fields to update
 * @param {string} [params.schoolInput.name] - Updated school name
 * @param {string} [params.schoolInput.commercial_name] - Updated school's public or brand name
 * @param {string} [params.schoolInput.address] - Updated full address of the school
 * @param {string} [params.schoolInput.city] - Updated city where the school is located
 * @param {string} [params.schoolInput.country] - Updated country where the school operates
 * @param {string} [params.schoolInput.zipcode] - Updated postal code of the school's location
 * @param {string} [params.schoolInput.logo] - Updated URL or path to the school's logo
 */
function ValidateCreateUpdateSchoolParameters({ id, schoolInput }) {
  // *************** Check if ID exists and is valid for updates only
  if (id) {
    ValidateMongoId(id);
  }
  
  // *************** Check if input is provided
  if (!schoolInput) {
    throw new ApolloError('Input object must be provided for update', 'INVALID_INPUT');
  }
  
  // *************** Check if name is a string if provided
  if (schoolInput.name && typeof schoolInput.name !== 'string') {
    throw new ApolloError('School name must be a string', 'INVALID_INPUT');
  }

  // *************** Check if commercial_name is a string if provided
  if (schoolInput.commercial_name && typeof schoolInput.commercial_name !== 'string') {
    throw new ApolloError('School commercial name must be a string', 'INVALID_INPUT');
  }

  // *************** Check if address is a string if provided
  if (schoolInput.address && typeof schoolInput.address !== 'string') {
    throw new ApolloError('School address must be a string', 'INVALID_INPUT');
  }

  // *************** Check if city is a string if provided
  if (schoolInput.city && typeof schoolInput.city !== 'string') {
    throw new ApolloError('School city must be a string', 'INVALID_INPUT');
  }

  // *************** Check if country is a string if provided
  if (schoolInput.country && typeof schoolInput.country !== 'string') {
    throw new ApolloError('School country must be a string', 'INVALID_INPUT');
  }

  // *************** Check if zipcode is a string if provided
  if (schoolInput.zipcode && typeof schoolInput.zipcode !== 'string') {
    throw new ApolloError('School zipcode must be a string', 'INVALID_INPUT');
  }

  // *************** Check if logo is a string if provided
  if (schoolInput.logo && typeof schoolInput.logo !== 'string') {
    throw new ApolloError('School logo must be a string', 'INVALID_INPUT');
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
  ValidateCreateUpdateSchoolParameters,
  ValidateDeleteSchoolParameters
};
