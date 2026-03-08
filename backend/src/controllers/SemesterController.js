// src/controllers/SemesterController.js
import SemesterModel from "../models/SemesterModel.js";
import AcademicYearModel from "../models/AcademicYearModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

class SemesterController {
  // Create semester
  static async createSemester(req, res) {
    try {
      const {
        academic_year_id,
        semester_code,
        semester_name,
        semester_type,
        start_date,
        end_date,
        is_active,
      } = req.body;

      // Validate required fields
      if (
        !academic_year_id ||
        !semester_code ||
        !semester_name ||
        !semester_type ||
        !start_date ||
        !end_date
      ) {
        return sendError(
          res,
          "All fields are required: academic_year_id, semester_code, semester_name, semester_type, start_date, end_date",
          400
        );
      }

      // Check if academic year exists
      const academicYear = await AcademicYearModel.findById(
        parseInt(academic_year_id)
      );
      if (!academicYear) {
        return sendError(res, "Academic year not found", 404);
      }

      // Check if semester code already exists
      const existingSemester = await SemesterModel.findByCode(semester_code);
      if (existingSemester) {
        return sendError(res, "Semester code already exists", 400);
      }

      // Validate semester type
      const validTypes = [
        "semester_i",
        "semester_ii",
        "summer",
        "distance",
        "extension",
        "weekend",
      ];
      if (!validTypes.includes(semester_type)) {
        return sendError(
          res,
          `Invalid semester type. Must be one of: ${validTypes.join(", ")}`,
          400
        );
      }

      // Validate dates
      if (new Date(start_date) >= new Date(end_date)) {
        return sendError(res, "Start date must be before end date", 400);
      }

      // Check if dates fall within academic year
      if (
        new Date(start_date) < new Date(academicYear.start_date) ||
        new Date(end_date) > new Date(academicYear.end_date)
      ) {
        return sendError(
          res,
          "Semester dates must be within academic year dates",
          400
        );
      }

      const semester = await SemesterModel.create({
        academic_year_id: parseInt(academic_year_id),
        semester_code,
        semester_name,
        semester_type,
        start_date,
        end_date,
        is_active: is_active || false,
      });

      return sendSuccess(res, "Semester created successfully", semester, 201);
    } catch (error) {
      console.error("Create semester error:", error);
      return sendError(res, "Failed to create semester", 500);
    }
  }

  // Get all semesters
  static async getAllSemesters(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        academic_year_id,
        semester_type,
        is_active,
      } = req.query;

      const filters = {};
      if (academic_year_id)
        filters.academic_year_id = parseInt(academic_year_id);
      if (semester_type) filters.semester_type = semester_type;
      if (is_active !== undefined) filters.is_active = is_active === "true";

