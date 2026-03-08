// src/models/SemesterModel.js
import { query } from "../config/database.js";

class SemesterModel {
  // Create semester
  static async create(semesterData) {
    const {
      academic_year_id,
      semester_code,
      semester_name,
      semester_type,
      start_date,
      end_date,
      is_active = false,
    } = semesterData;

    // If setting this as active, deactivate others first
    if (is_active) {
      await query("UPDATE semesters SET is_active = FALSE");
    }

    const result = await query(
      `INSERT INTO semesters 
       (academic_year_id, semester_code, semester_name, semester_type, start_date, end_date, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        academic_year_id,
        semester_code,
        semester_name,
        semester_type,
        start_date,
        end_date,
        is_active,
      ]
    );

    return this.findById(result.insertId);
  }

  // Find semester by ID
  static async findById(semesterId) {
    const semesters = await query(
      `SELECT s.*, 
              ay.year_code, ay.year_name,
              (SELECT COUNT(*) FROM sections WHERE semester_id = s.semester_id) as section_count,
              (SELECT COUNT(*) FROM workload_rp WHERE semester_id = s.semester_id) as rp_workload_count,
              (SELECT COUNT(*) FROM workload_nrp WHERE semester_id = s.semester_id) as nrp_workload_count
       FROM semesters s
       LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
       WHERE s.semester_id = ?`,
      [semesterId]
    );
    return semesters[0] || null;
  }

  // Find semester by code
  static async findByCode(semesterCode) {
    const semesters = await query(
      `SELECT s.*, ay.year_code, ay.year_name
       FROM semesters s
       LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
       WHERE s.semester_code = ?`,
      [semesterCode]
    );
    return semesters[0] || null;
  }

  // Get all semesters with pagination
  static async findAll(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = "";
    const params = [];

    if (filters.academic_year_id) {
      whereClause = "WHERE s.academic_year_id = ?";
      params.push(filters.academic_year_id);
    }

    if (filters.semester_type) {
      whereClause = whereClause
        ? `${whereClause} AND s.semester_type = ?`
        : "WHERE s.semester_type = ?";
      params.push(filters.semester_type);
    }

    if (filters.is_active !== undefined) {
      whereClause = whereClause
        ? `${whereClause} AND s.is_active = ?`
        : "WHERE s.is_active = ?";
      params.push(filters.is_active);
    }

    const semesters = await query(
      `SELECT s.*, 
              ay.year_code, ay.year_name,
              (SELECT COUNT(*) FROM sections WHERE semester_id = s.semester_id) as section_count
       FROM semesters s
       LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
       ${whereClause}
       ORDER BY s.start_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) as count FROM semesters s ${whereClause}`,
      params
    );
    const total = totalResult[0].count;

    return {
      semesters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get active semester
  static async getActive() {
    const semesters = await query(
      `SELECT s.*, ay.year_code, ay.year_name
       FROM semesters s
       LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
       WHERE s.is_active = TRUE 
       LIMIT 1`
    );
    return semesters[0] || null;
  }

  // Get semesters by academic year
  static async findByAcademicYear(academicYearId, includeStats = false) {
    let semesters = await query(
      `SELECT s.*, 
              (SELECT COUNT(*) FROM sections WHERE semester_id = s.semester_id) as section_count
       FROM semesters s
       WHERE s.academic_year_id = ?
       ORDER BY s.start_date`,
      [academicYearId]
    );

    if (includeStats) {
      // Add statistics for each semester
      for (let semester of semesters) {
        const stats = await this.getStatistics(semester.semester_id);
        semester.stats = stats;
      }
    }

    return semesters;
  }

  // Update semester
  static async update(semesterId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    // If setting as active, deactivate others first
    if (updateData.is_active === true) {
      await query("UPDATE semesters SET is_active = FALSE");
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), semesterId];

    await query(
      `UPDATE semesters SET ${setClause} WHERE semester_id = ?`,
      values
    );

    return this.findById(semesterId);
  }

  // Delete semester
  static async delete(semesterId) {
    await query("DELETE FROM semesters WHERE semester_id = ?", [semesterId]);
    return true;
  }

  // Activate semester (deactivate all others first)
  static async activate(semesterId) {
    await query("UPDATE semesters SET is_active = FALSE");
    await query("UPDATE semesters SET is_active = TRUE WHERE semester_id = ?", [
      semesterId,
    ]);
    return this.findById(semesterId);
  }

  // Deactivate semester
  static async deactivate(semesterId) {
    await query(
      "UPDATE semesters SET is_active = FALSE WHERE semester_id = ?",
      [semesterId]
    );
    return this.findById(semesterId);
  }

  // Get statistics for semester
  static async getStatistics(semesterId) {
    const stats = await query(
      `SELECT 
        s.semester_code,
        s.semester_name,
        s.semester_type,
        COUNT(DISTINCT sec.section_id) as total_sections,
        COUNT(DISTINCT wr.workload_id) as regular_workloads,
        COUNT(DISTINCT wn.nrp_id) as npr_workloads,
        SUM(DISTINCT wr.total_hours) as total_rp_hours,
        SUM(DISTINCT wn.total_payment) as total_nrp_payments,
        COUNT(DISTINCT ps.payment_id) as payment_sheets_generated
       FROM semesters s
       LEFT JOIN sections sec ON s.semester_id = sec.semester_id
       LEFT JOIN workload_rp wr ON s.semester_id = wr.semester_id
       LEFT JOIN workload_nrp wn ON s.semester_id = wn.semester_id
       LEFT JOIN payment_sheets ps ON (wn.nrp_id = ps.nrp_id OR wr.workload_id = ps.overload_id)
       WHERE s.semester_id = ?
       GROUP BY s.semester_id`,
      [semesterId]
    );

    return stats[0] || {};
  }

  // Get current semester based on date
  static async getCurrent() {
    const today = new Date().toISOString().split("T")[0];

    const semesters = await query(
      `SELECT s.*, ay.year_code, ay.year_name
       FROM semesters s
       LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
       WHERE ? BETWEEN s.start_date AND s.end_date
       LIMIT 1`,
      [today]
    );

    return semesters[0] || null;
  }
}

export default SemesterModel;
