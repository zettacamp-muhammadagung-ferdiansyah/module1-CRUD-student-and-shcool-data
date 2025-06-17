// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const errorLogSchema = new Mongoose.Schema({
  // Path to the file where the error occurred
  path: { type: String, required: true },
  
  // Input parameters at the time of error
  parameter_input: { type: String },
  
  // Name of the function where error occurred
  function_name: { type: String, required: true },
  
  // Error stack trace
  error: { type: String, required: true },
  
  // Timestamp when error occurred (auto-generated)
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('ErrorLog', errorLogSchema);