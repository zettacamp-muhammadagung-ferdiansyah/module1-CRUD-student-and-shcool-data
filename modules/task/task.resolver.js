// *************** IMPORT LIBRARY ***************
const { ApolloError } = require("apollo-server");

// *************** IMPORT MODULE ***************
const TaskModel = require("./task.model");
const ErrorLogModel = require("../errorLogs/error_logs.model");
const { SendEmailViaSendGrid } = require("./task.helper");
const StudentModel = require("../student/student.model");
const UserModel = require("../user/user.model");
const TestModel = require("../test/test.model");
const SubjectModel = require("../subject/subject.model");
const SchoolModel = require("../school/school.model");

// *************** IMPORT VALIDATOR ***************
const TaskValidators = require("./task.validator");
const { ValidateMongoId } = require("../../utils/validator/mongo.validator");
const {ValidatePaginationParameters,} = require("../../utils/validator/pagination.validator");
const { ValidateAssignCorrector } = require("./task.validator");

// *************** QUERY ***************
/**
 * Retrieves a paginated list of active tasks
 *
 * @async
 * @function GetAllTasks
 * @param {number} args.page - Page number for pagination (0-based, where 0 is the first page)
 * @param {number} args.limit - Number of tasks per page
 * @throws {ApolloError} If query fails or pagination parameters are invalid
 * @returns {Promise<Object>} Paginated result with tasks data, total count, page, and limit
 */
async function GetAllTasks(_, { page, limit }) {
  try {
    // *************** Validate pagination parameters
    ValidatePaginationParameters({ page, limit });

    // *************** Calculate skip value for pagination
    const skip = page * limit;

    // *************** Execute queries sequentially
    const tasks = await TaskModel.find({ task_status: "active" })
      .skip(skip)
      .limit(limit)
      .lean();

    // *************** Prepare paginated result
    const paginatedResult = {
      data: tasks,
      page,
      length: tasks.length,
    };

    // *************** Return paginated result
    return paginatedResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ page, limit }),
      function_name: "GetAllTasks",
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a single task by ID
 *
 * @async
 * @function GetTaskById
 * @param {string} args.id - MongoDB ObjectId of the task
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if task doesn't exist or is deleted
 * @returns {Promise<Object>} The task object
 */
async function GetTaskById(_, { id }) {
  try {
    // *************** Validate ID
    ValidateMongoId(id);

    // *************** Find task by ID
    const task = await TaskModel.findOne({
      _id: id,
      task_status: "active",
    }).lean();

    // *************** Check if task exists
    if (!task) {
      throw new ApolloError("Task not found", "RESOURCE_NOT_FOUND");
    }

    // *************** Return the task
    return task;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ id }),
      function_name: "GetTaskById",
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new task
 *
 * @async
 * @function CreateTask
 * @param {Object} args.task_input - Input containing task data
 * @param {string} args.task_input.test_id - ID of the test this task belongs to
 * @param {string} args.task_input.user_id - ID of the user this task belongs to
 * @param {string} args.task_input.school_id - ID of the school this task belongs to
 * @param {string} args.task_input.title - Title of the task
 * @param {string} args.task_input.description - Description of the task
 * @param {string} args.task_input.task_type - Type of the task
 * @param {Date} [args.task_input.due_date] - Due date for the task
 * @param {string} args.task_input.created_by - User ID of creator
 * @param {string} args.task_input.updated_by - User ID of updater
 * @throws {ApolloError} If validation fails or creation error occurs
 * @returns {Promise<Object>} The created task object
 */
