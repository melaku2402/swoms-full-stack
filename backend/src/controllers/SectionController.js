// src/controllers/SectionController.js
import SectionModel from "../models/SectionModel.js";
import CourseModel from "../models/CourseModel.js";
import SemesterModel from "../models/SemesterModel.js";
import StaffModel from "../models/StaffModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

class SectionController {
  // Create section
  static async createSection(req, res) {
    try {
      const {
        course_id,
        semester_id,
        section_code,
        instructor_id,
        student_count = 0,
        max_capacity = 60,
        is_active = true,
      } = req.body;

      // Validate required fields
      if (!course_id || !semester_id || !section_code) {
        return sendError(
          res,
          "Course ID, semester ID, and section code are required",
          400
        );
      }

      // Check if course exists
      const course = await CourseModel.findById(parseInt(course_id));
      if (!course) {
        return sendError(res, "Course not found", 404);
      }

      // Check if semester exists
      const semester = await SemesterModel.findById(parseInt(semester_id));
      if (!semester) {
        return sendError(res, "Semester not found", 404);
      }

      // Check if instructor exists if provided
      if (instructor_id) {
        const instructor = await StaffModel.findById(parseInt(instructor_id));
        if (!instructor) {
          return sendError(res, "Instructor not found", 404);
        }
      }

      // Validate student count and capacity
      if (student_count < 0) {
        return sendError(res, "Student count cannot be negative", 400);
      }

      if (max_capacity <= 0) {
        return sendError(res, "Max capacity must be greater than 0", 400);
      }

      if (student_count > max_capacity) {
        return sendError(res, "Student count cannot exceed max capacity", 400);
      }

      const section = await SectionModel.create({
        course_id: parseInt(course_id),
        semester_id: parseInt(semester_id),
        section_code,
        instructor_id: instructor_id ? parseInt(instructor_id) : null,
        student_count: parseInt(student_count),
        max_capacity: parseInt(max_capacity),
        is_active,
      });

      return sendSuccess(res, "Section created successfully", section, 201);
    } catch (error) {
      console.error("Create section error:", error);
      if (
        error.message === "Section already exists for this course and semester"
      ) {
        return sendError(res, error.message, 400);
      }
      return sendError(res, "Failed to create section", 500);
    }
  }

  // Get all sections
  static async getAllSections(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        semester_id,
        course_id,
        instructor_id,
      } = req.query;

      let sections;
      let total;

      if (semester_id) {
        const result = await SectionModel.findBySemester(
          parseInt(semester_id),
          parseInt(page),
          parseInt(limit)
        );
        sections = result.sections;
        total = result.pagination.total;
      } else if (instructor_id) {
        const result = await SectionModel.findByInstructor(
          parseInt(instructor_id),
          null,
          parseInt(page),
          parseInt(limit)
        );
        sections = result.sections;
        total = result.pagination.total;
      } else {
        // Get all sections with pagination (simplified)
        const offset = (parseInt(page) - 1) * parseInt(limit);
        sections = await SectionModel.findByDateRange(
          "2020-01-01", // Default start date
          "2030-12-31", // Default end date
          null
        );
        // Slice for pagination (in real app, use database pagination)
        sections = sections.slice(offset, offset + parseInt(limit));
        total = sections.length;
      }

      return sendSuccess(res, "Sections retrieved successfully", {
        sections,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get all sections error:", error);
      return sendError(res, "Failed to retrieve sections", 500);
    }
  }

  // Get section by ID
  static async getSectionById(req, res) {
    try {
      const { id } = req.params;
      const section = await SectionModel.findById(parseInt(id));

      if (!section) {
        return sendError(res, "Section not found", 404);
      }

      return sendSuccess(res, "Section retrieved successfully", section);
    } catch (error) {
      console.error("Get section by ID error:", error);
      return sendError(res, "Failed to retrieve section", 500);
    }
  }

  // Get sections by course and semester
  static async getSectionsByCourseAndSemester(req, res) {
    try {
      const { courseId, semesterId } = req.params;

      // Check if course exists
      const course = await CourseModel.findById(parseInt(courseId));
      if (!course) {
        return sendError(res, "Course not found", 404);
      }

      // Check if semester exists
      const semester = await SemesterModel.findById(parseInt(semesterId));
      if (!semester) {
        return sendError(res, "Semester not found", 404);
      }

      const sections = await SectionModel.findByCourseAndSemester(
        parseInt(courseId),
        parseInt(semesterId)
      );

      return sendSuccess(res, "Sections retrieved", {
        course,
        semester,
        sections,
      });
    } catch (error) {
      console.error("Get sections by course and semester error:", error);
      return sendError(res, "Failed to retrieve sections", 500);
    }
  }

