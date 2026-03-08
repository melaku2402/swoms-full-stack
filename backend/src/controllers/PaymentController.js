// ============================================
// FILE: src/controllers/PaymentController.js
// ============================================
import { query } from "../config/database.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { PAYMENT_STATUSES, NRP_PROGRAM_TYPES } from "../config/constants.js";

class PaymentController {
  // Get all payment sheets
  static async getAllPaymentSheets(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        payment_type,
        payment_status,
        semester_id,
        program_type,
        staff_id,
        from_date,
        to_date,
      } = req.query;

      let whereClause = "";
      const params = [];

      if (payment_type) {
        whereClause = "WHERE ps.payment_type = ?";
        params.push(payment_type);
      }

      if (payment_status) {
        whereClause = whereClause
          ? `${whereClause} AND ps.payment_status = ?`
          : "WHERE ps.payment_status = ?";
        params.push(payment_status);
      }

      if (semester_id) {
        whereClause = whereClause
          ? `${whereClause} AND s.semester_id = ?`
          : "WHERE s.semester_id = ?";
        params.push(parseInt(semester_id));
      }

      if (program_type) {
        whereClause = whereClause
          ? `${whereClause} AND wn.program_type = ?`
          : "WHERE wn.program_type = ?";
        params.push(program_type);
      }

      if (staff_id) {
        whereClause = whereClause
          ? `${whereClause} AND sp.staff_id = ?`
          : "WHERE sp.staff_id = ?";
        params.push(parseInt(staff_id));
      }

      if (from_date) {
        whereClause = whereClause
          ? `${whereClause} AND ps.created_at >= ?`
          : "WHERE ps.created_at >= ?";
        params.push(from_date);
      }

      if (to_date) {
        whereClause = whereClause
          ? `${whereClause} AND ps.created_at <= ?`
          : "WHERE ps.created_at <= ?";
        params.push(to_date);
      }

      const offset = (page - 1) * limit;

