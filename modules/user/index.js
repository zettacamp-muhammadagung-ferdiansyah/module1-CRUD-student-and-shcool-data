// *************** IMPORT MODULE ***************
const UserTypeDefs = require('./user.typedef');
const UserResolvers = require('./user.resolver');
const UserLoaderModule = require('./user.loader');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: UserTypeDefs,
  resolvers: {
    Query: UserResolvers.Query,
    Mutation: UserResolvers.Mutation
  },
  UserLoader: UserLoaderModule.UserLoader
};
