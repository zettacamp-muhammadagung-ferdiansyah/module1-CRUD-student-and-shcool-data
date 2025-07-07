// *************** IMPORT LIBRARY ***************
const Mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');


/**
 * Validates parameters for creating a task
 * @function ValidateCreateTaskParameters
 * @param {Object} taskInput - Task input data
 * @throws {ApolloError} If validation fails
 */
function ValidateCreateTaskParameters(taskInput) {
  // *************** Validate object and not empty
  if (!taskInput || typeof taskInput !== 'object') {
    throw new ApolloError('Task input must be an object', 'INVALID_INPUT');
  }
  // *************** Validate test_id
  if (!taskInput.test_id) {
    throw new ApolloError('Test ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(taskInput.test_id);
  // *************** Validate school_id
  if (!taskInput.school_id) {
    throw new ApolloError('School ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(taskInput.school_id);
  // *************** Validate user_id
  if (!taskInput.user_id) {
    throw new ApolloError('User ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(taskInput.user_id);
  // *************** Validate student_id if provided
  if (taskInput.student_id) {
    ValidateMongoId(taskInput.student_id);
  }
  // *************** Validate title
  if (typeof taskInput.title !== 'string') {
    throw new ApolloError('Title must be a string', 'INVALID_INPUT');
  }
  if (!taskInput.title.trim()) {
    throw new ApolloError('Title is required', 'INVALID_INPUT');
  }
  // *************** Validate description
  if (!taskInput.description) {
    throw new ApolloError('Description is required', 'INVALID_INPUT');
  }
  if (typeof taskInput.description !== 'string') {
    throw new ApolloError('Description must be a string', 'INVALID_INPUT');
  }
  // *************** Validate task_type
  if (!taskInput.task_type) {
    throw new ApolloError('Task type is required', 'INVALID_INPUT');
  }
  if (!['ASSIGN_CORRECTOR', 'ENTER_MARKS', 'VALIDATE_MARKS'].includes(taskInput.task_type)) {
    throw new ApolloError('Invalid task type', 'INVALID_INPUT');
  }
  // *************** Validate due_date if provided
  if (taskInput.due_date && isNaN(new Date(taskInput.due_date).getTime())) {
    throw new ApolloError('Invalid due date format', 'INVALID_INPUT');
  }
  // *************** Validate created_by
  if (!taskInput.created_by) {
    throw new ApolloError('created_by is required', 'INVALID_INPUT');
  }
  ValidateMongoId(taskInput.created_by);
}

/**
 * Validates parameters for updating a task
 * @function ValidateUpdateTaskParameters
 * @param {Object} params - Parameters object
 * @param {string} params.id - Task ID (required)
 * @param {Object} params.taskInput - Task input data
 * @throws {ApolloError} If validation fails
 */
function ValidateUpdateTaskParameters({ id, taskInput }) {
  // *************** Validate ID (required)
  ValidateMongoId(id);
  // *************** Validate object and not empty
  if (!taskInput || typeof taskInput !== 'object') {
    throw new ApolloError('Task input must be an object', 'INVALID_INPUT');
  }
  // *************** Validate test_id
  if (!taskInput.test_id) {
    throw new ApolloError('Test ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(taskInput.test_id);
  // *************** Validate user_id
  if (!taskInput.user_id) {
    throw new ApolloError('User ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(taskInput.user_id);
  // *************** Validate student_id if provided
  if (taskInput.student_id) {
    ValidateMongoId(taskInput.student_id);
  }
  // *************** Validate title
  if (!taskInput.title) {
    throw new ApolloError('Title is required', 'INVALID_INPUT');
  }
  if (typeof taskInput.title !== 'string') {
    throw new ApolloError('Title must be a string', 'INVALID_INPUT');
  }
  // *************** Validate description
  if (!taskInput.description) {
    throw new ApolloError('Description is required', 'INVALID_INPUT');
  }
  if (typeof taskInput.description !== 'string') {
    throw new ApolloError('Description must be a string', 'INVALID_INPUT');
  }
  // *************** Validate task_type
  if (!taskInput.task_type) {
    throw new ApolloError('Task type is required', 'INVALID_INPUT');
  }
  if (!['ASSIGN_CORRECTOR', 'ENTER_MARKS', 'VALIDATE_MARKS'].includes(taskInput.task_type)) {
    throw new ApolloError('Invalid task type', 'INVALID_INPUT');
  }
  // *************** Validate task_status if provided
  if (taskInput.task_status && !['active', 'completed', 'deleted'].includes(taskInput.task_status)) {
    throw new ApolloError('Invalid task status', 'INVALID_INPUT');
  }
  // *************** Validate due_date if provided
  if (taskInput.due_date && isNaN(new Date(taskInput.due_date).getTime())) {
    throw new ApolloError('Invalid due date format', 'INVALID_INPUT');
  }
  // *************** Validate updated_by (required, must be valid MongoId)
  ValidateMongoId(taskInput.updated_by);
}

/**
 * Validates input for AssignCorrector mutation
 * @param {string} taskId - Task ID
 * @param {Object} input - Input object
 * @throws {ApolloError} If validation fails
 * @returns {Object} { user_id, due_date }
 */
function ValidateAssignCorrector(taskId, input) {
  // ***************  Validate taskId
  ValidateMongoId(taskId);

  // *************** Validate input object
  if (!input) {
    throw new ApolloError('Input is required', 'INVALID_INPUT');
  }

  // ***************  Validate user_id
  if (!input.user_id) {
    throw new ApolloError('User ID is required', 'INVALID_INPUT');
  }
  ValidateMongoId(input.user_id);

  // ***************  Validate due_date if provided
  if (input.due_date && isNaN(new Date(input.due_date).getTime())) {
    throw new ApolloError('Invalid due date format', 'INVALID_INPUT');
  }

  return {
    user_id: input.user_id,
    due_date: input.due_date,
  };
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateTaskParameters,
  ValidateUpdateTaskParameters,
  ValidateAssignCorrector,
};
