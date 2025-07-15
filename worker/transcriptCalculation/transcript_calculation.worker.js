// *************** IMPORT LIBRARY ***************
const { workerData, parentPort } = require("worker_threads");
const mongoose = require("mongoose");

// *************** IMPORT MODULE ***************
const {
  CalculateStudentBlockResults,
} = require("../../modules/transcriptCalculation/transcript_calculation");
const ErrorLogModel = require("../../modules/errorLogs/error_logs.model");

// *************** Connect to database
// *************** Initialize database connection
async function connectToDatabase() {
  try {
    const DB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/module1";

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

// *************** MAIN CALCULATION FUNCTION
async function calculateTranscript() {
  try {
    // *************** Extract data passed to the worker
    const { studentId, blockId, calculatedBy } = workerData;

    if (!studentId || !blockId || !calculatedBy) {
      throw new Error("Missing required parameters for calculation");
    }
    // *************** Execute the calculation
    const result = await CalculateStudentBlockResults(
      studentId,
      blockId,
      calculatedBy
    );

    // *************** Convert mongoose documents to plain objects to avoid DataCloneError
    const serializedResult = JSON.parse(JSON.stringify(result));

    // *************** Send the result back to the main thread
    parentPort.postMessage(serializedResult);

    // *************** Close the database connection
    await mongoose.connection.close();
  } catch (error) {
    // *************** Log error to database
    try {
      await ErrorLogModel.create({
        path: 'worker/transcriptCalculation/transcript_calculation.worker.js',
        parameter_input: JSON.stringify(workerData),
        function_name: 'calculateTranscript',
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

    // *************** Close the database connection even on error
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error("[Worker] Error closing database connection:", closeError);
    }
  }
}

// *************** EXECUTE THE WORKER 
(async () => {
  try {
    // *************** First connect to the database
    await connectToDatabase();

    // ***************await calculateTranscript(); Then perform the calculation
    await calculateTranscript();
  } catch (error) {
    // *************** Log error to database
    try {
      await ErrorLogModel.create({
        path: 'worker/transcriptCalculation/transcript_calculation.worker.js',
        parameter_input: JSON.stringify(workerData || {}),
        function_name: 'workerMain',
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
