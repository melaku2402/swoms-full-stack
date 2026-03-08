

// src/models/StaffModel.js - FIXED VERSION
import { query } from "../config/database.js";

class StaffModel {
  // Add this method to your StaffModel.js file
  static async create(staffData) {
    try {
      const {
        user_id,
        employee_id,
        first_name,
        last_name,
        department_id,
        academic_rank = "lecturer",
        employment_type = "full_time",
        middle_name = null,
        hire_date = null,
        phone = null,
        address = null,
        date_of_birth = null,
        gender = null,
      } = staffData;

      const result = await query(
        `INSERT INTO staff_profiles 
       (user_id, employee_id, first_name, last_name, department_id, academic_rank, 
        employment_type, middle_name, hire_date, phone, address, date_of_birth, gender) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          employee_id,
          first_name,
          last_name,
          department_id,
          academic_rank,
          employment_type,
          middle_name,
          hire_date,
          phone,
          address,
          date_of_birth,
          gender,
        ]
      );

      return this.findById(result.insertId);
    } catch (error) {
      console.error("StaffModel.create error:", error);
      throw error;
    }
  }

  // Create staff profile
  // static async create(staffData) {
  //   const {
  //     user_id,
  //     employee_id,
  //     first_name,
  //     last_name,
  //     department_id,
  //     academic_rank = "lecturer",
  //     employment_type = "full_time",
  //     ...otherData
  //   } = staffData;

  //   const result = await query(
  //     `INSERT INTO staff_profiles
  //      (user_id, employee_id, first_name, last_name, department_id, academic_rank, employment_type,
  //       middle_name, hire_date, phone, address, date_of_birth, gender)
  //      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  //     [
  //       user_id,
  //       employee_id,
  //       first_name,
  //       last_name,
  //       department_id,
  //       academic_rank,
  //       employment_type,
  //       otherData.middle_name || null,
  //       otherData.hire_date || null,
  //       otherData.phone || null,
  //       otherData.address || null,
  //       otherData.date_of_birth || null,
  //       otherData.gender || null,
  //     ]
  //   );

  //   return this.findById(result.insertId);
  // }

  // Add these methods to your existing StaffModel class

  // // Create staff with hierarchy validation
  // static async createWithHierarchy(staffData, creatorRole, creatorId) {
  //   const {
  //     user_id,
  //     employee_id,
  //     first_name,
  //     last_name,
  //     department_id,
  //     academic_rank = "lecturer",
  //     employment_type = "full_time",
  //     ...otherData
  //   } = staffData;

  //   // Validate HR Director creating instructors
  //   if (creatorRole === "hr_director") {
  //     // Get user to check role
  //     const user = await query("SELECT role FROM users WHERE user_id = ?", [
  //       user_id,
  //     ]);

  //     if (user[0]?.role !== "instructor") {
  //       throw new Error(
  //         "HR Director can only create staff profiles for instructors"
  //       );
  //     }
  //   }

  //   // Validate academic rank for instructors
  //   if (academic_rank) {
  //     const validRanks = [
  //       "graduate_assistant",
  //       "assistant_lecturer",
  //       "lecturer",
  //       "assistant_professor",
  //       "associate_professor",
  //       "professor",
  //     ];

  //     if (!validRanks.includes(academic_rank)) {
  //       throw new Error(
  //         `Invalid academic rank. Must be one of: ${validRanks.join(", ")}`
  //       );
  //     }
  //   }

  //   const result = await query(
  //     `INSERT INTO staff_profiles
  //    (user_id, employee_id, first_name, last_name, department_id, academic_rank, employment_type,
  //     middle_name, hire_date, phone, address, date_of_birth, gender, created_by)
  //    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  //     [
  //       user_id,
  //       employee_id,
  //       first_name,
  //       last_name,
  //       department_id,
  //       academic_rank,
  //       employment_type,
  //       otherData.middle_name || null,
  //       otherData.hire_date || null,
  //       otherData.phone || null,
  //       otherData.address || null,
  //       otherData.date_of_birth || null,
  //       otherData.gender || null,
  //       creatorId,
  //     ]
  //   );

  //   return this.findById(result.insertId);
  // }
  // Update the createWithHierarchy method in StaffModel.js

  static async createWithHierarchy(staffData, creatorRole, creatorId) {
    const {
      user_id,
      employee_id,
      first_name,
      last_name,
      department_id,
      academic_rank = null,
      employment_type = "full_time",
      ...otherData
    } = staffData;

    console.log("Creating staff with academic_rank:", academic_rank);

    // Build the SQL query - handle null academic_rank properly
    let sql, params;

    if (academic_rank !== null && academic_rank !== undefined) {
      sql = `INSERT INTO staff_profiles 
           (user_id, employee_id, first_name, last_name, department_id, academic_rank, employment_type, 
            middle_name, hire_date, phone, address, date_of_birth, gender, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      params = [
        user_id,
        employee_id,
        first_name,
        last_name,
        department_id,
        academic_rank,
        employment_type,
        otherData.middle_name || null,
        otherData.hire_date || null,
        otherData.phone || null,
        otherData.address || null,
        otherData.date_of_birth || null,
        otherData.gender || null,
        creatorId,
      ];
    } else {
      sql = `INSERT INTO staff_profiles 
           (user_id, employee_id, first_name, last_name, department_id, employment_type, 
            middle_name, hire_date, phone, address, date_of_birth, gender, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      params = [
        user_id,
        employee_id,
        first_name,
        last_name,
        department_id,
        employment_type,
        otherData.middle_name || null,
        otherData.hire_date || null,
        otherData.phone || null,
        otherData.address || null,
        otherData.date_of_birth || null,
        otherData.gender || null,
        creatorId,
      ];
    }

    const result = await query(sql, params);
    return this.findById(result.insertId);
  }
  // Get staff by department with hierarchy info
  static async findByDepartmentWithHierarchy(
    departmentId,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;

    const staff = await query(
      `SELECT 
      sp.*, 
      u.username, u.email, u.role, u.is_active,
      u.created_at as user_created_at,
      uc.username as creator_username,
      uc.role as creator_role,
      d.department_name, d.department_code,
      c.college_name, c.college_code
    FROM staff_profiles sp
    LEFT JOIN users u ON sp.user_id = u.user_id
    LEFT JOIN users uc ON u.created_by = uc.user_id
    LEFT JOIN departments d ON sp.department_id = d.department_id
    LEFT JOIN colleges c ON d.college_id = c.college_id
    WHERE sp.department_id = ?
    ORDER BY sp.last_name, sp.first_name
    LIMIT ? OFFSET ?`,
      [departmentId, limit, offset]
    );

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM staff_profiles WHERE department_id = ?",
      [departmentId]
    );
    const total = totalResult[0]?.count || 0;

    return {
      staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get staff by creator
  static async findByCreator(creatorId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const staff = await query(
      `SELECT 
      sp.*, 
      u.username, u.email, u.role,
      d.department_name, d.department_code
    FROM staff_profiles sp
    LEFT JOIN users u ON sp.user_id = u.user_id
    LEFT JOIN departments d ON sp.department_id = d.department_id
    WHERE sp.created_by = ?
    ORDER BY sp.created_at DESC
    LIMIT ? OFFSET ?`,
      [creatorId, limit, offset]
    );

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM staff_profiles WHERE created_by = ?",
      [creatorId]
    );
    const total = totalResult[0]?.count || 0;

    return {
      staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get role-based staff statistics
  static async getRoleBasedStatistics(role) {
    let whereClause = "WHERE u.role = ? AND u.is_active = TRUE";
    const params = [role];

    const stats = await query(
      `SELECT 
      COUNT(*) as total_staff,
      c.college_name,
      d.department_name,
      sp.academic_rank,
      COUNT(*) as count_by_rank
    FROM staff_profiles sp
    LEFT JOIN users u ON sp.user_id = u.user_id
    LEFT JOIN departments d ON sp.department_id = d.department_id
    LEFT JOIN colleges c ON d.college_id = c.college_id
    ${whereClause}
    GROUP BY c.college_id, d.department_id, sp.academic_rank
    ORDER BY c.college_name, d.department_name`,
      params
    );

    return stats;
  }
  // Find staff by ID - FIXED THE SQL ERROR
  static async findById(staffId) {
    try {
      const staff = await query(
        `SELECT sp.*, 
                u.username, u.email, u.role, u.is_active,
                d.department_name, d.department_code,
                c.college_name, c.college_code,
                (SELECT COUNT(*) FROM workload_rp WHERE staff_id = sp.staff_id) as workload_count,
                (SELECT COUNT(*) FROM workload_nrp WHERE staff_id = sp.staff_id) as nrp_count,
                (SELECT SUM(total_load) FROM workload_rp WHERE staff_id = sp.staff_id AND status = 'finance_approved') as total_approved_hours,
                (SELECT SUM(total_payment) FROM workload_nrp WHERE staff_id = sp.staff_id AND status = 'finance_approved') as total_approved_payments
         FROM staff_profiles sp
         LEFT JOIN users u ON sp.user_id = u.user_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         WHERE sp.staff_id = ?`,
        [staffId]
      );
      return staff[0] || null;
    } catch (error) {
      console.error("StaffModel.findById error:", error);
      // Return a basic staff object without the complex calculations
      const basicStaff = await query(
        `SELECT sp.*, 
                u.username, u.email, u.role, u.is_active,
                d.department_name, d.department_code,
                c.college_name, c.college_code
         FROM staff_profiles sp
         LEFT JOIN users u ON sp.user_id = u.user_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         WHERE sp.staff_id = ?`,
        [staffId]
      );
      return basicStaff[0] || null;
    }
  }

  // Find staff by user ID
  static async findByUserId(userId) {
    try {
      const staff = await query(
        `SELECT sp.*, u.username, u.email, u.role, u.is_active,
                d.department_name, d.department_code,
                c.college_name, c.college_code
         FROM staff_profiles sp
         LEFT JOIN users u ON sp.user_id = u.user_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         WHERE sp.user_id = ?`,
        [userId]
      );
      return staff[0] || null;
    } catch (error) {
      console.error("StaffModel.findByUserId error:", error);
      return null;
    }
  }

  // Find staff by employee ID
  static async findByEmployeeId(employeeId) {
    const staff = await query(
      `SELECT sp.*, u.username, u.email, u.role,
              d.department_name, d.department_code
       FROM staff_profiles sp
       LEFT JOIN users u ON sp.user_id = u.user_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       WHERE sp.employee_id = ?`,
      [employeeId]
    );
    return staff[0] || null;
  }

  // Get staff ID from user ID
  static async getStaffIdFromUserId(userId) {
    try {
      const results = await query(
        `SELECT staff_id FROM staff_profiles WHERE user_id = ?`,
        [userId]
      );

      if (results && Array.isArray(results) && results.length > 0) {
        return results[0].staff_id;
      }
      return null;
    } catch (error) {
      console.error("Error getting staff ID from user ID:", error);
      return null;
    }
  }

  // Check if user has staff profile
  static async hasStaffProfile(userId) {
    try {
      const results = await query(
        `SELECT COUNT(*) as count FROM staff_profiles WHERE user_id = ?`,
        [userId]
      );
      return results[0]?.count > 0;
    } catch (error) {
      console.error("Error checking staff profile:", error);
      return false;
    }
  }

  // Update staff profile
  static async update(staffId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), staffId];

    await query(
      `UPDATE staff_profiles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE staff_id = ?`,
      values
    );

    return this.findById(staffId);
  }

  // Delete staff profile (soft delete via user deactivation)
  static async delete(staffId) {
    const staff = await this.findById(staffId);
    if (!staff) return false;

    await query("UPDATE users SET is_active = FALSE WHERE user_id = ?", [
      staff.user_id,
    ]);

    return true;
  }

  // Get all staff in a department
  static async findByDepartment(
    departmentId,
    page = 1,
    limit = 20,
    includeStats = false
  ) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT sp.*, u.username, u.email, u.role, u.is_active,
             d.department_name, d.department_code
      FROM staff_profiles sp
      LEFT JOIN users u ON sp.user_id = u.user_id
      LEFT JOIN departments d ON sp.department_id = d.department_id
      WHERE sp.department_id = ?
      ORDER BY sp.last_name, sp.first_name
      LIMIT ? OFFSET ?
    `;

    const staff = await query(sql, [departmentId, limit, offset]);

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM staff_profiles WHERE department_id = ?",
      [departmentId]
    );
    const total = totalResult[0].count;

    let stats = null;
    if (includeStats) {
      stats = await this.getDepartmentStaffStatistics(departmentId);
    }

    return {
      staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    };
  }

  // Get all staff with pagination and filters
  static async findAll(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = "WHERE u.is_active = TRUE";
    const params = [];

    if (filters.department_id) {
      whereClause += " AND sp.department_id = ?";
      params.push(filters.department_id);
    }

    if (filters.college_id) {
      whereClause += " AND d.college_id = ?";
      params.push(filters.college_id);
    }

    if (filters.academic_rank) {
      whereClause += " AND sp.academic_rank = ?";
      params.push(filters.academic_rank);
    }

    if (filters.employment_type) {
      whereClause += " AND sp.employment_type = ?";
      params.push(filters.employment_type);
    }

    if (filters.search) {
      whereClause +=
        " AND (sp.first_name LIKE ? OR sp.last_name LIKE ? OR sp.employee_id LIKE ? OR u.username LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const staff = await query(
      `SELECT sp.*, u.username, u.email, u.role,
              d.department_name, d.department_code,
              c.college_name, c.college_code
       FROM staff_profiles sp
       LEFT JOIN users u ON sp.user_id = u.user_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       LEFT JOIN colleges c ON d.college_id = c.college_id
       ${whereClause}
       ORDER BY sp.last_name, sp.first_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) as count 
       FROM staff_profiles sp
       LEFT JOIN users u ON sp.user_id = u.user_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       ${whereClause}`,
      params
    );
    const total = totalResult[0].count;

    return {
      staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Search staff by name or employee ID
  static async search(searchTerm, limit = 50) {
    return await query(
      `SELECT sp.*, u.username, u.email, u.role,
             d.department_name, d.department_code,
             c.college_name, c.college_code
      FROM staff_profiles sp
      LEFT JOIN users u ON sp.user_id = u.user_id
      LEFT JOIN departments d ON sp.department_id = d.department_id
      LEFT JOIN colleges c ON d.college_id = c.college_id
      WHERE (sp.first_name LIKE ? OR sp.last_name LIKE ? OR sp.employee_id LIKE ? OR u.username LIKE ?)
        AND u.is_active = TRUE
      ORDER BY sp.last_name, sp.first_name
      LIMIT ?`,
      [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        limit,
      ]
    );
  }

  // Get staff statistics for department
  static async getDepartmentStaffStatistics(departmentId) {
    const stats = await query(
      `SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN employment_type = 'full_time' THEN 1 ELSE 0 END) as full_time,
        SUM(CASE WHEN employment_type = 'part_time' THEN 1 ELSE 0 END) as part_time,
        SUM(CASE WHEN employment_type = 'contract' THEN 1 ELSE 0 END) as contract,
        SUM(CASE WHEN academic_rank = 'professor' THEN 1 ELSE 0 END) as professors,
        SUM(CASE WHEN academic_rank = 'associate_professor' THEN 1 ELSE 0 END) as associate_professors,
        SUM(CASE WHEN academic_rank = 'assistant_professor' THEN 1 ELSE 0 END) as assistant_professors,
        SUM(CASE WHEN academic_rank = 'lecturer' THEN 1 ELSE 0 END) as lecturers,
        SUM(CASE WHEN academic_rank = 'assistant_lecturer' THEN 1 ELSE 0 END) as assistant_lecturers,
        SUM(CASE WHEN academic_rank = 'graduate_assistant' THEN 1 ELSE 0 END) as graduate_assistants,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female,
        SUM(CASE WHEN gender = 'other' OR gender IS NULL THEN 1 ELSE 0 END) as other_gender,
        AVG(YEAR(CURDATE()) - YEAR(hire_date)) as avg_years_service
       FROM staff_profiles sp
       LEFT JOIN users u ON sp.user_id = u.user_id
       WHERE sp.department_id = ? AND u.is_active = TRUE`,
      [departmentId]
    );

    return stats[0];
  }

  // Get staff statistics for college
  static async getCollegeStaffStatistics(collegeId) {
    const stats = await query(
      `SELECT 
        COUNT(*) as total_staff,
        d.department_name,
        d.department_code,
        COUNT(CASE WHEN sp.academic_rank = 'professor' THEN 1 END) as professors,
        COUNT(CASE WHEN sp.academic_rank = 'associate_professor' THEN 1 END) as associate_professors,
        COUNT(CASE WHEN sp.academic_rank = 'assistant_professor' THEN 1 END) as assistant_professors,
        COUNT(CASE WHEN sp.academic_rank = 'lecturer' THEN 1 END) as lecturers
       FROM staff_profiles sp
       LEFT JOIN users u ON sp.user_id = u.user_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       WHERE d.college_id = ? AND u.is_active = TRUE
       GROUP BY d.department_id
       ORDER BY d.department_name`,
      [collegeId]
    );

    return stats;
  }

  // Get overall university staff statistics
  static async getUniversityStaffStatistics() {
    const stats = await query(
      `SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN employment_type = 'full_time' THEN 1 ELSE 0 END) as full_time,
        SUM(CASE WHEN employment_type = 'part_time' THEN 1 ELSE 0 END) as part_time,
        SUM(CASE WHEN employment_type = 'contract' THEN 1 ELSE 0 END) as contract,
        SUM(CASE WHEN academic_rank = 'professor' THEN 1 ELSE 0 END) as professors,
        SUM(CASE WHEN academic_rank = 'associate_professor' THEN 1 ELSE 0 END) as associate_professors,
        SUM(CASE WHEN academic_rank = 'assistant_professor' THEN 1 ELSE 0 END) as assistant_professors,
        SUM(CASE WHEN academic_rank = 'lecturer' THEN 1 ELSE 0 END) as lecturers,
        SUM(CASE WHEN academic_rank = 'assistant_lecturer' THEN 1 ELSE 0 END) as assistant_lecturers,
        SUM(CASE WHEN academic_rank = 'graduate_assistant' THEN 1 ELSE 0 END) as graduate_assistants,
        c.college_name,
        COUNT(*) as college_staff_count
       FROM staff_profiles sp
       LEFT JOIN users u ON sp.user_id = u.user_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       LEFT JOIN colleges c ON d.college_id = c.college_id
       WHERE u.is_active = TRUE
       GROUP BY c.college_id
       ORDER BY college_staff_count DESC`
    );

    return stats;
  }

  // Get staff workload summary for current active semester
  static async getStaffWorkloadSummary(staffId, semesterId = null) {
    let semesterCondition = "";
    const params = [staffId];

    if (semesterId) {
      semesterCondition = "AND wr.semester_id = ?";
      params.push(semesterId);
    } else {
      // Get active semester
      const [activeSemester] = await query(
        "SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1"
      );
      if (activeSemester) {
        semesterCondition = "AND wr.semester_id = ?";
        params.push(activeSemester.semester_id);
      }
    }

    const workload = await query(
      `SELECT 
        wr.workload_id,
        wr.total_load,
        wr.status as rp_status,
        s.semester_code,
        s.semester_name,
        s.semester_type,
        (SELECT SUM(total_payment) FROM workload_nrp wn 
         WHERE wn.staff_id = ? ${semesterId ? "AND wn.semester_id = ?" : ""} 
         AND wn.status = 'finance_approved') as total_nrp_payments
       FROM workload_rp wr
       LEFT JOIN semesters s ON wr.semester_id = s.semester_id
       WHERE wr.staff_id = ? ${semesterCondition}
       ORDER BY s.start_date DESC
       LIMIT 1`,
      params
    );

    return workload[0] || null;
  }

  // Get staff rank history
  static async getRankHistory(staffId) {
    const history = await query(
      `SELECT 
        al.action,
        al.old_value,
        al.new_value,
        al.timestamp,
        u.username as changed_by
       FROM audit_log al
       LEFT JOIN users u ON al.user_id = u.user_id
       WHERE al.entity = 'staff_profiles' 
         AND al.entity_id = ?
         AND al.action LIKE '%rank%'
       ORDER BY al.timestamp DESC
       LIMIT 10`,
      [staffId]
    );

    return history;
  }

  // Assign staff to department
  static async assignToDepartment(staffId, departmentId) {
    await query(
      "UPDATE staff_profiles SET department_id = ?, updated_at = CURRENT_TIMESTAMP WHERE staff_id = ?",
      [departmentId, staffId]
    );

    return this.findById(staffId);
  }

  // Update academic rank
  static async updateRank(staffId, newRank, changedBy, reason = null) {
    const staff = await this.findById(staffId);
    if (!staff) return null;

    // Log the change in audit
    await query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, old_value, new_value)
       VALUES (?, 'UPDATE_RANK', 'staff_profiles', ?, ?, ?)`,
      [changedBy, staffId, staff.academic_rank, newRank]
    );

    // Update rank
    await query(
      "UPDATE staff_profiles SET academic_rank = ?, updated_at = CURRENT_TIMESTAMP WHERE staff_id = ?",
      [newRank, staffId]
    );

    return this.findById(staffId);
  }

  // Get staff by rank
  static async findByRank(rank, departmentId = null) {
    let whereClause = "WHERE sp.academic_rank = ? AND u.is_active = TRUE";
    const params = [rank];

    if (departmentId) {
      whereClause += " AND sp.department_id = ?";
      params.push(departmentId);
    }

    const staff = await query(
      `SELECT sp.*, u.username, u.email,
              d.department_name, d.department_code,
              c.college_name, c.college_code
       FROM staff_profiles sp
       LEFT JOIN users u ON sp.user_id = u.user_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       LEFT JOIN colleges c ON d.college_id = c.college_id
       ${whereClause}
       ORDER BY sp.last_name, sp.first_name`,
      params
    );
    return staff;
  }
}

export default StaffModel;