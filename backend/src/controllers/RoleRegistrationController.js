import UserModel from "../models/UserModel.js";
import StaffModel from "../models/StaffModel.js";
import CollegeModel from "../models/CollegeModel.js";
import DepartmentModel from "../models/DepartmentModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {
  ROLE_CREATION_HIERARCHY,
  VALID_ACADEMIC_RANKS,
} from "../config/constants.js";
import bcrypt from "bcryptjs";
import { getConnection } from "../config/database.js";

class RoleRegistrationController {
  // Create user following Phase 1 hierarchy
  static async createUserByRole(req, res) {
    let connection = null;

    try {
      const currentUser = req.user;
      const userData = req.body;

      console.log("Creating user with data:", userData);
      console.log("Current user role:", currentUser.role);

      // ========== STEP 1: VALIDATE ALL INPUTS ==========

      // Validate required fields
      const requiredFields = ["username", "email", "password", "role"];
      const missingFields = requiredFields.filter((field) => !userData[field]);

      if (missingFields.length > 0) {
        return sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
      }

      // Check if current user can create this role
      if (!UserModel.canCreateRole(currentUser.role, userData.role)) {
        return sendError(
          res,
          `Role ${currentUser.role} cannot create users with role ${userData.role}`,
          403
        );
      }

      // Additional validation for academic roles
      const academicRoles = [
        "instructor",
        "department_head",
        "dean",
        "cde_director",
        "hr_director",
        "vpaa",
        "vpaf",
      ];
      if (academicRoles.includes(userData.role)) {
        if (
          !userData.first_name ||
          !userData.last_name ||
          !userData.department_id
        ) {
          return sendError(
            res,
            "First name, last name, and department are required for academic staff",
            400
          );
        }
      }

      // For dean role, check if college_id is provided
      if (userData.role === "dean" && !userData.college_id) {
        return sendError(res, "College ID is required for dean role", 400);
      }

      // Check for duplicate username/email
      const usernameExists = await UserModel.usernameExists(userData.username);
      const emailExists = await UserModel.emailExists(userData.email);

      if (usernameExists) {
        return sendError(res, "Username already exists", 400);
      }

      if (emailExists) {
        return sendError(res, "Email already exists", 400);
      }

      // Academic rank validation
      if (userData.role === "instructor") {
        if (!userData.academic_rank) {
          return sendError(
            res,
            "Academic rank is required for instructors",
            400
          );
        }

        // Normalize and validate academic rank
        const rank = userData.academic_rank.toLowerCase().trim();
        if (!VALID_ACADEMIC_RANKS.includes(rank)) {
          return sendError(
            res,
            `Invalid academic rank. Must be one of: ${VALID_ACADEMIC_RANKS.join(
              ", "
            )}`,
            400
          );
        }
        userData.normalizedAcademicRank = rank;
      } else if (userData.academic_rank) {
        // For non-instructor roles, validate if provided
        const rank = userData.academic_rank.toLowerCase().trim();
        if (!VALID_ACADEMIC_RANKS.includes(rank)) {
          return sendError(
            res,
            `Invalid academic rank. Must be one of: ${VALID_ACADEMIC_RANKS.join(
              ", "
            )}`,
            400
          );
        }
        userData.normalizedAcademicRank = rank;
      }

      // ========== STEP 2: GET DATABASE CONNECTION AND START TRANSACTION ==========

      connection = await getConnection();
      await connection.beginTransaction();
      console.log("Transaction started");

      // ========== STEP 3: CREATE USER WITHIN TRANSACTION ==========

      try {
        // Hash password
        const password_hash = await bcrypt.hash(userData.password, 10);

        // Create user
        const [userResult] = await connection.execute(
          `INSERT INTO users (username, email, password_hash, role, is_active, created_by) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userData.username,
            userData.email,
            password_hash,
            userData.role,
            true,
            currentUser.user_id,
          ]
        );

        const userId = userResult.insertId;
        console.log("User created with ID:", userId);

        // ========== STEP 4: CREATE STAFF PROFILE (IF APPLICABLE) ==========

        let staffProfile = null;
        if (academicRoles.includes(userData.role)) {
          // Prepare staff data
          const staffData = {
            user_id: userId,
            employee_id:
              userData.employee_id || `EMP${Date.now().toString().slice(-6)}`,
            first_name: userData.first_name,
            last_name: userData.last_name,
            department_id: userData.department_id,
            academic_rank: userData.normalizedAcademicRank || null,
            employment_type: userData.employment_type || "full_time",
            created_by: currentUser.user_id,
          };

          // Add optional fields
          const optionalFields = [
            "middle_name",
            "hire_date",
            "phone",
            "address",
            "date_of_birth",
            "gender",
          ];
          optionalFields.forEach((field) => {
            if (userData[field]) staffData[field] = userData[field];
          });

          // Insert staff profile
          const [staffResult] = await connection.execute(
            `INSERT INTO staff_profiles 
             (user_id, employee_id, first_name, last_name, department_id, academic_rank, employment_type,
              middle_name, hire_date, phone, address, date_of_birth, gender, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              staffData.user_id,
              staffData.employee_id,
              staffData.first_name,
              staffData.last_name,
              staffData.department_id,
              staffData.academic_rank,
              staffData.employment_type,
              staffData.middle_name || null,
              staffData.hire_date || null,
              staffData.phone || null,
              staffData.address || null,
              staffData.date_of_birth || null,
              staffData.gender || null,
              staffData.created_by,
            ]
          );

          staffProfile = {
            staff_id: staffResult.insertId,
            ...staffData,
          };

          console.log("Staff profile created with ID:", staffResult.insertId);
        }

        // ========== STEP 5: UPDATE DEPARTMENT/COLLEGE TABLES ==========

        // If role is department_head, update department table
        if (userData.role === "department_head" && userData.department_id) {
          await connection.execute(
            `UPDATE departments SET head_user_id = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE department_id = ?`,
            [userId, userData.department_id]
          );
          console.log("Department head assigned");
        }

        // If role is dean, update college table
        if (userData.role === "dean" && userData.college_id) {
          await connection.execute(
            `UPDATE colleges SET dean_user_id = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE college_id = ?`,
            [userId, userData.college_id]
          );
          console.log("Dean assigned");
        }

        // ========== STEP 6: COMMIT TRANSACTION ==========

        await connection.commit();
        console.log("Transaction committed successfully");

        return sendSuccess(
          res,
          `User created successfully with role ${userData.role}`,
          {
            user: {
              user_id: userId,
              username: userData.username,
              email: userData.email,
              role: userData.role,
              is_active: true,
              created_by: currentUser.user_id,
            },
            staff_profile: staffProfile,
            created_at: new Date().toISOString(),
          },
          201
        );
      } catch (transactionError) {
        // Rollback if any error occurs in the transaction
        await connection.rollback();
        throw transactionError;
      }
    } catch (error) {
      console.error("Create user error:", error);
      return sendError(res, error.message || "User creation failed", 400);
    } finally {
      // ========== STEP 7: RELEASE CONNECTION ==========

      if (connection) {
        try {
          connection.release();
          console.log("Connection released");
        } catch (releaseError) {
          console.error("Error releasing connection:", releaseError);
        }
      }
    }
  }

  // Get all roles that admin can create
  static async getAdminCreatableRoles(req, res) {
    try {
      const currentUser = req.user;

      if (currentUser.role !== "admin") {
        return sendError(res, "Only admin can view creatable roles", 403);
      }

      return sendSuccess(res, "Admin creatable roles", {
        roles: ROLE_CREATION_HIERARCHY.admin,
        description: "Admin can create all roles in the system",
      });
    } catch (error) {
      console.error("Get admin creatable roles error:", error);
      return sendError(res, "Failed to get creatable roles", 500);
    }
  }

  // Test endpoint: Create any role as admin
  static async adminCreateAnyRole(req, res) {
    try {
      const currentUser = req.user;

      if (currentUser.role !== "admin") {
        return sendError(res, "Only admin can use this endpoint", 403);
      }

      // Forward to createUserByRole
      return RoleRegistrationController.createUserByRole(req, res);
    } catch (error) {
      console.error("Admin create any role error:", error);
      return sendError(res, error.message || "Failed to create user", 400);
    }
  }

  // Get users I have created
  static async getMyCreatedUsers(req, res) {
    try {
      const currentUser = req.user;
      const { page = 1, limit = 20, role } = req.query;

      const result = await UserModel.findAll(parseInt(page), parseInt(limit), {
        created_by: currentUser.user_id,
        role,
      });

      return sendSuccess(res, "Created users retrieved successfully", result);
    } catch (error) {
      console.error("Get created users error:", error);
      return sendError(res, "Failed to retrieve created users", 500);
    }
  }

  // Get users by role (for HR Director to see all instructors, etc.)
  static async getUsersByRole(req, res) {
    try {
      const currentUser = req.user;
      const { role } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Check if current user has permission to view this role's users
      if (
        !RoleRegistrationController.canViewRoleUsers(currentUser.role, role)
      ) {
        return sendError(
          res,
          `You don't have permission to view users with role ${role}`,
          403
        );
      }

      const result = await UserModel.findAll(parseInt(page), parseInt(limit), {
        role,
        is_active: true,
      });

      return sendSuccess(res, `Users with role ${role} retrieved`, result);
    } catch (error) {
      console.error("Get users by role error:", error);
      return sendError(res, "Failed to retrieve users", 500);
    }
  }

  // Get role creation statistics
  static async getRoleStats(req, res) {
    try {
      const currentUser = req.user;

      if (!["admin", "vpaa", "hr_director"].includes(currentUser.role)) {
        return sendError(res, "Access denied", 403);
      }

      const stats = await UserModel.getRoleCreationStats();

      return sendSuccess(res, "Role statistics retrieved", stats);
    } catch (error) {
      console.error("Get role stats error:", error);
      return sendError(res, "Failed to get role statistics", 500);
    }
  }

  // Get my role creation permissions
  static async getMyPermissions(req, res) {
    try {
      const currentUser = req.user;
      const allowedRoles = ROLE_CREATION_HIERARCHY[currentUser.role] || [];

      return sendSuccess(res, "Role creation permissions", {
        my_role: currentUser.role,
        can_create_roles: allowedRoles,
        description: RoleRegistrationController.getRoleCreationDescription(
          currentUser.role
        ),
      });
    } catch (error) {
      console.error("Get permissions error:", error);
      return sendError(res, "Failed to get permissions", 500);
    }
  }

  // Get Phase 1 setup status
  static async getPhase1Status(req, res) {
    try {
      const currentUser = req.user;

      if (currentUser.role !== "admin") {
        return sendError(res, "Only admin can view Phase 1 status", 403);
      }

      // Get counts for each role in Phase 1
      const roles = [
        "vpaa",
        "hr_director",
        "finance",
        "cde_director",
        "dean",
        "registrar",
        "department_head",
        "instructor",
      ];

      const status = {};

      for (const role of roles) {
        const users = await UserModel.findByRole(role);
        status[role] = {
          required: RoleRegistrationController.getRequiredCountForRole(role),
          created: users.length,
          users: users.slice(0, 5).map((u) => ({
            username: u.username,
            email: u.email,
            created_at: u.created_at,
          })),
        };
      }

      return sendSuccess(res, "Phase 1 setup status", {
        status,
        phase_completion:
          RoleRegistrationController.calculatePhaseCompletion(status),
        last_updated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get Phase 1 status error:", error);
      return sendError(res, "Failed to get Phase 1 status", 500);
    }
  }

  // Helper method: Check if role can view other role's users
  static canViewRoleUsers(viewerRole, targetRole) {
    const permissions = {
      admin: ["all"],
      vpaa: ["dean", "registrar"],
      hr_director: ["instructor"],
      dean: ["department_head"],
      department_head: ["instructor"], // Department heads can view instructors in their department
    };

    return (
      permissions[viewerRole]?.includes(targetRole) ||
      permissions[viewerRole]?.includes("all") ||
      viewerRole === "admin"
    );
  }

  // Helper method: Get role creation description
  static getRoleCreationDescription(role) {
    const descriptions = {
      admin:
        "System Administrator: Can create all administrative roles (VPAA, HR Director, Finance, CDE Director)",
      vpaa: "Vice President Academic Affairs: Creates College Deans and Registrar",
      dean: "College Dean: Creates Department Heads within their college",
      hr_director:
        "HR Director: Creates all teaching staff (instructors) with academic ranks",
      department_head: "Department Head: Cannot create other users (view only)",
      instructor: "Instructor: Cannot create other users",
      registrar: "Registrar: Cannot create other users in Phase 1",
    };

    return descriptions[role] || "No user creation permissions";
  }

  // Helper method: Get required count for role
  static getRequiredCountForRole(role) {
    const requirements = {
      vpaa: 1,
      hr_director: 1,
      finance: 1,
      cde_director: 1,
      registrar: 1,
      dean: "At least 1 per college",
      department_head: "At least 1 per department",
      instructor: "Varies by department needs",
    };

    return requirements[role] || 0;
  }

  // Helper method: Calculate phase completion percentage
  static calculatePhaseCompletion(status) {
    const requiredRoles = [
      "vpaa",
      "hr_director",
      "finance",
      "cde_director",
      "registrar",
    ];
    let completed = 0;

    for (const role of requiredRoles) {
      if (status[role]?.created > 0) {
        completed++;
      }
    }

    return {
      percentage: Math.round((completed / requiredRoles.length) * 100),
      completed,
      total: requiredRoles.length,
      missing_roles: requiredRoles.filter(
        (role) => !status[role]?.created || status[role].created === 0
      ),
    };
  }
}

export default RoleRegistrationController;
