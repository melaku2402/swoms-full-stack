// import DepartmentModel from "../models/DepartmentModel.js";
// import { sendSuccess, sendError } from "../utils/response.js";

// class DepartmentController {
//   // Get all departments
//   static async getAllDepartments(req, res) {
//     try {
//       const { page = 1, limit = 20 } = req.query;
//       const result = await DepartmentModel.findAll(
//         parseInt(page),
//         parseInt(limit)
//       );
//       return sendSuccess(res, "Departments retrieved successfully", result);
//     } catch (error) {
//       console.error("Get departments error:", error);
//       return sendError(res, "Failed to retrieve departments", 500);
//     }
//   }

//   // Get departments by college
//   static async getDepartmentsByCollege(req, res) {
//     try {
//       const { collegeId } = req.params;
//       const { page = 1, limit = 20 } = req.query;

//       const result = await DepartmentModel.findByCollege(
//         parseInt(collegeId),
//         parseInt(page),
//         parseInt(limit)
//       );

//       return sendSuccess(res, "Departments retrieved successfully", result);
//     } catch (error) {
//       console.error("Get departments by college error:", error);
//       return sendError(res, "Failed to retrieve departments", 500);
//     }
//   }

//   // Get department by ID
//   static async getDepartmentById(req, res) {
//     try {
//       const { id } = req.params;
//       const department = await DepartmentModel.findById(parseInt(id));

//       if (!department) {
//         return sendError(res, "Department not found", 404);
//       }

//       return sendSuccess(res, "Department retrieved successfully", department);
//     } catch (error) {
//       console.error("Get department error:", error);
//       return sendError(res, "Failed to retrieve department", 500);
//     }
//   }

//   // Create department
//   static async createDepartment(req, res) {
//     try {
//       const {
//         department_code,
//         department_name,
//         college_id,
//         head_user_id,
//         status,
//       } = req.body;

//       // Validate required fields
//       if (!department_code || !department_name || !college_id) {
//         return sendError(
//           res,
//           "Department code, name, and college ID are required",
//           400
//         );
//       }

//       // Check if department code already exists
//       const existingDepartment = await DepartmentModel.findByCode(
//         department_code
//       );
//       if (existingDepartment) {
//         return sendError(res, "Department code already exists", 400);
//       }

//       const department = await DepartmentModel.create({
//         department_code,
//         department_name,
//         college_id: parseInt(college_id),
//         head_user_id: head_user_id ? parseInt(head_user_id) : null,
//         status: status || "active",
//       });

//       return sendSuccess(
//         res,
//         "Department created successfully",
//         department,
//         201
//       );
//     } catch (error) {
//       console.error("Create department error:", error);
//       return sendError(res, "Failed to create department", 400);
//     }
//   }

//   // Update department
//   static async updateDepartment(req, res) {
//     try {
//       const { id } = req.params;
//       const updateData = req.body;

//       // Check if department exists
//       const existingDepartment = await DepartmentModel.findById(parseInt(id));
//       if (!existingDepartment) {
//         return sendError(res, "Department not found", 404);
//       }

//       // If user is department_head, check if they're the head of this department
//       if (req.user.role === "department_head") {
//         const userStaff = await import("../models/StaffModel.js").then((m) =>
//           m.default.findByUserId(req.user.user_id)
//         );
//         if (!userStaff || userStaff.department_id !== parseInt(id)) {
//           return sendError(res, "You can only update your own department", 403);
//         }
//       }

//       // If updating department code, check for duplicates
//       if (
//         updateData.department_code &&
//         updateData.department_code !== existingDepartment.department_code
//       ) {
//         const deptWithCode = await DepartmentModel.findByCode(
//           updateData.department_code
//         );
//         if (deptWithCode) {
//           return sendError(res, "Department code already exists", 400);
//         }
//       }

//       const updatedDepartment = await DepartmentModel.update(
//         parseInt(id),
//         updateData
//       );
//       return sendSuccess(
//         res,
//         "Department updated successfully",
//         updatedDepartment
//       );
//     } catch (error) {
//       console.error("Update department error:", error);
//       return sendError(res, "Failed to update department", 400);
//     }
//   }

//   // Delete department
//   static async deleteDepartment(req, res) {
//     try {
//       const { id } = req.params;

