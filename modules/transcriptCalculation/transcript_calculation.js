// *************** IMPORT LIBRARY ***************
const { ApolloError } = require("apollo-server");
const Mongoose = require("mongoose");

// *************** IMPORT MODULES ***************
const Block = require("../block/block.model");
const Subject = require("../subject/subject.model");
const Test = require("../test/test.model");
const Student = require("../student/student.model");
const StudentTestResult = require("../studentTestResult/student_test_result.model");
const CalculationResult = require("../calculationResult/calculation_result.model");
const ErrorLogModel = require("../errorLogs/error_logs.model");

// *************** IMPORT VALIDATOR ***************
const {
  ValidateCalculateStudentBlockResultsParameters,
  ValidateSaveCalculationResultParameters,
  ValidateCalculateStudentCompleteTranscriptParameters,
} = require("./transcript_calculation.validator");

// *************** IMPORT UTILITIES ***************
const {
  CalculateTestWeightedMark,
  CalculateSubjectTotalMark,
  CalculateBlockTotalMark,
  CalculateFinalMark,
} = require("../../utils/calculation/marks.calculator");

const {
  EvaluateTestCriteria,
  EvaluateSubjectCriteria,
  EvaluateBlockCriteria,
  EvaluateTestCriteriaDetailed,
  EvaluateSubjectCriteriaDetailed,
  EvaluateBlockCriteriaDetailed,
} = require("../../utils/calculation/criteria.evaluator");

/**
 * *************** Calculates and saves a student's transcript results for a specific block
 * @function CalculateStudentBlockResults
 * @param {string} studentId - The ID of the student
 * @param {string} blockId - The ID of the block to calculate
 * @param {string} calculatedBy - The ID of the user performing the calculation
 * @returns {Object} The calculation result with success/failure status
 */
