// src/controllers/ProgramController.js
import ProgramModel from "../models/ProgramModel.js";
import DepartmentModel from "../models/DepartmentModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { PROGRAM_TYPES } from "../config/constants.js";

class ProgramController {
  // Create program
  static async createProgram(req, res) {
    try {
      const {
        program_code,
        program_name,
        department_id,
        program_type,
        status,
      } = req.body;

      // Validate required fields
      if (!program_code || !program_name || !department_id || !program_type) {
        return sendError(
          res,
          "Program code, name, department ID, and type are required",
          400
        );
      }

      // Check if program code already exists
      const existingProgram = await ProgramModel.findByCode(program_code);
      if (existingProgram) {
        return sendError(res, "Program code already exists", 400);
      }

      // Check if department exists
      const department = await DepartmentModel.findById(
        parseInt(department_id)
      );
      if (!department) {
        return sendError(res, "Department not found", 404);
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

      const program = await ProgramModel.create({
        program_code,
        program_name,
        department_id: parseInt(department_id),
        program_type,
        status: status || "active",
      });

      return sendSuccess(res, "Program created successfully", program, 201);
    } catch (error) {
      console.error("Create program error:", error);
      return sendError(res, "Failed to create program", 500);
    }
  }

  // Get all programs
  static async getAllPrograms(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        department_id,
        college_id,
        program_type,
        status,
        search,
      } = req.query;

      const filters = {};
      if (department_id) filters.department_id = parseInt(department_id);
      if (college_id) filters.college_id = parseInt(college_id);
      if (program_type) filters.program_type = program_type;
      if (status) filters.status = status;
      if (search) filters.search = search;

      const result = await ProgramModel.findAll(
        parseInt(page),
        parseInt(limit),
        filters
      );

      return sendSuccess(res, "Programs retrieved successfully", result);
    } catch (error) {
      console.error("Get all programs error:", error);
      return sendError(res, "Failed to retrieve programs", 500);
    }
  }

  // Get program by ID
  static async getProgramById(req, res) {
    try {
      const { id } = req.params;
      const program = await ProgramModel.findById(parseInt(id));

      if (!program) {
        return sendError(res, "Program not found", 404);
      }

      return sendSuccess(res, "Program retrieved successfully", program);
    } catch (error) {
      console.error("Get program by ID error:", error);
      return sendError(res, "Failed to retrieve program", 500);
    }
  }

  // Get programs by department
  static async getProgramsByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Check if department exists
      const department = await DepartmentModel.findById(parseInt(departmentId));
      if (!department) {
        return sendError(res, "Department not found", 404);
      }

      const result = await ProgramModel.findByDepartment(
        parseInt(departmentId),
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(res, "Department programs retrieved", {
        department,
        ...result,
      });
    } catch (error) {
      console.error("Get programs by department error:", error);
      return sendError(res, "Failed to retrieve department programs", 500);
    }
  }

  // Get programs by type
  static async getProgramsByType(req, res) {
    try {
      const { type } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Validate program type
      const validTypes = Object.values(PROGRAM_TYPES);
      if (!validTypes.includes(type)) {
        return sendError(
          res,
          `Invalid program type. Must be one of: ${validTypes.join(", ")}`,
          400
        );
      }

      const result = await ProgramModel.findByType(
        type,
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(res, `Programs of type ${type} retrieved`, result);
    } catch (error) {
      console.error("Get programs by type error:", error);
      return sendError(res, "Failed to retrieve programs by type", 500);
    }
  }

  // Update program
  static async updateProgram(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if program exists
      const existingProgram = await ProgramModel.findById(parseInt(id));
      if (!existingProgram) {
        return sendError(res, "Program not found", 404);
      }

      // If updating program code, check for duplicates
      if (
        updateData.program_code &&
        updateData.program_code !== existingProgram.program_code
      ) {
        const programWithCode = await ProgramModel.findByCode(
          updateData.program_code
        );
        if (programWithCode) {
          return sendError(res, "Program code already exists", 400);
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

      const updatedProgram = await ProgramModel.update(
        parseInt(id),
        updateData
      );
      return sendSuccess(res, "Program updated successfully", updatedProgram);
    } catch (error) {
      console.error("Update program error:", error);
      return sendError(res, "Failed to update program", 500);
    }
  }

  // Delete program
  static async deleteProgram(req, res) {
    try {
      const { id } = req.params;

      // Check if program exists
      const existingProgram = await ProgramModel.findById(parseInt(id));
      if (!existingProgram) {
        return sendError(res, "Program not found", 404);
      }

      // Check if program has courses
      const hasCourses = await ProgramModel.hasCourses(parseInt(id));
      if (hasCourses) {
        return sendError(
          res,
          "Cannot delete program with existing courses",
          400
        );
      }

      await ProgramModel.delete(parseInt(id));
      return sendSuccess(res, "Program deleted successfully");
    } catch (error) {
      console.error("Delete program error:", error);
      return sendError(res, "Failed to delete program", 500);
    }
  }

  // Get program statistics
  static async getProgramStats(req, res) {
    try {
      const { department_id, program_type } = req.query;

      const stats = await ProgramModel.getStatistics(
        department_id ? parseInt(department_id) : null,
        program_type || null
      );

      return sendSuccess(res, "Program statistics retrieved", stats);
    } catch (error) {
      console.error("Get program stats error:", error);
      return sendError(res, "Failed to get program statistics", 500);
    }
  }

  // Get program types dashboard
  static async getProgramTypesDashboard(req, res) {
    try {
      const stats = await ProgramModel.getProgramTypesDashboard();
      return sendSuccess(res, "Program types dashboard data", stats);
    } catch (error) {
      console.error("Get program types dashboard error:", error);
      return sendError(res, "Failed to get program types dashboard", 500);
    }
  }

  // Get all program types
  static async getProgramTypes(req, res) {
    try {
      const types = await ProgramModel.getProgramTypes();
      return sendSuccess(res, "Program types retrieved", types);
    } catch (error) {
      console.error("Get program types error:", error);
      return sendError(res, "Failed to get program types", 500);
    }
  }

  // Assign courses to program
  static async assignCourses(req, res) {
    try {
      const { id } = req.params;
      const { course_ids } = req.body;

      if (
        !course_ids ||
        !Array.isArray(course_ids) ||
        course_ids.length === 0
      ) {
        return sendError(res, "Course IDs array is required", 400);
      }

      // Check if program exists
      const existingProgram = await ProgramModel.findById(parseInt(id));
      if (!existingProgram) {
        return sendError(res, "Program not found", 404);
      }

      const updatedProgram = await ProgramModel.assignCourses(
        parseInt(id),
        course_ids
      );
      return sendSuccess(
        res,
        "Courses assigned to program successfully",
        updatedProgram
      );
    } catch (error) {
      console.error("Assign courses error:", error);
      return sendError(res, "Failed to assign courses to program", 500);
    }
  }
}

export default ProgramController;
