// *************** BLOCK HELPER FUNCTIONS 

/**
 * Sanitizes passing criteria by converting empty subject_ids to null
 * @param {Array} passingCriteria - Array of passing criteria objects
 * @returns {Array} Sanitized passing criteria array
 */
function SanitizePassingCriteria(passingCriteria) {
  if (!passingCriteria) {
    return [];
  }

  return passingCriteria.map(criteria => {
    return {
      expected_outcome: criteria.expected_outcome,
      rules: criteria.rules.map(rule => {
        return {
          logical_operator: rule.logical_operator,
          type: rule.type,
          subject_id: rule.subject_id === "" ? null : rule.subject_id,
          operator: rule.operator,
          value: rule.value
        };
      })
    };
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  SanitizePassingCriteria,
};
