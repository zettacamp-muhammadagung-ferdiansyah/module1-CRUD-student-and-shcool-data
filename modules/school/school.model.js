// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

// *************** SCHOOL SCHEMA DEFINITION ***************
/**
 * Mongoose schema for School model
 * @typedef {Object} SchoolSchema
 * @property {string} name - The name of the school (required)
 * @property {string} [address] - The physical address of the school (optional)
 * @property {Array<mongoose.Types.ObjectId>} students - Array of student references
 * @property {Date} [deleted_at] - Soft delete timestamp, null if active
 * @property {Date} createdAt - Automatically managed creation timestamp
 * @property {Date} updatedAt - Automatically managed update timestamp
 */
const schoolSchema = new mongoose.Schema({
  // School's name 
  name: { type: String, required: true },
  // School's address 
  address: { type: String },
  //  List of enrolled students 
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  //  Soft delete timestamp 
  deleted_at: { type: Date, default: null }
}, { timestamps: true });

// *************** VIRTUAL FIELDS ***************
/**
 * Virtual field that converts MongoDB's _id to GraphQL-friendly id
 * @virtual
 * @returns {string} The hexadecimal string representation of _id
 */
schoolSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
schoolSchema.set('toJSON', { virtuals: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('School', schoolSchema);
