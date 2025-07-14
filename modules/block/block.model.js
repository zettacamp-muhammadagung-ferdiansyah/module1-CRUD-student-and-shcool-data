// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const blockSchema = new Mongoose.Schema(
  {
    // Name of the academic block
    name: { type: String, required: true },

    // Brief summary of the block's content or purpose
    description: { type: String },

    // List of linked Subject IDs that are part of this block
    subject_ids: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Subject', default: [] }],

    // Current condition of the block status
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },

    // ID of the user who created this block record
    created_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ID of the user who last updated this block record
    updated_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // ID of the user who deleted this block (if applicable)
    deleted_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Timestamp when the block record was deleted
    deleted_at: { type: Date, default: null },
  },
  {
    // Automatically include created_at and updated_at fields
    timestamps: true,
  }
);

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('Block', blockSchema);
