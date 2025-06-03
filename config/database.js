// *************** IMPORT CORE ***************
// Essential core module imports or dependencies needed for the module's operation.

// *************** IMPORT LIBRARY ***************
// Third-party libraries or packages used in this module.
const mongoose = require('mongoose');

// *************** DATABASE CONFIGURATION ***************
// Database connection and configuration settings.

/**
 * Establishes connection to MongoDB database
 * Configures connection with recommended options
 * @returns {Promise<mongoose.Connection>} MongoDB connection instance
 * @throws {Error} If connection fails
 */
function ConnectDatabase() {
  // *************** START: Database connection setup ***************
  return mongoose.connect('mongodb://localhost:27017/module1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // *************** END: Database connection setup ***************
}

// *************** EXPORT MODULE ***************
// Final exports for the module's functionality.
module.exports = ConnectDatabase;
