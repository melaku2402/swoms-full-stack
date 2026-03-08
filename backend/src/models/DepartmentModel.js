// import { query } from "../config/database.js";

// class DepartmentModel {
//   // Create department
//   static async create(departmentData) {
//     const {
//       department_code,
//       department_name,
//       college_id,
//       head_user_id = null,
//       status = "active",
//     } = departmentData;

//     const result = await query(
//       "INSERT INTO departments (department_code, department_name, college_id, head_user_id, status) VALUES (?, ?, ?, ?, ?)",
//       [department_code, department_name, college_id, head_user_id, status]
//     );

//     return this.findById(result.insertId);
//   }

//   // Find department by ID
//   static async findById(departmentId) {
//     const departments = await query(
//       `SELECT d.*, 
//               c.college_name, c.college_code,
//               u.username as head_username, u.email as head_email,
//               (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) as staff_count,
//               (SELECT COUNT(*) FROM courses WHERE department_id = d.department_id) as course_count
//        FROM departments d
//        LEFT JOIN colleges c ON d.college_id = c.college_id
//        LEFT JOIN users u ON d.head_user_id = u.user_id
//        WHERE d.department_id = ?`,
//       [departmentId]
//     );
//     return departments[0] || null;
//   }

//   // Find department by code
//   static async findByCode(departmentCode) {
//     const departments = await query(
//       `SELECT d.*, c.college_name, c.college_code
//        FROM departments d
//        LEFT JOIN colleges c ON d.college_id = c.college_id
//        WHERE d.department_code = ?`,
//       [departmentCode]
//     );
//     return departments[0] || null;
//   }

//   // Get all departments in a college
//   static async findByCollege(collegeId, page = 1, limit = 20) {
//     const offset = (page - 1) * limit;

//     const departments = await query(
//       `SELECT d.*, 
//               c.college_name,
//               u.username as head_username,
//               (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) as staff_count
//        FROM departments d
//        LEFT JOIN colleges c ON d.college_id = c.college_id
//        LEFT JOIN users u ON d.head_user_id = u.user_id
//        WHERE d.college_id = ?
//        ORDER BY d.department_name
//        LIMIT ? OFFSET ?`,
//       [collegeId, limit, offset]
//     );

//     const totalResult = await query(
//       "SELECT COUNT(*) as count FROM departments WHERE college_id = ?",
//       [collegeId]
//     );
//     const total = totalResult[0].count;

//     return {
//       departments,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     };
//   }

//   // Get all departments with pagination
//   static async findAll(page = 1, limit = 20) {
//     const offset = (page - 1) * limit;

//     const departments = await query(
//       `SELECT d.*, 
//               c.college_name, c.college_code,
//               u.username as head_username,
//               (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) as staff_count
//        FROM departments d
//        LEFT JOIN colleges c ON d.college_id = c.college_id
//        LEFT JOIN users u ON d.head_user_id = u.user_id
//        ORDER BY c.college_name, d.department_name
//        LIMIT ? OFFSET ?`,
//       [limit, offset]
//     );

//     const totalResult = await query(
//       "SELECT COUNT(*) as count FROM departments"
//     );
//     const total = totalResult[0].count;

//     return {
//       departments,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     };
//   }

//   // Update department
//   static async update(departmentId, updateData) {
//     const fields = Object.keys(updateData);
//     if (fields.length === 0) return null;

//     const setClause = fields.map((field) => `${field} = ?`).join(", ");
//     const values = [...fields.map((field) => updateData[field]), departmentId];

//     await query(
//       `UPDATE departments SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE department_id = ?`,
//       values
//     );

//     return this.findById(departmentId);
//   }

//   // Delete department
//   static async delete(departmentId) {
//     await query("DELETE FROM departments WHERE department_id = ?", [
//       departmentId,
//     ]);
//     return true;
//   }

//   // Assign head to department
//   static async assignHead(departmentId, userId) {
//     await query(
//       "UPDATE departments SET head_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE department_id = ?",
//       [userId, departmentId]
//     );
//     return this.findById(departmentId);
//   }

//   // Get department statistics
//   static async getStatistics(collegeId = null) {
//     let whereClause = "";
//     const params = [];

//     if (collegeId) {
//       whereClause = "WHERE d.college_id = ?";
//       params.push(collegeId);
//     }

//     const stats = await query(
//       `SELECT 
//         d.department_id,
//         d.department_name,
//         c.college_name,
//         COUNT(DISTINCT sp.staff_id) as staff_count,
//         COUNT(DISTINCT co.course_id) as course_count,
//         COUNT(DISTINCT p.program_id) as program_count
//        FROM departments d
//        LEFT JOIN colleges c ON d.college_id = c.college_id
//        LEFT JOIN staff_profiles sp ON d.department_id = sp.department_id
//        LEFT JOIN courses co ON d.department_id = co.department_id
//        LEFT JOIN programs p ON d.department_id = p.department_id
//        ${whereClause}
//        GROUP BY d.department_id
//        ORDER BY c.college_name, d.department_name`,
//       params
//     );

//     return stats;
//   }
// }

// export default DepartmentModel;

import { query } from "../config/database.js";

