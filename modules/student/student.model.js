// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const studentSchema = new Mongoose.Schema({
  // Student's first name 
  first_name: { type: String, required: true },
  // Student's last name 
  last_name: { type: String, required: true },
  // Student's email address 
  email: { type: String, required: true, unique: true },
  // Student's date of birth 
  date_of_birth: { type: Date },
  // Reference to the School 
  school_id: { type: Mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  // Status of the student (active or deleted)
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
  // Soft delete timestamp 
  deleted_at: { type: Date, default: null }
}, {
  // Automatically include created_at and updated_at fields
  timestamps: true
});

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('Student', studentSchema);
