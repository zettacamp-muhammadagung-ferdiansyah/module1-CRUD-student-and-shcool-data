// *************** IMPORT LIBRARY ***************
const { ApolloServer } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TypeDefs = require('./typedef');
const Resolvers = require('./resolvers');
const LoaderModule = require('./loaders');

/**
 * Initializes and starts the Apollo GraphQL server
 * Sets up database connection and context
 * @returns {Promise<ApolloServer>} The configured Apollo server instance
 * @throws {Error} If server fails to initialize
 */
function CreateApolloServer() {
  // *************** Configure Apollo Server ***************
  const server = new ApolloServer({
    TypeDefs,
    Resolvers,
    context: () => {
      return {
        loaders: LoaderModule()
      };
    },
    formatError: (error) => {
      // *************** Return a clean error for the client
      return {
        message: error.message,
        code: error.extensions && error.extensions.code ? error.extensions.code : 'INTERNAL_SERVER_ERROR',
        path: error.path
      };
    }
  });

  return server;
}

// *************** EXPORT MODULE ***************
module.exports = CreateApolloServer;
