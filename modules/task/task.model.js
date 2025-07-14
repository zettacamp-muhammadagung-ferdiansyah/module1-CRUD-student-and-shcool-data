// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const taskSchema = new Mongoose.Schema(
  {
    // Reference to the Test this task belongs to
    test_id: { type: Mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },

    // Reference to the School this task belongs to
    school_id: { type: Mongoose.Schema.Types.ObjectId, ref: 'School', required: true },

    // Reference to the User this task belongs to (corrector or student)
    user_id: { type: Mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Reference to the Student related to the task (for ENTER_MARKS and VALIDATE_MARKS)
    student_id: { type: Mongoose.Schema.Types.ObjectId, ref: 'Student' },

    // Title of the task
    title: { type: String, required: true },

    // Description of the task
    description: { type: String, required: true },

    // Type of the task
    task_type: {
      type: String,
      enum: ['ASSIGN_CORRECTOR', 'ENTER_MARKS', 'VALIDATE_MARKS'],
      required: true,
    },

    // Status of the task
    task_status: {
      type: String,
      enum: ['active', 'completed', 'deleted'],
      default: 'active',
    },

    // Due date for the task
    due_date: { type: Date },

    // The user who completed this task
    completed_by: { type: Mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Timestamp for when this task was completed
    completed_at: { type: Date },

    // The user who created the task
    created_by: { type: Mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // The user who last updated the task
    updated_by: { type: Mongoose.Schema.Types.ObjectId, ref: 'User' },

    // The user who deleted the task (if applicable)
    deleted_by: { type: Mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Timestamp when the task was marked as deleted
    deleted_at: { type: Date, default: null },
  },
  {
    // Automatically include created_at and updated_at fields
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('Task', taskSchema);
