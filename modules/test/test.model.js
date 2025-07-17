// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');
// *************** IMPORT MODULE ***************
const ENUM = require('../../enum');

const testSchema = new Mongoose.Schema(
  {

    // Reference to the Subject this test belongs to
    subject_id: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },

    // Reference to the School this test is assigned to
    school_id: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'School',
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
        // Maximum possible marks for this component (cannot be negative)
        max_marks: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    // Passing criteria definition for test completion
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
              enum: ENUM.LOGICAL_OPERATOR
            },
            // Type of rule (NOTATION_SCORE, TOTAL_SCORE)
            type: {
              type: String,
              enum: ENUM.TEST_RULE_TYPE,
              required: true
            },
            // Optional notation index for notation-specific rules
            notation_index: {
              type: Number,
              default: null
            },
            // Comparison operator (GTE, GT, LTE, LT, EQ)
            operator: {
              type: String,
              enum: ENUM.COMPARISON_OPERATOR
            },
            // Threshold value for comparison
            value: {
              type: Number
            }
          }
        ]
      }
    ],

    // Current status of the test
    test_status: {
      type: String,
      enum: ENUM.TEST_STATUS,
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
      ref: 'User',
      required: true,
    },
    // The user who last updated the test
    updated_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // The user who deleted the test (if applicable)
    deleted_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
