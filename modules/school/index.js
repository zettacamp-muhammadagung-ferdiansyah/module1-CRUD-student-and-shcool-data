// *************** IMPORT MODULE ***************
const SchoolTypeDefs = require('./school.typedef');
const SchoolResolvers = require('./school.resolver');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: SchoolTypeDefs,
  resolvers: {
    Query: SchoolResolvers.Query,
    Mutation: SchoolResolvers.Mutation,
    School: SchoolResolvers.School
  }
};
