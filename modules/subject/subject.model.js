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

    // Passing criteria definition for subject completion
    passing_criteria: [
      {
        // Expected outcome when rules are evaluated (PASS/FAIL)
        expected_outcome: {
          type: String,
          enum: ['PASS', 'FAIL'],
          required: true
        },
        // Array of rule objects that make up this criteria
        rules: [
          {
            // Optional logical operator to connect with previous rule (AND/OR)
            logical_operator: {
              type: String,
              enum: ['AND', 'OR']
            },
            // Type of rule (TEST_RESULT, TEST_MARK, SUBJECT_AVERAGE)
            type: {
              type: String,
              enum: ['TEST_RESULT', 'TEST_MARK', 'SUBJECT_AVERAGE'],
              required: true
            },
            // Optional test reference for test-specific rules
            test_id: {
              type: Mongoose.Schema.Types.ObjectId,
              ref: 'Test'
            },
            // Comparison operator (GTE, GT, LTE, LT, EQ)
            operator: {
              type: String,
              enum: ['GTE', 'GT', 'LTE', 'LT', 'EQ']
            },
            // Threshold value for comparison
            value: {
              type: Number
            }
          }
        ]
      }
    ],

    // Current condition of the subject
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },

    // The user who created the subject
    created_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The user who last updated the subject
    updated_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // The user who deleted the subject (if applicable)
    deleted_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
