// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** STUDENT SCHEMA DEFINITION ***************
const studentSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  date_of_birth: { type: Date },
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  deleted_at: { type: Date, default: null }
}, { timestamps: true });

// *************** VIRTUAL FIELDS ***************
// Add virtual 'id' field for GraphQL compatibility
studentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
studentSchema.set('toJSON', { virtuals: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('Student', studentSchema);
