// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** SCHOOL SCHEMA DEFINITION ***************
const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
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