//       // Check if department exists
//       const existingDepartment = await DepartmentModel.findById(parseInt(id));
//       if (!existingDepartment) {
//         return sendError(res, "Department not found", 404);
//       }

//       await DepartmentModel.delete(parseInt(id));
//       return sendSuccess(res, "Department deleted successfully");
//     } catch (error) {
//       console.error("Delete department error:", error);
//       return sendError(res, "Failed to delete department", 500);
//     }
//   }

//   // Get department statistics
//   static async getDepartmentStats(req, res) {
//     try {
//       const { id } = req.params;

//       // Check if department exists
//       const existingDepartment = await DepartmentModel.findById(parseInt(id));
//       if (!existingDepartment) {
//         return sendError(res, "Department not found", 404);
//       }

//       const stats = await DepartmentModel.getStatistics();
//       const deptStats = stats.find(
//         (stat) => stat.department_id === parseInt(id)
//       );

//       return sendSuccess(res, "Department statistics retrieved", deptStats);
//     } catch (error) {
//       console.error("Get department stats error:", error);
//       return sendError(res, "Failed to get department statistics", 500);
//     }
//   }

//   // Assign head to department
//   static async assignHead(req, res) {
//     try {
//       const { id } = req.params;
//       const { user_id } = req.body;

//       if (!user_id) {
//         return sendError(res, "User ID is required", 400);
//       }

//       const department = await DepartmentModel.assignHead(
//         parseInt(id),
//         parseInt(user_id)
//       );
//       return sendSuccess(
//         res,
//         "Department head assigned successfully",
//         department
//       );
//     } catch (error) {
//       console.error("Assign head error:", error);
//       return sendError(res, "Failed to assign department head", 400);
//     }
//   }
// }

// export default DepartmentController;
import DepartmentModel from "../models/DepartmentModel.js";
import StaffModel from "../models/StaffModel.js";
import { query } from "../config/database.js";
import { sendSuccess, sendError } from "../utils/response.js";

class DepartmentController {
  // ==================== CORE CRUD OPERATIONS ====================

