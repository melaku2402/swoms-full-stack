// src/controllers/AcademicYearController.js
import AcademicYearModel from "../models/AcademicYearModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

class AcademicYearController {
  // Create academic year
  static async createAcademicYear(req, res) {
    try {
      const { year_code, year_name, start_date, end_date, is_active } =
        req.body;

      // Validate required fields
      if (!year_code || !year_name || !start_date || !end_date) {
        return sendError(
          res,
          "Year code, name, start date, and end date are required",
          400
        );
      }

      // Check if year code already exists
      const existingYear = await AcademicYearModel.findByCode(year_code);
      if (existingYear) {
        return sendError(res, "Academic year code already exists", 400);
      }
      // Validate dates
      if (new Date(start_date) >= new Date(end_date)) {
        return sendError(res, "Start date must be before end date", 400);
      }

      const academicYear = await AcademicYearModel.create({
        year_code,
        year_name,
        start_date,
        end_date,
        is_active: is_active || false,
      });

      return sendSuccess(
        res,
        "Academic year created successfully",
        academicYear,
        201
      );
    } catch (error) {
      console.error("Create academic year error:", error);
      return sendError(res, "Failed to create academic year", 500);
    }
  }

  // Get all academic years
  static async getAllAcademicYears(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await AcademicYearModel.findAll(
        parseInt(page),
        parseInt(limit)
      );
      return sendSuccess(res, "Academic years retrieved successfully", result);
    } catch (error) {
      console.error("Get academic years error:", error);
      return sendError(res, "Failed to retrieve academic years", 500);
    }
  }

  // Get academic year by ID
  static async getAcademicYearById(req, res) {
    try {
      const { id } = req.params;
      const academicYear = await AcademicYearModel.findById(parseInt(id));

      if (!academicYear) {
        return sendError(res, "Academic year not found", 404);
      }
      return sendSuccess(
        res,
        "Academic year retrieved successfully",
        academicYear
      );
    } catch (error) {
      console.error("Get academic year error:", error);
      return sendError(res, "Failed to retrieve academic year", 500);
    }
  }

  // Update academic year
  static async updateAcademicYear(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if academic year exists
      const existingYear = await AcademicYearModel.findById(parseInt(id));
      if (!existingYear) {
        return sendError(res, "Academic year not found", 404);
      }

      // If updating year code, check for duplicates
      if (
        updateData.year_code &&
        updateData.year_code !== existingYear.year_code
      ) {
        const yearWithCode = await AcademicYearModel.findByCode(
          updateData.year_code
        );
        if (yearWithCode) {
          return sendError(res, "Academic year code already exists", 400);
        }
      }

      // Validate dates if both are provided
      if (updateData.start_date && updateData.end_date) {
        if (new Date(updateData.start_date) >= new Date(updateData.end_date)) {
          return sendError(res, "Start date must be before end date", 400);
        }
      }

      const updatedYear = await AcademicYearModel.update(
        parseInt(id),
        updateData
      );
      return sendSuccess(
        res,
        "Academic year updated successfully",
        updatedYear
      );
    } catch (error) {
      console.error("Update academic year error:", error);
      return sendError(res, "Failed to update academic year", 500);
    }
  }

  // Delete academic year
  static async deleteAcademicYear(req, res) {
    try {
      const { id } = req.params;

      // Check if academic year exists
      const existingYear = await AcademicYearModel.findById(parseInt(id));
      if (!existingYear) {
        return sendError(res, "Academic year not found", 404);
      }

      // Check if academic year has semesters
      if (existingYear.semester_count > 0) {
        return sendError(
          res,
          "Cannot delete academic year with existing semesters",
          400
        );
      }

      await AcademicYearModel.delete(parseInt(id));
      return sendSuccess(res, "Academic year deleted successfully");
    } catch (error) {
      console.error("Delete academic year error:", error);
      return sendError(res, "Failed to delete academic year", 500);
    }
  }

  // Activate academic year
  static async activateAcademicYear(req, res) {
    try {
      const { id } = req.params;

      // Check if academic year exists
      const existingYear = await AcademicYearModel.findById(parseInt(id));
      if (!existingYear) {
        return sendError(res, "Academic year not found", 404);
      }

      const activatedYear = await AcademicYearModel.activate(parseInt(id));
      return sendSuccess(
        res,
        "Academic year activated successfully",
        activatedYear
      );
    } catch (error) {
      console.error("Activate academic year error:", error);
      return sendError(res, "Failed to activate academic year", 500);
    }
  }

  // Get active academic year
  static async getActiveAcademicYear(req, res) {
    try {
      const activeYear = await AcademicYearModel.getActive();

      if (!activeYear) {
        return sendError(res, "No active academic year found", 404);
      }

      return sendSuccess(res, "Active academic year retrieved", activeYear);
    } catch (error) {
      console.error("Get active academic year error:", error);
      return sendError(res, "Failed to get active academic year", 500);
    }
  }

  // Get academic year statistics
  static async getAcademicYearStats(req, res) {
    try {
      const { id } = req.params;

      // Check if academic year exists
      const existingYear = await AcademicYearModel.findById(parseInt(id));
      if (!existingYear) {
        return sendError(res, "Academic year not found", 404);
      }

      const stats = await AcademicYearModel.getStatistics(parseInt(id));
      return sendSuccess(res, "Academic year statistics retrieved", stats);
    } catch (error) {
      console.error("Get academic year stats error:", error);
      return sendError(res, "Failed to get academic year statistics", 500);
    }
  }
}

export default AcademicYearController;
