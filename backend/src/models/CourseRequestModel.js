import { query } from "../config/database.js";

class CourseRequestModel {
  // Create course request
  static async create(requestData) {
    const {
      course_id,
      semester_id,
      staff_id,
      requested_by,
      section_code = null,
      preferred_schedule = null,
      reason = null,
      status = "pending",
    } = requestData;

    const result = await query(
      `INSERT INTO course_requests 
       (course_id, semester_id, staff_id, requested_by, section_code, preferred_schedule, reason, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id,
        semester_id,
        staff_id,
        requested_by,
        section_code,
        preferred_schedule,
        reason,
        status,
      ]
    );

    return this.findById(result.insertId);
  }

  // Find request by ID
  static async findById(requestId) {
    const requests = await query(
      `SELECT cr.*,
              c.course_code,
              c.course_title,
              c.credit_hours,
              s.semester_code,
              s.semester_name,
              sp.first_name as staff_first_name,
              sp.last_name as staff_last_name,
              sp.employee_id,
              sp.academic_rank,
              d.department_name as staff_department,
              ur.username as requested_by_username,
              urp.first_name as requested_by_first_name,
              urp.last_name as requested_by_last_name,
              up.username as processed_by_username,
              upp.first_name as processed_by_first_name,
              upp.last_name as processed_by_last_name
       FROM course_requests cr
       LEFT JOIN courses c ON cr.course_id = c.course_id
       LEFT JOIN semesters s ON cr.semester_id = s.semester_id
       LEFT JOIN staff_profiles sp ON cr.staff_id = sp.staff_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       LEFT JOIN users ur ON cr.requested_by = ur.user_id
       LEFT JOIN staff_profiles urp ON ur.user_id = urp.user_id
       LEFT JOIN users up ON cr.processed_by = up.user_id
       LEFT JOIN staff_profiles upp ON up.user_id = upp.user_id
       WHERE cr.request_id = ?`,
      [requestId]
    );
    return requests[0] || null;
  }

  // Find requests by staff
  static async findByStaff(staffId, semesterId = null, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    let whereClause = "WHERE cr.staff_id = ?";
    const params = [staffId];

    if (semesterId) {
      whereClause += " AND cr.semester_id = ?";
      params.push(semesterId);
    }

    const requests = await query(
      `SELECT cr.*,
              c.course_code,
              c.course_title,
              s.semester_code,
              s.semester_name
       FROM course_requests cr
       LEFT JOIN courses c ON cr.course_id = c.course_id
       LEFT JOIN semesters s ON cr.semester_id = s.semester_id
       ${whereClause}
       ORDER BY cr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) as count FROM course_requests cr ${whereClause}`,
      params
    );
    const total = totalResult[0]?.count || 0;

    return {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Find requests by department (for department head)
  static async findByDepartment(
    departmentId,
    status = null,
    semesterId = null,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;
    let whereClause = "WHERE sp.department_id = ?";
    const params = [departmentId];

    if (status) {
      whereClause += " AND cr.status = ?";
      params.push(status);
    }

    if (semesterId) {
      whereClause += " AND cr.semester_id = ?";
      params.push(semesterId);
    }

    const requests = await query(
      `SELECT cr.*,
              c.course_code,
              c.course_title,
              s.semester_code,
              s.semester_name,
              sp.first_name as staff_first_name,
              sp.last_name as staff_last_name,
              sp.employee_id,
              ur.username as requested_by_username
       FROM course_requests cr
       LEFT JOIN courses c ON cr.course_id = c.course_id
       LEFT JOIN semesters s ON cr.semester_id = s.semester_id
       LEFT JOIN staff_profiles sp ON cr.staff_id = sp.staff_id
       LEFT JOIN users ur ON cr.requested_by = ur.user_id
       ${whereClause}
       ORDER BY cr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) as count FROM course_requests cr
       LEFT JOIN staff_profiles sp ON cr.staff_id = sp.staff_id
       ${whereClause}`,
      params
    );
    const total = totalResult[0]?.count || 0;

    return {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update request
  static async update(requestId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), requestId];

    await query(
      `UPDATE course_requests SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?`,
      values
    );

    return this.findById(requestId);
  }

  // Delete request
  static async delete(requestId) {
    await query("DELETE FROM course_requests WHERE request_id = ?", [
      requestId,
    ]);
    return true;
  }

  // Approve request (by department head)
  static async approveRequest(requestId, processedBy, notes = null) {
    const request = await this.findById(requestId);
    if (!request) return null;

    // Create course assignment from approved request
    await query(
      `INSERT INTO course_assignments 
       (course_id, semester_id, staff_id, assigned_by, section_code, status, notes)
       VALUES (?, ?, ?, ?, ?, 'assigned', ?)`,
      [
        request.course_id,
        request.semester_id,
        request.staff_id,
        processedBy,
        request.section_code,
        notes || "Approved from course request",
      ]
    );

    // Update request status
    await query(
      `UPDATE course_requests 
       SET status = 'approved', 
           processed_by = ?, 
           processed_date = NOW(),
           processed_notes = ?
       WHERE request_id = ?`,
      [processedBy, notes, requestId]
    );

    return this.findById(requestId);
  }

  // Reject request (by department head)
  static async rejectRequest(requestId, processedBy, notes = null) {
    await query(
      `UPDATE course_requests 
       SET status = 'rejected', 
           processed_by = ?, 
           processed_date = NOW(),
           processed_notes = ?
       WHERE request_id = ?`,
      [processedBy, notes, requestId]
    );
    return this.findById(requestId);
  }

  // Cancel request (by instructor)
  static async cancelRequest(requestId) {
    await query(
      "UPDATE course_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE request_id = ?",
      [requestId]
    );
    return this.findById(requestId);
  }

  // Get pending requests for department head
  static async getPendingRequests(departmentId, semesterId = null) {
    let whereClause = "WHERE sp.department_id = ? AND cr.status = 'pending'";
    const params = [departmentId];

    if (semesterId) {
      whereClause += " AND cr.semester_id = ?";
      params.push(semesterId);
    }

    const requests = await query(
      `SELECT cr.*,
              c.course_code,
              c.course_title,
              s.semester_code,
              s.semester_name,
              sp.first_name as staff_first_name,
              sp.last_name as staff_last_name,
              sp.employee_id,
              ur.username as requested_by_username
       FROM course_requests cr
       LEFT JOIN courses c ON cr.course_id = c.course_id
       LEFT JOIN semesters s ON cr.semester_id = s.semester_id
       LEFT JOIN staff_profiles sp ON cr.staff_id = sp.staff_id
       LEFT JOIN users ur ON cr.requested_by = ur.user_id
       ${whereClause}
       ORDER BY cr.created_at DESC`,
      params
    );

    return requests;
  }

  // Get request statistics
  static async getStatistics(departmentId = null, semesterId = null) {
    let whereClause = "";
    const params = [];

    if (departmentId) {
      whereClause = "WHERE sp.department_id = ?";
      params.push(departmentId);
    }

    if (semesterId) {
      whereClause = whereClause
        ? `${whereClause} AND cr.semester_id = ?`
        : "WHERE cr.semester_id = ?";
      params.push(semesterId);
    }

    const stats = await query(
      `SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN cr.status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN cr.status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN cr.status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN cr.status = 'cancelled' THEN 1 END) as cancelled_count,
        COUNT(DISTINCT cr.staff_id) as unique_staff,
        COUNT(DISTINCT cr.course_id) as unique_courses,
        AVG(TIMESTAMPDIFF(HOUR, cr.created_at, COALESCE(cr.processed_date, NOW()))) as avg_processing_hours
       FROM course_requests cr
       LEFT JOIN staff_profiles sp ON cr.staff_id = sp.staff_id
       ${whereClause}`,
      params
    );

    return stats[0] || {};
  }
}

export default CourseRequestModel;
