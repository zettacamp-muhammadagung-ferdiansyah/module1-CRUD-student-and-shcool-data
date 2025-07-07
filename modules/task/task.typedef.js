// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

const TaskTypeDefs = gql`
  enum TaskType {
    ASSIGN_CORRECTOR
    ENTER_MARKS
    VALIDATE_MARKS
  }

  enum TaskStatus {
    active
    completed
    deleted
  }

  type Task {
    _id: ID!
    test_id: Test
    user_id: User
    school_id: School
    title: String!
    description: String!
    task_type: TaskType!
    task_status: TaskStatus!
    due_date: Date
    completed_by: User
    completed_at: Date
    created_by: User!
    updated_by: User!
    deleted_by: User
    deleted_at: Date
    created_at: Date
    updated_at: Date
  }


input CreateTaskInput {
  test_id: ID!
  school_id: ID!
  user_id: ID!
  title: String!
  description: String!
  task_type: TaskType!
  due_date: Date
  created_by: ID!
}

input UpdateTaskInput {
  test_id: ID!
  school_id: ID!
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
    CreateTask(task_input: CreateTaskInput!): Task
    UpdateTask(id: ID!, task_input: UpdateTaskInput!): Task
    DeleteTask(id: ID!, deleted_by: ID!): String
    AssignCorrector(id: ID!, input: AssignCorrectorInput!): Task!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = TaskTypeDefs;
