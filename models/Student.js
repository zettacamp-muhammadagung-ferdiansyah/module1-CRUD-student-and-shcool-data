const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Add virtual 'id' field for GraphQL 
studentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
studentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
