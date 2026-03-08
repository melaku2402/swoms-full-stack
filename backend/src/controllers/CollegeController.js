import CollegeModel from "../models/CollegeModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

class CollegeController {
  // Get all colleges
  static async getAllColleges(req, res) {
    try {
      const { page = 1, limit = 10, include_stats } = req.query;
      const result = await CollegeModel.findAll(
        parseInt(page),
        parseInt(limit),
        include_stats === "true"
      );
      return sendSuccess(res, "Colleges retrieved successfully", result);
    } catch (error) {
      console.error("Get colleges error:", error);
      return sendError(res, "Failed to retrieve colleges", 500);
    }
  }

  // Get college by ID
  static async getCollegeById(req, res) {
    try {
      const { id } = req.params;
      const college = await CollegeModel.findById(parseInt(id));

      if (!college) {
        return sendError(res, "College not found", 404);
      }

      return sendSuccess(res, "College retrieved successfully", college);
    } catch (error) {
      console.error("Get college error:", error);
      return sendError(res, "Failed to retrieve college", 500);
    }
  }

  // Create college
  static async createCollege(req, res) {
    try {
      const { college_code, college_name, dean_user_id, status } = req.body;

      // Validate required fields
      if (!college_code || !college_name) {
        return sendError(res, "College code and name are required", 400);
      }

      // Check if college code already exists
      const existingCollege = await CollegeModel.findByCode(college_code);
      if (existingCollege) {
        return sendError(res, "College code already exists", 400);
      }

      const college = await CollegeModel.create({
        college_code,
        college_name,
        dean_user_id,
        status: status || "active",
      });

      return sendSuccess(res, "College created successfully", college, 201);
    } catch (error) {
      console.error("Create college error:", error);
      return sendError(res, "Failed to create college", 400);
    }
  }

  // Update college
  static async updateCollege(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if college exists
      const existingCollege = await CollegeModel.findById(parseInt(id));
      if (!existingCollege) {
        return sendError(res, "College not found", 404);
      }

      // If updating college code, check for duplicates
      if (
        updateData.college_code &&
        updateData.college_code !== existingCollege.college_code
      ) {
        const collegeWithCode = await CollegeModel.findByCode(
          updateData.college_code
        );
        if (collegeWithCode) {
          return sendError(res, "College code already exists", 400);
        }
      }

      const updatedCollege = await CollegeModel.update(
        parseInt(id),
        updateData
      );
      return sendSuccess(res, "College updated successfully", updatedCollege);
    } catch (error) {
      console.error("Update college error:", error);
      return sendError(res, "Failed to update college", 400);
    }
  }

  // Delete college
  static async deleteCollege(req, res) {
    try {
      const { id } = req.params;

      // Check if college exists
      const existingCollege = await CollegeModel.findById(parseInt(id));
      if (!existingCollege) {
        return sendError(res, "College not found", 404);
      }

      await CollegeModel.delete(parseInt(id));
      return sendSuccess(res, "College deleted successfully");
    } catch (error) {
      console.error("Delete college error:", error);
      return sendError(res, "Failed to delete college", 500);
    }
  }

  // Get college statistics
  static async getCollegeStats(req, res) {
    try {
      const { id } = req.params;

      // Check if college exists
      const existingCollege = await CollegeModel.findById(parseInt(id));
      if (!existingCollege) {
        return sendError(res, "College not found", 404);
      }

      const stats = await CollegeModel.getStatistics();
      const collegeStats = stats.find(
        (stat) => stat.college_id === parseInt(id)
      );

      return sendSuccess(res, "College statistics retrieved", collegeStats);
    } catch (error) {
      console.error("Get college stats error:", error);
      return sendError(res, "Failed to get college statistics", 500);
    }
  }

  // Assign dean to college
  static async assignDean(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.body;

      if (!user_id) {
        return sendError(res, "User ID is required", 400);
      }

      const college = await CollegeModel.assignDean(
        parseInt(id),
        parseInt(user_id)
      );
      return sendSuccess(res, "Dean assigned successfully", college);
    } catch (error) {
      console.error("Assign dean error:", error);
      return sendError(res, "Failed to assign dean", 400);
    }
  }
}

export default CollegeController;
