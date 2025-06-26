// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');
const { Schema, Types } = Mongoose;

const studentTestResultSchema = new Schema({
  // Reference to the student this result belongs to
  student_id: {
    type: Types.ObjectId,
    required: true,
    ref: "Student",
  },

  // Reference to the test being evaluated
  test_id: {
    type: Types.ObjectId,
    required: true,
    ref: "Test",
  },

  // A list of score breakdowns per evaluation criterion
  marks: [{
    notation_text: {
      type: String,
      required: true
    },
    mark: {
      type: Number,
      required: true
    }
  }],

  // The calculated average score across all criteria in the test
  average_mark: {
    type: Number,
    required: true
  },

  // The date and time when the test marks were entered into the system
  mark_entry_date: {
    type: Date,
    required: true,
    default: Date.now
  },

  // The current validation status of this result
  student_test_result_status: {
    type: String,
    enum: ['ACTIVE', 'VALIDATED', 'DELETED'],
    required: true,
    default: 'ACTIVE'
  },

  // The ID of the user who originally entered this test result
  created_by: {
    type: String,
  },

  // The ID of the user who most recently modified this test result
  updated_by: {
    type: String,
  },

  // The ID of the user who soft-deleted this record, if applicable
  deleted_by: {
    type: String
  },

  // The timestamp when this result was marked as deleted
}, {
  // Automatically include created_at and updated_at fields
  timestamps: true
});

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('StudentTestResult', studentTestResultSchema);
