// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** STUDENT SCHEMA DEFINITION ***************
/**
 * Mongoose schema for Student model
 * @typedef {Object} StudentSchema
 * @property {string} first_name - Student's first name (required)
 * @property {string} last_name - Student's last name (required)
 * @property {string} email - Student's email address, must be unique (required)
 * @property {Date} [date_of_birth] - Student's date of birth (optional)
 * @property {mongoose.Types.ObjectId} school_id - Reference to associated school (required)
 * @property {Date} [deleted_at] - Soft delete timestamp, null if active
 * @property {Date} createdAt - Automatically managed creation timestamp
 * @property {Date} updatedAt - Automatically managed update timestamp
 */
const studentSchema = new mongoose.Schema({
  // *************** Student's first name ***************
  first_name: { type: String, required: true },
  // *************** Student's last name ***************
  last_name: { type: String, required: true },
  // *************** Student's email address ***************
  email: { type: String, required: true, unique: true },
  // *************** Student's date of birth ***************
  date_of_birth: { type: Date },
  // *************** Reference to the School ***************
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  // *************** Soft delete timestamp ***************
  deleted_at: { type: Date, default: null }
}, { timestamps: true });

// *************** VIRTUAL FIELDS ***************
/**
 * Virtual field that converts MongoDB's _id to GraphQL-friendly id
 * @virtual
 * @returns {string} The hexadecimal string representation of _id
 */
studentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
studentSchema.set('toJSON', { virtuals: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('Student', studentSchema);