      const paymentSheets = await query(
        `SELECT 
          ps.*,
          sp.first_name, sp.last_name, sp.employee_id,
          d.department_name,
          wn.program_type,
          wn.contract_number,
          s.semester_code, s.semester_name,
          u.username as approved_by_username
         FROM payment_sheets ps
         LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
         LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN semesters s ON wn.semester_id = s.semester_id
         LEFT JOIN users u ON ps.approved_by = u.user_id
         ${whereClause}
         ORDER BY ps.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      const totalResult = await query(
        `SELECT COUNT(*) as count 
         FROM payment_sheets ps
         LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
         LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         ${whereClause}`,
        params
      );

      const total = totalResult[0].count;

      // Calculate totals
      const [totals] = await query(
        `SELECT 
          SUM(ps.gross_amount) as total_gross,
          SUM(ps.tax_amount) as total_tax,
          SUM(ps.net_amount) as total_net
         FROM payment_sheets ps
         LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
         ${whereClause}`,
        params
      );

      return sendSuccess(res, "Payment sheets retrieved successfully", {
        payment_sheets: paymentSheets,
        totals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get payment sheets error:", error);
      return sendError(res, "Failed to retrieve payment sheets", 500);
    }
  }

  // Get payment sheet by ID
  static async getPaymentSheetById(req, res) {
    try {
      const { id } = req.params;

      const [paymentSheet] = await query(
        `SELECT 
          ps.*,
          sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank,
          d.department_name, d.department_code,
          c.college_name, c.college_code,
          wn.program_type, wn.contract_number, wn.total_payment as workload_total,
          s.semester_code, s.semester_name,
          ay.year_code, ay.year_name,
          u.username as approved_by_username, u.email as approved_by_email,
          cr.course_code, cr.course_title
         FROM payment_sheets ps
         LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
         LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         LEFT JOIN semesters s ON wn.semester_id = s.semester_id
         LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
         LEFT JOIN users u ON ps.approved_by = u.user_id
         LEFT JOIN courses cr ON wn.course_id = cr.course_id
         WHERE ps.payment_id = ?`,
        [parseInt(id)]
      );

      if (!paymentSheet) {
        return sendError(res, "Payment sheet not found", 404);
      }

      return sendSuccess(
        res,
        "Payment sheet retrieved successfully",
        paymentSheet
      );
    } catch (error) {
      console.error("Get payment sheet error:", error);
      return sendError(res, "Failed to retrieve payment sheet", 500);
    }
  }

  // Update payment status
  static async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { payment_status, approved_by, approved_date, export_format } =
        req.body;

      if (
        !payment_status ||
        !Object.values(PAYMENT_STATUSES).includes(payment_status)
      ) {
        return sendError(res, "Valid payment status is required", 400);
      }

      // Check if payment sheet exists
      const [existingSheet] = await query(
        "SELECT * FROM payment_sheets WHERE payment_id = ?",
        [parseInt(id)]
      );

      if (!existingSheet) {
        return sendError(res, "Payment sheet not found", 404);
      }

      const updateData = { payment_status };
      if (approved_by) updateData.approved_by = parseInt(approved_by);
      if (approved_date) updateData.approved_date = approved_date;
      if (export_format) updateData.export_format = export_format;

      // If marking as paid, set approved_by to current user if not provided
      if (payment_status === "paid" && !approved_by) {
        updateData.approved_by = req.user.user_id;
        updateData.approved_date = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      }

      const fields = Object.keys(updateData);
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = [
        ...fields.map((field) => updateData[field]),
        parseInt(id),
      ];

      await query(
        `UPDATE payment_sheets SET ${setClause} WHERE payment_id = ?`,
        values
      );

      // Get updated payment sheet
      const [updatedSheet] = await query(
        "SELECT * FROM payment_sheets WHERE payment_id = ?",
        [parseInt(id)]
      );

      return sendSuccess(
        res,
        "Payment status updated successfully",
        updatedSheet
      );
    } catch (error) {
      console.error("Update payment status error:", error);
      return sendError(res, "Failed to update payment status", 500);
    }
  }

  // Export payment sheet
  static async exportPaymentSheet(req, res) {
    try {
      const { id } = req.params;
      const { format = "pdf" } = req.query;

      if (!["pdf", "excel"].includes(format)) {
        return sendError(
          res,
          "Invalid export format. Use 'pdf' or 'excel'",
          400
        );
      }

      // Get payment sheet with all details
      const [paymentSheet] = await query(
        `SELECT 
          ps.*,
          sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank,
          d.department_name, d.department_code,
          c.college_name,
          wn.program_type, wn.contract_number, wn.credit_hours, wn.student_count,
          wn.teaching_payment, wn.tutorial_payment, wn.assignment_payment, wn.exam_payment,
          s.semester_code, s.semester_name,
          ay.year_code, ay.year_name,
          cr.course_code, cr.course_title
         FROM payment_sheets ps
         LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
         LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         LEFT JOIN semesters s ON wn.semester_id = s.semester_id
         LEFT JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
         LEFT JOIN courses cr ON wn.course_id = cr.course_id
         WHERE ps.payment_id = ?`,
        [parseInt(id)]
      );

      if (!paymentSheet) {
        return sendError(res, "Payment sheet not found", 404);
      }

      // Update export format
      await query(
        "UPDATE payment_sheets SET export_format = ? WHERE payment_id = ?",
        [format, parseInt(id)]
      );

      // In a real implementation, you would generate PDF/Excel file here
      // For now, return the data that would be exported
      const exportData = {
        sheet_number: paymentSheet.sheet_number,
        payment_type: paymentSheet.payment_type,
        program_type: paymentSheet.program_type,
        staff: {
          name: `${paymentSheet.first_name} ${paymentSheet.last_name}`,
          employee_id: paymentSheet.employee_id,
          academic_rank: paymentSheet.academic_rank,
          department: paymentSheet.department_name,
          college: paymentSheet.college_name,
        },
        semester: {
          code: paymentSheet.semester_code,
          name: paymentSheet.semester_name,
          academic_year: paymentSheet.year_code,
        },
        course: paymentSheet.course_code
          ? {
              code: paymentSheet.course_code,
              title: paymentSheet.course_title,
            }
          : null,
        contract_number: paymentSheet.contract_number,
        financial_details: {
          gross_amount: paymentSheet.gross_amount,
          tax_rate: (paymentSheet.tax_amount / paymentSheet.gross_amount) * 100,
          tax_amount: paymentSheet.tax_amount,
          net_amount: paymentSheet.net_amount,
        },
        workload_breakdown: {
          teaching: paymentSheet.teaching_payment,
          tutorial: paymentSheet.tutorial_payment,
          assignment: paymentSheet.assignment_payment,
          exam: paymentSheet.exam_payment,
          total_before_tax:
            paymentSheet.teaching_payment +
            paymentSheet.tutorial_payment +
            paymentSheet.assignment_payment +
            paymentSheet.exam_payment,
        },
        additional_info: {
          credit_hours: paymentSheet.credit_hours,
          student_count: paymentSheet.student_count,
          payment_status: paymentSheet.payment_status,
          generated_date: new Date().toISOString().split("T")[0],
        },
      };

      return sendSuccess(res, "Payment sheet export data", {
        format,
        data: exportData,
        download_url: `/api/payments/${id}/download?format=${format}`, // Mock download URL
      });
    } catch (error) {
      console.error("Export payment sheet error:", error);
      return sendError(res, "Failed to export payment sheet", 500);
    }
  }

  // Get payment statistics
  static async getPaymentStatistics(req, res) {
    try {
      const { semester_id, program_type, department_id } = req.query;

      let whereClause = "";
      const params = [];

      if (semester_id) {
        whereClause = "WHERE s.semester_id = ?";
        params.push(parseInt(semester_id));
      }

      if (program_type) {
        whereClause = whereClause
          ? `${whereClause} AND wn.program_type = ?`
          : "WHERE wn.program_type = ?";
        params.push(program_type);
      }

      if (department_id) {
        whereClause = whereClause
          ? `${whereClause} AND sp.department_id = ?`
          : "WHERE sp.department_id = ?";
        params.push(parseInt(department_id));
      }

      const stats = await query(
        `SELECT 
          ps.payment_type,
          wn.program_type,
          COUNT(*) as total_payments,
          SUM(ps.gross_amount) as total_gross,
          SUM(ps.tax_amount) as total_tax,
          SUM(ps.net_amount) as total_net,
          AVG(ps.gross_amount) as avg_gross,
          AVG(ps.net_amount) as avg_net,
          COUNT(CASE WHEN ps.payment_status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN ps.payment_status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN ps.payment_status = 'paid' THEN 1 END) as paid_count,
          COUNT(CASE WHEN ps.payment_status = 'rejected' THEN 1 END) as rejected_count,
          COUNT(DISTINCT ps.nrp_id) as unique_workloads,
          COUNT(DISTINCT sp.staff_id) as unique_staff
         FROM payment_sheets ps
         LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
         LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         LEFT JOIN semesters s ON wn.semester_id = s.semester_id
         ${whereClause}
         GROUP BY ps.payment_type, wn.program_type
         ORDER BY total_net DESC`,
        params
      );

      // Get overall totals
      const [overall] = await query(
        `SELECT 
          COUNT(*) as total_all,
          SUM(ps.gross_amount) as gross_all,
          SUM(ps.tax_amount) as tax_all,
          SUM(ps.net_amount) as net_all
         FROM payment_sheets ps
         LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
         LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         ${whereClause}`,
        params
      );

      return sendSuccess(res, "Payment statistics retrieved", {
        by_program: stats,
        overall,
      });
    } catch (error) {
      console.error("Get payment statistics error:", error);
      return sendError(res, "Failed to retrieve payment statistics", 500);
    }
  }

  // Bulk update payment status
  static async bulkUpdatePaymentStatus(req, res) {
    try {
      const { payment_ids, payment_status, approved_by } = req.body;

      if (
        !payment_ids ||
        !Array.isArray(payment_ids) ||
        payment_ids.length === 0
      ) {
        return sendError(res, "Payment IDs array is required", 400);
      }

      if (
        !payment_status ||
        !Object.values(PAYMENT_STATUSES).includes(payment_status)
      ) {
        return sendError(res, "Valid payment status is required", 400);
      }

      const placeholders = payment_ids.map(() => "?").join(",");
      const params = [payment_status];

      if (payment_status === "paid" || payment_status === "approved") {
        params.push(approved_by || req.user.user_id);
        params.push(new Date().toISOString().slice(0, 19).replace("T", " "));
      }

      params.push(...payment_ids.map((id) => parseInt(id)));

      const updateFields =
        payment_status === "paid" || payment_status === "approved"
          ? "payment_status = ?, approved_by = ?, approved_date = ?"
          : "payment_status = ?";

      const result = await query(
        `UPDATE payment_sheets 
         SET ${updateFields}, updated_at = NOW()
         WHERE payment_id IN (${placeholders})`,
        params
      );

      return sendSuccess(res, "Payment statuses updated successfully", {
        updated_count: result.affectedRows,
        payment_ids,
        payment_status,
      });
    } catch (error) {
      console.error("Bulk update payment status error:", error);
      return sendError(res, "Failed to update payment statuses", 500);
    }
  }

  
    // Calculate NRP payment (NEW)
    static async calculateNRPPayment(req, res) {
      try {
        const { nrp_id } = req.params;
        const { tax_rate, student_multiplier } = req.body;
  
        // Get NRP workload
        const nrpWorkload = await WorkloadNRPModel.findById(nrp_id);
        if (!nrpWorkload) {
          return sendError(res, "NRP workload not found", 404);
        }
  
        // Calculate payment using service
        const calculation = await PaymentService.calculateNRPPayment(
          nrp_id,
          tax_rate,
          student_multiplier
        );
  
        return sendSuccess(res, "Payment calculated successfully", {
          nrp_workload: nrpWorkload,
          calculation,
        });
      } catch (error) {
        console.error("Calculate NRP payment error:", error);
        return sendError(res, "Failed to calculate payment", 500);
      }
    }
  
    // Calculate overload payment (NEW)
    static async calculateOverloadPayment(req, res) {
      try {
        const { staff_id, semester_id } = req.params;
        const { overload_hours, rate_per_hour } = req.body;
  
        if (!overload_hours || overload_hours <= 0) {
          return sendError(res, "Valid overload hours required", 400);
        }
  
        const calculation = await PaymentService.calculateOverloadPayment(
          staff_id,
          semester_id,
          overload_hours,
          rate_per_hour
        );
  
        return sendSuccess(res, "Overload payment calculated successfully", {
          calculation,
        });
      } catch (error) {
        console.error("Calculate overload payment error:", error);
        return sendError(res, "Failed to calculate overload payment", 500);
      }
    }
  
    // Create payment sheet for NRP (NEW)
    static async createNRPPaymentSheet(req, res) {
      try {
        const { nrp_id } = req.params;
        const { tax_rate } = req.body;
  
        // Get NRP workload
        const nrpWorkload = await WorkloadNRPModel.findById(nrp_id);
        if (!nrpWorkload) {
          return sendError(res, "NRP workload not found", 404);
        }
  
        // Calculate payment
        const calculation = await PaymentService.calculateNRPPayment(
          nrp_id,
          tax_rate
        );
  
        // Create payment sheet
        const sheetNumber = `PSH-NRP-${nrp_id}-${Date.now()
          .toString()
          .slice(-6)}`;
  
        const [result] = await query(
          `INSERT INTO payment_sheets 
           (nrp_id, payment_type, sheet_number, 
            gross_amount, tax_amount, net_amount, payment_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            nrp_id,
            nrpWorkload.program_type,
            sheetNumber,
            calculation.calculations.gross_amount,
            calculation.calculations.tax_amount,
            calculation.calculations.net_amount,
            PAYMENT_STATUSES.PENDING,
          ]
        );
  
