// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  // School's name 
  name: { type: String, required: true },
  // School's address 
  address: { type: String },
  //  List of enrolled students 
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  // Status of the school (active or deleted)
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
  //  Soft delete timestamp 
  deleted_at: { type: Date, default: null }
}, { timestamps: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('School', schoolSchema);
