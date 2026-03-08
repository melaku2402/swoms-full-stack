
// src/models/CourseModel.js - COMPLETE FIXED VERSION

import { query } from "../config/database.js";
import { PROGRAM_TYPES } from "../config/constants.js";

class CourseModel {
  // Create course method
  static async create(courseData) {
    const {
      course_code,
      course_title,
      department_id,
      program_id = null,
      credit_hours,
      lecture_hours,
      lab_hours = 0,
      tutorial_hours = 0,
      program_type = "regular",
      course_year = null,
      course_semester = null,
      is_core_course = true,
      prerequisites = null,
      max_students = 60,
      min_students = 15,
      status = "active",
    } = courseData;

    const result = await query(
      `INSERT INTO courses 
       (course_code, course_title, department_id, program_id, credit_hours, 
        lecture_hours, lab_hours, tutorial_hours, program_type, course_year,
        course_semester, is_core_course, prerequisites, max_students, min_students, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_code,
        course_title,
        department_id,
        program_id,
        credit_hours,
        lecture_hours,
        lab_hours,
        tutorial_hours,
        program_type,
        course_year,
        course_semester,
        is_core_course,
        prerequisites,
        max_students,
        min_students,
        status,
      ]
    );

    return this.findById(result.insertId);
  }

  // Update course method
  static async update(courseId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), courseId];

    await query(
      `UPDATE courses SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE course_id = ?`,
      values
    );

    return this.findById(courseId);
  }

  // Get courses by year and semester
  static async findByYearAndSemester(departmentId, year = null, semester = null) {
    let whereClause = "WHERE department_id = ? AND status = 'active'";
    const params = [departmentId];

    if (year) {
      whereClause += " AND course_year = ?";
      params.push(year);
    }

    if (semester) {
      whereClause += " AND course_semester = ?";
      params.push(semester);
    }

    const courses = await query(
      `SELECT c.*, p.program_name, p.program_code
       FROM courses c
       LEFT JOIN programs p ON c.program_id = p.program_id
       ${whereClause}
       ORDER BY course_year, course_semester, course_code`,
      params
    );

    return courses;
  }

  // Bulk update course year/semester
  static async bulkUpdateYearSemester(coursesData) {
    if (!coursesData || coursesData.length === 0) return [];

    const updates = [];
    for (const course of coursesData) {
      const { course_id, course_year, course_semester } = course;
      if (course_id) {
        await query(
          "UPDATE courses SET course_year = ?, course_semester = ?, updated_at = CURRENT_TIMESTAMP WHERE course_id = ?",
          [course_year, course_semester, course_id]
        );
        updates.push(course_id);
      }
    }
    return updates;
  }

  // Find course by ID - FIXED: Removed workload_rp join
  static async findById(courseId) {
    try {
      if (!courseId || isNaN(courseId)) {
        console.error("Invalid course ID:", courseId);
        return null;
      }

      const courses = await query(
        `SELECT c.*, 
                d.department_name, d.department_code,
                col.college_name, col.college_code,
                (SELECT COUNT(*) FROM sections WHERE course_id = c.course_id) as section_count,
                (SELECT COUNT(DISTINCT semester_id) FROM sections WHERE course_id = c.course_id) as semester_count
                -- REMOVED: Invalid workload_count query
         FROM courses c
         LEFT JOIN departments d ON c.department_id = d.department_id
         LEFT JOIN colleges col ON d.college_id = col.college_id
         WHERE c.course_id = ?`,
        [parseInt(courseId)]
      );
      return courses[0] || null;
    } catch (error) {
      console.error("CourseModel.findById error:", error);
      throw error;
    }
  }

  // Find course by code
  static async findByCode(courseCode) {
    const courses = await query(
      `SELECT c.*, d.department_name, d.department_code
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.department_id
       WHERE c.course_code = ?`,
      [courseCode]
    );
    return courses[0] || null;
  }

  // Get all courses with pagination and filters
  static async findAll(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = "";
      const params = [];

      // Build WHERE clause
      if (filters.department_id) {
        whereClause = "WHERE c.department_id = ?";
        params.push(filters.department_id);
      }

      if (filters.college_id) {
        whereClause = whereClause
          ? `${whereClause} AND d.college_id = ?`
          : "WHERE d.college_id = ?";
        params.push(filters.college_id);
      }

      if (filters.program_id) {
        whereClause = whereClause
          ? `${whereClause} AND c.program_id = ?`
          : "WHERE c.program_id = ?";
        params.push(filters.program_id);
      }

      if (filters.program_type) {
        whereClause = whereClause
          ? `${whereClause} AND c.program_type = ?`
          : "WHERE c.program_type = ?";
        params.push(filters.program_type);
      }

      if (filters.status) {
        whereClause = whereClause
          ? `${whereClause} AND c.status = ?`
          : "WHERE c.status = ?";
        params.push(filters.status);
      }

      if (filters.search) {
        whereClause = whereClause
          ? `${whereClause} AND (c.course_title LIKE ? OR c.course_code LIKE ?)`
          : "WHERE (c.course_title LIKE ? OR c.course_code LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      // FIXED: Removed workload_rp reference
      const coursesQuery = `
        SELECT c.*, 
              d.department_name, d.department_code,
              col.college_name,
              (SELECT COUNT(*) FROM sections WHERE course_id = c.course_id) as section_count
        FROM courses c
        LEFT JOIN departments d ON c.department_id = d.department_id
        LEFT JOIN colleges col ON d.college_id = col.college_id
        ${whereClause}
        ORDER BY c.course_code
        LIMIT ? OFFSET ?
      `;

      const courses = await query(coursesQuery, [...params, limit, offset]);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM courses c
        LEFT JOIN departments d ON c.department_id = d.department_id
        LEFT JOIN colleges col ON d.college_id = col.college_id
        ${whereClause}
      `;

      const totalResult = await query(countQuery, params);
      const total = totalResult[0]?.count || 0;

      return {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("CourseModel.findAll error:", error);
      throw error;
    }
  }

  // Get courses by department
  static async findByDepartment(departmentId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const courses = await query(
      `SELECT c.*, 
              p.program_name,
              (SELECT COUNT(*) FROM sections WHERE course_id = c.course_id) as section_count
       FROM courses c
       LEFT JOIN programs p ON c.program_id = p.program_id
       WHERE c.department_id = ?
       ORDER BY c.course_code
       LIMIT ? OFFSET ?`,
      [departmentId, limit, offset]
    );

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM courses WHERE department_id = ?",
      [departmentId]
    );
    const total = totalResult[0].count;

    return {
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get courses by program
  static async findByProgram(programId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const courses = await query(
      `SELECT c.*, 
              d.department_name,
              (SELECT COUNT(*) FROM sections WHERE course_id = c.course_id) as section_count
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.department_id
       WHERE c.program_id = ?
       ORDER BY c.course_code
       LIMIT ? OFFSET ?`,
      [programId, limit, offset]
    );

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM courses WHERE program_id = ?",
      [programId]
    );
    const total = totalResult[0].count;

    return {
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update course
  static async update(courseId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), courseId];

    await query(
      `UPDATE courses SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE course_id = ?`,
      values
    );

    return this.findById(courseId);
  }

  // Delete course
  static async delete(courseId) {
    await query("DELETE FROM courses WHERE course_id = ?", [courseId]);
    return true;
  }

  // Get course statistics - FIXED: Simple version
  static async getStatistics(departmentId = null, programType = null) {
    let whereClause = "";
    const params = [];

    if (departmentId) {
      whereClause = "WHERE c.department_id = ?";
      params.push(departmentId);
    }

    if (programType) {
      whereClause = whereClause
        ? `${whereClause} AND c.program_type = ?`
        : "WHERE c.program_type = ?";
      params.push(programType);
    }

    // FIXED: Simple statistics without workload_rp
    const stats = await query(
      `SELECT 
        c.program_type,
        COUNT(*) as course_count,
        AVG(c.credit_hours) as avg_credit_hours,
        AVG(c.lecture_hours) as avg_lecture_hours,
        AVG(c.lab_hours) as avg_lab_hours,
        SUM(c.credit_hours) as total_credit_hours,
        SUM((SELECT COUNT(*) FROM sections WHERE course_id = c.course_id)) as total_sections
       FROM courses c
       ${whereClause}
       GROUP BY c.program_type`,
      params
    );

    return stats;
  }

  // Get course offerings by semester
  static async getCourseOfferings(courseId) {
    const offerings = await query(
      `SELECT 
        s.semester_id,
        s.semester_code,
        s.semester_name,
        s.semester_type,
        s.start_date,
        s.end_date,
        COUNT(sec.section_id) as sections_count,
        GROUP_CONCAT(DISTINCT sec.section_code) as section_codes
       FROM sections sec
       JOIN semesters s ON sec.semester_id = s.semester_id
       WHERE sec.course_id = ?
       GROUP BY s.semester_id
       ORDER BY s.start_date DESC`,
      [courseId]
    );

    return offerings;
  }

  // Search courses - FIXED: Removed workload_rp reference
  static async search(searchTerm, limit = 50) {
    return await query(
      `SELECT c.*, 
              d.department_name, d.department_code,
              p.program_name
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.department_id
       LEFT JOIN programs p ON c.program_id = p.program_id
       WHERE (c.course_title LIKE ? OR c.course_code LIKE ?)
         AND c.status = 'active'
       ORDER BY c.course_code
       LIMIT ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`, limit]
    );
  }