  // Get sections by instructor
  static async getSectionsByInstructor(req, res) {
    try {
      const { instructorId } = req.params;
      const { semester_id, page = 1, limit = 20 } = req.query;

      // Check if instructor exists
      const instructor = await StaffModel.findById(parseInt(instructorId));
      if (!instructor) {
        return sendError(res, "Instructor not found", 404);
      }

      const result = await SectionModel.findByInstructor(
        parseInt(instructorId),
        semester_id ? parseInt(semester_id) : null,
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(res, "Instructor sections retrieved", {
        instructor,
        ...result,
      });
    } catch (error) {
      console.error("Get sections by instructor error:", error);
      return sendError(res, "Failed to retrieve instructor sections", 500);
    }
  }

  // Update section
  static async updateSection(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if section exists
      const existingSection = await SectionModel.findById(parseInt(id));
      if (!existingSection) {
        return sendError(res, "Section not found", 404);
      }

      // If updating instructor, validate it exists
      if (updateData.instructor_id !== undefined) {
        if (updateData.instructor_id) {
          const instructor = await StaffModel.findById(
            parseInt(updateData.instructor_id)
          );
          if (!instructor) {
            return sendError(res, "Instructor not found", 404);
          }
        }
      }

      // Validate student count and capacity
      if (
        updateData.student_count !== undefined &&
        updateData.student_count < 0
      ) {
        return sendError(res, "Student count cannot be negative", 400);
      }

      if (
        updateData.max_capacity !== undefined &&
        updateData.max_capacity <= 0
      ) {
        return sendError(res, "Max capacity must be greater than 0", 400);
      }

      if (
        updateData.student_count !== undefined &&
        updateData.max_capacity !== undefined
      ) {
        if (updateData.student_count > updateData.max_capacity) {
          return sendError(
            res,
            "Student count cannot exceed max capacity",
            400
          );
        }
      }

      const updatedSection = await SectionModel.update(
        parseInt(id),
        updateData
      );
      return sendSuccess(res, "Section updated successfully", updatedSection);
    } catch (error) {
      console.error("Update section error:", error);
      return sendError(res, "Failed to update section", 500);
    }
  }

  // Delete section
  static async deleteSection(req, res) {
    try {
      const { id } = req.params;

      // Check if section exists
      const existingSection = await SectionModel.findById(parseInt(id));
      if (!existingSection) {
        return sendError(res, "Section not found", 404);
      }

      // Check if section has workloads assigned
      if (existingSection.workload_count > 0) {
        return sendError(
          res,
          "Cannot delete section with assigned workloads",
          400
        );
      }

      await SectionModel.delete(parseInt(id));
      return sendSuccess(res, "Section deleted successfully");
    } catch (error) {
      console.error("Delete section error:", error);
      return sendError(res, "Failed to delete section", 500);
    }
  }

  // Assign instructor to section
  static async assignInstructor(req, res) {
    try {
      const { id } = req.params;
      const { instructor_id } = req.body;

      if (!instructor_id) {
        return sendError(res, "Instructor ID is required", 400);
      }

      // Check if section exists
      const existingSection = await SectionModel.findById(parseInt(id));
      if (!existingSection) {
        return sendError(res, "Section not found", 404);
      }

      // Check if instructor exists
      const instructor = await StaffModel.findById(parseInt(instructor_id));
      if (!instructor) {
        return sendError(res, "Instructor not found", 404);
      }

      // Check instructor availability (optional)
      const currentAssignments = await SectionModel.checkInstructorAvailability(
        parseInt(instructor_id),
        existingSection.semester_id
      );

      // You could add limits here if needed
      // if (currentAssignments >= MAX_ASSIGNMENTS) {
      //   return sendError(res, "Instructor has reached maximum section assignments", 400);
      // }

      const updatedSection = await SectionModel.assignInstructor(
        parseInt(id),
        parseInt(instructor_id)
      );
      return sendSuccess(
        res,
        "Instructor assigned successfully",
        updatedSection
      );
    } catch (error) {
      console.error("Assign instructor error:", error);
      return sendError(res, "Failed to assign instructor", 500);
    }
  }

