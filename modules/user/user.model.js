// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

/**
 * Mongoose schema for User model
 * @typedef {Object} UserSchema
 * @property {string} first_name - User's first name (required)
 * @property {string} last_name - User's last name (required)
 * @property {string} email - User's email address, must be unique (required)
 * @property {string} password - User's hashed password (required)
 * @property {string} role - User's role (e.g., admin, student) (required)
 * @property {Date} [deleted_at] - Soft delete timestamp, null if active
 * @property {Date} createdAt - Automatically managed creation timestamp
 * @property {Date} updatedAt - Automatically managed update timestamp
 */
const userSchema = new mongoose.Schema({
  //  User's first name 
  first_name: { type: String, required: true },
  //  User's last name 
  last_name: { type: String, required: true },
  //  User's email address 
  email: { type: String, required: true, unique: true },
  //  User's password 
  password: { type: String, required: true },
  //  User's role 
  role: { type: String, required: true },
  //  Soft delete timestamp 
  deleted_at: { type: Date, default: null }
}, { timestamps: true });

/**
 * Virtual field that converts MongoDB's _id to GraphQL-friendly id
 * @virtual
 * @returns {string} The hexadecimal string representation of _id
 */
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
userSchema.set('toJSON', { virtuals: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('User', userSchema);
