// *************** IMPORT MODULE ***************
// These files will be created later - this is just the skeleton
const TaskTypeDefs = require('./task.typedef');
const TaskResolvers = require('./task.resolver');
const TaskLoaderModule = require('./task.loader');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: TaskTypeDefs,
  resolvers: {
    Query: TaskResolvers.Query,
    Mutation: TaskResolvers.Mutation,
    Task: TaskResolvers.Task,
  },
  TaskLoader: TaskLoaderModule.TaskLoader,
};
