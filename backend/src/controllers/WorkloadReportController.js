

import WorkloadReportService from "../services/WorkloadReportService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import StaffModel from "../models/StaffModel.js";
import { query } from "../config/database.js"; // ADD THIS IMPORT

class WorkloadReportController {
  // Generate comprehensive workload report
  static async generateReport(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;
      const {
        semester_id,
        department_id,
        college_id,
        staff_id,
        program_type,
        status,
        date_from,
        date_to,
        report_type = "comprehensive",
      } = req.query;

      // Build filters based on user role
      const filters = {
        semester_id: semester_id ? parseInt(semester_id) : null,
        program_type,
        status,
        date_from,
        date_to,
        report_type,
      };

      // Role-based filtering
      if (user_role === "instructor") {
        // Instructors can only see their own data
        const staff = await StaffModel.findByUserId(user_id);
        if (staff) {
          filters.staff_id = staff.staff_id;
        } else {
          return sendError(res, "Staff profile not found", 404);
        }
      } else if (user_role === "department_head") {
        // Department heads can see their department data
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          filters.department_id = staff.department_id;
        }
      } else if (user_role === "dean") {
        // Deans can see their college data
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          // Get college from department
          const [college] = await query(
            `SELECT c.college_id FROM colleges c JOIN departments d ON c.college_id = d.college_id WHERE d.department_id = ?`,
            [staff.department_id]
          );
          if (college) {
            filters.college_id = college.college_id;
          }
        }
      } else {
        // Admin and other roles can specify filters
        if (department_id) filters.department_id = parseInt(department_id);
        if (college_id) filters.college_id = parseInt(college_id);
        if (staff_id) filters.staff_id = parseInt(staff_id);
      }

      console.log(
        `Generating report for user ${user_id} (${user_role}) with filters:`,
        filters
      );

      // Generate report
      const report = await WorkloadReportService.generateComprehensiveReport(
        filters
      );

      // Add user context to report
      report.user_context = {
        user_id,
        user_role,
        generated_by: `${req.user.username} (${user_role})`,
        generated_at: new Date().toISOString(),
      };

      return sendSuccess(res, "Workload report generated successfully", report);
    } catch (error) {
      console.error("Generate report error:", error);
      return sendError(res, `Failed to generate report: ${error.message}`, 500);
    }
  }

  // Export report in specific format
  static async exportReport(req, res) {
    try {
      const { format = "json" } = req.query;
      const reportData = req.body; // Assume report data is passed in body

      if (!reportData) {
        return sendError(res, "Report data is required", 400);
      }

      const validFormats = ["pdf", "excel", "csv", "json"];
      if (!validFormats.includes(format.toLowerCase())) {
        return sendError(
          res,
          `Invalid format. Supported formats: ${validFormats.join(", ")}`,
          400
        );
      }

      const exported = await WorkloadReportService.exportReport(
        reportData,
        format
      );

      // Set appropriate headers for download
      res.setHeader("Content-Type", this.getContentType(format));
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${exported.filename}"`
      );

      if (format === "json") {
        return res.json(exported.data);
      } else {
        return res.send(exported.data);
      }
    } catch (error) {
      console.error("Export report error:", error);
      return sendError(res, `Failed to export report: ${error.message}`, 500);
    }
  }

  // Get available semesters for filtering
  static async getAvailableSemesters(req, res) {
    try {
      const semesters = await WorkloadReportService.getAvailableSemesters();
      return sendSuccess(res, "Available semesters retrieved", semesters);
    } catch (error) {
      console.error("Get semesters error:", error);
      return sendError(res, "Failed to retrieve semesters", 500);
    }
  }

  // Get department statistics
  static async getDepartmentStats(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;
      const { departmentId } = req.params;

      // Check permissions
      if (user_role === "department_head") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id !== parseInt(departmentId)) {
          return sendError(
            res,
            "You can only view your own department statistics",
            403
          );
        }
      } else if (user_role === "dean") {
        // Deans can view departments in their college
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          const [college] = await query(
            `SELECT c.college_id FROM colleges c JOIN departments d ON c.college_id = d.college_id WHERE d.department_id = ?`,
            [staff.department_id]
          );
          if (college) {
            // Check if requested department is in same college
            const [deptCollege] = await query(
              `SELECT college_id FROM departments WHERE department_id = ?`,
              [departmentId]
            );
            if (!deptCollege || deptCollege.college_id !== college.college_id) {
              return sendError(
                res,
                "You can only view departments in your college",
                403
              );
            }
          }
        }
      }

      const stats = await WorkloadReportService.getDepartmentStatistics(
        parseInt(departmentId)
      );
      return sendSuccess(res, "Department statistics retrieved", stats);
    } catch (error) {
      console.error("Get department stats error:", error);
      return sendError(res, "Failed to retrieve department statistics", 500);
    }
  }

  // Get staff performance report
  static async getStaffPerformance(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;
      const { staffId } = req.params;
      const { semester_id } = req.query; // ADDED: get semester_id from query

      // Check permissions
      if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        if (!staff || staff.staff_id !== parseInt(staffId)) {
          return sendError(res, "You can only view your own performance", 403);
        }
      } else if (user_role === "department_head") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          // Check if requested staff is in same department
          const [targetStaff] = await query(
            `SELECT department_id FROM staff_profiles WHERE staff_id = ?`,
            [staffId]
          );
          if (
            !targetStaff ||
            targetStaff.department_id !== staff.department_id
          ) {
            return sendError(
              res,
              "You can only view staff in your department",
              403
            );
          }
        }
      }

      const performance = await WorkloadReportService.getStaffPerformanceReport(
        parseInt(staffId),
        semester_id ? parseInt(semester_id) : null
      );

      if (!performance) {
        return sendError(res, "Staff performance data not found", 404);
      }

      return sendSuccess(res, "Staff performance retrieved", performance);
    } catch (error) {
      console.error("Get staff performance error:", error);
      return sendError(res, "Failed to retrieve staff performance", 500);
    }
  }

  // Get workload summary dashboard
  static async getDashboardSummary(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Get current semester
      const [currentSemester] = await query(
        "SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1"
      );

      if (!currentSemester) {
        return sendError(res, "No active semester found", 404);
      }

      const filters = {
        semester_id: currentSemester.semester_id,
      };

      // Apply role-based filtering
      if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff) {
          filters.staff_id = staff.staff_id;
        }
      } else if (user_role === "department_head") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          filters.department_id = staff.department_id;
        }
      } else if (user_role === "dean") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          const [college] = await query(
            `SELECT c.college_id FROM colleges c JOIN departments d ON c.college_id = d.college_id WHERE d.department_id = ?`,
            [staff.department_id]
          );
          if (college) {
            filters.college_id = college.college_id;
          }
        }
      }

      // Generate dashboard summary
      const report = await WorkloadReportService.generateComprehensiveReport(
        filters
      );

      // Extract key metrics for dashboard
      const dashboard = {
        overview: {
          total_workloads:
            report.data.rp_workloads.length + report.data.nrp_workloads.length,
          total_hours: report.statistics.overall.total_hours,
          total_payment: report.statistics.overall.total_payment,
          active_staff: report.statistics.overall.staff_count,
          departments: report.statistics.overall.department_count,
        },
        rp_summary: {
          total_workloads: report.data.rp_workloads.length,
          average_hours: report.statistics.rp.average_load,
          total_payment: report.statistics.rp.total_over_payment,
          by_status: report.statistics.rp.by_status,
        },
        nrp_summary: {
          total_workloads: report.data.nrp_workloads.length,
          total_payment: report.statistics.nrp.total_payment,
          by_program: report.statistics.nrp.by_program,
        },
        recent_activity: {
          last_week_workloads: await this.getRecentActivity(
            filters.semester_id,
            7
          ),
          pending_approvals: await this.getPendingApprovals(user_role, user_id),
        },
        trends: report.trends,
      };

      return sendSuccess(res, "Dashboard summary retrieved", dashboard);
    } catch (error) {
      console.error("Get dashboard summary error:", error);
      return sendError(res, "Failed to retrieve dashboard summary", 500);
    }
  }

  // Helper methods
  static getContentType(format) {
    const contentTypes = {
      pdf: "application/pdf",
      excel:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      csv: "text/csv",
      json: "application/json",
    };
    return contentTypes[format] || "application/octet-stream";
  }

  static async getRecentActivity(semester_id, days = 7) {
    try {
      const recentWorkloads = await query(
        ` 
        SELECT 'RP' as type, workload_id as id, course_code, total_load as hours, status, created_at, staff_id 
        FROM workload_rp 
        WHERE semester_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        UNION ALL
        SELECT 'NRP' as type, nrp_id as id, course_code, total_hours_worked as hours, status, created_at, staff_id 
        FROM workload_nrp 
        WHERE semester_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ORDER BY created_at DESC 
        LIMIT 10
        `,
        [semester_id, days, semester_id, days]
      );
      return recentWorkloads;
    } catch (error) {
      console.error("Get recent activity error:", error);
      return [];
    }
  }

  static async getPendingApprovals(user_role, user_id) {
    try {
      let pendingQuery = "";
      const params = [];

      if (user_role === "department_head") {
        // Get department head's department
        const [dept] = await query(
          `SELECT d.department_id FROM departments d JOIN staff_profiles sp ON d.head_user_id = sp.user_id WHERE sp.user_id = ?`,
          [user_id]
        );

        if (dept) {
          pendingQuery = `
            SELECT COUNT(*) as count 
            FROM (
              SELECT wr.workload_id, wr.status, wr.staff_id 
              FROM workload_rp wr 
              JOIN staff_profiles sp ON wr.staff_id = sp.staff_id 
              WHERE sp.department_id = ? AND wr.status = 'submitted'
              UNION ALL
              SELECT wn.nrp_id, wn.status, wn.staff_id 
              FROM workload_nrp wn 
              JOIN staff_profiles sp ON wn.staff_id = sp.staff_id 
              WHERE sp.department_id = ? AND wn.status = 'submitted'
            ) as pending
          `;
          params.push(dept.department_id, dept.department_id);
        }
      } else if (user_role === "dean") {
        // Get dean's college
        const [college] = await query(
          `SELECT c.college_id FROM colleges c WHERE c.dean_user_id = ?`,
          [user_id]
        );

        if (college) {
          pendingQuery = `
            SELECT COUNT(*) as count 
            FROM (
              SELECT wr.workload_id, wr.status, wr.staff_id 
              FROM workload_rp wr 
              JOIN staff_profiles sp ON wr.staff_id = sp.staff_id 
              JOIN departments d ON sp.department_id = d.department_id 
              WHERE d.college_id = ? AND wr.status = 'dh_approved'
              UNION ALL
              SELECT wn.nrp_id, wn.status, wn.staff_id 
              FROM workload_nrp wn 
              JOIN staff_profiles sp ON wn.staff_id = sp.staff_id 
              JOIN departments d ON sp.department_id = d.department_id 
              WHERE d.college_id = ? AND wn.status = 'dh_approved'
            ) as pending
          `;
          params.push(college.college_id, college.college_id);
        }
      }

      if (pendingQuery) {
        const [result] = await query(pendingQuery, params);
        return result?.count || 0;
      }

      return 0;
    } catch (error) {
      console.error("Get pending approvals error:", error);
      return 0;
    }
  }
}

export default WorkloadReportController;