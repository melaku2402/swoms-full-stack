

//     // models/CourseAssignmentModel.js
// import { query } from "../config/database.js";

// class CourseAssignmentModel {
//   // Create course assignment
//   static async create(assignmentData) {
//     const {
//       course_id,
//       semester_id,
//       staff_id,
//       assigned_by,
//       section_code = null,
//       notes = null,
//       status = "assigned",
//     } = assignmentData;

//     const result = await query(
//       `INSERT INTO course_assignments 
//        (course_id, semester_id, staff_id, assigned_by, section_code, status, notes) 
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         course_id,
//         semester_id,
//         staff_id,
//         assigned_by,
//         section_code,
//         status,
//         notes,
//       ]
//     );

//     return this.findById(result.insertId);
//   }

//   // Check if course is already assigned to a staff in a semester
//   static async isCourseAssigned(courseId, semesterId, staffId) {
//     try {
//       const assignments = await query(
//         `SELECT * FROM course_assignments 
//          WHERE course_id = ? AND semester_id = ? AND staff_id = ? 
//          AND status IN ('assigned', 'accepted')`,
//         [courseId, semesterId, staffId]
//       );
//       return assignments.length > 0;
//     } catch (error) {
//       console.error("Error checking if course is assigned:", error);
//       return false;
//     }
//   }

//   // Find assignment by ID
//   static async findById(assignmentId) {
//     const assignments = await query(
//       `SELECT ca.*,
//               c.course_code, c.course_title, c.credit_hours,
//               s.semester_code, s.semester_name,
//               sp.first_name as staff_first_name, sp.last_name as staff_last_name,
//               sp.employee_id, sp.academic_rank,
//               d.department_name as staff_department,
//               ub.username as assigned_by_username
//        FROM course_assignments ca
//        LEFT JOIN courses c ON ca.course_id = c.course_id
//        LEFT JOIN semesters s ON ca.semester_id = s.semester_id
//        LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
//        LEFT JOIN departments d ON sp.department_id = d.department_id
//        LEFT JOIN users ub ON ca.assigned_by = ub.user_id
//        WHERE ca.assignment_id = ?`,
//       [assignmentId]
//     );
//     return assignments[0] || null;
//   }

//   // Find assignments by staff
//   static async findByStaff(staffId, semesterId = null, page = 1, limit = 20) {
//     let whereClause = "WHERE ca.staff_id = ?";
//     const params = [staffId];

//     if (semesterId) {
//       whereClause += " AND ca.semester_id = ?";
//       params.push(semesterId);
//     }

//     const offset = (page - 1) * limit;

//     // Get assignments
//     const assignments = await query(
//       `SELECT ca.*,
//               c.course_code, c.course_title, c.credit_hours,
//               s.semester_code, s.semester_name
//        FROM course_assignments ca
//        LEFT JOIN courses c ON ca.course_id = c.course_id
//        LEFT JOIN semesters s ON ca.semester_id = s.semester_id
//        ${whereClause}
//        ORDER BY ca.created_at DESC
//        LIMIT ? OFFSET ?`,
//       [...params, limit, offset]
//     );

//     // Get total count
//     const [countResult] = await query(
//       `SELECT COUNT(*) as total 
//        FROM course_assignments ca 
//        ${whereClause}`,
//       params
//     );

//     return {
//       assignments,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: countResult.total,
//         pages: Math.ceil(countResult.total / limit),
//       },
//     };
//   }

//   // Add to models/CourseAssignmentModel.js

//   // Update assignment
//   static async update(assignmentId, updateData) {
//     const fields = Object.keys(updateData);
//     if (fields.length === 0) return null;

//     const setClause = fields.map((field) => `${field} = ?`).join(", ");
//     const values = [...fields.map((field) => updateData[field]), assignmentId];

//     await query(
//       `UPDATE course_assignments SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE assignment_id = ?`,
//       values
//     );

