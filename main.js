// *************** IMPORT LIBRARY ***************
require('dotenv').config();

// *************** IMPORT MODULE ***************
const ConnectDatabase = require('./core/database');
const GetConfig = require('./core/config');
const CreateApolloServer = require('./core/apollo');

/**
 * Initializes and starts the Apollo GraphQL server
 * Sets up database connection and context
 * @returns {Promise<void>} 
 */
async function StartServer() {
  // *************** START: Server initialization ***************
  try {
    // *************** Get application configuration
    const config = GetConfig();
    
    // *************** Initialize database connection
    await ConnectDatabase();

    // *************** Create and start the Apollo Server
    const server = CreateApolloServer();
    const { url } = await server.listen(config.server.port);
    console.log(`Server ready at ${url}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  // *************** END: Server initialization ***************
}

// *************** START SERVER ***************
StartServer();