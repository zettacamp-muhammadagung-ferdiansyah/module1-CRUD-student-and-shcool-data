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
  //  Soft delete timestamp 
  deleted_at: { type: Date, default: null }
}, { timestamps: true });
 
// *************** EXPORT MODULE ***************
module.exports = mongoose.model('User', userSchema);
