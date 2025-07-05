// *************** IMPORT LIBRARY ***************
const Mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');


/**
 * Validates parameters for creating a student test result
 * @function ValidateCreateStudentTestResultParameters
 * @param {Object} studentTestResultInput - Input object containing student test result data
 * @throws {ApolloError} If any validation fails
 */
function ValidateCreateStudentTestResultParameters(studentTestResultInput) {
  // *************** Validate object and not empty
  if (!studentTestResultInput || typeof studentTestResultInput !== 'object') {
    throw new ApolloError('Student test result input must be an object', 'INVALID_INPUT');
  }
  // *************** Validate student_id
  if (!studentTestResultInput.student_id) {
    throw new ApolloError('Student ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(studentTestResultInput.student_id);
  // *************** Validate test_id
  if (!studentTestResultInput.test_id) {
    throw new ApolloError('Test ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(studentTestResultInput.test_id);
  // *************** Validate marks
  if (!studentTestResultInput.marks || !Array.isArray(studentTestResultInput.marks)) {
    throw new ApolloError('Marks must be an array', 'INVALID_INPUT');
  }
  if (studentTestResultInput.marks.length === 0) {
    throw new ApolloError('At least one mark is required', 'INVALID_INPUT');
  }
  // *************** Validate each mark in the marks array
  studentTestResultInput.marks.forEach((mark, index) => {
    if (!mark.notation_text) {
      throw new ApolloError(`Notation text is required for mark at index ${index}`, 'INVALID_INPUT');
    }
    if (typeof mark.notation_text !== 'string') {
      throw new ApolloError(`Notation text must be a string for mark at index ${index}`, 'INVALID_INPUT');
    }
    if (typeof mark.mark !== 'number') {
      throw new ApolloError(`Mark value must be a number for mark at index ${index}`, 'INVALID_INPUT');
    }
  });
  // *************** Validate created_by (required)
  if (!studentTestResultInput.created_by) {
    throw new ApolloError('created_by is required', 'INVALID_INPUT');
  }
  ValidateMongoId(studentTestResultInput.created_by);
}

/**
 * Validates parameters for updating a student test result
 * @function ValidateUpdateStudentTestResultParameters
 * @param {Object} params - Parameters for validation
 * @param {string} params.id - StudentTestResult ID (required)
 * @param {Object} params.studentTestResultInput - Input object containing student test result data
 * @throws {ApolloError} If any validation fails
 */
function ValidateUpdateStudentTestResultParameters({ id, studentTestResultInput }) {
  // *************** Validate ID (required)
  ValidateMongoId(id);
  // *************** Validate object and not empty
  if (!studentTestResultInput || typeof studentTestResultInput !== 'object') {
    throw new ApolloError('Student test result input must be an object', 'INVALID_INPUT');
  }
  // *************** Validate student_id
  if (!studentTestResultInput.student_id) {
    throw new ApolloError('Student ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(studentTestResultInput.student_id);
  // *************** Validate test_id
  if (!studentTestResultInput.test_id) {
    throw new ApolloError('Test ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(studentTestResultInput.test_id);
  // *************** Validate marks
  if (!studentTestResultInput.marks || !Array.isArray(studentTestResultInput.marks)) {
    throw new ApolloError('Marks must be an array', 'INVALID_INPUT');
  }
  if (studentTestResultInput.marks.length === 0) {
    throw new ApolloError('At least one mark is required', 'INVALID_INPUT');
  }
  // *************** Validate each mark in the marks array
  studentTestResultInput.marks.forEach((mark, index) => {
    if (!mark.notation_text) {
      throw new ApolloError(`Notation text is required for mark at index ${index}`, 'INVALID_INPUT');
    }
    if (typeof mark.notation_text !== 'string') {
      throw new ApolloError(`Notation text must be a string for mark at index ${index}`, 'INVALID_INPUT');
    }
    if (typeof mark.mark !== 'number') {
      throw new ApolloError(`Mark value must be a number for mark at index ${index}`, 'INVALID_INPUT');
    }
  });
  // *************** Validate updated_by (required, must be valid MongoId)
  ValidateMongoId(studentTestResultInput.updated_by);
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateStudentTestResultParameters,
  ValidateUpdateStudentTestResultParameters,
};
