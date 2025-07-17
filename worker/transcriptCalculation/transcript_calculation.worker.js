// *************** IMPORT LIBRARY ***************
const { workerData, parentPort } = require("worker_threads");
const mongoose = require("mongoose");

// *************** IMPORT MODULE ***************
const {
  CalculateStudentBlockResults,
} = require("../../modules/transcriptCalculation/transcript_calculation");
const ErrorLogModel = require("../../modules/errorLogs/error_logs.model");

// *************** CONNECT TO DATABASE
/**
 * Initializes the MongoDB connection for the worker thread.
 *
 * @async
 * @function ConnectToDatabase
 * @throws {Error} If connection fails
 * @returns {Promise<void>}
 */
async function ConnectToDatabase() {
  try {
    const DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/module1";
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  } catch (error) {
    throw error;
  }
}

// *************** MAIN WORKER LOGIC 
/**
 * Calculates a student's block transcript, sends the result or error to the parent thread, and ensures the database connection is closed.
 *
 * @async
 * @function RunWorkerJob
 * @throws {Error} If calculation or serialization fails
 * @returns {Promise<void>}
 */
async function RunWorkerJob() {
  try {
    // *************** Extract parameters from workerData
    const { studentId, blockId, calculatedBy } = workerData;
    if (!studentId || !blockId || !calculatedBy) {
      throw new Error("Missing required parameters for calculation");
    }

    // *************** Run the main calculation
    const result = await CalculateStudentBlockResults(studentId, blockId, calculatedBy);

    // *************** Serialize result to avoid DataCloneError
    const serializedResult = JSON.parse(JSON.stringify(result));

    // *************** Send the result back to the main thread
    parentPort.postMessage(serializedResult);
  } catch (error) {
    // *************** Log error to database
    try {
      await ErrorLogModel.create({
        path: "worker/transcriptCalculation/transcript_calculation.worker.js",
        parameter_input: JSON.stringify(workerData),
        function_name: "RunWorkerJob",
        error: String(error.stack),
      });
    } catch (logError) {
      console.error("[Worker] Failed to log error to database:", logError);
    }
    // *************** Safely serialize the error to avoid DataCloneError
    const serializedError = {
      success: false,
      message: error.message || "Unknown error",
      error: {
        name: error.name || "Error",
        message: error.message || "Unknown error",
        stack: error.stack ? error.stack : "No stack trace available",
      },
    };
    // *************** Send error message back to main thread
    parentPort.postMessage(serializedError);
  } finally {
    // *************** Always close the database connection
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error("[Worker] Error closing database connection:", closeError);
    }
  }
}


// *************** WORKER ENTRY POINT
/**
 * Worker entry point: connects to the database, runs the main job, and handles any fatal errors.
 * This is the top-level function for the worker thread.
 *
 * @async
 * @function MainWorker
 * @returns {Promise<void>}
 */
(async function MainWorker() {
  try {
    // *************** Connect to the database first
    await ConnectToDatabase();

    // *************** Run the main worker job (calculate, post result, close DB)
    await RunWorkerJob();
  } catch (error) {
    // *************** Log fatal error to database
    try {
      await ErrorLogModel.create({
        path: "worker/transcriptCalculation/transcript_calculation.worker.js",
        parameter_input: JSON.stringify(workerData || {}),
        function_name: "MainWorker",
        error: String(error.stack),
      });
    } catch (logError) {
      console.error("[Worker] Failed to log fatal error to database:", logError);
    }
    // *************** Safely serialize the error to avoid DataCloneError
    const serializedError = {
      success: false,
      message: `Worker fatal error: ${error.message || "Unknown error"}`,
      error: {
        name: error.name || "Error",
        message: error.message || "Unknown error",
        stack: error.stack || "No stack trace available",
      },
    };
    // *************** Send error back to main thread
    parentPort.postMessage(serializedError);
    // *************** Close database connection if it's open
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    // *************** Exit with error code
    process.exit(1);
  }
})();
