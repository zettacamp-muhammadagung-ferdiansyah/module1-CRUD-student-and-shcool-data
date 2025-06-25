// *************** IMPORT LIBRARY ***************
require('dotenv').config();

/**
 * Provides access to environment configuration variables with validation
 * 
 * @returns {Object} - Object containing configuration values
 */
function GetConfig() {
  // *************** Database Configuration
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    console.error('MONGODB_URI environment variable is required but not defined');
  }
  
  // *************** Server Configuration 
  const port = process.env.PORT || 4000;
  
  // *************** Return configuration object
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