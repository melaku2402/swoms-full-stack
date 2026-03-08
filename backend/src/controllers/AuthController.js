import UserModel from "../models/UserModel.js";
import StaffModel from "../models/StaffModel.js";
import { generateToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {
  ROLES,
  CAN_REGISTER_USERS,
  ACADEMIC_STAFF_ROLES,
  ADMIN_CREATABLE_ROLES,
  REGISTRAR_CREATABLE_ROLES,
  HR_CREATABLE_ROLES,
} from "../config/constants.js";
import bcrypt from "bcryptjs";
class AuthController {
  // LOGIN ONLY - NO REGISTRATION
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return sendError(res, "Username and password are required", 400);
      }

      // Find user by username or email
      const user = await UserModel.findByUsernameOrEmail(username);
      if (!user) {
        return sendError(res, "Invalid username or password", 401);
      }

      // Check if user is active
      if (!user.is_active) {
        return sendError(
          res,
          "Account is deactivated. Please contact HR Directorate.",
          401
        );
      }

      // Verify password
      const isValidPassword = await UserModel.verifyPassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return sendError(res, "Invalid username or password", 401);
      }

      // Update last login
      await UserModel.updateLastLogin(user.user_id);

      // Get staff profile if exists
      let staffProfile = null;
      if (ACADEMIC_STAFF_ROLES.includes(user.role)) {
        staffProfile = await StaffModel.findByUserId(user.user_id);
      }

      // Generate token
      const token = generateToken({
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      });

      // Remove password from response
      delete user.password_hash;

      return sendSuccess(res, "Login successful", {
        user,
        staff_profile: staffProfile,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      return sendError(res, "Login failed", 400);
    }
  }

  // // CREATE USER - Admin/Registrar/HR only
  // static async createUser(req, res) {
  //   try {
  //     const currentUser = req.user;
  //     const { username, email, password, role, ...staffData } = req.body;

  //     // Check if current user can create users
  //     if (!CAN_REGISTER_USERS.includes(currentUser.role)) {
  //       return sendError(
  //         res,
  //         "You do not have permission to create users",
  //         403
  //       );
  //     }

  //     // Validate required fields
  //     if (!username || !email || !password || !role) {
  //       return sendError(
  //         res,
  //         "Username, email, password, and role are required",
  //         400
  //       );
  //     }

  //     // Check allowed roles based on current user's role
  //     let allowedRoles = [];

  //     if (currentUser.role === ROLES.ADMIN) {
  //       allowedRoles = ADMIN_CREATABLE_ROLES;
  //     } else if (currentUser.role === ROLES.REGISTRAR) {
  //       allowedRoles = REGISTRAR_CREATABLE_ROLES;
  //     } else if (currentUser.role === ROLES.HR_DIRECTOR) {
  //       allowedRoles = HR_CREATABLE_ROLES;
  //     }

  //     // Check if requested role is allowed
  //     if (!allowedRoles.includes(role)) {
  //       return sendError(
  //         res,
  //         `You cannot create users with role: ${role}`,
  //         403
  //       );
  //     }

  //     // Check if username or email exists
  //     const usernameExists = await UserModel.usernameExists(username);
  //     const emailExists = await UserModel.emailExists(email);

  //     if (usernameExists) {
  //       return sendError(res, "Username already exists", 400);
  //     }

  //     if (emailExists) {
  //       return sendError(res, "Email already exists", 400);
  //     }

  //     // Validate staff data for academic roles
  //     if (ACADEMIC_STAFF_ROLES.includes(role)) {
  //       if (
  //         !staffData.first_name ||
  //         !staffData.last_name ||
  //         !staffData.department_id
  //       ) {
  //         return sendError(
  //           res,
  //           "First name, last name, and department are required for academic staff",
  //           400
  //         );
  //       }
  //     }

  //     // Validate for non-academic roles
  //     if (!ACADEMIC_STAFF_ROLES.includes(role)) {
  //       if (staffData.department_id) {
  //         return sendError(
  //           res,
  //           "Department is not applicable for non-academic staff",
  //           400
  //         );
  //       }
  //     }

  //     // Create user
  //     const user = await UserModel.create({
  //       username,
  //       email,
  //       password,
  //       role,
  //     });

  //     // Create staff profile for academic staff
  //     let staffProfile = null;
  //     if (ACADEMIC_STAFF_ROLES.includes(role)) {
  //       staffProfile = await StaffModel.create({
  //         user_id: user.user_id,
  //         employee_id: staffData.employee_id || `EMP${user.user_id}`,
  //         first_name: staffData.first_name,
  //         last_name: staffData.last_name,
  //         department_id: staffData.department_id,
  //         academic_rank: staffData.academic_rank || "lecturer",
  //         employment_type: staffData.employment_type || "full_time",
  //         middle_name: staffData.middle_name || null,
  //         hire_date: staffData.hire_date || null,
  //         phone: staffData.phone || null,
  //         address: staffData.address || null,
  //         date_of_birth: staffData.date_of_birth || null,
  //         gender: staffData.gender || null,
  //       });
  //     }

  //     return sendSuccess(
  //       res,
  //       "User created successfully",
  //       {
  //         user: {
  //           user_id: user.user_id,
  //           username: user.username,
  //           email: user.email,
  //           role: user.role,
  //           is_active: user.is_active,
  //         },
  //         staff_profile: staffProfile,
  //         created_by: currentUser.user_id,
  //         created_at: new Date().toISOString(),
  //       },
  //       201
  //     );
  //   } catch (error) {
  //     console.error("Create user error:", error);
  //     return sendError(res, error.message || "User creation failed", 400);
  //   }
  // }

  static async createUser(req, res) {
    try {
      const currentUser = req.user;
      const { username, email, password, role, staff_profile, ...otherData } =
        req.body;

      // Check if current user can create users
      if (!CAN_REGISTER_USERS.includes(currentUser.role)) {
        return sendError(
          res,
          "You do not have permission to create users",
          403
        );
      }

      // Validate required fields
      if (!username || !email || !password || !role) {
        return sendError(
          res,
          "Username, email, password, and role are required",
          400
        );
      }

      // Check allowed roles based on current user's role
      let allowedRoles = [];

      if (currentUser.role === ROLES.ADMIN) {
        allowedRoles = ADMIN_CREATABLE_ROLES;
      } else if (currentUser.role === ROLES.REGISTRAR) {
        allowedRoles = REGISTRAR_CREATABLE_ROLES;
      } else if (currentUser.role === ROLES.HR_DIRECTOR) {
        allowedRoles = HR_CREATABLE_ROLES;
      }

      // Check if requested role is allowed
      if (!allowedRoles.includes(role)) {
        return sendError(
          res,
          `You cannot create users with role: ${role}`,
          403
        );
      }

      // Check if username or email exists
      const usernameExists = await UserModel.usernameExists(username);
      const emailExists = await UserModel.emailExists(email);

      if (usernameExists) {
        return sendError(res, "Username already exists", 400);
      }

      if (emailExists) {
        return sendError(res, "Email already exists", 400);
      }

      // Handle both formats: nested staff_profile OR top-level fields
      let staffData = {};

      if (staff_profile) {
        // Format 1: Data nested in staff_profile
        staffData = staff_profile;
      } else {
        // Format 2: Data at top level (for backward compatibility)
        staffData = otherData;
      }

      // Validate staff data for academic roles
      if (ACADEMIC_STAFF_ROLES.includes(role)) {
        if (
          !staffData.first_name ||
          !staffData.last_name ||
          !staffData.department_id
        ) {
          return sendError(
            res,
            "First name, last name, and department are required for academic staff",
            400
          );
        }
      }

      // Validate for non-academic roles
      if (!ACADEMIC_STAFF_ROLES.includes(role)) {
        if (staffData.department_id) {
          return sendError(
            res,
            "Department is not applicable for non-academic staff",
            400
          );
        }
      }

      // Create user
      const user = await UserModel.create({
        username,
        email,
        password,
        role,
        created_by_id: currentUser.user_id, // Add created_by
      });

      // Create staff profile for academic staff
      let staffProfile = null;
      if (ACADEMIC_STAFF_ROLES.includes(role)) {
        staffProfile = await StaffModel.create({
          user_id: user.user_id,
          employee_id: staffData.employee_id || `EMP${user.user_id}`,
          first_name: staffData.first_name,
          last_name: staffData.last_name,
          department_id: staffData.department_id,
          academic_rank: staffData.academic_rank || "lecturer",
          employment_type: staffData.employment_type || "full_time",
          middle_name: staffData.middle_name || null,
          hire_date: staffData.hire_date || null,
          phone: staffData.phone || null,
          address: staffData.address || null,
          date_of_birth: staffData.date_of_birth || null,
          gender: staffData.gender || null,
        });
      }

      return sendSuccess(
        res,
        "User created successfully",
        {
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
          },
          staff_profile: staffProfile,
          created_by: currentUser.user_id,
          created_at: new Date().toISOString(),
        },
        201
      );
    } catch (error) {
      console.error("Create user error:", error);
      return sendError(res, error.message || "User creation failed", 400);
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.user_id;

      // Get user details
      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError(res, "User not found", 404);
      }

      // Get staff profile if exists
      let staffProfile = null;
      if (ACADEMIC_STAFF_ROLES.includes(user.role)) {
        staffProfile = await StaffModel.findByUserId(userId);
      }

      return sendSuccess(res, "Profile retrieved successfully", {
        user,
        staff_profile: staffProfile,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return sendError(res, "Failed to get profile", 400);
    }
  }

  // Update profile (user can update their own profile)
  static async updateProfile(req, res) {
    try {
      const userId = req.user.user_id;
      const updateData = req.body;

      // Don't allow role changes through profile update
      if (updateData.role) {
        delete updateData.role;
      }

      // Don't allow username/email changes for non-admin
      if (req.user.role !== ROLES.ADMIN) {
        delete updateData.username;
        delete updateData.email;
      }

      // Update user
      const updatedUser = await UserModel.update(userId, updateData);

      // If staff data provided and user is academic staff, update staff profile
      if (ACADEMIC_STAFF_ROLES.includes(req.user.role)) {
        const staffProfile = await StaffModel.findByUserId(userId);
        if (staffProfile) {
          await StaffModel.update(staffProfile.staff_id, updateData);
        }
      }

      return sendSuccess(res, "Profile updated successfully", {
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return sendError(res, "Failed to update profile", 400);
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const userId = req.user.user_id;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return sendError(
          res,
          "Current password and new password are required",
          400
        );
      }

      if (newPassword.length < 6) {
        return sendError(
          res,
          "New password must be at least 6 characters",
          400
        );
      }

      // Get user with password
      const user = await UserModel.findByUsernameOrEmail(req.user.username);

      // Verify current password
      const isValidPassword = await UserModel.verifyPassword(
        currentPassword,
        user.password_hash
      );
      if (!isValidPassword) {
        return sendError(res, "Current password is incorrect", 400);
      }

      // Update password
      const updatedUser = await UserModel.update(userId, {
        password: newPassword,
      });

      return sendSuccess(res, "Password changed successfully");
    } catch (error) {
      console.error("Change password error:", error);
      return sendError(res, "Failed to change password", 400);
    }
  }
  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      console.log(`🔍 Fetching user with ID: ${id}`);

      // Validate ID
      const userId = parseInt(id);
      if (isNaN(userId)) {
        return sendError(res, "Invalid user ID", 400);
      }

      // Check permissions
      const allowedRoles = ["admin", "registrar", "hr_director"];
      if (
        !allowedRoles.includes(currentUser.role) &&
        userId !== currentUser.user_id
      ) {
        return sendError(res, "Unauthorized to view this user", 403);
      }

      // Get user from database
      const user = await UserModel.findById(userId);

      if (!user) {
        return sendError(res, "User not found", 404);
      }

      // Get staff profile if exists
      let staffProfile = null;
      const rolesWithStaff = [
        "instructor",
        "department_head",
        "dean",
        "registrar",
        "hr_director",
      ];

      if (rolesWithStaff.includes(user.role)) {
        try {
          staffProfile = await StaffModel.findByUserId(userId);
        } catch (staffError) {
          console.log(`No staff profile for user ${userId}`);
        }
      }

      return sendSuccess(res, "User retrieved successfully", {
        ...user,
        staff_profile: staffProfile,
      });
    } catch (error) {
      console.error("❌ Get user by ID error:", error);
      return sendError(res, "Failed to retrieve user", 500);
    }
  }

  // USER STATS ENDPOINT
  static async getUserStats(req, res) {
    try {
      const currentUser = req.user;

      if (!["admin", "registrar", "hr_director"].includes(currentUser.role)) {
        return sendError(res, "Access denied", 403);
      }

      // Get all stats
      const [stats] = await query(`
        SELECT 
          COUNT(*) as total,
          SUM(is_active = 1) as active,
          SUM(role = 'instructor') as instructors,
          SUM(role = 'admin') as admins
        FROM users
      `);

      return sendSuccess(res, "User stats retrieved successfully", {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        instructors: parseInt(stats.instructors) || 0,
        admins: parseInt(stats.admins) || 0,
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      return sendError(res, "Failed to retrieve user stats", 500);
    }
  }

  // Admin/Registrar/HR: Get all users
  static async getAllUsers(req, res) {
    try {
      const currentUser = req.user;

      if (!CAN_REGISTER_USERS.includes(currentUser.role)) {
        return sendError(res, "Access denied", 403);
      }

      const {
        page = 1,
        limit = 20,
        role,
        department_id,
        is_active,
      } = req.query;

      // Build filter based on query parameters
      let filter = {};
      if (role) filter.role = role;
      if (is_active !== undefined) filter.is_active = is_active === "true";

      const result = await UserModel.findAll(
        parseInt(page),
        parseInt(limit),
        filter
      );

      // Get staff profiles for academic staff
      const usersWithProfiles = await Promise.all(
        result.users.map(async (user) => {
          if (ACADEMIC_STAFF_ROLES.includes(user.role)) {
            const staffProfile = await StaffModel.findByUserId(user.user_id);

            // Filter by department if specified
            if (department_id && staffProfile) {
              if (parseInt(department_id) === staffProfile.department_id) {
                return { ...user, staff_profile: staffProfile };
              }
              return null;
            }

            return { ...user, staff_profile: staffProfile };
          }
          return user;
        })
      );

      // Remove null values (from department filtering)
      const filteredUsers = usersWithProfiles.filter((user) => user !== null);

      return sendSuccess(res, "Users retrieved successfully", {
        users: filteredUsers,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get users error:", error);
      return sendError(res, "Failed to get users", 400);
    }
  }

  // Admin/Registrar/HR: Update any user
  // static async updateUser(req, res) {
  //   try {
  //     const currentUser = req.user;
  //     const { id } = req.params;
  //     const updateData = req.body;

  //     if (!CAN_REGISTER_USERS.includes(currentUser.role)) {
  //       return sendError(res, "Access denied", 403);
  //     }

  //     // Check if user exists
  //     const user = await UserModel.findById(parseInt(id));
  //     if (!user) {
  //       return sendError(res, "User not found", 404);
  //     }

  //     // Non-admin cannot change admin users
  //     if (currentUser.role !== ROLES.ADMIN && user.role === ROLES.ADMIN) {
  //       return sendError(res, "Cannot modify admin user", 403);
  //     }

  //     // Non-admin cannot change other admins' role
  //     if (currentUser.role !== ROLES.ADMIN && updateData.role) {
  //       return sendError(res, "Only admin can change user roles", 403);
  //     }

  //     // Update user
  //     const updatedUser = await UserModel.update(parseInt(id), updateData);

  //     // Update staff profile if exists
  //     if (ACADEMIC_STAFF_ROLES.includes(user.role)) {
  //       const staffProfile = await StaffModel.findByUserId(user.user_id);
  //       if (staffProfile) {
  //         await StaffModel.update(staffProfile.staff_id, updateData);
  //       }
  //     }

  //     return sendSuccess(res, "User updated successfully", updatedUser);
  //   } catch (error) {
  //     console.error("Update user error:", error);
  //     return sendError(res, "Failed to update user", 400);
  //   }
  // }

  // // In src/controllers/AuthController.js - Fix the updateUser method
  // static async updateUser(req, res) {
  //   try {
  //     const currentUser = req.user;
  //     const { id } = req.params;
  //     let updateData = req.body;

  //     console.log(`🔄 [Backend] Updating user ${id}`);
  //     console.log(`📦 [Backend] Received update data:`, updateData);

  //     // Check permissions
  //     const allowedRoles = ["admin", "registrar", "hr_director"];
  //     if (!allowedRoles.includes(currentUser.role)) {
  //       return sendError(res, "Access denied", 403);
  //     }

  //     // Check if user exists
  //     const user = await UserModel.findById(parseInt(id));
  //     if (!user) {
  //       return sendError(res, "User not found", 404);
  //     }

  //     console.log(`👤 [Backend] Found user:`, user);

  //     // Non-admin cannot change admin users
  //     if (currentUser.role !== "admin" && user.role === "admin") {
  //       return sendError(res, "Cannot modify admin user", 403);
  //     }

  //     // Non-admin cannot change other admins' role
  //     if (currentUser.role !== "admin" && updateData.role) {
  //       return sendError(res, "Only admin can change user roles", 403);
  //     }

  //     // Extract staff_profile from updateData - THIS IS THE FIX
  //     let staffProfileData = null;
  //     if (updateData.staff_profile) {
  //       staffProfileData = updateData.staff_profile;
  //       // Remove staff_profile from user update data
  //       delete updateData.staff_profile;
  //     }

  //     console.log(`📊 [Backend] User update data:`, updateData);
  //     console.log(`📊 [Backend] Staff profile data:`, staffProfileData);

  //     // Update user table (only user fields)
  //     const updatedUser = await UserModel.update(parseInt(id), updateData);

  //     // Update staff profile separately if exists
  //     if (staffProfileData) {
  //       try {
  //         const staffProfile = await StaffModel.findByUserId(user.user_id);
  //         if (staffProfile) {
  //           console.log(
  //             `🔄 [Backend] Updating staff profile:`,
  //             staffProfileData
  //           );
  //           await StaffModel.update(staffProfile.staff_id, staffProfileData);
  //         } else {
  //           console.log(`⚠️ [Backend] No staff profile found for user ${id}`);
  //         }
  //       } catch (staffError) {
  //         console.error(`❌ [Backend] Staff profile update error:`, staffError);
  //         // Don't fail the whole update if staff profile update fails
  //       }
  //     }

  //     console.log(`✅ [Backend] User updated successfully`);
  //     return sendSuccess(res, "User updated successfully", updatedUser);
  //   } catch (error) {
  //     console.error("❌ [Backend] Update user error:", error);
  //     return sendError(res, "Failed to update user: " + error.message, 400);
  //   }
  // }
  // In src/controllers/AuthController.js
  // Update the updateUser method

  static async updateUser(req, res) {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      let updateData = req.body;

      console.log(`🔄 [Backend] Updating user ${id} by ${currentUser.role}`);
      console.log(`📦 [Backend] Update data received:`, updateData);

      // Check permissions
      const allowedRoles = ["admin", "registrar", "hr_director"];
      if (!allowedRoles.includes(currentUser.role)) {
        return sendError(res, "Access denied", 403);
      }

      // Check if user exists
      const user = await UserModel.findById(parseInt(id));
      if (!user) {
        return sendError(res, "User not found", 404);
      }

      console.log(
        `👤 [Backend] Current user role: ${currentUser.role}, Target user role: ${user.role}`
      );

      // FIXED: Non-admin cannot change admin users
      if (user.role === "admin" && currentUser.role !== "admin") {
        return sendError(res, "Cannot modify admin user", 403);
      }

      // FIXED: Non-admin cannot change other admins' role
      if (
        updateData.role &&
        currentUser.role !== "admin" &&
        user.role === "admin"
      ) {
        return sendError(res, "Only admin can change admin roles", 403);
      }

      // FIXED: Allow admin to change any role, HR/Registrar to change non-admin roles
      if (updateData.role) {
        if (currentUser.role !== "admin") {
          // HR Director and Registrar can only change to certain roles
          const allowedTargetRoles = ["instructor", "department_head"];
          if (!allowedTargetRoles.includes(updateData.role)) {
            return sendError(
              res,
              `You cannot assign the role: ${updateData.role}`,
              403
            );
          }
        }
      }

      // Extract staff_profile from updateData
      let staffProfileData = null;
      if (updateData.staff_profile) {
        staffProfileData = updateData.staff_profile;
        delete updateData.staff_profile;
      }

      console.log(`📊 [Backend] User data to update:`, updateData);
      console.log(`📊 [Backend] Staff profile data:`, staffProfileData);

      // Update user table
      const updatedUser = await UserModel.update(parseInt(id), updateData);

      // Update staff profile if exists and data provided
      if (staffProfileData) {
        try {
          // First check if staff profile exists
          const staffProfile = await StaffModel.findByUserId(parseInt(id));

          if (staffProfile) {
            console.log(`🔄 [Backend] Updating existing staff profile`);
            await StaffModel.update(staffProfile.staff_id, staffProfileData);
          } else {
            console.log(
              `ℹ️ [Backend] No staff profile found, creating new one`
            );

            // Check if required fields exist for creating staff profile
            if (
              staffProfileData.first_name &&
              staffProfileData.last_name &&
              staffProfileData.employee_id
            ) {
              // Create new staff profile
              const newStaffProfile = {
                user_id: parseInt(id),
                employee_id: staffProfileData.employee_id,
                first_name: staffProfileData.first_name,
                last_name: staffProfileData.last_name,
                middle_name: staffProfileData.middle_name || null,
                department_id: staffProfileData.department_id || null,
                academic_rank: staffProfileData.academic_rank || "lecturer",
                employment_type:
                  staffProfileData.employment_type || "full_time",
                phone: staffProfileData.phone || null,
                address: staffProfileData.address || null,
                date_of_birth: staffProfileData.date_of_birth || null,
                gender: staffProfileData.gender || null,
                hire_date: staffProfileData.hire_date || null,
              };

              await StaffModel.create(newStaffProfile);
            }
          }
        } catch (staffError) {
          console.error(
            `❌ [Backend] Staff profile update error:`,
            staffError.message
          );
          // Don't fail the whole update if staff profile update fails
          // Return success for user update but note the staff profile issue
        }
      }

      console.log(`✅ [Backend] User update completed successfully`);
      return sendSuccess(res, "User updated successfully", updatedUser);
    } catch (error) {
      console.error("❌ [Backend] Update user error:", error);
      return sendError(res, "Failed to update user: " + error.message, 400);
    }
  }

  // Admin/HR: Deactivate user
  static async deactivateUser(req, res) {
    try {
      const currentUser = req.user;
      const { id } = req.params;

      // Only admin and HR can deactivate users
      if (![ROLES.ADMIN, ROLES.HR_DIRECTOR].includes(currentUser.role)) {
        return sendError(res, "Access denied", 403);
      }

      // Cannot deactivate yourself
      if (currentUser.user_id === parseInt(id)) {
        return sendError(res, "Cannot deactivate your own account", 400);
      }

      await UserModel.update(parseInt(id), { is_active: false });
      return sendSuccess(res, "User deactivated successfully");
    } catch (error) {
      console.error("Deactivate user error:", error);
      return sendError(res, "Failed to deactivate user", 400);
    }
  }

  // Admin/HR: Activate user
  static async activateUser(req, res) {
    try {
      const currentUser = req.user;
      const { id } = req.params;

      // Only admin and HR can activate users
      if (![ROLES.ADMIN, ROLES.HR_DIRECTOR].includes(currentUser.role)) {
        return sendError(res, "Access denied", 403);
      }

      await UserModel.update(parseInt(id), { is_active: true });
      return sendSuccess(res, "User activated successfully");
    } catch (error) {
      console.error("Activate user error:", error);
      return sendError(res, "Failed to activate user", 400);
    }
  }

  // Admin: Reset user password

  static async resetPassword(req, res) {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      const { newPassword } = req.body;

      // Only admin can reset passwords
      if (currentUser.role !== "admin") {
        return sendError(res, "Only admin can reset passwords", 403);
      }

      // Validate new password
      if (!newPassword || newPassword.length < 6) {
        return sendError(
          res,
          "New password must be at least 6 characters",
          400
        );
      }

      // HASH THE PASSWORD before passing to model
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password with HASHED version
      const updatedUser = await UserModel.update(parseInt(id), {
        password_hash: hashedPassword,
      });

      if (!updatedUser) {
        return sendError(res, "User not found", 404);
      }

      return sendSuccess(res, "Password reset successfully");
    } catch (error) {
      console.error("Reset password error:", error);
      return sendError(res, "Failed to reset password from backend", 400);
    }
  }
  // src/controllers/AuthController.js - Add this method
  static async getUserStats(req, res) {
    try {
      const currentUser = req.user;

      if (!["admin", "registrar", "hr_director"].includes(currentUser.role)) {
        return sendError(res, "Access denied", 403);
      }

      // Get total users
      const [totalResult] = await query("SELECT COUNT(*) as total FROM users");
      const total = totalResult[0]?.total || 0;

      // Get active users
      const [activeResult] = await query(
        "SELECT COUNT(*) as active FROM users WHERE is_active = TRUE"
      );
      const active = activeResult[0]?.active || 0;

      // Get instructors count
      const [instructorsResult] = await query(
        "SELECT COUNT(*) as instructors FROM users WHERE role = 'instructor'"
      );
      const instructors = instructorsResult[0]?.instructors || 0;

      // Get admins count
      const [adminsResult] = await query(
        "SELECT COUNT(*) as admins FROM users WHERE role = 'admin'"
      );
      const admins = adminsResult[0]?.admins || 0;

      return sendSuccess(res, "User stats retrieved successfully", {
        total: parseInt(total),
        active: parseInt(active),
        instructors: parseInt(instructors),
        admins: parseInt(admins),
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      return sendError(res, "Failed to retrieve user stats", 500);
    }
  }
  // Logout
  static async logout(req, res) {
    return sendSuccess(res, "Logout successful");
  }

  // Add this method to AuthController.js
  static async deleteUser(req, res) {
    try {
      const currentUser = req.user;
      const { id } = req.params;

      console.log(`🗑️ [Backend] Deleting user ${id} by ${currentUser.role}`);

      // Only admin can delete users
      if (currentUser.role !== "admin") {
        return sendError(res, "Only admin can delete users", 403);
      }

      // Cannot delete yourself
      if (currentUser.user_id === parseInt(id)) {
        return sendError(res, "Cannot delete your own account", 400);
      }

      // Check if user exists
      const user = await UserModel.findById(parseInt(id));
      if (!user) {
        return sendError(res, "User not found", 404);
      }

      // Check if user has any related data (optional safety check)
      const [workloadCheck] = await query(
        "SELECT COUNT(*) as count FROM workload_rp WHERE staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = ?)",
        [id]
      );

      if (workloadCheck.count > 0) {
        return sendError(
          res,
          "Cannot delete user with existing workload data. Deactivate instead.",
          400
        );
      }

      // First delete staff profile if exists
      const staffProfile = await StaffModel.findByUserId(parseInt(id));
      if (staffProfile) {
        await query("DELETE FROM staff_profiles WHERE staff_id = ?", [
          staffProfile.staff_id,
        ]);
        console.log(
          `🗑️ [Backend] Deleted staff profile ${staffProfile.staff_id}`
        );
      }

      // Then delete user
      await query("DELETE FROM users WHERE user_id = ?", [id]);

      console.log(`✅ [Backend] User ${id} deleted successfully`);
      return sendSuccess(res, "User deleted successfully");
    } catch (error) {
      console.error("❌ [Backend] Delete user error:", error);
      return sendError(res, "Failed to delete user: " + error.message, 400);
    }
  }
}

export default AuthController;
