// *************** IMPORT CORE ***************
const Mongoose = require("mongoose");
// *************** IMPORT MODULE ***************
const ENUM = require('../../enum');

const blockSchema = new Mongoose.Schema(
  {
    // Name of the academic block
    name: { type: String, required: true },

    // Brief summary of the block's content or purpose
    description: { type: String },

    // List of linked Subject IDs that are part of this block
    subject_ids: [
      { type: Mongoose.Schema.Types.ObjectId, ref: "Subject", default: [] },
    ],

    // Passing criteria definition for block completion
    passing_criteria: [
      {
        // Expected outcome when rules are evaluated (PASS/FAIL)
        expected_outcome: {
          type: String,
          enum: ENUM.EXPECTED_OUTCOME,
          required: true,
        },
        // Array of rule objects that make up this criteria
        rules: [
          {
            // Optional logical operator to connect with previous rule (AND/OR)
            logical_operator: {
              type: String,
              enum: ENUM.LOGICAL_OPERATOR,
            },
            // Type of rule (SUBJECT_RESULT, SUBJECT_MARK, BLOCK_AVERAGE)
            type: {
              type: String,
              enum: ENUM.BLOCK_RULE_TYPE,
              required: true,
            },
            // Optional subject reference for subject-specific rules
            subject_id: {
              type: Mongoose.Schema.Types.ObjectId,
              ref: "Subject",
              default: null,
            },
            // Comparison operator (GTE, GT, LTE, LT, EQ)
            operator: {
              type: String,
              enum: ENUM.COMPARISON_OPERATOR,
            },
            // Threshold value for comparison
            value: {
              type: Number,
            },
          },
        ],
      },
    ],

    // Current condition of the block status
    status: { type: String, enum: ENUM.STATUS, default: "active" },

    // ID of the user who created this block record
    created_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ID of the user who last updated this block record
    updated_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ID of the user who deleted this block (if applicable)
    deleted_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
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
module.exports = Mongoose.model("Block", blockSchema);
