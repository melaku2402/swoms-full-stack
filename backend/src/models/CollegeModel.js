import { query } from "../config/database.js"; 

class CollegeModel {
  // Create college
  static async create(collegeData) {
    const {
      college_code,
      college_name,
      dean_user_id = null,
      status = "active",
    } = collegeData;

    const result = await query(
      "INSERT INTO colleges (college_code, college_name, dean_user_id, status) VALUES (?, ?, ?, ?)",
      [college_code, college_name, dean_user_id, status]
    );

    return this.findById(result.insertId);
  }

  // Find college by ID
  static async findById(collegeId) {
    const colleges = await query(
      `SELECT c.*, 
              u.username as dean_username, u.email as dean_email,
              (SELECT COUNT(*) FROM departments WHERE college_id = c.college_id) as department_count
       FROM colleges c
       LEFT JOIN users u ON c.dean_user_id = u.user_id
       WHERE c.college_id = ?`,
      [collegeId]
    );
    return colleges[0] || null;
  }

  // Find college by code
  static async findByCode(collegeCode) {
    const colleges = await query(
      "SELECT * FROM colleges WHERE college_code = ?",
      [collegeCode]
    );
    return colleges[0] || null;
  }

  // Get all colleges with pagination
  static async findAll(page = 1, limit = 10, includeStats = false) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT c.*, 
             u.username as dean_username,
             (SELECT COUNT(*) FROM departments WHERE college_id = c.college_id) as department_count
      FROM colleges c
      LEFT JOIN users u ON c.dean_user_id = u.user_id
      ORDER BY c.college_name
      LIMIT ? OFFSET ?
    `;

    const colleges = await query(sql, [limit, offset]);

    const totalResult = await query("SELECT COUNT(*) as count FROM colleges");
    const total = totalResult[0].count;

    // Get statistics if requested
    let stats = null;
    if (includeStats) {
      stats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM departments WHERE college_id IN (SELECT college_id FROM colleges)) as total_departments,
          (SELECT COUNT(*) FROM staff_profiles WHERE department_id IN 
            (SELECT department_id FROM departments WHERE college_id IN (SELECT college_id FROM colleges))) as total_staff
      `);
      stats = stats[0];
    }

    return {
      colleges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    };
  }

  // Update college
  static async update(collegeId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), collegeId];

    await query(
      `UPDATE colleges SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE college_id = ?`,
      values
    );

    return this.findById(collegeId);
  }

  // Delete college
  static async delete(collegeId) {
    await query("DELETE FROM colleges WHERE college_id = ?", [collegeId]);
    return true;
  }

  // Get college statistics
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

  // Assign dean to college
  static async assignDean(collegeId, userId) {
    await query(
      "UPDATE colleges SET dean_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE college_id = ?",
      [userId, collegeId]
    );
    return this.findById(collegeId);
  }
}

export default CollegeModel;
