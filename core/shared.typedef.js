// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** SHARED ENUMS 
const SharedTypeDefs = gql`
  enum LogicalOperator {
    AND
    OR
  }

  enum ComparisonOperator {
    GTE
    GT
    LTE
    LT
    EQ
  }

  enum ExpectedOutcome {
    PASS
    FAIL
  }
`;

// *************** EXPORT MODULE ***************
module.exports = SharedTypeDefs;
