// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');
require('dotenv').config();

/**
 * Establishes and configures the MongoDB database connection
 * @async
 * @function ConnectDatabase
 * @returns {Promise<import('mongoose').Connection>} Resolves with the Mongoose connection object
 * @throws {Error} If database URI is invalid or connection fails
 * @throws {Error} If MONGODB_URI environment variable is not defined
 * @example
 * try {
 *   const connection = await ConnectDatabase();
 *   // Connection is now established
 * } catch (error) {
 *   console.error('Database connection failed:', error.message);
 *   process.exit(1);
 * }
 */
async function ConnectDatabase() {
  // *************** START: URI Validation ***************
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    const errorMessage = 'Database configuration error: MONGODB_URI environment variable is not defined';
    console.error('Validation failed:', errorMessage);
    throw new ApolloError(errorMessage, 'SERVER_ERROR');
  }

  const isValidUri = dbUri.startsWith('mongodb://') || dbUri.startsWith('mongodb+srv://');
  if (!isValidUri) {
    const errorMessage = 'Invalid database URI format: Must start with mongodb:// or mongodb+srv://';
    console.error('Validation failed:', errorMessage);
    throw new ApolloError(errorMessage, 'SERVER_ERROR');
  }
  // *************** END: URI Validation ***************

  try {
    // *************** START: Database Connection Setup ***************
    console.log('Attempting database connection...');
    const connection = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB at:', dbUri);
    // *************** END: Database Connection Setup ***************

    // *************** START: Connection Monitoring ***************
    /**
     * Handles MongoDB connection errors
     * @function handleError
     * @param {Error} error - The error object from MongoDB
     */
    connection.connection.on('error', function handleError(error) {
      console.error('MongoDB connection error:', error.message);
    });

    /**
     * Handles MongoDB disconnection events
     * @function handleDisconnect
     */
    connection.connection.on('disconnected', function handleDisconnect() {
      console.warn('MongoDB disconnected');
    });

    /**
     * Handles MongoDB reconnection events
     * @function handleReconnect
     */
    connection.connection.on('reconnected', function handleReconnect() {
      console.log('MongoDB reconnected');
    });
    // *************** END: Connection Monitoring ***************
    // *************** Return the actual Connection object
    return connection.connection; 

  } catch (error) {
    // *************** START: Error Handling ***************
    console.error('Database connection failed:', error.message);
    throw new ApolloError(`Failed to connect to database: ${error.message}`, 'SERVER_ERROR');
    // *************** END: Error Handling ***************
  }
}

// *************** EXPORT MODULE ***************
module.exports = ConnectDatabase;
