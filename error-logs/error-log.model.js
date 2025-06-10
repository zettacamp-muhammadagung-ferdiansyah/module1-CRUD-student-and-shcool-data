// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
  // Error message content
  message: { type: String, required: true },
  
  // Error code identifier
  code: { type: String, required: true },
  
  // Stack trace of the error
  stack: { type: String },
  
  // Name of the resolver where error occurred
  resolver: { type: String, required: true },
  
  // Type of operation (query/mutation)
  operation_type: { type: String, required: true },
  
  // User ID who performed the operation
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Request parameters at time of error
  request_params: { type: Object },
  
  // Timestamp when error occurred (auto-generated)
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('ErrorLog', errorLogSchema);