        // Get created payment sheet
        const [paymentSheet] = await query(
          `SELECT * FROM payment_sheets WHERE payment_id = ?`,
          [result.insertId]
        );
  
        return sendSuccess(
          res,
          "Payment sheet created successfully",
          {
            payment_sheet: paymentSheet,
            calculation,
          },
          201
        );
      } catch (error) {
        console.error("Create NRP payment sheet error:", error);
        return sendError(res, "Failed to create payment sheet", 500);
      }
    }
  
    // Create payment sheet for overload (NEW)
    static async createOverloadPaymentSheet(req, res) {
      try {
        const { overload_id } = req.params;
  
        // Get overload payment
        const overloadPayment = await OverloadModel.findById(overload_id);
        if (!overloadPayment) {
          return sendError(res, "Overload payment not found", 404);
        }
  
        // Create payment sheet
        const sheetNumber = `PSH-OVL-${overload_id}-${Date.now()
          .toString()
          .slice(-6)}`;
  
        const [result] = await query(
          `INSERT INTO payment_sheets 
           (overload_id, payment_type, sheet_number, 
            gross_amount, tax_amount, net_amount, payment_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            overload_id,
            "overload",
            sheetNumber,
            overloadPayment.gross_amount,
            overloadPayment.tax_amount,
            overloadPayment.net_amount,
            PAYMENT_STATUSES.PENDING,
          ]
        );
  
        // Get created payment sheet
        const [paymentSheet] = await query(
          `SELECT * FROM payment_sheets WHERE payment_id = ?`,
          [result.insertId]
        );
  
        return sendSuccess(
          res,
          "Overload payment sheet created successfully",
          {
            payment_sheet: paymentSheet,
            overload_payment: overloadPayment,
          },
          201
        );
      } catch (error) {
        console.error("Create overload payment sheet error:", error);
        return sendError(res, "Failed to create overload payment sheet", 500);
      }
    }
  
    // Get payments by staff (NEW)
    static async getPaymentsByStaff(req, res) {
      try {
        const { staffId } = req.params;
        const { page = 1, limit = 20, semester_id } = req.query;
  
        const offset = (page - 1) * limit;
  
        const payments = await query(
          `SELECT ps.*,
                  wn.program_type,
                  s.semester_code, s.semester_name,
                  CASE 
                    WHEN ps.nrp_id IS NOT NULL THEN c.course_code
                    ELSE NULL
                  END as course_code
           FROM payment_sheets ps
           LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
           LEFT JOIN overload_payments op ON ps.overload_id = op.overload_id
           LEFT JOIN semesters s ON 
             (wn.semester_id = s.semester_id OR op.semester_id = s.semester_id)
           LEFT JOIN courses c ON wn.course_id = c.course_id
           WHERE (wn.staff_id = ? OR op.staff_id = ?)
             ${semester_id ? "AND s.semester_id = ?" : ""}
           ORDER BY ps.created_at DESC
           LIMIT ? OFFSET ?`,
          semester_id
            ? [staffId, staffId, semester_id, limit, offset]
            : [staffId, staffId, limit, offset]
        );
  
        const [totalResult] = await query(
          `SELECT COUNT(*) as count
           FROM payment_sheets ps
           LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
           LEFT JOIN overload_payments op ON ps.overload_id = op.overload_id
           WHERE (wn.staff_id = ? OR op.staff_id = ?)
             ${
               semester_id ? "AND (wn.semester_id = ? OR op.semester_id = ?)" : ""
             }`,
          semester_id
            ? [staffId, staffId, semester_id, semester_id]
            : [staffId, staffId]
        );
  
        const total = totalResult.count;
  
        return sendSuccess(res, "Staff payments retrieved", {
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error("Get payments by staff error:", error);
        return sendError(res, "Failed to retrieve staff payments", 500);
      }
    }
  
    // Get payments by semester (NEW)
    static async getPaymentsBySemester(req, res) {
      try {
        const { semesterId } = req.params;
        const { page = 1, limit = 50 } = req.query;
  
        const offset = (page - 1) * limit;
  
        const payments = await query(
          `SELECT ps.*,
                  sp.first_name, sp.last_name, sp.employee_id,
                  wn.program_type,
                  c.course_code, c.course_title,
                  op.overload_hours
           FROM payment_sheets ps
           LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id AND wn.semester_id = ?
           LEFT JOIN overload_payments op ON ps.overload_id = op.overload_id AND op.semester_id = ?
           LEFT JOIN staff_profiles sp ON 
             (wn.staff_id = sp.staff_id OR op.staff_id = sp.staff_id)
           LEFT JOIN courses c ON wn.course_id = c.course_id
           WHERE (wn.nrp_id IS NOT NULL OR op.overload_id IS NOT NULL)
           ORDER BY ps.created_at DESC
           LIMIT ? OFFSET ?`,
          [semesterId, semesterId, limit, offset]
        );
  
        const [totalResult] = await query(
          `SELECT COUNT(*) as count
           FROM payment_sheets ps
           LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id AND wn.semester_id = ?
           LEFT JOIN overload_payments op ON ps.overload_id = op.overload_id AND op.semester_id = ?
           WHERE (wn.nrp_id IS NOT NULL OR op.overload_id IS NOT NULL)`,
          [semesterId, semesterId]
        );
  
        const total = totalResult.count;
  
        return sendSuccess(res, "Semester payments retrieved", {
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error("Get payments by semester error:", error);
        return sendError(res, "Failed to retrieve semester payments", 500);
      }
    }
  
    // Download payment sheet file (NEW)
    static async downloadPaymentSheet(req, res) {
      try {
        const { id } = req.params;
        const { format = "pdf" } = req.query;
  
        // Get payment sheet
        const [paymentSheet] = await query(
          `SELECT ps.*,
                  sp.first_name, sp.last_name, sp.employee_id,
                  d.department_name,
                  wn.program_type, wn.credit_hours, wn.student_count,
                  s.semester_code, s.semester_name
           FROM payment_sheets ps
           LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
           LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
           LEFT JOIN departments d ON sp.department_id = d.department_id
           LEFT JOIN semesters s ON wn.semester_id = s.semester_id
           WHERE ps.payment_id = ?`,
          [parseInt(id)]
        );
  
        if (!paymentSheet) {
          return sendError(res, "Payment sheet not found", 404);
        }
  
        // Generate file content based on format
        let content, contentType, filename;
  
        if (format === "pdf") {
          // In real app, generate PDF using PDFKit or similar
          content = JSON.stringify(paymentSheet, null, 2);
          contentType = "application/pdf";
          filename = `payment_${paymentSheet.sheet_number}.pdf`;
        } else if (format === "excel") {
          // In real app, generate Excel using exceljs or similar
          content = JSON.stringify(paymentSheet, null, 2);
          contentType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          filename = `payment_${paymentSheet.sheet_number}.xlsx`;
        } else {
          return sendError(res, "Invalid format. Use 'pdf' or 'excel'", 400);
        }
  
        // Set headers for download
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        res.setHeader("Content-Type", contentType);
  
        return res.send(content);
      } catch (error) {
        console.error("Download payment sheet error:", error);
        return sendError(res, "Failed to download payment sheet", 500);
      }
    }
  
    // Generate payment summary report (NEW)
    static async generatePaymentSummary(req, res) {
      try {
        const { semester_id, program_type, department_id } = req.query;
  
        let whereClause = "";
        const params = [];
  
        if (semester_id) {
          whereClause = "WHERE s.semester_id = ?";
          params.push(parseInt(semester_id));
        }
  
        if (program_type) {
          whereClause = whereClause
            ? `${whereClause} AND wn.program_type = ?`
            : "WHERE wn.program_type = ?";
          params.push(program_type);
        }
  
        if (department_id) {
          whereClause = whereClause
            ? `${whereClause} AND sp.department_id = ?`
            : "WHERE sp.department_id = ?";
          params.push(parseInt(department_id));
        }
  
        // Get summary data
        const summary = await query(
          `SELECT 
             COUNT(DISTINCT ps.payment_id) as total_payments,
             COUNT(DISTINCT sp.staff_id) as total_staff,
             SUM(ps.gross_amount) as total_gross,
             SUM(ps.tax_amount) as total_tax,
             SUM(ps.net_amount) as total_net,
             wn.program_type,
             COUNT(*) as program_count,
             AVG(ps.net_amount) as avg_payment
           FROM payment_sheets ps
           LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
           LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
           LEFT JOIN semesters s ON wn.semester_id = s.semester_id
           ${whereClause}
           GROUP BY wn.program_type`,
          params
        );
  
        // Get payment status distribution
        const statusDistribution = await query(
          `SELECT 
             ps.payment_status,
             COUNT(*) as count,
             SUM(ps.net_amount) as total_amount
           FROM payment_sheets ps
           LEFT JOIN workload_nrp wn ON ps.nrp_id = wn.nrp_id
           LEFT JOIN semesters s ON wn.semester_id = s.semester_id
           ${whereClause}
           GROUP BY ps.payment_status`,
          params
        );
  
        return sendSuccess(res, "Payment summary generated", {
          summary,
          status_distribution: statusDistribution,
          filters: {
            semester_id,
            program_type,
            department_id,
          },
        });
      } catch (error) {
        console.error("Generate payment summary error:", error);
        return sendError(res, "Failed to generate payment summary", 500);
      }
    }
}

export default PaymentController;
