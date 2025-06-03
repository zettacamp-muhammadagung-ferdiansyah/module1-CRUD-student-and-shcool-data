// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** STUDENT SCHEMA DEFINITION ***************
const studentSchema = new mongoose.Schema({
  // Student's first name
  first_name: { type: String, required: true },
  // Student's last name
  last_name: { type: String, required: true },
  // Student's email address (must be unique)
  email: { type: String, required: true, unique: true },
  // Student's date of birth
  date_of_birth: { type: Date },
  // Reference to the School (foreign key)
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  // Soft delete timestamp (null if not deleted)
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
