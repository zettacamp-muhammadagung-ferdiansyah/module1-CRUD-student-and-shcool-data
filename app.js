// *************** IMPORT LIBRARY ***************
const { ApolloServer } = require('apollo-server');

// *************** IMPORT MODULE ***************
const ConnectDatabase = require('./config/database');
const { typeDefs, resolvers } = require('./schema');
const { StudentsBySchoolIdLoader } = require('./utils/dataloader');

// *************** SERVER CONFIGURATION ***************


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
          studentsBySchoolId: StudentsBySchoolIdLoader,
        },
      }),
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