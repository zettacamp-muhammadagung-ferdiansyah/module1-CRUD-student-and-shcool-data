// *************** IMPORT LIBRARY ***************
const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema');

// *************** IMPORT MODULE ***************
const ConnectDatabase = require('./config/database');

// *************** IMPORT UTILS ***************
const { StudentsBySchoolIdLoader } = require('./utils/dataloader');

/**
 * Initializes and starts the Apollo GraphQL server
 * Sets up database connection and context
 * @returns {Promise<void>} 
 * @throws {Error} If server fails to start
 */
async function StartServer() {
  // *************** START: Server initialization ***************
  try {
    // *************** Initialize database connection
    await ConnectDatabase();

    // ***************  Configure Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        loaders: {
          StudentsBySchoolIdLoader,
        },
      }),
      formatError: (error) => {
        // *************** Return a clean error for the client
        return {
          message: error.message,
          code: error.extensions && error.extensions.code ? error.extensions.code : 'INTERNAL_SERVER_ERROR',
          path: error.path
        };
      }
    });

    // *************** Start the server
    const { url } = await server.listen();
    console.log(`Server ready at ${url}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  // *************** END: Server initialization ***************
}

// *************** START SERVER ***************
StartServer();