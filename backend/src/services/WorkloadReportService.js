// src/services/WorkloadReportService.js
import { query } from "../config/database.js"; 
import {
  PROGRAM_TYPES,
  NRP_PROGRAM_TYPES,
  WORKLOAD_STATUSES,
} from "../config/constants.js";
import moment from "moment";

class WorkloadReportService {
  // Generate comprehensive workload report
  static async generateComprehensiveReport(filters = {}) {
    try {
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
      } = filters;

      console.log(`📊 Generating comprehensive report with filters:`, filters);

      // Build base WHERE clause
      let whereClause = `WHERE 1=1`;
      const params = [];

      if (semester_id) {
        whereClause += ` AND s.semester_id = ?`;
        params.push(semester_id);
      }

      if (department_id) {
        whereClause += ` AND sp.department_id = ?`;
        params.push(department_id);
      }

      if (college_id) {
        whereClause += ` AND d.college_id = ?`;
        params.push(college_id);
      }

      if (staff_id) {
        whereClause += ` AND sp.staff_id = ?`;
        params.push(staff_id);
      }

      if (program_type) {
        whereClause += ` AND wn.program_type = ?`;
        params.push(program_type);
      }

      if (status) {
        whereClause += ` AND wr.status = ?`;
        params.push(status);
      }

      if (date_from) {
        whereClause += ` AND wr.created_at >= ?`;
        params.push(date_from);
      }

      if (date_to) {
        whereClause += ` AND wr.created_at <= ?`;
        params.push(date_to);
      }

      // 1. RP Workload Data
      const rpWorkloads = await query(
        `
        SELECT 
          wr.workload_id,
          wr.staff_id,
          wr.semester_id,
          wr.course_code,
          wr.course_credit_hours,
          wr.lecture_credit_hours,
          wr.tutorial_credit_hours,
          wr.lab_credit_hours,
          wr.student_department,
          wr.academic_year,
          wr.number_of_sections,
          wr.each_section_course_load,
          wr.variety_of_course_load,
          wr.research_load,
          wr.community_service_load,
          wr.elip_load,
          wr.hdp_load,
          wr.course_chair_load,
          wr.section_advisor_load,
          wr.advising_load,
          wr.position_load,
          wr.total_load,
          wr.over_payment_birr,
          wr.status,
          wr.created_at,
          sp.first_name,
          sp.last_name,
          sp.employee_id,
          sp.academic_rank,
          d.department_name,
          d.department_code,
          c.college_name,
          c.college_code,
          s.semester_code,
          s.semester_name,
          ay.year_name,
          ay.year_code
        FROM workload_rp wr
        JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
        JOIN departments d ON sp.department_id = d.department_id
        JOIN colleges c ON d.college_id = c.college_id
        JOIN semesters s ON wr.semester_id = s.semester_id
        JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
        ${whereClause}
        ORDER BY wr.created_at DESC
      `,
        params
      );

      // 2. NRP Workload Data
      const nrpWorkloads = await query(
        `
        SELECT 
          wn.nrp_id,
          wn.staff_id,
          wn.semester_id,
          wn.program_type,
          wn.contract_number,
          wn.academic_year,
          wn.course_id,
          wn.course_code,
          wn.course_title,
          wn.credit_hours,
          wn.lecture_credit_hours,
          wn.lab_credit_hours,
          wn.tutorial_credit_hours,
          wn.teaching_hours,
          wn.module_hours,
          wn.student_count,
          wn.assignment_students,
          wn.exam_students,
          wn.rate_category,
          wn.teaching_payment,
          wn.tutorial_payment,
          wn.assignment_payment,
          wn.exam_payment,
          wn.project_payment,
          wn.total_payment,
          wn.total_hours_worked,
          wn.contract_duration_from,
          wn.contract_duration_to,
          wn.is_overload,
          wn.overload_hours,
          wn.overload_payment,
          wn.status,
          wn.created_at,
          sp.first_name,
          sp.last_name,
          sp.employee_id,
          sp.academic_rank,
          d.department_name,
          d.department_code,
          c.college_name,
          c.college_code,
          s.semester_code,
          s.semester_name,
          ay.year_name,
          ay.year_code,
          cr.course_title as actual_course_title
        FROM workload_nrp wn
        JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
        JOIN departments d ON sp.department_id = d.department_id
        JOIN colleges c ON d.college_id = c.college_id
        JOIN semesters s ON wn.semester_id = s.semester_id
        JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
        LEFT JOIN courses cr ON wn.course_id = cr.course_id
        ${whereClause.replace("wr.", "wn.")}
        ORDER BY wn.created_at DESC
      `,
        params
      );

      // 3. Course Assignments
      const assignments = await query(
        `
        SELECT 
          ca.*,
          c.course_code,
          c.course_title,
          c.credit_hours,
          sp.first_name,
          sp.last_name,
          sp.employee_id,
          s.semester_code,
          s.semester_name
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.course_id
        JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
        JOIN semesters s ON ca.semester_id = s.semester_id
        WHERE ca.semester_id = IFNULL(?, ca.semester_id)
        ORDER BY ca.assigned_date DESC
      `,
        [semester_id || null]
      );

      // 4. Calculate Statistics
      const statistics = await this.calculateStatistics(
        rpWorkloads,
        nrpWorkloads,
        assignments
      );

      // 5. Generate Summary
      const summary = {
        report_type,
        generated_at: new Date().toISOString(),
        filters,
        statistics,
        breakdown: {
          by_department: await this.breakdownByDepartment(
            rpWorkloads,
            nrpWorkloads
          ),
          by_program: await this.breakdownByProgram(nrpWorkloads),
          by_status: await this.breakdownByStatus(rpWorkloads, nrpWorkloads),
          by_academic_rank: await this.breakdownByAcademicRank(
            rpWorkloads,
            nrpWorkloads
          ),
        },
        trends: await this.calculateTrends(semester_id, department_id),
        recommendations: await this.generateRecommendations(statistics),
      };

      return {
        success: true,
        report: summary,
        data: {
          rp_workloads: rpWorkloads,
          nrp_workloads: nrpWorkloads,
          assignments: assignments,
        },
        metadata: {
          total_records:
            rpWorkloads.length + nrpWorkloads.length + assignments.length,
          rp_count: rpWorkloads.length,
          nrp_count: nrpWorkloads.length,
          assignment_count: assignments.length,
          export_formats: ["pdf", "excel", "csv", "json"],
        },
      };
    } catch (error) {
      console.error("Error generating comprehensive report:", error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  // Calculate comprehensive statistics
  static async calculateStatistics(rpWorkloads, nrpWorkloads, assignments) {
    // RP Statistics
    const rpStats = {
      total_workloads: rpWorkloads.length,
      total_hours: rpWorkloads.reduce(
        (sum, w) => sum + (parseFloat(w.total_load) || 0),
        0
      ),
      total_over_payment: rpWorkloads.reduce(
        (sum, w) => sum + (parseFloat(w.over_payment_birr) || 0),
        0
      ),
      average_load:
        rpWorkloads.length > 0
          ? rpWorkloads.reduce(
              (sum, w) => sum + (parseFloat(w.total_load) || 0),
              0
            ) / rpWorkloads.length
          : 0,
      by_status: {},
      by_department: {},
      by_rank: {},
    };

    // NRP Statistics
    const nrpStats = {
      total_workloads: nrpWorkloads.length,
      total_hours: nrpWorkloads.reduce(
        (sum, w) => sum + (parseFloat(w.total_hours_worked) || 0),
        0
      ),
      total_payment: nrpWorkloads.reduce(
        (sum, w) => sum + (parseFloat(w.total_payment) || 0),
        0
      ),
      average_payment:
        nrpWorkloads.length > 0
          ? nrpWorkloads.reduce(
              (sum, w) => sum + (parseFloat(w.total_payment) || 0),
              0
            ) / nrpWorkloads.length
          : 0,
      by_program: {},
      by_status: {},
      by_contract_type: {},
    };

    // Assignment Statistics
    const assignmentStats = {
      total_assignments: assignments.length,
      accepted: assignments.filter((a) => a.status === "accepted").length,
      pending: assignments.filter((a) => a.status === "assigned").length,
      declined: assignments.filter((a) => a.status === "declined").length,
      by_course: {},
      by_staff: {},
    };

    // Calculate breakdowns
    // RP by status
    rpWorkloads.forEach((w) => {
      rpStats.by_status[w.status] = (rpStats.by_status[w.status] || 0) + 1;
      rpStats.by_department[w.department_name] =
        (rpStats.by_department[w.department_name] || 0) + 1;
      rpStats.by_rank[w.academic_rank] =
        (rpStats.by_rank[w.academic_rank] || 0) + 1;
    });

    // NRP by program
    nrpWorkloads.forEach((w) => {
      nrpStats.by_program[w.program_type] =
        (nrpStats.by_program[w.program_type] || 0) + 1;
      nrpStats.by_status[w.status] = (nrpStats.by_status[w.status] || 0) + 1;
    });

    // Overall Statistics
    const overallStats = {
      total_hours: rpStats.total_hours + nrpStats.total_hours,
      total_payment: nrpStats.total_payment + rpStats.total_over_payment,
      total_workloads: rpStats.total_workloads + nrpStats.total_workloads,
      average_hours_per_staff: 0,
      staff_count: new Set([
        ...rpWorkloads.map((w) => w.staff_id),
        ...nrpWorkloads.map((w) => w.staff_id),
      ]).size,
      department_count: new Set([
        ...rpWorkloads.map((w) => w.department_id),
        ...nrpWorkloads.map((w) => w.department_id),
      ]).size,
    };

    if (overallStats.staff_count > 0) {
      overallStats.average_hours_per_staff =
        overallStats.total_hours / overallStats.staff_count;
    }

    return {
      rp: rpStats,
      nrp: nrpStats,
      assignments: assignmentStats,
      overall: overallStats,
    };
  }

  // Breakdown by department
  static async breakdownByDepartment(rpWorkloads, nrpWorkloads) {
    const departments = {};

    // Combine RP and NRP workloads
    const allWorkloads = [
      ...rpWorkloads.map((w) => ({ ...w, type: "RP" })),
      ...nrpWorkloads.map((w) => ({ ...w, type: "NRP" })),
    ];

    allWorkloads.forEach((workload) => {
      const deptName = workload.department_name;
      if (!departments[deptName]) {
        departments[deptName] = {
          department_name: deptName,
          department_code: workload.department_code,
          rp_count: 0,
          nrp_count: 0,
          total_hours: 0,
          total_payment: 0,
          staff_count: new Set(),
        };
      }

      const dept = departments[deptName];
      dept.staff_count.add(workload.staff_id);

      if (workload.type === "RP") {
        dept.rp_count++;
        dept.total_hours += parseFloat(workload.total_load) || 0;
        dept.total_payment += parseFloat(workload.over_payment_birr) || 0;
      } else {
        dept.nrp_count++;
        dept.total_hours += parseFloat(workload.total_hours_worked) || 0;
        dept.total_payment += parseFloat(workload.total_payment) || 0;
      }
    });

    // Convert to array and calculate averages
    return Object.values(departments).map((dept) => ({
      ...dept,
      staff_count: dept.staff_count.size,
      average_hours_per_staff:
        dept.staff_count.size > 0
          ? dept.total_hours / dept.staff_count.size
          : 0,
    }));
  }

  // Breakdown by program type
  static async breakdownByProgram(nrpWorkloads) {
    const programs = {};

    nrpWorkloads.forEach((workload) => {
      const programType = workload.program_type;
      if (!programs[programType]) {
        programs[programType] = {
          program_type: programType,
          workload_count: 0,
          total_hours: 0,
          total_payment: 0,
          staff_count: new Set(),
          average_payment: 0,
          courses: new Set(),
        };
      }

      const program = programs[programType];
      program.workload_count++;
      program.total_hours += parseFloat(workload.total_hours_worked) || 0;
      program.total_payment += parseFloat(workload.total_payment) || 0;
      program.staff_count.add(workload.staff_id);
      if (workload.course_code) {
        program.courses.add(workload.course_code);
      }
    });

    // Convert to array
    return Object.values(programs).map((program) => ({
      ...program,
      staff_count: program.staff_count.size,
      course_count: program.courses.size,
      average_payment_per_workload:
        program.workload_count > 0
          ? program.total_payment / program.workload_count
          : 0,
      average_hours_per_workload:
        program.workload_count > 0
          ? program.total_hours / program.workload_count
          : 0,
    }));
  }

  // Breakdown by status
  static async breakdownByStatus(rpWorkloads, nrpWorkloads) {
    const statusBreakdown = {};

    // Process RP workloads
    rpWorkloads.forEach((workload) => {
      const status = workload.status;
      if (!statusBreakdown[status]) {
        statusBreakdown[status] = {
          status: status,
          rp_count: 0,
          nrp_count: 0,
          total_count: 0,
        };
      }
      statusBreakdown[status].rp_count++;
      statusBreakdown[status].total_count++;
    });

    // Process NRP workloads
    nrpWorkloads.forEach((workload) => {
      const status = workload.status;
      if (!statusBreakdown[status]) {
        statusBreakdown[status] = {
          status: status,
          rp_count: 0,
          nrp_count: 0,
          total_count: 0,
        };
      }
      statusBreakdown[status].nrp_count++;
      statusBreakdown[status].total_count++;
    });

    return Object.values(statusBreakdown);
  }

  // Breakdown by academic rank
  static async breakdownByAcademicRank(rpWorkloads, nrpWorkloads) {
    const ranks = {};

    // Combine workloads
    const allWorkloads = [...rpWorkloads, ...nrpWorkloads];

    allWorkloads.forEach((workload) => {
      const rank = workload.academic_rank;
      if (!ranks[rank]) {
        ranks[rank] = {
          academic_rank: rank,
          staff_count: new Set(),
          workload_count: 0,
          total_hours: 0,
          average_hours: 0,
        };
      }

      ranks[rank].staff_count.add(workload.staff_id);
      ranks[rank].workload_count++;

      // Add hours based on workload type
      if ("total_load" in workload) {
        ranks[rank].total_hours += parseFloat(workload.total_load) || 0;
      } else if ("total_hours_worked" in workload) {
        ranks[rank].total_hours += parseFloat(workload.total_hours_worked) || 0;
      }
    });

    // Calculate averages
    return Object.values(ranks).map((rank) => ({
      ...rank,
      staff_count: rank.staff_count.size,
      average_hours_per_staff:
        rank.staff_count.size > 0
          ? rank.total_hours / rank.staff_count.size
          : 0,
      average_hours_per_workload:
        rank.workload_count > 0 ? rank.total_hours / rank.workload_count : 0,
    }));
  }

  // Calculate trends
  static async calculateTrends(semester_id, department_id) {
    try {
      const trends = {
        monthly_trend: [],
        semester_comparison: [],
        department_comparison: [],
      };

      // Get last 6 months trend
      const sixMonthsAgo = moment().subtract(6, "months").format("YYYY-MM-DD");

      const monthlyTrend = await query(
        `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as workload_count,
          SUM(total_load) as total_hours
        FROM workload_rp
        WHERE created_at >= ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `,
        [sixMonthsAgo]
      );

      trends.monthly_trend = monthlyTrend;

      // Semester comparison
      const semesterComparison = await query(`
        SELECT 
          s.semester_name,
          COUNT(wr.workload_id) as workload_count,
          COALESCE(SUM(wr.total_load), 0) as total_hours,
          COALESCE(AVG(wr.total_load), 0) as average_hours
        FROM semesters s
        LEFT JOIN workload_rp wr ON s.semester_id = wr.semester_id
        WHERE s.start_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
        GROUP BY s.semester_id, s.semester_name
        ORDER BY s.start_date DESC
      `);

      trends.semester_comparison = semesterComparison;

      return trends;
    } catch (error) {
      console.error("Error calculating trends:", error);
      return {
        monthly_trend: [],
        semester_comparison: [],
        department_comparison: [],
      };
    }
  }

  // Generate recommendations based on statistics
  static async generateRecommendations(statistics) {
    const recommendations = [];

    // Check for overload
    const averageHoursPerStaff =
      statistics.overall.average_hours_per_staff || 0;
    if (averageHoursPerStaff > 12) {
      recommendations.push({
        type: "warning",
        title: "High Average Workload",
        message: `Average workload per staff (${averageHoursPerStaff.toFixed(
          1
        )} hours) is above recommended limit.`,
        action: "Review workload distribution",
      });
    }

    // Check for payment discrepancies
    const rpPayment = statistics.rp.total_over_payment || 0;
    const nrpPayment = statistics.nrp.total_payment || 0;
    const paymentRatio = rpPayment > 0 ? nrpPayment / rpPayment : 0;

    if (paymentRatio > 3) {
      recommendations.push({
        type: "financial",
        title: "NRP Payment Dominance",
        message: `NRP payments (${nrpPayment.toLocaleString()} ETB) are significantly higher than RP overpayments (${rpPayment.toLocaleString()} ETB).`,
        action: "Review payment structures",
      });
    }

    // Check for draft workloads
    const draftCount =
      (statistics.rp.by_status?.draft || 0) +
      (statistics.nrp.by_status?.draft || 0);
    if (draftCount > 5) {
      recommendations.push({
        type: "process",
        title: "Pending Draft Workloads",
        message: `${draftCount} draft workloads need attention.`,
        action: "Follow up with staff",
      });
    }

    // Check for department distribution
    const departments = statistics.overall.department_count || 0;
    const staffPerDept =
      statistics.overall.staff_count > 0
        ? statistics.overall.staff_count / departments
        : 0;

    if (staffPerDept < 3) {
      recommendations.push({
        type: "resource",
        title: "Staff Distribution",
        message: `Average of ${staffPerDept.toFixed(
          1
        )} staff per department. Consider resource reallocation.`,
        action: "Review department staffing",
      });
    }

    return recommendations;
  }

  // Export report in different formats
  static async exportReport(reportData, format = "json") {
    try {
      switch (format.toLowerCase()) {
        case "pdf":
          // Generate PDF report (simplified - in real app use PDF library)
          return {
            format: "pdf",
            data: this.generatePDFReport(reportData),
            filename: `workload_report_${
              new Date().toISOString().split("T")[0]
            }.pdf`,
          };

        case "excel":
          // Generate Excel report
          return {
            format: "excel",
            data: this.generateExcelReport(reportData),
            filename: `workload_report_${
              new Date().toISOString().split("T")[0]
            }.xlsx`,
          };

        case "csv":
          // Generate CSV report
          return {
            format: "csv",
            data: this.generateCSVReport(reportData),
            filename: `workload_report_${
              new Date().toISOString().split("T")[0]
            }.csv`,
          };

        case "json":
        default:
          return {
            format: "json",
            data: reportData,
            filename: `workload_report_${
              new Date().toISOString().split("T")[0]
            }.json`,
          };
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      throw new Error(`Failed to export report: ${error.message}`);
    }
  }

  // Generate simplified report formats (for demonstration)
  static generatePDFReport(data) {
    // In real implementation, use a PDF library like pdfkit
    return {
      message: "PDF export would be implemented with a PDF library",
      data: JSON.stringify(data, null, 2),
    };
  }

  static generateExcelReport(data) {
    // In real implementation, use a library like exceljs
    return {
      message: "Excel export would be implemented with exceljs",
      data: JSON.stringify(data, null, 2),
    };
  }

  static generateCSVReport(data) {
    try {
      // Generate CSV from workload data
      const rpRows = data.data.rp_workloads.map((w) => ({
        Type: "RP",
        "Course Code": w.course_code,
        "Staff Name": `${w.first_name} ${w.last_name}`,
        Department: w.department_name,
        "Total Hours": w.total_load,
        Status: w.status,
        "Created Date": w.created_at,
      }));

      const nrpRows = data.data.nrp_workloads.map((w) => ({
        Type: "NRP",
        "Course Code": w.course_code,
        "Staff Name": `${w.first_name} ${w.last_name}`,
        Department: w.department_name,
        "Program Type": w.program_type,
        "Total Hours": w.total_hours_worked,
        "Total Payment": w.total_payment,
        Status: w.status,
        "Created Date": w.created_at,
      }));

      const allRows = [...rpRows, ...nrpRows];

      // Create CSV headers
      const headers = Object.keys(allRows[0] || {});
      const csvRows = [headers.join(",")];

      // Add data rows
      allRows.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value || "").replace(/"/g, '""');
          return escaped.includes(",") ? `"${escaped}"` : escaped;
        });
        csvRows.push(values.join(","));
      });

      return csvRows.join("\n");
    } catch (error) {
      console.error("Error generating CSV:", error);
      return "Error generating CSV report";
    }
  }

  // Get available semesters for filtering
  static async getAvailableSemesters() {
    try {
      const semesters = await query(`
        SELECT s.*, ay.year_name, ay.year_code
        FROM semesters s
        JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
        WHERE s.end_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
        ORDER BY s.start_date DESC
      `);
      return semesters;
    } catch (error) {
      console.error("Error fetching semesters:", error);
      return [];
    }
  }

  // Get department statistics
  static async getDepartmentStatistics(department_id = null) {
    try {
      let whereClause = "";
      const params = [];

      if (department_id) {
        whereClause = "WHERE d.department_id = ?";
        params.push(department_id);
      }

      const stats = await query(
        `
        SELECT 
          d.department_id,
          d.department_name,
          d.department_code,
          c.college_name,
          COUNT(DISTINCT sp.staff_id) as total_staff,
          COUNT(DISTINCT wr.workload_id) as rp_workloads,
          COUNT(DISTINCT wn.nrp_id) as nrp_workloads,
          COALESCE(SUM(wr.total_load), 0) as rp_total_hours,
          COALESCE(SUM(wn.total_hours_worked), 0) as nrp_total_hours,
          COALESCE(SUM(wr.over_payment_birr), 0) as rp_total_payment,
          COALESCE(SUM(wn.total_payment), 0) as nrp_total_payment,
          COUNT(DISTINCT CASE WHEN wr.status = 'finance_approved' THEN wr.workload_id END) as rp_approved,
          COUNT(DISTINCT CASE WHEN wn.status = 'finance_approved' THEN wn.nrp_id END) as nrp_approved
        FROM departments d
        JOIN colleges c ON d.college_id = c.college_id
        LEFT JOIN staff_profiles sp ON d.department_id = sp.department_id
        LEFT JOIN workload_rp wr ON sp.staff_id = wr.staff_id
        LEFT JOIN workload_nrp wn ON sp.staff_id = wn.staff_id
        ${whereClause}
        GROUP BY d.department_id, d.department_name, d.department_code, c.college_name
        ORDER BY d.department_name
      `,
        params
      );

      return stats;
    } catch (error) {
      console.error("Error fetching department statistics:", error);
      return [];
    }
  }

  // Get staff performance report
  static async getStaffPerformanceReport(staff_id, semester_id = null) {
    try {
      const params = [staff_id];
      let semesterCondition = "";

      if (semester_id) {
        semesterCondition = "AND wr.semester_id = ?";
        params.push(semester_id);
      }

      const performance = await query(
        `
        SELECT 
          sp.staff_id,
          CONCAT(sp.first_name, ' ', sp.last_name) as staff_name,
          sp.employee_id,
          sp.academic_rank,
          d.department_name,
          COUNT(DISTINCT wr.workload_id) as total_rp_workloads,
          COUNT(DISTINCT wn.nrp_id) as total_nrp_workloads,
          COALESCE(SUM(wr.total_load), 0) as total_rp_hours,
          COALESCE(SUM(wn.total_hours_worked), 0) as total_nrp_hours,
          COALESCE(SUM(wr.over_payment_birr), 0) as total_rp_payment,
          COALESCE(SUM(wn.total_payment), 0) as total_nrp_payment,
          COUNT(DISTINCT ca.assignment_id) as total_assignments,
          ROUND(AVG(wr.total_load), 2) as avg_rp_hours_per_workload,
          ROUND(AVG(wn.total_hours_worked), 2) as avg_nrp_hours_per_workload
        FROM staff_profiles sp
        JOIN departments d ON sp.department_id = d.department_id
        LEFT JOIN workload_rp wr ON sp.staff_id = wr.staff_id ${semesterCondition}
        LEFT JOIN workload_nrp wn ON sp.staff_id = wn.staff_id ${semesterCondition.replace(
          "wr.",
          "wn."
        )}
        LEFT JOIN course_assignments ca ON sp.staff_id = ca.staff_id AND ca.status = 'accepted'
        WHERE sp.staff_id = ?
        GROUP BY sp.staff_id, sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank, d.department_name
      `,
        params
      );

      return performance[0] || null;
    } catch (error) {
      console.error("Error fetching staff performance:", error);
      return null;
    }
  }
}

export default WorkloadReportService;
