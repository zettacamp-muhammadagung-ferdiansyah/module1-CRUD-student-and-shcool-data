// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

/**
 * Creates a new DataLoader for batch-loading active student data by their IDs.
 * This optimizes queries by collecting individual student ID requests
 * and executing a single database query instead of multiple queries.
 * 
 * @returns {DataLoader} - An instance of DataLoader for fetching students by ID
 */
function StudentLoader() {
  return new DataLoader(async function(studentIds) {
    try {
      // *************** Fetch only active students with matching IDs
      const students = await StudentModel.find({
        _id: { $in: studentIds },
        status: 'active'
      });

      // *************** Map results to maintain original order
      const studentsById = new Map(
        students.map(function(student) {
          return [String(student._id), student];
        })
      );

      // *************** Return students in the same order as requested IDs
      return studentIds.map(function(id) {
        return studentsById.get(String(id)) || null;
      });
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/student/student.loader.js',
        parameter_input: JSON.stringify({ studentIds }),
        function_name: 'StudentLoader',
        error: String(error.stack),
      });

      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load students: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

/**
 * Creates a DataLoader for efficiently fetching students by their school ID.
 * This optimizes GraphQL resolvers that need to load all students for multiple schools
 * by batching the requests into a single database query.
 * 
 * @returns {DataLoader} - A DataLoader instance for fetching students by school ID
 */
function StudentsBySchoolLoader() {
  return new DataLoader(async function(schoolIds) {
    try {
      // *************** Fetch students for all schools in one query
      const students = await StudentModel.find({ 
        school_id: { $in: schoolIds },
        status: 'active' 
      });

      // *************** Group students by school_id
      return schoolIds.map(function(schoolId) {
        return students.filter(function(student) {
          return student.school_id.toString() === schoolId.toString();
        });
      });
    } catch (error) {
      // *************** Log error for debugging
      await ErrorLogModel.create({
        path: 'modules/student/student.loader.js',
        parameter_input: JSON.stringify({ schoolIds }),
        function_name: 'StudentsBySchoolLoader',
        error: String(error.stack),
      });

      // *************** Throw error with context
      throw new ApolloError(`Failed to batch load students by school: ${error.message}`, 'DATALOADER_ERROR');
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  StudentLoader,
  StudentsBySchoolLoader,
};
