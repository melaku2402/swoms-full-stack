


// controllers/CourseAssignmentController.js - FIXED VERSION
import CourseAssignmentModel from "../models/CourseAssignmentModel.js";
import StaffModel from "../models/StaffModel.js";
import CourseModel from "../models/CourseModel.js";
import SemesterModel from "../models/SemesterModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { query } from "../config/database.js";
import DepartmentModel from "../models/DepartmentModel.js";
import ProgramModel from "../models/ProgramModel.js";
import CurriculumPlanModel from "../models/CurriculumPlanModel.js";

class CourseAssignmentController {
  static async createAssignment(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head") {
        return sendError(res, "Only department heads can assign courses", 403);
      }

      const {
        course_id,
        semester_id,
        staff_id,
        program_type = "regular",
        student_year = null,
        section_code = null,
        notes = null,
        confirm_overload = false,
      } = req.body;

      // Validate required fields
      if (!course_id || !semester_id || !staff_id) {
        return sendError(
          res,
          "Course ID, semester ID, and staff ID are required",
          400
        );
      }

      // Validate student year if provided
      if (student_year && (student_year < 1 || student_year > 7)) {
        return sendError(res, "Student year must be between 1 and 7", 400);
      }

      // Validate program type
      const validProgramTypes = [
        "regular",
        "extension",
        "weekend",
        "summer",
        "distance",
      ];
      if (program_type && !validProgramTypes.includes(program_type)) {
        return sendError(res, "Invalid program type", 400);
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

      // Check if staff exists and belongs to department head's department
      const staff = await StaffModel.findById(parseInt(staff_id));
      if (!staff) {
        return sendError(res, "Staff member not found", 404);
      }

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      if (staff.department_id !== headStaff.department_id) {
        return sendError(
          res,
          "You can only assign courses to staff in your department",
          403
        );
      }

      // FIRST: Check if course is already assigned to this staff in this semester
      const isAssigned = await CourseAssignmentModel.isCourseAssigned(
        parseInt(course_id),
        parseInt(semester_id),
        parseInt(staff_id)
      );

      if (isAssigned) {
        // Return a user-friendly error with more details
        const [existingAssignment] = await query(
          `SELECT ca.*, c.course_code, c.course_title, 
                s.semester_name, sp.first_name, sp.last_name
         FROM course_assignments ca
         LEFT JOIN courses c ON ca.course_id = c.course_id
         LEFT JOIN semesters s ON ca.semester_id = s.semester_id
         LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
         WHERE ca.course_id = ? AND ca.semester_id = ? AND ca.staff_id = ?
         LIMIT 1`,
          [parseInt(course_id), parseInt(semester_id), parseInt(staff_id)]
        );

        return sendError(
          res,
          {
            title: "Assignment Already Exists",
            message:
              "This course is already assigned to this staff member for the selected semester",
            details: {
              existing_assignment: existingAssignment || null,
              course: {
                code: course.course_code,
                title: course.course_title,
              },
              staff: {
                name: `${staff.first_name} ${staff.last_name}`,
                employee_id: staff.employee_id,
              },
              semester: {
                name: semester.semester_name,
                code: semester.semester_code,
              },
            },
            suggested_action:
              "Please select a different course, staff member, or semester.",
          },
          409 // Use 409 Conflict instead of 400 Bad Request
        );
      }

      // Calculate current workload
      const currentLoad =
        await CourseAssignmentController.calculateCurrentWorkload(
          parseInt(staff_id),
          parseInt(semester_id)
        );

      const courseLoad = course.credit_hours * 1.5; // Estimated load factor
      const rankLimits = await CourseAssignmentController.getRankLimits(
        staff.academic_rank
      );
      const projectedTotal = currentLoad.total_hours + courseLoad;
      const overloadHours = Math.max(0, projectedTotal - rankLimits.max);
      const isOverload = overloadHours > 0;
      const overloadPercentage = (overloadHours / rankLimits.max) * 100;

      // If overload detected and not confirmed, return detailed warning
      if (isOverload && !confirm_overload) {
        const overloadReport = {
          staff_info: {
            name: `${staff.first_name} ${staff.last_name}`,
            employee_id: staff.employee_id,
            academic_rank: CourseAssignmentController.formatAcademicRank(
              staff.academic_rank
            ),
          },
          course_info: {
            code: course.course_code,
            title: course.course_title,
            credit_hours: course.credit_hours,
            semester: semester.semester_name,
            program_type: program_type,
            student_year: student_year,
          },
          workload_analysis: {
            current_total: currentLoad.total_hours,
            new_course_load: courseLoad,
            projected_total: projectedTotal,
            rank_limit: rankLimits.max,
            available_before: Math.max(
              0,
              rankLimits.max - currentLoad.total_hours
            ),
            overload_hours: overloadHours,
            overload_percentage: overloadPercentage.toFixed(1),
          },
          risk_assessment: {
            level: CourseAssignmentController.getRiskLevel(overloadPercentage),
            description:
              CourseAssignmentController.getRiskDescription(overloadPercentage),
            requires_approval: overloadPercentage > 15,
          },
        };

        return sendError(
          res,
          {
            title: "⚠️ Overload Warning",
            message: "Course assignment would exceed workload limits",
            details: overloadReport,
            requires_confirmation: true,
            confirmation_field: "confirm_overload",
          },
          400
        );
      }

      // Check if staff is severely overloaded (more than 20% over limit)
      const isSevereOverload = overloadPercentage > 20;

      if (isSevereOverload) {
        // Log severe overload attempt
        await CourseAssignmentController.logSevereOverloadAttempt({
          department_head_id: user_id,
          staff_id: staff.staff_id,
          course_id: course.course_id,
          semester_id: semester.semester_id,
          overload_hours: overloadHours,
          overload_percentage: overloadPercentage,
        });
      }

      // Create assignment with all fields
      const assignmentData = {
        course_id: parseInt(course_id),
        semester_id: parseInt(semester_id),
        staff_id: parseInt(staff_id),
        assigned_by: user_id,
        student_year: student_year,
        section_code: section_code,
        notes:
          notes ||
          CourseAssignmentController.generateAssignmentNotes({
            course,
            semester,
            program_type,
            student_year,
            isOverload,
            overloadHours,
          }),
        status: "assigned",
        is_overload: isOverload,
        overload_hours: isOverload ? overloadHours : null,
      };

      const assignment = await CourseAssignmentModel.create(assignmentData);

      // Send notifications
      await CourseAssignmentController.sendAssignmentNotifications({
        assignment,
        staff,
        course,
        semester,
        program_type,
        student_year,
        isOverload,
        overloadHours,
        isSevereOverload,
        department_head_id: user_id,
      });

      return sendSuccess(
        res,
        isOverload
          ? `✅ Course assigned successfully with overload (${overloadHours.toFixed(
              1
            )} hours above limit)`
          : "✅ Course assigned successfully",
        {
          assignment,
          details: {
            course_code: course.course_code,
            course_title: course.course_title,
            staff_name: `${staff.first_name} ${staff.last_name}`,
            semester: semester.semester_name,
            program_type: program_type,
            student_year: student_year,
            section_code: section_code,
          },
          workload_summary: {
            before_assignment: currentLoad.total_hours,
            course_added: courseLoad,
            after_assignment: projectedTotal,
            rank_limit: rankLimits.max,
            overload_hours: overloadHours,
            is_within_limits: !isOverload,
          },
        },
        201
      );
    } catch (error) {
      console.error("Create assignment error:", error);
      return sendError(res, "Failed to assign course", 500);
    }
  }
  // In CourseAssignmentController.js - Update the duplicate assignment check section
  static async createAssignment(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head") {
        return sendError(res, "Only department heads can assign courses", 403);
      }

      const {
        course_id,
        semester_id,
        staff_id,
        program_type = "regular",
        student_year = null,
        section_code = null,
        notes = null,
        confirm_overload = false,
      } = req.body;

      // Validate required fields
      if (!course_id || !semester_id || !staff_id) {
        return sendError(
          res,
          "Course ID, semester ID, and staff ID are required",
          400
        );
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

      // Check if staff exists and belongs to department head's department
      const staff = await StaffModel.findById(parseInt(staff_id));
      if (!staff) {
        return sendError(res, "Staff member not found", 404);
      }

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      if (staff.department_id !== headStaff.department_id) {
        return sendError(
          res,
          "You can only assign courses to staff in your department",
          403
        );
      }

      // FIXED: Enhanced duplicate assignment check with better error response
      const isAssigned = await CourseAssignmentModel.isCourseAssigned(
        parseInt(course_id),
        parseInt(semester_id),
        parseInt(staff_id)
      );

      if (isAssigned) {
        // Get existing assignment details for better error message
        const [existingAssignment] = await query(
          `SELECT ca.*, c.course_code, c.course_title, 
                s.semester_name, sp.first_name, sp.last_name
         FROM course_assignments ca
         LEFT JOIN courses c ON ca.course_id = c.course_id
         LEFT JOIN semesters s ON ca.semester_id = s.semester_id
         LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
         WHERE ca.course_id = ? AND ca.semester_id = ? AND ca.staff_id = ?
         AND ca.status IN ('assigned', 'accepted')`,
          [parseInt(course_id), parseInt(semester_id), parseInt(staff_id)]
        );

        return sendError(
          res,
          {
            error_type: "DUPLICATE_ASSIGNMENT",
            message:
              "This course is already assigned to this staff member for the selected semester",
            details: {
              existing_assignment: existingAssignment || null,
              course: {
                code: course.course_code,
                title: course.course_title,
              },
              staff: {
                name: `${staff.first_name} ${staff.last_name}`,
                employee_id: staff.employee_id,
              },
              semester: {
                name: semester.semester_name,
                code: semester.semester_code,
              },
              suggested_actions: [
                "Select a different course",
                "Select a different instructor",
                "Select a different semester",
                "Check if you need to update an existing assignment instead",
              ],
            },
          },
          409 // Use 409 Conflict for duplicate resource
        );
      }

      // Rest of the method remains the same...
      // [Keep all the existing workload calculation and assignment creation logic]
    } catch (error) {
      console.error("Create assignment error:", error);
      return sendError(res, "Failed to assign course", 500);
    }
  }

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

      // Calculate total hours (using credit hours * load factor)
      let totalHours = 0;
      const assignedCourses = [];

      for (const assignment of acceptedAssignments) {
        const courseLoad = assignment.credit_hours * 1.5; // Load factor of 1.5
        totalHours += courseLoad;
        assignedCourses.push({
          course_id: assignment.course_id,
          course_code: assignment.course_code,
          credit_hours: assignment.credit_hours,
          estimated_load: courseLoad,
        });
      }

      // Add existing workload RP hours
      const [workloadRP] = await query(
        `SELECT COALESCE(SUM(total_load), 0) as rp_hours
       FROM workload_rp 
       WHERE staff_id = ? AND semester_id = ? AND status NOT IN ('rejected', 'draft')`,
        [staffId, semesterId]
      );

      const rpHours = parseFloat(workloadRP.rp_hours || 0);
      totalHours += rpHours;

      return {
        total_hours: totalHours,
        assigned_courses: assignedCourses,
        assignment_count: acceptedAssignments.length,
        rp_hours: rpHours,
      };
    } catch (error) {
      console.error("Calculate current workload error:", error);
      return {
        total_hours: 0,
        assigned_courses: [],
        assignment_count: 0,
        rp_hours: 0,
      };
    }
  }
  // Get detailed workload for a staff member
  static async getStaffWorkload(req, res) {
    try {
      const { id } = req.params;
      const { semester_id } = req.query;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Check permissions
      let canView = false;
      const staff = await StaffModel.findById(parseInt(id));

      if (!staff) {
        return sendError(res, "Staff member not found", 404);
      }

      if (user_role === "admin") {
        canView = true;
      } else if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        canView = headStaff?.department_id === staff.department_id;
      } else if (user_role === "instructor") {
        const userStaff = await StaffModel.findByUserId(user_id);
        canView = userStaff?.staff_id === parseInt(id);
      }

      if (!canView) {
        return sendError(
          res,
          "You are not authorized to view this workload",
          403
        );
      }

      // Get active semester if not specified
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

      const currentLoad =
        await CourseAssignmentController.calculateCurrentWorkload(
          parseInt(id),
          targetSemesterId
        );

      const rankLimits = await CourseAssignmentController.getRankLimits(
        staff.academic_rank
      );
      const loadPercentage = (currentLoad.total_hours / rankLimits.max) * 100;
      const overloadHours = Math.max(
        0,
        currentLoad.total_hours - rankLimits.max
      );

      const [semesterInfo] = await query(
        "SELECT semester_name, semester_code FROM semesters WHERE semester_id = ?",
        [targetSemesterId]
      );

      // Get additional workload details
      const [rpWorkload] = await query(
        `SELECT COUNT(*) as count, COALESCE(SUM(total_load), 0) as total
         FROM workload_rp 
         WHERE staff_id = ? AND semester_id = ? AND status NOT IN ('rejected', 'draft')`,
        [parseInt(id), targetSemesterId]
      );

      const [nrpWorkload] = await query(
        `SELECT COUNT(*) as count, COALESCE(SUM(total_hours_worked), 0) as total
         FROM workload_nrp 
         WHERE staff_id = ? AND semester_id = ? AND status NOT IN ('rejected', 'draft')`,
        [parseInt(id), targetSemesterId]
      );

      const workloadData = {
        staff_info: {
          staff_id: staff.staff_id,
          name: `${staff.first_name} ${staff.last_name}`,
          employee_id: staff.employee_id,
          academic_rank: staff.academic_rank,
          formatted_rank: CourseAssignmentController.formatAcademicRank(
            staff.academic_rank
          ),
          department_id: staff.department_id,
        },
        semester_info: {
          semester_id: targetSemesterId,
          semester_name: semesterInfo?.semester_name,
          semester_code: semesterInfo?.semester_code,
        },
        limits: {
          rank_min: rankLimits.min,
          rank_max: rankLimits.max,
        },
        current_workload: {
          total_hours: currentLoad.total_hours,
          load_percentage: loadPercentage.toFixed(1),
          overload_hours: overloadHours,
          is_overloaded: overloadHours > 0,
          status: CourseAssignmentController.getWorkloadStatus(loadPercentage),
          status_color:
            CourseAssignmentController.getStatusColor(loadPercentage),
        },
        breakdown: {
          course_assignments: currentLoad.assigned_courses,
          rp_workload: {
            count: rpWorkload.count,
            total_hours: parseFloat(rpWorkload.total || 0),
          },
          nrp_workload: {
            count: nrpWorkload.count,
            total_hours: parseFloat(nrpWorkload.total || 0),
          },
        },
        summary: {
          total_courses:
            currentLoad.assignment_count + parseInt(rpWorkload.count || 0),
          total_nrp_courses: parseInt(nrpWorkload.count || 0),
        },
        capacity: {
          available_hours: Math.max(
            0,
            rankLimits.max - currentLoad.total_hours
          ),
          available_percentage: Math.max(0, 100 - loadPercentage).toFixed(1),
          can_take_more: currentLoad.total_hours < rankLimits.max * 0.8,
        },
        last_updated: new Date().toISOString(),
      };

      return sendSuccess(
        res,
        "Workload analysis retrieved successfully",
        workloadData
      );
    } catch (error) {
      console.error("Get staff workload error:", error);
      return sendError(res, "Failed to retrieve workload analysis", 500);
    }
  }
  // Update assignment details (section code, notes, etc.)
  static async updateAssignment(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;
      const { id } = req.params;
      const { section_code, notes, status } = req.body;

      if (!id) {
        return sendError(res, "Assignment ID is required", 400);
      }

      const assignment = await CourseAssignmentModel.findById(parseInt(id));
      if (!assignment) {
        return sendError(res, "Assignment not found", 404);
      }

      // Check permissions
      let canUpdate = false;

      if (user_role === "admin") {
        canUpdate = true;
      } else if (user_role === "department_head") {
        // Check if the department head is from the same department
        const headStaff = await StaffModel.findByUserId(user_id);
        const staff = await StaffModel.findById(assignment.staff_id);
        canUpdate = headStaff?.department_id === staff?.department_id;
      } else if (user_role === "instructor") {
        // Instructors can only update their own assignments
        const staff = await StaffModel.findByUserId(user_id);
        canUpdate = staff?.staff_id === assignment.staff_id;
      }

      if (!canUpdate) {
        return sendError(
          res,
          "You are not authorized to update this assignment",
          403
        );
      }

      // Prepare update data
      const updateData = {};
      if (section_code !== undefined) updateData.section_code = section_code;
      if (notes !== undefined) updateData.notes = notes;
      if (status !== undefined) {
        // Validate status transitions
        const validTransitions = {
          assigned: ["accepted", "declined", "withdrawn"],
          accepted: ["withdrawn"], // Only department head can withdraw accepted assignments
          declined: ["assigned"], // Can reassign declined assignments
          withdrawn: ["assigned"], // Can reassign withdrawn assignments
        };

        if (validTransitions[assignment.status]?.includes(status)) {
          updateData.status = status;
        } else {
          return sendError(
            res,
            `Invalid status transition from ${assignment.status} to ${status}`,
            400
          );
        }
      }

      if (Object.keys(updateData).length === 0) {
        return sendError(res, "No valid fields to update", 400);
      }

      // Update assignment
      const updatedAssignment = await CourseAssignmentModel.update(
        parseInt(id),
        updateData
      );

      return sendSuccess(
        res,
        "Assignment updated successfully",
        updatedAssignment
      );
    } catch (error) {
      console.error("Update assignment error:", error);
      return sendError(res, "Failed to update assignment", 500);
    }
  }
  // Add this helper method to CourseAssignmentController:
  static getRiskColor(overloadPercentage) {
    if (overloadPercentage <= 0) return "green";
    if (overloadPercentage <= 10) return "blue";
    if (overloadPercentage <= 20) return "yellow";
    if (overloadPercentage <= 30) return "orange";
    return "red";
  }

  static getRiskIcon(overloadPercentage) {
    if (overloadPercentage <= 0) return "check";
    if (overloadPercentage <= 10) return "info";
    if (overloadPercentage <= 20) return "warning";
    if (overloadPercentage <= 30) return "alert";
    return "danger";
  }

  static async getFeasibilityRecommendations(
    courseId,
    semesterId,
    departmentId,
    excludeStaffId
  ) {
    try {
      const recommendations = [];

      // 1. Suggest alternative staff
      const alternatives = await this.findAlternativeStaff(
        courseId,
        semesterId,
        departmentId,
        excludeStaffId
      );

      if (alternatives.length > 0) {
        recommendations.push({
          type: "alternative_staff",
          title: "Alternative Instructors Available",
          description: "Consider these instructors with available capacity:",
          items: alternatives.slice(0, 3),
          priority: "high",
        });
      }

      // 2. Suggest workload reduction
      recommendations.push({
        type: "workload_reduction",
        title: "Reduce Current Load",
        description:
          "Consider reassigning some of the instructor's current courses",
        priority: "medium",
      });

      // 3. Suggest splitting the course
      recommendations.push({
        type: "split_course",
        title: "Split Course Assignment",
        description: "Consider assigning this course to multiple instructors",
        priority: "low",
      });

      return recommendations;
    } catch (error) {
      console.error("Get feasibility recommendations error:", error);
      return [];
    }
  }

  // ==================== HELPER METHODS ====================

  // Get rank limits with proper defaults
  static async getRankLimits(academicRank) {
    try {
      // Try to get from database first
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

      // Default limits if not found in database
      const defaultLimits = {
        graduate_assistant: { min: 12, max: 16 },
        assistant_lecturer: { min: 10, max: 14 },
        lecturer: { min: 8, max: 12 },
        assistant_professor: { min: 6, max: 10 },
        associate_professor: { min: 4, max: 8 },
        professor: { min: 4, max: 6 },
      };

      const defaults = defaultLimits[academicRank] || { min: 8, max: 12 };

      return {
        min: minRule ? parseFloat(minRule.rule_value) : defaults.min,
        max: maxRule ? parseFloat(maxRule.rule_value) : defaults.max,
      };
    } catch (error) {
      console.error("Get rank limits error:", error);
      // Fallback to hardcoded defaults
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
  // Format academic rank
  static formatAcademicRank(rank) {
    const rankMap = {
      graduate_assistant: "Graduate Assistant",
      assistant_lecturer: "Assistant Lecturer",
      lecturer: "Lecturer",
      assistant_professor: "Assistant Professor",
      associate_professor: "Associate Professor",
      professor: "Professor",
    };
    return rankMap[rank] || rank.replace(/_/g, " ").toUpperCase();
  }
  // Get risk level
  static getRiskLevel(overloadPercentage) {
    if (overloadPercentage <= 0) return "none";
    if (overloadPercentage <= 10) return "low";
    if (overloadPercentage <= 20) return "moderate";
    if (overloadPercentage <= 30) return "high";
    return "critical";
  }
  // Get risk description
  static getRiskDescription(overloadPercentage) {
    if (overloadPercentage <= 0) return "Within limits";
    if (overloadPercentage <= 10) return "Minimal overload - manageable";
    if (overloadPercentage <= 20)
      return "Moderate overload - requires monitoring";
    if (overloadPercentage <= 30) return "High overload - requires approval";
    return "Critical overload - requires immediate attention";
  }

  // Get workload status
  static getWorkloadStatus(loadPercentage) {
    if (loadPercentage < 50) return "Underloaded";
    if (loadPercentage < 80) return "Balanced";
    if (loadPercentage < 100) return "Approaching Limit";
    if (loadPercentage < 120) return "Moderate Overload";
    if (loadPercentage < 150) return "High Overload";
    return "Critical Overload";
  }

  // Get status color
  static getStatusColor(loadPercentage) {
    if (loadPercentage < 50) return "#3b82f6"; // blue
    if (loadPercentage < 80) return "#10b981"; // green
    if (loadPercentage < 100) return "#f59e0b"; // amber
    if (loadPercentage < 120) return "#f97316"; // orange
    if (loadPercentage < 150) return "#ef4444"; // red
    return "#991b1b"; // dark red
  }

  // Find alternative staff
  static async findAlternativeStaff(
    courseId,
    semesterId,
    departmentId,
    excludeStaffId
  ) {
    try {
      // Get staff with available capacity
      const staffList = await query(
        `SELECT sp.staff_id, sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank
         FROM staff_profiles sp
         WHERE sp.department_id = ? AND sp.staff_id != ?`,
        [departmentId, excludeStaffId]
      );

      const alternatives = [];

      for (const staff of staffList) {
        const currentLoad =
          await CourseAssignmentController.calculateCurrentWorkload(
            staff.staff_id,
            semesterId
          );
        const rankLimits = await CourseAssignmentController.getRankLimits(
          staff.academic_rank
        );
        const availableCapacity = Math.max(
          0,
          rankLimits.max - currentLoad.total_hours
        );

        // Check if staff is already assigned to this course
        const isAssigned = await CourseAssignmentModel.isCourseAssigned(
          courseId,
          semesterId,
          staff.staff_id
        );

        if (!isAssigned && availableCapacity > 3) {
          // At least 3 hours capacity
          alternatives.push({
            staff_id: staff.staff_id,
            name: `${staff.first_name} ${staff.last_name}`,
            employee_id: staff.employee_id,
            academic_rank: CourseAssignmentController.formatAcademicRank(
              staff.academic_rank
            ),
            current_load: currentLoad.total_hours,
            available_capacity: availableCapacity,
            capacity_percentage: (availableCapacity / rankLimits.max) * 100,
          });
        }
      }

      // Sort by available capacity (most capacity first)
      return alternatives
        .sort((a, b) => b.available_capacity - a.available_capacity)
        .slice(0, 3);
    } catch (error) {
      console.error("Find alternative staff error:", error);
      return [];
    }
  }

  // Generate assignment notes
  static generateAssignmentNotes(data) {
    const { course, semester, isOverload, overloadHours } = data;

    let notes = `Assigned to teach ${course.course_code} for ${semester.semester_name}`;

    if (isOverload) {
      notes += ` [OVERLOAD: ${overloadHours.toFixed(1)} hours beyond limit]`;
    }

    return notes;
  }

  // Log severe overload attempt
  static async logSevereOverloadAttempt(data) {
    try {
      await query(
        `INSERT INTO audit_log 
         (user_id, action, entity, entity_id, old_value, new_value) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.department_head_id,
          "severe_overload_assignment",
          "course_assignment",
          data.course_id,
          JSON.stringify({ status: "pre_assignment" }),
          JSON.stringify({
            staff_id: data.staff_id,
            overload_hours: data.overload_hours,
            overload_percentage: data.overload_percentage,
          }),
        ]
      );
    } catch (error) {
      console.error("Log severe overload attempt error:", error);
    }
  }

  // Send assignment notifications
  static async sendAssignmentNotifications(data) {
    const {
      assignment,
      staff,
      course,
      semester,
      isOverload,
      overloadHours,
      isSevereOverload,
      department_head_id,
    } = data;

    if (isOverload) {
      const message = isSevereOverload
        ? `🚨 SEVERE OVERLOAD ASSIGNMENT: ${
            course.course_code
          } assigned with ${overloadHours.toFixed(1)} hours overload`
        : `⚠️ Overload Assignment: ${
            course.course_code
          } assigned with ${overloadHours.toFixed(1)} hours overload`;

      // Notify staff
      await CourseAssignmentController.createNotification(
        staff.user_id,
        message,
        `You have been assigned to teach ${course.course_code} as an overload assignment. Please review your workload.`,
        "overload_assignment"
      );

      // Notify department head
      await CourseAssignmentController.createNotification(
        department_head_id,
        "Overload Assignment Recorded",
        `Assigned ${course.course_code} to ${staff.first_name} ${
          staff.last_name
        } with ${overloadHours.toFixed(1)} hours overload.`,
        "overload_assignment_log"
      );
    } else {
      // Normal assignment notification
      await CourseAssignmentController.createNotification(
        staff.user_id,
        "📋 New Course Assignment",
        `You have been assigned to teach ${course.course_code} - ${course.course_title} for ${semester.semester_name}`,
        "new_assignment"
      );
    }
  }

  // Create notification
  static async createNotification(userId, title, message, type) {
    try {
      console.log(`📧 Notification sent to user ${userId}: ${title}`);
      console.log(`Message: ${message}`);
      return true;
    } catch (error) {
      console.error("Create notification error:", error);
      return false;
    }
  }
  // Get my assignments (for instructors)
  static async getMyAssignments(req, res) {
    try {
      const user_id = req.user.user_id;
      const { semester_id, status, page = 1, limit = 20 } = req.query;

      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      const result = await CourseAssignmentModel.findByStaff(
        staff.staff_id,
        semester_id ? parseInt(semester_id) : null,
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(res, "Assignments retrieved successfully", result);
    } catch (error) {
      console.error("Get my assignments error:", error);
      return sendError(res, "Failed to retrieve assignments", 500);
    }
  }
  // Get assignment statistics
  static async getAssignmentStats(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;
      const { semester_id } = req.query;

      let stats;
      if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        if (headStaff) {
          stats = await CourseAssignmentModel.getStatistics(
            headStaff.department_id,
            semester_id
          );
        }
      } else {
        stats = await CourseAssignmentModel.getStatistics(null, semester_id);
      }

      return sendSuccess(res, "Assignment statistics retrieved", stats);
    } catch (error) {
      console.error("Get assignment stats error:", error);
      return sendError(res, "Failed to get assignment statistics", 500);
    }
  }
  // Get staff availability (for department head)
  static async getStaffAvailability(req, res) {
    try {
      const user_id = req.user.user_id;
      const { semester_id, department_id } = req.query;

      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      const targetDeptId = department_id || headStaff.department_id;

      // Get all staff in department
      const staffList = await query(
        `SELECT sp.*, u.username, u.email
         FROM staff_profiles sp
         LEFT JOIN users u ON sp.user_id = u.user_id
         WHERE sp.department_id = ? AND u.is_active = TRUE`,
        [targetDeptId]
      );

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

      // Calculate availability for each staff
      const availability = [];
      for (const staff of staffList) {
        const currentLoad =
          await CourseAssignmentController.calculateCurrentWorkload(
            staff.staff_id,
            targetSemesterId
          );

        const rankLimits = await CourseAssignmentController.getRankLimits(
          staff.academic_rank
        );
        const availableHours = Math.max(
          0,
          rankLimits.max - currentLoad.total_hours
        );
        const loadPercentage = (currentLoad.total_hours / rankLimits.max) * 100;

        availability.push({
          staff_id: staff.staff_id,
          first_name: staff.first_name,
          last_name: staff.last_name,
          employee_id: staff.employee_id,
          academic_rank: staff.academic_rank,
          current_hours: currentLoad.total_hours.toFixed(2),
          max_hours: rankLimits.max,
          available_hours: availableHours.toFixed(2),
          load_percentage: loadPercentage.toFixed(1),
          status: CourseAssignmentController.getWorkloadStatus(loadPercentage),
          assigned_courses: currentLoad.assignment_count,
        });
      }

      // Sort by availability (most available first)
      availability.sort((a, b) => b.available_hours - a.available_hours);

      return sendSuccess(res, "Staff availability retrieved", {
        semester_id: targetSemesterId,
        department_id: targetDeptId,
        staff_availability: availability,
      });
    } catch (error) {
      console.error("Get staff availability error:", error);
      return sendError(res, "Failed to get staff availability", 500);
    }
  }


  // In CourseAssignmentController.js - FIXED acceptAssignment method
  static async acceptAssignment(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;
      const { force_accept = false, confirm_overload = false } = req.body;

      // Get staff profile for current user
      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      // Find the assignment
      const assignment = await CourseAssignmentModel.findById(parseInt(id));
      if (!assignment) {
        return sendError(res, "Assignment not found", 404);
      }

      // Check if staff owns this assignment
      if (assignment.staff_id !== staff.staff_id) {
        return sendError(res, "You can only accept your own assignments", 403);
      }

      // Check current assignment status
      if (
        assignment.status !== "assigned" &&
        assignment.status !== "withdrawn"
      ) {
        return sendError(
          res,
          `This assignment cannot be accepted. Current status: ${assignment.status}`,
          400
        );
      }

      // Check workload before accepting
      const currentLoad =
        await CourseAssignmentController.calculateCurrentWorkload(
          staff.staff_id,
          assignment.semester_id
        );

      // Get course details
      const course = await CourseModel.findById(assignment.course_id);
      if (!course) {
        return sendError(res, "Course not found", 404);
      }

      // Calculate course load (credit hours * load factor)
      const courseLoad = (course.credit_hours || 0) * 1.5; // Load factor of 1.5

      // Get rank limits for the staff
      const rankLimits = await CourseAssignmentController.getRankLimits(
        staff.academic_rank
      );

      // Calculate projected total and overload
      const projectedTotal = currentLoad.total_hours + courseLoad;
      const overloadHours = Math.max(0, projectedTotal - rankLimits.max);
      const isOverload = overloadHours > 0;
      const overloadPercentage = (overloadHours / rankLimits.max) * 100;

      // If overload detected and not confirmed, return detailed warning
      if (isOverload && !confirm_overload && !force_accept) {
        const overloadReport = {
          staff_info: {
            name: `${staff.first_name} ${staff.last_name}`,
            employee_id: staff.employee_id,
            academic_rank: CourseAssignmentController.formatAcademicRank(
              staff.academic_rank
            ),
          },
          course_info: {
            code: course.course_code,
            title: course.course_title,
            credit_hours: course.credit_hours,
            semester: assignment.semester_name || "N/A",
          },
          workload_analysis: {
            current_total: currentLoad.total_hours,
            new_course_load: courseLoad,
            projected_total: projectedTotal,
            rank_limit: rankLimits.max,
            available_before: Math.max(
              0,
              rankLimits.max - currentLoad.total_hours
            ),
            overload_hours: overloadHours,
            overload_percentage: overloadPercentage.toFixed(1),
          },
          risk_assessment: {
            level: CourseAssignmentController.getRiskLevel(overloadPercentage),
            description:
              CourseAssignmentController.getRiskDescription(overloadPercentage),
            requires_approval: overloadPercentage > 15,
          },
          actions: {
            can_force_accept:
              user_role === "department_head" || user_role === "admin",
            can_request_overload: true,
            contact_department_head: true,
          },
        };

        return sendError(
          res,
          {
            title: "⚠️ Overload Warning",
            message: "Accepting this assignment would exceed workload limits",
            details: overloadReport,
            requires_confirmation: true,
            confirmation_field: "confirm_overload",
          },
          400
        );
      }

      // Check if force acceptance is required (only for department heads/admins)
      if (isOverload && force_accept) {
        const user_role = req.user.role;
        if (user_role !== "department_head" && user_role !== "admin") {
          return sendError(
            res,
            "Only department heads or admins can force accept overload assignments",
            403
          );
        }

        // Log the forced acceptance
        await query(
          `INSERT INTO audit_log (user_id, action, entity, entity_id, old_value, new_value) 
         VALUES (?, ?, ?, ?, ?, ?)`,
          [
            user_id,
            "force_accept_overload",
            "course_assignment",
            assignment.assignment_id,
            JSON.stringify({
              status: assignment.status,
              workload: currentLoad.total_hours,
            }),
            JSON.stringify({
              status: "accepted",
              new_workload: projectedTotal,
              overload_hours: overloadHours,
              forced_by: user_id,
            }),
          ]
        );
      }

      // If overload and user confirmed, add note about overload
      let updatedNotes = assignment.notes || "";
      if (isOverload && confirm_overload) {
        updatedNotes += `\n[ACCEPTED WITH OVERLOAD: ${overloadHours.toFixed(
          1
        )} hours beyond limit. Load factor: ${overloadPercentage.toFixed(1)}%]`;

        // Create overload request if needed
        if (overloadPercentage > 20) {
          await query(
            `INSERT INTO overload_requests 
           (staff_id, assignment_id, overload_hours, requested_by, status, reason) 
           VALUES (?, ?, ?, ?, 'pending', ?)`,
            [
              staff.staff_id,
              assignment.assignment_id,
              overloadHours,
              user_id,
              `Instructor accepted assignment despite ${overloadHours.toFixed(
                1
              )} hour overload`,
            ]
          );
        }
      }

      // Update the assignment
      const updateData = {
        status: "accepted",
        notes: updatedNotes.trim(),
        accepted_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      };

      const updatedAssignment = await CourseAssignmentModel.update(
        parseInt(id),
        updateData
      );

      // Send notification to department head
      await CourseAssignmentController.sendAssignmentNotification({
        assignment: updatedAssignment,
        staff: staff,
        course: course,
        action: "accepted",
        is_overload: isOverload,
        overload_hours: overloadHours,
      });

      return sendSuccess(
        res,
        isOverload
          ? `✅ Assignment accepted with overload warning (${overloadHours.toFixed(
              1
            )} hours above limit)`
          : "✅ Assignment accepted successfully",
        {
          assignment: updatedAssignment,
          workload_summary: {
            before_acceptance: currentLoad.total_hours,
            course_added: courseLoad,
            after_acceptance: projectedTotal,
            rank_limit: rankLimits.max,
            overload_hours: overloadHours,
            is_within_limits: !isOverload,
          },
          recommendations: isOverload
            ? [
                "Consider discussing workload adjustment with your department head",
                "Monitor your time management carefully",
                "Report any issues with workload balance",
              ]
            : [],
        }
      );
    } catch (error) {
      console.error("Accept assignment error:", error);
      return sendError(res, "Failed to accept assignment", 500);
    }
  }
  // Decline assignment (by instructor)
  static async declineAssignment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user_id = req.user.user_id;

      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      const assignment = await CourseAssignmentModel.findById(parseInt(id));
      if (!assignment) {
        return sendError(res, "Assignment not found", 404);
      }

      if (assignment.staff_id !== staff.staff_id) {
        return sendError(res, "You can only decline your own assignments", 403);
      }

      if (assignment.status !== "assigned") {
        return sendError(
          res,
          "This assignment cannot be declined in its current status",
          400
        );
      }

      const updatedAssignment = await CourseAssignmentModel.declineAssignment(
        parseInt(id),
        reason
      );

      return sendSuccess(
        res,
        "Assignment declined successfully",
        updatedAssignment
      );
    } catch (error) {
      console.error("Decline assignment error:", error);
      return sendError(res, "Failed to decline assignment", 500);
    }
  }

  // Withdraw assignment (by department head)
  static async withdrawAssignment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user_id = req.user.user_id;

      const assignment = await CourseAssignmentModel.findById(parseInt(id));
      if (!assignment) {
        return sendError(res, "Assignment not found", 404);
      }

      if (assignment.assigned_by !== user_id) {
        return sendError(
          res,
          "You can only withdraw assignments you created",
          403
        );
      }

      if (assignment.status === "accepted") {
        return sendError(res, "Accepted assignments cannot be withdrawn", 400);
      }

      const updatedAssignment = await CourseAssignmentModel.withdrawAssignment(
        parseInt(id),
        reason
      );

      return sendSuccess(
        res,
        "Assignment withdrawn successfully",
        updatedAssignment
      );
    } catch (error) {
      console.error("Withdraw assignment error:", error);
      return sendError(res, "Failed to withdraw assignment", 500);
    }
  }

  // Get assignment by ID
  static async getAssignmentById(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      const assignment = await CourseAssignmentModel.findById(parseInt(id));
      if (!assignment) {
        return sendError(res, "Assignment not found", 404);
      }

      let canView = false;

      if (user_role === "admin") {
        canView = true;
      } else if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        const staff = await StaffModel.findById(assignment.staff_id);
        canView = headStaff?.department_id === staff?.department_id;
      } else if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        canView = staff?.staff_id === assignment.staff_id;
      }

      if (!canView) {
        return sendError(
          res,
          "You are not authorized to view this assignment",
          403
        );
      }

      return sendSuccess(res, "Assignment retrieved successfully", assignment);
    } catch (error) {
      console.error("Get assignment by ID error:", error);
      return sendError(res, "Failed to retrieve assignment", 500);
    }
  }

  // Get department assignments (for department head)
  static async getDepartmentAssignments(req, res) {
    try {
      const user_id = req.user.user_id;
      const { semester_id, status, page = 1, limit = 20 } = req.query;

      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      const result = await CourseAssignmentModel.findByDepartment(
        headStaff.department_id,
        semester_id ? parseInt(semester_id) : null,
        parseInt(page),
        parseInt(limit)
      );

      return sendSuccess(
        res,
        "Department assignments retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Get department assignments error:", error);
      return sendError(res, "Failed to retrieve department assignments", 500);
    }
  }

  // Get curriculum structure for department
  static async getCurriculumStructure(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;
      const { program_id, year, semester } = req.query;

      // For department heads, only show their department
      let targetDepartmentId = null;

      if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        if (headStaff) {
          targetDepartmentId = headStaff.department_id;
        }
      } else if (user_role === "admin" || user_role === "dean") {
        // Admin/dean can view any department if specified
        const { department_id } = req.query;
        if (department_id) {
          targetDepartmentId = parseInt(department_id);
        }
      }

      if (!targetDepartmentId) {
        return sendError(res, "Department ID is required", 400);
      }

      // Get programs in department
      const programs = await query(
        `SELECT p.* FROM programs p
         WHERE p.department_id = ? AND p.status = 'active'
         ORDER BY p.program_name`,
        [targetDepartmentId]
      );

      // Get curriculum using curriculum_plans table
      let curriculumQuery = `
        SELECT
          cp.year,
          cp.semester,
          c.course_id,
          c.course_code,
          c.course_title,
          c.credit_hours,
          c.lecture_hours,
          c.lab_hours,
          c.tutorial_hours,
          p.program_name,
          (SELECT COUNT(*) FROM course_assignments ca
           WHERE ca.course_id = c.course_id
           AND ca.semester_id = (SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1)
           AND ca.status IN ('assigned', 'accepted')) as current_assignments
        FROM curriculum_plans cp
        LEFT JOIN courses c ON cp.course_id = c.course_id
        LEFT JOIN programs p ON cp.program_id = p.program_id
        WHERE cp.department_id = ?
      `;

      const params = [targetDepartmentId];

      if (program_id) {
        curriculumQuery += " AND cp.program_id = ?";
        params.push(parseInt(program_id));
      }

      if (year) {
        curriculumQuery += " AND cp.year = ?";
        params.push(parseInt(year));
      }

      if (semester) {
        curriculumQuery += " AND cp.semester = ?";
        params.push(parseInt(semester));
      }

      curriculumQuery += " ORDER BY cp.year, cp.semester, c.course_code";

      const curriculum = await query(curriculumQuery, params);

      // Group by year and semester
      const groupedCurriculum = {};
      curriculum.forEach((course) => {
        const key = `Year ${course.year} - Semester ${course.semester}`;

        if (!groupedCurriculum[key]) {
          groupedCurriculum[key] = {
            year: course.year,
            semester: course.semester,
            courses: [],
            total_credits: 0,
            total_courses: 0,
          };
        }

        groupedCurriculum[key].courses.push(course);
        groupedCurriculum[key].total_credits += course.credit_hours || 0;
        groupedCurriculum[key].total_courses += 1;
      });

      // Also get courses without curriculum plans (for backward compatibility)
      let coursesQuery = `
        SELECT
          c.course_id,
          c.course_code,
          c.course_title,
          c.credit_hours,
          c.course_year,
          c.course_semester,
          p.program_name
        FROM courses c
        LEFT JOIN programs p ON c.program_id = p.program_id
        WHERE c.department_id = ?
          AND c.status = 'active'
          AND c.course_id NOT IN (SELECT course_id FROM curriculum_plans WHERE department_id = ?)
      `;

      const courseParams = [targetDepartmentId, targetDepartmentId];

      if (program_id) {
        coursesQuery += " AND c.program_id = ?";
        courseParams.push(parseInt(program_id));
      }

      if (year) {
        coursesQuery += " AND c.course_year = ?";
        courseParams.push(parseInt(year));
      }

      if (semester) {
        coursesQuery += " AND c.course_semester = ?";
        courseParams.push(parseInt(semester));
      }

      coursesQuery +=
        " ORDER BY c.course_year, c.course_semester, c.course_code";

      const directCourses = await query(coursesQuery, courseParams);

      // Add direct courses to grouped curriculum
      directCourses.forEach((course) => {
        const year = course.course_year || "General";
        const semester = course.course_semester || "All";
        const key = `Year ${year} - Semester ${semester}`;

        if (!groupedCurriculum[key]) {
          groupedCurriculum[key] = {
            year: course.course_year,
            semester: course.course_semester,
            courses: [],
            total_credits: 0,
            total_courses: 0,
          };
        }

        groupedCurriculum[key].courses.push({
          ...course,
          year: course.course_year,
          semester: course.course_semester,
        });
        groupedCurriculum[key].total_credits += course.credit_hours || 0;
        groupedCurriculum[key].total_courses += 1;
      });

      return sendSuccess(res, "Curriculum structure retrieved", {
        department_id: targetDepartmentId,
        programs: programs,
        filters: {
          program_id: program_id || "All",
          year: year || "All",
          semester: semester || "All",
        },
        curriculum: groupedCurriculum,
        total_courses: curriculum.length + directCourses.length,
        has_curriculum_plans: curriculum.length > 0,
      });
    } catch (error) {
      console.error("Get curriculum structure error:", error);
      return sendError(res, "Failed to retrieve curriculum structure", 500);
    }
  }

  // Get curriculum dashboard
  static async getCurriculumDashboard(req, res) {
    try {
      const user_id = req.user.user_id;
      const { program_id } = req.query;

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      // Get active semester
      const [activeSemester] = await query(
        "SELECT semester_id, semester_code, semester_name FROM semesters WHERE is_active = TRUE LIMIT 1"
      );

      if (!activeSemester) {
        return sendError(res, "No active semester found", 404);
      }

      // Get all courses in department (both from curriculum_plans and direct)
      let coursesQuery = `
        SELECT DISTINCT
          c.course_id,
          c.course_code,
          c.course_title,
          c.credit_hours,
          c.course_year,
          c.course_semester,
          p.program_name,
          p.program_id,
          COALESCE(cp.year, c.course_year) as curriculum_year,
          COALESCE(cp.semester, c.course_semester) as curriculum_semester,
          (SELECT COUNT(*) FROM course_assignments ca
           WHERE ca.course_id = c.course_id
           AND ca.semester_id = ?) as assigned_count
        FROM courses c
        LEFT JOIN programs p ON c.program_id = p.program_id
        LEFT JOIN curriculum_plans cp ON c.course_id = cp.course_id AND cp.department_id = c.department_id
        WHERE c.department_id = ?
          AND c.status = 'active'
      `;

      const params = [activeSemester.semester_id, headStaff.department_id];

      if (program_id) {
        coursesQuery += " AND c.program_id = ?";
        params.push(parseInt(program_id));
      }

      coursesQuery +=
        " ORDER BY curriculum_year, curriculum_semester, c.course_code";

      const courses = await query(coursesQuery, params);

      // Get staff in department
      const staffList = await query(
        `SELECT sp.*, u.username, u.email
         FROM staff_profiles sp
         LEFT JOIN users u ON sp.user_id = u.user_id
         WHERE sp.department_id = ? AND u.is_active = TRUE
         ORDER BY sp.last_name, sp.first_name`,
        [headStaff.department_id]
      );

      // Get current assignments
      const currentAssignments = await query(
        `SELECT ca.*,
                c.course_code, c.course_title,
                c.course_year, c.course_semester,
                sp.first_name, sp.last_name,
                sp.employee_id, sp.academic_rank
         FROM course_assignments ca
         LEFT JOIN courses c ON ca.course_id = c.course_id
         LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
         WHERE ca.semester_id = ?
           AND sp.department_id = ?
         ORDER BY c.course_code`,
        [activeSemester.semester_id, headStaff.department_id]
      );

      // Calculate staff workload
      const staffWorkload = await Promise.all(
        staffList.map(async (staff) => {
          const currentLoad =
            await CourseAssignmentController.calculateCurrentWorkload(
              staff.staff_id,
              activeSemester.semester_id
            );

          const rankLimits = await CourseAssignmentController.getRankLimits(
            staff.academic_rank
          );
          const loadPercentage =
            rankLimits.max > 0
              ? (currentLoad.total_hours / rankLimits.max) * 100
              : 0;

          const staffAssignments = currentAssignments.filter(
            (a) => a.staff_id === staff.staff_id
          );

          return {
            staff_id: staff.staff_id,
            name: `${staff.first_name} ${staff.last_name}`,
            employee_id: staff.employee_id,
            academic_rank: staff.academic_rank,
            current_load: currentLoad.total_hours,
            max_load: rankLimits.max,
            load_percentage: parseFloat(loadPercentage.toFixed(1)),
            status:
              CourseAssignmentController.getWorkloadStatus(loadPercentage),
            assignments: staffAssignments,
            assignment_count: staffAssignments.length,
          };
        })
      );

      // Group courses by year and semester
      const coursesByYearSemester = {};
      courses.forEach((course) => {
        const year = course.curriculum_year || "General";
        const semester = course.curriculum_semester || "All";
        const key = `Year ${year} - Semester ${semester}`;

        if (!coursesByYearSemester[key]) {
          coursesByYearSemester[key] = {
            year: year,
            semester: semester,
            courses: [],
            assigned: 0,
            total: 0,
            total_credits: 0,
          };
        }

        coursesByYearSemester[key].courses.push(course);
        coursesByYearSemester[key].total += 1;
        coursesByYearSemester[key].total_credits += course.credit_hours || 0;
        if (course.assigned_count > 0) {
          coursesByYearSemester[key].assigned += 1;
        }
      });

      // Calculate summary statistics
      const totalCourses = courses.length;
      const assignedCourses = currentAssignments.length;
      const assignedStaff = new Set(currentAssignments.map((a) => a.staff_id))
        .size;

      return sendSuccess(res, "Curriculum dashboard retrieved", {
        semester: activeSemester,
        department: {
          id: headStaff.department_id,
          name: headStaff.department_name,
        },
        summary: {
          total_courses: totalCourses,
          total_staff: staffList.length,
          assigned_courses: assignedCourses,
          unassigned_courses: totalCourses - assignedCourses,
          assigned_staff: assignedStaff,
          assignment_rate:
            totalCourses > 0
              ? ((assignedCourses / totalCourses) * 100).toFixed(1)
              : 0,
        },
        staff_workload: staffWorkload.sort(
          (a, b) => b.load_percentage - a.load_percentage
        ),
        courses_by_year: coursesByYearSemester,
        current_assignments: currentAssignments,
      });
    } catch (error) {
      console.error("Get curriculum dashboard error:", error);
      return sendError(res, "Failed to retrieve curriculum dashboard", 500);
    }
  }

  // Get courses for assignment with curriculum filters
  static async getCoursesForAssignment(req, res) {
    try {
      const user_id = req.user.user_id;
      const {
        program_id,
        year,
        semester,
        unassigned_only = "true",
        include_assigned_info = "true",
      } = req.query;

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      // Get active semester
      const [activeSemester] = await query(
        "SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1"
      );

      if (!activeSemester) {
        return sendError(res, "No active semester found", 404);
      }

      // Build query to get courses with curriculum info
      let coursesQuery = `
        SELECT
          c.course_id,
          c.course_code,
          c.course_title,
          c.credit_hours,
          c.lecture_hours,
          c.lab_hours,
          c.tutorial_hours,
          COALESCE(cp.year, c.course_year) as curriculum_year,
          COALESCE(cp.semester, c.course_semester) as curriculum_semester,
          p.program_name,
          p.program_id,
          (SELECT COUNT(*) FROM course_assignments ca
           WHERE ca.course_id = c.course_id
           AND ca.semester_id = ?) as assigned_count,
          (SELECT GROUP_CONCAT(CONCAT(sp.first_name, ' ', sp.last_name) SEPARATOR ', ')
           FROM course_assignments ca2
           LEFT JOIN staff_profiles sp ON ca2.staff_id = sp.staff_id
           WHERE ca2.course_id = c.course_id
           AND ca2.semester_id = ?) as assigned_to_names,
          (SELECT GROUP_CONCAT(ca2.status SEPARATOR ', ')
           FROM course_assignments ca2
           WHERE ca2.course_id = c.course_id
           AND ca2.semester_id = ?) as assignment_statuses
        FROM courses c
        LEFT JOIN programs p ON c.program_id = p.program_id
        LEFT JOIN curriculum_plans cp ON c.course_id = cp.course_id AND cp.department_id = c.department_id
        WHERE c.department_id = ?
          AND c.status = 'active'
      `;

      const params = [
        activeSemester.semester_id,
        activeSemester.semester_id,
        activeSemester.semester_id,
        headStaff.department_id,
      ];

      // Apply filters
      if (program_id) {
        coursesQuery += " AND c.program_id = ?";
        params.push(parseInt(program_id));
      }

      if (year) {
        coursesQuery += " AND (cp.year = ? OR c.course_year = ?)";
        params.push(parseInt(year), parseInt(year));
      }

      if (semester) {
        coursesQuery += " AND (cp.semester = ? OR c.course_semester = ?)";
        params.push(parseInt(semester), parseInt(semester));
      }

      if (unassigned_only === "true") {
        coursesQuery += ` AND c.course_id NOT IN (
          SELECT course_id FROM course_assignments
          WHERE semester_id = ? AND status IN ('assigned', 'accepted')
        )`;
        params.push(activeSemester.semester_id);
      }

      coursesQuery +=
        " ORDER BY curriculum_year, curriculum_semester, c.course_code";

      const courses = await query(coursesQuery, params);

      // Get staff for assignment suggestions
      const staffList = await query(
        `SELECT sp.staff_id, sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank
         FROM staff_profiles sp
         LEFT JOIN users u ON sp.user_id = u.user_id
         WHERE sp.department_id = ? AND u.is_active = TRUE
         ORDER BY sp.last_name, sp.first_name`,
        [headStaff.department_id]
      );

      // Enrich courses with suggested staff based on workload
      const enrichedCourses = await Promise.all(
        courses.map(async (course) => {
          // Get staff with available capacity
          const availableStaff = [];

          for (const staff of staffList) {
            const currentLoad =
              await CourseAssignmentController.calculateCurrentWorkload(
                staff.staff_id,
                activeSemester.semester_id
              );

            const rankLimits = await CourseAssignmentController.getRankLimits(
              staff.academic_rank
            );
            const courseLoad = course.credit_hours * 1.5;
            const availableCapacity = rankLimits.max - currentLoad.total_hours;

            if (availableCapacity >= courseLoad) {
              availableStaff.push({
                staff_id: staff.staff_id,
                name: `${staff.first_name} ${staff.last_name}`,
                employee_id: staff.employee_id,
                academic_rank: staff.academic_rank,
                current_load: currentLoad.total_hours,
                available_capacity: availableCapacity,
                suitability_score:
                  CourseAssignmentController.calculateSuitabilityScore(
                    staff,
                    course
                  ),
              });
            }
          }

          // Sort by suitability
          availableStaff.sort(
            (a, b) => b.suitability_score - a.suitability_score
          );

          return {
            ...course,
            course_load: course.credit_hours * 1.5,
            suggested_staff: availableStaff.slice(0, 5), // Top 5 suggestions
            is_assigned: course.assigned_count > 0,
            assignment_info:
              include_assigned_info === "true"
                ? {
                    assigned_to: course.assigned_to_names,
                    statuses: course.assignment_statuses,
                  }
                : null,
          };
        })
      );

      // Group by program for easier filtering
      const coursesByProgram = {};
      enrichedCourses.forEach((course) => {
        const programName = course.program_name || "General Courses";
        if (!coursesByProgram[programName]) {
          coursesByProgram[programName] = {
            program_id: course.program_id,
            program_name: programName,
            courses: [],
            total_courses: 0,
            unassigned_courses: 0,
          };
        }

        coursesByProgram[programName].courses.push(course);
        coursesByProgram[programName].total_courses += 1;
        if (!course.is_assigned) {
          coursesByProgram[programName].unassigned_courses += 1;
        }
      });

      return sendSuccess(res, "Courses for assignment retrieved", {
        semester_id: activeSemester.semester_id,
        department_id: headStaff.department_id,
        filters: {
          program_id: program_id || "All",
          year: year || "All",
          semester: semester || "All",
          unassigned_only: unassigned_only,
        },
        courses_by_program: coursesByProgram,
        total_courses: enrichedCourses.length,
        unassigned_courses: enrichedCourses.filter((c) => !c.is_assigned)
          .length,
        available_staff_count: staffList.length,
      });
    } catch (error) {
      console.error("Get courses for assignment error:", error);
      return sendError(res, "Failed to retrieve courses for assignment", 500);
    }
  }

  // Calculate suitability score for staff-course matching
  static calculateSuitabilityScore(staff, course) {
    // Placeholder implementation - modify based on your criteria
    let score = 50;

    // Adjust score based on rank
    const rankScores = {
      professor: 100,
      associate_professor: 85,
      assistant_professor: 70,
      lecturer: 60,
      assistant_lecturer: 40,
      graduate_assistant: 20,
    };

    if (rankScores[staff.academic_rank]) {
      score = rankScores[staff.academic_rank];
    }

    return score;
  }

  // Create curriculum-based assignment
  static async createCurriculumAssignment(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head") {
        return sendError(res, "Only department heads can assign courses", 403);
      }

      const {
        course_id,
        semester_id,
        staff_id,
        section_code = null,
        notes = null,
        academic_year = null,
        override_warnings = false,
      } = req.body;

      // Validate required fields
      if (!course_id || !semester_id || !staff_id) {
        return sendError(
          res,
          "Course ID, semester ID, and staff ID are required",
          400
        );
      }

      // Get course with curriculum info
      const course = await query(
        `SELECT c.*,
                COALESCE(cp.year, c.course_year) as curriculum_year,
                COALESCE(cp.semester, c.course_semester) as curriculum_semester,
                p.program_name,
                p.program_code
         FROM courses c
         LEFT JOIN programs p ON c.program_id = p.program_id
         LEFT JOIN curriculum_plans cp ON c.course_id = cp.course_id
         WHERE c.course_id = ?`,
        [parseInt(course_id)]
      );

      if (course.length === 0) {
        return sendError(res, "Course not found", 404);
      }

      const courseData = course[0];

      // Get staff
      const staff = await StaffModel.findById(parseInt(staff_id));
      if (!staff) {
        return sendError(res, "Staff member not found", 404);
      }

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      // Verify staff is in same department
      if (staff.department_id !== headStaff.department_id) {
        return sendError(
          res,
          "You can only assign courses to staff in your department",
          403
        );
      }

      // Check if already assigned
      const isAssigned = await CourseAssignmentModel.isCourseAssigned(
        parseInt(course_id),
        parseInt(semester_id),
        parseInt(staff_id)
      );

      if (isAssigned) {
        return sendError(
          res,
          "This course is already assigned to this staff member",
          400
        );
      }

      // Check workload
      const currentLoad =
        await CourseAssignmentController.calculateCurrentWorkload(
          parseInt(staff_id),
          parseInt(semester_id)
        );

      const courseLoad = courseData.credit_hours * 1.5;
      const rankLimits = await CourseAssignmentController.getRankLimits(
        staff.academic_rank
      );

      // Calculate overload warning
      const projectedLoad = currentLoad.total_hours + courseLoad;
      const isOverload = projectedLoad > rankLimits.max;
      const overloadHours = isOverload ? projectedLoad - rankLimits.max : 0;

      // Check if override is needed
      if (isOverload && !override_warnings) {
        return sendError(
          res,
          `Assignment would cause overload by ${overloadHours.toFixed(
            2
          )} hours. ` +
            `Current: ${currentLoad.total_hours.toFixed(2)} hours, ` +
            `Course adds: ${courseLoad.toFixed(2)} hours, ` +
            `Maximum allowed: ${rankLimits.max} hours. ` +
            `Set override_warnings=true to proceed.`,
          400
        );
      }

      // Create assignment with curriculum info
      const assignmentData = {
        course_id: parseInt(course_id),
        semester_id: parseInt(semester_id),
        staff_id: parseInt(staff_id),
        assigned_by: user_id,
        section_code,
        notes:
          notes ||
          `Year ${courseData.curriculum_year || "N/A"}, Semester ${
            courseData.curriculum_semester || "N/A"
          } - ${academic_year || ""}`,
        status: "assigned",
      };

      // Add overload warning to notes if applicable
      if (isOverload) {
        assignmentData.notes += ` [OVERLOAD WARNING: Exceeds limit by ${overloadHours.toFixed(
          2
        )} hours]`;
      }

      const assignment = await CourseAssignmentModel.create(assignmentData);

      // Enrich response with curriculum info
      const enrichedAssignment = {
        ...assignment,
        course_year: courseData.curriculum_year,
        course_semester: courseData.curriculum_semester,
        program_name: courseData.program_name,
        program_code: courseData.program_code,
        staff_name: `${staff.first_name} ${staff.last_name}`,
        staff_rank: staff.academic_rank,
        workload_info: {
          previous_load: currentLoad.total_hours,
          course_load: courseLoad,
          new_total: projectedLoad,
          max_allowed: rankLimits.max,
          is_overload: isOverload,
          overload_hours: overloadHours,
        },
      };

      return sendSuccess(
        res,
        isOverload
          ? "Course assigned with overload warning"
          : "Course assigned successfully",
        enrichedAssignment,
        201
      );
    } catch (error) {
      console.error("Create curriculum assignment error:", error);
      return sendError(res, "Failed to assign course", 500);
    }
  }

  // Batch assign multiple courses
  static async batchAssignCourses(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head") {
        return sendError(res, "Only department heads can assign courses", 403);
      }

      const { assignments, semester_id, override_warnings = false } = req.body;

      if (
        !assignments ||
        !Array.isArray(assignments) ||
        assignments.length === 0
      ) {
        return sendError(res, "Assignments array is required", 400);
      }

      if (!semester_id) {
        return sendError(res, "Semester ID is required", 400);
      }

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      const results = {
        successful: [],
        failed: [],
      };

      // Process each assignment
      for (const assignment of assignments) {
        try {
          const {
            course_id,
            staff_id,
            section_code = null,
            notes = null,
          } = assignment;

          // Validate required fields
          if (!course_id || !staff_id) {
            results.failed.push({
              course_id,
              staff_id,
              error: "Course ID and Staff ID are required",
            });
            continue;
          }

          // Check if course exists and belongs to department
          const [course] = await query(
            `SELECT c.* FROM courses c
             WHERE c.course_id = ? AND c.department_id = ?`,
            [parseInt(course_id), headStaff.department_id]
          );

          if (!course) {
            results.failed.push({
              course_id,
              staff_id,
              error: "Course not found or not in your department",
            });
            continue;
          }

          // Check if staff exists and belongs to department
          const staff = await StaffModel.findById(parseInt(staff_id));
          if (!staff || staff.department_id !== headStaff.department_id) {
            results.failed.push({
              course_id,
              staff_id,
              error: "Staff not found or not in your department",
            });
            continue;
          }

          // Check if already assigned
          const isAssigned = await CourseAssignmentModel.isCourseAssigned(
            parseInt(course_id),
            parseInt(semester_id),
            parseInt(staff_id)
          );

          if (isAssigned) {
            results.failed.push({
              course_id,
              staff_id,
              error: "Course already assigned to this staff member",
            });
            continue;
          }

          // Check workload
          const currentLoad =
            await CourseAssignmentController.calculateCurrentWorkload(
              parseInt(staff_id),
              parseInt(semester_id)
            );

          const courseLoad = course.credit_hours * 1.5;
          const rankLimits = await CourseAssignmentController.getRankLimits(
            staff.academic_rank
          );
          const projectedLoad = currentLoad.total_hours + courseLoad;

          if (projectedLoad > rankLimits.max && !override_warnings) {
            results.failed.push({
              course_id,
              staff_id,
              error: `Assignment would cause overload by ${(
                projectedLoad - rankLimits.max
              ).toFixed(2)} hours`,
            });
            continue;
          }

          // Create assignment
          const assignmentResult = await CourseAssignmentModel.create({
            course_id: parseInt(course_id),
            semester_id: parseInt(semester_id),
            staff_id: parseInt(staff_id),
            assigned_by: user_id,
            section_code,
            notes: notes || `Batch assignment`,
            status: "assigned",
          });

          results.successful.push({
            assignment_id: assignmentResult.assignment_id,
            course_id,
            staff_id,
            course_code: course.course_code,
            course_title: course.course_title,
            staff_name: `${staff.first_name} ${staff.last_name}`,
            workload_info: {
              previous_load: currentLoad.total_hours,
              new_load: projectedLoad,
              max_allowed: rankLimits.max,
            },
          });
        } catch (error) {
          results.failed.push({
            course_id: assignment.course_id,
            staff_id: assignment.staff_id,
            error: error.message,
          });
        }
      }

      return sendSuccess(res, "Batch assignment completed", {
        total_attempted: assignments.length,
        successful_count: results.successful.length,
        failed_count: results.failed.length,
        ...results,
      });
    } catch (error) {
      console.error("Batch assign courses error:", error);
      return sendError(res, "Failed to process batch assignment", 500);
    }
  }

  // Import curriculum from CSV data
  static async importCurriculum(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head" && user_role !== "admin") {
        return sendError(
          res,
          "Only department heads and admins can import curriculum",
          403
        );
      }

      const {
        department_id,
        program_id,
        curriculum_data,
        replace_existing = false,
      } = req.body;

      if (!curriculum_data || !Array.isArray(curriculum_data)) {
        return sendError(res, "Curriculum data array is required", 400);
      }

      // Get department ID
      let targetDepartmentId = department_id;
      if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        if (headStaff) {
          targetDepartmentId = headStaff.department_id;
        }
      }

      if (!targetDepartmentId) {
        return sendError(res, "Department ID is required", 400);
      }

      // Check if department exists
      const department = await DepartmentModel.findById(targetDepartmentId);
      if (!department) {
        return sendError(res, "Department not found", 404);
      }

      // Check if program exists if provided
      if (program_id) {
        const program = await ProgramModel.findById(parseInt(program_id));
        if (!program || program.department_id !== targetDepartmentId) {
          return sendError(res, "Program not found or not in department", 404);
        }
      }

      const results = {
        created_courses: [],
        created_plans: [],
        updated_courses: [],
        errors: [],
      };

      // Delete existing curriculum if replace_existing is true
      if (replace_existing) {
        await CurriculumPlanModel.deleteByDepartmentAndProgram(
          targetDepartmentId,
          program_id || null
        );
      }

      // Process each curriculum item
      for (const item of curriculum_data) {
        try {
          const {
            course_code,
            course_title,
            credit_hours,
            lecture_hours,
            lab_hours = 0,
            tutorial_hours = 0,
            year,
            semester,
            is_core = true,
            prerequisites = null,
            program_type = "regular",
            max_students = 60,
            min_students = 15,
          } = item;

          // Validate required fields
          if (
            !course_code ||
            !course_title ||
            !credit_hours ||
            !lecture_hours ||
            !year ||
            !semester
          ) {
            results.errors.push({
              item,
              error:
                "Missing required fields: course_code, course_title, credit_hours, lecture_hours, year, semester",
            });
            continue;
          }

          // Check if course exists
          let course = await CourseModel.findByCode(course_code);

          if (!course) {
            // Create new course
            course = await CourseModel.create({
              course_code,
              course_title,
              department_id: targetDepartmentId,
              program_id: program_id || null,
              credit_hours: parseFloat(credit_hours),
              lecture_hours: parseFloat(lecture_hours),
              lab_hours: parseFloat(lab_hours),
              tutorial_hours: parseFloat(tutorial_hours),
              program_type,
              course_year: parseInt(year),
              course_semester: parseInt(semester),
              is_core_course: is_core,
              prerequisites,
              max_students,
              min_students,
              status: "active",
            });
            results.created_courses.push(course.course_code);
          } else {
            // Update existing course with year/semester
            await CourseModel.update(course.course_id, {
              course_year: parseInt(year),
              course_semester: parseInt(semester),
              is_core_course: is_core,
              prerequisites,
            });
            results.updated_courses.push(course.course_code);
          }

          // Create curriculum plan
          const plan = await CurriculumPlanModel.create({
            department_id: targetDepartmentId,
            program_id: program_id || null,
            year: parseInt(year),
            semester: parseInt(semester),
            course_id: course.course_id,
            is_core,
            is_elective: !is_core,
            prerequisites,
          });

          results.created_plans.push({
            course_code,
            year,
            semester,
            plan_id: plan.plan_id,
          });
        } catch (error) {
          results.errors.push({
            item,
            error: error.message,
          });
        }
      }

      return sendSuccess(res, "Curriculum imported successfully", {
        department_id: targetDepartmentId,
        program_id: program_id || null,
        summary: {
          total_items: curriculum_data.length,
          created_courses: results.created_courses.length,
          updated_courses: results.updated_courses.length,
          created_plans: results.created_plans.length,
          errors: results.errors.length,
        },
        details: results,
      });
    } catch (error) {
      console.error("Import curriculum error:", error);
      return sendError(res, "Failed to import curriculum", 500);
    }
  }

  // Get available years and semesters for department
  static async getAvailableYearsSemesters(req, res) {
    try {
      const user_id = req.user.user_id;
      const { program_id } = req.query;

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      // Get years and semesters from curriculum_plans
      const curriculumData = await query(
        `SELECT DISTINCT
          COALESCE(cp.year, c.course_year) as year,
          COALESCE(cp.semester, c.course_semester) as semester
         FROM courses c
         LEFT JOIN curriculum_plans cp ON c.course_id = cp.course_id
         WHERE c.department_id = ?
           AND c.status = 'active'
           AND (? IS NULL OR c.program_id = ?)
         ORDER BY year, semester`,
        [headStaff.department_id, program_id, program_id]
      );

      // Group by year
      const yearsMap = {};
      curriculumData.forEach((item) => {
        const year = item.year;
        if (year) {
          if (!yearsMap[year]) {
            yearsMap[year] = new Set();
          }
          if (item.semester) {
            yearsMap[year].add(item.semester);
          }
        }
      });

      // Convert to array format
      const years = Object.keys(yearsMap)
        .map((year) => ({
          year: parseInt(year),
          semesters: Array.from(yearsMap[year]).sort(),
        }))
        .sort((a, b) => a.year - b.year);

      return sendSuccess(res, "Available years and semesters retrieved", {
        department_id: headStaff.department_id,
        program_id: program_id || "All",
        years: years,
        total_years: years.length,
      });
    } catch (error) {
      console.error("Get available years semesters error:", error);
      return sendError(
        res,
        "Failed to retrieve available years and semesters",
        500
      );
    }
  }

  // Create assignment with all required fields - UPDATED
  static async createAssignment(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head") {
        return sendError(res, "Only department heads can assign courses", 403);
      }

      const {
        course_id,
        semester_id,
        staff_id,
        program_type = "regular",
        student_year = null,
        section_code = null,
        notes = null,
        confirm_overload = false,
      } = req.body;

      // Validate required fields
      if (!course_id || !semester_id || !staff_id) {
        return sendError(
          res,
          "Course ID, semester ID, and staff ID are required",
          400
        );
      }

      // Validate student year if provided
      if (student_year && (student_year < 1 || student_year > 7)) {
        return sendError(res, "Student year must be between 1 and 7", 400);
      }

      // Validate program type
      const validProgramTypes = [
        "regular",
        "extension",
        "weekend",
        "summer",
        "distance",
      ];
      if (program_type && !validProgramTypes.includes(program_type)) {
        return sendError(res, "Invalid program type", 400);
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

      // Check if staff exists and belongs to department head's department
      const staff = await StaffModel.findById(parseInt(staff_id));
      if (!staff) {
        return sendError(res, "Staff member not found", 404);
      }

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      if (staff.department_id !== headStaff.department_id) {
        return sendError(
          res,
          "You can only assign courses to staff in your department",
          403
        );
      }

      // Check if course is already assigned to this staff in this semester
      const isAssigned = await CourseAssignmentModel.isCourseAssigned(
        parseInt(course_id),
        parseInt(semester_id),
        parseInt(staff_id)
      );
      if (isAssigned) {
        return sendError(
          res,
          "This course is already assigned to this staff member for this semester",
          400
        );
      }

      // Calculate current workload
      const currentLoad =
        await CourseAssignmentController.calculateCurrentWorkload(
          parseInt(staff_id),
          parseInt(semester_id)
        );

      const courseLoad = course.credit_hours * 1.5; // Estimated load factor
      const rankLimits = await CourseAssignmentController.getRankLimits(
        staff.academic_rank
      );
      const projectedTotal = currentLoad.total_hours + courseLoad;
      const overloadHours = Math.max(0, projectedTotal - rankLimits.max);
      const isOverload = overloadHours > 0;
      const overloadPercentage = (overloadHours / rankLimits.max) * 100;

      // If overload detected and not confirmed, return detailed warning
      if (isOverload && !confirm_overload) {
        const overloadReport = {
          staff_info: {
            name: `${staff.first_name} ${staff.last_name}`,
            employee_id: staff.employee_id,
            academic_rank: CourseAssignmentController.formatAcademicRank(
              staff.academic_rank
            ),
          },
          course_info: {
            code: course.course_code,
            title: course.course_title,
            credit_hours: course.credit_hours,
            semester: semester.semester_name,
            program_type: program_type,
            student_year: student_year,
          },
          workload_analysis: {
            current_total: currentLoad.total_hours,
            new_course_load: courseLoad,
            projected_total: projectedTotal,
            rank_limit: rankLimits.max,
            available_before: Math.max(
              0,
              rankLimits.max - currentLoad.total_hours
            ),
            overload_hours: overloadHours,
            overload_percentage: overloadPercentage.toFixed(1),
          },
          risk_assessment: {
            level: CourseAssignmentController.getRiskLevel(overloadPercentage),
            description:
              CourseAssignmentController.getRiskDescription(overloadPercentage),
            requires_approval: overloadPercentage > 15,
          },
        };

        return sendError(
          res,
          {
            title: "⚠️ Overload Warning",
            message: "Course assignment would exceed workload limits",
            details: overloadReport,
            requires_confirmation: true,
            confirmation_field: "confirm_overload",
          },
          400
        );
      }

      // Create assignment with all fields
      const assignmentData = {
        course_id: parseInt(course_id),
        semester_id: parseInt(semester_id),
        staff_id: parseInt(staff_id),
        assigned_by: user_id,
        student_year: student_year,
        section_code,
        notes:
          notes ||
          CourseAssignmentController.generateAssignmentNotes({
            course,
            semester,
            program_type,
            student_year,
            isOverload,
            overloadHours,
          }),
        status: "assigned",
      };

      const assignment = await CourseAssignmentModel.create(assignmentData);

      // Send notifications
      await CourseAssignmentController.sendAssignmentNotifications({
        assignment,
        staff,
        course,
        semester,
        program_type,
        student_year,
        isOverload,
        overloadHours,
        department_head_id: user_id,
      });

      return sendSuccess(
        res,
        isOverload
          ? `✅ Course assigned successfully with overload (${overloadHours.toFixed(
              1
            )} hours above limit)`
          : "✅ Course assigned successfully",
        {
          assignment,
          details: {
            course_code: course.course_code,
            course_title: course.course_title,
            staff_name: `${staff.first_name} ${staff.last_name}`,
            semester: semester.semester_name,
            program_type: program_type,
            student_year: student_year,
            section_code: section_code,
          },
          workload_summary: {
            before_assignment: currentLoad.total_hours,
            course_added: courseLoad,
            after_assignment: projectedTotal,
            rank_limit: rankLimits.max,
            overload_hours: overloadHours,
            is_within_limits: !isOverload,
          },
        },
        201
      );
    } catch (error) {
      console.error("Create assignment error:", error);
      return sendError(res, "Failed to assign course", 500);
    }
  }

  // Get courses with filters for assignment form - NEW METHOD
  static async getCoursesForAssignmentForm(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head") {
        return sendError(
          res,
          "Only department heads can access this data",
          403
        );
      }

      const {
        program_type,
        student_year,
        semester_id,
        department_id,
        search = "",
        page = 1,
        limit = 20,
      } = req.query;

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      const targetDeptId = department_id || headStaff.department_id;

      // Build query for courses
      let coursesQuery = `
        SELECT 
          c.course_id,
          c.course_code,
          c.course_title,
          c.credit_hours,
          c.lecture_hours,
          c.lab_hours,
          c.tutorial_hours,
          c.program_type,
          c.course_year,
          c.course_semester,
          p.program_name,
          p.program_code,
          (SELECT COUNT(*) FROM course_assignments ca 
           WHERE ca.course_id = c.course_id 
           AND ca.semester_id = ?) as assignment_count
        FROM courses c
        LEFT JOIN programs p ON c.program_id = p.program_id
        WHERE c.department_id = ?
          AND c.status = 'active'
      `;

      const params = [semester_id || null, targetDeptId];

      // Apply filters
      if (program_type) {
        coursesQuery += " AND c.program_type = ?";
        params.push(program_type);
      }

      if (student_year) {
        coursesQuery += " AND c.course_year = ?";
        params.push(parseInt(student_year));
      }

      if (search) {
        coursesQuery += " AND (c.course_code LIKE ? OR c.course_title LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      // Add pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      coursesQuery +=
        " ORDER BY c.course_year, c.course_semester, c.course_code";
      coursesQuery += " LIMIT ? OFFSET ?";
      params.push(parseInt(limit), offset);

      const courses = await query(coursesQuery, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM courses c
        WHERE c.department_id = ? AND c.status = 'active'
      `;
      const countParams = [targetDeptId];

      if (program_type) {
        countQuery += " AND c.program_type = ?";
        countParams.push(program_type);
      }

      if (student_year) {
        countQuery += " AND c.course_year = ?";
        countParams.push(parseInt(student_year));
      }

      if (search) {
        countQuery += " AND (c.course_code LIKE ? OR c.course_title LIKE ?)";
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const [countResult] = await query(countQuery, countParams);

      // Get available semesters
      const semesters = await query(
        `SELECT semester_id, semester_name, semester_code, semester_type 
         FROM semesters 
         WHERE is_active = TRUE OR semester_id = ?
         ORDER BY start_date DESC`,
        [semester_id || null]
      );

      return sendSuccess(res, "Courses retrieved successfully", {
        courses,
        semesters,
        filters: {
          program_type: program_type || "All",
          student_year: student_year || "All",
          semester_id: semester_id || "Active",
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get courses for assignment form error:", error);
      return sendError(res, "Failed to retrieve courses", 500);
    }
  }

  // Get instructors for assignment form - NEW METHOD
  static async getInstructorsForAssignment(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head") {
        return sendError(
          res,
          "Only department heads can access this data",
          403
        );
      }

      const {
        semester_id,
        available_only = "true",
        academic_rank,
        search = "",
        page = 1,
        limit = 20,
      } = req.query;

      // Get department head's department
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      // Get active semester if not specified
      let targetSemesterId = semester_id;
      if (!targetSemesterId) {
        const [currentSemester] = await query(
          "SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1"
        );
        targetSemesterId = currentSemester?.semester_id;
      }

      // Build query for instructors
      let instructorsQuery = `
        SELECT 
          sp.staff_id,
          sp.employee_id,
          sp.first_name,
          sp.last_name,
          sp.academic_rank,
          sp.employment_type,
          u.email,
          u.username
        FROM staff_profiles sp
        LEFT JOIN users u ON sp.user_id = u.user_id
        WHERE sp.department_id = ?
          AND u.is_active = TRUE
      `;

      const params = [headStaff.department_id];

      if (academic_rank) {
        instructorsQuery += " AND sp.academic_rank = ?";
        params.push(academic_rank);
      }

      if (search) {
        instructorsQuery +=
          " AND (sp.first_name LIKE ? OR sp.last_name LIKE ? OR sp.employee_id LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Add pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      instructorsQuery += " ORDER BY sp.last_name, sp.first_name";
      instructorsQuery += " LIMIT ? OFFSET ?";
      params.push(parseInt(limit), offset);

      const instructors = await query(instructorsQuery, params);

      // Calculate workload for each instructor if semester is specified
      let instructorsWithWorkload = [];
      if (targetSemesterId && available_only === "true") {
        for (const instructor of instructors) {
          const currentLoad =
            await CourseAssignmentController.calculateCurrentWorkload(
              instructor.staff_id,
              targetSemesterId
            );

          const rankLimits = await CourseAssignmentController.getRankLimits(
            instructor.academic_rank
          );

          const availableHours = Math.max(
            0,
            rankLimits.max - currentLoad.total_hours
          );
          const loadPercentage =
            (currentLoad.total_hours / rankLimits.max) * 100;

          instructorsWithWorkload.push({
            ...instructor,
            workload: {
              current_hours: currentLoad.total_hours,
              max_hours: rankLimits.max,
              available_hours: availableHours,
              load_percentage: loadPercentage.toFixed(1),
              status:
                CourseAssignmentController.getWorkloadStatus(loadPercentage),
              is_available: availableHours > 3, // At least 3 hours available
            },
          });
        }

        // Filter to only available instructors
        if (available_only === "true") {
          instructorsWithWorkload = instructorsWithWorkload.filter(
            (inst) => inst.workload.is_available
          );
        }
      } else {
        instructorsWithWorkload = instructors.map((inst) => ({
          ...inst,
          workload: null,
        }));
      }

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM staff_profiles sp
        LEFT JOIN users u ON sp.user_id = u.user_id
        WHERE sp.department_id = ? AND u.is_active = TRUE
      `;
      const countParams = [headStaff.department_id];

      if (academic_rank) {
        countQuery += " AND sp.academic_rank = ?";
        countParams.push(academic_rank);
      }

      if (search) {
        countQuery +=
          " AND (sp.first_name LIKE ? OR sp.last_name LIKE ? OR sp.employee_id LIKE ?)";
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const [countResult] = await query(countQuery, countParams);

      return sendSuccess(res, "Instructors retrieved successfully", {
        instructors: instructorsWithWorkload,
        semester_id: targetSemesterId,
        filters: {
          available_only: available_only === "true",
          academic_rank: academic_rank || "All",
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get instructors for assignment error:", error);
      return sendError(res, "Failed to retrieve instructors", 500);
    }
  }

  // Get program types - NEW METHOD
  static async getProgramTypes(req, res) {
    try {
      const programTypes = [
        { value: "regular", label: "Regular Program" },
        { value: "extension", label: "Extension Program" },
        { value: "weekend", label: "Weekend Program" },
        { value: "summer", label: "Summer Program" },
        { value: "distance", label: "Distance Education" },
      ];

      return sendSuccess(res, "Program types retrieved", programTypes);
    } catch (error) {
      console.error("Get program types error:", error);
      return sendError(res, "Failed to retrieve program types", 500);
    }
  }

  // Get student years - NEW METHOD
  static async getStudentYears(req, res) {
    try {
      const studentYears = [];
      for (let i = 1; i <= 7; i++) {
        studentYears.push({
          value: i,
          label: `Year ${i}`,
        });
      }

      return sendSuccess(res, "Student years retrieved", studentYears);
    } catch (error) {
      console.error("Get student years error:", error);
      return sendError(res, "Failed to retrieve student years", 500);
    }
  }

  // Get available sections for a course - NEW METHOD
  static async getAvailableSections(req, res) {
    try {
      const { course_id, semester_id } = req.query;

      if (!course_id || !semester_id) {
        return sendError(res, "Course ID and semester ID are required", 400);
      }

      // Get existing sections for the course in the semester
      const existingSections = await query(
        `SELECT section_code 
         FROM course_assignments 
         WHERE course_id = ? AND semester_id = ? AND status IN ('assigned', 'accepted')
         ORDER BY section_code`,
        [parseInt(course_id), parseInt(semester_id)]
      );

      // Generate available sections (A-Z)
      const allSections = Array.from({ length: 26 }, (_, i) =>
        String.fromCharCode(65 + i)
      );

      const usedSections = existingSections.map((s) => s.section_code);
      const availableSections = allSections.filter(
        (section) => !usedSections.includes(section)
      );

      return sendSuccess(res, "Available sections retrieved", {
        available: availableSections,
        used: usedSections,
        suggested: availableSections.slice(0, 5), // First 5 available
      });
    } catch (error) {
      console.error("Get available sections error:", error);
      return sendError(res, "Failed to retrieve available sections", 500);
    }
  }

  // Update assignment with all fields - UPDATED
  static async updateAssignment(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;
      const { id } = req.params;
      const { student_year, section_code, notes, status, program_type } =
        req.body;

      if (!id) {
        return sendError(res, "Assignment ID is required", 400);
      }

      const assignment = await CourseAssignmentModel.findById(parseInt(id));
      if (!assignment) {
        return sendError(res, "Assignment not found", 404);
      }

      // Check permissions
      let canUpdate = false;

      if (user_role === "admin") {
        canUpdate = true;
      } else if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        const staff = await StaffModel.findById(assignment.staff_id);
        canUpdate = headStaff?.department_id === staff?.department_id;
      } else if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        canUpdate = staff?.staff_id === assignment.staff_id;
      }

      if (!canUpdate) {
        return sendError(
          res,
          "You are not authorized to update this assignment",
          403
        );
      }

      // Validate student year if provided
      if (student_year && (student_year < 1 || student_year > 7)) {
        return sendError(res, "Student year must be between 1 and 7", 400);
      }

      // Prepare update data
      const updateData = {};
      if (student_year !== undefined) updateData.student_year = student_year;
      if (section_code !== undefined) updateData.section_code = section_code;
      if (notes !== undefined) updateData.notes = notes;

      if (program_type !== undefined) {
        // Note: program_type is stored in courses table, not assignments
        // We can update the course's program_type if needed
        const validProgramTypes = [
          "regular",
          "extension",
          "weekend",
          "summer",
          "distance",
        ];
        if (validProgramTypes.includes(program_type)) {
          // Update course program_type
          await CourseModel.update(assignment.course_id, {
            program_type: program_type,
          });
        }
      }

      if (status !== undefined) {
        const validTransitions = {
          assigned: ["accepted", "declined", "withdrawn"],
          accepted: ["withdrawn"],
          declined: ["assigned"],
          withdrawn: ["assigned"],
        };

        if (validTransitions[assignment.status]?.includes(status)) {
          updateData.status = status;
        } else {
          return sendError(
            res,
            `Invalid status transition from ${assignment.status} to ${status}`,
            400
          );
        }
      }

      if (Object.keys(updateData).length === 0) {
        return sendError(res, "No valid fields to update", 400);
      }

      // Update assignment
      const updatedAssignment = await CourseAssignmentModel.update(
        parseInt(id),
        updateData
      );

      return sendSuccess(
        res,
        "Assignment updated successfully",
        updatedAssignment
      );
    } catch (error) {
      console.error("Update assignment error:", error);
      return sendError(res, "Failed to update assignment", 500);
    }
  }

  // In your CourseAssignmentController.js, update the getAssignmentFormData method:
  static async getAssignmentFormData(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (user_role !== "department_head") {
        return sendError(
          res,
          "Only department heads can access this data",
          403
        );
      }

      // Get department head's department info
      const headStaff = await StaffModel.findByUserId(user_id);
      if (!headStaff) {
        return sendError(res, "Department head profile not found", 404);
      }

      // Get semesters
      const semesters = await query(
        `SELECT semester_id, semester_name, semester_code, semester_type, start_date, end_date, is_active 
       FROM semesters 
       WHERE start_date <= CURDATE() OR end_date >= CURDATE()
       ORDER BY start_date DESC LIMIT 10`
      );

      // Get active semester
      const [currentSemester] = await query(
        "SELECT semester_id, semester_name, semester_code FROM semesters WHERE is_active = TRUE LIMIT 1"
      );

      // Get academic ranks
      const academicRanks = await query(
        "SELECT DISTINCT academic_rank FROM staff_profiles ORDER BY academic_rank"
      );

      // Get department info
      const [departmentInfo] = await query(
        "SELECT department_id, department_name, department_code FROM departments WHERE department_id = ?",
        [headStaff.department_id]
      );

      // Get staff count in department
      const [staffCount] = await query(
        `SELECT COUNT(*) as count FROM staff_profiles sp 
       LEFT JOIN users u ON sp.user_id = u.user_id 
       WHERE sp.department_id = ? AND u.is_active = TRUE`,
        [headStaff.department_id]
      );

      // Get program types
      const programTypes = [
        { value: "regular", label: "Regular Program", icon: "school" },
        { value: "extension", label: "Extension Program", icon: "extension" },
        { value: "summer", label: "Summer Program", icon: "wb_sunny" },
        { value: "distance", label: "Distance Education", icon: "computer" },
        { value: "weekend", label: "Weekend Program", icon: "weekend" },
      ];

      // Student years 1-7
      const studentYears = Array.from({ length: 7 }, (_, i) => ({
        value: i + 1,
        label: `Year ${i + 1}`,
      }));

      return sendSuccess(res, "Assignment form data retrieved", {
        program_types: programTypes,
        student_years: studentYears,
        semesters: semesters || [],
        academic_ranks: academicRanks.map((r) => r.academic_rank) || [],
        department: departmentInfo,
        current_semester:
          currentSemester || (semesters && semesters[0]) || null,
        summary: {
          department_id: headStaff.department_id,
          staff_count: staffCount?.count || 0,
        },
        last_updated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get assignment form data error:", error);
      return sendError(
        res,
        "Failed to retrieve form data. Please try again later.",
        500
      );
    }
  }
  // Calculate current workload for staff - UPDATED
  static async calculateCurrentWorkload(staffId, semesterId) {
    try {
      // Get accepted assignments
      const acceptedAssignments = await query(
        `SELECT ca.*, c.credit_hours, c.program_type
         FROM course_assignments ca
         LEFT JOIN courses c ON ca.course_id = c.course_id
         WHERE ca.staff_id = ? AND ca.semester_id = ? AND ca.status = 'accepted'`,
        [staffId, semesterId]
      );

      // Calculate total hours (using credit hours * load factor)
      let totalHours = 0;
      const assignedCourses = [];

      for (const assignment of acceptedAssignments) {
        const courseLoad = assignment.credit_hours * 1.5; // Load factor of 1.5
        totalHours += courseLoad;
        assignedCourses.push({
          course_id: assignment.course_id,
          course_code: assignment.course_code,
          credit_hours: assignment.credit_hours,
          program_type: assignment.program_type,
          estimated_load: courseLoad,
        });
      }

      // Add existing workload RP hours
      const [workloadRP] = await query(
        `SELECT COALESCE(SUM(total_load), 0) as rp_hours
         FROM workload_rp 
         WHERE staff_id = ? AND semester_id = ? AND status NOT IN ('rejected', 'draft')`,
        [staffId, semesterId]
      );

      const rpHours = parseFloat(workloadRP.rp_hours || 0);
      totalHours += rpHours;

      return {
        total_hours: totalHours,
        assigned_courses: assignedCourses,
        assignment_count: acceptedAssignments.length,
        rp_hours: rpHours,
      };
    } catch (error) {
      console.error("Calculate current workload error:", error);
      return {
        total_hours: 0,
        assigned_courses: [],
        assignment_count: 0,
        rp_hours: 0,
      };
    }
  }

  // Get detailed workload for a staff member - UPDATED
  static async getStaffWorkload(req, res) {
    try {
      const { id } = req.params;
      const { semester_id } = req.query;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Check permissions
      let canView = false;
      const staff = await StaffModel.findById(parseInt(id));

      if (!staff) {
        return sendError(res, "Staff member not found", 404);
      }

      if (user_role === "admin") {
        canView = true;
      } else if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        canView = headStaff?.department_id === staff.department_id;
      } else if (user_role === "instructor") {
        const userStaff = await StaffModel.findByUserId(user_id);
        canView = userStaff?.staff_id === parseInt(id);
      }

      if (!canView) {
        return sendError(
          res,
          "You are not authorized to view this workload",
          403
        );
      }

      // Get active semester if not specified
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

      const currentLoad =
        await CourseAssignmentController.calculateCurrentWorkload(
          parseInt(id),
          targetSemesterId
        );

      const rankLimits = await CourseAssignmentController.getRankLimits(
        staff.academic_rank
      );
      const loadPercentage = (currentLoad.total_hours / rankLimits.max) * 100;
      const overloadHours = Math.max(
        0,
        currentLoad.total_hours - rankLimits.max
      );

      const [semesterInfo] = await query(
        "SELECT semester_name, semester_code, semester_type FROM semesters WHERE semester_id = ?",
        [targetSemesterId]
      );

      // Get assignments with details
      const assignments = await query(
        `SELECT ca.*,
                c.course_code, c.course_title, c.credit_hours, c.program_type,
                s.semester_name, s.semester_type
         FROM course_assignments ca
         LEFT JOIN courses c ON ca.course_id = c.course_id
         LEFT JOIN semesters s ON ca.semester_id = s.semester_id
         WHERE ca.staff_id = ? AND ca.semester_id = ?
         ORDER BY c.program_type, ca.student_year`,
        [parseInt(id), targetSemesterId]
      );

      // Group assignments by program type
      const assignmentsByProgramType = {};
      assignments.forEach((assignment) => {
        const programType = assignment.program_type || "regular";
        if (!assignmentsByProgramType[programType]) {
          assignmentsByProgramType[programType] = [];
        }
        assignmentsByProgramType[programType].push(assignment);
      });

      const workloadData = {
        staff_info: {
          staff_id: staff.staff_id,
          name: `${staff.first_name} ${staff.last_name}`,
          employee_id: staff.employee_id,
          academic_rank: staff.academic_rank,
          formatted_rank: CourseAssignmentController.formatAcademicRank(
            staff.academic_rank
          ),
          department_id: staff.department_id,
        },
        semester_info: {
          semester_id: targetSemesterId,
          semester_name: semesterInfo?.semester_name,
          semester_code: semesterInfo?.semester_code,
          semester_type: semesterInfo?.semester_type,
        },
        limits: {
          rank_min: rankLimits.min,
          rank_max: rankLimits.max,
        },
        current_workload: {
          total_hours: currentLoad.total_hours,
          load_percentage: loadPercentage.toFixed(1),
          overload_hours: overloadHours,
          is_overloaded: overloadHours > 0,
          status: CourseAssignmentController.getWorkloadStatus(loadPercentage),
          status_color:
            CourseAssignmentController.getStatusColor(loadPercentage),
        },
        assignments: assignments,
        assignments_by_program_type: assignmentsByProgramType,
        summary: {
          total_assignments: assignments.length,
          by_program_type: Object.keys(assignmentsByProgramType).map(
            (type) => ({
              program_type: type,
              count: assignmentsByProgramType[type].length,
            })
          ),
        },
        capacity: {
          available_hours: Math.max(
            0,
            rankLimits.max - currentLoad.total_hours
          ),
          available_percentage: Math.max(0, 100 - loadPercentage).toFixed(1),
          can_take_more: currentLoad.total_hours < rankLimits.max * 0.8,
        },
        last_updated: new Date().toISOString(),
      };

      return sendSuccess(
        res,
        "Workload analysis retrieved successfully",
        workloadData
      );
    } catch (error) {
      console.error("Get staff workload error:", error);
      return sendError(res, "Failed to retrieve workload analysis", 500);
    }
  }

  // Generate assignment notes - UPDATED
  static generateAssignmentNotes(data) {
    const {
      course,
      semester,
      program_type,
      student_year,
      isOverload,
      overloadHours,
    } = data;

    let notes = `Assigned to teach ${course.course_code} for ${semester.semester_name}`;

    if (program_type && program_type !== "regular") {
      notes += ` (${program_type} program)`;
    }

    if (student_year) {
      notes += ` - Year ${student_year} students`;
    }

    if (isOverload) {
      notes += ` [OVERLOAD: ${overloadHours.toFixed(1)} hours beyond limit]`;
    }

    return notes;
  }

  // Send assignment notifications - UPDATED
  static async sendAssignmentNotifications(data) {
    const {
      assignment,
      staff,
      course,
      semester,
      program_type,
      student_year,
      isOverload,
      overloadHours,
      department_head_id,
    } = data;

    let message = "";
    if (isOverload) {
      message = `⚠️ Overload Assignment: ${
        course.course_code
      } assigned with ${overloadHours.toFixed(1)} hours overload`;
    } else {
      message = `📋 New Course Assignment: ${course.course_code}`;
    }

    // Add details
    let details = `You have been assigned to teach ${course.course_code} - ${course.course_title}`;
    details += ` for ${semester.semester_name}`;
    if (program_type && program_type !== "regular") {
      details += ` (${program_type} program)`;
    }
    if (student_year) {
      details += ` for Year ${student_year} students`;
    }
    if (assignment.section_code) {
      details += ` - Section ${assignment.section_code}`;
    }

    if (isOverload) {
      details += `\n⚠️ Note: This is an overload assignment (${overloadHours.toFixed(
        1
      )} hours above your limit).`;
    }

    // Notify staff
    await CourseAssignmentController.createNotification(
      staff.user_id,
      message,
      details,
      isOverload ? "overload_assignment" : "new_assignment"
    );

    // Log in audit log
    await query(
      `INSERT INTO audit_log 
       (user_id, action, entity, entity_id, old_value, new_value) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        department_head_id,
        "course_assignment",
        "course_assignments",
        assignment.assignment_id,
        null,
        JSON.stringify({
          staff_id: staff.staff_id,
          course_id: course.course_id,
          program_type: program_type,
          student_year: student_year,
          section_code: assignment.section_code,
          is_overload: isOverload,
        }),
      ]
    );
  }

  // ==================== HELPER METHODS ====================

  // Get rank limits with proper defaults
  static async getRankLimits(academicRank) {
    try {
      // Try to get from database first
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

      // Default limits if not found in database
      const defaultLimits = {
        graduate_assistant: { min: 12, max: 16 },
        assistant_lecturer: { min: 10, max: 14 },
        lecturer: { min: 8, max: 12 },
        assistant_professor: { min: 6, max: 10 },
        associate_professor: { min: 4, max: 8 },
        professor: { min: 4, max: 6 },
      };

      const defaults = defaultLimits[academicRank] || { min: 8, max: 12 };

      return {
        min: minRule ? parseFloat(minRule.rule_value) : defaults.min,
        max: maxRule ? parseFloat(maxRule.rule_value) : defaults.max,
      };
    } catch (error) {
      console.error("Get rank limits error:", error);
      // Fallback to hardcoded defaults
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

  // Format academic rank
  static formatAcademicRank(rank) {
    const rankMap = {
      graduate_assistant: "Graduate Assistant",
      assistant_lecturer: "Assistant Lecturer",
      lecturer: "Lecturer",
      assistant_professor: "Assistant Professor",
      associate_professor: "Associate Professor",
      professor: "Professor",
    };
    return rankMap[rank] || rank.replace(/_/g, " ").toUpperCase();
  }

  // Get risk level
  static getRiskLevel(overloadPercentage) {
    if (overloadPercentage <= 0) return "none";
    if (overloadPercentage <= 10) return "low";
    if (overloadPercentage <= 20) return "moderate";
    if (overloadPercentage <= 30) return "high";
    return "critical";
  }

  // Get risk description
  static getRiskDescription(overloadPercentage) {
    if (overloadPercentage <= 0) return "Within limits";
    if (overloadPercentage <= 10) return "Minimal overload - manageable";
    if (overloadPercentage <= 20)
      return "Moderate overload - requires monitoring";
    if (overloadPercentage <= 30) return "High overload - requires approval";
    return "Critical overload - requires immediate attention";
  }

  // Get workload status
  static getWorkloadStatus(loadPercentage) {
    if (loadPercentage < 50) return "Underloaded";
    if (loadPercentage < 80) return "Balanced";
    if (loadPercentage < 100) return "Approaching Limit";
    if (loadPercentage < 120) return "Moderate Overload";
    if (loadPercentage < 150) return "High Overload";
    return "Critical Overload";
  }

  // Get status color
  static getStatusColor(loadPercentage) {
    if (loadPercentage < 50) return "#3b82f6"; // blue
    if (loadPercentage < 80) return "#10b981"; // green
    if (loadPercentage < 100) return "#f59e0b"; // amber
    if (loadPercentage < 120) return "#f97316"; // orange
    if (loadPercentage < 150) return "#ef4444"; // red
    return "#991b1b"; // dark red
  }

  // Create notification
  static async createNotification(userId, title, message, type) {
    try {
      // In a real system, you would insert into a notifications table
      // For now, we'll log it
      console.log(`📧 Notification to user ${userId}: ${title}`);
      console.log(`Message: ${message}`);
      return true;
    } catch (error) {
      console.error("Create notification error:", error);
      return false;
    }
  }

  // In CourseAssignmentController.js - Update the getMyAssignments method
  static async getMyAssignments(req, res) {
    try {
      const user_id = req.user.user_id;
      const {
        semester_id,
        status,
        program_type,
        student_year,
        page = 1,
        limit = 1000, // Increase limit to get all assignments
        get_all = false, // Add this parameter to get all assignments
      } = req.query;

      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      let whereClause = "WHERE ca.staff_id = ?";
      const params = [staff.staff_id];

      if (semester_id) {
        whereClause += " AND ca.semester_id = ?";
        params.push(parseInt(semester_id));
      }

      if (status && status !== "all") {
        whereClause += " AND ca.status = ?";
        params.push(status);
      }

      if (program_type) {
        whereClause += " AND c.program_type = ?";
        params.push(program_type);
      }

      if (student_year) {
        whereClause += " AND ca.student_year = ?";
        params.push(parseInt(student_year));
      }

      // If get_all is true, don't use LIMIT
      let queryLimit = "";
      let queryOffset = "";

      if (!get_all) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        queryLimit = "LIMIT ?";
        queryOffset = "OFFSET ?";
        params.push(parseInt(limit), offset);
      }

      // Get assignments with ALL course details
      const assignments = await query(
        `SELECT ca.*, c.course_code, c.course_title, c.credit_hours, c.lecture_hours, c.lab_hours, c.tutorial_hours, c.program_type, s.semester_code, s.semester_name, s.semester_type, sp.first_name as staff_first_name, sp.last_name as staff_last_name, sp.employee_id, sp.academic_rank FROM course_assignments ca LEFT JOIN courses c ON ca.course_id = c.course_id LEFT JOIN semesters s ON ca.semester_id = s.semester_id LEFT JOIN staff_profiles sp ON ca.staff_id = sp.staff_id ${whereClause} ORDER BY ca.assigned_date DESC ${queryLimit} ${queryOffset}`,
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
        is_active: assignment.semester_id === 1, // Add this for semester filtering
      }));

      // Get total count
      const [countResult] = await query(
        `SELECT COUNT(*) as total FROM course_assignments ca LEFT JOIN courses c ON ca.course_id = c.course_id ${whereClause}`,
        params.slice(0, params.length - (get_all ? 0 : 2)) // Remove limit/offset from count query
      );

      return sendSuccess(res, "Assignments retrieved successfully", {
        assignments: enrichedAssignments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get my assignments error:", error);
      return sendError(res, "Failed to retrieve assignments", 500);
    }
  }
  /// In CourseAssignmentController.js - FIXED VERSION
  static async checkAssignmentFeasibility(req, res) {
    try {
      console.log("=== DEBUG: checkAssignmentFeasibility called ===");
      console.log("User:", req.user);
      console.log("Body:", req.body);

      const user_id = req.user?.user_id;
      const user_role = req.user?.role;

      if (user_role !== "department_head") {
        return sendError(
          res,
          "Only department heads can check assignment feasibility",
          403
        );
      }

      const { course_id, semester_id, staff_id } = req.body;

      // Validate required fields
      if (!course_id || !semester_id || !staff_id) {
        return sendError(
          res,
          "Course ID, semester ID, and staff ID are required",
          400
        );
      }

      // Convert to integers
      const courseId = parseInt(course_id);
      const semesterId = parseInt(semester_id);
      const staffId = parseInt(staff_id);

      // Validate numeric values
      if (isNaN(courseId) || isNaN(semesterId) || isNaN(staffId)) {
        return sendError(res, "Invalid ID format. IDs must be numbers.", 400);
      }

      console.log("DEBUG: Parsed IDs:", { courseId, semesterId, staffId });

      // Check if course exists
      const course = await CourseModel.findById(courseId);
      console.log("DEBUG: Course found:", course);
      if (!course) {
        return sendError(res, "Course not found", 404);
      }

      // Check if staff exists and belongs to department head's department
      const staff = await StaffModel.findById(staffId);
      console.log("DEBUG: Staff found:", staff);
      if (!staff) {
        return sendError(res, "Staff member not found", 404);
      }

      // Calculate current workload - FIX: Use CourseAssignmentController.calculateCurrentWorkload
      console.log("DEBUG: Calculating workload...");
      const currentLoad =
        await CourseAssignmentController.calculateCurrentWorkload(
          staffId,
          semesterId
        );
      console.log("DEBUG: Current load:", currentLoad);

      const courseLoad = course.credit_hours * 1.5;
      console.log("DEBUG: Course load:", courseLoad);

      // FIX: Use CourseAssignmentController.getRankLimits
      const rankLimits = await CourseAssignmentController.getRankLimits(
        staff.academic_rank
      );
      console.log("DEBUG: Rank limits:", rankLimits);

      const projectedTotal = currentLoad.total_hours + courseLoad;
      const overloadHours = Math.max(0, projectedTotal - rankLimits.max);
      const isOverload = overloadHours > 0;
      const overloadPercentage =
        rankLimits.max > 0 ? (overloadHours / rankLimits.max) * 100 : 0;

      console.log("DEBUG: Projections:", {
        projectedTotal,
        overloadHours,
        isOverload,
        overloadPercentage,
      });

      // Check if assignment already exists (but don't return error, just flag it)
      console.log("DEBUG: Checking if already assigned...");
      let isAlreadyAssigned = false;
      try {
        isAlreadyAssigned = await CourseAssignmentModel.isCourseAssigned(
          courseId,
          semesterId,
          staffId
        );
        console.log("DEBUG: Is already assigned:", isAlreadyAssigned);
      } catch (error) {
        console.error("DEBUG: Error checking if assigned:", error);
        isAlreadyAssigned = false;
      }

      // Get alternatives (with error handling) - FIX: Use CourseAssignmentController.findAlternativeStaff
      let alternatives = [];
      try {
        alternatives = await CourseAssignmentController.findAlternativeStaff(
          course.course_id,
          semesterId,
          staff.department_id,
          staff.staff_id
        );
      } catch (error) {
        console.error("DEBUG: Error finding alternatives:", error);
        alternatives = [];
      }

      const feasibilityReport = {
        is_feasible: !isOverload,
        is_overload: isOverload,
        is_already_assigned: isAlreadyAssigned,
        staff_name: `${staff.first_name} ${staff.last_name}`,
        // FIX: Use CourseAssignmentController.formatAcademicRank
        staff_rank: CourseAssignmentController.formatAcademicRank(
          staff.academic_rank
        ),
        course_code: course.course_code,
        course_title: course.course_title,

        current_load: {
          total_hours: currentLoad.total_hours,
          course_count: currentLoad.assignment_count,
          rp_hours: currentLoad.rp_hours,
        },

        proposed_addition: {
          course_load: courseLoad,
          credit_hours: course.credit_hours,
        },

        projection: {
          new_total: projectedTotal,
          rank_limit: rankLimits.max,
          available_capacity: Math.max(
            0,
            rankLimits.max - currentLoad.total_hours
          ),
          overload_hours: overloadHours,
          overload_percentage: overloadPercentage.toFixed(1),
        },

        risk_assessment: {
          // FIX: Use CourseAssignmentController.getRiskLevel and getRiskDescription
          level: CourseAssignmentController.getRiskLevel(overloadPercentage),
          description:
            CourseAssignmentController.getRiskDescription(overloadPercentage),
          requires_attention: overloadPercentage > 10,
          requires_approval: overloadPercentage > 20,
        },

        alternatives: alternatives,
      };

      console.log("DEBUG: Sending success response");
      return sendSuccess(res, "Feasibility check completed", feasibilityReport);
    } catch (error) {
      console.error("=== DEBUG: Check feasibility error ===");
      console.error("Error:", error);
      console.error("Error stack:", error.stack);
      return sendError(
        res,
        `Failed to check assignment feasibility: ${error.message}`,
        500
      );
    }
  }

  // Add this to CourseAssignmentController.js
  static async getAssignmentWithDetails(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      const assignment = await CourseAssignmentModel.findById(parseInt(id));
      if (!assignment) {
        return sendError(res, "Assignment not found", 404);
      }

      // Check permissions
      let canView = false;
      if (user_role === "admin") {
        canView = true;
      } else if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        const staff = await StaffModel.findById(assignment.staff_id);
        canView = headStaff?.department_id === staff?.department_id;
      } else if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        canView = staff?.staff_id === assignment.staff_id;
      }

      if (!canView) {
        return sendError(
          res,
          "You are not authorized to view this assignment",
          403
        );
      }

      // Get additional course details
      const [courseDetails] = await query(
        `SELECT 
        lecture_hours,
        lab_hours,
        tutorial_hours,
        credit_hours,
        program_type,
        department_id,
        program_id
      FROM courses 
      WHERE course_id = ?`,
        [assignment.course_id]
      );

      // Get department and program names
      const [department] = await query(
        `SELECT department_name, department_code 
       FROM departments 
       WHERE department_id = ?`,
        [courseDetails?.department_id]
      );

      const [program] = await query(
        `SELECT program_name, program_code 
       FROM programs 
       WHERE program_id = ?`,
        [courseDetails?.program_id]
      );

      const enrichedAssignment = {
        ...assignment,
        ...courseDetails,
        department_name: department?.department_name,
        department_code: department?.department_code,
        program_name: program?.program_name,
        program_code: program?.program_code,
        total_hours: (
          parseFloat(courseDetails?.lecture_hours || 0) +
          parseFloat(courseDetails?.lab_hours || 0) +
          parseFloat(courseDetails?.tutorial_hours || 0)
        ).toFixed(1),
        workload_hours: (
          parseFloat(courseDetails?.lecture_hours || 0) * 1.0 +
          parseFloat(courseDetails?.lab_hours || 0) * 0.75 +
          parseFloat(courseDetails?.tutorial_hours || 0) * 0.5
        ).toFixed(1),
      };

      return sendSuccess(
        res,
        "Assignment details retrieved",
        enrichedAssignment
      );
    } catch (error) {
      console.error("Get assignment details error:", error);
      return sendError(res, "Failed to retrieve assignment details", 500);
    }
  }

  // calculateCurrentWorkload method
  static async calculateCurrentWorkload(staffId, semesterId) {
    try {
      // Get accepted assignments with all hours fields
      const acceptedAssignments = await query(
        `SELECT ca.*, 
       c.credit_hours,
       c.lecture_hours,
       c.lab_hours,
       c.tutorial_hours,
       c.program_type
       FROM course_assignments ca
       LEFT JOIN courses c ON ca.course_id = c.course_id
       WHERE ca.staff_id = ? 
       AND ca.semester_id = ? 
       AND ca.status = 'accepted'`,
        [staffId, semesterId]
      );

      // Calculate total hours using conversion factors
      let totalHours = 0;
      const assignedCourses = [];

      for (const assignment of acceptedAssignments) {
        // Convert hours to workload hours using standard factors
        const lectureHours = parseFloat(assignment.lecture_hours || 0) * 1.0; // Factor 1.0
        const labHours = parseFloat(assignment.lab_hours || 0) * 0.75; // Factor 0.75
        const tutorialHours = parseFloat(assignment.tutorial_hours || 0) * 0.5; // Factor 0.5

        const courseLoad = lectureHours + labHours + tutorialHours;
        totalHours += courseLoad;

        assignedCourses.push({
          course_id: assignment.course_id,
          course_code: assignment.course_code,
          credit_hours: assignment.credit_hours,
          lecture_hours: assignment.lecture_hours,
          lab_hours: assignment.lab_hours,
          tutorial_hours: assignment.tutorial_hours,
          program_type: assignment.program_type,
          estimated_load: courseLoad,
        });
      }

      // Add existing workload RP hours
      const [workloadRP] = await query(
        `SELECT COALESCE(SUM(total_load), 0) as rp_hours 
       FROM workload_rp 
       WHERE staff_id = ? 
       AND semester_id = ? 
       AND status NOT IN ('rejected', 'draft')`,
        [staffId, semesterId]
      );

      const rpHours = parseFloat(workloadRP.rp_hours || 0);
      totalHours += rpHours;

      return {
        total_hours: totalHours,
        assigned_courses: assignedCourses,
        assignment_count: acceptedAssignments.length,
        rp_hours: rpHours,
      };
    } catch (error) {
      console.error("Calculate current workload error:", error);
      return {
        total_hours: 0,
        assigned_courses: [],
        assignment_count: 0,
        rp_hours: 0,
      };
    }
  }

  // Update acceptAssignment method to use actual hours
  static async acceptAssignment(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;
      const { confirm_overload = false } = req.body;

      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

      const assignment = await CourseAssignmentModel.findById(parseInt(id));
      if (!assignment) {
        return sendError(res, "Assignment not found", 404);
      }

      if (assignment.staff_id !== staff.staff_id) {
        return sendError(res, "You can only accept your own assignments", 403);
      }

      if (assignment.status !== "assigned") {
        return sendError(
          res,
          `This assignment cannot be accepted in its current status: ${assignment.status}`,
          400
        );
      }

      // Check workload using ACTUAL hours from courses table
      const currentLoad =
        await CourseAssignmentController.calculateCurrentWorkload(
          staff.staff_id,
          assignment.semester_id
        );

      // Calculate course load from actual hours
      const lectureHours = parseFloat(assignment.lecture_hours || 0) * 1.0;
      const labHours = parseFloat(assignment.lab_hours || 0) * 0.75;
      const tutorialHours = parseFloat(assignment.tutorial_hours || 0) * 0.5;
      const courseLoad = lectureHours + labHours + tutorialHours;

      const rankLimits = await CourseAssignmentController.getRankLimits(
        staff.academic_rank
      );

      const projectedTotal = currentLoad.total_hours + courseLoad;
      const overloadHours = Math.max(0, projectedTotal - rankLimits.max);
      const isOverload = overloadHours > 0;

      if (isOverload && !confirm_overload) {
        return sendError(
          res,
          `⚠️ Accepting this assignment would cause overload.\n\n` +
            `📊 Current: ${currentLoad.total_hours.toFixed(1)} hours\n` +
            `➕ Course adds: ${courseLoad.toFixed(1)} hours\n` +
            `🎯 Maximum allowed: ${rankLimits.max} hours\n` +
            `⚠️ Overload: ${overloadHours.toFixed(1)} hours\n\n` +
            `Course Hours Breakdown:\n` +
            `• Lecture: ${lectureHours.toFixed(1)} hours\n` +
            `• Lab: ${labHours.toFixed(1)} hours\n` +
            `• Tutorial: ${tutorialHours.toFixed(1)} hours`,
          400
        );
      }

      const updatedAssignment = await CourseAssignmentModel.acceptAssignment(
        parseInt(id)
      );

      return sendSuccess(res, "✅ Assignment accepted successfully", {
        assignment: updatedAssignment,
        workload_summary: {
          before_acceptance: currentLoad.total_hours,
          course_breakdown: {
            lecture: lectureHours,
            lab: labHours,
            tutorial: tutorialHours,
            total: courseLoad,
          },
          after_acceptance: projectedTotal,
          rank_limit: rankLimits.max,
          overload_hours: overloadHours,
          is_within_limits: !isOverload,
        },
      });
    } catch (error) {
      console.error("Accept assignment error:", error);
      return sendError(res, "Failed to accept assignment", 500);
    }
  }
}

export default CourseAssignmentController;