class DepartmentModel {
  // ==================== CORE CRUD METHODS ====================

  // Create department
  static async create(departmentData) {
    const {
      department_code,
      department_name,
      college_id,
      head_user_id = null,
      status = "active",
    } = departmentData;

    const result = await query(
      `INSERT INTO departments 
       (department_code, department_name, college_id, head_user_id, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [department_code, department_name, college_id, head_user_id, status]
    );

    return this.findById(result.insertId);
  }

  // Find department by ID
  static async findById(departmentId) {
    const departments = await query(
      `SELECT 
         d.*,
         c.college_code,
         c.college_name,
         u.username as head_username,
         u.email as head_email,
         CONCAT(s.first_name, ' ', s.last_name) as head_name,
         (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) as staff_count,
         (SELECT COUNT(*) FROM courses WHERE department_id = d.department_id) as course_count,
         (SELECT COUNT(*) FROM programs WHERE department_id = d.department_id) as program_count
       FROM departments d
       LEFT JOIN colleges c ON d.college_id = c.college_id
       LEFT JOIN users u ON d.head_user_id = u.user_id
       LEFT JOIN staff_profiles s ON u.user_id = s.user_id
       WHERE d.department_id = ?`,
      [departmentId]
    );
    return departments[0] || null;
  }

  // Find department by code
  static async findByCode(departmentCode) {
    const departments = await query(
      "SELECT * FROM departments WHERE department_code = ?",
      [departmentCode]
    );
    return departments[0] || null;
  }

  // Get all departments with pagination
  static async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT d.*, 
             c.college_name,
             u.username as head_username,
             (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) as staff_count,
             (SELECT COUNT(*) FROM courses WHERE department_id = d.department_id) as course_count
      FROM departments d
      LEFT JOIN colleges c ON d.college_id = c.college_id
      LEFT JOIN users u ON d.head_user_id = u.user_id
      ORDER BY d.department_name
      LIMIT ? OFFSET ?
    `;

    const departments = await query(sql, [limit, offset]);

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM departments"
    );
    const total = totalResult[0].count;

    return {
      departments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get departments by college
  static async findByCollege(collegeId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const sql = `
      SELECT 
        d.*,
        u.username as head_username,
        (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) as staff_count,
        (SELECT COUNT(*) FROM courses WHERE department_id = d.department_id) as course_count
      FROM departments d
      LEFT JOIN users u ON d.head_user_id = u.user_id
      WHERE d.college_id = ? AND d.status = 'active'
      ORDER BY d.department_name
      LIMIT ? OFFSET ?
    `;

    const departments = await query(sql, [collegeId, limit, offset]);

    const totalResult = await query(
      "SELECT COUNT(*) as total FROM departments WHERE college_id = ? AND status = 'active'",
      [collegeId]
    );
    const total = totalResult[0].total;

    return {
      departments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update department
  static async update(departmentId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), departmentId];

    await query(
      `UPDATE departments 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE department_id = ?`,
      values
    );

    return this.findById(departmentId);
  }

  // Delete department
  static async delete(departmentId) {
    await query("DELETE FROM departments WHERE department_id = ?", [
      departmentId,
    ]);
    return true;
  }

  // ==================== STATISTICS METHODS ====================

  // Get department statistics
  static async getStatistics() {
    const stats = await query(`
      SELECT 
        c.college_id,
        c.college_name,
        COUNT(DISTINCT d.department_id) as department_count,
        COUNT(DISTINCT sp.staff_id) as staff_count,
        COUNT(DISTINCT co.course_id) as course_count
      FROM colleges c
      LEFT JOIN departments d ON c.college_id = d.college_id
      LEFT JOIN staff_profiles sp ON d.department_id = sp.department_id
      LEFT JOIN courses co ON d.department_id = co.department_id
      GROUP BY c.college_id
    `);

    return stats;
  }

  // Get detailed statistics for a specific department
  static async getDetailedStatistics(departmentId) {
    const stats = await query(
      `
      SELECT 
        d.department_id,
        d.department_name,
        d.department_code,
        c.college_name,
        (SELECT COUNT(*) FROM staff_profiles WHERE department_id = d.department_id) as total_staff,
        (SELECT COUNT(*) FROM courses WHERE department_id = d.department_id) as total_courses,
        (SELECT COUNT(*) FROM programs WHERE department_id = d.department_id) as total_programs
      FROM departments d
      LEFT JOIN colleges c ON d.college_id = c.college_id
      WHERE d.department_id = ?
    `,
      [departmentId]
    );

    return stats[0];
  }

  // Assign head to department
  static async assignHead(departmentId, userId) {
    await query(
      `UPDATE departments 
       SET head_user_id = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE department_id = ?`,
      [userId, departmentId]
    );
    return this.findById(departmentId);
  }

  // ==================== DASHBOARD METHODS ====================

  // Get department dashboard data
  static async getDashboardData(departmentId, timeRange = "current_semester") {
    const dashboard = await query(
      `
      SELECT 
        'overview' as section,
        JSON_OBJECT(
          'staff_count', (SELECT COUNT(*) FROM staff_profiles WHERE department_id = ?),
          'course_count', (SELECT COUNT(*) FROM courses WHERE department_id = ? AND status = 'active'),
          'program_count', (SELECT COUNT(*) FROM programs WHERE department_id = ? AND status = 'active')
        ) as data
      
      UNION ALL
      
      SELECT 
        'staff_by_rank' as section,
        JSON_OBJECTAGG(
          sp.academic_rank,
          COUNT(*)
        ) as data
      FROM staff_profiles sp
      WHERE sp.department_id = ?
      GROUP BY sp.department_id
      
      UNION ALL
      
      SELECT 
        'workload_status' as section,
        JSON_OBJECT(
          'draft', (SELECT COUNT(*) FROM workload_rp wr 
                    JOIN staff_profiles sp ON wr.staff_id = sp.staff_id 
                    WHERE sp.department_id = ? AND wr.status = 'draft'),
          'submitted', (SELECT COUNT(*) FROM workload_rp wr 
                       JOIN staff_profiles sp ON wr.staff_id = sp.staff_id 
                       WHERE sp.department_id = ? AND wr.status = 'submitted'),
          'approved', (SELECT COUNT(*) FROM workload_rp wr 
                       JOIN staff_profiles sp ON wr.staff_id = sp.staff_id 
                       WHERE sp.department_id = ? AND wr.status IN ('dean_approved', 'hr_approved', 'vpaa_approved')),
          'rejected', (SELECT COUNT(*) FROM workload_rp wr 
                       JOIN staff_profiles sp ON wr.staff_id = sp.staff_id 
                       WHERE sp.department_id = ? AND wr.status = 'rejected')
        ) as data
      `,
      [
        departmentId,
        departmentId,
        departmentId,
        departmentId,
        departmentId,
        departmentId,
        departmentId,
        departmentId,
      ]
    );

    // Transform results
    const result = {};
    dashboard.forEach((row) => {
      if (row.data) {
        result[row.section] = JSON.parse(row.data);
      }
    });

    return result;
  }

  // Get department staff list with workload
  static async getDepartmentStaff(departmentId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const sql = `
      SELECT 
        sp.*,
        u.username,
        u.email,
        u.role,
        u.is_active as user_active,
        d.department_name,
        c.college_name,
        (SELECT COUNT(*) FROM workload_rp WHERE staff_id = sp.staff_id) as total_workloads,
        (SELECT SUM(total_load) FROM workload_rp WHERE staff_id = sp.staff_id 
         AND semester_id = (SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1)) as current_semester_load
      FROM staff_profiles sp
      JOIN users u ON sp.user_id = u.user_id
      JOIN departments d ON sp.department_id = d.department_id
      JOIN colleges c ON d.college_id = c.college_id
      WHERE sp.department_id = ?
      ORDER BY sp.last_name, sp.first_name
      LIMIT ? OFFSET ?
    `;

    const staff = await query(sql, [departmentId, limit, offset]);

    const totalResult = await query(
      "SELECT COUNT(*) as total FROM staff_profiles WHERE department_id = ?",
      [departmentId]
    );
    const total = totalResult[0].total;

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

  // Get department courses with sections
  static async getDepartmentCourses(departmentId, semesterId = null) {
    const currentSemester =
      semesterId ||
      `
      (SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1)
    `;

    const sql = `
      SELECT 
        co.*,
        COUNT(DISTINCT sec.section_id) as section_count,
        SUM(sec.student_count) as total_students
      FROM courses co
      LEFT JOIN sections sec ON co.course_id = sec.course_id 
        AND sec.semester_id = ${currentSemester}
      WHERE co.department_id = ?
      GROUP BY co.course_id
      ORDER BY co.course_code
    `;

    const courses = await query(sql, [departmentId]);

    return {
      courses,
      summary: {
        total_courses: courses.length,
      },
    };
  }

  // Get department workload summary
  static async getWorkloadSummary(departmentId, semesterId = null) {
    const currentSemester =
      semesterId ||
      `
      (SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1)
    `;

    const summary = await query(
      `
      SELECT 
        sp.staff_id,
        CONCAT(sp.first_name, ' ', sp.last_name) as staff_name,
        sp.academic_rank,
        sp.employment_type,
        COUNT(wr.workload_id) as total_workloads,
        SUM(wr.total_load) as total_load
      FROM staff_profiles sp
      LEFT JOIN workload_rp wr ON sp.staff_id = wr.staff_id
        AND wr.semester_id = ${currentSemester}
      WHERE sp.department_id = ?
      GROUP BY sp.staff_id
      ORDER BY total_load DESC
      `,
      [departmentId]
    );

    const departmentSummary = await query(
      `
      SELECT 
        COUNT(DISTINCT wr.staff_id) as staff_with_workload,
        SUM(wr.total_load) as total_department_load,
        AVG(wr.total_load) as avg_workload_per_staff
      FROM workload_rp wr
      JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
      WHERE sp.department_id = ?
      AND wr.semester_id = ${currentSemester}
      `,
      [departmentId]
    );

    return {
      individual_summary: summary,
      department_summary: departmentSummary[0] || {},
    };
  }
}

export default DepartmentModel;