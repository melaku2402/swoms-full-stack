
import CourseModel from "../models/CourseModel.js";
import DepartmentModel from "../models/DepartmentModel.js";
import ProgramModel from "../models/ProgramModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { PROGRAM_TYPES } from "../config/constants.js";

class CourseController {
  // Get courses by department with program info
  static async getCoursesByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const { page = 1, limit = 20, program_type, search, unassigned_only } = req.query;

      // Parse unassigned_only as boolean
      const isUnassignedOnly = unassigned_only === "true";

      const result = await CourseModel.findByDepartmentWithPrograms(
        parseInt(departmentId),
        parseInt(page),
        parseInt(limit),
        {
          program_type,
          search,
          unassigned_only: isUnassignedOnly,
          semester_id: req.query.semester_id
        }
      );

      return sendSuccess(res, "Courses retrieved successfully", result);
    } catch (error) {
      console.error("Get courses by department error:", error);
      return sendError(res, "Failed to retrieve courses", 500);
    }
  }

  // Get unassigned courses for current semester
  static async getUnassignedCourses(req, res) {
    try {
      const { departmentId } = req.params;
      const { semester_id } = req.query;

      if (!semester_id) {
        return sendError(res, "Semester ID is required", 400);
      }

      const courses = await CourseModel.findUnassigned(
        parseInt(departmentId),
        parseInt(semester_id)
      );

      return sendSuccess(res, "Unassigned courses retrieved", courses);
    } catch (error) {
      console.error("Get unassigned courses error:", error);
      return sendError(res, "Failed to retrieve unassigned courses", 500);
    }
  }

  // Search courses
  static async searchCourses(req, res) {
    try {
      const { q: searchQuery, department_id, program_type } = req.query;
      const { page = 1, limit = 20 } = req.query;

      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (department_id) filters.department_id = parseInt(department_id);
      if (program_type) filters.program_type = program_type;

      const result = await CourseModel.search(filters, parseInt(page), parseInt(limit));
      return sendSuccess(res, "Courses search results", result);
    } catch (error) {
      console.error("Search courses error:", error);
      return sendError(res, "Failed to search courses", 500);
    }
  }

  // Get courses for assignment (with program info)
  static async getCoursesForAssignment(req, res) {
    try {
      const { department_id, program_type, search, semester_id, unassigned_only } = req.query;

      // Get active semester if not provided
      let activeSemesterId = semester_id;
      if (!activeSemesterId) {
        const { query } = await import("../config/database.js");
        const [activeSemester] = await query(
          "SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1"
        );
        activeSemesterId = activeSemester?.semester_id;
      }

      const courses = await CourseModel.findForAssignment({
        department_id: department_id ? parseInt(department_id) : null,
        program_type: program_type || null,
        search: search || null,
        semester_id: activeSemesterId,
        unassigned_only: unassigned_only === "true"
      });

      // Group by program for better organization
      const coursesByProgram = {};
      courses.forEach(course => {
        const programKey = course.program_id || 'unassigned';
        if (!coursesByProgram[programKey]) {
          coursesByProgram[programKey] = {
            program_id: course.program_id,
            program_name: course.program_name,
            program_code: course.program_code,
            program_type: course.program_type,
            courses: []
          };
        }
        coursesByProgram[programKey].courses.push(course);
      });

      return sendSuccess(res, "Courses for assignment retrieved", {
        courses_by_program: coursesByProgram,
        total_courses: courses.length,
        semester_id: activeSemesterId
      });
    } catch (error) {
      console.error("Get courses for assignment error:", error);
      return sendError(res, "Failed to get courses for assignment", 500);
    }
  }





  // Create course
  static async createCourse(req, res) {
    console.log("BODY:", req.body);
    console.log("HEADERS:", req.headers["content-type"]);
       
    try {
      const {
        course_code,
        course_title,
        department_id,
        program_id = null,
        credit_hours,
        lecture_hours,
        lab_hours = 0,
        tutorial_hours = 0,
        program_type = "regular",
        status = "active",
      } = req.body;

      // Validate required fields
      if (
        !course_code ||
        !course_title ||
        !department_id ||
        !credit_hours ||
        !lecture_hours
      ) {
        return sendError(
          res,
          "Course code, title, department ID, credit hours, and lecture hours are required",
          400
        );
      }

      // Check if course code already exists
      const existingCourse = await CourseModel.findByCode(course_code);
      if (existingCourse) {
        return sendError(res, "Course code already exists", 400);
      }

      // Check if department exists
      const department = await DepartmentModel.findById(
        parseInt(department_id)
      );
      if (!department) {
        return sendError(res, "Department not found", 404);
      }

      // Check if program exists if provided
      if (program_id) {
        const program = await ProgramModel.findById(parseInt(program_id));
        if (!program) {
          return sendError(res, "Program not found", 404);
        }
      }

      // Validate program type
      const validTypes = Object.values(PROGRAM_TYPES);
      if (!validTypes.includes(program_type)) {
        return sendError(
          res,
          `Invalid program type. Must be one of: ${validTypes.join(", ")}`,
          400
        );
      }

      // Validate hours
      if (credit_hours <= 0 || lecture_hours <= 0) {
        return sendError(
          res,
          "Credit hours and lecture hours must be greater than 0",
          400
        );
      }

      if (lab_hours < 0 || tutorial_hours < 0) {
        return sendError(
          res,
          "Lab hours and tutorial hours cannot be negative",
          400
        );
      }

      // Create course
      const course = await CourseModel.create({
        course_code,
        course_title,
        department_id: parseInt(department_id),
        program_id: program_id ? parseInt(program_id) : null,
        credit_hours: parseFloat(credit_hours),
        lecture_hours: parseFloat(lecture_hours),
        lab_hours: parseFloat(lab_hours),
        tutorial_hours: parseFloat(tutorial_hours),
        program_type,
        status,
      });

      return sendSuccess(res, "Course created successfully", course, 201);
    } catch (error) {
      console.error("Create course error:", error);
      return sendError(res, "Failed to create course", 500);
    }
  }

  // Get all courses
  static async getAllCourses(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        department_id,
        college_id,
        program_id,
        program_type,
        status,
        search,
      } = req.query;

      const filters = {};
      if (department_id) filters.department_id = parseInt(department_id);
      if (college_id) filters.college_id = parseInt(college_id);
      if (program_id) filters.program_id = parseInt(program_id);
      if (program_type) filters.program_type = program_type;
      if (status) filters.status = status;
      if (search) filters.search = search;

      const result = await CourseModel.findAll(
        parseInt(page),
        parseInt(limit),
        filters
      );

      return sendSuccess(res, "Courses retrieved successfully", result);
    } catch (error) {
      console.error("Get all courses error:", error);
      return sendError(res, "Failed to retrieve courses", 500);
    }
  }

  // Get course by ID
  static async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);

      if (isNaN(courseId)) {
        return sendError(res, "Invalid course ID", 400);
      }

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return sendError(res, "Course not found", 404);
      }

      return sendSuccess(res, "Course retrieved successfully", course);
    } catch (error) {
      console.error("Get course by ID error:", error);
      return sendError(res, "Failed to retrieve course", 500);
    }
  }

  // Get course statistics - FIXED
  static async getCourseStats(req, res) {
    try {
      const { department_id, program_type } = req.query;

      const stats = await CourseModel.getStatistics(
        department_id ? parseInt(department_id) : null,
        program_type || null
      );

      return sendSuccess(res, "Course statistics retrieved", stats);
    } catch (error) {
      console.error("Get course stats error:", error);
      return sendError(res, "Failed to get course statistics", 500);
    }
  }

  // Get courses by department
  static async getCoursesByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Check if department exists
      const department = await DepartmentModel.findById(parseInt(departmentId));
      if (!department) {
        return sendError(res, "Department not found", 404);
      }

      const result = await CourseModel.findByDepartment(
        parseInt(departmentId),
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(res, "Department courses retrieved", {
        department,
        ...result,
      });
    } catch (error) {
      console.error("Get courses by department error:", error);
      return sendError(res, "Failed to retrieve department courses", 500);
    }
  }

  // Get courses by program
  static async getCoursesByProgram(req, res) {
    try {
      const { programId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Check if program exists
      const program = await ProgramModel.findById(parseInt(programId));
      if (!program) {
        return sendError(res, "Program not found", 404);
      }

      const result = await CourseModel.findByProgram(
        parseInt(programId),
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(res, "Program courses retrieved", {
        program,
        ...result,
      });
    } catch (error) {
      console.error("Get courses by program error:", error);
      return sendError(res, "Failed to retrieve program courses", 500);
    }
  }

  // Update course
  static async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const courseId = parseInt(id);

      if (isNaN(courseId)) {
        return sendError(res, "Invalid course ID", 400);
      }

      // Check if course exists
      const existingCourse = await CourseModel.findById(courseId);
      if (!existingCourse) {
        return sendError(res, "Course not found", 404);
      }

      // If updating course code, check for duplicates
      if (
        updateData.course_code &&
        updateData.course_code !== existingCourse.course_code
      ) {
        const courseWithCode = await CourseModel.findByCode(
          updateData.course_code
        );
        if (courseWithCode) {
          return sendError(res, "Course code already exists", 400);
        }
      }

      // If updating department, validate it exists
      if (updateData.department_id) {
        const department = await DepartmentModel.findById(
          parseInt(updateData.department_id)
        );
        if (!department) {
          return sendError(res, "Department not found", 404);
        }
      }

      // If updating program, validate it exists
      if (updateData.program_id) {
        const program = await ProgramModel.findById(
          parseInt(updateData.program_id)
        );
        if (!program) {
          return sendError(res, "Program not found", 404);
        }
      }

      // Validate program type if provided
      if (updateData.program_type) {
        const validTypes = Object.values(PROGRAM_TYPES);
        if (!validTypes.includes(updateData.program_type)) {
          return sendError(
            res,
            `Invalid program type. Must be one of: ${validTypes.join(", ")}`,
            400
          );
        }
      }

      // Validate hours if provided
      if (
        updateData.credit_hours !== undefined &&
        updateData.credit_hours <= 0
      ) {
        return sendError(res, "Credit hours must be greater than 0", 400);
      }

      if (
        updateData.lecture_hours !== undefined &&
        updateData.lecture_hours <= 0
      ) {
        return sendError(res, "Lecture hours must be greater than 0", 400);
      }

      const updatedCourse = await CourseModel.update(courseId, updateData);
      return sendSuccess(res, "Course updated successfully", updatedCourse);
    } catch (error) {
      console.error("Update course error:", error);
      return sendError(res, "Failed to update course", 500);
    }
  }

  // Delete course
  static async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);

      if (isNaN(courseId)) {
        return sendError(res, "Invalid course ID", 400);
      }

      // Check if course exists
      const existingCourse = await CourseModel.findById(courseId);
      if (!existingCourse) {
        return sendError(res, "Course not found", 404);
      }

      // Check if course has sections
      if (existingCourse.section_count > 0) {
        return sendError(
          res,
          "Cannot delete course with existing sections",
          400
        );
      }

      await CourseModel.delete(courseId);
      return sendSuccess(res, "Course deleted successfully");
    } catch (error) {
      console.error("Delete course error:", error);
      return sendError(res, "Failed to delete course", 500);
    }
  }

  // Search courses
  static async searchCourses(req, res) {
    try {
      const { q, limit = 50 } = req.query;

      if (!q || q.trim().length < 2) {
        return sendError(
          res,
          "Search query must be at least 2 characters",
          400
        );
      }

      const courses = await CourseModel.search(q.trim(), parseInt(limit));
      return sendSuccess(res, "Search results", courses);
    } catch (error) {
      console.error("Search courses error:", error);
      return sendError(res, "Failed to search courses", 500);
    }
  }

  // Get course offerings
  static async getCourseOfferings(req, res) {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);

      if (isNaN(courseId)) {
        return sendError(res, "Invalid course ID", 400);
      }

      // Check if course exists
      const existingCourse = await CourseModel.findById(courseId);
      if (!existingCourse) {
        return sendError(res, "Course not found", 404);
      }

      const offerings = await CourseModel.getCourseOfferings(courseId);
      return sendSuccess(res, "Course offerings retrieved", {
        course: existingCourse,
        offerings,
      });
    } catch (error) {
      console.error("Get course offerings error:", error);
      return sendError(res, "Failed to get course offerings", 500);
    }
  }

  // Get course sections
  static async getCourseSections(req, res) {
    try {
      const { id } = req.params;
      const { semester_id } = req.query;
      const courseId = parseInt(id);

      if (isNaN(courseId)) {
        return sendError(res, "Invalid course ID", 400);
      }

      // Check if course exists
      const existingCourse = await CourseModel.findById(courseId);
      if (!existingCourse) {
        return sendError(res, "Course not found", 404);
      }

      const sections = await CourseModel.getCourseSections(
        courseId,
        semester_id ? parseInt(semester_id) : null
      );

      return sendSuccess(res, "Course sections retrieved", {
        course: existingCourse,
        sections,
      });
    } catch (error) {
      console.error("Get course sections error:", error);
      return sendError(res, "Failed to get course sections", 500);
    }
  }

  // Get related courses
  static async getRelatedCourses(req, res) {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);

      if (isNaN(courseId)) {
        return sendError(res, "Invalid course ID", 400);
      }

      // Check if course exists
      const existingCourse = await CourseModel.findById(courseId);
      if (!existingCourse) {
        return sendError(res, "Course not found", 404);
      }

      const relatedCourses = await CourseModel.getRelatedCourses(courseId);
      return sendSuccess(res, "Related courses retrieved", relatedCourses);
    } catch (error) {
      console.error("Get related courses error:", error);
      return sendError(res, "Failed to get related courses", 500);
    }
  }

  // Calculate course load
  static async calculateCourseLoad(req, res) {
    try {
      const { id } = req.params;
      const { lab_factor = 0.75, tutorial_factor = 0.5 } = req.query;
      const courseId = parseInt(id);

      if (isNaN(courseId)) {
        return sendError(res, "Invalid course ID", 400);
      }

      // Check if course exists
      const existingCourse = await CourseModel.findById(courseId);
      if (!existingCourse) {
        return sendError(res, "Course not found", 404);
      }

      const totalLoad = await CourseModel.calculateTotalLoadHours(
        courseId,
        parseFloat(lab_factor),
        parseFloat(tutorial_factor)
      );

      return sendSuccess(res, "Course load calculated", {
        course: existingCourse,
        load_calculation: {
          lab_factor: parseFloat(lab_factor),
          tutorial_factor: parseFloat(tutorial_factor),
          lecture_load: existingCourse.lecture_hours,
          lab_load: existingCourse.lab_hours * parseFloat(lab_factor),
          tutorial_load: existingCourse.tutorial_hours * parseFloat(tutorial_factor),
          total_load: totalLoad,
        },
      });
    } catch (error) {
      console.error("Calculate course load error:", error);
      return sendError(res, "Failed to calculate course load", 500);
    }
  }

  // Get courses by program type
  static async getCoursesByProgramType(req, res) {
    try {
      const { type } = req.params;
      const { include_inactive } = req.query;

      // Validate program type
      const validTypes = Object.values(PROGRAM_TYPES);
      if (!validTypes.includes(type)) {
        return sendError(
          res,
          `Invalid program type. Must be one of: ${validTypes.join(", ")}`,
          400
        );
      }

      const courses = await CourseModel.findByProgramType(
        type,
        include_inactive === "true"
      );
      return sendSuccess(
        res,
        `Courses for program type ${type} retrieved`,
        courses
      );
    } catch (error) {
      console.error("Get courses by program type error:", error);
      return sendError(res, "Failed to get courses by program type", 500);
    }
  }
}

export default CourseController;