//     return this.findById(assignmentId);
//   }
//   // Find assignments by department
//   static async findByDepartment(
//     departmentId,
//     semesterId = null,
//     page = 1,
//     limit = 20
//   ) {
//     let whereClause = `WHERE sp.department_id = ?`;
//     const params = [departmentId];

//     if (semesterId) {
//       whereClause += " AND ca.semester_id = ?";
//       params.push(semesterId);
//     }

//     const offset = (page - 1) * limit;

//     // Get assignments
//     const assignments = await query(
//       `SELECT ca.*,
//               c.course_code, c.course_title, c.credit_hours,
//               s.semester_code, s.semester_name,
//               sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank
//        FROM course_assignments ca
//        LEFT JOIN courses c ON ca.course_id = c.course_id
//        LEFT JOIN semesters s ON ca.semester_id = s.semester_id
//        LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
//        ${whereClause}
//        ORDER BY ca.created_at DESC
//        LIMIT ? OFFSET ?`,
//       [...params, limit, offset]
//     );

//     // Get total count
//     const [countResult] = await query(
//       `SELECT COUNT(*) as total 
//        FROM course_assignments ca
//        LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
//        ${whereClause}`,
//       params
//     );

//     return {
//       assignments,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: countResult.total,
//         pages: Math.ceil(countResult.total / limit),
//       },
//     };
//   }

//   // Accept assignment
//   static async acceptAssignment(assignmentId) {
//     await query(
//       `UPDATE course_assignments 
//        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
//        WHERE assignment_id = ?`,
//       [assignmentId]
//     );
//     return this.findById(assignmentId);
//   }

//   // Decline assignment
//   static async declineAssignment(assignmentId, reason) {
//     await query(
//       `UPDATE course_assignments 
//        SET status = 'declined', notes = CONCAT(IFNULL(notes, ''), ?), updated_at = CURRENT_TIMESTAMP 
//        WHERE assignment_id = ?`,
//       [`\nDeclined reason: ${reason}`, assignmentId]
//     );
//     return this.findById(assignmentId);
//   }

//   // Withdraw assignment
//   static async withdrawAssignment(assignmentId, reason) {
//     await query(
//       `UPDATE course_assignments 
//        SET status = 'withdrawn', notes = CONCAT(IFNULL(notes, ''), ?), updated_at = CURRENT_TIMESTAMP 
//        WHERE assignment_id = ?`,
//       [`\nWithdrawn reason: ${reason}`, assignmentId]
//     );
//     return this.findById(assignmentId);
//   }

//   // Get assignment statistics
//   static async getStatistics(departmentId = null, semesterId = null) {
//     let whereClause = "";
//     const params = [];

//     if (departmentId) {
//       whereClause = `WHERE sp.department_id = ?`;
//       params.push(departmentId);
//     }

//     if (semesterId) {
//       whereClause += whereClause ? " AND " : "WHERE ";
//       whereClause += "ca.semester_id = ?";
//       params.push(semesterId);
//     }

//     const stats = await query(
//       `SELECT 
//         COUNT(*) as total_assignments,
//         SUM(CASE WHEN ca.status = 'assigned' THEN 1 ELSE 0 END) as assigned,
//         SUM(CASE WHEN ca.status = 'accepted' THEN 1 ELSE 0 END) as accepted,
//         SUM(CASE WHEN ca.status = 'declined' THEN 1 ELSE 0 END) as declined,
//         SUM(CASE WHEN ca.status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn,
//         COUNT(DISTINCT ca.staff_id) as staff_involved,
//         COUNT(DISTINCT ca.course_id) as courses_assigned
//        FROM course_assignments ca
//        LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
//        ${whereClause}`,
//       params
//     );

//     return stats[0] || {};
//   }

//   // Batch assignment methods (if needed)
//   static async findByBatch(batchId, semesterId = null) {
//     // Implementation for batch-based assignments
//     let whereClause = "WHERE ca.batch_id = ?";
//     const params = [batchId];

