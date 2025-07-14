// *************** IMPORT LIBRARY ***************
let Worker, isMainThread, parentPort, workerData;
// *************** IMPORT MODULE ***************
const {
  CalculateStudentBlockResults,
} = require("../modules/transcriptCalculation/transcript_calculation.service");

// *************** Check node version and worker suppport
let workerThreadsAvailable = false;
let nodeVersion = process.version;

try {
  // *************** Try to require worker_threads - it's experimental in Node v10
  const workerThreads = require("worker_threads");
  Worker = workerThreads.Worker;
  isMainThread = workerThreads.isMainThread;
  parentPort = workerThreads.parentPort;
  workerData = workerThreads.workerData;
  workerThreadsAvailable = true;
  console.log(
    `[WorkerManager] Worker threads available in Node.js ${nodeVersion}`
  );
} catch (error) {
  // *************** Worker threads not available
  console.log(
    `[WorkerManager] Worker threads not available in Node.js ${nodeVersion}:`,
    error.message
  );
  console.log("[WorkerManager] Falling back to synchronous execution");
  workerThreadsAvailable = false;
}

const path = require("path");
const { ApolloError } = require("apollo-server");
const ErrorLogModel = require("../modules/errorLogs/error_logs.model");

// *************** WORKER POOL CONFIG
// *************** Maximum number of concurrent workers
const MAX_WORKERS = 5;
// *************** Map to track active workers
const activeWorkers = new Map();
// *************** Queue for pending tasks
const taskQueue = [];

/**
 * *************** Logs an error to the database and console
 * @function LogWorkerError
 * @param {string} operation - The operation that was being performed
 * @param {string} errorMessage - The error message
 * @param {Object} additionalInfo - Additional context about the error
 */
async function LogWorkerError(operation, errorMessage, additionalInfo = {}) {
  try {
    // *************** Create an error log entry
    await ErrorLogModel.create({
      operation,
      error_message: errorMessage,
      additional_info: additionalInfo,
      timestamp: new Date(),
    });

    // *************** Also log to console for debugging
    console.error(
      `Error in worker manager (${operation}):`,
      errorMessage,
      additionalInfo
    );
  } catch (error) {
    // *************** If error logging itself fails, at least log to console
    console.error("Failed to log worker error to database:", error);
    console.error("Original error:", errorMessage, additionalInfo);
  }
}

/**
 * *************** Process the next task in the queue if workers are available
 * @function processNextTask
 * @private
 */
function processNextTask() {
  // *************** Only process tasks if worker threads are available
  if (!workerThreadsAvailable) {
    return;
  }

  // *************** Check if there are any tasks in the queue and if we have room for more workers
  if (taskQueue.length > 0 && activeWorkers.size < MAX_WORKERS) {
    const nextTask = taskQueue.shift();
    runCalculationInWorker(
      nextTask.workerScript,
      nextTask.workerData,
      nextTask.resolveCallback,
      nextTask.rejectCallback
    );
  }
}

/**
 * *************** Runs a calculation in a worker thread
 * @function runCalculationInWorker
 * @private
 * @param {string} workerScript - Path to the worker script
 * @param {Object} workerData - Data to pass to the worker
 * @param {Function} resolveCallback - Callback for successful completion
 * @param {Function} rejectCallback - Callback for errors
 */
