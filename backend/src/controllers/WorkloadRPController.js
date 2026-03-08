// export default WorkloadRPController;
import { query } from "../config/database.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Dynamic imports to avoid circular dependencies
let WorkloadRPModel, WorkloadService;

async function getWorkloadRPModel() {
  if (!WorkloadRPModel) {
    WorkloadRPModel = (await import("../models/WorkloadRPModel.js")).default;
  }
  return WorkloadRPModel;
}

async function getWorkloadService() {
  if (!WorkloadService) {
    WorkloadService = (await import("../services/WorkloadService.js")).default;
  }
  return WorkloadService;
}

class WorkloadRPController {
  // Create or update workload
  static async createOrUpdateWorkload(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();

      const staffId =
        req.user.role === "instructor"
          ? await WorkloadRPController.getStaffIdFromUserId(req.user.user_id)
          : req.body.staff_id;

      if (!staffId) {
        return sendError(res, "Staff ID is required", 400);
      }

      // Instructors can only create/update their own workloads
      if (req.user.role === "instructor") {
        const userStaffId = await WorkloadRPController.getStaffIdFromUserId(
          req.user.user_id
        );
        if (parseInt(staffId) !== userStaffId) {
          return sendError(res, "You can only manage your own workload", 403);
        }
      }

      const {
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
        total_load,
        over_payment_birr = 0,
        status = "draft",
      } = req.body;

      // Validate required fields
      if (!semester_id) {
        return sendError(res, "Semester ID is required", 400);
      }

      if (!course_code) {
        return sendError(res, "Course code is required", 400);
      }

      if (number_of_sections <= 0) {
        return sendError(res, "Number of sections must be greater than 0", 400);
      }

      // Validate hours are not negative
      const hours = [
        course_credit_hours,
        lecture_credit_hours,
        tutorial_credit_hours,
        lab_credit_hours,
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
      ];

      if (hours.some((h) => h < 0)) {
        return sendError(res, "Load values cannot be negative", 400);
      }

      // Calculate total load if not provided
      let calculatedTotalLoad = total_load;
      if (!calculatedTotalLoad) {
        const courseLoad = each_section_course_load * number_of_sections;
        calculatedTotalLoad =
          courseLoad +
          variety_of_course_load +
          research_load +
          community_service_load +
          elip_load +
          hdp_load +
          course_chair_load +
          section_advisor_load +
          advising_load +
          position_load;
      }

      // Create or update workload
      const workload = await WorkloadRPModel.createOrUpdate({
        staff_id: parseInt(staffId),
        semester_id: parseInt(semester_id),
        course_code,
        course_credit_hours: parseFloat(course_credit_hours),
        lecture_credit_hours: parseFloat(lecture_credit_hours),
        tutorial_credit_hours: parseFloat(tutorial_credit_hours),
        lab_credit_hours: parseFloat(lab_credit_hours),
        student_department,
        academic_year,
        number_of_sections: parseInt(number_of_sections),
        each_section_course_load: parseFloat(each_section_course_load),
        variety_of_course_load: parseFloat(variety_of_course_load),
        research_load: parseFloat(research_load),
        community_service_load: parseFloat(community_service_load),
        elip_load: parseFloat(elip_load),
        hdp_load: parseFloat(hdp_load),
        course_chair_load: parseFloat(course_chair_load),
        section_advisor_load: parseFloat(section_advisor_load),
        advising_load: parseFloat(advising_load),
        position_load: parseFloat(position_load),
        total_load: parseFloat(calculatedTotalLoad),
        over_payment_birr: parseFloat(over_payment_birr),
        status,
      });

      return sendSuccess(
        res,
        "Workload saved successfully",
        workload,
        workload.workload_id ? 200 : 201
      );
    } catch (error) {
      console.error("Create/update workload error:", error);
      return sendError(res, error.message || "Failed to save workload", 500);
    }
  }

  // Get workload by ID
  static async getWorkloadById(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const { id } = req.params;
      const workload = await WorkloadRPModel.findById(parseInt(id));

      if (!workload) {
        return sendError(res, "Workload not found", 404);
      }

      // Check permissions
      if (!WorkloadRPController.canViewWorkload(req.user, workload)) {
        return sendError(res, "Access denied", 403);
      }

      // Format response with column groups
      const formattedWorkload =
        WorkloadRPController.formatWorkloadResponse(workload);

      return sendSuccess(
        res,
        "Workload retrieved successfully",
        formattedWorkload
      );
    } catch (error) {
      console.error("Get workload error:", error);
      return sendError(res, "Failed to retrieve workload", 500);
    }
  }

  // Get all workloads with filters (CORRECTED SINGLE METHOD)
  static async getAllWorkloads(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();

      const {
        page = 1,
        limit = 20,
        staff_id,
        semester_id,
        department_id,
        college_id,
        status,
        course_code,
        academic_rank,
      } = req.query;

      // Check permissions based on role
      let filters = {};

      if (req.user.role === "instructor") {
        // Instructors can only see their own workloads
        const staffId = await WorkloadRPController.getStaffIdFromUserId(
          req.user.user_id
        );
        if (staffId) {
          filters.staff_id = staffId;
        } else {
          return sendError(res, "Staff profile not found", 404);
        }
      } else if (req.user.role === "department_head") {
        // Department heads can see workloads in their department
        const departmentId = await WorkloadRPController.getUserDepartmentId(
          req.user.user_id
        );
        if (departmentId) {
          filters.department_id = departmentId;
        }
      } else if (req.user.role === "dean") {
        // Deans can see workloads in their college
        const collegeId = await WorkloadRPController.getUserCollegeId(
          req.user.user_id
        );
        if (collegeId) {
          filters.college_id = collegeId;
        }
      }

      // Apply query filters
      if (staff_id) filters.staff_id = parseInt(staff_id);
      if (semester_id) filters.semester_id = parseInt(semester_id);
      if (department_id) filters.department_id = parseInt(department_id);
      if (college_id) filters.college_id = parseInt(college_id);
      if (status) filters.status = status;
      if (course_code) filters.course_code = course_code;
      if (academic_rank) filters.academic_rank = academic_rank;

      const result = await WorkloadRPModel.findAll(
        parseInt(page),
        parseInt(limit),
        filters
      );

      // Format workloads
      if (result.workloads && Array.isArray(result.workloads)) {
        result.workloads = result.workloads.map((workload) =>
          WorkloadRPController.formatWorkloadResponse(workload)
        );
      }

      return sendSuccess(res, "Workloads retrieved successfully", result);
    } catch (error) {
      console.error("Get all workloads error:", error);
      return sendError(res, "Failed to retrieve workloads", 500);
    }
  }

  // Get my workload (for instructors)
  static async getMyWorkload(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const staffId = await WorkloadRPController.getStaffIdFromUserId(
        req.user.user_id
      );
      if (!staffId) {
        return sendError(res, "Staff profile not found", 404);
      }

      const { semester_id } = req.query;

      let workload;
      if (semester_id) {
        workload = await WorkloadRPModel.findByStaffAndSemester(
          staffId,
          parseInt(semester_id)
        );
      } else {
        // Get latest workload
        const result = await WorkloadRPModel.findAll(1, 1, {
          staff_id: staffId,
        });
        workload = result.workloads[0] || null;
      }

      if (!workload) {
        return sendError(res, "No workload found", 404);
      }

      const fullWorkload = await WorkloadRPModel.findById(workload.workload_id);
      const formattedWorkload =
        WorkloadRPController.formatWorkloadResponse(fullWorkload);

      return sendSuccess(res, "Workload retrieved", formattedWorkload);
    } catch (error) {
      console.error("Get my workload error:", error);
      return sendError(res, "Failed to retrieve workload", 500);
    }
  }

  // Get workload dashboard
  static async getWorkloadDashboard(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const staffId = await WorkloadRPController.getStaffIdFromUserId(
        req.user.user_id
      );
      const { semester_id } = req.query;

      if (!semester_id) {
        return sendError(res, "Semester ID is required", 400);
      }

      const workload = await WorkloadRPModel.findByStaffAndSemester(
        staffId,
        parseInt(semester_id)
      );

      if (!workload) {
        return sendSuccess(res, "No workload for this semester", {
          semester_id,
          has_workload: false,
          dashboard_data: null,
        });
      }

      const fullWorkload = await WorkloadRPModel.findById(workload.workload_id);

      // Calculate dashboard metrics
      const dashboardData = {
        total_load: fullWorkload.total_load,
        course_load:
          fullWorkload.each_section_course_load *
          fullWorkload.number_of_sections,
        research_community_load:
          fullWorkload.research_load + fullWorkload.community_service_load,
        admin_load:
          fullWorkload.elip_load +
          fullWorkload.hdp_load +
          fullWorkload.course_chair_load +
          fullWorkload.section_advisor_load +
          fullWorkload.advising_load +
          fullWorkload.position_load,
        over_payment: fullWorkload.over_payment_birr,
        status: fullWorkload.status,
        approval_progress: await WorkloadRPController.calculateApprovalProgress(
          fullWorkload.workload_id
        ),
      };

      return sendSuccess(res, "Dashboard data retrieved", {
        workload: WorkloadRPController.formatWorkloadResponse(fullWorkload),
        dashboard_data: dashboardData,
      });
    } catch (error) {
      console.error("Get dashboard error:", error);
      return sendError(res, "Failed to retrieve dashboard data", 500);
    }
  }

  // Calculate workload from sections (auto-calculate)
  static async calculateFromSections(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const staffId =
        req.user.role === "instructor"
          ? await WorkloadRPController.getStaffIdFromUserId(req.user.user_id)
          : req.body.staff_id;

      if (!staffId) {
        return sendError(res, "Staff ID is required", 400);
      }

      const { semester_id } = req.body;

      if (!semester_id) {
        return sendError(res, "Semester ID is required", 400);
      }

      // Check permissions
      if (req.user.role === "instructor") {
        const userStaffId = await WorkloadRPController.getStaffIdFromUserId(
          req.user.user_id
        );
        if (parseInt(staffId) !== userStaffId) {
          return sendError(
            res,
            "You can only calculate your own workload",
            403
          );
        }
      }

      const calculated = await WorkloadRPModel.calculateFromSections(
        parseInt(staffId),
        parseInt(semester_id)
      );

      return sendSuccess(res, "Workload calculated from sections", calculated);
    } catch (error) {
      console.error("Calculate from sections error:", error);
      return sendError(
        res,
        error.message || "Failed to calculate workload",
        500
      );
    }
  }

  // Get workload statistics
  static async getWorkloadStatistics(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      let { semester_id, department_id } = req.query;

      // Check permissions for department heads and deans
      if (req.user.role === "department_head") {
        const userDeptId = await WorkloadRPController.getUserDepartmentId(
          req.user.user_id
        );
        if (userDeptId) {
          department_id = userDeptId;
        }
      }

      const stats = await WorkloadRPModel.getStatistics(
        semester_id ? parseInt(semester_id) : null,
        department_id ? parseInt(department_id) : null
      );

      return sendSuccess(res, "Workload statistics retrieved", stats);
    } catch (error) {
      console.error("Get statistics error:", error);
      return sendError(res, "Failed to retrieve statistics", 500);
    }
  }

  // Get department workload summary
  static async getDepartmentWorkloadSummary(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const { departmentId } = req.params;
      const { semester_id } = req.query;

      if (!semester_id) {
        return sendError(res, "Semester ID is required", 400);
      }

      // Check permissions
      if (req.user.role === "department_head") {
        const userDeptId = await WorkloadRPController.getUserDepartmentId(
          req.user.user_id
        );
        if (parseInt(departmentId) !== userDeptId) {
          return sendError(res, "You can only view your own department", 403);
        }
      }

      const summary = await WorkloadRPModel.getDepartmentSummary(
        parseInt(departmentId),
        parseInt(semester_id)
      );

      return sendSuccess(res, "Department workload summary", {
        department_id: departmentId,
        semester_id,
        summary,
      });
    } catch (error) {
      console.error("Get department summary error:", error);
      return sendError(res, "Failed to retrieve department summary", 500);
    }
  }

  // Submit workload for approval
  static async submitForApproval(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const WorkloadService = await getWorkloadService();
      const { id } = req.params;

      // Check if workload exists
      const workload = await WorkloadRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "Workload not found", 404);
      }

      // Check permissions
      if (!WorkloadRPController.canSubmitWorkload(req.user, workload)) {
        return sendError(res, "You cannot submit this workload", 403);
      }

      // Validate before submission
      const validation = await WorkloadService.validateWorkloadCompliance(
        workload
      );
      if (validation.status !== "compliant") {
        return sendError(
          res,
          "Workload needs correction before submission",
          400,
          {
            validation,
          }
        );
      }

      // Submit for approval
      const submittedWorkload = await WorkloadRPModel.submitForApproval(
        parseInt(id),
        req.user.user_id
      );

      return sendSuccess(
        res,
        "Workload submitted for approval",
        submittedWorkload
      );
    } catch (error) {
      console.error("Submit workload error:", error);
      return sendError(res, error.message || "Failed to submit workload", 400);
    }
  }

  // Get approval workflow
  static async getApprovalWorkflow(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const { id } = req.params;

      const workload = await WorkloadRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "Workload not found", 404);
      }

      if (!WorkloadRPController.canViewWorkload(req.user, workload)) {
        return sendError(res, "Access denied", 403);
      }

      const workflow = await WorkloadRPModel.getApprovalWorkflow(parseInt(id));
      return sendSuccess(res, "Approval workflow retrieved", workflow);
    } catch (error) {
      console.error("Get approval workflow error:", error);
      return sendError(res, "Failed to retrieve approval workflow", 500);
    }
  }

  // Approve step
  static async approveStep(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const { approvalId } = req.params;
      const { comments = "" } = req.body;

      const [approval] = await query(
        "SELECT * FROM approval_workflow WHERE approval_id = ?",
        [approvalId]
      );

      if (!approval) {
        return sendError(res, "Approval not found", 404);
      }

      if (!WorkloadRPController.canApproveStep(req.user, approval)) {
        return sendError(res, "You cannot approve this step", 403);
      }

      const approved = await WorkloadRPModel.approveStep(
        parseInt(approvalId),
        req.user.user_id,
        comments
      );

      return sendSuccess(res, "Approval completed", approved);
    } catch (error) {
      console.error("Approve step error:", error);
      return sendError(res, error.message || "Failed to approve step", 400);
    }
  }

  // Reject workload
  static async rejectWorkload(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const { id } = req.params;
      const { comments } = req.body;

      if (!comments) {
        return sendError(res, "Rejection comments required", 400);
      }

      const workload = await WorkloadRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "Workload not found", 404);
      }

      if (!WorkloadRPController.canRejectWorkload(req.user, workload)) {
        return sendError(res, "You cannot reject this workload", 403);
      }

      const rejectedWorkload = await WorkloadRPModel.rejectWorkload(
        parseInt(id),
        req.user.user_id,
        comments
      );

      return sendSuccess(res, "Workload rejected", rejectedWorkload);
    } catch (error) {
      console.error("Reject workload error:", error);
      return sendError(res, error.message || "Failed to reject workload", 400);
    }
  }

  // Return workload for correction
  static async returnForCorrection(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const { id } = req.params;
      const { comments } = req.body;

      if (!comments) {
        return sendError(res, "Return comments required", 400);
      }

      const workload = await WorkloadRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "Workload not found", 404);
      }

      if (!WorkloadRPController.canReturnWorkload(req.user, workload)) {
        return sendError(res, "You cannot return this workload", 403);
      }

      const returnedWorkload = await WorkloadRPModel.returnForCorrection(
        parseInt(id),
        req.user.user_id,
        comments
      );

      return sendSuccess(
        res,
        "Workload returned for correction",
        returnedWorkload
      );
    } catch (error) {
      console.error("Return workload error:", error);
      return sendError(res, error.message || "Failed to return workload", 400);
    }
  }

  // Get pending approvals
  static async getMyPendingApprovals(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const pending = await WorkloadRPModel.getPendingApprovals(
        req.user.role,
        req.user.user_id
      );

      return sendSuccess(res, "Pending approvals retrieved", pending);
    } catch (error) {
      console.error("Get pending approvals error:", error);
      return sendError(res, "Failed to retrieve pending approvals", 500);
    }
  }

  // Delete workload
  static async deleteWorkload(req, res) {
    try {
      const WorkloadRPModel = await getWorkloadRPModel();
      const { id } = req.params;

      // Check if workload exists
      const workload = await WorkloadRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "Workload not found", 404);
      }

      // Check permissions
      if (!WorkloadRPController.canModifyWorkload(req.user, workload)) {
        return sendError(res, "You cannot delete this workload", 403);
      }

      // Only allow deletion of draft workloads
      if (workload.status !== "draft") {
        return sendError(res, "Only draft workloads can be deleted", 400);
      }

      await WorkloadRPModel.delete(parseInt(id));
      return sendSuccess(res, "Workload deleted successfully");
    } catch (error) {
      console.error("Delete workload error:", error);
      return sendError(res, "Failed to delete workload", 500);
    }
  }

  // ===== HELPER METHODS =====

  // Format workload response according to column groups
  static formatWorkloadResponse(workload) {
    const total_course_load =
      (workload.each_section_course_load || 0) *
      (workload.number_of_sections || 1);
    const total_credit_hours =
      (workload.lecture_credit_hours || 0) +
      (workload.tutorial_credit_hours || 0) +
      (workload.lab_credit_hours || 0);
    const total_admin_load =
      (workload.elip_load || 0) +
      (workload.hdp_load || 0) +
      (workload.course_chair_load || 0) +
      (workload.section_advisor_load || 0) +
      (workload.advising_load || 0) +
      (workload.position_load || 0);

    return {
      workload_id: workload.workload_id,
      staff_info: {
        staff_id: workload.staff_id,
        first_name: workload.first_name,
        last_name: workload.last_name,
        employee_id: workload.employee_id,
        academic_rank: workload.academic_rank,
        staff_department: workload.staff_department,
        college_name: workload.college_name,
      },

      // Course Details
      course_details: {
        course_code: workload.course_code,
        course_credit_hours: workload.course_credit_hours,
        lecture_credit_hours: workload.lecture_credit_hours,
        tutorial_credit_hours: workload.tutorial_credit_hours,
        lab_credit_hours: workload.lab_credit_hours,
        total_credit_hours: total_credit_hours,
      },

      // Student Details
      student_details: {
        student_department: workload.student_department,
        academic_year: workload.academic_year,
        number_of_sections: workload.number_of_sections,
      },

      // Load Calculation
      load_calculation: {
        each_section_course_load: workload.each_section_course_load,
        total_course_load: total_course_load,
        variety_of_course_load: workload.variety_of_course_load,
        research_load: workload.research_load,
        community_service_load: workload.community_service_load,
      },

      // Administrative & Other Loads
      administrative_loads: {
        elip_load: workload.elip_load,
        hdp_load: workload.hdp_load,
        course_chair_load: workload.course_chair_load,
        section_advisor_load: workload.section_advisor_load,
        advising_load: workload.advising_load,
        position_load: workload.position_load,
        total_admin_load: total_admin_load,
      },

      // Summary
      summary: {
        total_load: workload.total_load,
        over_payment_birr: workload.over_payment_birr,
        calculated_total:
          total_course_load +
          (workload.variety_of_course_load || 0) +
          (workload.research_load || 0) +
          (workload.community_service_load || 0) +
          total_admin_load,
      },

      // Semester Info
      semester_info: {
        semester_id: workload.semester_id,
        semester_code: workload.semester_code,
        semester_name: workload.semester_name,
        academic_year: workload.year_name,
      },

      // Status
      status: workload.status,
      validation: workload.validation,
      created_at: workload.created_at,
      updated_at: workload.updated_at,
    };
  }

  // Calculate approval progress
  static async calculateApprovalProgress(workloadId) {
    const approvals = await query(
      "SELECT approver_role, status FROM approval_workflow WHERE entity_type = 'workload_rp' AND entity_id = ?",
      [workloadId]
    );

    const workflowSteps = [
      "department_head",
      "dean",
      "hr_director",
      "vpaa",
      "vpaf",
      "finance",
    ];

    const totalSteps = workflowSteps.length;
    let completedSteps = 0;

    for (const step of workflowSteps) {
      const stepApproval = approvals.find((a) => a.approver_role === step);
      if (stepApproval && stepApproval.status === "approved") {
        completedSteps++;
      }
    }

    return {
      completed_steps: completedSteps,
      total_steps: totalSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100),
      approvals,
    };
  }

  // Helper methods for permissions
  static async getStaffIdFromUserId(userId) {
    try {
      const [staff] = await query(
        "SELECT staff_id FROM staff_profiles WHERE user_id = ?",
        [userId]
      );
      return staff ? staff.staff_id : null;
    } catch (error) {
      console.error("Error getting staff ID:", error);
      return null;
    }
  }

  static async getUserDepartmentId(userId) {
    try {
      const [staff] = await query(
        "SELECT department_id FROM staff_profiles WHERE user_id = ?",
        [userId]
      );
      return staff ? staff.department_id : null;
    } catch (error) {
      console.error("Error getting department ID:", error);
      return null;
    }
  }

  static async getUserCollegeId(userId) {
    try {
      const [college] = await query(
        `SELECT c.college_id 
         FROM staff_profiles sp
         JOIN departments d ON sp.department_id = d.department_id
         JOIN colleges c ON d.college_id = c.college_id
         WHERE sp.user_id = ?`,
        [userId]
      );
      return college ? college.college_id : null;
    } catch (error) {
      console.error("Error getting college ID:", error);
      return null;
    }
  }

  static canViewWorkload(user, workload) {
    if (user.role === "admin") return true;

    // Get user's staff_id if available
    if (["instructor", "department_head", "dean"].includes(user.role)) {
      // Simplified - in real implementation, check ownership
      return true;
    }

    return ["hr_director", "vpaa", "vpaf", "finance", "registrar"].includes(
      user.role
    );
  }

  static canModifyWorkload(user, workload) {
    if (workload.status !== "draft") return false;
    if (user.role === "admin" || user.role === "hr_director") return true;
    if (["instructor", "department_head", "dean"].includes(user.role)) {
      return true;
    }
    return false;
  }

  static canSubmitWorkload(user, workload) {
    if (workload.status !== "draft") return false;
    if (["instructor", "department_head", "dean"].includes(user.role)) {
      return true;
    }
    return false;
  }

  static canApproveStep(user, approval) {
    return user.role === approval.approver_role;
  }

  static canRejectWorkload(user, workload) {
    return [
      "department_head",
      "dean",
      "hr_director",
      "vpaa",
      "vpaf",
      "finance",
    ].includes(user.role);
  }

  static canReturnWorkload(user, workload) {
    return WorkloadRPController.canRejectWorkload(user, workload);
  }
}

export default WorkloadRPController;
