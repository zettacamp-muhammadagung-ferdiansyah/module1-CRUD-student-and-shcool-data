// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** USER SCHEMA DEFINITION ***************
const userSchema = new mongoose.Schema({
  // User's first name
  first_name: { type: String, required: true },
  // User's last name
  last_name: { type: String, required: true },
  // User's email address (must be unique)
  email: { type: String, required: true, unique: true },
  // User's password (hashed)
  password: { type: String, required: true },
  // User's role (e.g., admin, student, etc.)
  role: { type: String, required: true },
  // Soft delete timestamp (null if not deleted)
  deleted_at: { type: Date, default: null }
}, { timestamps: true });

// *************** VIRTUAL FIELDS ***************
// Add virtual 'id' field for GraphQL compatibility
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
userSchema.set('toJSON', { virtuals: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('User', userSchema);
