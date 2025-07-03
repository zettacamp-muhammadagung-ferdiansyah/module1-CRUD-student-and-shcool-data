 // *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const TaskTypeDefs = gql`
  enum TaskType {
    ASSIGN_CORRECTOR
    ENTER_MARKS
    VALIDATE_MARKS
  }

  enum TaskStatus {
    ACTIVE
    IN_PROGRESS
    COMPLETED
  }

  type Task {
    _id: ID!
    test_id: ID!
    user_id: ID!
    title: String!
    description: String!
    task_type: TaskType!
    task_status: TaskStatus!
    due_date: Date
    completed_by: String
    completed_at: Date
    created_by: User!
    updated_by: User!
    deleted_by: User
    deleted_at: Date
    created_at: Date
    updated_at: Date
    test: Test
    user: User
  }

  input TaskInput {
    test_id: ID!
    user_id: ID!
    title: String!
    description: String!
    task_type: TaskType!
    due_date: Date
    created_by: ID!
    updated_by: ID!
  }

  input TaskUpdateInput {
    test_id: ID!
    user_id: ID!
    title: String!
    description: String!
    task_type: TaskType!
    task_status: TaskStatus
    due_date: Date
    updated_by: ID!
  }

  input AssignCorrectorInput {
    user_id: ID!
    due_date: Date
  }

  type PaginatedTask {
    data: [Task]
    page: Int
    limit: Int
  }

  extend type Query {
    GetAllTasks(page: Int!, limit: Int!): PaginatedTask
    GetTaskById(id: ID!): Task
  }
  
  extend type Mutation {
    CreateTask(task_input: TaskInput!): Task
    UpdateTask(id: ID!, task_input: TaskUpdateInput!): Task
    DeleteTask(id: ID!, deleted_by: ID!): Task
    AssignCorrector(id: ID!, input: AssignCorrectorInput!): Task!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = TaskTypeDefs;