//     if (semesterId) {
//       whereClause += " AND ca.semester_id = ?";
//       params.push(semesterId);
//     }

//     const assignments = await query(
//       `SELECT ca.*,
//               c.course_code, c.course_title,
//               s.semester_code, s.semester_name,
//               sp.first_name as staff_first_name, sp.last_name as staff_last_name
//        FROM course_assignments ca
//        LEFT JOIN courses c ON ca.course_id = c.course_id
//        LEFT JOIN semesters s ON ca.semester_id = s.semester_id
//        LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
//        ${whereClause}
//        ORDER BY ca.created_at DESC`,
//       params
//     );

//     return assignments;
//   }

//   static async findByStudentYear(studentYear, semesterId, departmentId) {
//     const assignments = await query(
//       `SELECT ca.*,
//               c.course_code, c.course_title,
//               s.semester_code, s.semester_name,
//               sp.first_name as staff_first_name, sp.last_name as staff_last_name,
//               b.batch_name,
//               p.program_name, p.program_type
//        FROM course_assignments ca
//        LEFT JOIN courses c ON ca.course_id = c.course_id
//        LEFT JOIN semesters s ON ca.semester_id = s.semester_id
//        LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
//        LEFT JOIN batch_years b ON ca.batch_id = b.batch_id
//        LEFT JOIN programs p ON b.program_id = p.program_id
//        LEFT JOIN departments d ON p.department_id = d.department_id
//        WHERE ca.student_year = ? 
//          AND ca.semester_id = ?
//          AND d.department_id = ?
//        ORDER BY p.program_type, p.program_name, b.batch_name`,
//       [studentYear, semesterId, departmentId]
//     );

//     return assignments;
//   }
// }

// export default CourseAssignmentModel;


// models/CourseAssignmentModel.js - UPDATED VERSION
import { query } from "../config/database.js";

