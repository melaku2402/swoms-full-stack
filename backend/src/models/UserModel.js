// import { query } from "../config/database.js";
// import { hashPassword, comparePassword } from "../utils/hash.js";

// class UserModel {
//   // Create a new user
//   static async create(userData) {
//     const {
//       username,
//       email,
//       password,
//       role = "instructor",
//       is_active = true,
//     } = userData;

//     const password_hash = await hashPassword(password);

//     const result = await query(
//       `INSERT INTO users (username, email, password_hash, role, is_active) 
//        VALUES (?, ?, ?, ?, ?)`,
//       [username, email, password_hash, role, is_active]
//     );

//     return this.findById(result.insertId);
//   }

//   // Find user by ID
//   static async findById(userId) {
//     const users = await query(
//       "SELECT user_id, username, email, role, is_active, last_login, created_at, updated_at FROM users WHERE user_id = ?",
//       [userId]
//     );
//     return users[0] || null;
//   }

//   // Find user by username or email
//   static async findByUsernameOrEmail(identifier) {
//     const users = await query(
//       `SELECT user_id, username, email, password_hash, role, is_active, last_login 
//        FROM users WHERE username = ? OR email = ?`,
//       [identifier, identifier]
//     );
//     return users[0] || null;
//   }

//   // Update user
//   static async update(userId, updateData) {
//     const fields = Object.keys(updateData);
//     if (fields.length === 0) return null;

//     const setClause = fields.map((field) => `${field} = ?`).join(", ");
//     const values = [...fields.map((field) => updateData[field]), userId];

//     await query(
//       `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
//       values
//     );

//     return this.findById(userId);
//   }

//   // Delete user
//   static async delete(userId) {
//     await query("DELETE FROM users WHERE user_id = ?", [userId]);
//     return true;
//   }

//   // Get all users with pagination
//   static async findAll(page = 1, limit = 10) {
//     const offset = (page - 1) * limit;

//     const users = await query(
//       `SELECT user_id, username, email, role, is_active, last_login, created_at 
//        FROM users 
//        ORDER BY created_at DESC 
//        LIMIT ? OFFSET ?`,
//       [limit, offset]
//     );

//     const totalResult = await query("SELECT COUNT(*) as count FROM users");
//     const total = totalResult[0].count;

//     return {
//       users,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     };
//   }

//   // Update last login
//   static async updateLastLogin(userId) {
//     await query(
//       "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?",
//       [userId]
//     );
//   }

//   // Verify password
//   static async verifyPassword(password, hashedPassword) {
//     return await comparePassword(password, hashedPassword);
//   }

//   // Check if username exists
//   static async usernameExists(username) {
//     const result = await query(
//       "SELECT COUNT(*) as count FROM users WHERE username = ?",
//       [username]
//     );
//     return result[0].count > 0;
//   }

//   // Check if email exists
//   static async emailExists(email) {
//     const result = await query(
//       "SELECT COUNT(*) as count FROM users WHERE email = ?",
//       [email]
//     );
//     return result[0].count > 0;
//   }

//   // Add this method to UserModel class
//   static async findAll(page = 1, limit = 10, filter = {}) {
//     const offset = (page - 1) * limit;

//     let whereClause = "";
//     const params = [];

//     if (filter.role) {
//       whereClause = "WHERE role = ?";
//       params.push(filter.role);
//     }

//     const users = await query(
//       `SELECT user_id, username, email, role, is_active, last_login, created_at 
//      FROM users 
//      ${whereClause}
//      ORDER BY created_at DESC 
//      LIMIT ? OFFSET ?`,
//       [...params, limit, offset]
//     );

//     const totalResult = await query(
//       `SELECT COUNT(*) as count FROM users ${whereClause}`,
//       params
//     );
//     const total = totalResult[0].count;

//     return {
//       users,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     };
//   }
// }



// export default UserModel;


import { query } from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { ROLE_CREATION_HIERARCHY } from "../config/constants.js";

class UserModel {
  // Create a new user with hierarchy validation
  static async create(userData, createdByRole = null) {
    const {
      username,
      email,
      password,
      role = "instructor",
      is_active = true,
      created_by_id = null,
    } = userData;

    // Validate role hierarchy if creator role is provided
    if (createdByRole && !this.canCreateRole(createdByRole, role)) {
      throw new Error(
        `Role ${createdByRole} cannot create users with role ${role}`
      );
    }

    const password_hash = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (username, email, password_hash, role, is_active, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, role, is_active, created_by_id]
    );

