// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const blockSchema = new Mongoose.Schema({
  // Name of the academic block
  name: { type: String, required: true },
  
  // Brief summary of the block's content or purpose
  description: { type: String },
  
  // List of linked Subject IDs that are part of this block
  subject_ids: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Subject', default: [] }],
  
  // Current condition of the block status
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
  
  // The user ID of the person who created the block
  created_by: { type: String },
  
  // The user ID of the person who made the last update
  updated_by: { type: String },
  
  // The user ID of the person who performed the deletion
  deleted_by: { type: String },
  
  // Timestamp when the block record was deleted
  deleted_at: { type: Date, default: null }
}, {
  // Automatically include created_at and updated_at fields
  timestamps: true
});

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('Block', blockSchema);
