// src/models/SectionModel.js
import { query } from "../config/database.js";

class SectionModel {
  // Create section
  static async create(sectionData) {
    const {
      course_id,
      semester_id,
      section_code,
      instructor_id = null,
      student_count = 0,
      max_capacity = 60,
      is_active = true,
    } = sectionData;

    // Check if section already exists for this course and semester
    const existing = await query(
      "SELECT section_id FROM sections WHERE course_id = ? AND semester_id = ? AND section_code = ?",
      [course_id, semester_id, section_code]
    );

    if (existing.length > 0) {
      throw new Error("Section already exists for this course and semester");
    }

    const result = await query(
      `INSERT INTO sections 
       (course_id, semester_id, section_code, instructor_id, student_count, max_capacity, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id,
        semester_id,
        section_code,
        instructor_id,
        student_count,
        max_capacity,
        is_active,
      ]
    );

    return this.findById(result.insertId);
  }

  // Find section by ID
  static async findById(sectionId) {
    const sections = await query(
      `SELECT s.*, 
              c.course_code, c.course_title, c.credit_hours,
              c.lecture_hours, c.lab_hours, c.tutorial_hours,
              sem.semester_code, sem.semester_name, sem.semester_type,
              sem.start_date, sem.end_date,
              sp.first_name, sp.last_name, sp.employee_id,
              d.department_name, d.department_code,
              p.program_name, p.program_type,
              (SELECT COUNT(*) FROM workload_rp WHERE section_id = s.section_id) as workload_count
       FROM sections s
       LEFT JOIN courses c ON s.course_id = c.course_id
       LEFT JOIN semesters sem ON s.semester_id = sem.semester_id
       LEFT JOIN staff_profiles sp ON s.instructor_id = sp.staff_id
       LEFT JOIN departments d ON c.department_id = d.department_id
       LEFT JOIN programs p ON c.program_id = p.program_id
       WHERE s.section_id = ?`,
      [sectionId]
    );
    return sections[0] || null;
  }

  // Get sections by course and semester
  static async findByCourseAndSemester(courseId, semesterId) {
    const sections = await query(
      `SELECT s.*, 
              sp.first_name, sp.last_name, sp.employee_id,
              (SELECT COUNT(*) FROM workload_rp WHERE section_id = s.section_id) as workload_assigned
       FROM sections s
       LEFT JOIN staff_profiles sp ON s.instructor_id = sp.staff_id
       WHERE s.course_id = ? AND s.semester_id = ?
       ORDER BY s.section_code`,
      [courseId, semesterId]
    );

    return sections;
  }

  // Get sections by instructor
  static async findByInstructor(
    instructorId,
    semesterId = null,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;
    let whereClause = "WHERE s.instructor_id = ?";
    const params = [instructorId];

    if (semesterId) {
      whereClause += " AND s.semester_id = ?";
      params.push(semesterId);
    }

    const sections = await query(
      `SELECT s.*, 
              c.course_code, c.course_title, c.credit_hours,
              sem.semester_code, sem.semester_name,
              d.department_name
       FROM sections s
       LEFT JOIN courses c ON s.course_id = c.course_id
       LEFT JOIN semesters sem ON s.semester_id = sem.semester_id
       LEFT JOIN departments d ON c.department_id = d.department_id
       ${whereClause}
       ORDER BY sem.start_date DESC, c.course_code
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) as count FROM sections s ${whereClause}`,
      params
    );
    const total = totalResult[0].count;

    return {
      sections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get sections by semester
  // static async findBySemester(semesterId, page = 1, limit = 50) {
  //   const offset = (page - 1) * limit;

  //   const sections = await query(
  //     `SELECT s.*,
  //             c.course_code, c.course_title,
  //             sp.first_name, sp.last_name, sp.employee_id,
  //             d.department_name, d.department_code,
  //             p.program_name
  //      FROM sections s
  //      LEFT JOIN courses c ON s.course_id = c.course_id
  //      LEFT JOIN staff_profiles sp ON s.instructor_id = sp.staff_id
  //      LEFT JOIN departments d ON c.department_id = d.department_id
  //      LEFT JOIN programs p ON c.program_id = p.program_id
  //      WHERE s.semester_id = ?
  //      ORDER BY d.department_name, c.course_code, s.section_code
  //      LIMIT ? OFFSET ?`,
  //     [semesterId, limit, offset]
  //   );

  //   const totalResult = await query(
  //     "SELECT COUNT(*) as count FROM sections WHERE semester_id = ?",
  //     [semesterId]
  //   );
  //   const total = totalResult[0].count;

  //   return {
  //     sections,
  //     pagination: {
  //       page: parseInt(page),
  //       limit: parseInt(limit),
  //       total,
  //       pages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  static async findBySemester(semesterId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    // REMOVE the LEFT JOIN on programs table - use program_type from courses instead
    const sections = await query(
      `SELECT s.*, 
            c.course_code, c.course_title, c.program_type,
            sp.first_name, sp.last_name, sp.employee_id,
            d.department_name, d.department_code
     FROM sections s
     LEFT JOIN courses c ON s.course_id = c.course_id
     LEFT JOIN staff_profiles sp ON s.instructor_id = sp.staff_id
     LEFT JOIN departments d ON c.department_id = d.department_id
     WHERE s.semester_id = ?
     ORDER BY d.department_name, c.course_code, s.section_code
     LIMIT ? OFFSET ?`,
      [semesterId, limit, offset]
    );

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM sections WHERE semester_id = ?",
      [semesterId]
    );
    const total = totalResult[0].count;

