// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** ERROR LOG SCHEMA DEFINITION ***************
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
  // *************** File path ***************
  path: { type: String, required: true },
  // *************** Input parameters ***************
  parameter_input: { type: String, required: true },
  // *************** Function name ***************
  function_name: { type: String, required: true },
  // *************** Error details ***************
  error: { type: String, required: true }
}, { timestamps: true });

// *************** VIRTUAL FIELDS ***************
ErrorLogSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
ErrorLogSchema.set('toJSON', { virtuals: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('ErrorLog', ErrorLogSchema);
