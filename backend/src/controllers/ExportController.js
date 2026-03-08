// src/controllers/ExportController.js
import { query } from "../config/database.js";
import { sendSuccess, sendError } from "../utils/response.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

class ExportController {
  // Export dashboard data
  static async exportDashboard(req, res) {
    try {
      const { format = "pdf" } = req.params;

      if (!["pdf", "excel", "csv"].includes(format.toLowerCase())) {
        return sendError(
          res,
          "Invalid format. Use 'pdf', 'excel', or 'csv'",
          400
        );
      }

      // Get dashboard data
      const [stats] = await query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM staff_profiles) as total_staff,
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM workload_rp WHERE status = 'approved') as total_workloads,
          (SELECT COUNT(*) FROM workload_nrp WHERE status = 'approved') as total_nrp_workloads,
          (SELECT COUNT(*) FROM payment_sheets WHERE payment_status = 'paid') as total_payments
      `);

      const [recentActivities] = await query(`
        SELECT * FROM audit_log 
        ORDER BY timestamp DESC 
        LIMIT 10
      `);

      const dashboardData = {
        summary: stats[0],
        recent_activities: recentActivities,
        generated_at: new Date().toISOString(),
        generated_by: req.user.user_id,
      };

      // Generate file based on format
      if (format === "pdf") {
        return ExportController.generatePDF(res, dashboardData, "dashboard");
      } else if (format === "excel") {
        return ExportController.generateExcel(res, dashboardData, "dashboard");
      } else {
        return ExportController.generateCSV(res, dashboardData, "dashboard");
      }
    } catch (error) {
      console.error("Export dashboard error:", error);
      return sendError(res, "Failed to export dashboard", 500);
    }
  }

  // Export workloads
  static async exportWorkloads(req, res) {
    try {
      const {
        format = "excel",
        semester_id,
        department_id,
        status,
      } = req.query;

      let queryStr = `
        SELECT 
          wr.workload_id,
          wr.staff_id,
          sp.first_name,
          sp.last_name,
          sp.employee_id,
          d.department_name,
          s.semester_name,
          wr.course_code,
          wr.total_load,
          wr.status,
          wr.created_at
        FROM workload_rp wr
        LEFT JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
        LEFT JOIN departments d ON sp.department_id = d.department_id
        LEFT JOIN semesters s ON wr.semester_id = s.semester_id
        WHERE 1=1
      `;

      const params = [];

      if (semester_id) {
        queryStr += " AND wr.semester_id = ?";
        params.push(semester_id);
      }

      if (department_id) {
        queryStr += " AND sp.department_id = ?";
        params.push(department_id);
      }

      if (status) {
        queryStr += " AND wr.status = ?";
        params.push(status);
      }

      queryStr += " ORDER BY wr.created_at DESC";

      const workloads = await query(queryStr, params);

      const exportData = {
        metadata: {
          title: "Workload Report",
          filters: { semester_id, department_id, status },
          generated_at: new Date().toISOString(),
          total_records: workloads.length,
        },
        data: workloads,
      };

      if (format === "pdf") {
        return ExportController.generatePDF(res, exportData, "workloads");
      } else if (format === "excel") {
        return ExportController.generateExcel(res, exportData, "workloads");
      } else {
        return ExportController.generateCSV(res, exportData, "workloads");
      }
    } catch (error) {
      console.error("Export workloads error:", error);
      return sendError(res, "Failed to export workloads", 500);
    }
  }

  // Export payments
  static async exportPayments(req, res) {
    try {
      const {
        format = "excel",
        semester_id,
        program_type,
        payment_status,
      } = req.query;

      let queryStr = `
        SELECT 
          ps.payment_id,
          ps.sheet_number,
          ps.payment_type,
          ps.gross_amount,
          ps.tax_amount,
          ps.net_amount,
          ps.payment_status,
          ps.approved_date,
          sp.first_name,
          sp.last_name,
          sp.employee_id,
          d.department_name,
          s.semester_name,
          wn.program_type,
          wn.contract_number
        FROM payment_sheets ps
        LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
        LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
        LEFT JOIN departments d ON sp.department_id = d.department_id
        LEFT JOIN semesters s ON wn.semester_id = s.semester_id
        WHERE 1=1
      `;

      const params = [];

      if (semester_id) {
        queryStr += " AND s.semester_id = ?";
        params.push(semester_id);
      }

      if (program_type) {
        queryStr += " AND wn.program_type = ?";
        params.push(program_type);
      }

      if (payment_status) {
        queryStr += " AND ps.payment_status = ?";
        params.push(payment_status);
      }

      queryStr += " ORDER BY ps.approved_date DESC";

      const payments = await query(queryStr, params);

      // Calculate totals
      const totals = {
        total_gross: payments.reduce(
          (sum, p) => sum + (p.gross_amount || 0),
          0
        ),
        total_tax: payments.reduce((sum, p) => sum + (p.tax_amount || 0), 0),
        total_net: payments.reduce((sum, p) => sum + (p.net_amount || 0), 0),
      };

      const exportData = {
        metadata: {
          title: "Payment Report",
          filters: { semester_id, program_type, payment_status },
          generated_at: new Date().toISOString(),
          total_records: payments.length,
          totals,
        },
        data: payments,
      };

      if (format === "pdf") {
        return ExportController.generatePDF(res, exportData, "payments");
      } else if (format === "excel") {
        return ExportController.generateExcel(res, exportData, "payments");
      } else {
        return ExportController.generateCSV(res, exportData, "payments");
      }
    } catch (error) {
      console.error("Export payments error:", error);
      return sendError(res, "Failed to export payments", 500);
    }
  }

  // Export users
  static async exportUsers(req, res) {
    try {
      const { format = "excel", role, is_active, department_id } = req.query;

      let queryStr = `
        SELECT 
          u.user_id,
          u.username,
          u.email,
          u.role,
          u.is_active,
          u.created_at,
          sp.first_name,
          sp.last_name,
          sp.employee_id,
          sp.academic_rank,
          d.department_name
        FROM users u
        LEFT JOIN staff_profiles sp ON u.user_id = sp.user_id
        LEFT JOIN departments d ON sp.department_id = d.department_id
        WHERE 1=1
      `;

      const params = [];

      if (role) {
        queryStr += " AND u.role = ?";
        params.push(role);
      }

      if (is_active !== undefined) {
        queryStr += " AND u.is_active = ?";
        params.push(is_active === "true");
      }

      if (department_id) {
        queryStr += " AND sp.department_id = ?";
        params.push(department_id);
      }

      queryStr += " ORDER BY u.created_at DESC";

      const users = await query(queryStr, params);

      const exportData = {
        metadata: {
          title: "User Directory",
          filters: { role, is_active, department_id },
          generated_at: new Date().toISOString(),
          total_records: users.length,
        },
        data: users,
      };

      if (format === "pdf") {
        return ExportController.generatePDF(res, exportData, "users");
      } else if (format === "excel") {
        return ExportController.generateExcel(res, exportData, "users");
      } else {
        return ExportController.generateCSV(res, exportData, "users");
      }
    } catch (error) {
      console.error("Export users error:", error);
      return sendError(res, "Failed to export users", 500);
    }
  }

  // Generate custom report
  static async generateReport(req, res) {
    try {
      const { type } = req.params;
      const { format = "pdf", ...filters } = req.query;

      let reportData;
      let title;

      switch (type) {
        case "financial-summary":
          title = "Financial Summary Report";
          reportData = await ExportController.generateFinancialReport(filters);
          break;
        case "workload-analysis":
          title = "Workload Analysis Report";
          reportData = await ExportController.generateWorkloadAnalysis(filters);
          break;
        case "staff-performance":
          title = "Staff Performance Report";
          reportData = await ExportController.generateStaffPerformanceReport(
            filters
          );
          break;
        case "course-offerings":
          title = "Course Offerings Report";
          reportData = await ExportController.generateCourseOfferingsReport(
            filters
          );
          break;
        default:
          return sendError(res, "Invalid report type", 400);
      }

      const exportData = {
        metadata: {
          title,
          type,
          filters,
          generated_at: new Date().toISOString(),
          generated_by: req.user.user_id,
        },
        ...reportData,
      };

      if (format === "pdf") {
        return ExportController.generatePDF(res, exportData, `report_${type}`);
      } else if (format === "excel") {
        return ExportController.generateExcel(
          res,
          exportData,
          `report_${type}`
        );
      } else {
        return ExportController.generateCSV(res, exportData, `report_${type}`);
      }
    } catch (error) {
      console.error("Generate report error:", error);
      return sendError(res, "Failed to generate report", 500);
    }
  }

  // Export NRP contracts
  static async exportNRPContracts(req, res) {
    try {
      const { format = "pdf", semester_id, program_type } = req.query;

      let queryStr = `
        SELECT 
          wn.nrp_id,
          wn.contract_number,
          wn.program_type,
          wn.academic_year,
          wn.course_code,
          wn.course_title,
          wn.credit_hours,
          wn.teaching_hours,
          wn.total_payment,
          sp.first_name,
          sp.last_name,
          sp.employee_id,
          sp.academic_rank,
          d.department_name,
          s.semester_name,
          u.username as approved_by,
          wn.status,
          wn.created_at
        FROM workload_nrp wn
        LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
        LEFT JOIN departments d ON sp.department_id = d.department_id
        LEFT JOIN semesters s ON wn.semester_id = s.semester_id
        LEFT JOIN users u ON wn.approved_by = u.user_id
        WHERE 1=1
      `;

      const params = [];

      if (semester_id) {
        queryStr += " AND wn.semester_id = ?";
        params.push(semester_id);
      }

      if (program_type) {
        queryStr += " AND wn.program_type = ?";
        params.push(program_type);
      }

      queryStr += " ORDER BY wn.created_at DESC";

      const contracts = await query(queryStr, params);

      const exportData = {
        metadata: {
          title: "NRP Contracts Report",
          filters: { semester_id, program_type },
          generated_at: new Date().toISOString(),
          total_records: contracts.length,
        },
        data: contracts,
      };

      if (format === "pdf") {
        return ExportController.generatePDF(res, exportData, "nrp_contracts");
      } else if (format === "excel") {
        return ExportController.generateExcel(res, exportData, "nrp_contracts");
      } else {
        return ExportController.generateCSV(res, exportData, "nrp_contracts");
      }
    } catch (error) {
      console.error("Export NRP contracts error:", error);
      return sendError(res, "Failed to export NRP contracts", 500);
    }
  }

  // ============ HELPER METHODS ============

  // Generate PDF document
  static generatePDF(res, data, filename) {
    try {
      const doc = new PDFDocument({ margin: 50 });

      // Set headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}_${Date.now()}.pdf"`
      );

      // Pipe PDF to response
      doc.pipe(res);

      // Add content
      doc.fontSize(20).text(data.metadata.title, { align: "center" });
      doc.moveDown();

      doc
        .fontSize(12)
        .text(
          `Generated: ${new Date(data.metadata.generated_at).toLocaleString()}`
        );
      doc.text(`Total Records: ${data.metadata.total_records || 0}`);
      doc.moveDown();

      // Add data table (simplified)
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const headers = Object.keys(data.data[0]);

        headers.forEach((header) => {
          doc.text(header.toUpperCase(), { continued: true, width: 100 });
        });
        doc.moveDown();

        data.data.slice(0, 50).forEach((row) => {
          // Limit to 50 rows for PDF
          headers.forEach((header) => {
            doc.text(String(row[header] || ""), {
              continued: true,
              width: 100,
            });
          });
          doc.moveDown();
        });

        if (data.data.length > 50) {
          doc.moveDown();
          doc.text(`... and ${data.data.length - 50} more records`);
        }
      }

      // Add summary if exists
      if (data.metadata.totals) {
        doc.moveDown();
        doc.fontSize(14).text("Summary:", { underline: true });
        Object.entries(data.metadata.totals).forEach(([key, value]) => {
          doc.text(
            `${key.replace("_", " ").toUpperCase()}: ${value.toFixed(2)}`
          );
        });
      }

      doc.end();
    } catch (error) {
      console.error("Generate PDF error:", error);
      return sendError(res, "Failed to generate PDF", 500);
    }
  }

  // Generate Excel document
  static async generateExcel(res, data, filename) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      // Add metadata
      worksheet.addRow([data.metadata.title]);
      worksheet.addRow([
        `Generated: ${new Date(data.metadata.generated_at).toLocaleString()}`,
      ]);
      worksheet.addRow([`Total Records: ${data.metadata.total_records || 0}`]);
      worksheet.addRow([]);

      // Add headers
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const headers = Object.keys(data.data[0]);
        worksheet.addRow(headers.map((h) => h.toUpperCase().replace("_", " ")));

        // Style header row
        const headerRow = worksheet.getRow(worksheet.rowCount);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };

        // Add data rows
        data.data.forEach((row) => {
          worksheet.addRow(headers.map((h) => row[h] || ""));
        });

        // Auto-fit columns
        headers.forEach((header, index) => {
          const column = worksheet.getColumn(index + 1);
          column.width = Math.max(15, header.length + 5);
        });
      }

      // Add summary sheet if totals exist
      if (data.metadata.totals) {
        const summarySheet = workbook.addWorksheet("Summary");
        summarySheet.addRow(["SUMMARY"]);
        summarySheet.addRow([]);

        Object.entries(data.metadata.totals).forEach(([key, value]) => {
          summarySheet.addRow([
            key.replace("_", " ").toUpperCase(),
            value.toFixed(2),
          ]);
        });
      }

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}_${Date.now()}.xlsx"`
      );

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Generate Excel error:", error);
      return sendError(res, "Failed to generate Excel file", 500);
    }
  }

  // Generate CSV document
  static generateCSV(res, data, filename) {
    try {
      let csvContent = "";

      // Add metadata as comments
      csvContent += `# ${data.metadata.title}\n`;
      csvContent += `# Generated: ${new Date(
        data.metadata.generated_at
      ).toLocaleString()}\n`;
      csvContent += `# Total Records: ${data.metadata.total_records || 0}\n`;

      // Add data
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const headers = Object.keys(data.data[0]);

        // Add headers
        csvContent += headers.map((h) => `"${h}"`).join(",") + "\n";

        // Add data rows
        data.data.forEach((row) => {
          csvContent +=
            headers
              .map((h) => {
                const value = row[h];
                if (value === null || value === undefined) return '""';
                if (typeof value === "string")
                  return `"${value.replace(/"/g, '""')}"`;
                return `"${value}"`;
              })
              .join(",") + "\n";
        });
      }

      // Set response headers
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}_${Date.now()}.csv"`
      );

      res.send(csvContent);
    } catch (error) {
      console.error("Generate CSV error:", error);
      return sendError(res, "Failed to generate CSV", 500);
    }
  }

  // ============ REPORT GENERATION METHODS ============

  static async generateFinancialReport(filters) {
    const { year, semester_id } = filters;

    let queryStr = `
      SELECT 
        MONTH(ps.created_at) as month,
        ps.payment_type,
        COUNT(*) as transaction_count,
        SUM(ps.gross_amount) as total_gross,
        SUM(ps.tax_amount) as total_tax,
        SUM(ps.net_amount) as total_net
      FROM payment_sheets ps
      WHERE ps.payment_status = 'paid'
    `;

    const params = [];

    if (year) {
      queryStr += " AND YEAR(ps.created_at) = ?";
      params.push(year);
    }

    if (semester_id) {
      queryStr += " AND ps.semester_id = ?";
      params.push(semester_id);
    }

    queryStr +=
      " GROUP BY MONTH(ps.created_at), ps.payment_type ORDER BY month";

    const monthlyData = await query(queryStr, params);

    // Get category breakdown
    const [categoryBreakdown] = await query(`
      SELECT 
        payment_type,
        COUNT(*) as count,
        SUM(gross_amount) as total
      FROM payment_sheets
      WHERE payment_status = 'paid'
      GROUP BY payment_type
    `);

    return {
      monthly_data: monthlyData,
      category_breakdown: categoryBreakdown,
      summary: {
        total_transactions: monthlyData.reduce(
          (sum, row) => sum + row.transaction_count,
          0
        ),
        total_revenue: monthlyData.reduce((sum, row) => sum + row.total_net, 0),
      },
    };
  }

  static async generateWorkloadAnalysis(filters) {
    const { semester_id, department_id } = filters;

    let queryStr = `
      SELECT 
        d.department_name,
        sp.academic_rank,
        COUNT(DISTINCT wr.staff_id) as staff_count,
        COUNT(wr.workload_id) as workload_count,
        AVG(wr.total_load) as avg_load,
        SUM(CASE WHEN wr.total_load > 12 THEN 1 ELSE 0 END) as overload_count
      FROM workload_rp wr
      LEFT JOIN staff_profiles sp ON wr.staff_id = sp.staff_id
      LEFT JOIN departments d ON sp.department_id = d.department_id
      WHERE wr.status = 'approved'
    `;

    const params = [];

    if (semester_id) {
      queryStr += " AND wr.semester_id = ?";
      params.push(semester_id);
    }

    if (department_id) {
      queryStr += " AND sp.department_id = ?";
      params.push(department_id);
    }

    queryStr +=
      " GROUP BY d.department_name, sp.academic_rank ORDER BY d.department_name";

    const analysis = await query(queryStr, params);

    return {
      department_analysis: analysis,
      summary: {
        total_staff: analysis.reduce((sum, row) => sum + row.staff_count, 0),
        total_workloads: analysis.reduce(
          (sum, row) => sum + row.workload_count,
          0
        ),
        overload_percentage:
          analysis.length > 0
            ? (
                (analysis.reduce((sum, row) => sum + row.overload_count, 0) /
                  analysis.reduce((sum, row) => sum + row.workload_count, 0)) *
                100
              ).toFixed(2)
            : 0,
      },
    };
  }

  static async generateStaffPerformanceReport(filters) {
    const { year, department_id } = filters;

    const report = await query(
      `
      SELECT 
        sp.staff_id,
        sp.first_name,
        sp.last_name,
        sp.employee_id,
        sp.academic_rank,
        d.department_name,
        COUNT(DISTINCT wr.workload_id) as total_workloads,
        COUNT(DISTINCT wn.nrp_id) as total_nrp_contracts,
        COALESCE(SUM(wr.total_load), 0) as total_rp_load,
        COALESCE(SUM(wn.total_hours_worked), 0) as total_nrp_hours,
        COALESCE(SUM(ps.net_amount), 0) as total_payments
      FROM staff_profiles sp
      LEFT JOIN departments d ON sp.department_id = d.department_id
      LEFT JOIN workload_rp wr ON sp.staff_id = wr.staff_id AND wr.status = 'approved'
      LEFT JOIN workload_nrp wn ON sp.staff_id = wn.staff_id AND wn.status IN ('approved', 'paid')
      LEFT JOIN payment_sheets ps ON wn.nrp_id = ps.nrp_id AND ps.payment_status = 'paid'
      WHERE 1=1
      ${department_id ? " AND sp.department_id = ?" : ""}
      GROUP BY sp.staff_id
      ORDER BY total_payments DESC
    `,
      department_id ? [department_id] : []
    );

    return {
      staff_performance: report,
      summary: {
        total_staff: report.length,
        average_load:
          report.length > 0
            ? report.reduce((sum, row) => sum + row.total_rp_load, 0) /
              report.length
            : 0,
        total_payments: report.reduce(
          (sum, row) => sum + row.total_payments,
          0
        ),
      },
    };
  }

  static async generateCourseOfferingsReport(filters) {
    const { semester_id, department_id } = filters;

    const offerings = await query(
      `
      SELECT 
        c.course_code,
        c.course_title,
        c.credit_hours,
        d.department_name,
        p.program_name,
        COUNT(DISTINCT s.section_id) as total_sections,
        SUM(s.student_count) as total_students,
        COUNT(DISTINCT s.instructor_id) as total_instructors
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.department_id
      LEFT JOIN programs p ON c.program_id = p.program_id
      LEFT JOIN sections s ON c.course_id = s.course_id
      WHERE 1=1
      ${semester_id ? " AND s.semester_id = ?" : ""}
      ${department_id ? " AND c.department_id = ?" : ""}
      GROUP BY c.course_id
      ORDER BY total_students DESC
    `,
      [semester_id, department_id].filter(Boolean)
    );

    return {
      course_offerings: offerings,
      summary: {
        total_courses: offerings.length,
        total_sections: offerings.reduce(
          (sum, row) => sum + row.total_sections,
          0
        ),
        total_students: offerings.reduce(
          (sum, row) => sum + row.total_students,
          0
        ),
        average_enrollment:
          offerings.length > 0
            ? offerings.reduce((sum, row) => sum + row.total_students, 0) /
              offerings.reduce((sum, row) => sum + row.total_sections, 0)
            : 0,
      },
    };
  }
}

export default ExportController;
