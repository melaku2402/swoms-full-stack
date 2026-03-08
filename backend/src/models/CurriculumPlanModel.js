// models/CurriculumPlanModel.js
import { query } from "../config/database.js";

class CurriculumPlanModel {
  // Create curriculum plan
  static async create(planData) {
    const {
      department_id,
      program_id = null,
      year,
      semester,
      course_id,
      is_core = true,
      is_elective = false,
      prerequisites = null,
    } = planData;

    const result = await query(
      `INSERT INTO curriculum_plans 
       (department_id, program_id, year, semester, course_id, is_core, is_elective, prerequisites) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        department_id,
        program_id,
        year,
        semester,
        course_id,
        is_core,
        is_elective,
        prerequisites,
      ]
    );

    return this.findById(result.insertId);
  }

  // Bulk create curriculum plans
  static async bulkCreate(plans) {
    if (!plans || plans.length === 0) return [];

    const values = [];
    const placeholders = [];

    plans.forEach((plan) => {
      placeholders.push("(?, ?, ?, ?, ?, ?, ?, ?)");
      values.push(
        plan.department_id,
        plan.program_id || null,
        plan.year,
        plan.semester,
        plan.course_id,
        plan.is_core || true,
        plan.is_elective || false,
        plan.prerequisites || null
      );
    });

    const sql = `INSERT INTO curriculum_plans 
                (department_id, program_id, year, semester, course_id, is_core, is_elective, prerequisites) 
                VALUES ${placeholders.join(", ")}`;

    await query(sql, values);
    return true;
  }

  // Find by department and year
  static async findByDepartmentAndYear(
    departmentId,
    year = null,
    semester = null
  ) {
    let whereClause = "WHERE cp.department_id = ?";
    const params = [departmentId];

    if (year) {
      whereClause += " AND cp.year = ?";
      params.push(year);
    }

    if (semester) {
      whereClause += " AND cp.semester = ?";
      params.push(semester);
    }

    const plans = await query(
      `SELECT cp.*,
              c.course_code,
              c.course_title,
              c.credit_hours,
              c.lecture_hours,
              c.lab_hours,
              c.tutorial_hours,
              p.program_name,
              p.program_code
       FROM curriculum_plans cp
       LEFT JOIN courses c ON cp.course_id = c.course_id
       LEFT JOIN programs p ON cp.program_id = p.program_id
       ${whereClause}
       ORDER BY cp.year, cp.semester, c.course_code`,
      params
    );

    return plans;
  }

  // Find by program
  static async findByProgram(programId, year = null, semester = null) {
    let whereClause = "WHERE cp.program_id = ?";
    const params = [programId];

    if (year) {
      whereClause += " AND cp.year = ?";
      params.push(year);
    }

    if (semester) {
      whereClause += " AND cp.semester = ?";
      params.push(semester);
    }

    const plans = await query(
      `SELECT cp.*,
              c.course_code,
              c.course_title,
              c.credit_hours,
              d.department_name
       FROM curriculum_plans cp
       LEFT JOIN courses c ON cp.course_id = c.course_id
       LEFT JOIN departments d ON cp.department_id = d.department_id
       ${whereClause}
       ORDER BY cp.year, cp.semester, c.course_code`,
      params
    );

    return plans;
  }

  // Get curriculum structure
  static async getCurriculumStructure(departmentId, programId = null) {
    const structure = await query(
      `SELECT 
        cp.year,
        cp.semester,
        COUNT(*) as course_count,
        SUM(c.credit_hours) as total_credits,
        GROUP_CONCAT(c.course_code ORDER BY c.course_code SEPARATOR ', ') as courses
       FROM curriculum_plans cp
       LEFT JOIN courses c ON cp.course_id = c.course_id
       WHERE cp.department_id = ?
         AND (? IS NULL OR cp.program_id = ?)
       GROUP BY cp.year, cp.semester
       ORDER BY cp.year, cp.semester`,
      [departmentId, programId, programId]
    );

    return structure;
  }

  // Update curriculum plan
  static async update(planId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), planId];

    await query(
      `UPDATE curriculum_plans SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE plan_id = ?`,
      values
    );

    return this.findById(planId);
  }

  // Delete curriculum plan
  static async delete(planId) {
    await query("DELETE FROM curriculum_plans WHERE plan_id = ?", [planId]);
    return true;
  }

  // Find by ID
  static async findById(planId) {
    const plans = await query(
      `SELECT cp.*,
              c.course_code,
              c.course_title,
              d.department_name,
              p.program_name
       FROM curriculum_plans cp
       LEFT JOIN courses c ON cp.course_id = c.course_id
       LEFT JOIN departments d ON cp.department_id = d.department_id
       LEFT JOIN programs p ON cp.program_id = p.program_id
       WHERE cp.plan_id = ?`,
      [planId]
    );
    return plans[0] || null;
  }

  // Delete by department and program
  static async deleteByDepartmentAndProgram(departmentId, programId = null) {
    let whereClause = "WHERE department_id = ?";
    const params = [departmentId];

    if (programId) {
      whereClause += " AND program_id = ?";
      params.push(programId);
    }

    await query(`DELETE FROM curriculum_plans ${whereClause}`, params);
    return true;
  }
}

export default CurriculumPlanModel;
