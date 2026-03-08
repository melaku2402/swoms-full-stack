
// src/models/BatchYearModel.js
import { query } from "../config/database.js";

class BatchYearModel {
  // Create batch
  static async create(batchData) {
    const {
      program_id,
      batch_name,
      start_year,
      end_year,
      current_student_year = 1,
      status = "active",
      total_students = 0,
    } = batchData;

    const result = await query(
      `INSERT INTO batch_years 
       (program_id, batch_name, start_year, end_year, current_student_year, status, total_students)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [program_id, batch_name, start_year, end_year, current_student_year, status, total_students]
    );

    return this.findById(result.insertId);
  }

  // Find batch by ID
  static async findById(batchId) {
    const batches = await query(
      `SELECT b.*,
              p.program_code, p.program_name, p.program_type,
              p.duration_years,
              d.department_name, d.department_code
       FROM batch_years b
       INNER JOIN programs p ON b.program_id = p.program_id
       INNER JOIN departments d ON p.department_id = d.department_id
       WHERE b.batch_id = ?`,
      [batchId]
    );
    return batches[0] || null;
  }

  // Find batches by program
  static async findByProgram(programId) {
    const batches = await query(
      `SELECT b.*,
              COUNT(DISTINCT ca.assignment_id) as active_assignments
       FROM batch_years b
       LEFT JOIN course_assignments ca ON b.batch_id = ca.batch_id 
         AND ca.status IN ('assigned', 'accepted')
       WHERE b.program_id = ? AND b.status = 'active'
       GROUP BY b.batch_id
       ORDER BY b.start_year DESC, b.batch_name`,
      [programId]
    );

    return batches;
  }

  // Find batches by department
  static async findByDepartment(departmentId) {
    const batches = await query(
      `SELECT b.*,
              p.program_code, p.program_name, p.program_type,
              d.department_name
       FROM batch_years b
       INNER JOIN programs p ON b.program_id = p.program_id
       INNER JOIN departments d ON p.department_id = d.department_id
       WHERE p.department_id = ? AND b.status = 'active'
       ORDER BY b.start_year DESC, b.batch_name`,
      [departmentId]
    );

    return batches;
  }

  // Update batch
  static async update(batchId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), batchId];

    await query(
      `UPDATE batch_years SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE batch_id = ?`,
      values
    );

    return this.findById(batchId);
  }
}

export default BatchYearModel;