import CourseRequestModel from "../models/CourseRequestModel.js";
import StaffModel from "../models/StaffModel.js";
import CourseModel from "../models/CourseModel.js";
import SemesterModel from "../models/SemesterModel.js";
import CourseAssignmentModel from "../models/CourseAssignmentModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { query } from "../config/database.js";

class CourseRequestController {
  // Create course request (Instructor only)
  static async createRequest(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Only instructors can create requests
      if (user_role !== "instructor") {
        return sendError(res, "Only instructors can request courses", 403);
      }

      const {
        course_id,
        semester_id,
        section_code = null,
        preferred_schedule = null,
        reason = null,
      } = req.body;

      // Validate required fields
      if (!course_id || !semester_id) {
        return sendError(res, "Course ID and semester ID are required", 400);
      }

      // Check if course exists
      const course = await CourseModel.findById(parseInt(course_id));
      if (!course) {
        return sendError(res, "Course not found", 404);
      }

      // Check if semester exists
      const semester = await SemesterModel.findById(parseInt(semester_id));
      if (!semester) {
        return sendError(res, "Semester not found", 404);
      }

      // Get staff profile
      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      // Check if course is already assigned or requested
      const isAssigned = await CourseAssignmentModel.isCourseAssigned(
        parseInt(course_id),
        parseInt(semester_id),
        staff.staff_id
      );
      if (isAssigned) {
        return sendError(
          res,
          "This course is already assigned to you for this semester",
          400
        );
      }

      // Check for duplicate pending request
      const [existingRequest] = await query(
        `SELECT request_id FROM course_requests 
         WHERE course_id = ? AND semester_id = ? AND staff_id = ? AND status = 'pending'`,
        [parseInt(course_id), parseInt(semester_id), staff.staff_id]
      );
      if (existingRequest) {
        return sendError(
          res,
          "You already have a pending request for this course",
          400
        );
      }

      // Check workload before requesting
      const currentLoad =
        await CourseRequestController.calculateCurrentWorkload(
          staff.staff_id,
          parseInt(semester_id)
        );

      const courseLoad = course.credit_hours * 1.5;
      const rankLimits = await CourseRequestController.getRankLimits(
        staff.academic_rank
      );

      if (currentLoad.total_hours + courseLoad > rankLimits.max) {
        return sendError(
          res,
          `Requesting this course would cause overload. Current: ${currentLoad.total_hours.toFixed(
            2
          )} hours, ` +
            `Course adds: ${courseLoad.toFixed(2)} hours, ` +
            `Maximum allowed: ${rankLimits.max} hours`,
          400
        );
      }

      // Create request
      const request = await CourseRequestModel.create({
        course_id: parseInt(course_id),
        semester_id: parseInt(semester_id),
        staff_id: staff.staff_id,
        requested_by: user_id,
        section_code,
        preferred_schedule,
        reason,
        status: "pending",
      });

      // Notify department head
      await CourseRequestController.createNotification(
        staff.department_id,
        "New Course Request",
        `${staff.first_name} ${staff.last_name} requested to teach ${course.course_code}`,
        "course_request",
        request.request_id
      );

      return sendSuccess(
        res,
        "Course request submitted successfully",
        request,
        201
      );
    } catch (error) {
      console.error("Create request error:", error);
      return sendError(res, "Failed to submit course request", 500);
    }
  }

  // Get my requests (for instructors)
  static async getMyRequests(req, res) {
    try {
      const user_id = req.user.user_id;
      const { semester_id, status, page = 1, limit = 20 } = req.query;

      // Get staff profile
      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      const result = await CourseRequestModel.findByStaff(
        staff.staff_id,
        semester_id ? parseInt(semester_id) : null,
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(res, "Requests retrieved successfully", result);
    } catch (error) {
      console.error("Get my requests error:", error);
      return sendError(res, "Failed to retrieve requests", 500);
    }
  }

  // Get department requests (for department head)
  static async getDepartmentRequests(req, res) {
    try {
      const user_id = req.user.user_id;
      const { status, semester_id, page = 1, limit = 20 } = req.query;

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      const result = await CourseRequestModel.findByDepartment(
        headStaff.department_id,
        status,
        semester_id ? parseInt(semester_id) : null,
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(
        res,
        "Department requests retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Get department requests error:", error);
      return sendError(res, "Failed to retrieve department requests", 500);
    }
  }

  // Get pending requests (for department head)
  static async getPendingRequests(req, res) {
    try {
      const user_id = req.user.user_id;

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      const requests = await CourseRequestModel.getPendingRequests(
        headStaff.department_id
      );

      return sendSuccess(
        res,
        "Pending requests retrieved successfully",
        requests
      );
    } catch (error) {
      console.error("Get pending requests error:", error);
      return sendError(res, "Failed to retrieve pending requests", 500);
    }
  }

  // Approve request (by department head)
  static async approveRequest(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Only department heads can approve requests
      if (user_role !== "department_head") {
        return sendError(
          res,
          "Only department heads can approve course requests",
          403
        );
      }

      // Get request
      const request = await CourseRequestModel.findById(parseInt(id));
      if (!request) {
        return sendError(res, "Request not found", 404);
      }

      // Check if request is pending
      if (request.status !== "pending") {
        return sendError(res, "Only pending requests can be approved", 400);
      }

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      // Check if request belongs to department head's department
      const requestStaff = await StaffModel.findById(request.staff_id);
      if (requestStaff.department_id !== headStaff.department_id) {
        return sendError(
          res,
          "You can only approve requests from your department",
          403
        );
      }

      // Check if course is already assigned to someone else
      const [existingAssignment] = await query(
        `SELECT assignment_id FROM course_assignments 
         WHERE course_id = ? AND semester_id = ? AND status = 'accepted'`,
        [request.course_id, request.semester_id]
      );
      if (existingAssignment) {
        return sendError(
          res,
          "This course is already assigned to another instructor",
          400
        );
      }

      // Check staff's current workload
      const currentLoad =
        await CourseRequestController.calculateCurrentWorkload(
          request.staff_id,
          request.semester_id
        );

      const course = await CourseModel.findById(request.course_id);
      const courseLoad = course ? course.credit_hours * 1.5 : 4.5;
      const rankLimits = await CourseRequestController.getRankLimits(
        requestStaff.academic_rank
      );

      if (currentLoad.total_hours + courseLoad > rankLimits.max) {
        return sendError(
          res,
          `Approving this request would cause overload for ${requestStaff.first_name} ${requestStaff.last_name}. ` +
            `Current: ${currentLoad.total_hours.toFixed(
              2
            )} hours, Course adds: ${courseLoad.toFixed(2)} hours, ` +
            `Maximum allowed: ${rankLimits.max} hours`,
          400
        );
      }

      // Approve request
      const updatedRequest = await CourseRequestModel.approveRequest(
        parseInt(id),
        user_id,
        notes
      );

      // Notify instructor
      await CourseRequestController.createNotification(
        requestStaff.user_id,
        "Course Request Approved",
        `Your request to teach ${request.course_code} has been approved`,
        "request_approved",
        request.request_id
      );

      return sendSuccess(res, "Request approved successfully", updatedRequest);
    } catch (error) {
      console.error("Approve request error:", error);
      return sendError(res, "Failed to approve request", 500);
    }
  }

  // Reject request (by department head)
  static async rejectRequest(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Only department heads can reject requests
      if (user_role !== "department_head") {
        return sendError(
          res,
          "Only department heads can reject course requests",
          403
        );
      }

      // Get request
      const request = await CourseRequestModel.findById(parseInt(id));
      if (!request) {
        return sendError(res, "Request not found", 404);
      }

      // Check if request is pending
      if (request.status !== "pending") {
        return sendError(res, "Only pending requests can be rejected", 400);
      }

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      // Check if request belongs to department head's department
      const requestStaff = await StaffModel.findById(request.staff_id);
      if (requestStaff.department_id !== headStaff.department_id) {
        return sendError(
          res,
          "You can only reject requests from your department",
          403
        );
      }

      // Reject request
      const updatedRequest = await CourseRequestModel.rejectRequest(
        parseInt(id),
        user_id,
        notes
      );

      // Notify instructor
      await CourseRequestController.createNotification(
        requestStaff.user_id,
        "Course Request Rejected",
        `Your request to teach ${
          request.course_code
        } has been rejected. Reason: ${notes || "Not specified"}`,
        "request_rejected",
        request.request_id
      );

      return sendSuccess(res, "Request rejected successfully", updatedRequest);
    } catch (error) {
      console.error("Reject request error:", error);
      return sendError(res, "Failed to reject request", 500);
    }
  }

  // Cancel request (by instructor)
  static async cancelRequest(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;

      // Get request
      const request = await CourseRequestModel.findById(parseInt(id));
      if (!request) {
        return sendError(res, "Request not found", 404);
      }

      // Check if user owns the request
      if (request.requested_by !== user_id) {
        return sendError(res, "You can only cancel your own requests", 403);
      }

      // Check if request can be cancelled
      if (request.status !== "pending") {
        return sendError(res, "Only pending requests can be cancelled", 400);
      }

      // Cancel request
      const updatedRequest = await CourseRequestModel.cancelRequest(
        parseInt(id)
      );

      return sendSuccess(res, "Request cancelled successfully", updatedRequest);
    } catch (error) {
      console.error("Cancel request error:", error);
      return sendError(res, "Failed to cancel request", 500);
    }
  }

  // Get request by ID
  static async getRequestById(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      const request = await CourseRequestModel.findById(parseInt(id));
      if (!request) {
        return sendError(res, "Request not found", 404);
      }

      // Check permissions
      let canView = false;

      if (user_role === "admin") {
        canView = true;
      } else if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        const requestStaff = await StaffModel.findById(request.staff_id);
        canView = headStaff?.department_id === requestStaff?.department_id;
      } else if (user_role === "instructor") {
        canView = request.requested_by === user_id;
      }

      if (!canView) {
        return sendError(
          res,
          "You are not authorized to view this request",
          403
        );
      }

      return sendSuccess(res, "Request retrieved successfully", request);
    } catch (error) {
      console.error("Get request by ID error:", error);
      return sendError(res, "Failed to retrieve request", 500);
    }
  }

  // Get request statistics
  static async getRequestStats(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;
      const { semester_id } = req.query;

      let stats;
      if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        if (headStaff) {
          stats = await CourseRequestModel.getStatistics(
            headStaff.department_id,
            semester_id
          );
        }
      } else {
        stats = await CourseRequestModel.getStatistics(null, semester_id);
      }

      return sendSuccess(res, "Request statistics retrieved", stats);
    } catch (error) {
      console.error("Get request stats error:", error);
      return sendError(res, "Failed to get request statistics", 500);
    }
  }

  // Get available courses for request
  static async getAvailableCourses(req, res) {
    try {
      const user_id = req.user.user_id;
      const { semester_id, department_id } = req.query;

      // Get current semester if not specified
      let targetSemesterId = semester_id;
      if (!targetSemesterId) {
        const [currentSemester] = await query(
          "SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1"
        );
        targetSemesterId = currentSemester?.semester_id;
      }

      if (!targetSemesterId) {
        return sendError(res, "No active semester found", 404);
      }

      // Get staff department
      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      const targetDeptId = department_id || staff.department_id;

      // Get all courses in department
      const courses = await query(
        `SELECT c.*, d.department_name
         FROM courses c
         LEFT JOIN departments d ON c.department_id = d.department_id
         WHERE c.department_id = ? AND c.status = 'active'
         ORDER BY c.course_code`,
        [targetDeptId]
      );

      // Get already assigned courses in this semester
      const assignedCourses = await query(
        `SELECT ca.course_id 
         FROM course_assignments ca
         WHERE ca.semester_id = ? AND ca.status IN ('assigned', 'accepted')`,
        [targetSemesterId]
      );

      const assignedCourseIds = assignedCourses.map((ac) => ac.course_id);

      // Filter out already assigned courses
      const availableCourses = courses.filter(
        (course) => !assignedCourseIds.includes(course.course_id)
      );

      // Add request status for each course (if user has pending request)
      const enrichedCourses = [];
      for (const course of availableCourses) {
        const [existingRequest] = await query(
          `SELECT status FROM course_requests 
           WHERE course_id = ? AND semester_id = ? AND staff_id = ?`,
          [course.course_id, targetSemesterId, staff.staff_id]
        );

        enrichedCourses.push({
          ...course,
          request_status: existingRequest?.status || null,
          can_request:
            !existingRequest ||
            existingRequest.status === "cancelled" ||
            existingRequest.status === "rejected",
        });
      }

      return sendSuccess(res, "Available courses retrieved", {
        semester_id: targetSemesterId,
        department_id: targetDeptId,
        total_courses: courses.length,
        assigned_courses: assignedCourseIds.length,
        available_courses: availableCourses.length,
        courses: enrichedCourses,
      });
    } catch (error) {
      console.error("Get available courses error:", error);
      return sendError(res, "Failed to get available courses", 500);
    }
  }

  // ==================== HELPER METHODS ====================

  // Calculate current workload for staff
  static async calculateCurrentWorkload(staffId, semesterId) {
    try {
      // Get accepted assignments
      const acceptedAssignments = await query(
        `SELECT ca.*, c.credit_hours
         FROM course_assignments ca
         LEFT JOIN courses c ON ca.course_id = c.course_id
         WHERE ca.staff_id = ? AND ca.semester_id = ? AND ca.status = 'accepted'`,
        [staffId, semesterId]
      );

      // Calculate total hours
      let totalHours = 0;
      for (const assignment of acceptedAssignments) {
        const courseLoad = assignment.credit_hours * 1.5;
        totalHours += courseLoad;
      }

      // Add existing workload RP hours
      const [workloadRP] = await query(
        `SELECT COALESCE(SUM(total_load), 0) as rp_hours
         FROM workload_rp 
         WHERE staff_id = ? AND semester_id = ? AND status != 'rejected'`,
        [staffId, semesterId]
      );

      totalHours += parseFloat(workloadRP.rp_hours || 0);

      return {
        total_hours: totalHours,
        assignment_count: acceptedAssignments.length,
        rp_hours: parseFloat(workloadRP.rp_hours || 0),
      };
    } catch (error) {
      console.error("Calculate current workload error:", error);
      return { total_hours: 0, assignment_count: 0, rp_hours: 0 };
    }
  }

  // Get rank limits
  static async getRankLimits(academicRank) {
    try {
      const [minRule] = await query(
        `SELECT rule_value FROM system_rules 
         WHERE rule_name = CONCAT('rank_min_', ?) 
           AND (effective_to IS NULL OR effective_to >= CURDATE())`,
        [academicRank]
      );

      const [maxRule] = await query(
        `SELECT rule_value FROM system_rules 
         WHERE rule_name = CONCAT('rank_max_', ?) 
           AND (effective_to IS NULL OR effective_to >= CURDATE())`,
        [academicRank]
      );

      return {
        min: minRule ? parseFloat(minRule.rule_value) : 0,
        max: maxRule ? parseFloat(maxRule.rule_value) : 0,
      };
    } catch (error) {
      console.error("Get rank limits error:", error);
      // Default limits
      const defaultLimits = {
        graduate_assistant: { min: 12, max: 16 },
        assistant_lecturer: { min: 10, max: 14 },
        lecturer: { min: 8, max: 12 },
        assistant_professor: { min: 6, max: 10 },
        associate_professor: { min: 4, max: 8 },
        professor: { min: 4, max: 6 },
      };
      return defaultLimits[academicRank] || { min: 8, max: 12 };
    }
  }

  // Create notification (placeholder)
  static async createNotification(
    departmentId,
    title,
    message,
    type,
    referenceId = null
  ) {
    try {
      // Get department head user ID
      const [departmentHead] = await query(
        `SELECT u.user_id FROM departments d
         LEFT JOIN users u ON d.head_user_id = u.user_id
         WHERE d.department_id = ?`,
        [departmentId]
      );

      if (departmentHead?.user_id) {
        console.log(
          `Notification for department head ${departmentHead.user_id}: ${title} - ${message} (${type})`
        );
      }

      return true;
    } catch (error) {
      console.error("Create notification error:", error);
      return false;
    }
  }
}

export default CourseRequestController;