    return {
      sections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get sections by department
  // static async findByDepartment(departmentId, semesterId = null) {
  //   let whereClause = "WHERE c.department_id = ?";
  //   const params = [departmentId];

  //   if (semesterId) {
  //     whereClause += " AND s.semester_id = ?";
  //     params.push(semesterId);
  //   }

  //   const sections = await query(
  //     `SELECT s.*,
  //             c.course_code, c.course_title,
  //             sem.semester_code, sem.semester_name,
  //             sp.first_name, sp.last_name
  //      FROM sections s
  //      LEFT JOIN courses c ON s.course_id = c.course_id
  //      LEFT JOIN semesters sem ON s.semester_id = sem.semester_id
  //      LEFT JOIN staff_profiles sp ON s.instructor_id = sp.staff_id
  //      ${whereClause}
  //      ORDER BY sem.start_date DESC, c.course_code`,
  //     params
  //   );

  //   return sections;
  // }

  static async findByDepartment(departmentId, semesterId = null) {
    let whereClause = "WHERE c.department_id = ?";
    const params = [departmentId];

    if (semesterId) {
      whereClause += " AND s.semester_id = ?";
      params.push(semesterId);
    }

    const sections = await query(
      `SELECT s.*, 
            c.course_code, c.course_title, c.program_type,
            sem.semester_code, sem.semester_name,
            sp.first_name, sp.last_name
     FROM sections s
     LEFT JOIN courses c ON s.course_id = c.course_id
     LEFT JOIN semesters sem ON s.semester_id = sem.semester_id
     LEFT JOIN staff_profiles sp ON s.instructor_id = sp.staff_id
     ${whereClause}
     ORDER BY sem.start_date DESC, c.course_code`,
      params
    );

    return sections;
  }
  // Update section
  static async update(sectionId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), sectionId];

    await query(
      `UPDATE sections SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE section_id = ?`,
      values
    );

