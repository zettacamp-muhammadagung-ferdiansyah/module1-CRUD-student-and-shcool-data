// *************** IMPORT MODULE ***************
const SubjectTypeDefs = require('./subject.typedef');
const SubjectResolvers = require('./subject.resolver');
const SubjectLoaderModule = require('./subject.loader');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs: SubjectTypeDefs,
  resolvers: {
    Query: SubjectResolvers.Query,
    Mutation: SubjectResolvers.Mutation,
    Subject: SubjectResolvers.Subject
  },
  SubjectLoader: SubjectLoaderModule.SubjectLoader
};
