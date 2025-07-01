// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TaskModel = require('./task.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for batch-loading active task data by their IDs.
 * This optimizes queries by collecting individual task ID requests
 * and fetching them in a single database query.
 * 
 * @returns {DataLoader} - An instance of DataLoader for fetching tasks by ID
 */
function TaskLoader() {
  return new DataLoader(async (taskIds) => {
    try {
      // *************** Fetch active tasks with matching IDs
      const tasks = await TaskModel.find({
        _id: { $in: taskIds },
        task_status: 'ACTIVE'
      }).lean();

      // *************** Map results to maintain original order
      const tasksById = new Map(
        tasks.map(task => [String(task._id), task])
      );

      // *************** Return tasks in the same order as requested IDs
      return taskIds.map(id => tasksById.get(String(id)) || null);
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/task/task.loader.js',
        parameter_input: JSON.stringify({ taskIds }),
        function_name: 'TaskLoader',
        error: String(error.stack),
      });

      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load tasks: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  TaskLoader
};
