import ProgramYearModel from "../models/ProgramYearModel.js";
import ProgramModel from "../models/ProgramModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

class ProgramYearController {
  // Create program year
  static async createProgramYear(req, res) {
    try {
      const {
        program_id,
        year_number,
        year_name,
        total_credits = 0,
      } = req.body;

      // Validate required fields
      if (!program_id || !year_number) {
        return sendError(res, "Program ID and year number are required", 400);
      }

      // Check if program exists
      const program = await ProgramModel.findById(parseInt(program_id));
      if (!program) {
        return sendError(res, "Program not found", 404);
      }

      // Validate year number
      if (year_number < 1 || year_number > 10) {
        return sendError(res, "Year number must be between 1 and 10", 400);
      }

      // Check if year already exists for this program
      const existingYears = await ProgramYearModel.findByProgram(
        parseInt(program_id)
      );
      const yearExists = existingYears.some(
        (year) => year.year_number === parseInt(year_number)
      );

      if (yearExists) {
        return sendError(
          res,
          `Year ${year_number} already exists for this program`,
          400
        );
      }

      const programYear = await ProgramYearModel.create({
        program_id: parseInt(program_id),
        year_number: parseInt(year_number),
        year_name: year_name || `Year ${year_number}`,
        total_credits: parseFloat(total_credits),
      });

      return sendSuccess(
        res,
        "Program year created successfully",
        programYear,
        201
      );
    } catch (error) {
      console.error("Create program year error:", error);
      return sendError(res, "Failed to create program year", 500);
    }
  }

  // Get program year by ID
  static async getProgramYearById(req, res) {
    try {
      const { id } = req.params;
      const programYear = await ProgramYearModel.findById(parseInt(id));

      if (!programYear) {
        return sendError(res, "Program year not found", 404);
      }

      return sendSuccess(
        res,
        "Program year retrieved successfully",
        programYear
      );
    } catch (error) {
      console.error("Get program year by ID error:", error);
      return sendError(res, "Failed to retrieve program year", 500);
    }
  }

  // Get years by program
  static async getProgramYearsByProgram(req, res) {
    try {
      const { programId } = req.params;

      // Check if program exists
      const program = await ProgramModel.findById(parseInt(programId));
      if (!program) {
        return sendError(res, "Program not found", 404);
      }

      const programYears = await ProgramYearModel.findByProgram(
        parseInt(programId)
      );

      return sendSuccess(res, "Program years retrieved successfully", {
        program,
        programYears,
      });
    } catch (error) {
      console.error("Get program years by program error:", error);
      return sendError(res, "Failed to retrieve program years", 500);
    }
  }

  // Update program year
  static async updateProgramYear(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if program year exists
      const existingProgramYear = await ProgramYearModel.findById(parseInt(id));
      if (!existingProgramYear) {
        return sendError(res, "Program year not found", 404);
      }

      // If updating year number, validate it
      if (updateData.year_number !== undefined) {
        if (updateData.year_number < 1 || updateData.year_number > 10) {
          return sendError(res, "Year number must be between 1 and 10", 400);
        }

        // Check for duplicate year number in the same program
        const existingYears = await ProgramYearModel.findByProgram(
          existingProgramYear.program_id
        );
        const duplicate = existingYears.find(
          (year) =>
            year.year_number === parseInt(updateData.year_number) &&
            year.program_year_id !== parseInt(id)
        );

        if (duplicate) {
          return sendError(
            res,
            `Year ${updateData.year_number} already exists for this program`,
            400
          );
        }
      }

      const updatedProgramYear = await ProgramYearModel.update(
        parseInt(id),
        updateData
      );

      return sendSuccess(
        res,
        "Program year updated successfully",
        updatedProgramYear
      );
    } catch (error) {
      console.error("Update program year error:", error);
      return sendError(res, "Failed to update program year", 500);
    }
  }

  // Delete program year
  static async deleteProgramYear(req, res) {
    try {
      const { id } = req.params;

      // Check if program year exists
      const existingProgramYear = await ProgramYearModel.findById(parseInt(id));
      if (!existingProgramYear) {
        return sendError(res, "Program year not found", 404);
      }

      // Check if program year has courses assigned
      if (existingProgramYear.course_count > 0) {
        return sendError(
          res,
          "Cannot delete program year with assigned courses",
          400
        );
      }

      await ProgramYearModel.delete(parseInt(id));
      return sendSuccess(res, "Program year deleted successfully");
    } catch (error) {
      console.error("Delete program year error:", error);
      return sendError(res, "Failed to delete program year", 500);
    }
  }

  // Get year statistics
  static async getYearStatistics(req, res) {
    try {
      const { programId } = req.params;

      // Check if program exists
      const program = await ProgramModel.findById(parseInt(programId));
      if (!program) {
        return sendError(res, "Program not found", 404);
      }

      const statistics = await ProgramYearModel.getYearStatistics(
        parseInt(programId)
      );

      return sendSuccess(res, "Year statistics retrieved", {
        program,
        statistics,
      });
    } catch (error) {
      console.error("Get year statistics error:", error);
      return sendError(res, "Failed to get year statistics", 500);
    }
  }
}

export default ProgramYearController;
