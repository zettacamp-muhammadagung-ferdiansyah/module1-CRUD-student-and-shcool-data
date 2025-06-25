// *************** IMPORT MODULE ***************
const SchoolTypeDefs = require('./school.typedef');
const SchoolResolvers = require('./school.resolver');
const SchoolLoaderModule = require('./school.loader');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: SchoolTypeDefs,
  resolvers: {
    Query: SchoolResolvers.Query,
    Mutation: SchoolResolvers.Mutation,
    School: SchoolResolvers.School
  },
  SchoolLoader: SchoolLoaderModule.SchoolLoader
};