function runCalculationInWorker(
  workerScript,
  workerData,
  resolveCallback,
  rejectCallback
) {
  // *************** Check if worker threads are available
  if (!workerThreadsAvailable || !Worker) {
    rejectCallback(
      new ApolloError("Worker threads not available", "WORKER_NOT_AVAILABLE")
    );
    return;
  }

  try {
    // *************** Get absolute path to worker script
    const workerScriptPath = path.resolve(workerScript);

    //  *************** Create a unique ID for this worker
    const workerId = `worker_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // *************** Create a new worker
    const worker = new Worker(workerScriptPath, {
      workerData: workerData,
    });

    // *************** Add to active workers map
    activeWorkers.set(workerId, worker);

    // *************** Handle messages from the worker
    worker.on("message", (result) => {
      // *************** Worker completed successfully
      activeWorkers.delete(workerId);
      resolveCallback(result);

      //*************** Process next task if any
      processNextTask();
    });

    // *************** Handle errors from the worker
    worker.on("error", async (error) => {
      activeWorkers.delete(workerId);

      // *************** Log the error
      await LogWorkerError("Worker Execution", error.message, {
        workerScript,
        workerId,
        workerData,
      });

      rejectCallback(
        new ApolloError(`Worker error: ${error.message}`, "WORKER_ERROR")
      );

      // *************** Process next task if any
      processNextTask();
    });

    // *************** Handle worker exit
    worker.on("exit", (code) => {
      activeWorkers.delete(workerId);

      if (code !== 0) {
        // *************** Only reject if not already handled by error event
        rejectCallback(
          new ApolloError(
            `Worker stopped with exit code ${code}`,
            "WORKER_EXIT"
          )
        );
      }

      // ***************  Process next task if any
      processNextTask();
    });
  } catch (error) {
    // *************** Log synchronous errors during worker creation
    LogWorkerError("Worker Creation", error.message, {
      workerScript,
      workerData,
    });
    rejectCallback(
      new ApolloError(
        `Failed to create worker: ${error.message}`,
        "WORKER_CREATION_ERROR"
      )
    );

    // *************** Process next task if any
    processNextTask();
  }
}

/**
 * *************** Queues a transcript calculation to be executed in a worker thread (or synchronously as fallback)
 * @function QueueTranscriptCalculation
 * @param {Object} calculationData - Data needed for the calculation
 * @param {string} calculationData.studentId - The ID of the student
 * @param {string} calculationData.blockId - The ID of the block to calculate
 * @param {string} calculationData.calculatedBy - The ID of the user performing the calculation
 * @returns {Promise<Object>} A promise that resolves with the calculation result
 */
function QueueTranscriptCalculation(calculationData) {
  return new Promise((resolve, reject) => {
    // *************** If worker threads are not available, execute synchronously
    if (!workerThreadsAvailable) {
      console.log(
        "[WorkerManager] Worker threads not available, executing calculation synchronously"
      );

      // *************** Execute the calculation directly in the main thread
      executeSynchronousCalculation(calculationData)
        .then(resolve)
        .catch(reject);

      return;
    }

    // *************** If worker threads are available, use them
    const task = {
      workerScript: path.join(
        __dirname,
        "../worker/transcriptCalculation/transcript_calculation.worker.js"
      ),
      workerData: calculationData,
      resolveCallback: resolve,
      rejectCallback: reject,
    };

    // *************** Add task to queue
    taskQueue.push(task);

    // *************** Try to process immediately if workers are available
    processNextTask();
  });
}

/**
 * *************** Executes transcript calculation synchronously when worker threads are not available
 * @function executeSynchronousCalculation
 * @param {Object} calculationData - Data needed for the calculation
 * @returns {Promise<Object>} A promise that resolves with the calculation result
 */
async function executeSynchronousCalculation(calculationData) {
  try {
    console.log(
      "[WorkerManager] Starting synchronous calculation for student:",
      calculationData.studentId
    );

    // *************** Execute the calculation
    const result = await CalculateStudentBlockResults(
      calculationData.studentId,
      calculationData.blockId,
      calculationData.calculatedBy
    );

    console.log(
      "[WorkerManager] Synchronous calculation completed successfully"
    );
    return result;
  } catch (error) {
    console.error("[WorkerManager] Synchronous calculation failed:", error);

    // *************** Log the error
    await LogWorkerError(
      "Synchronous Calculation",
      error.message,
      calculationData
    );

    // *************** Return error in the same format as worker results
    return {
      success: false,
      message: `Synchronous calculation failed: ${error.message}`,
      error: {
        name: error.name || "Error",
        message: error.message || "Unknown error",
        type: error.constructor ? error.constructor.name : "Error",
      },
    };
  }
}

/**
 * *************** Gets the count of active workers and queued tasks
 * @function GetWorkerStatus
 * @returns {Object} Object containing active worker count and queued task count
 */
function GetWorkerStatus() {
  return {
    activeWorkers: activeWorkers.size,
    queuedTasks: taskQueue.length,
  };
}

// *************** EXPORT MODULE ***************
module.exports = {
  QueueTranscriptCalculation,
  GetWorkerStatus,
};