      const result = await SemesterModel.findAll(
        parseInt(page),
        parseInt(limit),
        filters
      );
      return sendSuccess(res, "Semesters retrieved successfully", result);
    } catch (error) {
      console.error("Get semesters error:", error);
      return sendError(res, "Failed to retrieve semesters", 500);
    }
  }

  // Get semester by ID
  static async getSemesterById(req, res) {
    try {
      const { id } = req.params;
      const semester = await SemesterModel.findById(parseInt(id));

      if (!semester) {
        return sendError(res, "Semester not found", 404);
      }

      return sendSuccess(res, "Semester retrieved successfully", semester);
    } catch (error) {
      console.error("Get semester error:", error);
      return sendError(res, "Failed to retrieve semester", 500);
    }
  }

  // Get semesters by academic year
  static async getSemestersByAcademicYear(req, res) {
    try {
      const { academicYearId } = req.params;
      const { include_stats } = req.query;

      // Check if academic year exists
      const academicYear = await AcademicYearModel.findById(
        parseInt(academicYearId)
      );
      if (!academicYear) {
        return sendError(res, "Academic year not found", 404);
      }

      const semesters = await SemesterModel.findByAcademicYear(
        parseInt(academicYearId),
        include_stats === "true"
      );

      return sendSuccess(res, "Semesters retrieved successfully", {
        academic_year: academicYear,
        semesters,
      });
    } catch (error) {
      console.error("Get semesters by academic year error:", error);
      return sendError(res, "Failed to retrieve semesters", 500);
    }
  }

  // Update semester
  static async updateSemester(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if semester exists
      const existingSemester = await SemesterModel.findById(parseInt(id));
      if (!existingSemester) {
        return sendError(res, "Semester not found", 404);
      }

      // If updating semester code, check for duplicates
      if (
        updateData.semester_code &&
        updateData.semester_code !== existingSemester.semester_code
      ) {
        const semesterWithCode = await SemesterModel.findByCode(
          updateData.semester_code
        );
        if (semesterWithCode) {
          return sendError(res, "Semester code already exists", 400);
        }
      }

      // If updating academic_year_id, validate it exists
      if (updateData.academic_year_id) {
        const academicYear = await AcademicYearModel.findById(
          parseInt(updateData.academic_year_id)
        );
        if (!academicYear) {
          return sendError(res, "Academic year not found", 404);
        }
      }

      // Validate semester type if provided
      if (updateData.semester_type) {
        const validTypes = [
          "semester_i",
          "semester_ii",
          "summer",
          "distance",
          "extension",
          "weekend",
        ];
        if (!validTypes.includes(updateData.semester_type)) {
          return sendError(
            res,
            `Invalid semester type. Must be one of: ${validTypes.join(", ")}`,
            400
          );
        }
      }

      const updatedSemester = await SemesterModel.update(
        parseInt(id),
        updateData
      );
      return sendSuccess(res, "Semester updated successfully", updatedSemester);
    } catch (error) {
      console.error("Update semester error:", error);
      return sendError(res, "Failed to update semester", 500);
    }
  }

  // Delete semester
  static async deleteSemester(req, res) {
    try {
      const { id } = req.params;

      // Check if semester exists
      const existingSemester = await SemesterModel.findById(parseInt(id));
      if (!existingSemester) {
        return sendError(res, "Semester not found", 404);
      }

      // Check if semester has sections
      if (existingSemester.section_count > 0) {
        return sendError(
          res,
          "Cannot delete semester with existing sections",
          400
        );
      }

      await SemesterModel.delete(parseInt(id));
      return sendSuccess(res, "Semester deleted successfully");
    } catch (error) {
      console.error("Delete semester error:", error);
      return sendError(res, "Failed to delete semester", 500);
    }
  }

  // Activate semester
  static async activateSemester(req, res) {
    try {
      const { id } = req.params;

      // Check if semester exists
      const existingSemester = await SemesterModel.findById(parseInt(id));
      if (!existingSemester) {
        return sendError(res, "Semester not found", 404);
      }

      const activatedSemester = await SemesterModel.activate(parseInt(id));
      return sendSuccess(
        res,
        "Semester activated successfully",
        activatedSemester
      );
    } catch (error) {
      console.error("Activate semester error:", error);
      return sendError(res, "Failed to activate semester", 500);
    }
  }

  // Get active semester
  static async getActiveSemester(req, res) {
    try {
      const activeSemester = await SemesterModel.getActive();

      if (!activeSemester) {
        return sendError(res, "No active semester found", 404);
      }

      return sendSuccess(res, "Active semester retrieved", activeSemester);
    } catch (error) {
      console.error("Get active semester error:", error);
      return sendError(res, "Failed to get active semester", 500);
    }
  }

  // Get current semester (based on date)
  static async getCurrentSemester(req, res) {
    try {
      const currentSemester = await SemesterModel.getCurrent();

      if (!currentSemester) {
        return sendError(res, "No current semester found based on date", 404);
      }

      return sendSuccess(res, "Current semester retrieved", currentSemester);
    } catch (error) {
      console.error("Get current semester error:", error);
      return sendError(res, "Failed to get current semester", 500);
    }
  }

  // Get semester statistics
  static async getSemesterStats(req, res) {
    try {
      const { id } = req.params;

      // Check if semester exists
      const existingSemester = await SemesterModel.findById(parseInt(id));
      if (!existingSemester) {
        return sendError(res, "Semester not found", 404);
      }

      const stats = await SemesterModel.getStatistics(parseInt(id));
      return sendSuccess(res, "Semester statistics retrieved", {
        semester: existingSemester,
        statistics: stats,
      });
    } catch (error) {
      console.error("Get semester stats error:", error);
      return sendError(res, "Failed to get semester statistics", 500);
    }
  }
}

export default SemesterController;