  // Get all departments
  static async getAllDepartments(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await DepartmentModel.findAll(
        parseInt(page),
        parseInt(limit)
      );
      return sendSuccess(res, "Departments retrieved successfully", result);
    } catch (error) {
      console.error("Get departments error:", error);
      return sendError(res, "Failed to retrieve departments", 500);
    }
  }

  // Get departments by college
  static async getDepartmentsByCollege(req, res) {
    try {
      const { collegeId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await DepartmentModel.findByCollege(
        parseInt(collegeId),
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(res, "Departments retrieved successfully", result);
    } catch (error) {
      console.error("Get departments by college error:", error);
      return sendError(res, "Failed to retrieve departments", 500);
    }
  }

  // Get department by ID
  static async getDepartmentById(req, res) {
    try {
      const { id } = req.params;
      const department = await DepartmentModel.findById(parseInt(id));

      if (!department) {
        return sendError(res, "Department not found", 404);
      }

      return sendSuccess(res, "Department retrieved successfully", department);
    } catch (error) {
      console.error("Get department error:", error);
      return sendError(res, "Failed to retrieve department", 500);
    }
  }

  // Create department
  static async createDepartment(req, res) {
    try {
      const {
        department_code,
        department_name,
        college_id,
        head_user_id,
        status,
      } = req.body;

      // Validate required fields
      if (!department_code || !department_name || !college_id) {
        return sendError(
          res,
          "Department code, name, and college ID are required",
          400
        );
      }

      // Check if department code already exists
      const existingDepartment = await DepartmentModel.findByCode(
        department_code
      );
      if (existingDepartment) {
        return sendError(res, "Department code already exists", 400);
      }

      const department = await DepartmentModel.create({
        department_code,
        department_name,
        college_id: parseInt(college_id),
        head_user_id: head_user_id ? parseInt(head_user_id) : null,
        status: status || "active",
      });

      return sendSuccess(
        res,
        "Department created successfully",
        department,
        201
      );
    } catch (error) {
      console.error("Create department error:", error);
      return sendError(res, "Failed to create department", 400);
    }
  }

  // Update department
  static async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if department exists
      const existingDepartment = await DepartmentModel.findById(parseInt(id));
      if (!existingDepartment) {
        return sendError(res, "Department not found", 404);
      }

      // If user is department_head, check if they're the head of this department
      if (req.user.role === "department_head") {
        const userStaff = await import("../models/StaffModel.js").then((m) =>
          m.default.findByUserId(req.user.user_id)
        );
        if (!userStaff || userStaff.department_id !== parseInt(id)) {
          return sendError(res, "You can only update your own department", 403);
        }
      }

      // If updating department code, check for duplicates
      if (
        updateData.department_code &&
        updateData.department_code !== existingDepartment.department_code
      ) {
        const deptWithCode = await DepartmentModel.findByCode(
          updateData.department_code
        );
        if (deptWithCode) {
          return sendError(res, "Department code already exists", 400);
        }
      }

      const updatedDepartment = await DepartmentModel.update(
        parseInt(id),
        updateData
      );
      return sendSuccess(
        res,
        "Department updated successfully",
        updatedDepartment
      );
    } catch (error) {
      console.error("Update department error:", error);
      return sendError(res, "Failed to update department", 400);
    }
  }

  // Delete department
  static async deleteDepartment(req, res) {
    try {
      const { id } = req.params;

      // Check if department exists
      const existingDepartment = await DepartmentModel.findById(parseInt(id));
      if (!existingDepartment) {
        return sendError(res, "Department not found", 404);
      }

      await DepartmentModel.delete(parseInt(id));
      return sendSuccess(res, "Department deleted successfully");
    } catch (error) {
      console.error("Delete department error:", error);
      return sendError(res, "Failed to delete department", 500);
    }
  }

  // Get department statistics
  static async getDepartmentStats(req, res) {
    try {
      const { id } = req.params;

      // Check if department exists
      const existingDepartment = await DepartmentModel.findById(parseInt(id));
      if (!existingDepartment) {
        return sendError(res, "Department not found", 404);
      }

      const stats = await DepartmentModel.getStatistics();
      const deptStats = stats.find(
        (stat) => stat.department_id === parseInt(id)
      );

      return sendSuccess(res, "Department statistics retrieved", deptStats);
    } catch (error) {
      console.error("Get department stats error:", error);
      return sendError(res, "Failed to get department statistics", 500);
    }
  }

  // Assign head to department
  static async assignHead(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.body;

      if (!user_id) {
        return sendError(res, "User ID is required", 400);
      }

      const department = await DepartmentModel.assignHead(
        parseInt(id),
        parseInt(user_id)
      );
      return sendSuccess(
        res,
        "Department head assigned successfully",
        department
      );
    } catch (error) {
      console.error("Assign head error:", error);
      return sendError(res, "Failed to assign department head", 400);
    }
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  // Get department dashboard
  static async getDepartmentDashboard(req, res) {
    try {
      const { id } = req.params;
      const { time_range = "current_semester" } = req.query;

      // Check if department exists
      const existingDepartment = await DepartmentModel.findById(parseInt(id));
      if (!existingDepartment) {
        return sendError(res, "Department not found", 404);
      }

      const dashboardData = await DepartmentModel.getDashboardData(
        parseInt(id),
        time_range
      );

      return sendSuccess(
        res,
        "Department dashboard data retrieved",
        dashboardData
      );
    } catch (error) {
      console.error("Get department dashboard error:", error);
      return sendError(res, "Failed to get department dashboard", 500);
    }
  }

  // Get department staff list
  static async getDepartmentStaff(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Check if department exists
      const existingDepartment = await DepartmentModel.findById(parseInt(id));
      if (!existingDepartment) {
        return sendError(res, "Department not found", 404);
      }

      const result = await DepartmentModel.getDepartmentStaff(
        parseInt(id),
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(
        res,
        "Department staff retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Get department staff error:", error);
      return sendError(res, "Failed to get department staff", 500);
    }
  }

  // Get department courses
  static async getDepartmentCourses(req, res) {
    try {
      const { id } = req.params;
      const { semester_id } = req.query;

      // Check if department exists
      const existingDepartment = await DepartmentModel.findById(parseInt(id));
      if (!existingDepartment) {
        return sendError(res, "Department not found", 404);
      }

      const result = await DepartmentModel.getDepartmentCourses(
        parseInt(id),
        semester_id ? parseInt(semester_id) : null
      );

      return sendSuccess(
        res,
        "Department courses retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Get department courses error:", error);
      return sendError(res, "Failed to get department courses", 500);
    }
  }

  // Get department workload summary
  static async getDepartmentWorkloadSummary(req, res) {
    try {
      const { id } = req.params;
      const { semester_id } = req.query;

      // Check if department exists
      const existingDepartment = await DepartmentModel.findById(parseInt(id));
      if (!existingDepartment) {
        return sendError(res, "Department not found", 404);
      }

      const result = await DepartmentModel.getWorkloadSummary(
        parseInt(id),
        semester_id ? parseInt(semester_id) : null
      );

      return sendSuccess(res, "Workload summary retrieved", result);
    } catch (error) {
      console.error("Get workload summary error:", error);
      return sendError(res, "Failed to get workload summary", 500);
    }
  }

  // ==================== ADDITIONAL OPERATIONS ====================

  // Export department data
  static async exportDepartmentData(req, res) {
    try {
      const { id } = req.params;
      const { format = "json" } = req.query;

      // Check if department exists
      const existingDepartment = await DepartmentModel.findById(parseInt(id));
      if (!existingDepartment) {
        return sendError(res, "Department not found", 404);
      }

      // Get comprehensive department data
      const department = await DepartmentModel.findById(parseInt(id));
      const staff = await DepartmentModel.getDepartmentStaff(
        parseInt(id),
        1,
        1000
      );
      const courses = await DepartmentModel.getDepartmentCourses(parseInt(id));
      const stats = await DepartmentModel.getDetailedStatistics(parseInt(id));

      const exportData = {
        department,
        staff: staff.staff,
        courses: courses.courses,
        statistics: stats,
        exported_at: new Date().toISOString(),
        exported_by: req.user.user_id,
      };

      if (format === "csv") {
        // Convert to CSV (simplified example)
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="department-${id}-${Date.now()}.csv"`
        );
        // CSV conversion logic here
        return res.status(200).send(JSON.stringify(exportData));
      } else {
        // Default to JSON
        return sendSuccess(res, "Department data exported", exportData);
      }
    } catch (error) {
      console.error("Export department data error:", error);
      return sendError(res, "Failed to export department data", 500);
    }
  }

  // Advanced search
  static async advancedSearch(req, res) {
    try {
      const {
        query: searchQuery,
        college_id,
        status,
        has_head,
        min_staff_count,
        max_staff_count,
        created_after,
        created_before,
        sort_by = "department_name",
        order = "asc",
        page = 1,
        limit = 20,
      } = req.query;

      const { query } = await import("../config/database.js");

      let sql = `
        SELECT 
          d.*,
          c.college_name,
          u.username as head_username,
          (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) as staff_count,
          (SELECT COUNT(*) FROM courses WHERE department_id = d.department_id) as course_count
        FROM departments d
        LEFT JOIN colleges c ON d.college_id = c.college_id
        LEFT JOIN users u ON d.head_user_id = u.user_id
        WHERE 1=1
      `;

      const params = [];

      if (searchQuery) {
        sql += ` AND (d.department_code LIKE ? OR d.department_name LIKE ?)`;
        params.push(`%${searchQuery}%`, `%${searchQuery}%`);
      }

      if (college_id) {
        sql += ` AND d.college_id = ?`;
        params.push(college_id);
      }

      if (status) {
        sql += ` AND d.status = ?`;
        params.push(status);
      }

      if (has_head === "true") {
        sql += ` AND d.head_user_id IS NOT NULL`;
      } else if (has_head === "false") {
        sql += ` AND d.head_user_id IS NULL`;
      }

      if (min_staff_count) {
        sql += ` AND (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) >= ?`;
        params.push(min_staff_count);
      }

      if (max_staff_count) {
        sql += ` AND (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) <= ?`;
        params.push(max_staff_count);
      }

      if (created_after) {
        sql += ` AND d.created_at >= ?`;
        params.push(created_after);
      }

      if (created_before) {
        sql += ` AND d.created_at <= ?`;
        params.push(created_before);
      }

      // Validate sort field
      const validSortFields = [
        "department_id",
        "department_code",
        "department_name",
        "college_name",
        "staff_count",
        "course_count",
        "created_at",
      ];

      const sortField = validSortFields.includes(sort_by)
        ? sort_by
        : "department_name";
      const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

      sql += ` ORDER BY ${
        sortField === "college_name" ? "c.college_name" : `d.${sortField}`
      } ${sortOrder}`;

      // Add pagination
      const offset = (page - 1) * limit;
      sql += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const departments = await query(sql, params);

      // Get total count
      const countSql = sql
        .replace(/SELECT .* FROM/, "SELECT COUNT(*) as total FROM")
        .replace(/LIMIT \? OFFSET \?/, "");
      const countParams = params.slice(0, -2);
      const totalResult = await query(countSql, countParams);
      const total = totalResult[0].total;

      return sendSuccess(res, "Advanced search completed", {
        departments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Advanced search error:", error);
      return sendError(res, "Failed to perform search", 500);
    }
  }

  // Update department status
  static async updateDepartmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["active", "inactive"].includes(status)) {
        return sendError(res, "Status must be 'active' or 'inactive'", 400);
      }

      // Check if department exists
      const existingDepartment = await DepartmentModel.findById(parseInt(id));
      if (!existingDepartment) {
        return sendError(res, "Department not found", 404);
      }

      const updated = await DepartmentModel.update(parseInt(id), { status });

      return sendSuccess(
        res,
        `Department ${
          status === "active" ? "activated" : "deactivated"
        } successfully`,
        updated
      );
    } catch (error) {
      console.error("Update status error:", error);
      return sendError(res, "Failed to update department status", 500);
    }
  }

  // Merge departments
  static async mergeDepartments(req, res) {
    try {
      const { source_department_id, target_department_id } = req.body;

      if (!source_department_id || !target_department_id) {
        return sendError(
          res,
          "Source and target department IDs are required",
          400
        );
      }

      if (source_department_id === target_department_id) {
        return sendError(
          res,
          "Source and target departments cannot be the same",
          400
        );
      }

      const { query } = await import("../config/database.js");

      // Start transaction
      await query("START TRANSACTION");

      try {
        // Merge staff
        await query(
          "UPDATE staff_profiles SET department_id = ? WHERE department_id = ?",
          [target_department_id, source_department_id]
        );

        // Merge courses
        await query(
          "UPDATE courses SET department_id = ? WHERE department_id = ?",
          [target_department_id, source_department_id]
        );

        // Merge programs
        await query(
          "UPDATE programs SET department_id = ? WHERE department_id = ?",
          [target_department_id, source_department_id]
        );

        // Archive source department
        await query(
          "UPDATE departments SET status = 'inactive', updated_at = NOW() WHERE department_id = ?",
          [source_department_id]
        );

        await query("COMMIT");

        return sendSuccess(res, "Departments merged successfully");
      } catch (error) {
        await query("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error("Merge departments error:", error);
      return sendError(res, "Failed to merge departments", 500);
    }
  }

  // Bulk update departments
  static async bulkUpdateDepartments(req, res) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return sendError(res, "Updates array is required", 400);
      }

      const results = [];
      for (const update of updates) {
        try {
          const result = await DepartmentModel.update(update.id, update.data);
          results.push({ id: update.id, success: true, data: result });
        } catch (error) {
          results.push({ id: update.id, success: false, error: error.message });
        }
      }

      return sendSuccess(res, "Bulk update completed", results);
    } catch (error) {
      console.error("Bulk update error:", error);
      return sendError(res, "Failed to perform bulk update", 500);
    }
  }

  // Add to your department controller (src/controllers/DepartmentController.js)
  static async getMyDepartment(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head") {
        return sendError(
          res,
          "Only department heads can access this endpoint",
          403
        );
      }

      // Find the staff profile for the user
      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(
          res,
          "Staff profile not found. Please contact admin.",
          404
        );
      }

      // Get department details
      const department = await DepartmentModel.findById(staff.department_id);
      if (!department) {
        return sendError(
          res,
          "Department not found. Please contact admin.",
          404
        );
      }

      // Get additional statistics
      const [staffCount] = await query(
        `SELECT COUNT(*) as staff_count FROM staff_profiles sp
       LEFT JOIN users u ON sp.user_id = u.user_id
       WHERE sp.department_id = ? AND u.is_active = TRUE AND u.role = 'instructor'`,
        [department.department_id]
      );

      const [courseCount] = await query(
        `SELECT COUNT(*) as course_count FROM courses 
       WHERE department_id = ? AND status = 'active'`,
        [department.department_id]
      );

      const [activeSemester] = await query(
        `SELECT semester_id, semester_name, semester_code FROM semesters 
       WHERE is_active = TRUE LIMIT 1`
      );

      const enrichedDepartment = {
        ...department,
        statistics: {
          staff_count: staffCount?.staff_count || 0,
          course_count: courseCount?.course_count || 0,
          active_semester: activeSemester || null,
        },
        head_info: {
          staff_id: staff.staff_id,
          first_name: staff.first_name,
          last_name: staff.last_name,
          employee_id: staff.employee_id,
          academic_rank: staff.academic_rank,
        },
      };

      return sendSuccess(
        res,
        "Department retrieved successfully",
        enrichedDepartment
      );
    } catch (error) {
      console.error("Get my department error:", error);
      return sendError(res, "Failed to retrieve department", 500);
    }
  }

  // Add this method to src/controllers/DepartmentController.js

  // Get current department head's department
  static async getMyDepartment(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      console.log("🔍 Getting department for user:", { user_id, user_role });

      // Only department heads can access this
      if (user_role !== "department_head") {
        return sendError(
          res,
          "Only department heads can access this endpoint",
          403
        );
      }

      // Find the staff profile for the user
      const staff = await StaffModel.findByUserId(user_id);

      if (!staff) {
        console.log("❌ Staff profile not found for user:", user_id);
        return sendError(
          res,
          "Staff profile not found. Please contact admin to create your staff profile.",
          404
        );
      }

      console.log("👨‍🏫 Found staff profile:", {
        staff_id: staff.staff_id,
        department_id: staff.department_id,
        name: `${staff.first_name} ${staff.last_name}`,
      });

      // Get department details
      const department = await DepartmentModel.findById(staff.department_id);

      if (!department) {
        console.log("❌ Department not found for ID:", staff.department_id);
        return sendError(
          res,
          "Department not found. Please contact admin.",
          404
        );
      }

      console.log("🏫 Found department:", {
        department_id: department.department_id,
        name: department.department_name,
        code: department.department_code,
      });

      // Get additional statistics
      const [staffCount] = await query(
        `SELECT COUNT(*) as staff_count FROM staff_profiles sp
       LEFT JOIN users u ON sp.user_id = u.user_id
       WHERE sp.department_id = ? AND u.is_active = TRUE AND u.role = 'instructor'`,
        [department.department_id]
      );

      const [courseCount] = await query(
        `SELECT COUNT(*) as course_count FROM courses 
       WHERE department_id = ? AND status = 'active'`,
        [department.department_id]
      );

      // Get active semester
      const [activeSemester] = await query(
        `SELECT semester_id, semester_name, semester_code FROM semesters 
       WHERE is_active = TRUE LIMIT 1`
      );

      // Get current assignments count for active semester
      let assignmentCount = 0;
      if (activeSemester) {
        const [assignments] = await query(
          `SELECT COUNT(*) as assignment_count FROM course_assignments ca
         LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
         WHERE ca.semester_id = ? AND sp.department_id = ?`,
          [activeSemester.semester_id, department.department_id]
        );
        assignmentCount = assignments?.assignment_count || 0;
      }

      const enrichedDepartment = {
        ...department,
        statistics: {
          staff_count: staffCount?.staff_count || 0,
          course_count: courseCount?.course_count || 0,
          assignment_count: assignmentCount,
          active_semester: activeSemester || null,
        },
        head_info: {
          staff_id: staff.staff_id,
          first_name: staff.first_name,
          last_name: staff.last_name,
          employee_id: staff.employee_id,
          academic_rank: staff.academic_rank,
        },
      };

      console.log(
        "✅ Department retrieved successfully:",
        enrichedDepartment.department_name
      );
      return sendSuccess(
        res,
        "Department retrieved successfully",
        enrichedDepartment
      );
    } catch (error) {
      console.error("❌ Get my department error:", error);
      return sendError(res, "Failed to retrieve department", 500);
    }
  }
}

export default DepartmentController;