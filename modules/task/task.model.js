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
      required: true
    },
    
    // The ID of the user to which the task belongs
    user_id: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Title of the task
    title: {
      type: String,
      required: true
    },
    
    // Description of the task
    description: {
      type: String,
      required: true
    },
    
    // Type of the task
    task_type: {
      type: String,
      enum: ['ASSIGN_CORRECTOR', 'ENTER_MARKS', 'VALIDATE_MARKS'],
      required: true
    },
    
    // Status of the task
    task_status: {
      type: String,
      enum: ['ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'DELETED'],
      default: 'ACTIVE'
    },
    
    // Due date for the task
    due_date: {
      type: Date
    },
    
    // The ID of user that completed this task
    completed_by: {
      type: String,
      default: null
    },
    
    // Timestamp for when this task was completed
    completed_at: {
      type: Date
    },
    
    // ID of the user who created this task record
    created_by: {
      type: String,
      default: null
    },
    
    // ID of the user who last updated this task record
    updated_by: {
      type: String,
      default: null
    },
    
    // ID of the user who deleted this task (if applicable)
    deleted_by: {
      type: String,
      default: null
    },
    
    // Timestamp when the task was marked as deleted
    deleted_at: {
      type: Date,
      default: null
    }
  },
  {
    // Enable automatic timestamp tracking
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Register the model with Mongoose
const TaskModel = mongoose.model('Task', TaskSchema);

// *************** EXPORT MODULE ***************
module.exports = TaskModel;
