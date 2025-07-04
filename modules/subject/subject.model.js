// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const subjectSchema = new Mongoose.Schema(
  {
    // Reference to the Block this subject belongs to
    block_id: { type: Mongoose.Schema.Types.ObjectId, ref: 'Block' },

    // Name of the subject
    name: { type: String, required: true },

    // Brief description of the subject's content
    description: { type: String },

    // Coefficient for average score calculations (cannot be negative)
    coefficient: {
      type: Number,
      required: true,
      min: 0,
    },

    // Array of Test IDs linked to this subject
    test_ids: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Test', required: true }],

    // Current condition of the subject
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },

    // The user who created the subject
    created_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    // The user who last updated the subject
    updated_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },

    // The user who deleted the subject (if applicable)
    deleted_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    // Timestamp when the subject was deleted
    deleted_at: { type: Date, default: null },
  },
  {
    // Automatically include created_at and updated_at fields
    timestamps: true,
  }
);

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('Subject', subjectSchema);
