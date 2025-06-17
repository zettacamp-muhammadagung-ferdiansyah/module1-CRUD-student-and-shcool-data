// *************** IMPORT LIBRARY ***************
const Mongoose = require('mongoose'); 
const { ApolloError } = require('apollo-server');

// *************** IMPORT Module ***************
const GetConfig = require('./config');

/**
 * Establishes and configures the MongoDB database connection
 * @async
 * @function ConnectDatabase
 * @returns {Promise<import('mongoose').Connection>} Resolves with the Mongoose connection object
 * @throws {Error} If database URI is invalid or connection fails
 */
async function ConnectDatabase() {
  // *************** Get configuration settings
  const config = GetConfig();
  
  // *************** START: URI Validation ***************
  const databaseUniformResourceIdentifier = config.database.uri;
  
  // *************** Validate URI format
  if (!databaseUniformResourceIdentifier) {
    throw new ApolloError('Database configuration error: MongoDB URI is not defined', 'CONFIG_ERROR');
  }
  
  const isValidUri = databaseUniformResourceIdentifier.startsWith('mongodb://') || databaseUniformResourceIdentifier.startsWith('mongodb+srv://');
  if (!isValidUri) {
    throw new ApolloError('Database configuration error: Invalid MongoDB URI format. URI must start with mongodb:// or mongodb+srv://', 'CONFIG_ERROR');
  }
  // *************** END: URI Validation ***************

  try {
    // *************** START: Database Connection Setup ***************
    console.log('Attempting database connection...');
    const connection = await Mongoose.connect(databaseUniformResourceIdentifier, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB at:', databaseUniformResourceIdentifier);
    // *************** END: Database Connection Setup ***************

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