async function CreateTask(_, { task_input }) {
  try {
    // *************** Validate input parameters
    TaskValidators.ValidateCreateTaskParameters(task_input);

    // *************** Create task object with input data
    const taskData = {
      test_id: task_input.test_id,
      user_id: task_input.user_id,
      school_id: task_input.school_id,
      title: task_input.title,
      description: task_input.description,
      task_type: task_input.task_type,
      task_status: "active",
      created_by: task_input.created_by,
      updated_by: task_input.updated_by,
    };

    // *************** Add optional fields if they exist
    if (task_input.due_date) {
      taskData.due_date = task_input.due_date;
    }

    // *************** Create task
    const newTask = await TaskModel.create(taskData);

    // *************** Return the created task
    return newTask;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ task_input }),
      function_name: "CreateTask",
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing task
 *
 * @async
 * @function UpdateTask
 * @param {string} args.id - Task ID to update
 * @param {Object} args.task_input - Input containing updated task data
 * @param {string} args.task_input.test_id - Updated test ID
 * @param {string} args.task_input.user_id - Updated user ID
 * @param {string} args.task_input.school_id - Updated school ID
 * @param {string} args.task_input.title - Updated title
 * @param {string} args.task_input.description - Updated description
 * @param {string} args.task_input.task_type - Updated task type
 * @param {Date} [args.task_input.due_date] - Updated due date
 * @param {string} args.task_input.updated_by - User ID of updater
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if task doesn't exist
 * @returns {Promise<Object>} The updated task object
 */
async function UpdateTask(_, { id, task_input }) {
  try {
    // *************** Validate input parameters
    TaskValidators.ValidateUpdateTaskParameters({ id, taskInput: task_input });

    // *************** Prepare update payload with all required fields
    const updatePayload = {
      test_id: task_input.test_id,
      school_id: task_input.school_id,
      user_id: task_input.user_id,
      title: task_input.title,
      description: task_input.description,
      task_type: task_input.task_type,
      updated_by: task_input.updated_by,
    };

    // *************** Add optional fields if provided
    if (task_input.due_date) {
      updatePayload.due_date = task_input.due_date;
    }

    // *************** Update the task and return the updated document
    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: id, task_status: "active" },
      { $set: updatePayload },
      { new: true }
    );

    // *************** Check if task exists and was updated
    if (!updatedTask) {
      throw new ApolloError("Task not found", "RESOURCE_NOT_FOUND");
    }

    // *************** Return updated task
    return updatedTask;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ id, task_input }),
      function_name: "UpdateTask",
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a task by setting status to 'DELETED'
 *
 * @async
 * @function DeleteTask
 * @param {string} args.id - Task ID to delete
 * @param {string} args.deleted_by - User ID performing the deletion
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if task doesn't exist
 * @throws {ApolloError} Throws 'ALREADY_DELETED' if task is already deleted
 * @returns {Promise<Object>} The deleted task object
 */
async function DeleteTask(_, { id, deleted_by }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Soft delete the task
    const result = await TaskModel.updateOne(
      { _id: id, task_status: { $in: ["active", "completed"] } },
      {
        task_status: "deleted",
        deleted_at: new Date(),
        deleted_by,
      }
    );
    // *************** Check if any document was actually modified
    if (result.modifiedCount === 0) {
      throw new ApolloError(
        "Task not found or already deleted",
        "RESOURCE_NOT_FOUND"
      );
    }
    return "task has been deleted";
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ id, deleted_by }),
      function_name: "DeleteTask",
      error: String(error.stack),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

/**
 * Assigns a corrector to a test, marks the ASSIGN_CORRECTOR task as completed, creates ENTER_MARKS task, and sends notification.
 *
 * @async
 * @function AssignCorrector
 * @param {string} args.id - The ID of the ASSIGN_CORRECTOR task
 * @param {object} args.input - The input payload
 * @param {string} args.input.user_id - The ID of the user to be assigned as corrector
 * @param {string} [args.input.due_date] - Optional due date for the ENTER_MARKS task
 * @returns {Promise<Object>} The updated ASSIGN_CORRECTOR task (now completed)
 * @throws {ApolloError} - Throws an error if validation or any DB operation fails
 */
