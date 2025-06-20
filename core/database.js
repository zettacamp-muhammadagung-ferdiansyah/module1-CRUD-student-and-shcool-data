// *************** IMPORT LIBRARY ***************
const Mongoose = require('mongoose'); 

// *************** IMPORT MODULE ***************
const GetConfig = require('./config');

/**
 * Establishes and configures the MongoDB database connection
 * @async
 * @function ConnectDatabase
 * @returns {Promise<void>} Resolves when the database connection is established
 */
async function ConnectDatabase() {
  // *************** Get configuration settings
  const config = GetConfig();
  const databaseUri = config.database.uri;
  
  // *************** Validate URI format
  if (!databaseUri) {
    console.error('Database configuration error: MongoDB URI is not defined');
    return null;
  }
  
  if (!databaseUri.startsWith('mongodb://') && !databaseUri.startsWith('mongodb+srv://')) {
    console.error('Database configuration error: Invalid MongoDB URI format. URI must start with mongodb:// or mongodb+srv://');
    return null;
  }

  try {
    // *************** START: Database Connection Setup ***************
    console.log('Attempting database connection...');
    await Mongoose.connect(databaseUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB successfully');
    // *************** END: Database Connection Setup ***************

  } catch (error) {
    // *************** START: Error Handling ***************
    console.error('Database connection failed:', error.message);
    return null;
    // *************** END: Error Handling ***************
  }
}

// *************** EXPORT MODULE ***************
module.exports = ConnectDatabase;