  // Get courses by program type
  static async findByProgramType(programType, includeInactive = false) {
    let whereClause = "WHERE c.program_type = ?";
    const params = [programType];

    if (!includeInactive) {
      whereClause += " AND c.status = 'active'";
    }

    const courses = await query(
      `SELECT c.*, 
              d.department_name, d.department_code,
              p.program_name
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.department_id
       LEFT JOIN programs p ON c.program_id = p.program_id
       ${whereClause}
       ORDER BY c.course_code`,
      params
    );

    return courses;
  }

  // Get related courses (same department/program)
  static async getRelatedCourses(courseId) {
    const course = await this.findById(courseId);
    if (!course) return [];

    const related = await query(
      `SELECT c.*, d.department_name
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.department_id
       WHERE c.department_id = ? 
         AND c.course_id != ?
         AND c.status = 'active'
       ORDER BY c.course_code
       LIMIT 10`,
      [course.department_id, courseId]
    );

    return related;
  }

  // Calculate total load hours for a course
  static async calculateTotalLoadHours(
    courseId,
    labFactor = 0.75,
    tutorialFactor = 0.5
  ) {
    const course = await this.findById(courseId);
    if (!course) return 0;

    const lectureLoad = course.lecture_hours;
    const labLoad = course.lab_hours * labFactor;
    const tutorialLoad = course.tutorial_hours * tutorialFactor;

    return lectureLoad + labLoad + tutorialLoad;
  }

  // Get course sections
  static async getCourseSections(courseId, semesterId = null) {
    let whereClause = "WHERE s.course_id = ?";
    const params = [courseId];

    if (semesterId) {
      whereClause += " AND s.semester_id = ?";
      params.push(semesterId);
    }

    const sections = await query(
      `SELECT s.*,
              sem.semester_code, sem.semester_name,
              st.first_name, st.last_name, st.employee_id
       FROM sections s
       LEFT JOIN semesters sem ON s.semester_id = sem.semester_id
       LEFT JOIN staff_profiles st ON s.instructor_id = st.staff_id
       ${whereClause}
       ORDER BY s.section_code`,
      params
    );

    return sections;
  }
}

export default CourseModel;