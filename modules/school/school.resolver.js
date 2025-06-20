// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.model');
const ErrorLogModel = require('../errorLogs/error_logs.model');

// *************** IMPORT VALIDATOR ***************
const SchoolValidators = require('./school.validator');
const { ValidateMongoId } = require('../../utils/validator/mongo.validator');

// *************** QUERY ***************
/**
 * Retrieves all active schools from the database. Filters out any schools
 * that have been marked as deleted by checking their status field.
 *
 * @async
 * @function GetAllSchools
 * @throws {ApolloError} Throws ApolloError with the original error message if retrieval fails
 * @returns {Promise<Array>} Array of active school objects
 */
async function GetAllSchools() {
  try {
    // *************** Retrieve Schools with active status directly
    const schools = await SchoolModel.find({ status: 'active' }).lean();
    return schools;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({}),
      function_name: 'GetAllSchools',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a single active school by ID. Validates ID format and existence
 * before fetching the school data. Only returns schools with 'active' status.
 *
 * @async
 * @function GetSchoolById
 * @param {string} args.id - MongoDB ObjectId of the school to retrieve
 * @throws {ApolloError} Throws 'INVALID_INPUT' if ID is not provided or has invalid format
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if school with given ID doesn't exist or is not active
 * @returns {Promise<object>} The school object with matching ID and active status
 */
async function GetSchoolById(_, { id }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Retrieve School using status instead of deleted_at
    const school = await SchoolModel.findOne({ _id: id, status: 'active' }).lean(); 
    if (!school) {
      throw new ApolloError('School not found', 'RESOURCE_NOT_FOUND');
    }
    return school;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'GetSchoolById',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new school
 *
 * @async
 * @function CreateSchool
 * @param {object} args.school_input - Input object containing school data
 * @param {string} args.school_input.name - Name of the school (required)
 * @param {string} args.school_input.commercial_name - School's public or brand name (required)
 * @param {string} args.school_input.address - Full address of the school (required)
 * @param {string} args.school_input.city - City where the school is located (required)
 * @param {string} args.school_input.country - Country where the school operates (required)
 * @param {string} args.school_input.zipcode - Postal code of the school's location (required)
 * @param {string} [args.school_input.logo] - URL or path to the school's logo (optional)
 * @throws {ApolloError} Throws 'INVALID_INPUT' if validation fails for any required field
 * @returns {Promise<object>} The created school object
 */
async function CreateSchool(_, { school_input }) {
  try {
    // *************** Validate Input
    SchoolValidators.ValidateCreateUpdateSchoolParameters({ schoolInput: school_input });

     // *************** Create sanitized school object with only allowed fields
    const schoolData = {
      name: school_input.name,
      commercial_name: school_input.commercial_name,
      address: school_input.address,
      city: school_input.city,
      country: school_input.country,
      zipcode: school_input.zipcode,
      status: 'active'
    };

    // *************** Add optional fields if they exist
    if (school_input.logo) schoolData.logo = school_input.logo;

    // *************** Create School
    const school = await SchoolModel.create(schoolData);
    return school;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify(school_input),
      function_name: 'CreateSchool',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing school
 *
 * @async
 * @function UpdateSchool
 * @param {string} args.id - School ID to update
 * @param {object} args.school_input - Input object containing updated school data
 * @param {string} [args.school_input.name] - Updated school name
 * @param {string} [args.school_input.commercial_name] - Updated school's public or brand name
 * @param {string} [args.school_input.address] - Updated full address of the school
 * @param {string} [args.school_input.city] - Updated city where the school is located
 * @param {string} [args.school_input.country] - Updated country where the school operates
 * @param {string} [args.school_input.zipcode] - Updated postal code of the school's location
 * @param {string} [args.school_input.logo] - Updated URL or path to the school's logo
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if school with given ID doesn't exist
 * @returns {Promise<object|null>} The updated school object or null if not found
 */
async function UpdateSchool(_, { id, school_input }) {
  try {
    // *************** Validate Input
    SchoolValidators.ValidateCreateUpdateSchoolParameters({ id, schoolInput: school_input });

     // *************** Create sanitized school object with only allowed fields
    const updateData = {
      name: school_input.name,
      commercial_name: school_input.commercial_name,
      address: school_input.address,
      city: school_input.city,
      country: school_input.country,
      zipcode: school_input.zipcode,
      status: 'active'
    };

    // *************** Add optional fields if they exist
    if (school_input.logo) updateData.logo = school_input.logo;

    // *************** Update School
    const school = await SchoolModel.findByIdAndUpdate(id, updateData, {new: true}).lean();
    if (!school) {
      throw new ApolloError('School not found', 'RESOURCE_NOT_FOUND');
    } 
    
    return school;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id, school_input }),
      function_name: 'UpdateSchool',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a school by setting status to 'deleted' and updating deleted_at timestamp
 *
 * @async
 * @function DeleteSchool
 * @param {string} args.id - School ID to delete
 * @throws {ApolloError} Throws 'RESOURCE_NOT_FOUND' if school with given ID doesn't exist
 * @throws {ApolloError} Throws 'ALREADY_DELETED' if school is already deleted
 * @returns {Promise<object>} The deleted school object
 */
async function DeleteSchool(_, { id }) {
  try {
    // *************** Validate MongoDB ID
    ValidateMongoId(id);

    // *************** Get the school first to check if it exists
    const school = await SchoolModel.findById(id).lean();
    if (!school) {
      throw new ApolloError('School not found', 'RESOURCE_NOT_FOUND');
    }
    
    // *************** Check if school is already deleted
    if (school.status === 'deleted') {
      throw new ApolloError('School is already deleted', 'ALREADY_DELETED');
    }

    // *************** Set status to deleted AND update deleted_at timestamp
    const updatedSchool = await SchoolModel.findByIdAndUpdate(
      id,
      { 
        status: 'deleted',
        deleted_at: new Date()
      },
      { new: true }
    ).lean();
    
    return updatedSchool;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id }),
      function_name: 'DeleteSchool',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** LOADER *************** 
/**
 * Retrieves students associated with a specific school using DataLoader.
 *
 * @async
 * @function GetStudentsBySchool
 * @param {Object} parent - The parent resolver object containing the school ID.
 * @param {Object} context - The context object containing loaders.
 * @throws {ApolloError} Throws ApolloError with the original error message if loading fails
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of student documents.
 */
async function GetStudentsBySchool(parent, _, context) {
  try {
    // ************** Guard against null parent or context
    if (!parent || !context) {
      return [];
    }
    
    // ************** Return empty array if no students are associated with the school
    if (!parent.students || !parent.students.length) {
      return [];
    }
    
    // ************** Guard against missing loader
    if (!context.loaders || !context.loaders.StudentLoader) {
      console.error('StudentLoader is not available in the context');
      return [];
    }
    
    //************** Use the StudentLoader to load each student by ID
    const students = await context.loaders.StudentLoader.loadMany(parent.students);
    return students;
  } catch (error) {
    // ************** Log error to database
    await ErrorLogModel.create({
      path: 'modules/school/school.resolver.js',
      parameter_input: JSON.stringify({ id: parent.id }),
      function_name: 'GetStudentsBySchool',
      error: String(error.stack),
    });

    // ************** Throw error message
    throw new ApolloError(error.message);
  }
}


// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllSchools,
    GetSchoolById,
  },
  Mutation: {
    CreateSchool,
    UpdateSchool,
    DeleteSchool,
  },
  School: { 
    students: GetStudentsBySchool,
  },
};
