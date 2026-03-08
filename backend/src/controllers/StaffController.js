// src/controllers/StaffController.js
import StaffModel from "../models/StaffModel.js";
import UserModel from "../models/UserModel.js";
import DepartmentModel from "../models/DepartmentModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { hashPassword } from "../utils/hash.js";
import { ACADEMIC_RANKS, EMPLOYMENT_TYPES } from "../config/constants.js";

class StaffController {
  // Create staff with user account
  static async createStaff(req, res) {
    try {
      const {
        username,
        email,
        password,
        first_name,
        last_name,
        employee_id,
        department_id,
        academic_rank = "lecturer",
        employment_type = "full_time",
        middle_name,
        hire_date,
        phone,
        address,
        date_of_birth,
        gender,
        role = "instructor",
      } = req.body;

      // Validate required fields
      if (
        !username ||
        !email ||
        !password ||
        !first_name ||
        !last_name ||
        !employee_id ||
        !department_id
      ) {
        return sendError(res, "Missing required fields", 400);
      }

      // Check if username already exists
      const existingUsername = await UserModel.usernameExists(username);
      if (existingUsername) {
        return sendError(res, "Username already exists", 400);
      }

      // Check if email already exists
      const existingEmail = await UserModel.emailExists(email);
      if (existingEmail) {
        return sendError(res, "Email already exists", 400);
      }

      // Check if employee ID already exists
      const existingEmployee = await StaffModel.findByEmployeeId(employee_id);
      if (existingEmployee) {
        return sendError(res, "Employee ID already exists", 400);
      }

      // Check if department exists
      const department = await DepartmentModel.findById(
        parseInt(department_id)
      );
      if (!department) {
        return sendError(res, "Department not found", 404);
      }

      // Validate academic rank
      const validRanks = Object.values(ACADEMIC_RANKS);
      if (!validRanks.includes(academic_rank)) {
        return sendError(
          res,
          `Invalid academic rank. Must be one of: ${validRanks.join(", ")}`,
          400
        );
      }

      // Validate employment type
      const validTypes = Object.values(EMPLOYMENT_TYPES);
      if (!validTypes.includes(employment_type)) {
        return sendError(
          res,
          `Invalid employment type. Must be one of: ${validTypes.join(", ")}`,
          400
        );
      }

      // Create user account first
      const user = await UserModel.create({
        username,
        email,
        password,
        role,
        is_active: true,
      });

      if (!user) {
        return sendError(res, "Failed to create user account", 500);
      }

      // Create staff profile
      const staff = await StaffModel.create({
        user_id: user.user_id,
        employee_id,
        first_name,
        last_name,
        middle_name,
        department_id: parseInt(department_id),
        academic_rank,
        employment_type,
        hire_date,
        phone,
        address,
        date_of_birth,
        gender,
      });

      return sendSuccess(
        res,
        "Staff created successfully",
        { user, staff },
        201
      );
    } catch (error) {
      console.error("Create staff error:", error);
      return sendError(res, "Failed to create staff", 500);
    }
  }

  
  // Get all staff with filters
  static async getAllStaff(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        department_id,
        college_id,
        academic_rank,
        employment_type,
        search,
      } = req.query;

      const filters = {};
      if (department_id) filters.department_id = parseInt(department_id);
      if (college_id) filters.college_id = parseInt(college_id);
      if (academic_rank) filters.academic_rank = academic_rank;
      if (employment_type) filters.employment_type = employment_type;
      if (search) filters.search = search;

      const result = await StaffModel.findAll(
        parseInt(page),
        parseInt(limit),
        filters
      );