async function AssignCorrector(_, { id, input }) {
  try {
    // *************** Validate input
    ValidateAssignCorrector(id, input);
    const { user_id, due_date } = input;

    // *************** Find the ASSIGN_CORRECTOR task and populate test only
    const assignTask = await TaskModel.findOne({
      _id: id,
      task_type: "ASSIGN_CORRECTOR",
      task_status: "active",
    })
      .populate("test_id")
      .lean();
      
    console.log(assignTask && assignTask.test_id);
    if (!assignTask) {
      throw new ApolloError(
        "AssignCorrector task not found or not active",
        "RESOURCE_NOT_FOUND"
      );
    }

    const test = assignTask.test_id;
    if (!test) throw new ApolloError("Test not found", "RESOURCE_NOT_FOUND");
    const subject = test.subject_id;
    const corrector = await UserModel.findById(user_id).lean();
    if (!corrector)
      throw new ApolloError("Corrector not found", "RESOURCE_NOT_FOUND");

    // *************** Fetch all students from the school data using populate
    const school = await SchoolModel.findById(test.school_id)
      .populate({ path: "students", match: { status: "active" } })
      .lean();
    if (!school)
      throw new ApolloError("School not found", "RESOURCE_NOT_FOUND");
    const students = Array.isArray(school.students) ? school.students : [];
    if (!students.length) {
      throw new ApolloError("No students found for the school", "NO_STUDENTS");
    }

    // *************** Mark ASSIGN_CORRECTOR task as completed 
    const updatedAssignTask = await TaskModel.findOneAndUpdate(
      { _id: assignTask._id },
      {
        $set: {
          task_status: "completed",
          updated_by: user_id,
          completed_by: user_id,
          completed_at: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!updatedAssignTask) {
      throw new ApolloError("Failed to update assign task", "UPDATE_FAILED");
    }

    // *************** Create ENTER_MARKS task for each student
    const enterMarksTasks = students.map((student) => ({
      test_id: test._id,
      school_id: test.school_id,
      student_id: student._id,
      user_id: user_id,
      title: `Enter Marks for ${student.first_name} ${student.last_name}`,
      description: `Enter marks for student ${student.first_name} ${student.last_name} in test ${test.name}`,
      task_type: "ENTER_MARKS",
      task_status: "active",
      due_date: due_date ? new Date(due_date) : undefined,
      created_by: user_id,
      updated_by: user_id,
    }));
    await TaskModel.insertMany(enterMarksTasks);

    // *************** Compose student names
    const studentNames = students
      .map((s) => `${s.first_name} ${s.last_name}`)
      .join(", ");

    // *************** Send notification email
    const emailPayload = {
      to: corrector.email,
      subject: "You have been assigned as a Test Corrector!",
      html: `
        <h2>You have been assigned as a Test Corrector!</h2>
        <p><strong>Test:</strong> ${test.name}</p>
        <p><strong>Subject:</strong> ${subject ? subject.name : "-"}</p>
        <p><strong>Description:</strong> ${test.description || "-"}</p>
        <p><strong>Students to correct:</strong> ${studentNames}</p>
      `,
    };
    const sendEmailResult = await SendEmailViaSendGrid(emailPayload);
    if (!sendEmailResult)
      throw new ApolloError(
        "Failed to send email notification",
        "EMAIL_FAILED"
      );

    // *************** Return the updated assignTask
    return updatedAssignTask;
  } catch (error) {
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ id, input }),
      function_name: "AssignCorrector",
      error: String(error.stack),
    });
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************
/**
 * Retrieves the test associated with a task using DataLoader
 *
 * @async
 * @function GetTestByTask
 * @param {Object} parent - The parent resolver object containing the task data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to the test document
 */
async function GetTestByTask(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) {
      return null;
    }

    // ************** Return null if no test_id is associated
    if (!parent.test_id) {
      return null;
    }

    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.TestLoader) {
      return null;
    }

    // *************** Load test using DataLoader
    const test = await context.loaders.TestLoader.load(parent.test_id);

    // *************** Check if test exists
    if (!test) {
      return null;
    }

    return test;
  } catch (error) {
    // ***************  Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: "GetTestByTask",
      error: String(error.stack),
    });

    // ***************  Throw error with context
    throw new ApolloError(`Failed to load test: ${error.message}`);
  }
}

/**
 * Retrieves the school associated with a task using DataLoader
 *
 * @async
 * @function GetSchoolByTask
 * @param {Object} parent - The parent resolver object containing the task data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to the school document
 */
