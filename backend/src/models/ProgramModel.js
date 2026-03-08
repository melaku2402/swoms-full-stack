// src/models/ProgramModel.js
import { query } from "../config/database.js";
import { PROGRAM_TYPES } from "../config/constants.js";

class ProgramModel {
  // Create program
  static async create(programData) {
    const {
      program_code,
      program_name,
      department_id,
      program_type,
      status = "active",
    } = programData;

    const result = await query(
      `INSERT INTO programs (program_code, program_name, department_id, program_type, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [program_code, program_name, department_id, program_type, status]
    );

    return this.findById(result.insertId);
  }

  // Find program by ID
  static async findById(programId) {
    const programs = await query(
      `SELECT p.*, 
              d.department_name, d.department_code,
              c.college_name, c.college_code,
              (SELECT COUNT(*) FROM courses WHERE program_id = p.program_id) as course_count,
              (SELECT COUNT(*) FROM workload_nrp WHERE program_type = p.program_type) as nrp_workload_count
       FROM programs p
       LEFT JOIN departments d ON p.department_id = d.department_id
       LEFT JOIN colleges c ON d.college_id = c.college_id
       WHERE p.program_id = ?`,
      [programId]
    );
    return programs[0] || null;
  }

  // Find program by code
  static async findByCode(programCode) {
    const programs = await query(
      `SELECT p.*, d.department_name, d.department_code
       FROM programs p
       LEFT JOIN departments d ON p.department_id = d.department_id
       WHERE p.program_code = ?`,
      [programCode]
    );
    return programs[0] || null;
  }

  // Get programs by department
  static async findByDepartment(departmentId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const programs = await query(
      `SELECT p.*, 
              (SELECT COUNT(*) FROM courses WHERE program_id = p.program_id) as course_count
       FROM programs p
       WHERE p.department_id = ?
       ORDER BY p.program_type, p.program_name
       LIMIT ? OFFSET ?`,
      [departmentId, limit, offset]
    );

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM programs WHERE department_id = ?",
      [departmentId]
    );
    const total = totalResult[0].count;

    return {
      programs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get programs by type
  static async findByType(programType, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const programs = await query(
      `SELECT p.*, 
              d.department_name, d.department_code,
              (SELECT COUNT(*) FROM courses WHERE program_id = p.program_id) as course_count
       FROM programs p
       LEFT JOIN departments d ON p.department_id = d.department_id
       WHERE p.program_type = ?
       ORDER BY p.program_name
       LIMIT ? OFFSET ?`,
      [programType, limit, offset]
    );

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM programs WHERE program_type = ?",
      [programType]
    );
    const total = totalResult[0].count;

    return {
      programs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get all programs with pagination and filters
  static async findAll(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = "";
    const params = [];

    if (filters.department_id) {
      whereClause = "WHERE p.department_id = ?";
      params.push(filters.department_id);
    }

    if (filters.college_id) {
      whereClause = whereClause
        ? `${whereClause} AND d.college_id = ?`
        : "WHERE d.college_id = ?";
      params.push(filters.college_id);
    }

    if (filters.program_type) {
      whereClause = whereClause
        ? `${whereClause} AND p.program_type = ?`
        : "WHERE p.program_type = ?";
      params.push(filters.program_type);
    }

    if (filters.status) {
      whereClause = whereClause
        ? `${whereClause} AND p.status = ?`
        : "WHERE p.status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      whereClause = whereClause
        ? `${whereClause} AND (p.program_name LIKE ? OR p.program_code LIKE ?)`
        : "WHERE (p.program_name LIKE ? OR p.program_code LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    const programs = await query(
      `SELECT p.*, 
              d.department_name, d.department_code,
              c.college_name, c.college_code,
              (SELECT COUNT(*) FROM courses WHERE program_id = p.program_id) as course_count
       FROM programs p
       LEFT JOIN departments d ON p.department_id = d.department_id
       LEFT JOIN colleges c ON d.college_id = c.college_id
       ${whereClause}
       ORDER BY p.program_type, p.program_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) as count 
       FROM programs p
       LEFT JOIN departments d ON p.department_id = d.department_id
       ${whereClause}`,
      params
    );
    const total = totalResult[0].count;

    return {
      programs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update program
  static async update(programId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), programId];

    await query(
      `UPDATE programs SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE program_id = ?`,
      values
    );

    return this.findById(programId);
  }

  // Delete program
  static async delete(programId) {
    await query("DELETE FROM programs WHERE program_id = ?", [programId]);
    return true;
  }

  // Get program statistics
  static async getStatistics(departmentId = null, programType = null) {
    let whereClause = "";
    const params = [];

    if (departmentId) {
      whereClause = "WHERE p.department_id = ?";
      params.push(departmentId);
    }

    if (programType) {
      whereClause = whereClause
        ? `${whereClause} AND p.program_type = ?`
        : "WHERE p.program_type = ?";
      params.push(programType);
    }

    const stats = await query(
      `SELECT 
        p.program_type,
        COUNT(*) as program_count,
        SUM((SELECT COUNT(*) FROM courses WHERE program_id = p.program_id)) as total_courses,
        SUM((SELECT COUNT(*) FROM sections s 
             JOIN courses c ON s.course_id = c.course_id 
             WHERE c.program_id = p.program_id)) as total_sections,
        SUM((SELECT COUNT(*) FROM workload_nrp WHERE program_type = p.program_type AND status = 'finance_approved')) as completed_nrp_workloads
       FROM programs p
       ${whereClause}
       GROUP BY p.program_type
       ORDER BY program_count DESC`,
      params
    );

    return stats;
  }

  // Get program types statistics for dashboard
  static async getProgramTypesDashboard() {
    const stats = await query(
      `SELECT 
        program_type,
        COUNT(*) as count,
        (SELECT COUNT(*) FROM courses c WHERE c.program_type = p.program_type) as course_count,
        (SELECT COUNT(*) FROM sections s 
         JOIN courses c ON s.course_id = c.course_id 
         WHERE c.program_type = p.program_type) as section_count
       FROM programs p
       GROUP BY program_type`
    );

    return stats;
  }

  // Check if program has courses
  static async hasCourses(programId) {
    const result = await query(
      "SELECT COUNT(*) as count FROM courses WHERE program_id = ?",
      [programId]
    );
    return result[0].count > 0;
  }

  // Get all program types with counts
  static async getProgramTypes() {
    const types = await query(
      `SELECT 
        program_type,
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT department_id) as department_ids
       FROM programs 
       GROUP BY program_type`
    );

    return types;
  }

  // Assign courses to program
  static async assignCourses(programId, courseIds) {
    // Update multiple courses at once
    const placeholders = courseIds.map(() => "?").join(",");
    await query(
      `UPDATE courses SET program_id = ? WHERE course_id IN (${placeholders})`,
      [programId, ...courseIds]
    );

    return this.findById(programId);
  }
}

export default ProgramModel;
