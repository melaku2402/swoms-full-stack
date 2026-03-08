import OverloadDetectionService from "../services/OverloadDetectionService.js";
import StaffModel from "../models/StaffModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { query } from "../config/database.js";

class OverloadDetectionController {
  // Check staff overload
  static async checkStaffOverload(req, res) {
    try {
      const { staffId, semesterId } = req.params;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Validate permissions
      if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff.staff_id !== parseInt(staffId)) {
          return sendError(
            res,
            "You can only check your own overload status",
            403
          );
        }
      } else if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        const targetStaff = await StaffModel.findById(parseInt(staffId));
        if (headStaff.department_id !== targetStaff.department_id) {
          return sendError(
            res,
            "You can only check overload for staff in your department",
            403
          );
        }
      } else if (!["admin", "hr_director", "dean"].includes(user_role)) {
        return sendError(
          res,
          "You are not authorized to check overload status",
          403
        );
      }

      const overloadReport = await OverloadDetectionService.detectStaffOverload(
        parseInt(staffId),
        parseInt(semesterId)
      );

      return sendSuccess(res, "Overload check completed", overloadReport);
    } catch (error) {
      console.error("Check staff overload error:", error);
      return sendError(res, error.message || "Failed to check overload", 500);
    }
  }

  // Check department overload
  static async checkDepartmentOverload(req, res) {
    try {
      const { departmentId, semesterId } = req.params;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Validate permissions
      if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        if (headStaff.department_id !== parseInt(departmentId)) {
          return sendError(
            res,
            "You can only check overload for your own department",
            403
          );
        }
      } else if (!["admin", "hr_director", "dean"].includes(user_role)) {
        return sendError(
          res,
          "You are not authorized to check department overload",
          403
        );
      }

      const departmentReport =
        await OverloadDetectionService.detectDepartmentOverload(
          parseInt(departmentId),
          parseInt(semesterId)
        );

      return sendSuccess(
        res,
        "Department overload check completed",
        departmentReport
      );
    } catch (error) {
      console.error("Check department overload error:", error);
      return sendError(
        res,
        error.message || "Failed to check department overload",
        500
      );
    }
  }

  // Check my overload (for instructors)
  static async checkMyOverload(req, res) {
    try {
      const user_id = req.user.user_id;
      const { semester_id } = req.query;

      // Get staff profile
      const staff = await StaffModel.findByUserId(user_id);
      if (!staff) {
        return sendError(res, "Staff profile not found", 404);
      }

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

      const overloadReport = await OverloadDetectionService.detectStaffOverload(
        staff.staff_id,
        targetSemesterId
      );

      return sendSuccess(res, "Your overload status retrieved", overloadReport);
    } catch (error) {
      console.error("Check my overload error:", error);
      return sendError(
        res,
        error.message || "Failed to check your overload status",
        500
      );
    }
  }

  // Predict overload trend
  static async predictOverloadTrend(req, res) {
    try {
      const { staffId } = req.params;
      const { upcoming_semester_id } = req.body;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      if (!upcoming_semester_id) {
        return sendError(res, "Upcoming semester ID is required", 400);
      }

      // Validate permissions
      if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff.staff_id !== parseInt(staffId)) {
          return sendError(
            res,
            "You can only predict your own overload trend",
            403
          );
        }
      } else if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        const targetStaff = await StaffModel.findById(parseInt(staffId));
        if (headStaff.department_id !== targetStaff.department_id) {
          return sendError(
            res,
            "You can only predict overload for staff in your department",
            403
          );
        }
      } else if (!["admin", "hr_director", "dean"].includes(user_role)) {
        return sendError(
          res,
          "You are not authorized to predict overload trends",
          403
        );
      }

      const trendPrediction =
        await OverloadDetectionService.predictOverloadTrend(
          parseInt(staffId),
          parseInt(upcoming_semester_id)
        );

      return sendSuccess(
        res,
        "Overload trend prediction completed",
        trendPrediction
      );
    } catch (error) {
      console.error("Predict overload trend error:", error);
      return sendError(
        res,
        error.message || "Failed to predict overload trend",
        500
      );
    }
  }

  // Generate overload report for approval
  static async generateOverloadReport(req, res) {
    try {
      const { staffId, semesterId } = req.params;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Only department heads, HR, and admins can generate reports
      if (!["admin", "hr_director", "department_head"].includes(user_role)) {
        return sendError(
          res,
          "You are not authorized to generate overload reports",
          403
        );
      }

      if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        const targetStaff = await StaffModel.findById(parseInt(staffId));
        if (headStaff.department_id !== targetStaff.department_id) {
          return sendError(
            res,
            "You can only generate reports for staff in your department",
            403
          );
        }
      }

      const report = await OverloadDetectionService.generateOverloadReport(
        parseInt(staffId),
        parseInt(semesterId)
      );

      // Store report in database
      if (report.requires_report) {
        await query(
          `INSERT INTO nrp_reports 
           (report_type, semester_id, department_id, generated_by, report_data)
           VALUES ('overload_detection', ?, ?, ?, ?)`,
          [
            parseInt(semesterId),
            report.data.department_id,
            user_id,
            JSON.stringify(report),
          ]
        );
      }

      return sendSuccess(res, "Overload report generated", report);
    } catch (error) {
      console.error("Generate overload report error:", error);
      return sendError(
        res,
        error.message || "Failed to generate overload report",
        500
      );
    }
  }

  // // Get overload alerts (for department heads and admins)
  // static async getOverloadAlerts(req, res) {
  //   try {
  //     const user_id = req.user.user_id;
  //     const user_role = req.user.role;
  //     const { department_id, threshold = 80 } = req.query;

  //     let targetDepartmentId = department_id;

  //     // For department heads, use their department
  //     if (user_role === "department_head") {
  //       const headStaff = await StaffModel.findByUserId(user_id);
  //       if (headStaff) {
  //         targetDepartmentId = headStaff.department_id;
  //       }
  //     }

  //     // Get active semester
  //     const [currentSemester] = await query(
  //       "SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1"
  //     );

  //     if (!currentSemester) {
  //       return sendError(res, "No active semester found", 404);
  //     }

  //     // Get staff with high load
  //     const alerts = [];

  //     // Get department staff
  //     let staffQuery =
  //       "SELECT sp.staff_id, sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank";
  //     const params = [];

  //     if (targetDepartmentId) {
  //       staffQuery += " FROM staff_profiles sp WHERE sp.department_id = ?";
  //       params.push(targetDepartmentId);
  //     } else {
  //       staffQuery += " FROM staff_profiles sp";
  //     }

  //     const staffList = await query(staffQuery, params);

  //     // Check each staff member
  //     for (const staff of staffList) {
  //       const workload = await OverloadDetectionService.calculateTotalWorkload(
  //         staff.staff_id,
  //         currentSemester.semester_id
  //       );

  //       const rankLimits = await OverloadDetectionService.getRankLimits(
  //         staff.academic_rank
  //       );
  //       const loadPercentage = (workload.total_hours / rankLimits.max) * 100;

  //       if (loadPercentage >= threshold) {
  //         alerts.push({
  //           staff_id: staff.staff_id,
  //           name: `${staff.first_name} ${staff.last_name}`,
  //           employee_id: staff.employee_id,
  //           academic_rank: staff.academic_rank,
  //           current_hours: workload.total_hours,
  //           max_hours: rankLimits.max,
  //           load_percentage: parseFloat(loadPercentage.toFixed(1)),
  //           status: OverloadDetectionService.getLoadStatus(
  //             workload.total_hours,
  //             rankLimits
  //           ),
  //           is_overloaded: workload.total_hours > rankLimits.max,
  //           overload_hours: Math.max(0, workload.total_hours - rankLimits.max),
  //           priority: this.getAlertPriority(loadPercentage),
  //         });
  //       }
  //     }

  //     // Sort by priority (highest first)
  //     alerts.sort((a, b) => b.priority - a.priority);

  //     return sendSuccess(res, "Overload alerts retrieved", {
  //       semester_id: currentSemester.semester_id,
  //       department_id: targetDepartmentId,
  //       threshold: threshold,
  //       total_staff: staffList.length,
  //       alert_count: alerts.length,
  //       alerts: alerts,
  //     });
  //   } catch (error) {
  //     console.error("Get overload alerts error:", error);
  //     return sendError(res, "Failed to get overload alerts", 500);
  //   }
  // }
  // In OverloadDetectionController.js - Fix getOverloadAlerts method
  static async getOverloadAlerts(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;
      const { department_id, threshold = 80 } = req.query;

      console.log("Overload alerts request:", {
        user_id,
        user_role,
        department_id,
        threshold,
      });

      let targetDepartmentId = department_id;

      // For department heads, use their department
      if (user_role === "department_head") {
        const headStaff = await StaffModel.findByUserId(user_id);
        if (headStaff) {
          targetDepartmentId = headStaff.department_id;
        }
      }

      // Get active semester
      const [currentSemester] = await query(
        "SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1"
      );

      if (!currentSemester) {
        return sendError(res, "No active semester found", 404);
      }

      const alerts = [];

      // Get department staff
      let staffQuery = `
      SELECT sp.staff_id, sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank
      FROM staff_profiles sp
    `;
      const params = [];

      if (targetDepartmentId) {
        staffQuery += " WHERE sp.department_id = ?";
        params.push(targetDepartmentId);
      }

      console.log("Staff query:", staffQuery, params);

      const staffList = await query(staffQuery, params);

      // Check each staff member
      for (const staff of staffList) {
        try {
          const workload =
            await OverloadDetectionService.calculateTotalWorkload(
              staff.staff_id,
              currentSemester.semester_id
            );

          const rankLimits = await OverloadDetectionService.getRankLimits(
            staff.academic_rank
          );

          if (rankLimits.max && rankLimits.max > 0) {
            const loadPercentage =
              (workload.total_hours / rankLimits.max) * 100;

            if (loadPercentage >= threshold) {
              alerts.push({
                staff_id: staff.staff_id,
                name: `${staff.first_name} ${staff.last_name}`,
                employee_id: staff.employee_id,
                academic_rank: staff.academic_rank,
                current_hours: workload.total_hours,
                max_hours: rankLimits.max,
                load_percentage: parseFloat(loadPercentage.toFixed(1)),
                status: OverloadDetectionService.getLoadStatus(
                  workload.total_hours,
                  rankLimits
                ),
                is_overloaded: workload.total_hours > rankLimits.max,
                overload_hours: Math.max(
                  0,
                  workload.total_hours - rankLimits.max
                ),
                priority: this.getAlertPriority(loadPercentage),
              });
            }
          }
        } catch (staffError) {
          console.error(
            `Error processing staff ${staff.staff_id}:`,
            staffError
          );
          // Continue with next staff member
        }
      }

      // Sort by priority (highest first)
      alerts.sort((a, b) => b.priority - a.priority);

      return sendSuccess(res, "Overload alerts retrieved", {
        semester_id: currentSemester.semester_id,
        department_id: targetDepartmentId,
        threshold: parseInt(threshold),
        total_staff: staffList.length,
        alert_count: alerts.length,
        alerts: alerts,
      });
    } catch (error) {
      console.error("Get overload alerts error:", error);
      return sendError(
        res,
        error.message || "Failed to get overload alerts",
        500
      );
    }
  }
  // Get alert priority
  static getAlertPriority(loadPercentage) {
    if (loadPercentage >= 150) return 5; // Critical
    if (loadPercentage >= 120) return 4; // High
    if (loadPercentage >= 100) return 3; // Medium
    if (loadPercentage >= 90) return 2; // Low
    return 1; // Warning
  }
}

export default OverloadDetectionController;
