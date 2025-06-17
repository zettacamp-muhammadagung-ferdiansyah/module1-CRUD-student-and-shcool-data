// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const schoolSchema = new Mongoose.Schema({
  // School's name 
  name: { type: String, required: true },
  // School's address 
  address: { type: String },
  //  List of enrolled students 
  students: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  // Status of the school (active or deleted)
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
  //  Soft delete timestamp 
  deleted_at: { type: Date, default: null }
}, {
  // Automatically include created_at and updated_at fields
  timestamps: true
});

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('School', schoolSchema);
