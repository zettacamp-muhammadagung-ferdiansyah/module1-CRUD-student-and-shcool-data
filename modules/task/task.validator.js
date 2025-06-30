// *************** IMPORT LIBRARY ***************
const Mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

/**
 * Validates pagination parameters
 *
 * @function ValidatePaginationParameters
 * @param {Object} params - Parameters object
 * @param {number} params.page - Page number (0-based, where 0 is the first page)
 * @param {number} params.limit - Number of items per page
 * @throws {ApolloError} Throws error if validation fails
 */
function ValidatePaginationParameters({ page, limit }) {
  // *************** Check if page is a number
  if (typeof page !== 'number') {
    throw new ApolloError('Page must be a number', 'INVALID_PAGINATION');
  }
  
  // *************** Check if page is non-negative
  if (page < 0) {
    throw new ApolloError('Page must be a non-negative integer', 'INVALID_PAGINATION');
  }
  
  // *************** Check if limit is a number
  if (typeof limit !== 'number') {
    throw new ApolloError('Limit must be a number', 'INVALID_PAGINATION');
  }
  
  // *************** Check if limit is positive
  if (limit <= 0) {
    throw new ApolloError('Limit must be a positive integer', 'INVALID_PAGINATION');
  }
}

/**
 * Validates parameters for creating or updating a task
 *
 * @function ValidateCreateUpdateTaskParameters
 * @param {Object} params - Parameters object
 * @param {string} [params.id] - Task ID (required for update only)
 * @param {Object} params.taskInput - Task input data
 * @throws {ApolloError} If validation fails
 */
function ValidateCreateUpdateTaskParameters({ id, taskInput }) {
  // *************** Validate ID if provided (required for update)
  if (id) {
    ValidateMongoId(id);
  }

  // *************** Validate task input
  if (!taskInput) {
    throw new ApolloError('Task input is required', 'INVALID_INPUT');
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

  // *************** Validate status if provided
  if (taskInput.status && !['ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'DELETED'].includes(taskInput.status)) {
    throw new ApolloError('Invalid task status', 'INVALID_INPUT');
  }

  // *************** Validate due_date if provided
  if (taskInput.due_date && isNaN(new Date(taskInput.due_date).getTime())) {
    throw new ApolloError('Invalid due date format', 'INVALID_INPUT');
  }

  // *************** Validate user reference fields if provided
  if (taskInput.created_by && typeof taskInput.created_by !== 'string') {
    throw new ApolloError('Created by must be a string', 'INVALID_INPUT');
  }

  if (taskInput.updated_by && typeof taskInput.updated_by !== 'string') {
    throw new ApolloError('Updated by must be a string', 'INVALID_INPUT');
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidatePaginationParameters,
  ValidateCreateUpdateTaskParameters
};