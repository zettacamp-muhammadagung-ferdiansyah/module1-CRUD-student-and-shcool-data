// *************** IMPORT MODULE ***************
const UserTypeDefs = require('./user.typedef');
const UserResolvers = require('./user.resolver');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: UserTypeDefs,
  resolvers: {
    Query: UserResolvers.Query,
    Mutation: UserResolvers.Mutation
  }
};
