// export default WorkloadRPModel;
import { query } from "../config/database.js";
import WorkloadService from "../services/WorkloadService.js";

class WorkloadRPModel {
  // Create or update workload
  static async createOrUpdate(workloadData) {
    const {
      staff_id,
      semester_id,
      course_code,
      course_credit_hours = 0,
      lecture_credit_hours = 0,
      tutorial_credit_hours = 0,
      lab_credit_hours = 0,
      student_department,
      academic_year,
      number_of_sections = 1,
      each_section_course_load = 0,
      variety_of_course_load = 0,
      research_load = 0,
      community_service_load = 0,
      elip_load = 0,
      hdp_load = 0,
      course_chair_load = 0,
      section_advisor_load = 0,
      advising_load = 0,
      position_load = 0,
      total_load = 0,
      over_payment_birr = 0,
      status = "draft",
    } = workloadData;

    // Check if workload already exists
    const existing = await this.findByStaffAndSemester(staff_id, semester_id);

    if (existing) {
      // Update existing workload
      const result = await query(
        `UPDATE workload_rp SET
          course_code = ?,
          course_credit_hours = ?,
          lecture_credit_hours = ?,
          tutorial_credit_hours = ?,
          lab_credit_hours = ?,
          student_department = ?,
          academic_year = ?,
          number_of_sections = ?,
          each_section_course_load = ?,
          variety_of_course_load = ?,
          research_load = ?,
          community_service_load = ?,
          elip_load = ?,
          hdp_load = ?,
          course_chair_load = ?,
          section_advisor_load = ?,
          advising_load = ?,
          position_load = ?,
          total_load = ?,
          over_payment_birr = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
         WHERE workload_id = ?`,
        [
          course_code,
          course_credit_hours,
          lecture_credit_hours,
          tutorial_credit_hours,
          lab_credit_hours,
          student_department,
          academic_year,
          number_of_sections,
          each_section_course_load,
          variety_of_course_load,
          research_load,
          community_service_load,
          elip_load,
          hdp_load,
          course_chair_load,
          section_advisor_load,
          advising_load,
          position_load,
          total_load,
          over_payment_birr,
          status,
          existing.workload_id,
        ]
      );
      return this.findById(existing.workload_id);
    }

    // Create new workload
    const result = await query(
      `INSERT INTO workload_rp 
       (staff_id, semester_id, course_code, course_credit_hours, 
        lecture_credit_hours, tutorial_credit_hours, lab_credit_hours,
        student_department, academic_year, number_of_sections,
        each_section_course_load, variety_of_course_load, research_load, 
        community_service_load, elip_load, hdp_load, course_chair_load, 
        section_advisor_load, advising_load, position_load,
        total_load, over_payment_birr, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        staff_id,
        semester_id,
        course_code,
        course_credit_hours,
        lecture_credit_hours,
        tutorial_credit_hours,
        lab_credit_hours,
        student_department,
        academic_year,
        number_of_sections,
        each_section_course_load,
        variety_of_course_load,
        research_load,
        community_service_load,
        elip_load,
        hdp_load,
        course_chair_load,
        section_advisor_load,
        advising_load,
        position_load,
        total_load,
        over_payment_birr,
        status,
      ]
    );

    return this.findById(result.insertId);
  }

  // Find workload by ID
  static async findById(workloadId) {
    try {
      const workloads = await query(
        `SELECT wr.*,
                sp.first_name,
                sp.last_name,
                sp.academic_rank,
                sp.employee_id,
                d.department_name as staff_department,
                c.college_name,
                s.semester_code,
                s.semester_name,
                s.start_date,
                s.end_date,
                ay.year_code,
                ay.year_name
         FROM workload_rp wr
         LEFT JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         LEFT JOIN semesters s ON wr.semester_id = s.semester_id
         LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
         WHERE wr.workload_id = ?`,
        [workloadId]
      );

      if (!workloads[0]) return null;

      const workload = workloads[0];

      // Calculate derived fields
      workload.total_course_load =
        (workload.each_section_course_load || 0) *
        (workload.number_of_sections || 1);
      workload.total_credit_hours =
        (workload.lecture_credit_hours || 0) +
        (workload.tutorial_credit_hours || 0) +
        (workload.lab_credit_hours || 0);
      workload.total_admin_load =
        (workload.elip_load || 0) +
        (workload.hdp_load || 0) +
        (workload.course_chair_load || 0) +
        (workload.section_advisor_load || 0) +
        (workload.advising_load || 0) +
        (workload.position_load || 0);

      // Calculate validation
      try {
        const WorkloadService = await import("../services/WorkloadService.js");
        workload.validation =
          await WorkloadService.default.validateWorkloadCompliance(workload);
      } catch (error) {
        console.error("Validation error:", error);
        workload.validation = {
          status: "validation_error",
          errors: [error.message],
          warnings: [],
        };
      }

      return workload;
    } catch (error) {
      console.error("Find by ID error:", error);
      return null;
    }
  }

  // Find workload by staff and semester
  static async findByStaffAndSemester(staffId, semesterId) {
    try {
      const workloads = await query(
        `SELECT wr.* FROM workload_rp wr 
         WHERE wr.staff_id = ? AND wr.semester_id = ?`,
        [staffId, semesterId]
      );
      return workloads[0] || null;
    } catch (error) {
      console.error("Find by staff and semester error:", error);
      return null;
    }
  }

  // Get all workloads with filters
  static async findAll(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = " WHERE 1=1";
      const params = [];

      // Build WHERE clause based on filters
      if (filters.staff_id) {
        whereClause += " AND wr.staff_id = ?";
        params.push(filters.staff_id);
      }

      if (filters.semester_id) {
        whereClause += " AND wr.semester_id = ?";
        params.push(filters.semester_id);
      }

      if (filters.department_id) {
        whereClause += " AND sp.department_id = ?";
        params.push(filters.department_id);
      }

      if (filters.college_id) {
        whereClause += " AND d.college_id = ?";
        params.push(filters.college_id);
      }

      if (filters.status) {
        whereClause += " AND wr.status = ?";
        params.push(filters.status);
      }

      if (filters.course_code) {
        whereClause += " AND wr.course_code LIKE ?";
        params.push(`%${filters.course_code}%`);
      }

      // Get workloads with staff details
      const workloads = await query(
        `SELECT 
          wr.*,
          sp.first_name,
          sp.last_name,
          sp.academic_rank,
          d.department_name as staff_department,
          d.department_code,
          c.college_name,
          s.semester_code,
          s.semester_name
         FROM workload_rp wr
         LEFT JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         LEFT JOIN semesters s ON wr.semester_id = s.semester_id
         ${whereClause}
         ORDER BY wr.updated_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await query(
        `SELECT COUNT(*) as count 
         FROM workload_rp wr
         LEFT JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         ${whereClause}`,
        params
      );

      const total = totalResult[0]?.count || 0;

      return {
        workloads: workloads || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Find all workloads error:", error);
      return {
        workloads: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      };
    }
  }

  // Update workload
  static async update(workloadId, updateData) {
    try {
      const fields = Object.keys(updateData);
      if (fields.length === 0) return null;

      // Prepare SET clause
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = [...fields.map((field) => updateData[field]), workloadId];

      await query(
        `UPDATE workload_rp SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE workload_id = ?`,
        values
      );

      return this.findById(workloadId);
    } catch (error) {
      console.error("Update workload error:", error);
      return null;
    }
  }

  // Delete workload
  static async delete(workloadId) {
    try {
      await query("DELETE FROM workload_rp WHERE workload_id = ?", [
        workloadId,
      ]);
      return true;
    } catch (error) {
      console.error("Delete workload error:", error);
      return false;
    }
  }

  // Submit workload for approval
  static async submitForApproval(workloadId, submittedBy) {
    try {
      const workload = await this.findById(workloadId);
      if (!workload) {
        throw new Error("Workload not found");
      }

      if (workload.status !== "draft") {
        throw new Error("Workload can only be submitted from draft status");
      }

      // Update status to submitted
      await this.update(workloadId, { status: "submitted" });

      // Create first approval step (to Department Head)
      await this.createApprovalStep(workloadId, "department_head", submittedBy);

      return this.findById(workloadId);
    } catch (error) {
      console.error("Submit for approval error:", error);
      throw error;
    }
  }

  // Create approval step
  static async createApprovalStep(workloadId, approverRole, createdBy) {
    try {
      await query(
        `INSERT INTO approval_workflow 
         (entity_type, entity_id, approver_role, status, created_at) 
         VALUES ('workload_rp', ?, ?, 'pending', NOW())`,
        [workloadId, approverRole]
      );
    } catch (error) {
      console.error("Create approval step error:", error);
      throw error;
    }
  }

  // Get approval workflow for workload
  static async getApprovalWorkflow(workloadId) {
    try {
      const approvals = await query(
        `SELECT aw.*,
                u.username as approver_username,
                u.email as approver_email
         FROM approval_workflow aw
         LEFT JOIN users u ON aw.approver_id = u.user_id
         WHERE aw.entity_type = 'workload_rp' AND aw.entity_id = ?
         ORDER BY aw.created_at`,
        [workloadId]
      );

      return approvals;
    } catch (error) {
      console.error("Get approval workflow error:", error);
      return [];
    }
  }

  // Approve workload step
  static async approveStep(approvalId, approverId, comments = "") {
    try {
      await query(
        `UPDATE approval_workflow 
         SET status = 'approved', 
             approver_id = ?,
             comments = ?,
             updated_at = NOW()
         WHERE approval_id = ?`,
        [approverId, comments, approvalId]
      );

      // Get the approval to check next steps
      const [approval] = await query(
        "SELECT * FROM approval_workflow WHERE approval_id = ?",
        [approvalId]
      );

      // Update workload status based on approval role
      if (approval) {
        const statusMap = {
          department_head: "dh_approved",
          dean: "dean_approved",
          hr_director: "hr_approved",
          vpaa: "vpaa_approved",
          vpaf: "vpaf_approved",
          finance: "finance_approved",
        };

        if (statusMap[approval.approver_role]) {
          await this.update(approval.entity_id, {
            status: statusMap[approval.approver_role],
          });
        }

        // Create next approval step if needed
        await this.createNextApprovalStep(
          approval.entity_id,
          approval.approver_role
        );
      }

      return approval;
    } catch (error) {
      console.error("Approve step error:", error);
      throw error;
    }
  }

  // Reject workload
  static async rejectWorkload(workloadId, approverId, comments) {
    try {
      // Update all pending approvals to rejected
      await query(
        `UPDATE approval_workflow 
         SET status = 'rejected',
             approver_id = ?,
             comments = ?,
             updated_at = NOW()
         WHERE entity_type = 'workload_rp' 
           AND entity_id = ? 
           AND status = 'pending'`,
        [approverId, comments, workloadId]
      );

      // Update workload status to rejected
      await this.update(workloadId, { status: "rejected" });

      return this.findById(workloadId);
    } catch (error) {
      console.error("Reject workload error:", error);
      throw error;
    }
  }

  // Return workload for correction
  static async returnForCorrection(workloadId, approverId, comments) {
    try {
      // Update current approval to returned
      await query(
        `UPDATE approval_workflow 
         SET status = 'returned',
             approver_id = ?,
             comments = ?,
             updated_at = NOW()
         WHERE entity_type = 'workload_rp' 
           AND entity_id = ? 
           AND status = 'pending'
         ORDER BY created_at DESC LIMIT 1`,
        [approverId, comments, workloadId]
      );

      // Update workload status to draft
      await this.update(workloadId, { status: "draft" });

      return this.findById(workloadId);
    } catch (error) {
      console.error("Return for correction error:", error);
      throw error;
    }
  }

  // Create next approval step
  static async createNextApprovalStep(workloadId, currentRole) {
    try {
      const nextRoleMap = {
        department_head: "dean",
        dean: "hr_director",
        hr_director: "vpaa",
        vpaa: "vpaf",
        vpaf: "finance",
        finance: null,
      };

      const nextRole = nextRoleMap[currentRole];
      if (nextRole) {
        await this.createApprovalStep(workloadId, nextRole, null);
      }
    } catch (error) {
      console.error("Create next approval step error:", error);
      throw error;
    }
  }

  // Get workload statistics
  static async getStatistics(semesterId = null, departmentId = null) {
    try {
      let whereClause = " WHERE 1=1";
      const params = [];

      if (semesterId) {
        whereClause += " AND wr.semester_id = ?";
        params.push(semesterId);
      }

      if (departmentId) {
        whereClause += " AND sp.department_id = ?";
        params.push(departmentId);
      }

      const stats = await query(
        `SELECT 
          COUNT(*) as total_workloads,
          COALESCE(SUM(wr.total_load), 0) as total_load_hours,
          COALESCE(AVG(wr.total_load), 0) as average_load,
          COALESCE(SUM(wr.over_payment_birr), 0) as total_over_payment,
          COUNT(CASE WHEN wr.status = 'draft' THEN 1 END) as draft_count,
          COUNT(CASE WHEN wr.status = 'submitted' THEN 1 END) as submitted_count,
          COUNT(CASE WHEN wr.status = 'dh_approved' THEN 1 END) as dh_approved_count,
          COUNT(CASE WHEN wr.status = 'dean_approved' THEN 1 END) as dean_approved_count,
          COUNT(CASE WHEN wr.status = 'hr_approved' THEN 1 END) as hr_approved_count,
          COUNT(CASE WHEN wr.status = 'vpaa_approved' THEN 1 END) as vpaa_approved_count,
          COUNT(CASE WHEN wr.status = 'vpaf_approved' THEN 1 END) as vpaf_approved_count,
          COUNT(CASE WHEN wr.status = 'finance_approved' THEN 1 END) as finance_approved_count,
          COUNT(CASE WHEN wr.status = 'rejected' THEN 1 END) as rejected_count,
          COUNT(DISTINCT wr.staff_id) as unique_staff,
          COUNT(DISTINCT sp.department_id) as departments_covered
         FROM workload_rp wr
         LEFT JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
         ${whereClause}`,
        params
      );

      return stats[0] || {};
    } catch (error) {
      console.error("Get statistics error:", error);
      return {};
    }
  }

  // Get pending approvals for a role
  static async getPendingApprovals(role, userId = null) {
    try {
      let whereClause = " WHERE aw.approver_role = ? AND aw.status = 'pending'";
      const params = [role];

      if (userId && role === "department_head") {
        // For department head, get only their department staff
        whereClause += ` AND sp.department_id IN (
          SELECT department_id FROM departments WHERE head_user_id = ?
        )`;
        params.push(userId);
      }

      const approvals = await query(
        `SELECT 
          aw.*,
          wr.workload_id,
          wr.course_code,
          wr.total_load,
          wr.over_payment_birr,
          wr.status as workload_status,
          sp.first_name,
          sp.last_name,
          sp.academic_rank,
          d.department_name,
          s.semester_code,
          s.semester_name
         FROM approval_workflow aw
         JOIN workload_rp wr ON aw.entity_id = wr.workload_id
         JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
         JOIN departments d ON sp.department_id = d.department_id
         JOIN semesters s ON wr.semester_id = s.semester_id
         ${whereClause}
         ORDER BY aw.created_at`,
        params
      );

      return approvals;
    } catch (error) {
      console.error("Get pending approvals error:", error);
      return [];
    }
  }

  // Calculate workload from sections
  static async calculateFromSections(staffId, semesterId) {
    try {
      const sections = await query(
        `SELECT 
          c.course_code,
          c.credit_hours as course_credit_hours,
          c.lecture_hours as lecture_credit_hours,
          c.tutorial_hours as tutorial_credit_hours,
          c.lab_hours as lab_credit_hours,
          d.department_name as student_department,
          s.semester_code,
          COUNT(sec.section_id) as number_of_sections,
          AVG(sec.student_count) as avg_student_count
         FROM sections sec
         JOIN courses c ON sec.course_id = c.course_id
         JOIN departments d ON c.department_id = d.department_id
         JOIN semesters s ON sec.semester_id = s.semester_id
         WHERE sec.instructor_id = ? AND sec.semester_id = ?
         GROUP BY c.course_id, d.department_id`,
        [staffId, semesterId]
      );

      if (!sections.length) {
        throw new Error("No sections found for this staff in the semester");
      }

      // For now, use the first section's details
      const section = sections[0];

      // Calculate each section course load based on credit hours
      const eachSectionCourseLoad = section.course_credit_hours * 1.5; // Assuming 1.5 factor

      // Create workload with calculated values
      const workloadData = {
        staff_id: staffId,
        semester_id: semesterId,
        course_code: section.course_code,
        course_credit_hours: section.course_credit_hours,
        lecture_credit_hours: section.lecture_credit_hours,
        tutorial_credit_hours: section.tutorial_credit_hours,
        lab_credit_hours: section.lab_credit_hours,
        student_department: section.student_department,
        academic_year: section.semester_code.substring(0, 4),
        number_of_sections: section.number_of_sections,
        each_section_course_load: eachSectionCourseLoad,
        variety_of_course_load: 0,
        research_load: 0,
        community_service_load: 0,
        elip_load: 0,
        hdp_load: 0,
        course_chair_load: 0,
        section_advisor_load: 0,
        advising_load: 0,
        position_load: 0,
        total_load: eachSectionCourseLoad * section.number_of_sections,
        status: "draft",
      };

      return await this.createOrUpdate(workloadData);
    } catch (error) {
      console.error("Calculate from sections error:", error);
      throw error;
    }
  }

  // Get department workload summary
  static async getDepartmentSummary(departmentId, semesterId) {
    try {
      const summary = await query(
        `SELECT 
          sp.academic_rank,
          COUNT(wr.workload_id) as workload_count,
          COALESCE(SUM(wr.total_load), 0) as total_load_hours,
          COALESCE(AVG(wr.total_load), 0) as average_load,
          COALESCE(SUM(wr.over_payment_birr), 0) as total_over_payment
         FROM workload_rp wr
         JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
         WHERE sp.department_id = ? AND wr.semester_id = ?
         GROUP BY sp.academic_rank
         ORDER BY sp.academic_rank`,
        [departmentId, semesterId]
      );

      return summary;
    } catch (error) {
      console.error("Get department summary error:", error);
      return [];
    }
  }
}

export default WorkloadRPModel;
