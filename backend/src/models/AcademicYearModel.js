// src/models/AcademicYearModel.js
import { query } from "../config/database.js";

class AcademicYearModel {
  // Create academic year
  static async create(academicYearData) {
    const {
      year_code,
      year_name,
      start_date,
      end_date,
      is_active = false,
    } = academicYearData;

    // If setting this as active, deactivate others first
    if (is_active) {
      await query("UPDATE academic_years SET is_active = FALSE");
    }

    const result = await query(
      `INSERT INTO academic_years (year_code, year_name, start_date, end_date, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [year_code, year_name, start_date, end_date, is_active]
    );

    return this.findById(result.insertId);
  }

  // Find academic year by ID
  static async findById(academicYearId) {
    const years = await query(
      `SELECT ay.*, 
              (SELECT COUNT(*) FROM semesters WHERE academic_year_id = ay.academic_year_id) as semester_count
       FROM academic_years ay
       WHERE ay.academic_year_id = ?`,
      [academicYearId]
    );
    return years[0] || null;
  }

  // Find academic year by code
  static async findByCode(yearCode) {
    const years = await query(
      "SELECT * FROM academic_years WHERE year_code = ?",
      [yearCode]
    );
    return years[0] || null;
  }

  // Get all academic years with pagination
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const years = await query(
      `SELECT ay.*, 
              (SELECT COUNT(*) FROM semesters WHERE academic_year_id = ay.academic_year_id) as semester_count,
              (SELECT COUNT(*) FROM workload_rp wr 
               JOIN semesters s ON wr.semester_id = s.semester_id 
               WHERE s.academic_year_id = ay.academic_year_id) as workload_count
       FROM academic_years ay
       ORDER BY ay.start_date DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM academic_years"
    );
    const total = totalResult[0].count;

    return {
      years,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get active academic year
  static async getActive() {
    const years = await query(
      "SELECT * FROM academic_years WHERE is_active = TRUE LIMIT 1"
    );
    return years[0] || null;
  }

  // Update academic year
  static async update(academicYearId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    // If setting as active, deactivate others first
    if (updateData.is_active === true) {
      await query("UPDATE academic_years SET is_active = FALSE");
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [
      ...fields.map((field) => updateData[field]),
      academicYearId,
    ];

    await query(
      `UPDATE academic_years SET ${setClause} WHERE academic_year_id = ?`,
      values
    );

    return this.findById(academicYearId);
  }

  // Delete academic year
  static async delete(academicYearId) {
    await query("DELETE FROM academic_years WHERE academic_year_id = ?", [
      academicYearId,
    ]);
    return true;
  }

  // Activate academic year (deactivate all others first)
  static async activate(academicYearId) {
    await query("UPDATE academic_years SET is_active = FALSE");
    await query(
      "UPDATE academic_years SET is_active = TRUE WHERE academic_year_id = ?",
      [academicYearId]
    );
    return this.findById(academicYearId);
  }

  // Deactivate academic year
  static async deactivate(academicYearId) {
    await query(
      "UPDATE academic_years SET is_active = FALSE WHERE academic_year_id = ?",
      [academicYearId]
    );
    return this.findById(academicYearId);
  }

  // Get statistics for academic year
  static async getStatistics(academicYearId) {
    const stats = await query(
      `SELECT 
        ay.year_code,
        ay.year_name,
        COUNT(DISTINCT s.semester_id) as semester_count,
        COUNT(DISTINCT wr.workload_id) as regular_workloads,
        COUNT(DISTINCT wn.nrp_id) as npr_workloads,
        COUNT(DISTINCT ps.payment_id) as payment_sheets,
        SUM(IFNULL(ps.net_amount, 0)) as total_payments
       FROM academic_years ay
       LEFT JOIN semesters s ON ay.academic_year_id = s.academic_year_id
       LEFT JOIN workload_rp wr ON s.semester_id = wr.semester_id
       LEFT JOIN workload_nrp wn ON s.semester_id = wn.semester_id
       LEFT JOIN payment_sheets ps ON (wn.nrp_id = ps.nrp_id OR wr.workload_id = ps.overload_id)
       WHERE ay.academic_year_id = ?
       GROUP BY ay.academic_year_id`,
      [academicYearId]
    );

    return stats[0] || {};
  }
}

export default AcademicYearModel;
