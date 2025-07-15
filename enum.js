// *************** GLOBAL ENUM DEFINITIONS ***************

module.exports = {
  // Logical operators for rule chaining
  LOGICAL_OPERATOR: ['AND', 'OR'],

  // Test rule types
  TEST_RULE_TYPE: ['NOTATION_SCORE', 'TOTAL_SCORE'],

  // Subject rule types
  SUBJECT_RULE_TYPE: ['TEST_RESULT', 'TEST_MARK', 'SUBJECT_AVERAGE'],

  // Block rule types
  BLOCK_RULE_TYPE: ['SUBJECT_RESULT', 'SUBJECT_MARK', 'BLOCK_AVERAGE'],

  // Comparison operators
  COMPARISON_OPERATOR: ['GTE', 'GT', 'LTE', 'LT', 'EQ'],

  // Expected outcomes
  EXPECTED_OUTCOME: ['PASS', 'FAIL'],

  // Status enums
  STATUS: ['active', 'deleted'],
  TEST_STATUS: ['active', 'published', 'deleted'],
};
