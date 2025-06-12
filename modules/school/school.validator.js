// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const mongoose = require('mongoose');
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
 * @param {string} params.name - School name
 * @param {string} [params.address] - School address
 */
function ValidateCreateSchoolParameters({ name, address }) {
  // ***************  Check if name exists and is a string
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new ApolloError('School name is required and must be a non-empty string', 'INVALID_INPUT');
  }
  
  // ***************  Check if address is a string when provided
  if (address !== undefined && typeof address !== 'string') {
    throw new ApolloError('School address must be a string', 'INVALID_INPUT');
  }
}

/**
 * Validates parameters for UpdateSchool resolver
 * 
 * @function ValidateUpdateSchoolParameters
 * @param {object} params - Parameters to validate
 * @param {string} params.id - School ID
 * @param {string} [params.name] - Updated school name
 * @param {string} [params.address] - Updated school address
 * @param {string} [params.status] - Updated status
 */
function ValidateUpdateSchoolParameters({ id, name, address, status }) {
  // *************** Check if ID exists and is valid
  ValidateMongoId(id);
  
  // ***************Check if name is a non-empty string when provided
  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    throw new ApolloError('School name must be a non-empty string', 'INVALID_INPUT', );
  }
  
  // *************** Check if address is a string when provided
  if (address !== undefined && typeof address !== 'string') {
    throw new ApolloError('School address must be a string', 'INVALID_INPUT', );
  }
  
  // *************** Check if status is a valid enum value when provided
  if (status !== undefined && !['active', 'deleted'].includes(status)) {
    throw new ApolloError('School status must be either "active" or "deleted"', 'INVALID_INPUT', );
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
