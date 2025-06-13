// *************** IMPORT LIBRARY ***************
require('dotenv').config();
const { ApolloError } = require('apollo-server');

/**
 * Validates and provides access to environment configuration variables
 * Ensures all required variables are present before application start
 * 
 * @returns {Object} - Object containing validated configuration values
 * @throws {ApolloError} - If required environment variables are missing
 */
function GetConfig() {
  // *************** Database Configuration ***************
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new ApolloError('Database configuration error: MONGODB_URI environment variable is not defined', 'CONFIG_ERROR');
  }

  // *************** START: URI Validation ***************
  const isValidUri = mongodbUri.startsWith('mongodb://') || mongodbUri.startsWith('mongodb+srv://');
  if (!isValidUri) {
    throw new ApolloError('Invalid database Uniform Resource Identifier format: Must start with mongodb:// or mongodb+srv://', 'SERVER_ERROR'); 
  }
  // *************** END: URI Validation ***************

  // *************** Server Configuration ***************
  const port = process.env.PORT || 4000;
  
  // *************** Return validated configuration ***************
  return {
    database: {
      uri: mongodbUri
    },
    server: {
      port
    }
  };
}

// *************** EXPORT MODULE ***************
module.exports = GetConfig;