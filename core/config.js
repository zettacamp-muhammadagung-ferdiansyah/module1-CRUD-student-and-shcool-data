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

  // *************** SendGrid Configuration
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (!sendgridApiKey) {
    console.error('SENDGRID_API_KEY environment variable is required but not defined');
  }

  // *************** Server Configuration
  const port = process.env.PORT || 4000;

  // *************** SendGrid From Email
  const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!sendgridFromEmail) {
    console.error('SENDGRID_FROM_EMAIL environment variable is not defined. Using fallback if needed.');
  }

  // *************** Return configuration object
  return {
    database: {
      uri: mongodbUri,
    },
    server: {
      port,
    },
    SENDGRID_API_KEY: sendgridApiKey,
    SENDGRID_FROM_EMAIL: sendgridFromEmail,
  };
}

// *************** EXPORT MODULE ***************
module.exports = GetConfig;
