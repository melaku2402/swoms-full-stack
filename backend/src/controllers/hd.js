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

export default WorkloadRPModel;// ============================================
// FILE: src/models/WorkloadNRPModel.js (COMPLETE FIXED VERSION)
// ============================================
import { query } from "../config/database.js";
import WorkloadNRPService from "../services/WorkloadNRPService.js";
import StaffModel from "./StaffModel.js";

class WorkloadNRPModel {
  // Find workload by ID
  static async findById(nrpId) {
    try {
      const workloads = await query(
        `SELECT wn.*,
                sp.first_name,
                sp.last_name,
                sp.middle_name,
                sp.employee_id,
                sp.academic_rank,
                sp.employment_type,
                d.department_name,
                d.department_code,
                c.college_name,
                c.college_code,
                cr.course_code as actual_course_code,
                cr.course_title as actual_course_title,
                s.semester_code,
                s.semester_name,
                s.start_date,
                s.end_date,
                ay.year_code,
                ay.year_name,
                ps.payment_status,
                ps.sheet_number,
                
                -- Calculate derived fields
                (wn.lecture_credit_hours + wn.lab_credit_hours + wn.tutorial_credit_hours) as total_credit_hours,
                (wn.teaching_hours + wn.module_hours) as total_teaching_hours,
                (wn.teaching_payment + wn.tutorial_payment + wn.assignment_payment + wn.exam_payment + wn.project_payment + wn.overload_payment) as calculated_total_payment
                
         FROM workload_nrp wn
         LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         LEFT JOIN courses cr ON wn.course_id = cr.course_id
         LEFT JOIN semesters s ON wn.semester_id = s.semester_id
         LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
         LEFT JOIN payment_sheets ps ON wn.nrp_id = ps.nrp_id
         WHERE wn.nrp_id = ?`,
        [nrpId]
      );

      if (!workloads[0]) return null;

      const workload = workloads[0];

      // Add calculated fields if they don't exist
      if (!workload.total_credit_hours) {
        workload.total_credit_hours =
          (workload.lecture_credit_hours || 0) +
          (workload.lab_credit_hours || 0) +
          (workload.tutorial_credit_hours || 0);
      }

      if (!workload.total_teaching_hours) {
        workload.total_teaching_hours =
          (workload.teaching_hours || 0) + (workload.module_hours || 0);
      }

      if (!workload.calculated_total_payment) {
        workload.calculated_total_payment =
          (workload.teaching_payment || 0) +
          (workload.tutorial_payment || 0) +
          (workload.assignment_payment || 0) +
          (workload.exam_payment || 0) +
          (workload.project_payment || 0) +
          (workload.overload_payment || 0);
      }

      // Get approval workflow
      const approvals = await query(
        `SELECT aw.*,
                u.username as approver_username,
                u.email as approver_email,
                sp2.first_name as approver_first_name,
                sp2.last_name as approver_last_name
         FROM approval_workflow aw
         LEFT JOIN users u ON aw.approver_id = u.user_id
         LEFT JOIN staff_profiles sp2 ON u.user_id = sp2.user_id
         WHERE aw.entity_type = 'workload_nrp' AND aw.entity_id = ?
         ORDER BY aw.created_at`,
        [nrpId]
      );

      workload.approval_workflow = approvals || [];

      return workload;
    } catch (error) {
      console.error("Find by ID error:", error);
      return null;
    }
  }

