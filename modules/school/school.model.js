// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** SCHOOL SCHEMA DEFINITION ***************
const schoolSchema = new mongoose.Schema({
  // School's name
  name: { type: String, required: true },
  // School's address
  address: { type: String },
  // List of student ObjectIds enrolled in the school
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  // Soft delete timestamp (null if not deleted)
  deleted_at: { type: Date, default: null }
}, { timestamps: true });

// *************** VIRTUAL FIELDS ***************
// Add virtual 'id' field for GraphQL compatibility
schoolSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
schoolSchema.set('toJSON', { virtuals: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('School', schoolSchema);