    return this.findById(result.insertId);
  }

  // Check if a role can create another role
  static canCreateRole(creatorRole, targetRole) {
    // Admin can create all roles
    if (creatorRole === "admin") {
      return true;
    }
    const allowedRoles = ROLE_CREATION_HIERARCHY[creatorRole] || [];
    return allowedRoles.includes(targetRole);
  }

  // Find users by role
  static async findByRole(role) {
    const users = await query(
      `SELECT user_id, username, email, role, is_active, last_login, created_at 
     FROM users WHERE role = ? AND is_active = TRUE 
     ORDER BY created_at DESC`,
      [role]
    );
    return users;
  }

  // Get role creation statistics
  static async getRoleCreationStats() {
    const stats = await query(`
    SELECT 
      u.role,
      COUNT(*) as total_users,
      SUM(CASE WHEN u.is_active = TRUE THEN 1 ELSE 0 END) as active_users,
      c.role as creator_role,
      COUNT(DISTINCT u.created_by) as unique_creators
    FROM users u
    LEFT JOIN users c ON u.created_by = c.user_id
    GROUP BY u.role, c.role
    ORDER BY u.role
  `);
    return stats;
  }

  // Update the findAll method to support created_by filter
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (filters.role) {
      whereClause += " AND role = ?";
      params.push(filters.role);
    }

    if (filters.is_active !== undefined) {
      whereClause += " AND is_active = ?";
      params.push(filters.is_active === "true" ? 1 : 0);
    }

    if (filters.created_by) {
      whereClause += " AND created_by = ?";
      params.push(filters.created_by);
    }

    if (filters.search) {
      whereClause += " AND (username LIKE ? OR email LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    const users = await query(
      `SELECT user_id, username, email, role, is_active, last_login, created_at, created_by
     FROM users 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );
    const total = totalResult[0]?.count || 0;

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Find user by ID with basic info (no password)
  static async findById(userId) {
    try {
      const [rows] = await query(
        `SELECT user_id, username, email, role, is_active, 
              last_login, created_at, updated_at, created_by
       FROM users 
       WHERE user_id = ?`,
        [userId]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (error) {
      console.error("UserModel.findById error:", error);
      throw error;
    }
  }

  // Find user by ID with all details (for admin)
  static async findByIdWithDetails(userId) {
    try {
      // Get user with password_hash (for verification only, not to return)
      const [rows] = await query(`SELECT * FROM users WHERE user_id = ?`, [
        userId,
      ]);

      if (rows.length === 0) {
        return null;
      }

      const user = rows[0];

      // Remove password_hash from the object to return
      const { password_hash, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      console.error("UserModel.findByIdWithDetails error:", error);
      throw error;
    }
  }
  // Get users created by specific user
  static async findByCreator(creatorId) {
    const users = await query(
      `SELECT u.user_id, u.username, u.email, u.role, u.is_active, 
              u.created_at, c.username as creator_username
       FROM users u
       LEFT JOIN users c ON u.created_by = c.user_id
       WHERE u.created_by = ?
       ORDER BY u.created_at DESC`,
      [creatorId]
    );
    return users;
  }

  // Validate user creation for Phase 1 flow
  static async validatePhase1Creation(
    currentUser,
    targetRole,
    targetDepartment = null
  ) {
    const errors = [];

    // Check if current user can create target role
    if (!this.canCreateRole(currentUser.role, targetRole)) {
      errors.push(`You cannot create users with role: ${targetRole}`);
    }

    // Additional validations based on role
    if (targetRole === "department_head" && currentUser.role === "dean") {
      // Dean can only create department heads in their own college
      if (!targetDepartment) {
        errors.push("Department ID is required when creating Department Head");
      } else {
        // Verify department belongs to dean's college
        const [deptCheck] = await query(
          `
          SELECT d.department_id 
          FROM departments d
          JOIN colleges c ON d.college_id = c.college_id
          JOIN staff_profiles sp ON sp.user_id = ?
          WHERE d.department_id = ? AND sp.department_id = d.department_id
        `,
          [currentUser.user_id, targetDepartment]
        );

        if (!deptCheck) {
          errors.push(
            "You can only create department heads in your own college"
          );
        }
      }
    }

    if (targetRole === "instructor" && currentUser.role === "hr_director") {
      // HR Director must assign academic rank
      if (!targetDepartment) {
        errors.push(
          "Department and academic rank are required for instructors"
        );
      }
    }

    return errors;
  }

  // Find user by ID with creator info
  static async findByIdWithCreator(userId) {
    const users = await query(
      `SELECT 
        u.*,
        c.username as creator_username,
        c.role as creator_role,
        sp.first_name,
        sp.last_name,
        d.department_name
       FROM users u
       LEFT JOIN users c ON u.created_by = c.user_id
       LEFT JOIN staff_profiles sp ON u.user_id = sp.user_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       WHERE u.user_id = ?`,
      [userId]
    );
    return users[0] || null;
  }

  // In UserModel.js - Update the update method
  // static async update(userId, updateData) {
  //   try {
  //     const fields = Object.keys(updateData);
  //     if (fields.length === 0) return null;

  //     // Don't allow role changes through update
  //     if (updateData.role) {
  //       delete updateData.role;
  //     }

  //     // Map 'password' to 'password_hash' if needed (backward compatibility)
  //     if (updateData.password) {
  //       updateData.password_hash = updateData.password;
  //       delete updateData.password;
  //     }

  //     const currentFields = Object.keys(updateData);
  //     const setClause = currentFields.map((field) => `${field} = ?`).join(", ");
  //     const values = [
  //       ...currentFields.map((field) => updateData[field]),
  //       userId,
  //     ];

  //     const result = await query(
  //       `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
  //       values
  //     );

  //     if (result.affectedRows === 0) {
  //       throw new Error(`User with ID ${userId} not found`);
  //     }

  //     return this.findById(userId);
  //   } catch (error) {
  //     console.error("UserModel.update error:", error);
  //     throw error;
  //   }
  // }

  // In src/models/UserModel.js
  // Update the update method

  static async update(userId, updateData) {
    try {
      const fields = Object.keys(updateData);
      if (fields.length === 0) return this.findById(userId);

      console.log(
        `🔄 [UserModel] Updating user ${userId} with fields:`,
        fields
      );

      // Map 'password' to 'password_hash' if needed
      if (updateData.password) {
        updateData.password_hash = await hashPassword(updateData.password);
        delete updateData.password;
      }

      // Filter out any non-existent columns
      const allowedColumns = [
        "username",
        "email",
        "password_hash",
        "role",
        "is_active",
        "last_login",
        "created_by",
      ];

      const filteredData = {};
      Object.keys(updateData).forEach((key) => {
        if (allowedColumns.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      const currentFields = Object.keys(filteredData);
      if (currentFields.length === 0) {
        return this.findById(userId);
      }

      const setClause = currentFields.map((field) => `${field} = ?`).join(", ");
      const values = [
        ...currentFields.map((field) => filteredData[field]),
        userId,
      ];

      await query(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
        values
      );

      console.log(`✅ [UserModel] User ${userId} updated successfully`);
      return this.findById(userId);
    } catch (error) {
      console.error("❌ [UserModel] Update error:", error);
      throw error;
    }
  }

  // Update user role (admin only)
  static async updateRole(userId, newRole, updatedBy) {
    // Log the role change
    await query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, old_value, new_value)
       SELECT ?, 'UPDATE_ROLE', 'users', ?, role, ? FROM users WHERE user_id = ?`,
      [updatedBy, userId, newRole, userId]
    );

    await query(
      "UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
      [newRole, userId]
    );

    return this.findById(userId);
  }

  // Find user by username or email
  static async findByUsernameOrEmail(identifier) {
    const users = await query(
      `SELECT user_id, username, email, password_hash, role, is_active, last_login 
       FROM users WHERE username = ? OR email = ?`,
      [identifier, identifier]
    );
    return users[0] || null;
  }

  // Update last login
  static async updateLastLogin(userId) {
    await query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?",
      [userId]
    );
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    return await comparePassword(password, hashedPassword);
  }

  // Check if username exists
  static async usernameExists(username) {
    const result = await query(
      "SELECT COUNT(*) as count FROM users WHERE username = ?",
      [username]
    );
    return result[0]?.count > 0;
  }

  // Check if email exists
  static async emailExists(email) {
    const result = await query(
      "SELECT COUNT(*) as count FROM users WHERE email = ?",
      [email]
    );
    return result[0]?.count > 0;
  }

  // Delete user (soft delete)
  static async delete(userId) {
    await query("UPDATE users SET is_active = FALSE WHERE user_id = ?", [
      userId,
    ]);
    return true;
  }

  // Get user by ID
  static async findById(userId) {
    const users = await query(
      "SELECT user_id, username, email, role, is_active, last_login, created_at, updated_at, created_by FROM users WHERE user_id = ?",
      [userId]
    );
    return users[0] || null;
  }
}

export default UserModel;