    return this.findById(sectionId);
  }

  // Delete section
  static async delete(sectionId) {
    await query("DELETE FROM sections WHERE section_id = ?", [sectionId]);
    return true;
  }

  // Assign instructor to section
  static async assignInstructor(sectionId, instructorId) {
    await query(
      "UPDATE sections SET instructor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE section_id = ?",
      [instructorId, sectionId]
    );

    return this.findById(sectionId);
  }

  // Remove instructor from section
  static async removeInstructor(sectionId) {
    await query(
      "UPDATE sections SET instructor_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE section_id = ?",
      [sectionId]
    );

    return this.findById(sectionId);
  }

  // Update student count
  static async updateStudentCount(sectionId, studentCount) {
    await query(
      "UPDATE sections SET student_count = ?, updated_at = CURRENT_TIMESTAMP WHERE section_id = ?",
      [studentCount, sectionId]
    );

    return this.findById(sectionId);
  }

  // Get section statistics
  static async getStatistics(semesterId = null) {
    let whereClause = "";
    const params = [];

    if (semesterId) {
      whereClause = "WHERE s.semester_id = ?";
      params.push(semesterId);
    }

    const stats = await query(
      `SELECT 
        COUNT(*) as total_sections,
        SUM(s.student_count) as total_students,
        AVG(s.student_count) as avg_students_per_section,
        COUNT(DISTINCT s.course_id) as unique_courses,
        COUNT(DISTINCT s.instructor_id) as instructors_assigned,
        COUNT(CASE WHEN s.instructor_id IS NULL THEN 1 END) as sections_unassigned,
        SUM(CASE WHEN s.student_count > s.max_capacity THEN 1 ELSE 0 END) as overloaded_sections
       FROM sections s
       ${whereClause}`,
      params
    );

    return stats[0] || {};
  }

  // Get sections with no instructor assigned
  static async getUnassignedSections(semesterId = null, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    let whereClause = "WHERE s.instructor_id IS NULL";
    const params = [];

    if (semesterId) {
      whereClause += " AND s.semester_id = ?";
      params.push(semesterId);
    }

    const sections = await query(
      `SELECT s.*, 
              c.course_code, c.course_title,
              sem.semester_code, sem.semester_name,
              d.department_name
       FROM sections s
       LEFT JOIN courses c ON s.course_id = c.course_id
       LEFT JOIN semesters sem ON s.semester_id = sem.semester_id
       LEFT JOIN departments d ON c.department_id = d.department_id
       ${whereClause}
       ORDER BY sem.start_date DESC, c.course_code
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) as count FROM sections s ${whereClause}`,
      params
    );
    const total = totalResult[0].count;

    return {
      sections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get sections by date range
  // static async findByDateRange(startDate, endDate, departmentId = null) {
  //   let whereClause = "WHERE sem.start_date >= ? AND sem.end_date <= ?";
  //   const params = [startDate, endDate];

  //   if (departmentId) {
  //     whereClause += " AND c.department_id = ?";
  //     params.push(departmentId);
  //   }

  //   const sections = await query(
  //     `SELECT s.*,
  //             c.course_code, c.course_title,
  //             sem.semester_code, sem.semester_name,
  //             sp.first_name, sp.last_name,
  //             d.department_name
  //      FROM sections s
  //      LEFT JOIN courses c ON s.course_id = c.course_id
  //      LEFT JOIN semesters sem ON s.semester_id = sem.semester_id
  //      LEFT JOIN staff_profiles sp ON s.instructor_id = sp.staff_id
  //      LEFT JOIN departments d ON c.department_id = d.department_id
  //      ${whereClause}
  //      ORDER BY sem.start_date, c.course_code`,
  //     params
  //   );

  //   return sections;
  // }

  static async findByDateRange(startDate, endDate, departmentId = null) {
    let whereClause = "WHERE sem.start_date >= ? AND sem.end_date <= ?";
    const params = [startDate, endDate];

    if (departmentId) {
      whereClause += " AND c.department_id = ?";
      params.push(departmentId);
    }

    const sections = await query(
      `SELECT s.*, 
            c.course_code, c.course_title, c.program_type,
            sem.semester_code, sem.semester_name,
            sp.first_name, sp.last_name,
            d.department_name
     FROM sections s
     LEFT JOIN courses c ON s.course_id = c.course_id
     LEFT JOIN semesters sem ON s.semester_id = sem.semester_id
     LEFT JOIN staff_profiles sp ON s.instructor_id = sp.staff_id
     LEFT JOIN departments d ON c.department_id = d.department_id
     ${whereClause}
     ORDER BY sem.start_date, c.course_code`,
      params
    );

    return sections;
  }

  // Check if instructor is already assigned to conflicting sections
  static async checkInstructorAvailability(
    instructorId,
    semesterId,
    dayTimeSlots = []
  ) {
    // For now, just check total sections assigned in semester
    const sections = await query(
      "SELECT COUNT(*) as count FROM sections WHERE instructor_id = ? AND semester_id = ?",
      [instructorId, semesterId]
    );

    return sections[0].count;
  }

  // Get sections summary for dashboard
  static async getDashboardSummary() {
    const summary = await query(`
    SELECT 
      (SELECT COUNT(*) FROM sections WHERE is_active = TRUE) as active_sections,
      (SELECT COUNT(*) FROM sections WHERE instructor_id IS NULL) as unassigned_sections,
      (SELECT COUNT(DISTINCT course_id) FROM sections) as courses_with_sections,
      (SELECT COUNT(DISTINCT instructor_id) FROM sections WHERE instructor_id IS NOT NULL) as active_instructors,
      (SELECT SUM(student_count) FROM sections) as total_students
  `);

    return summary[0];
  }
}

export default SectionModel;
