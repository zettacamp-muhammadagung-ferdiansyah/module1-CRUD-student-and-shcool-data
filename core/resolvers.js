// *************** IMPORT LIBRARY ***************
const { mergeResolvers } = require('@graphql-tools/merge');

// *************** IMPORT MODULE ***************
const UserModule = require('../modules/user');
const StudentModule = require('../modules/student');
const SchoolModule = require('../modules/school');

// *************** EXPORT MODULE ***************
module.exports = mergeResolvers([
  UserModule.resolvers,
  StudentModule.resolvers,
  SchoolModule.resolvers
]);
