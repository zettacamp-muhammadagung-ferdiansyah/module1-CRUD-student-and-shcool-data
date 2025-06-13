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