async function CalculateStudentBlockResults(studentId, blockId, calculatedBy) {
  try {
    // *************** Validate input parameters
    ValidateCalculateStudentBlockResultsParameters({
      studentId,
      blockId,
      calculatedBy,
    });

    // *************** Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApolloError(
        `Student with ID ${studentId} not found`,
        "NOT_FOUND"
      );
    }

    // *************** Find block and populate subjects with their tests (single query)
    const block = await Block.findById(blockId)
      .populate({
        path: "subjects",
        match: { status: "active" },
        populate: {
          path: "tests",
          match: { test_status: { $in: ["active", "published"] } },
        },
      })
      .lean();

    // *************** Check if block exists
    if (!block) {
      throw new ApolloError(`Block with ID ${blockId} not found`, "NOT_FOUND");
    }

    // *************** Extract subjects from populated block
    const subjects = Array.isArray(block.subjects) ? block.subjects : [];
    if (!subjects.length) {
      throw new ApolloError(
        `No active subjects found for block ${blockId}`,
        "NOT_FOUND"
      );
    }

    // *************** Create a map of subject IDs for quick lookups
    const subjectIdsMap = subjects.reduce((map, subject) => {
      map[String(subject._id)] = subject;
      return map;
    }, {});

    // *************** Create a map of tests by ID and by subject ID
    const testsMap = {};
    const testsBySubject = {};
    const testIds = [];
    for (const subject of subjects) {
      const subjectId = String(subject._id);
      const subjectTests = Array.isArray(subject.tests)
        ? subject.tests.filter((t) => t && ["active", "published"].includes(t.test_status))
        : [];
      testsBySubject[subjectId] = subjectTests;
      for (const test of subjectTests) {
        testsMap[String(test._id)] = test;
        testIds.push(test._id);
      }
    }

    // *************** If no tests found for any subject, throw error
    if (testIds.length === 0) {
      throw new ApolloError(
        `No active tests found for subjects in block ${blockId}`,
        "NOT_FOUND"
      );
    }

    // *************** Fetch all student test results for these tests
    const studentTestResults = await StudentTestResult.find({
      student_id: studentId,
      test_id: { $in: testIds },
      student_test_result_status: { $in: ["active", "validated"] },
    });
    

    // *************** Create a map of test results by test ID for quick lookups
    const testResultsMap = studentTestResults.reduce((map, result) => {
      map[String(result.test_id)] = result;
      return map;
    }, {});

    // *************** Calculate test results and subject results, then evaluate criteria
    let blockResult = {
      block_id: block._id,
      block_name: block.name,
       // *************** Will be updated after evaluation
      status: "INCOMPLETE",
      // *************** Will be calculated
      average_score: 0, 
      subject_results: [],
      criteria_evaluation: [], // *************** Ensure this is initialized
    };

    // *************** Process each subject
    for (const subject of subjects) {
      const subjectId = String(subject._id);
      const subjectTests = testsBySubject[subjectId] || [];

    

      const subjectResult = {
        subject_id: subject._id,
        subject_name: subject.name,
        // *************** Will be updated after evaluation
        status: "INCOMPLETE", 
        coefficient: subject.coefficient,
        // *************** Will be calculated
        average_score: 0, 
        test_results: [],
        criteria_evaluation: [],
      };

      // *************** Create a map of test results for this subject
      const subjectTestResultsMap = {};

      // *************** Process each test in the subject
      for (const test of subjectTests) {
        const testId = String(test._id);
        const testResult = testResultsMap[testId];


        // *************** Skip if no result exists
        if (!testResult) {
          continue;
        }

        // *************** Calculate notation-level results
        const notationResults = test.notations.map((notation, index) => {
          let achievedPoints = 0;

          // *************** Find the corresponding mark by notation_text instead of index
          if (testResult.marks && testResult.marks.length > 0) {
            const matchingMark = testResult.marks.find(
              (mark) => mark.notation_text === notation.notation_text
            );
            if (matchingMark) {
              achievedPoints = matchingMark.mark;
            }
          }

          const maxPoints = notation.max_points;

          return {
            notation_id: index,
            notation_text: notation.notation_text,
            max_points: maxPoints,
            achieved_points: achievedPoints,
          };
        });

        // *************** Calculate total achieved points for the test
        const totalAchievedPoints = notationResults.reduce(
          (sum, n) => sum + n.achieved_points,
          0
        );

        // *************** Calculate average mark for the test (average of achieved points per notation)
        const averageMark =
          notationResults.length > 0 ? totalAchievedPoints / notationResults.length : 0;

        // *************** Calculate weighted test mark using utility
        const weightedMark = CalculateTestWeightedMark(averageMark, test.weight);

        // *************** Create the test result object
        const processedTestResult = {
          test_id: test._id,
          test_name: test.name,
          status: "INCOMPLETE", // *************** Will be updated after evaluation
          weight: test.weight,
          weighted_mark: weightedMark, // *************** Add weighted mark calculated by utility
          total_points: totalAchievedPoints,
          average_mark: averageMark,
          notation_results: notationResults,
          criteria_evaluation: [],
          createdAt: new Date(),
        };

        // *************** Evaluate test criteria using detailed utility
        if (test.passing_criteria && test.passing_criteria.length > 0) {
          try {
            const detailedEvaluation = EvaluateTestCriteriaDetailed(
              test.passing_criteria,
              processedTestResult
            );

            // *************** Use detailed evaluation results
            processedTestResult.criteria_evaluation = detailedEvaluation.criteria_evaluation;
            processedTestResult.status = detailedEvaluation.passed ? "PASS" : "FAIL";
          } catch (evaluationError) {
            // *************** Fallback to basic evaluation if detailed evaluation fails
            const basicResult = EvaluateTestCriteria(
              test.passing_criteria,
              processedTestResult
            );
            processedTestResult.criteria_evaluation = [
              {
                expected_outcome: "PASS",
                result: basicResult,
                rule_evaluations: [],
              },
            ];
            processedTestResult.status = basicResult ? "PASS" : "FAIL";
          }
        } else {
          // *************** If no criteria defined, default to pass if any points achieved
          processedTestResult.status =
            processedTestResult.average_mark > 0 ? "PASS" : "FAIL";
        }

        // *************** Add to the test results array
        subjectResult.test_results.push(processedTestResult);
        subjectTestResultsMap[testId] = processedTestResult;
      }

      // *************** Calculate subject average score using utility with weighted marks
      if (subjectResult.test_results.length > 0) {
        // *************** Prepare test results for calculation utility, using the average marks
        const testResultsForCalculation = subjectResult.test_results.map(
          (test) => ({
            average_mark: test.average_mark,
            weight: test.weight,
          })
        );

        // *************** Use utility to calculate subject total (without coefficient applied yet)
        const subjectTotalWithoutCoefficient = CalculateSubjectTotalMark(
          testResultsForCalculation,
          1
        );
        subjectResult.average_score = subjectTotalWithoutCoefficient;

        // *************** Evaluate subject criteria using detailed utility
        if (subject.passing_criteria && subject.passing_criteria.length > 0) {
          try {
            const detailedEvaluation = EvaluateSubjectCriteriaDetailed(
              subject.passing_criteria,
              subjectResult,
              subjectTestResultsMap
            );

            // *************** Use detailed evaluation results
            subjectResult.criteria_evaluation = detailedEvaluation.criteria_evaluation;
            subjectResult.status = detailedEvaluation.passed ? "PASS" : "FAIL";
          } catch (evaluationError) {
            // *************** Fallback to basic evaluation if detailed evaluation fails
            const basicResult = EvaluateSubjectCriteria(
              subject.passing_criteria,
              subjectResult,
              subjectTestResultsMap
            );
            subjectResult.criteria_evaluation = [
              {
                expected_outcome: "PASS",
                result: basicResult,
                rule_evaluations: [],
              },
            ];
            subjectResult.status = basicResult ? "PASS" : "FAIL";
          }
        } else {
          // *************** If no criteria defined, create a default evaluation based on average score
          const passed = subjectResult.average_score >= 50;
          subjectResult.criteria_evaluation = [
            {
              expected_outcome: passed ? "PASS" : "FAIL",
              result: passed,
              rule_evaluations: [
                {
                  type: "SUBJECT_AVERAGE",
                  logical_operator: null,
                  target_id: null,
                  operator: "GTE",
                  value: 50,
                  actual_value: subjectResult.average_score,
                  passed: passed,
                },
              ],
            },
          ];

          subjectResult.status = passed ? "PASS" : "FAIL";
        }
      } else {
        // *************** No test results for this subject
        // *************** Create a default criteria evaluation indicating incomplete status
        subjectResult.criteria_evaluation = [
          {
            expected_outcome: "INCOMPLETE",
            result: false,
            rule_evaluations: [
              {
                type: "NO_RESULTS",
                logical_operator: null,
                target_id: null,
                operator: "EQ",
                value: 0,
                actual_value: 0,
                passed: false,
              },
            ],
          },
        ];

        subjectResult.status = "INCOMPLETE";
      }

      // ***************  Add to the subject results array
      blockResult.subject_results.push(subjectResult);
    }

    //*************** Calculate block average score using utility
    if (blockResult.subject_results.length > 0) {
      // *************** Prepare subject results for calculation utility
      const subjectResultsForCalculation = blockResult.subject_results.map(
        (subject) => ({
          total_mark: subject.average_score,
          coefficient: subject.coefficient,
        })
      );

      // *************** Use utility to calculate block total
      blockResult.average_score = CalculateBlockTotalMark(
        subjectResultsForCalculation
      );

      // *************** Create a map of subject results by ID for block criteria evaluation
      const subjectResultsMap = blockResult.subject_results.reduce(
        (map, subjectResult) => {
          map[String(subjectResult.subject_id)] = subjectResult;
          return map;
        },
        {}
      );

      // *************** Evaluate block criteria using detailed utility
      if (block.passing_criteria && block.passing_criteria.length > 0) {
        try {
          const detailedEvaluation = EvaluateBlockCriteriaDetailed(
            block.passing_criteria,
            blockResult,
            subjectResultsMap
          );

          // *************** Use detailed evaluation results
          blockResult.criteria_evaluation = detailedEvaluation.criteria_evaluation;
          blockResult.status = detailedEvaluation.passed ? "PASS" : "FAIL";
        } catch (evaluationError) {
          // *************** Fallback to basic evaluation if detailed evaluation fails
          const basicResult = EvaluateBlockCriteria(
            block.passing_criteria,
            blockResult,
            subjectResultsMap
          );
          blockResult.criteria_evaluation = [
            {
              expected_outcome: "PASS",
              result: basicResult,
              rule_evaluations: [],
            },
          ];
          blockResult.status = basicResult ? "PASS" : "FAIL";
        }
      } else {
        // ***************  If no criteria defined, create a default criteria evaluation based on block average and subject statuses
        const allSubjectsPassed = blockResult.subject_results.every(
          (s) => s.status === "PASS"
        );
        const blockPassed =
          blockResult.average_score >= 50 && allSubjectsPassed;

        // ***************  Create a default criteria evaluation
        blockResult.criteria_evaluation = [
          {
            expected_outcome: blockPassed ? "PASS" : "FAIL",
            result: blockPassed,
            rule_evaluations: [
              {
                type: "BLOCK_AVERAGE",
                logical_operator: null,
                target_id: null,
                operator: "GTE",
                value: 50,
                actual_value: blockResult.average_score,
                passed: blockResult.average_score >= 50,
              },
              {
                type: "ALL_SUBJECTS_PASSED",
                logical_operator: "AND",
                target_id: null,
                operator: "EQ",
                value: 1,
                actual_value: allSubjectsPassed ? 1 : 0,
                passed: allSubjectsPassed,
              },
            ],
          },
        ];

        blockResult.status = blockPassed ? "PASS" : "FAIL";
      }
    } else {
      
      // ***************  Create a default criteria evaluation indicating incomplete status
      blockResult.criteria_evaluation = [
        {
          expected_outcome: "INCOMPLETE",
          result: false,
          rule_evaluations: [
            {
              type: "NO_RESULTS",
              logical_operator: null,
              target_id: null,
              operator: "EQ",
              value: 0,
              actual_value: 0,
              passed: false,
            },
          ],
        },
      ];

      blockResult.status = "INCOMPLETE";
    }

    // ***************  Ensure all arrays are properly initialized
    blockResult = EnsureCalculationResultArrays(blockResult);

    // *************** Save the calculation result
    const savedResult = await SaveCalculationResult(
      studentId,
      blockResult,
      calculatedBy
    );

    // *************** Convert mongoose documents to plain objects to avoid DataCloneError
    const serializedResult = JSON.parse(
      JSON.stringify({
        success: true,
        message: "Transcript calculation completed successfully",
        result: savedResult,
      })
    );

    return serializedResult;
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/transcriptCalculation/transcript_calculation.js',
      parameter_input: JSON.stringify({ studentId, blockId, calculatedBy }),
      function_name: 'CalculateStudentBlockResults',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Failed to calculate student block results: ${error.message}`);
  }
}

/**
 * *************** Helper function to validate test-subject relationships using maps
 * @function ValidateTestSubjectRelationships
 * @param {Object} testsMap - Map of tests by ID
 * @param {Object} subjectIdsMap - Map of subjects by ID
 * @returns {Object} Validation results with any inconsistencies found
 */
function ValidateTestSubjectRelationships(testsMap, subjectIdsMap) {
  const inconsistencies = [];
  
  // *************** Check if all tests reference valid subjects using maps
  Object.values(testsMap).forEach(test => {
    const subjectId = String(test.subject_id);
    if (!subjectIdsMap[subjectId]) {
      inconsistencies.push({
        type: 'ORPHANED_TEST',
        testId: String(test._id),
        testName: test.name,
        subjectId: subjectId,
        message: `Test ${test.name} references non-existent subject ${subjectId}`
      });
    }
  });
  
  return {
    isValid: inconsistencies.length === 0,
    inconsistencies
  };
}

/**
 * *************** Saves a calculation result to the database
 * @function SaveCalculationResult
 * @param {string} studentId - The ID of the student
 * @param {Object} blockResult - The calculated block result
 * @param {string} calculatedBy - The ID of the user performing the calculation
 * @returns {Object} The saved calculation result
 */
async function SaveCalculationResult(studentId, blockResult, calculatedBy) {
  try {
    // *************** Validate input parameters
    ValidateSaveCalculationResultParameters({
      studentId,
      blockResult,
      calculatedBy,
    });

    // *************** Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApolloError(
        `Student with ID ${studentId} not found when saving calculation`,
        "NOT_FOUND"
      );
    }

    // *************** Check if there's an existing calculation result for this student and block
    const existingResult = await CalculationResult.findOne({
      student_id: studentId,
      "block_results.block_id": blockResult.block_id,
    });

    if (existingResult) {
      // *************** Update the existing record
      const updatedResult = await CalculationResult.findByIdAndUpdate(
        existingResult._id,
        {
          $set: {
            calculation_date: new Date(),
            status: blockResult.status,
            "block_results.$[block]": blockResult,
            updated_by: calculatedBy,
          },
        },
        {
          arrayFilters: [{ "block.block_id": blockResult.block_id }],
          new: true, 
        }
      );
      //  *************** Return the updated document
      return updatedResult;
    } else {
      // *************** Create a new calculation result
      const newResult = await CalculationResult.create({
        student_id: studentId,
        //***************  Set the school_id from the student
        school_id: student.school_id,
        calculation_date: new Date(),
        status: blockResult.status,
        block_results: [blockResult],
        created_by: calculatedBy,
      });

      return newResult;
    }
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/transcriptCalculation/transcript_calculation.js',
      parameter_input: JSON.stringify({
        studentId,
        blockId: blockResult.block_id,
        calculatedBy,
      }),
      function_name: 'SaveCalculationResult',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Failed to save calculation result: ${error.message}`);
  }
}