async function GetSchoolByTask(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) {
      return null;
    }

    // ************** Return null if no school_id is associated
    if (!parent.school_id) {
      return null;
    }

    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.SchoolLoader) {
      return null;
    }

    // *************** Load school using DataLoader
    const school = await context.loaders.SchoolLoader.load(parent.school_id);

    // *************** Check if school exists
    if (!school) {
      return null;
    }

    return school;
  } catch (error) {
    // ***************  Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: "GetSchoolByTask",
      error: String(error.stack),
    });

    // ***************  Throw error with context
    throw new ApolloError(`Failed to load school: ${error.message}`);
  }
}

/**
 * Retrieves the user associated with a task using DataLoader
 *
 * @async
 * @function GetUserByTask
 * @param {Object} parent - The parent resolver object containing the task data
 * @param {Object} context - The context object containing loaders
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Object>} A promise that resolves to the user document
 */
async function GetUserByTask(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) {
      return null;
    }

    // ************** Return null if no user_id is associated
    if (!parent.user_id) {
      return null;
    }

    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      return null;
    }

    // *************** Load user using DataLoader
    const user = await context.loaders.UserLoader.load(parent.user_id);

    // *************** Check if user exists
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    //************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: "GetUserByTask",
      error: String(error.stack),
    });

    // ************** Throw error with context
    throw new ApolloError(`Failed to load user: ${error.message}`);
  }
}

/**
 * Loads the user who created the task using DataLoader.
 *
 * @async
 * @function CreatedByUser
 * @param {object} parent - The task object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function CreatedByUser(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) return null;
    // ************** Return null if no created_by is associated
    if (!parent.created_by) return null;
    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.created_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: "CreatedByUser",
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(
      `Unable to load creator user: ${error.message}`,
      "USER_FETCH_FAILED"
    );
  }
}

/**
 * Loads the user who last updated the task using DataLoader.
 *
 * @async
 * @function UpdatedByUser
 * @param {object} parent - The task object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function UpdatedByUser(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) return null;
    // ************** Return null if no updated_by is associated
    if (!parent.updated_by) return null;
    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.updated_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: "UpdatedByUser",
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(
      `Unable to load updater user: ${error.message}`,
      "USER_FETCH_FAILED"
    );
  }
}

/**
 * Loads the user who deleted the task using DataLoader.
 *
 * @async
 * @function DeletedByUser
 * @param {object} parent - The task object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function DeletedByUser(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) return null;
    // ************** Return null if no deleted_by is associated
    if (!parent.deleted_by) return null;
    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.deleted_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: "DeletedByUser",
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(
      `Unable to load deleter user: ${error.message}`,
      "USER_FETCH_FAILED"
    );
  }
}

/**
 * Loads the user who completed the task using DataLoader.
 *
 * @async
 * @function CompletedByUser
 * @param {object} parent - The task object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
/**
 * Loads the user who completed the task using DataLoader.
 *
 * @async
 * @function CompletedByUser
 * @param {object} parent - The task object.
 * @param {object} context - The GraphQL context containing loaders.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
async function CompletedByUser(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) return null;
    // ************** Return null if no completed_by is associated
    if (!parent.completed_by) return null;
    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.UserLoader) {
      return null;
    }
    // ************** Use the UserLoader to load the user by ID
    return await context.loaders.UserLoader.load(parent.completed_by);
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: "modules/task/task.resolver.js",
      parameter_input: JSON.stringify({ parent_id: parent._id }),
      function_name: "CompletedByUser",
      error: String(error.stack),
    });
    // ************** Throw error message
    throw new ApolloError(
      `Unable to load completed_by user: ${error.message}`,
      "USER_FETCH_FAILED"
    );
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllTasks,
    GetTaskById,
  },
  Mutation: {
    CreateTask,
    UpdateTask,
    DeleteTask,
    AssignCorrector,
  },
  Task: {
    test_id: GetTestByTask,
    user_id: GetUserByTask,
    school_id: GetSchoolByTask,
    created_by: CreatedByUser,
    updated_by: UpdatedByUser,
    deleted_by: DeletedByUser,
    completed_by: CompletedByUser,
  },
};
