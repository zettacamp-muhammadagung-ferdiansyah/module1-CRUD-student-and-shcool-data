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
}, {
  // Automatically include created_at and updated_at fields
  timestamps: {
    // Timestamp when the school record was created
    createdAt: 'created_at',
    // Timestamp when the school record was last updated
    updatedAt: 'updated_at'
  }
});

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('School', schoolSchema);
