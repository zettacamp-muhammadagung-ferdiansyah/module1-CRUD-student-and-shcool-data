// *************** IMPORT MODULES ***************
const CalculationResultModel = require('./calculation_result.model');
const CalculationResultResolvers = require('./calculation_result.resolver');
const { CalculationResultLoader, CalculationResultByStudentLoader } = require('./calculation_result.loader');

// *************** EXPORT MODULES ***************
module.exports = {
  Model: CalculationResultModel,
  Resolvers: CalculationResultResolvers,
  Loaders: {
    CalculationResultLoader,
    CalculationResultByStudentLoader
  }
};
