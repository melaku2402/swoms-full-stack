import { query } from "../config/database.js";

class ProgramYearModel {
  // Create program year
  static async create(programYearData) {
    const {
      program_id,
      year_number,
      year_name = `Year ${year_number}`,
      total_credits = 0,
    } = programYearData;

    const result = await query(
      `INSERT INTO program_years (program_id, year_number, year_name, total_credits) 
       VALUES (?, ?, ?, ?)`,
      [program_id, year_number, year_name, total_credits]
    );

    return this.findById(result.insertId);
  }

  // Find by ID
  static async findById(programYearId) {
    const years = await query(
      `SELECT py.*, p.program_name, p.program_code, p.program_type
       FROM program_years py
       LEFT JOIN programs p ON py.program_id = p.program_id
       WHERE py.program_year_id = ?`,
      [programYearId]
    );
    return years[0] || null;
  }

  // Find years by program
  static async findByProgram(programId) {
    return await query(
      `SELECT py.*, 
              (SELECT COUNT(*) FROM program_courses pc WHERE pc.program_year_id = py.program_year_id) as course_count,
              (SELECT SUM(c.credit_hours) FROM program_courses pc 
               LEFT JOIN courses c ON pc.course_id = c.course_id 
               WHERE pc.program_year_id = py.program_year_id) as total_credits
       FROM program_years py
       WHERE py.program_id = ?
       ORDER BY py.year_number`,
      [programId]
    );
  }

  // Update program year
  static async update(programYearId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), programYearId];

    await query(
      `UPDATE program_years SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE program_year_id = ?`,
      values
    );

    return this.findById(programYearId);
  }

  // Delete program year
  static async delete(programYearId) {
    await query("DELETE FROM program_years WHERE program_year_id = ?", [
      programYearId,
    ]);
    return true;
  }

  // Get year statistics
  static async getYearStatistics(programId) {
    const stats = await query(
      `SELECT 
        py.year_number,
        py.year_name,
        COUNT(DISTINCT pc.course_id) as course_count,
        SUM(c.credit_hours) as total_credits,
        COUNT(CASE WHEN pc.semester_number = 1 THEN 1 END) as semester1_courses,
        COUNT(CASE WHEN pc.semester_number = 2 THEN 1 END) as semester2_courses
       FROM program_years py
       LEFT JOIN program_courses pc ON py.program_year_id = pc.program_year_id
       LEFT JOIN courses c ON pc.course_id = c.course_id
       WHERE py.program_id = ?
       GROUP BY py.program_year_id
       ORDER BY py.year_number`,
      [programId]
    );

    return stats;
  }
}

export default ProgramYearModel;
