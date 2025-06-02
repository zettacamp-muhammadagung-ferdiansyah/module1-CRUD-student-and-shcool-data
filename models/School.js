const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Add virtual 'id' field for GraphQL compatibility
schoolSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
schoolSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('School', schoolSchema);