/**
 * *************** Ensures all arrays in calculation results are properly initialized
 * @function EnsureCalculationResultArrays
 * @param {Object} blockResult - The block result object
 * @returns {Object} The block result with guaranteed arrays
 */
function EnsureCalculationResultArrays(blockResult) {
  // *************** Return the blockResult as is - the arrays should already be properly initialized
  return blockResult;
}

/**
 * *************** Calculates and saves a student's complete transcript results across all blocks
 * @function CalculateStudentCompleteTranscript
 * @param {string} studentId - The ID of the student
 * @param {Array} blockIds - Array of block IDs to calculate (if empty, calculates all blocks)
 * @param {string} calculatedBy - The ID of the user performing the calculation
 * @returns {Object} The complete transcript calculation result with final mark
 */
async function CalculateStudentCompleteTranscript(
  studentId,
  blockIds = [],
  calculatedBy
) {
  try {
    // *************** Validate input parameters
    ValidateCalculateStudentCompleteTranscriptParameters({
      studentId,
      blockIds,
      calculatedBy,
    });

    // *************** Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApolloError(
        `Student with ID ${studentId} not found`,
        "NOT_FOUND"
      );
    }

    // *************** If no specific blocks provided, get all active blocks for student's school
    let blocksToCalculate = blockIds;
    if (!blockIds || blockIds.length === 0) {
      const allBlocks = await Block.find({
        school_id: student.school_id,
        status: "active",
      });
      blocksToCalculate = allBlocks.map((block) => String(block._id));
    }

    if (blocksToCalculate.length === 0) {
      throw new ApolloError(
        `No active blocks found for student ${studentId}`,
        "NOT_FOUND"
      );
    }

    // *************** Calculate results for each block
    const blockResults = [];
    const blockCalculationData = [];

    for (const blockId of blocksToCalculate) {
      // *************** Calculate single block results
      const blockResult = await CalculateStudentBlockResults(
        studentId,
        blockId,
        calculatedBy
      );

      if (blockResult.success && blockResult.result) {
        // *************** Extract the block data from the saved calculation result
        const savedCalculation = blockResult.result;
        const blockData = savedCalculation.block_results.find(
          (br) => String(br.block_id) === blockId
        );

        if (blockData) {
          blockResults.push(blockData);
          blockCalculationData.push({
            total_mark: blockData.average_score,
            status: blockData.status,
          });
        }
      }
    }

    if (blockResults.length === 0) {
      throw new ApolloError(
        `No block calculations completed for student ${studentId}`,
        "CALCULATION_FAILED"
      );
    }

    // *************** Calculate final mark across all blocks using utility
    const finalMark = CalculateFinalMark(blockCalculationData);

    // *************** Determine overall transcript status
    const allBlocksPassed = blockCalculationData.every(
      (block) => block.status === "PASS"
    );
    const anyBlockFailed = blockCalculationData.some(
      (block) => block.status === "FAIL"
    );
    const anyBlockIncomplete = blockCalculationData.some(
      (block) => block.status === "INCOMPLETE"
    );

    let overallStatus = "INCOMPLETE";
    if (allBlocksPassed && !anyBlockIncomplete) {
      overallStatus = "PASS";
    } else if (anyBlockFailed) {
      overallStatus = "FAIL";
    }

    // *************** Update or create the complete calculation result
    const completeResult = await CalculationResult.findOneAndUpdate(
      { student_id: studentId },
      {
        $set: {
          calculation_date: new Date(),
          status: overallStatus,
          block_results: blockResults,
          updated_by: calculatedBy,
          // *************** Add final mark to the document
          final_mark: finalMark,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // *************** Return complete transcript result
    const result = {
      success: true,
      message: "Complete transcript calculation completed successfully",
      result: {
        student_id: studentId,
        overall_status: overallStatus,
        final_mark: finalMark,
        blocks_calculated: blockResults.length,
        block_results: blockResults,
        calculation_result: completeResult,
      },
    };

    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    // *************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/transcriptCalculation/transcript_calculation.js',
      parameter_input: JSON.stringify({ studentId, blockIds, calculatedBy }),
      function_name: 'CalculateStudentCompleteTranscript',
      error: String(error.stack),
    });
    // *************** Throw error with context
    throw new ApolloError(`Failed to calculate complete transcript: ${error.message}`);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  CalculateStudentBlockResults,
  SaveCalculationResult,
  CalculateStudentCompleteTranscript,
};
