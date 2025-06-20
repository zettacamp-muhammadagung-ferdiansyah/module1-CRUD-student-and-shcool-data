// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const schoolSchema = new Mongoose.Schema({
  // School's name 
  name: { type: String, required: true },
  // School's public or brand name
  commercial_name: { type: String, required: true },
  // Full address of the school
  address: { type: String, required: true },
  // City where the school is located
  city: { type: String, required: true },
  // Country where the school operates
  country: { type: String, required: true },
  // Postal code of the school's location
  zipcode: { type: String, required: true },
  // URL or path to the school's logo
  logo: { type: String },
  //  List of enrolled students 
  students: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  // Status of the school (active or deleted)
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
  //  Soft delete timestamp 
  deleted_at: { type: Date, default: null }
}, {
  // Automatically include created_at and updated_at fields
  timestamps: true
});

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('School', schoolSchema);
