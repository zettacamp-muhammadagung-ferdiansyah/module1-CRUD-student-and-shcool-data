// *************** IMPORT LIBRARY ***************
const path = require('path');
const { ApolloError } = require('apollo-server');
let Worker, isMainThread, parentPort, workerData;

// *************** IMPORT MODULE ***************
const ErrorLogModel = require('../modules/errorLogs/error_logs.model');

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
} catch (error) {
  // *************** Worker threads not available
  workerThreadsAvailable = false;
}




// *************** WORKER POOL CONFIG
// *************** Maximum number of concurrent workers
const MAX_WORKERS = 5;
// *************** Map to track active workers
const activeWorkers = new Map();
// *************** Queue for pending tasks
const taskQueue = [];



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
      try {
        activeWorkers.delete(workerId);

        // ************** Log error to database
        await ErrorLogModel.create({
          path: 'utils/worker.manager.js',
          parameter_input: JSON.stringify({ workerScript, workerId, workerData }),
          function_name: 'runCalculationInWorker',
          error: String(error.stack),
        });

        // ************** Reject with ApolloError
        rejectCallback(new ApolloError(error.message));

        // *************** Process next task if any
        processNextTask();
      } catch (logError) {
        // *************** If error logging fails, still reject with original error
        rejectCallback(new ApolloError(error.message));
        processNextTask();
      }
    });

    // *************** Handle worker exit
    worker.on("exit", async (code) => {
      try {
        activeWorkers.delete(workerId);

        if (code !== 0) {
          const errorMessage = `Worker stopped with exit code ${code}`;
          
          // ************** Log error to database
          await ErrorLogModel.create({
            path: 'utils/worker.manager.js',
            parameter_input: JSON.stringify({ workerScript, workerId, workerData, exitCode: code }),
            function_name: 'runCalculationInWorker',
            error: errorMessage,
          });

          // ************** Reject the promise with ApolloError
          rejectCallback(new ApolloError(errorMessage));
        }

        // ***************  Process next task if any
        processNextTask();
      } catch (logError) {
        // *************** If error logging fails, still reject
        const errorMessage = `Worker stopped with exit code ${code}`;
        if (code !== 0) {
          rejectCallback(new ApolloError(errorMessage));
        }
        processNextTask();
      }
    });
  } catch (error) {
    // *************** Handle synchronous errors during worker creation
    ErrorLogModel.create({
      path: 'utils/worker.manager.js',
      parameter_input: JSON.stringify({ workerScript, workerData }),
      function_name: 'runCalculationInWorker',
      error: String(error.stack),
    }).then(() => {
      rejectCallback(new ApolloError(error.message));
      processNextTask();
    }).catch((logError) => {
      rejectCallback(new ApolloError(error.message));
      processNextTask();
    });
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
    try {
      // *************** If worker threads are not available, reject with error
      if (!workerThreadsAvailable) {
        reject(new ApolloError(
          "Worker threads not available for transcript calculation", 
          "WORKER_NOT_AVAILABLE"
        ));
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
    } catch (error) {
      // ************** Log error to database
      ErrorLogModel.create({
        path: 'utils/worker.manager.js',
        parameter_input: JSON.stringify(calculationData),
        function_name: 'QueueTranscriptCalculation',
        error: String(error.stack),
      }).then(() => {
        // ************** Reject with ApolloError
        reject(new ApolloError(error.message));
      }).catch((logError) => {
        reject(new ApolloError(error.message));
      });
    }
  });
}

/**
 * *************** Gets the count of active workers and queued tasks
 * @function GetWorkerStatus
 * @returns {Object} Object containing active worker count and queued task count
 */
function GetWorkerStatus() {
  try {
    return {
      activeWorkers: activeWorkers.size,
      queuedTasks: taskQueue.length,
      maxWorkers: MAX_WORKERS,
      workerThreadsAvailable: workerThreadsAvailable,
      nodeVersion: nodeVersion
    };
  } catch (error) {
    // ************** Log error to database (don't await here to avoid blocking)
    ErrorLogModel.create({
      path: 'utils/worker.manager.js',
      parameter_input: JSON.stringify({}),
      function_name: 'GetWorkerStatus',
      error: String(error.stack),
    });

    // ************** Throw ApolloError
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  QueueTranscriptCalculation,
  GetWorkerStatus,
};
