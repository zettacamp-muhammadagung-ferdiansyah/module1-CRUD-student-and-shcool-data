// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const CalculationResultModel = require('./calculation_result.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for CalculationResult documents.
 * This loader efficiently fetches calculation results by their IDs in batches to reduce database queries.
 *
 * @function CalculationResultLoader
 * @returns {DataLoader} A configured DataLoader instance for CalculationResult documents
 */
function CalculationResultLoader() {
  return new DataLoader(async (calculationResultIds) => {
    try {
      // *************** Query for calculation results with IDs in the provided array
      const calculationResults = await CalculationResultModel.find({
        _id: { $in: calculationResultIds }
      }).lean();

      // *************** Map results back to the original ID order
      const calculationResultMap = {};
      calculationResults.forEach((result) => {
        calculationResultMap[result._id.toString()] = result;
      });

      // *************** Return calculation results in the same order as the input IDs
      return calculationResultIds.map((id) => calculationResultMap[id.toString()] || null);
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/calculationResult/calculation_result.loader.js',
        parameter_input: JSON.stringify({ calculationResultIds }),
        function_name: 'CalculationResultLoader',
        error: String(error.stack),
      });
      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load calculation results: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

/**
 * Creates a new DataLoader for CalculationResult documents by student ID.
 * This loader efficiently fetches the latest calculation result for each student.
 *
 * @function CalculationResultByStudentLoader
 * @returns {DataLoader} A configured DataLoader instance for CalculationResult documents by student ID
 */
function CalculationResultByStudentLoader() {
  return new DataLoader(async (studentIds) => {
    try {
      // *************** Find latest calculation result for each student ID
      const results = await Promise.all(studentIds.map(async (studentId) => {
        return await CalculationResultModel.findOne(
          { student_id: studentId },
          {},
          { sort: { calculation_date: -1 } }
        ).lean();
      }));

      // *************** Return results in the same order as input student IDs
      return results.map(result => result || null);
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/calculationResult/calculation_result.loader.js',
        parameter_input: JSON.stringify({ studentIds }),
        function_name: 'CalculationResultByStudentLoader',
        error: String(error.stack),
      });
      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load calculation results by student: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  CalculationResultLoader,
  CalculationResultByStudentLoader
};
