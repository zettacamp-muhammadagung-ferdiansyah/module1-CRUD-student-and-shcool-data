// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const testSchema = new Mongoose.Schema(
  {
    // Reference to the Subject this test belongs to
    subject_id: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },

    // Title of the test
    name: { type: String, required: true },

    // Brief description or purpose of the test
    description: { type: String },

    // Test weight (0-1) for subject's average score calculation
    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    // Array of scoring criteria objects
    notations: [
      {
        // Description of what is being evaluated
        notation_text: {
          type: String,
          required: true,
          trim: true,
        },
        // Maximum possible points for this component (cannot be negative)
        max_points: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    // Current status of the test
    test_status: {
      type: String,
      enum: ['active', 'PUBLISHED', 'DELETED'],
      default: 'active',
    },

    // Date when the test was published
    published_date: {
      type: Date,
      default: null,
    },

    // The user who created the test
    created_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    // The user who last updated the test
    updated_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    // The user who deleted the test (if applicable)
    deleted_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },

    // Timestamp when the test was deleted
    deleted_at: { type: Date, default: null },
  },
  {
    // Automatically include created_at and updated_at fields
    timestamps: true,
  }
);

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('Test', testSchema);
