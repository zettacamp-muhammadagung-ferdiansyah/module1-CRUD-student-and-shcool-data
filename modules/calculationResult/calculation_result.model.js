// *************** IMPORT CORE ***************
const Mongoose = require('mongoose');

const calculationResultSchema = new Mongoose.Schema(
  {
    // ID of the student whose results are being calculated
    student_id: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },

    // School this calculation belongs to
    school_id: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },

    // When the calculation was performed
    calculation_date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // Overall status of the calculation result
    status: {
      type: String,
      enum: ['PASS', 'FAIL', 'INCOMPLETE'],
      required: true,
    },

    // Final calculated mark across all blocks (used when multiple blocks are calculated)
    final_mark: {
      type: Number,
      default: 0,
    },

    // Results for each block
    block_results: [
      {
        // Block reference
        block_id: {
          type: Mongoose.Schema.Types.ObjectId,
          ref: 'Block',
          required: true,
        },
        
        // Block name for quick reference
        block_name: {
          type: String,
          required: true,
        },

        // Pass/fail status for this block
        status: {
          type: String,
          enum: ['PASS', 'FAIL', 'INCOMPLETE'],
          required: true,
        },

        // Computed average score across all subjects in this block
        average_score: {
          type: Number,
          required: true,
        },

        // Results for each subject in this block
        subject_results: [
          {
            // Subject reference
            subject_id: {
              type: Mongoose.Schema.Types.ObjectId,
              ref: 'Subject',
              required: true,
            },

            // Subject name for quick reference
            subject_name: {
              type: String,
              required: true,
            },

            // Pass/fail status for this subject
            status: {
              type: String,
              enum: ['PASS', 'FAIL', 'INCOMPLETE'],
              required: true,
            },

            // Subject coefficient for weighted calculations
            coefficient: {
              type: Number,
              required: true,
            },

            // Computed average score across all tests in this subject
            average_score: {
              type: Number,
              required: true,
            },

            // Results for each test in this subject
            test_results: [
              {
                // Test reference
                test_id: {
                  type: Mongoose.Schema.Types.ObjectId,
                  ref: 'Test',
                  required: true,
                },

                // Test name for quick reference
                test_name: {
                  type: String,
                  required: true,
                },

                // Pass/fail status for this test
                status: {
                  type: String,
                  enum: ['PASS', 'FAIL', 'INCOMPLETE'],
                  required: true,
                },

                // Test weight for weighted average calculations
                weight: {
                  type: Number,
                  required: true,
                },

                // Total points achieved in this test
                total_points: {
                  type: Number,
                  required: true,
                },

                // Maximum possible points for this test
                max_points: {
                  type: Number,
                  required: true,
                },


                // Detailed results for each notation
                notation_results: [
                  {
                    // Notation index from the test
                    notation_id: {
                      type: Number,
                      required: true,
                    },

                    // Notation description
                    notation_text: {
                      type: String,
                      required: true,
                    },

                    // Maximum possible points for this notation
                    max_points: {
                      type: Number,
                      required: true,
                    },

                    // Points achieved for this notation
                    achieved_points: {
                      type: Number,
                      required: true,
                    },

                  }
                ],

                // Test criteria evaluation results
                criteria_evaluation: [
                  {
                    // Expected outcome from the criteria (PASS/FAIL)
                    expected_outcome: {
                      type: String,
                      required: true,
                    },
                    
                    // Whether this criteria was satisfied
                    result: {
                      type: Boolean,
                      required: true,
                    },
                    
                    // Evaluation of each rule in the criteria
                    rule_evaluations: [
                      {
                        // Type of rule that was evaluated
                        type: {
                          type: String,
                          required: true,
                        },
                        
                        // Logical operator used (AND/OR)
                        logical_operator: {
                          type: String,
                        },
                        
                        // ID of the target entity (test_id, notation_id, etc.)
                        target_id: {
                          type: String,
                        },
                        
                        // Comparison operator used
                        operator: {
                          type: String,
                          required: true,
                        },
                        
                        // Threshold value for comparison
                        value: {
                          type: Number,
                          required: true,
                        },
                        
                        // Actual value that was compared
                        actual_value: {
                          type: Number,
                          required: true,
                        },
                        
                        // Whether this rule evaluation passed
                        passed: {
                          type: Boolean,
                          required: true,
                        },
                      }
                    ],
                  }
                ],

                // When this test result was created
                createdAt: {
                  type: Date,
                  default: Date.now,
                },
              }
            ],

            // Subject criteria evaluation results
            criteria_evaluation: [
              {
                // Expected outcome from the criteria (PASS/FAIL)
                expected_outcome: {
                  type: String,
                  required: true,
                },
                
                // Whether this criteria was satisfied
                result: {
                  type: Boolean,
                  required: true,
                },
                
                // Evaluation of each rule in the criteria
                rule_evaluations: [
                  {
                    // Type of rule that was evaluated
                    type: {
                      type: String,
                      required: true,
                    },
                    
                    // Logical operator used (AND/OR)
                    logical_operator: {
                      type: String,
                    },
                    
                    // ID of the target entity (test_id, etc.)
                    target_id: {
                      type: String,
                    },
                    
                    // Comparison operator used
                    operator: {
                      type: String,
                      required: true,
                    },
                    
                    // Threshold value for comparison
                    value: {
                      type: Number,
                      required: true,
                    },
                    
                    // Actual value that was compared
                    actual_value: {
                      type: Number,
                      required: true,
                    },
                    
                    // Whether this rule evaluation passed
                    passed: {
                      type: Boolean,
                      required: true,
                    },
                  }
                ],
              }
            ],

            // When this subject result was created
            createdAt: {
              type: Date,
              default: Date.now,
            },
          }
        ],

        // Block criteria evaluation results
        criteria_evaluation: [
          {
            // Expected outcome from the criteria (PASS/FAIL)
            expected_outcome: {
              type: String,
              required: true,
            },
            
            // Whether this criteria was satisfied
            result: {
              type: Boolean,
              required: true,
            },
            
            // Evaluation of each rule in the criteria
            rule_evaluations: [
              {
                // Type of rule that was evaluated
                type: {
                  type: String,
                  required: true,
                },
                
                // Logical operator used (AND/OR)
                logical_operator: {
                  type: String,
                },
                
                // ID of the target entity (subject_id, etc.)
                target_id: {
                  type: String,
                },
                
                // Comparison operator used
                operator: {
                  type: String,
                  required: true,
                },
                
                // Threshold value for comparison
                value: {
                  type: Number,
                  required: true,
                },
                
                // Actual value that was compared
                actual_value: {
                  type: Number,
                  required: true,
                },
                
                // Whether this rule evaluation passed
                passed: {
                  type: Boolean,
                  required: true,
                },
              }
            ],
          }
        ],

        // When this block result was created
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],

    // User who initiated the calculation
    created_by: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    // Automatically include created_at and updated_at fields
    timestamps: true,
  }
);

// *************** EXPORT MODULE ***************
module.exports = Mongoose.model('CalculationResult', calculationResultSchema);