class CourseAssignmentModel {
  // Create course assignment - UPDATED
  static async create(assignmentData) {
    const {
      course_id,
      semester_id,
      staff_id,
      assigned_by,
      student_year = null,
      section_code = null,
      notes = null,
      status = "assigned",
    } = assignmentData;

    const result = await query(
      `INSERT INTO course_assignments 
       (course_id, semester_id, staff_id, student_year, assigned_by, section_code, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id,
        semester_id,
        staff_id,
        student_year,
        assigned_by,
        section_code,
        status,
        notes,
      ]
    );

    return this.findById(result.insertId);
  }

  // Check if course is already assigned to a staff in a semester
  static async isCourseAssigned(courseId, semesterId, staffId) {
    try {
      const assignments = await query(
        `SELECT * FROM course_assignments 
         WHERE course_id = ? AND semester_id = ? AND staff_id = ? 
         AND status IN ('assigned', 'accepted')`,
        [courseId, semesterId, staffId]
      );
      return assignments.length > 0;
    } catch (error) {
      console.error("Error checking if course is assigned:", error);
      return false;
    }
  }

  // Find assignment by ID - UPDATED
  // static async findById(assignmentId) {
  //   const assignments = await query(
  //     `SELECT ca.*,
  //             c.course_code, c.course_title, c.credit_hours, c.program_type,
  //             s.semester_code, s.semester_name, s.semester_type,
  //             sp.first_name as staff_first_name, sp.last_name as staff_last_name,
  //             sp.employee_id, sp.academic_rank,
  //             d.department_name as staff_department,
  //             ub.username as assigned_by_username
  //      FROM course_assignments ca
  //      LEFT JOIN courses c ON ca.course_id = c.course_id
  //      LEFT JOIN semesters s ON ca.semester_id = s.semester_id
  //      LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
  //      LEFT JOIN departments d ON sp.department_id = d.department_id
  //      LEFT JOIN users ub ON ca.assigned_by = ub.user_id
  //      WHERE ca.assignment_id = ?`,
  //     [assignmentId]
  //   );
  //   return assignments[0] || null;
  // }

  // models/CourseAssignmentModel.js - Update findById method
  static async findById(assignmentId) {
    const assignments = await query(
      `SELECT 
      ca.*, 
      c.course_code, 
      c.course_title, 
      c.credit_hours,
      c.lecture_hours,
      c.lab_hours,
      c.tutorial_hours,
      c.program_type,
      s.semester_code, 
      s.semester_name, 
      s.semester_type,
      sp.first_name as staff_first_name, 
      sp.last_name as staff_last_name, 
      sp.employee_id, 
      sp.academic_rank,
      d.department_name as staff_department,
      ub.username as assigned_by_username
    FROM course_assignments ca
    LEFT JOIN courses c ON ca.course_id = c.course_id
    LEFT JOIN semesters s ON ca.semester_id = s.semester_id
    LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
    LEFT JOIN departments d ON sp.department_id = d.department_id
    LEFT JOIN users ub ON ca.assigned_by = ub.user_id
    WHERE ca.assignment_id = ?`,
      [assignmentId]
    );
    return assignments[0] || null;
  }

  // In CourseAssignmentModel.js - update findByStaff method
  static async findByStaff(staffId, semesterId = null, page = 1, limit = 20) {
    let whereClause = "WHERE ca.staff_id = ?";
    const params = [staffId];

    if (semesterId) {
      whereClause += " AND ca.semester_id = ?";
      params.push(semesterId);
    }

    const offset = (page - 1) * limit;

    // Get assignments with ALL course details
    const assignments = await query(
      `SELECT 
      ca.*,
      c.course_code,
      c.course_title,
      c.credit_hours,
      c.lecture_hours,
      c.lab_hours,
      c.tutorial_hours,
      c.program_type,
      s.semester_code,
      s.semester_name,
      s.semester_type,
      sp.first_name as staff_first_name,
      sp.last_name as staff_last_name,
      sp.employee_id,
      sp.academic_rank
    FROM course_assignments ca
    LEFT JOIN courses c ON ca.course_id = c.course_id
    LEFT JOIN semesters s ON ca.semester_id = s.semester_id
    LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
    ${whereClause}
    ORDER BY ca.created_at DESC
    LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total 
     FROM course_assignments ca 
     ${whereClause}`,
      params
    );

    // Calculate derived fields
    const enrichedAssignments = assignments.map((assignment) => ({
      ...assignment,
      total_hours: (
        parseFloat(assignment.lecture_hours || 0) +
        parseFloat(assignment.lab_hours || 0) +
        parseFloat(assignment.tutorial_hours || 0)
      ).toFixed(1),
      workload_hours: (
        parseFloat(assignment.lecture_hours || 0) * 1.0 +
        parseFloat(assignment.lab_hours || 0) * 0.75 +
        parseFloat(assignment.tutorial_hours || 0) * 0.5
      ).toFixed(1),
    }));

    return {
      assignments: enrichedAssignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit),
      },
    };
  }

