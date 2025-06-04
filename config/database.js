// *************** IMPORT CORE ***************


// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** DATABASE CONFIGURATION ***************
/**
 * Database connection configuration and setup
 * @module Database
 */

/**
 * Establishes and configures the MongoDB database connection
 * @async
 * @function ConnectDatabase
 * @returns {Promise<mongoose.Connection>} A promise that resolves to the MongoDB connection instance
 * @throws {Error} If the database connection fails
 * @example
 * try {
 *   await ConnectDatabase();
 *   console.log('Database connected successfully');
 * } catch (error) {
 *   console.error('Database connection failed:', error);
 * }
 */
function ConnectDatabase() {
  // *************** START: Database Connection Setup ***************
  try {
    return mongoose.connect('mongodb://localhost:27017/module1', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // *************** END: Database Connection Setup ***************
  } catch (error) {
    // *************** START: Error Handling ***************
    console.error('Failed to connect to database:', error);
    throw error;
    // *************** END: Error Handling ***************
  }
}

// *************** EXPORT MODULE ***************

module.exports = ConnectDatabase;