  // Remove instructor from section
  static async removeInstructor(req, res) {
    try {
      const { id } = req.params;

      // Check if section exists
      const existingSection = await SectionModel.findById(parseInt(id));
      if (!existingSection) {
        return sendError(res, "Section not found", 404);
      }

      if (!existingSection.instructor_id) {
        return sendError(res, "Section has no instructor assigned", 400);
      }

      const updatedSection = await SectionModel.removeInstructor(parseInt(id));
      return sendSuccess(
        res,
        "Instructor removed successfully",
        updatedSection
      );
    } catch (error) {
      console.error("Remove instructor error:", error);
      return sendError(res, "Failed to remove instructor", 500);
    }
  }

  // Update student count
  static async updateStudentCount(req, res) {
    try {
      const { id } = req.params;
      const { student_count } = req.body;

      if (student_count === undefined || student_count === null) {
        return sendError(res, "Student count is required", 400);
      }

      // Check if section exists
      const existingSection = await SectionModel.findById(parseInt(id));
      if (!existingSection) {
        return sendError(res, "Section not found", 404);
      }

      if (student_count < 0) {
        return sendError(res, "Student count cannot be negative", 400);
      }

      if (student_count > existingSection.max_capacity) {
        return sendError(res, "Student count exceeds maximum capacity", 400);
      }

      const updatedSection = await SectionModel.updateStudentCount(
        parseInt(id),
        parseInt(student_count)
      );
      return sendSuccess(
        res,
        "Student count updated successfully",
        updatedSection
      );
    } catch (error) {
      console.error("Update student count error:", error);
      return sendError(res, "Failed to update student count", 500);
    }
  }

  // Get section statistics
  static async getSectionStats(req, res) {
    try {
      const { semester_id } = req.query;

      const stats = await SectionModel.getStatistics(
        semester_id ? parseInt(semester_id) : null
      );

      return sendSuccess(res, "Section statistics retrieved", stats);
    } catch (error) {
      console.error("Get section stats error:", error);
      return sendError(res, "Failed to get section statistics", 500);
    }
  }

  // Get unassigned sections
  static async getUnassignedSections(req, res) {
    try {
      const { semester_id, page = 1, limit = 20 } = req.query;

      const result = await SectionModel.getUnassignedSections(
        semester_id ? parseInt(semester_id) : null,
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(res, "Unassigned sections retrieved", result);
    } catch (error) {
      console.error("Get unassigned sections error:", error);
      return sendError(res, "Failed to get unassigned sections", 500);
    }
  }

  // Get sections by date range
  static async getSectionsByDateRange(req, res) {
    try {
      const { start_date, end_date, department_id } = req.query;

      if (!start_date || !end_date) {
        return sendError(res, "Start date and end date are required", 400);
      }

      const sections = await SectionModel.findByDateRange(
        start_date,
        end_date,
        department_id ? parseInt(department_id) : null
      );

      return sendSuccess(res, "Sections retrieved for date range", sections);
    } catch (error) {
      console.error("Get sections by date range error:", error);
      return sendError(res, "Failed to get sections by date range", 500);
    }
  }

  // Get dashboard summary
  static async getDashboardSummary(req, res) {
    try {
      const summary = await SectionModel.getDashboardSummary();
      return sendSuccess(res, "Sections dashboard summary", summary);
    } catch (error) {
      console.error("Get dashboard summary error:", error);
      return sendError(res, "Failed to get dashboard summary", 500);
    }
  }

  // Get sections by department
  static async getSectionsByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const { semester_id } = req.query;

      // Check if department exists
      const department = await DepartmentModel.findById(parseInt(departmentId));
      if (!department) {
        return sendError(res, "Department not found", 404);
      }

      const sections = await SectionModel.findByDepartment(
        parseInt(departmentId),
        semester_id ? parseInt(semester_id) : null
      );

      return sendSuccess(res, "Department sections retrieved", {
        department,
        sections,
      });
    } catch (error) {
      console.error("Get sections by department error:", error);
      return sendError(res, "Failed to retrieve department sections", 500);
    }
  }
}

export default SectionController;