  // Update assignment - UPDATED
  static async update(assignmentId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), assignmentId];

    await query(
      `UPDATE course_assignments SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE assignment_id = ?`,
      values
    );

    return this.findById(assignmentId);
  }

  // Find assignments by department - UPDATED
  static async findByDepartment(
    departmentId,
    semesterId = null,
    page = 1,
    limit = 20
  ) {
    let whereClause = `WHERE sp.department_id = ?`;
    const params = [departmentId];

    if (semesterId) {
      whereClause += " AND ca.semester_id = ?";
      params.push(semesterId);
    }

    const offset = (page - 1) * limit;

    // Get assignments with all details
    const assignments = await query(
      `SELECT ca.*,
              c.course_code, c.course_title, c.credit_hours, c.program_type,
              s.semester_code, s.semester_name, s.semester_type,
              sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank
       FROM course_assignments ca
       LEFT JOIN courses c ON ca.course_id = c.course_id
       LEFT JOIN semesters s ON ca.semester_id = s.semester_id
       LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
       ${whereClause}
       ORDER BY ca.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total 
       FROM course_assignments ca
       LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
       ${whereClause}`,
      params
    );

    return {
      assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit),
      },
    };
  }

  // Accept assignment
  static async acceptAssignment(assignmentId) {
    await query(
      `UPDATE course_assignments 
       SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
       WHERE assignment_id = ?`,
      [assignmentId]
    );
    return this.findById(assignmentId);
  }

  // Decline assignment
  static async declineAssignment(assignmentId, reason) {
    await query(
      `UPDATE course_assignments 
       SET status = 'declined', notes = CONCAT(IFNULL(notes, ''), ?), updated_at = CURRENT_TIMESTAMP 
       WHERE assignment_id = ?`,
      [`\nDeclined reason: ${reason}`, assignmentId]
    );
    return this.findById(assignmentId);
  }

  // Withdraw assignment
  static async withdrawAssignment(assignmentId, reason) {
    await query(
      `UPDATE course_assignments 
       SET status = 'withdrawn', notes = CONCAT(IFNULL(notes, ''), ?), updated_at = CURRENT_TIMESTAMP 
       WHERE assignment_id = ?`,
      [`\nWithdrawn reason: ${reason}`, assignmentId]
    );
    return this.findById(assignmentId);
  }

  // Get assignment statistics - UPDATED
  static async getStatistics(departmentId = null, semesterId = null) {
    let whereClause = "";
    const params = [];

    if (departmentId) {
      whereClause = `WHERE sp.department_id = ?`;
      params.push(departmentId);
    }

    if (semesterId) {
      whereClause += whereClause ? " AND " : "WHERE ";
      whereClause += "ca.semester_id = ?";
      params.push(semesterId);
    }

    const stats = await query(
      `SELECT 
        COUNT(*) as total_assignments,
        SUM(CASE WHEN ca.status = 'assigned' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN ca.status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN ca.status = 'declined' THEN 1 ELSE 0 END) as declined,
        SUM(CASE WHEN ca.status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn,
        COUNT(DISTINCT ca.staff_id) as staff_involved,
        COUNT(DISTINCT ca.course_id) as courses_assigned,
        JSON_OBJECTAGG(
          COALESCE(c.program_type, 'regular'),
          COUNT(DISTINCT ca.assignment_id)
        ) as by_program_type
       FROM course_assignments ca
       LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
       LEFT JOIN courses c ON ca.course_id = c.course_id
       ${whereClause}
       GROUP BY c.program_type`,
      params
    );

    return stats[0] || {};
  }

  // Find assignments by filters - NEW METHOD
  static async findByFilters(filters = {}) {
    let whereClause = "WHERE 1=1";
    const params = [];

    const {
      department_id,
      semester_id,
      program_type,
      student_year,
      staff_id,
      status,
    } = filters;

    if (department_id) {
      whereClause += " AND sp.department_id = ?";
      params.push(department_id);
    }

    if (semester_id) {
      whereClause += " AND ca.semester_id = ?";
      params.push(semester_id);
    }

    if (program_type) {
      whereClause += " AND c.program_type = ?";
      params.push(program_type);
    }

    if (student_year) {
      whereClause += " AND ca.student_year = ?";
      params.push(student_year);
    }

    if (staff_id) {
      whereClause += " AND ca.staff_id = ?";
      params.push(staff_id);
    }

    if (status) {
      whereClause += " AND ca.status = ?";
      params.push(status);
    }

    const assignments = await query(
      `SELECT ca.*,
              c.course_code, c.course_title, c.credit_hours, c.program_type,
              s.semester_code, s.semester_name, s.semester_type,
              sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank
       FROM course_assignments ca
       LEFT JOIN courses c ON ca.course_id = c.course_id
       LEFT JOIN semesters s ON ca.semester_id = s.semester_id
       LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
       ${whereClause}
       ORDER BY ca.created_at DESC`,
      params
    );

    return assignments;
  }
}

export default CourseAssignmentModel;