      return sendSuccess(res, "Staff retrieved successfully", result);
    } catch (error) {
      console.error("Get all staff error:", error);
      return sendError(res, "Failed to retrieve staff", 500);
    }
  }


  // Get staff by ID
  static async getStaffById(req, res) {
    try {
      const { id } = req.params;
      const staff = await StaffModel.findById(parseInt(id));

      if (!staff) {
        return sendError(res, "Staff not found", 404);
      }

      return sendSuccess(res, "Staff retrieved successfully", staff);
    } catch (error) {
      console.error("Get staff by ID error:", error);
      return sendError(res, "Failed to retrieve staff", 500);
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await query(
        `SELECT * FROM staff_profiles WHERE user_id = ?`,
        [userId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('StaffModel.findByUserId error:', error);
      return null;
    }
  }
  // Get staff by user ID
  static async getStaffByUserId(req, res) {
    try {
      const { userId } = req.params;
      const staff = await StaffModel.findByUserId(parseInt(userId));

      if (!staff) {
        return sendError(res, "Staff not found", 404);
      }

      return sendSuccess(res, "Staff retrieved successfully", staff);
    } catch (error) {
      console.error("Get staff by user ID error:", error);
      return sendError(res, "Failed to retrieve staff", 500);
    }
  }

// Add to StaffController.js
static async checkMyStaffProfile(req, res) {
  try {
    const staff = await StaffModel.findByUserId(req.user.user_id);
    
    if (!staff) {
      return sendSuccess(res, "No staff profile found", {
        has_staff_profile: false,
        user: req.user,
        message: "You need to create a staff profile to use workload features"
      });
    }
    
    return sendSuccess(res, "Staff profile found", {
      has_staff_profile: true,
      staff: staff,
      user: req.user
    });
  } catch (error) {
    console.error("Check staff profile error:", error);
    return sendError(res, "Failed to check staff profile", 500);
  }
}

  // Update staff profile
  static async updateStaff(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if staff exists
      const existingStaff = await StaffModel.findById(parseInt(id));
      if (!existingStaff) {
        return sendError(res, "Staff not found", 404);
      }

      // If updating employee ID, check for duplicates
      if (
        updateData.employee_id &&
        updateData.employee_id !== existingStaff.employee_id
      ) {
        const staffWithEmployeeId = await StaffModel.findByEmployeeId(
          updateData.employee_id
        );
        if (staffWithEmployeeId) {
          return sendError(res, "Employee ID already exists", 400);
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

      const updatedStaff = await StaffModel.update(parseInt(id), updateData);

      // Log the update in audit log
      await req.app.locals.auditLogger?.logUpdate(
        req.user.user_id,
        "staff_profiles",
        id,
        existingStaff,
        updatedStaff
      );

      return sendSuccess(res, "Staff updated successfully", updatedStaff);
    } catch (error) {
      console.error("Update staff error:", error);
      return sendError(res, "Failed to update staff", 500);
    }
  }

  // Delete staff (soft delete by deactivating user)
  static async deleteStaff(req, res) {
    try {
      const { id } = req.params;

      // Check if staff exists
      const existingStaff = await StaffModel.findById(parseInt(id));
      if (!existingStaff) {
        return sendError(res, "Staff not found", 404);
      }

      // Check if staff has approved workloads
      if (existingStaff.workload_count > 0) {
        return sendError(
          res,
          "Cannot delete staff with existing workloads",
          400
        );
      }

      await StaffModel.delete(parseInt(id));

      // Log the deletion in audit log
      await req.app.locals.auditLogger?.logDelete(
        req.user.user_id,
        "staff_profiles",
        id,
        existingStaff
      );

      return sendSuccess(res, "Staff deactivated successfully");
    } catch (error) {
      console.error("Delete staff error:", error);
      return sendError(res, "Failed to deactivate staff", 500);
    }
  }

  // Get staff by department
  static async getStaffByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const { page = 1, limit = 20, include_stats } = req.query;

      // Check if department exists
      const department = await DepartmentModel.findById(parseInt(departmentId));
      if (!department) {
        return sendError(res, "Department not found", 404);
      }

      const result = await StaffModel.findByDepartment(
        parseInt(departmentId),
        parseInt(page),
        parseInt(limit),
        include_stats === "true"
      );

      return sendSuccess(res, "Department staff retrieved successfully", {
        department,
        ...result,
      });
    } catch (error) {
      console.error("Get staff by department error:", error);
      return sendError(res, "Failed to retrieve department staff", 500);
    }
  }

  // Search staff
  static async searchStaff(req, res) {
    try {
      const { q, limit = 50 } = req.query;

      if (!q || q.trim().length < 2) {
        return sendError(
          res,
          "Search query must be at least 2 characters",
          400
        );
      }

      const staff = await StaffModel.search(q.trim(), parseInt(limit));
      return sendSuccess(res, "Search results", staff);
    } catch (error) {
      console.error("Search staff error:", error);
      return sendError(res, "Failed to search staff", 500);
    }
  }

  // Get staff statistics
  static async getStaffStatistics(req, res) {
    try {
      const { department_id, college_id } = req.query;

      let stats;
      if (department_id) {
        stats = await StaffModel.getDepartmentStaffStatistics(
          parseInt(department_id)
        );
      } else if (college_id) {
        stats = await StaffModel.getCollegeStaffStatistics(
          parseInt(college_id)
        );
      } else {
        stats = await StaffModel.getUniversityStaffStatistics();
      }

      return sendSuccess(res, "Staff statistics retrieved", stats);
    } catch (error) {
      console.error("Get staff statistics error:", error);
      return sendError(res, "Failed to get staff statistics", 500);
    }
  }

  // Get staff workload summary
  static async getStaffWorkloadSummary(req, res) {
    try {
      const { id } = req.params;
      const { semester_id } = req.query;

      // Check if staff exists
      const existingStaff = await StaffModel.findById(parseInt(id));
      if (!existingStaff) {
        return sendError(res, "Staff not found", 404);
      }

      const workload = await StaffModel.getStaffWorkloadSummary(
        parseInt(id),
        semester_id ? parseInt(semester_id) : null
      );

      return sendSuccess(res, "Staff workload summary", {
        staff: existingStaff,
        workload,
      });
    } catch (error) {
      console.error("Get staff workload summary error:", error);
      return sendError(res, "Failed to get workload summary", 500);
    }
  }

  // Update staff rank
  static async updateStaffRank(req, res) {
    try {
      const { id } = req.params;
      const { new_rank, reason } = req.body;

      if (!new_rank) {
        return sendError(res, "New rank is required", 400);
      }

      // Check if staff exists
      const existingStaff = await StaffModel.findById(parseInt(id));
      if (!existingStaff) {
        return sendError(res, "Staff not found", 404);
      }

      // Validate academic rank
      const validRanks = Object.values(ACADEMIC_RANKS);
      if (!validRanks.includes(new_rank)) {
        return sendError(
          res,
          `Invalid academic rank. Must be one of: ${validRanks.join(", ")}`,
          400
        );
      }

      const updatedStaff = await StaffModel.updateRank(
        parseInt(id),
        new_rank,
        req.user.user_id,
        reason
      );

      return sendSuccess(res, "Staff rank updated successfully", updatedStaff);
    } catch (error) {
      console.error("Update staff rank error:", error);
      return sendError(res, "Failed to update staff rank", 500);
    }
  }

  // Assign staff to department
  static async assignToDepartment(req, res) {
    try {
      const { id } = req.params;
      const { department_id } = req.body;

      if (!department_id) {
        return sendError(res, "Department ID is required", 400);
      }

      // Check if staff exists
      const existingStaff = await StaffModel.findById(parseInt(id));
      if (!existingStaff) {
        return sendError(res, "Staff not found", 404);
      }

      // Check if department exists
      const department = await DepartmentModel.findById(
        parseInt(department_id)
      );
      if (!department) {
        return sendError(res, "Department not found", 404);
      }

      const updatedStaff = await StaffModel.assignToDepartment(
        parseInt(id),
        parseInt(department_id)
      );

      // Log the assignment
      await req.app.locals.auditLogger?.logUpdate(
        req.user.user_id,
        "staff_profiles",
        id,
        { department_id: existingStaff.department_id },
        { department_id }
      );

      return sendSuccess(
        res,
        "Staff assigned to department successfully",
        updatedStaff
      );
    } catch (error) {
      console.error("Assign to department error:", error);
      return sendError(res, "Failed to assign staff to department", 500);
    }
  }

  // Get staff by rank
  static async getStaffByRank(req, res) {
    try {
      const { rank } = req.params;
      const { department_id } = req.query;

      // Validate academic rank
      const validRanks = Object.values(ACADEMIC_RANKS);
      if (!validRanks.includes(rank)) {
        return sendError(
          res,
          `Invalid academic rank. Must be one of: ${validRanks.join(", ")}`,
          400
        );
      }

      const staff = await StaffModel.findByRank(
        rank,
        department_id ? parseInt(department_id) : null
      );

      return sendSuccess(res, `Staff with rank ${rank} retrieved`, staff);
    } catch (error) {
      console.error("Get staff by rank error:", error);
      return sendError(res, "Failed to get staff by rank", 500);
    }
  }

  // Get my staff profile (for instructors)
  static async getMyProfile(req, res) {
    try {
      const staff = await StaffModel.findByUserId(req.user.user_id);

      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      return sendSuccess(res, "My profile retrieved", staff);
    } catch (error) {
      console.error("Get my profile error:", error);
      return sendError(res, "Failed to get profile", 500);
    }
  }

  // Update my profile (for instructors)
  static async updateMyProfile(req, res) {
    try {
      const staff = await StaffModel.findByUserId(req.user.user_id);

      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      const updateData = req.body;

      // Prevent changing certain fields
      delete updateData.employee_id;
      delete updateData.department_id;
      delete updateData.academic_rank;
      delete updateData.user_id;

      const updatedStaff = await StaffModel.update(staff.staff_id, updateData);

      return sendSuccess(res, "Profile updated successfully", updatedStaff);
    } catch (error) {
      console.error("Update my profile error:", error);
      return sendError(res, "Failed to update profile", 500);
    }
  }
}

export default StaffController;
