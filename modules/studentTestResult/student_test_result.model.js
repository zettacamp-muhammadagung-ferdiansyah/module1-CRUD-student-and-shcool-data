// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');
const { Schema } = Mongoose;

const studentTestResultSchema = new Schema(
  {
    // Reference to the student this result belongs to
    student_id: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Student',
    },

    // Reference to the test being evaluated
    test_id: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Test',
    },

    // A list of score breakdowns per evaluation criterion
    marks: [
      {
        notation_text: {
          type: String,
          required: true,
        },
        mark: {
          type: Number,
          required: true,
        },
      },
    ],

    // The calculated average score across all criteria in the test
    average_mark: {
      type: Number,
      required: true,
    },

    // The date and time when the test marks were entered into the system
    mark_entry_date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // The current validation status of this result
    student_test_result_status: {
      type: String,
      enum: ['active', 'validated', 'deleted'],
      required: true,
      default: 'active',
    },

    // The user who created the student test result
    created_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The user who last updated the student test result
    updated_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // The user who deleted the student test result (if applicable)
    deleted_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    // Automatically include created_at and updated_at fields
    timestamps: true,
  }
);

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('StudentTestResult', studentTestResultSchema);
