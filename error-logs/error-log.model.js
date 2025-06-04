// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

/**
 * Mongoose schema for Error Log model
 * @typedef {Object} ErrorLogSchema
 * @property {string} path - File path where the error occurred (required)
 * @property {string} parameter_input - JSON stringified input parameters (required)
 * @property {string} function_name - Name of the function where error occurred (required)
 * @property {string} error - Error message or stack trace (required)
 * @property {Date} createdAt - Automatically managed creation timestamp
 * @property {Date} updatedAt - Automatically managed update timestamp
 */
const ErrorLogSchema = new mongoose.Schema({
  //  File path 
  path: { type: String, required: true },
  // Input parameters 
  parameter_input: { type: String, required: true },
  // Function name 
  function_name: { type: String, required: true },
  // Error details 
  error: { type: String, required: true }
}, { timestamps: true });

/**
 * Virtual field "id" that returns the hexadecimal string of the MongoDB _id.
 * This is useful for front-end clients that expect an "id" instead of "_id".
 * 
 * @returns {string} Hex string of the document's _id
 */
ErrorLogSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

/**
 * Enables virtual fields to be included when converting documents to JSON.
 */
ErrorLogSchema.set('toJSON', { virtuals: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('ErrorLog', ErrorLogSchema);
