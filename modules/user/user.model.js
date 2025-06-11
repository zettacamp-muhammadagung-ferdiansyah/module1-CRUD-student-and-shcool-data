// *************** IMPORT CORE ***************
const mongoose = require('mongoose');

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
  // Status of the user (active or deleted)
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
  //  Soft delete timestamp 
  deleted_at: { type: Date, default: null }
}, {
  // Automatically include created_at and updated_at fields
  timestamps: {
    // Timestamp when the user record was created
    createdAt: 'created_at',
    // Timestamp when the user record was last updated
    updatedAt: 'updated_at'
  }
});
 
// *************** EXPORT MODULE ***************
module.exports = mongoose.model('User', userSchema);
