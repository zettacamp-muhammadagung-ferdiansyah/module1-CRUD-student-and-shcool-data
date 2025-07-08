// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

// Construct the schema definition for tasks
const TaskSchema = new Schema(
  {

    // The ID of the test to which the task belongs
    test_id: {
      type: Types.ObjectId,
      ref: 'Test',
      required: true,
    },

    // The ID of the school to which the task belongs (for multi-student assignment)
    school_id: {
      type: Types.ObjectId,
      ref: 'School',
      required: true,
    },

    // The ID of the user to which the task belongs (corrector or student)
    user_id: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The ID of the student related to the task (optional, for tasks like ENTER_MARKS and VALIDATE_MARKS
    student_id: {
      type: Types.ObjectId,
      ref: 'Student',
    },

    // Title of the task
    title: {
      type: String,
      required: true,
    },

    // Description of the task
    description: {
      type: String,
      required: true,
    },

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
    due_date: {
      type: Date,
    },

    // The user who completed this task
    completed_by: {
      type: Types.ObjectId,
      ref: 'user',
      default: null,
    },

    // Timestamp for when this task was completed
    completed_at: {
      type: Date,
    },

    // The user who created the task
    created_by: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // The user who last updated the task
    updated_by: {
      type: Types.ObjectId,
      ref: 'user'
    },

    // The user who deleted the task (if applicable)
    deleted_by: {
      type: Types.ObjectId,
      ref: 'user',
      default: null,
    },

    // Timestamp when the task was marked as deleted
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    // Enable automatic timestamp tracking
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Register the model with Mongoose
const TaskModel = mongoose.model('Task', TaskSchema);

// *************** EXPORT MODULE ***************
module.exports = TaskModel;