  //  createOrUpdate method:
  static async createOrUpdate(nrpData) {
    const {
      staff_id,
      semester_id,
      program_type,
      contract_number,
      academic_year,
      academic_year_ec,
      contract_type = "teaching",
      course_id,
      course_code,
      course_title,
      credit_hours = 0,
      lecture_credit_hours = 0,
      lab_credit_hours = 0,
      tutorial_credit_hours = 0,
      lecture_sections = 0,
      lab_sections = 0,
      // tutorial_sessions = 0,
      teaching_hours = 0,
      module_hours = 0,
      student_count = 0,
      assignment_students = 0,
      exam_students = 0,
      project_advising,
      project_groups = 0,
      rate_category = "default",
      rate_per_rank,
      assignment_rate = 25.0,
      exam_rate = 20.0,
      tutorial_rate_per_hour = 100.0,
      teaching_payment = 0,
      tutorial_payment = 0,
      assignment_payment = 0,
      exam_payment = 0,
      project_payment = 0,
      total_payment = 0,
      total_hours_worked = 0,
      contract_duration_from,
      contract_duration_to,
      is_overload = false,
      overload_hours = 0,
      overload_payment = 0,
      status = "draft",
    } = nrpData;

    // Check if workload already exists
    const existing = await this.findByStaffSemesterProgram(
      staff_id,
      semester_id,
      program_type
    );

    if (existing) {
      // Update existing workload
      return await this.update(existing.nrp_id, nrpData);
    }

    // Add helper function to clean decimal values
    const cleanDecimal = (value, defaultValue = 0) => {
      if (value === null || value === undefined) return defaultValue;

      // Convert to string and remove any non-numeric characters except decimal point
      let strValue = String(value).trim();

      // Remove any commas or other thousands separators
      strValue = strValue.replace(/,/g, "");

      // Handle multiple decimal points by taking only the first part
      const parts = strValue.split(".");
      if (parts.length > 2) {
        // If there are multiple decimal points, take only the first part with one decimal
        strValue = parts[0] + "." + parts[1];
      } else if (parts.length === 2 && parts[1].includes(".")) {
        // If the decimal part has a decimal point
        const decimalParts = parts[1].split(".");
        strValue = parts[0] + "." + decimalParts[0];
      }

      // Parse as float
      const result = parseFloat(strValue);

      // Return defaultValue if parsing failed
      return isNaN(result) ? defaultValue : result;
    };

    // Prepare values for INSERT - FIXED: Clean all decimal values
    const values = [
      staff_id,
      semester_id,
      program_type,
      contract_number || `CONTRACT-${Date.now()}`,
      academic_year || `${new Date().getFullYear()}`,
      academic_year_ec || null,
      contract_type,
      course_id || null,
      course_code || "",
      course_title || "",
      cleanDecimal(credit_hours), // FIXED
      cleanDecimal(lecture_credit_hours), // FIXED
      cleanDecimal(lab_credit_hours), // FIXED
      cleanDecimal(tutorial_credit_hours), // FIXED
      parseInt(lecture_sections) || 0,
      parseInt(lab_sections) || 0,
      cleanDecimal(teaching_hours), // FIXED
      cleanDecimal(module_hours), // FIXED
      parseInt(student_count) || 0,
      parseInt(assignment_students) || 0,
      parseInt(exam_students) || 0,
      project_advising || null,
      parseInt(project_groups) || 0,
      rate_category,
      cleanDecimal(rate_per_rank) || null, // FIXED
      cleanDecimal(assignment_rate, 25.0), // FIXED
      cleanDecimal(exam_rate, 20.0), // FIXED
      cleanDecimal(tutorial_rate_per_hour, 100.0), // FIXED
      cleanDecimal(teaching_payment), // FIXED
      cleanDecimal(tutorial_payment), // FIXED
      cleanDecimal(assignment_payment), // FIXED
      cleanDecimal(exam_payment), // FIXED
      cleanDecimal(project_payment), // FIXED
      cleanDecimal(total_payment), // FIXED - This was causing the error
      cleanDecimal(total_hours_worked), // FIXED - This was causing the error
      contract_duration_from || null,
      contract_duration_to || null,
      is_overload ? 1 : 0,
      cleanDecimal(overload_hours), // FIXED
      cleanDecimal(overload_payment), // FIXED
      status,
    ];

    console.log("Cleaned total_payment:", cleanDecimal(total_payment));
    console.log(
      "Cleaned total_hours_worked:",
      cleanDecimal(total_hours_worked)
    );

    // CORRECTED SQL with academic_year_ec
    const sql = `
  INSERT INTO workload_nrp 
  (staff_id, semester_id, program_type, contract_number, academic_year, academic_year_ec, contract_type, 
   course_id, course_code, course_title, credit_hours, lecture_credit_hours,
   lab_credit_hours, tutorial_credit_hours, lecture_sections, lab_sections,
   teaching_hours, module_hours, student_count, assignment_students, exam_students, project_advising, project_groups,
   rate_category, rate_per_rank, assignment_rate, exam_rate, tutorial_rate_per_hour,
   teaching_payment, tutorial_payment, assignment_payment, exam_payment, project_payment,
   total_payment, total_hours_worked, contract_duration_from, contract_duration_to,
   is_overload, overload_hours, overload_payment, status) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    console.log("Executing SQL...");
    try {
      const result = await query(sql, values);
      console.log("Insert successful, ID:", result.insertId);
      return this.findById(result.insertId);
    } catch (error) {
      console.error("Error in createOrUpdate:", error.message);
      console.error("SQL Error Code:", error.code);
      console.error("SQL:", sql);
      console.error("Values:", values);
      throw error;
    }
  }

  // Find workload by staff, semester, and program type
  static async findByStaffSemesterProgram(staffId, semesterId, programType) {
    try {
      const workloads = await query(
        `SELECT * FROM workload_nrp 
         WHERE staff_id = ? AND semester_id = ? AND program_type = ?`,
        [staffId, semesterId, programType]
      );
      return workloads[0] || null;
    } catch (error) {
      console.error("Find by staff, semester, program error:", error);
      return null;
    }
  }

  // Find workload by staff and semester
  static async findByStaffAndSemester(staffId, semesterId) {
    try {
      const workloads = await query(
        `SELECT * FROM workload_nrp 
         WHERE staff_id = ? AND semester_id = ?`,
        [staffId, semesterId]
      );
      return workloads;
    } catch (error) {
      console.error("Find by staff and semester error:", error);
      return [];
    }
  }

  // Get all workloads with filters
  // static async findAll(page = 1, limit = 20, filters = {}) {
  //   try {
  //     const offset = (page - 1) * limit;
  //     let whereClause = " WHERE 1=1";
  //     const params = [];

  //     // Build WHERE clause based on filters
  //     if (filters.staff_id) {
  //       whereClause += " AND wn.staff_id = ?";
  //       params.push(filters.staff_id);
  //     }

  //     if (filters.semester_id) {
  //       whereClause += " AND wn.semester_id = ?";
  //       params.push(filters.semester_id);
  //     }

  //     if (filters.department_id) {
  //       whereClause += " AND sp.department_id = ?";
  //       params.push(filters.department_id);
  //     }

  //     if (filters.college_id) {
  //       whereClause += " AND d.college_id = ?";
  //       params.push(filters.college_id);
  //     }

  //     if (filters.program_type) {
  //       whereClause += " AND wn.program_type = ?";
  //       params.push(filters.program_type);
  //     }

  //     if (filters.status) {
  //       whereClause += " AND wn.status = ?";
  //       params.push(filters.status);
  //     }

  //     if (filters.course_code) {
  //       whereClause += " AND (wn.course_code LIKE ? OR cr.course_code LIKE ?)";
  //       params.push(`%${filters.course_code}%`, `%${filters.course_code}%`);
  //     }

  //     if (filters.contract_number) {
  //       whereClause += " AND wn.contract_number LIKE ?";
  //       params.push(`%${filters.contract_number}%`);
  //     }

  //     if (filters.date_from) {
  //       whereClause += " AND wn.created_at >= ?";
  //       params.push(filters.date_from);
  //     }

  //     if (filters.date_to) {
  //       whereClause += " AND wn.created_at <= ?";
  //       params.push(filters.date_to);
  //     }

  //     // Get workloads with staff details
  //     const workloads = await query(
  //       `SELECT
  //         wn.*,
  //         sp.first_name,
  //         sp.last_name,
  //         sp.employee_id,
  //         sp.academic_rank,
  //         sp.employment_type,
  //         d.department_name,
  //         d.department_code,
  //         c.college_name,
  //         s.semester_code,
  //         s.semester_name,
  //         ay.year_code,
  //         ps.payment_status,
  //         ps.sheet_number,

  //         -- Calculate derived totals
  //         (wn.lecture_credit_hours + wn.lab_credit_hours + wn.tutorial_credit_hours) as total_credit_hours,
  //         (wn.teaching_hours + wn.module_hours) as total_teaching_hours,
  //         (wn.teaching_payment + wn.tutorial_payment + wn.assignment_payment + wn.exam_payment + wn.project_payment + wn.overload_payment) as calculated_total_payment,

  //         (SELECT COUNT(*) FROM approval_workflow aw
  //          WHERE aw.entity_type = 'workload_nrp'
  //            AND aw.entity_id = wn.nrp_id
  //            AND aw.status = 'pending') as pending_approvals

  //        FROM workload_nrp wn
  //        LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
  //        LEFT JOIN departments d ON sp.department_id = d.department_id
  //        LEFT JOIN colleges c ON d.college_id = c.college_id
  //        LEFT JOIN courses cr ON wn.course_id = cr.course_id
  //        LEFT JOIN semesters s ON wn.semester_id = s.semester_id
  //        LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
  //        LEFT JOIN payment_sheets ps ON wn.nrp_id = ps.nrp_id
  //        ${whereClause}
  //        ORDER BY wn.created_at DESC
  //        LIMIT ? OFFSET ?`,
  //       [...params, limit, offset]
  //     );

  //     // Get total count
  //     const totalResult = await query(
  //       `SELECT COUNT(*) as count
  //        FROM workload_nrp wn
  //        LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
  //        LEFT JOIN departments d ON sp.department_id = d.department_id
  //        LEFT JOIN colleges c ON d.college_id = c.college_id
  //        ${whereClause}`,
  //       params
  //     );

  //     const total = totalResult[0]?.count || 0;

  //     return {
  //       workloads: workloads || [],
  //       pagination: {
  //         page: parseInt(page),
  //         limit: parseInt(limit),
  //         total: parseInt(total),
  //         pages: Math.ceil(total / limit),
  //       },
  //     };
  //   } catch (error) {
  //     console.error("Find all workloads error:", error);
  //     return {
  //       workloads: [],
  //       pagination: {
  //         page: parseInt(page),
  //         limit: parseInt(limit),
  //         total: 0,
  //         pages: 0,
  //       },
  //     };
  //   }
  // }

  // Get all workloads with filters
  static async findAll(page = 1, limit = 20, filters = {}) {
    try {
      // FIX: Properly parse page and limit to ensure they're numbers
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        page = 1;
      } else {
        page = pageNum;
      }

      if (isNaN(limitNum) || limitNum < 1) {
        limit = 20;
      } else {
        limit = limitNum;
      }

      const offset = (page - 1) * limit;
      console.log(`DEBUG: page=${page}, limit=${limit}, offset=${offset}`);

      let whereClause = " WHERE 1=1";
      const params = [];

      // Build WHERE clause based on filters
      if (filters.staff_id) {
        whereClause += " AND wn.staff_id = ?";
        params.push(filters.staff_id);
      }

      if (filters.semester_id) {
        whereClause += " AND wn.semester_id = ?";
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

      if (filters.program_type) {
        whereClause += " AND wn.program_type = ?";
        params.push(filters.program_type);
      }

      if (filters.status) {
        whereClause += " AND wn.status = ?";
        params.push(filters.status);
      }

      if (filters.course_code) {
        whereClause += " AND (wn.course_code LIKE ? OR cr.course_code LIKE ?)";
        params.push(`%${filters.course_code}%`, `%${filters.course_code}%`);
      }

      if (filters.contract_number) {
        whereClause += " AND wn.contract_number LIKE ?";
        params.push(`%${filters.contract_number}%`);
      }

      if (filters.date_from) {
        whereClause += " AND wn.created_at >= ?";
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        whereClause += " AND wn.created_at <= ?";
        params.push(filters.date_to);
      }

      // Get workloads with staff details
      console.log(
        `DEBUG: Executing query with limit=${limit}, offset=${offset}`
      );
      const workloads = await query(
        `SELECT 
        wn.*,
        sp.first_name,
        sp.last_name,
        sp.employee_id,
        sp.academic_rank,
        sp.employment_type,
        d.department_name,
        d.department_code,
        c.college_name,
        s.semester_code,
        s.semester_name,
        ay.year_code,
        ay.year_name,
        ps.payment_status,
        ps.sheet_number,
        
        -- Calculate derived totals
        (wn.lecture_credit_hours + wn.lab_credit_hours + wn.tutorial_credit_hours) as total_credit_hours,
        (wn.teaching_hours + wn.module_hours) as total_teaching_hours,
        (wn.teaching_payment + wn.tutorial_payment + wn.assignment_payment + wn.exam_payment + wn.project_payment + wn.overload_payment) as calculated_total_payment,
        
        (SELECT COUNT(*) FROM approval_workflow aw 
         WHERE aw.entity_type = 'workload_nrp' 
           AND aw.entity_id = wn.nrp_id 
           AND aw.status = 'pending') as pending_approvals
         
       FROM workload_nrp wn
       LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       LEFT JOIN colleges c ON d.college_id = c.college_id
       LEFT JOIN courses cr ON wn.course_id = cr.course_id
       LEFT JOIN semesters s ON wn.semester_id = s.semester_id
       LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
       LEFT JOIN payment_sheets ps ON wn.nrp_id = ps.nrp_id
       ${whereClause}
       ORDER BY wn.created_at DESC
       LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await query(
        `SELECT COUNT(*) as count 
       FROM workload_nrp wn
       LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       LEFT JOIN colleges c ON d.college_id = c.college_id
       ${whereClause}`,
        params
      );

      const total = totalResult[0]?.count || 0;

      console.log(`DEBUG: Found ${workloads.length} workloads, total=${total}`);

      return {
        workloads: workloads || [],
        pagination: {
          page: page,
          limit: limit,
          total: parseInt(total),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Find all workloads error:", error);
      console.error("Stack trace:", error.stack);
      return {
        workloads: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      };
    }
  }

  // // Update workload
  // static async update(nrpId, updateData) {
  //   try {
  //     const fields = Object.keys(updateData);
  //     if (fields.length === 0) return null;

  //     // Don't update staff_id, semester_id, or program_type if workload is not in draft
  //     const current = await this.findById(nrpId);
  //     if (current && current.status !== "draft") {
  //       const restrictedFields = ["staff_id", "semester_id", "program_type"];
  //       restrictedFields.forEach((field) => {
  //         if (updateData[field] !== undefined) {
  //           delete updateData[field];
  //         }
  //       });
  //     }

  //     // Recalculate total payment if any payment component is updated
  //     if (
  //       updateData.teaching_payment !== undefined ||
  //       updateData.tutorial_payment !== undefined ||
  //       updateData.assignment_payment !== undefined ||
  //       updateData.exam_payment !== undefined ||
  //       updateData.project_payment !== undefined ||
  //       updateData.overload_payment !== undefined
  //     ) {
  //       const teaching =
  //         updateData.teaching_payment || current.teaching_payment || 0;
  //       const tutorial =
  //         updateData.tutorial_payment || current.tutorial_payment || 0;
  //       const assignment =
  //         updateData.assignment_payment || current.assignment_payment || 0;
  //       const exam = updateData.exam_payment || current.exam_payment || 0;
  //       const project =
  //         updateData.project_payment || current.project_payment || 0;
  //       const overload =
  //         updateData.overload_payment || current.overload_payment || 0;

  //       updateData.total_payment =
  //         teaching + tutorial + assignment + exam + project + overload;
  //     }

  //     // Prepare SET clause
  //     const setClause = fields.map((field) => `${field} = ?`).join(", ");
  //     const values = [...fields.map((field) => updateData[field]), nrpId];

  //     await query(
  //       `UPDATE workload_nrp SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE nrp_id = ?`,
  //       values
  //     );

  //     return this.findById(nrpId);
  //   } catch (error) {
  //     console.error("Update workload error:", error);
  //     return null;
  //   }
  // }

  // Update workload
  static async update(nrpId, updateData) {
    try {
      const fields = Object.keys(updateData);
      if (fields.length === 0) return null;

      // Add helper function to clean decimal values
      const cleanDecimal = (value, defaultValue = 0) => {
        if (value === null || value === undefined) return defaultValue;

        let strValue = String(value).trim();
        strValue = strValue.replace(/,/g, "");

        const parts = strValue.split(".");
        if (parts.length > 2) {
          strValue = parts[0] + "." + parts[1];
        } else if (parts.length === 2 && parts[1].includes(".")) {
          const decimalParts = parts[1].split(".");
          strValue = parts[0] + "." + decimalParts[0];
        }

        const result = parseFloat(strValue);
        return isNaN(result) ? defaultValue : result;
      };

      // Clean decimal values in updateData
      const cleanedUpdateData = { ...updateData };

      // List of decimal fields to clean
      const decimalFields = [
        "credit_hours",
        "lecture_credit_hours",
        "lab_credit_hours",
        "tutorial_credit_hours",
        "teaching_hours",
        "module_hours",
        "assignment_rate",
        "exam_rate",
        "tutorial_rate_per_hour",
        "teaching_payment",
        "tutorial_payment",
        "assignment_payment",
        "exam_payment",
        "project_payment",
        "total_payment",
        "total_hours_worked",
        "overload_hours",
        "overload_payment",
        "rate_per_rank",
      ];

      decimalFields.forEach((field) => {
        if (cleanedUpdateData[field] !== undefined) {
          cleanedUpdateData[field] = cleanDecimal(cleanedUpdateData[field]);
        }
      });

      // Don't allow updating certain fields if already submitted
      const current = await this.findById(nrpId);
      if (current && current.status !== "draft") {
        const restrictedFields = [
          "staff_id",
          "semester_id",
          "program_type",
          "course_id",
        ];
        restrictedFields.forEach((field) => {
          if (cleanedUpdateData[field] !== undefined) {
            delete cleanedUpdateData[field];
          }
        });
      }

      // If payment-related fields are updated, recalculate payment
      const paymentFields = [
        "credit_hours",
        "lecture_credit_hours",
        "lab_credit_hours",
        "tutorial_credit_hours",
        "teaching_hours",
        "module_hours",
        "assignment_students",
        "exam_students",
        "project_groups",
        "student_count",
        "rate_category",
        "is_overload",
        "overload_hours",
      ];

      const needsRecalculation = paymentFields.some(
        (field) => cleanedUpdateData[field] !== undefined
      );

      if (needsRecalculation) {
        // Get staff for rank-based calculation
        const staff = await StaffModel.findById(current.staff_id);

        // Merge current data with updates
        const updatedWorkloadData = { ...current, ...cleanedUpdateData };

        // Calculate total hours
        updatedWorkloadData.total_hours_worked =
          WorkloadNRPService.calculateTotalHours(updatedWorkloadData);

        // Calculate payment
        const paymentCalculation = await WorkloadNRPService.calculatePayment({
          ...updatedWorkloadData,
          academic_rank: staff?.academic_rank || "lecturer",
        });

        // Add payment data to update
        Object.assign(cleanedUpdateData, paymentCalculation);
      }

      // Prepare SET clause with cleaned data
      const fieldsToUpdate = Object.keys(cleanedUpdateData);
      const setClause = fieldsToUpdate
        .map((field) => `${field} = ?`)
        .join(", ");
      const values = [
        ...fieldsToUpdate.map((field) => cleanedUpdateData[field]),
        nrpId,
      ];

      await query(
        `UPDATE workload_nrp SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE nrp_id = ?`,
        values
      );

      return this.findById(nrpId);
    } catch (error) {
      console.error("Update workload error:", error);
      return null;
    }
  }

  // Delete workload
  static async delete(nrpId) {
    try {
      await query("DELETE FROM workload_nrp WHERE nrp_id = ?", [nrpId]);
      return true;
    } catch (error) {
      console.error("Delete workload error:", error);
      return false;
    }
  }

  // Submit workload for approval
  static async submitForApproval(nrpId, submittedBy) {
    try {
      const workload = await this.findById(nrpId);
      if (!workload) {
        throw new Error("NRP workload not found");
      }

      if (workload.status !== "draft") {
        throw new Error("Workload can only be submitted from draft status");
      }

      // Validate total payment is calculated
      if (!workload.total_payment || workload.total_payment <= 0) {
        throw new Error("Total payment must be calculated before submission");
      }

      // Update status to submitted
      await this.update(nrpId, { status: "submitted" });

      // Create first approval step (based on program type)
      const firstApprover = this.getFirstApproverRole(workload.program_type);
      await this.createApprovalStep(nrpId, firstApprover, submittedBy);

      return this.findById(nrpId);
    } catch (error) {
      console.error("Submit for approval error:", error);
      throw error;
    }
  }

  // Get first approver role based on program type
  static getFirstApproverRole(programType) {
    const approvalMap = {
      extension: "department_head",
      weekend: "department_head",
      summer: "department_head",
      distance: "cde_director",
    };
    return approvalMap[programType] || "department_head";
  }

  // Create approval step
  static async createApprovalStep(nrpId, approverRole, createdBy) {
    try {
      await query(
        `INSERT INTO approval_workflow 
         (entity_type, entity_id, approver_role, status, created_at) 
         VALUES ('workload_nrp', ?, ?, 'pending', NOW())`,
        [nrpId, approverRole]
      );
    } catch (error) {
      console.error("Create approval step error:", error);
      throw error;
    }
  }

  // Get approval workflow for workload
  static async getApprovalWorkflow(nrpId) {
    try {
      const approvals = await query(
        `SELECT aw.*,
                u.username as approver_username,
                u.email as approver_email,
                sp.first_name as approver_first_name,
                sp.last_name as approver_last_name
         FROM approval_workflow aw
         LEFT JOIN users u ON aw.approver_id = u.user_id
         LEFT JOIN staff_profiles sp ON u.user_id = sp.user_id
         WHERE aw.entity_type = 'workload_nrp' AND aw.entity_id = ?
         ORDER BY aw.created_at`,
        [nrpId]
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
          cde_director: "cde_approved",
          hr_director: "hr_approved",
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
  static async rejectWorkload(nrpId, approverId, comments) {
    try {
      // Update all pending approvals to rejected
      await query(
        `UPDATE approval_workflow 
         SET status = 'rejected',
             approver_id = ?,
             comments = ?,
             updated_at = NOW()
         WHERE entity_type = 'workload_nrp' 
           AND entity_id = ? 
           AND status = 'pending'`,
        [approverId, comments, nrpId]
      );

      // Update workload status to rejected
      await this.update(nrpId, { status: "rejected" });

      return this.findById(nrpId);
    } catch (error) {
      console.error("Reject workload error:", error);
      throw error;
    }
  }

  // Return workload for correction
  static async returnForCorrection(nrpId, approverId, comments) {
    try {
      // Update current approval to returned
      await query(
        `UPDATE approval_workflow 
         SET status = 'returned',
             approver_id = ?,
             comments = ?,
             updated_at = NOW()
         WHERE entity_type = 'workload_nrp' 
           AND entity_id = ? 
           AND status = 'pending'
         ORDER BY created_at DESC LIMIT 1`,
        [approverId, comments, nrpId]
      );

      // Update workload status to draft
      await this.update(nrpId, { status: "draft" });

      return this.findById(nrpId);
    } catch (error) {
      console.error("Return for correction error:", error);
      throw error;
    }
  }

  // Create next approval step
  static async createNextApprovalStep(nrpId, currentRole) {
    try {
      const nextRoleMap = {
        department_head: "dean",
        dean: "cde_director",
        cde_director: "hr_director",
        hr_director: "vpaf",
        vpaf: "finance",
        finance: null,
      };

      const nextRole = nextRoleMap[currentRole];
      if (nextRole) {
        await this.createApprovalStep(nrpId, nextRole, null);
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
        whereClause += " AND wn.semester_id = ?";
        params.push(semesterId);
      }

      if (departmentId) {
        whereClause += " AND sp.department_id = ?";
        params.push(departmentId);
      }

      const stats = await query(
        `SELECT 
          COUNT(*) as total_workloads,
          COALESCE(SUM(wn.total_payment), 0) as total_payments,
          COALESCE(AVG(wn.total_payment), 0) as average_payment,
          
          -- Program type breakdown
          SUM(CASE WHEN wn.program_type = 'extension' THEN 1 ELSE 0 END) as extension_count,
          SUM(CASE WHEN wn.program_type = 'weekend' THEN 1 ELSE 0 END) as weekend_count,
          SUM(CASE WHEN wn.program_type = 'summer' THEN 1 ELSE 0 END) as summer_count,
          SUM(CASE WHEN wn.program_type = 'distance' THEN 1 ELSE 0 END) as distance_count,
          
          -- Payment by program type
          COALESCE(SUM(CASE WHEN wn.program_type = 'extension' THEN wn.total_payment ELSE 0 END), 0) as extension_payments,
          COALESCE(SUM(CASE WHEN wn.program_type = 'weekend' THEN wn.total_payment ELSE 0 END), 0) as weekend_payments,
          COALESCE(SUM(CASE WHEN wn.program_type = 'summer' THEN wn.total_payment ELSE 0 END), 0) as summer_payments,
          COALESCE(SUM(CASE WHEN wn.program_type = 'distance' THEN wn.total_payment ELSE 0 END), 0) as distance_payments,
          
          -- Status counts
          COUNT(CASE WHEN wn.status = 'draft' THEN 1 END) as draft_count,
          COUNT(CASE WHEN wn.status = 'submitted' THEN 1 END) as submitted_count,
          COUNT(CASE WHEN wn.status = 'dh_approved' THEN 1 END) as dh_approved_count,
          COUNT(CASE WHEN wn.status = 'dean_approved' THEN 1 END) as dean_approved_count,
          COUNT(CASE WHEN wn.status = 'cde_approved' THEN 1 END) as cde_approved_count,
          COUNT(CASE WHEN wn.status = 'hr_approved' THEN 1 END) as hr_approved_count,
          COUNT(CASE WHEN wn.status = 'vpaf_approved' THEN 1 END) as vpaf_approved_count,
          COUNT(CASE WHEN wn.status = 'finance_approved' THEN 1 END) as finance_approved_count,
          COUNT(CASE WHEN wn.status = 'rejected' THEN 1 END) as rejected_count,
          COUNT(CASE WHEN wn.status = 'paid' THEN 1 END) as paid_count,
          
          -- Overload statistics
          COUNT(CASE WHEN wn.is_overload = 1 THEN 1 END) as overload_count,
          COALESCE(SUM(wn.overload_payment), 0) as total_overload_payment,
          
          COUNT(DISTINCT wn.staff_id) as unique_staff,
          COUNT(DISTINCT sp.department_id) as departments_covered
         FROM workload_nrp wn
         LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
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

      if (userId) {
        // For department head, get only their department staff
        if (role === "department_head") {
          whereClause += ` AND sp.department_id IN (
            SELECT department_id FROM departments WHERE head_user_id = ?
          )`;
          params.push(userId);
        }
        // For dean, get only their college staff
        else if (role === "dean") {
          whereClause += ` AND d.college_id IN (
            SELECT college_id FROM colleges WHERE dean_user_id = ?
          )`;
          params.push(userId);
        }
      }

      const approvals = await query(
        `SELECT 
          aw.*,
          wn.nrp_id,
          wn.program_type,
          wn.course_code,
          wn.total_payment,
          wn.status as workload_status,
          sp.first_name,
          sp.last_name,
          sp.academic_rank,
          d.department_name,
          s.semester_code,
          s.semester_name
         FROM approval_workflow aw
         JOIN workload_nrp wn ON aw.entity_id = wn.nrp_id
         JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         JOIN departments d ON sp.department_id = d.department_id
         JOIN semesters s ON wn.semester_id = s.semester_id
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

  // Calculate workload from courses
  static async calculateFromCourse(staffId, semesterId, courseId, programType) {
    try {
      const [course] = await query(
        `SELECT 
          c.course_code,
          c.course_title,
          c.credit_hours,
          c.lecture_hours,
          c.lab_hours,
          c.tutorial_hours,
          d.department_name
         FROM courses c
         JOIN departments d ON c.department_id = d.department_id
         WHERE c.course_id = ?`,
        [courseId]
      );

      if (!course) {
        throw new Error("Course not found");
      }

      // Get default rates based on program type
      const [rate] = await query(
        `SELECT * FROM rate_tables 
         WHERE program_type = ? 
           AND (effective_to IS NULL OR effective_to >= CURDATE())
         ORDER BY effective_from DESC LIMIT 1`,
        [programType]
      );

      // Calculate payment based on program type
      let totalPayment = 0;
      let teachingPayment = 0;
      let creditHours = course.credit_hours || 0;

      switch (programType) {
        case "extension":
        case "weekend":
          teachingPayment = creditHours * (rate?.amount_per_credit || 500);
          totalPayment = teachingPayment;
          break;
        case "summer":
          teachingPayment =
            (course.lecture_hours || 0) * (rate?.amount_per_hour || 450);
          totalPayment = teachingPayment;
          break;
        case "distance":
          teachingPayment =
            (course.lecture_hours || 0) * (rate?.amount_per_hour || 520);
          totalPayment = teachingPayment;
          break;
      }

      // Create workload with calculated values
      const workloadData = {
        staff_id: staffId,
        semester_id: semesterId,
        program_type: programType,
        course_id: courseId,
        course_code: course.course_code,
        course_title: course.course_title,
        credit_hours: creditHours,
        lecture_credit_hours: course.lecture_hours || 0,
        lab_credit_hours: course.lab_hours || 0,
        tutorial_credit_hours: course.tutorial_hours || 0,
        teaching_hours: course.lecture_hours || 0,
        teaching_payment: teachingPayment,
        total_payment: totalPayment,
        status: "draft",
      };

      return await this.createOrUpdate(workloadData);
    } catch (error) {
      console.error("Calculate from course error:", error);
      throw error;
    }
  }

  // Get department NRP summary
  static async getDepartmentSummary(departmentId, semesterId) {
    try {
      const summary = await query(
        `SELECT 
          wn.program_type,
          COUNT(wn.nrp_id) as workload_count,
          COALESCE(SUM(wn.total_payment), 0) as total_payments,
          COALESCE(AVG(wn.total_payment), 0) as average_payment,
          COUNT(CASE WHEN wn.status = 'finance_approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN wn.status = 'paid' THEN 1 END) as paid_count,
          COUNT(DISTINCT wn.staff_id) as staff_count
         FROM workload_nrp wn
         JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         WHERE sp.department_id = ? AND wn.semester_id = ?
         GROUP BY wn.program_type
         ORDER BY wn.program_type`,
        [departmentId, semesterId]
      );

      return summary;
    } catch (error) {
      console.error("Get department summary error:", error);
      return [];
    }
  }
}

export default WorkloadNRPModel;
 // Get all rank load limits
  static async getAllRankLoadLimits(req, res) {
    try {
      const { program_type = "regular" } = req.query;
      const limits = await RulesModel.getAllRankLoadLimits(program_type);
      return sendSuccess(res, "All rank load limits retrieved", limits);
    } catch (error) {
      console.error("Get all rank load limits error:", error);
      // Return empty object if error
      return sendSuccess(res, "All rank load limits retrieved", {});
    }
  }
import RulesModel from "../models/RulesModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { RULE_TYPES, PROGRAM_TYPES, ACADEMIC_RANKS } from "../config/constants.js";

class RulesController {
  // ==================== CRUD OPERATIONS ====================

  // Get all system rules with advanced filtering
  static async getAllRules(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        rule_type,
        program_type,
        is_active,
        rule_name,
        effective_from,
      } = req.query;

      const result = await RulesModel.findAll(parseInt(page), parseInt(limit), {
        rule_type,
        program_type,
        is_active:
          is_active === "true"
            ? true
            : is_active === "false"
            ? false
            : undefined,
        rule_name,
        effective_from,
      });

      return sendSuccess(res, "System rules retrieved successfully", result);
    } catch (error) {
      console.error("Get all rules error:", error);
      return sendError(res, "Failed to retrieve system rules", 500);
    }
  }

  // Get rule by ID
  static async getRuleById(req, res) {
    try {
      const { id } = req.params;
      const rule = await RulesModel.findById(parseInt(id));

      if (!rule) {
        return sendError(res, "Rule not found", 404);
      }

      // Get history for this rule
      const history = await RulesModel.getRuleHistory(rule.rule_name);

      return sendSuccess(res, "Rule retrieved successfully", {
        rule,
        history,
      });
    } catch (error) {
      console.error("Get rule error:", error);
      return sendError(res, "Failed to retrieve rule", 500);
    }
  }

  // Create a new rule
  static async createRule(req, res) {
    try {
      const {
        rule_name,
        rule_value,
        rule_type,
        program_type,
        effective_from,
        effective_to,
        description,
      } = req.body;

      // Validate required fields
      if (!rule_name || !rule_value || !rule_type || !effective_from) {
        return sendError(
          res,
          "Rule name, value, type, and effective from date are required",
          400
        );
      }

      // Validate rule type
      const validRuleTypes = Object.values(RULE_TYPES);
      if (!validRuleTypes.includes(rule_type)) {
        return sendError(
          res,
          `Invalid rule type. Must be one of: ${validRuleTypes.join(", ")}`,
          400
        );
      }

      // Validate program type if provided
      if (program_type && program_type !== "all") {
        const validProgramTypes = Object.values(PROGRAM_TYPES);
        if (!validProgramTypes.includes(program_type)) {
          return sendError(
            res,
            `Invalid program type. Must be one of: ${validProgramTypes.join(
              ", "
            )}`,
            400
          );
        }
      }

      // Validate rule value
      if (!RulesModel.validateRuleValue(rule_type, rule_value)) {
        return sendError(res, `Invalid value for rule type: ${rule_type}`, 400);
      }

      // Validate dates
      if (effective_to && new Date(effective_from) >= new Date(effective_to)) {
        return sendError(
          res,
          "Effective from date must be before effective to date",
          400
        );
      }

      const rule = await RulesModel.create({
        rule_name,
        rule_value,
        rule_type,
        program_type: program_type || null,
        effective_from,
        effective_to: effective_to || null,
        description: description || null,
      });

      return sendSuccess(res, "Rule created successfully", rule, 201);
    } catch (error) {
      console.error("Create rule error:", error);
      return sendError(res, error.message || "Failed to create rule", 400);
    }
  }

  // Update a rule (creates new version if active)
  static async updateRule(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if rule exists
      const existingRule = await RulesModel.findById(parseInt(id));
      if (!existingRule) {
        return sendError(res, "Rule not found", 404);
      }

      // Validate rule value if provided
      if (updateData.rule_value !== undefined) {
        const ruleType = updateData.rule_type || existingRule.rule_type;
        if (!RulesModel.validateRuleValue(ruleType, updateData.rule_value)) {
          return sendError(
            res,
            `Invalid value for rule type: ${ruleType}`,
            400
          );
        }
      }

      // If rule is active and value is changing, create new version
      if (
        existingRule.is_active &&
        updateData.rule_value &&
        updateData.rule_value !== existingRule.rule_value
      ) {
        const newRule = await RulesModel.create({
          rule_name: existingRule.rule_name,
          rule_value: updateData.rule_value,
          rule_type: updateData.rule_type || existingRule.rule_type,
          program_type: updateData.program_type || existingRule.program_type,
          effective_from: new Date().toISOString().split("T")[0],
          effective_to: updateData.effective_to || null,
          description: updateData.description || existingRule.description,
          previous_version_id: existingRule.rule_id,
        });

        // Deactivate the old rule
        await RulesModel.deactivate(existingRule.rule_id);

        return sendSuccess(
          res,
          "New rule version created and activated",
          newRule
        );
      }

      // Otherwise, update normally
      const updatedRule = await RulesModel.update(parseInt(id), updateData);
      return sendSuccess(res, "Rule updated successfully", updatedRule);
    } catch (error) {
      console.error("Update rule error:", error);
      return sendError(res, error.message || "Failed to update rule", 400);
    }
  }

  // Delete a rule
  static async deleteRule(req, res) {
    try {
      const { id } = req.params;

      const existingRule = await RulesModel.findById(parseInt(id));
      if (!existingRule) {
        return sendError(res, "Rule not found", 404);
      }

      if (existingRule.is_active) {
        return sendError(
          res,
          "Cannot delete active rule. Deactivate it first.",
          400
        );
      }

      await RulesModel.delete(parseInt(id));
      return sendSuccess(res, "Rule deleted successfully");
    } catch (error) {
      console.error("Delete rule error:", error);
      return sendError(res, "Failed to delete rule", 500);
    }
  }

  // Activate a rule
  static async activateRule(req, res) {
    try {
      const { id } = req.params;

      const existingRule = await RulesModel.findById(parseInt(id));
      if (!existingRule) {
        return sendError(res, "Rule not found", 404);
      }

      if (existingRule.is_active) {
        return sendError(res, "Rule is already active", 400);
      }

      const activatedRule = await RulesModel.activate(parseInt(id));
      return sendSuccess(res, "Rule activated successfully", activatedRule);
    } catch (error) {
      console.error("Activate rule error:", error);
      return sendError(res, "Failed to activate rule", 500);
    }
  }

  // Deactivate a rule
  static async deactivateRule(req, res) {
    try {
      const { id } = req.params;

      const deactivatedRule = await RulesModel.deactivate(parseInt(id));
      return sendSuccess(res, "Rule deactivated successfully", deactivatedRule);
    } catch (error) {
      console.error("Deactivate rule error:", error);
      return sendError(res, "Failed to deactivate rule", 500);
    }
  }

  // ==================== BUSINESS LOGIC OPERATIONS ====================

  // Evaluate a rule
  static async evaluateRule(req, res) {
    try {
      const { rule_name, program_type = null, context = {} } = req.body;

      if (!rule_name) {
        return sendError(res, "Rule name is required", 400);
      }

      const result = await RulesModel.evaluate(
        rule_name,
        program_type,
        context
      );
      return sendSuccess(res, "Rule evaluated successfully", result);
    } catch (error) {
      console.error("Evaluate rule error:", error);
      return sendError(res, error.message || "Failed to evaluate rule", 400);
    }
  }

  // Calculate load with factors
  static async calculateLoad(req, res) {
    try {
      const {
        lecture_hours,
        lab_hours = 0,
        tutorial_hours = 0,
        program_type = "regular",
      } = req.body;

      if (!lecture_hours && lecture_hours !== 0) {
        return sendError(res, "Lecture hours are required", 400);
      }

      const result = await RulesModel.calculateLoad(
        parseFloat(lecture_hours),
        parseFloat(lab_hours),
        parseFloat(tutorial_hours),
        program_type
      );

      return sendSuccess(res, "Load calculated successfully", result);
    } catch (error) {
      console.error("Calculate load error:", error);
      return sendError(res, error.message || "Failed to calculate load", 400);
    }
  }

  // Validate rank load
  static async validateRankLoad(req, res) {
    try {
      const { rank, total_hours, program_type = "regular" } = req.body;

      if (!rank || total_hours === undefined) {
        return sendError(res, "Rank and total hours are required", 400);
      }

      const result = await RulesModel.validateRankLoad(
        rank,
        parseFloat(total_hours),
        program_type
      );

      return sendSuccess(res, "Rank load validation completed", result);
    } catch (error) {
      console.error("Validate rank load error:", error);
      return sendError(
        res,
        error.message || "Failed to validate rank load",
        400
      );
    }
  }

  // Calculate NRP payment
  static async calculateNRPPayment(req, res) {
    try {
      const {
        program_type,
        rate_category = "default",
        credit_hours,
        student_count = 0,
      } = req.body;

      if (!program_type || !credit_hours) {
        return sendError(
          res,
          "Program type and credit hours are required",
          400
        );
      }

      const result = await RulesModel.calculateNRPPayment(
        program_type,
        rate_category,
        parseFloat(credit_hours),
        parseInt(student_count)
      );

      return sendSuccess(res, "NRP payment calculated", result);
    } catch (error) {
      console.error("Calculate NRP payment error:", error);
      return sendError(
        res,
        error.message || "Failed to calculate NRP payment",
        400
      );
    }
  }

  // Calculate overload payment
  static async calculateOverloadPayment(req, res) {
    try {
      const { overload_hours } = req.body;

      if (!overload_hours || overload_hours <= 0) {
        return sendError(res, "Valid overload hours are required", 400);
      }

      const result = await RulesModel.calculateOverloadPayment(
        parseFloat(overload_hours)
      );

      return sendSuccess(res, "Overload payment calculated", result);
    } catch (error) {
      console.error("Calculate overload payment error:", error);
      return sendError(
        res,
        error.message || "Failed to calculate overload payment",
        400
      );
    }
  }

  // Get correction rates
  static async getCorrectionRates(req, res) {
    try {
      const rates = await RulesModel.getCorrectionRates();
      return sendSuccess(res, "Correction rates retrieved", rates);
    } catch (error) {
      console.error("Get correction rates error:", error);
      // Return default values if rules don't exist
      const defaultRates = {
        assignment: 10,
        exam: 15,
        tutorial: 150,
      };
      return sendSuccess(res, "Correction rates retrieved (default)", defaultRates);
    }
  }

  // Apply summer distribution
  static async applySummerDistribution(req, res) {
    try {
      const { total_payment } = req.body;

      if (!total_payment || total_payment <= 0) {
        return sendError(res, "Valid total payment amount is required", 400);
      }

      const result = await RulesModel.applySummerDistribution(
        parseFloat(total_payment)
      );

      return sendSuccess(res, "Summer distribution applied", result);
    } catch (error) {
      console.error("Apply summer distribution error:", error);
      // Return default distribution
      const defaultDistribution = {
        total: parseFloat(total_payment).toFixed(2),
        stage1: parseFloat((total_payment * 0.3).toFixed(2)),
        stage2: parseFloat((total_payment * 0.3).toFixed(2)),
        stage3: parseFloat((total_payment * 0.2).toFixed(2)),
        stage4: parseFloat((total_payment * 0.2).toFixed(2)),
        distribution: {
          stage1: 30.0,
          stage2: 30.0,
          stage3: 20.0,
          stage4: 20.0,
        },
      };
      return sendSuccess(res, "Summer distribution applied (default)", defaultDistribution);
    }
  }

  // ==================== UTILITY OPERATIONS ====================

  // Get rule by name
  static async getRuleByName(req, res) {
    try {
      const { name } = req.params;
      const { program_type } = req.query;

      const rule = await RulesModel.findActiveRuleByName(name, program_type);
      if (!rule) {
        return sendError(res, `Rule '${name}' not found`, 404);
      }

      return sendSuccess(res, "Rule retrieved successfully", rule);
    } catch (error) {
      console.error("Get rule by name error:", error);
      return sendError(res, "Failed to retrieve rule", 500);
    }
  }

  // Get rules by type
  static async getRulesByType(req, res) {
    try {
      const { type } = req.params;
      const { program_type, active_only = "true" } = req.query;

      const validRuleTypes = Object.values(RULE_TYPES);
      if (!validRuleTypes.includes(type)) {
        return sendError(
          res,
          `Invalid rule type. Must be one of: ${validRuleTypes.join(", ")}`,
          400
        );
      }

      const rules = await RulesModel.findByType(
        type,
        program_type,
        active_only === "true"
      );

      return sendSuccess(res, `Rules of type ${type} retrieved`, rules);
    } catch (error) {
      console.error("Get rules by type error:", error);
      return sendError(res, "Failed to retrieve rules by type", 500);
    }
  }

  // Get rule history
  static async getRuleHistory(req, res) {
    try {
      const { name } = req.params;
      const history = await RulesModel.getRuleHistory(name);
      return sendSuccess(res, "Rule history retrieved", history);
    } catch (error) {
      console.error("Get rule history error:", error);
      return sendError(res, "Failed to retrieve rule history", 500);
    }
  }

  // Get rank load limits
  static async getRankLoadLimits(req, res) {
    try {
      const { rank } = req.params;
      const { program_type = "regular" } = req.query;

      const limits = await RulesModel.getRankLimits(rank, program_type);
      return sendSuccess(res, "Rank load limits retrieved", {
        rank,
        program_type,
        ...limits,
      });
    } catch (error) {
      console.error("Get rank load limits error:", error);
      // Return null values if rules don't exist
      return sendSuccess(res, "Rank load limits retrieved", {
        rank,
        min: null,
        max: null,
      });
    }
  }

  // Get all rank load limits
  static async getAllRankLoadLimits(req, res) {
    try {
      const { program_type = "regular" } = req.query;
      const limits = await RulesModel.getAllRankLoadLimits(program_type);
      return sendSuccess(res, "All rank load limits retrieved", limits);
    } catch (error) {
      console.error("Get all rank load limits error:", error);
      // Return empty object if error
      return sendSuccess(res, "All rank load limits retrieved", {});
    }
  }

  // Get load factors
  static async getLoadFactors(req, res) {
    try {
      const { program_type = "regular" } = req.query;
      const factors = await RulesModel.getLoadFactors(program_type);
      return sendSuccess(res, "Load factors retrieved", factors);
    } catch (error) {
      console.error("Get load factors error:", error);
      // Return default factors
      const defaultFactors = {
        lab: 0.75,
        tutorial: 0.5,
        lecture: 1.0,
        module_distance: 1.0,
      };
      return sendSuccess(res, "Load factors retrieved (default)", defaultFactors);
    }
  }

  // Get payment rates
  static async getPaymentRates(req, res) {
    try {
      const { program_type } = req.params;
      const { rate_category } = req.query;

      const rates = await RulesModel.getPaymentRate(
        program_type,
        rate_category
      );
      return sendSuccess(res, "Payment rates retrieved", rates || {});
    } catch (error) {
      console.error("Get payment rates error:", error);
      return sendSuccess(res, "Payment rates retrieved", {});
    }
  }

  // Get summer distribution
  static async getSummerDistribution(req, res) {
    try {
      const distribution = await RulesModel.getSummerDistribution();
      return sendSuccess(res, "Summer distribution retrieved", distribution);
    } catch (error) {
      console.error("Get summer distribution error:", error);
      // Return default distribution
      const defaultDistribution = {
        stage1: 30.0,
        stage2: 30.0,
        stage3: 20.0,
        stage4: 20.0,
      };
      return sendSuccess(res, "Summer distribution retrieved (default)", defaultDistribution);
    }
  }

  // Bulk update rules
  static async bulkUpdateRules(req, res) {
    try {
      const { rules } = req.body;

      if (!rules || !Array.isArray(rules) || rules.length === 0) {
        return sendError(res, "Rules array is required", 400);
      }

      const results = await RulesModel.bulkUpdate(rules);
      return sendSuccess(res, "Rules updated successfully", results);
    } catch (error) {
      console.error("Bulk update rules error:", error);
      return sendError(res, "Failed to update rules", 500);
    }
  }

  // Validate workload
  static async validateWorkload(req, res) {
    try {
      const workloadData = req.body;

      if (!workloadData.staff_id) {
        return sendError(res, "Staff ID is required", 400);
      }

      const validation = await RulesModel.validateWorkload(workloadData);
      return sendSuccess(res, "Workload validation completed", validation);
    } catch (error) {
      console.error("Validate workload error:", error);
      return sendError(
        res,
        error.message || "Failed to validate workload",
        400
      );
    }
  }

  // Get rules dashboard
  static async getRulesDashboard(req, res) {
    try {
      const dashboard = await RulesModel.getDashboardSummary();
      return sendSuccess(res, "Rules dashboard retrieved", dashboard);
    } catch (error) {
      console.error("Get rules dashboard error:", error);
      return sendError(res, "Failed to get rules dashboard", 500);
    }
  }

  // Clear cache (admin only)
  static async clearCache(req, res) {
    try {
      RulesModel.clearCache();
      return sendSuccess(res, "Rules cache cleared");
    } catch (error) {
      console.error("Clear cache error:", error);
      return sendError(res, "Failed to clear cache", 500);
    }
  }

  // Get active rate tables
  static async getActiveRateTables(req, res) {
    try {
      const { program_type } = req.query;

      const rates = await RulesModel.getActiveRateTables(program_type);
      return sendSuccess(res, "Active rate tables retrieved", rates);
    } catch (error) {
      console.error("Get active rate tables error:", error);
      return sendError(res, "Failed to get rate tables", 500);
    }
  }

  // Get active tax rules
  static async getActiveTaxRules(req, res) {
    try {
      const { program_type } = req.query;

      const taxRules = await RulesModel.getActiveTaxRules(program_type);
      return sendSuccess(res, "Active tax rules retrieved", taxRules);
    } catch (error) {
      console.error("Get active tax rules error:", error);
      return sendError(res, "Failed to get tax rules", 500);
    }
  }
}

export default RulesController;
