// src/controllers/WorkloadNRPController.js - ENHANCED VERSION
import WorkloadNRPModel from "../models/WorkloadNRPModel.js";
import WorkloadNRPService from "../services/WorkloadNRPService.js";
import StaffModel from "../models/StaffModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { query } from "../config/database.js";

class WorkloadNRPController {
  // Create NRP workload
  
  static async createNRPWorkload(req, res) {
    try {
      console.log("Creating NRP workload for user:", req.user);

      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Handle different roles
      let staff_id;

      if (user_role === "admin") {
        if (!req.body.staff_id) {
          return sendError(
            res,
            "Please specify which staff member this workload is for.",
            400
          );
        }
        staff_id = req.body.staff_id;
      } else if (user_role === "department_head" || user_role === "dean") {
        if (req.body.staff_id) {
          staff_id = req.body.staff_id;
        } else {
          const staff = await StaffModel.findByUserId(user_id);
          staff_id = staff?.staff_id;
        }
      } else if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        if (!staff) {
          return sendError(
            res,
            "We couldn't find your staff profile. Please contact the administrator to set up your profile first.",
            404
          );
        }
        staff_id = staff.staff_id;
      } else {
        return sendError(
          res,
          "You don't have permission to create workloads. Please contact your department head if you believe this is an error.",
          403
        );
      }

      // Validate staff_id
      if (!staff_id) {
        return sendError(
          res,
          "We couldn't identify which staff member this workload belongs to. Please try again or contact support.",
          404
        );
      }

      // Check if staff exists
      const staff = await StaffModel.findById(staff_id);
      if (!staff) {
        return sendError(
          res,
          "The staff member you specified doesn't exist in our records. Please check the staff ID and try again.",
          404
        );
      }

      const {
        semester_id,
        program_type,
        contract_number,
        academic_year,
        course_id,
        course_code,
        course_title,
        credit_hours = 0,
        lecture_credit_hours = 0,
        lab_credit_hours = 0,
        tutorial_credit_hours = 0,
        student_count = 0,
        teaching_hours = 0,
        module_hours = 0,
        lecture_sections = 0,
        lab_sections = 0,
        assignment_students = 0,
        exam_students = 0,
        rate_category = "default",
        contract_type = "teaching",
        academic_year_ec,
        contract_duration_from,
        contract_duration_to,
        is_overload = false,
        overload_hours = 0,
      } = req.body;

      // === VALIDATION WITH USER-FRIENDLY MESSAGES ===

      // Validate required fields
      if (!semester_id) {
        return sendError(
          res,
          "Please select which semester this workload is for.",
          400
        );
      }

      if (!program_type) {
        return sendError(
          res,
          "Please specify the program type (Extension, Weekend, Summer, or Distance).",
          400
        );
      }

      // Validate program type
      const validProgramTypes = ["extension", "weekend", "summer", "distance"];
      if (!validProgramTypes.includes(program_type.toLowerCase())) {
        return sendError(
          res,
          `"${program_type}" is not a valid program type. Please choose from: Extension, Weekend, Summer, or Distance.`,
          400
        );
      }

      // Generate contract number if not provided
      let finalContractNumber = contract_number;
      if (!finalContractNumber) {
        try {
          finalContractNumber = await WorkloadNRPService.generateContractNumber(
            program_type,
            semester_id
          );
          console.log(`Generated contract number: ${finalContractNumber}`);
        } catch (error) {
          console.error("Failed to generate contract number:", error);
          return sendError(
            res,
            "We couldn't generate a contract number. Please try again or enter one manually.",
            500
          );
        }
      }

      // === DUPLICATE CHECKS ===

      // 1. Check for duplicate contract number
      if (finalContractNumber) {
        try {
          const [existingContract] = await query(
            "SELECT nrp_id, status FROM workload_nrp WHERE contract_number = ? AND status != 'rejected'",
            [finalContractNumber]
          );

          if (existingContract) {
            const statusMessage =
              existingContract.status === "draft"
                ? "This contract number is already being used in a draft workload. You can edit the existing draft instead."
                : "This contract number is already in use. Please use a different contract number.";

            return sendError(
              res,
              `Contract number "${finalContractNumber}" is already taken. ${statusMessage}`,
              409
            );
          }
        } catch (dbError) {
          console.error("Database error during duplicate check:", dbError);
          // Continue with creation even if duplicate check fails
          console.log("Proceeding despite duplicate check error");
        }
      }

      // 2. Check for similar active workloads (simplified version)
      try {
        const similarWorkloadQuery = `
          SELECT nrp_id, status, course_code 
          FROM workload_nrp 
          WHERE staff_id = ? 
            AND semester_id = ? 
            AND program_type = ? 
            AND status IN ('draft', 'submitted', 'approved')
            AND (course_code = ? OR ? IS NULL)
        `;

        const [similarWorkload] = await query(similarWorkloadQuery, [
          staff_id,
          semester_id,
          program_type,
          course_code || null,
          course_code || null,
        ]);

        if (similarWorkload) {
          let message = "You already have ";

          if (similarWorkload.course_code) {
            message += `a ${program_type} workload for course ${similarWorkload.course_code} in this semester.`;
          } else {
            message += `a ${program_type} workload in this semester.`;
          }

          message +=
            " You can edit the existing workload instead of creating a new one.";

          return sendError(res, message, 400);
        }
      } catch (similarError) {
        console.error("Error checking for similar workloads:", similarError);
        // Continue if this check fails
      }

      // 3. Check submission frequency (rate limiting)
      try {
        const [recentSubmissions] = await query(
          `SELECT COUNT(*) as count FROM workload_nrp 
           WHERE staff_id = ? 
             AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)`,
          [staff_id]
        );

        if (recentSubmissions.count > 3) {
          return sendError(
            res,
            "You're creating workloads too quickly. Please wait a few minutes before creating another one.",
            429
          );
        }
      } catch (rateLimitError) {
        console.error("Rate limit check failed:", rateLimitError);
        // Continue if rate limiting fails
      }

      // === DATA PREPARATION ===

      // Calculate total hours
      const total_hours_worked = teaching_hours + module_hours + overload_hours;

      // Helper function to clean numeric values
      const cleanNumericValue = (value) => {
        if (value === null || value === undefined || value === "") return 0;
        const strValue = String(value).replace(/,/g, "").trim();
        const parts = strValue.split(".");
        if (parts.length > 2) {
          return parseFloat(parts[0] + "." + parts[1]) || 0;
        }
        return parseFloat(strValue) || 0;
      };

      const nrpData = {
        staff_id,
        semester_id,
        program_type,
        contract_number: finalContractNumber,
        academic_year: academic_year || `${new Date().getFullYear()}`,
        course_id: course_id || null,
        course_code: course_code || "",
        course_title: course_title || "",
        credit_hours: cleanNumericValue(credit_hours),
        lecture_credit_hours: cleanNumericValue(lecture_credit_hours),
        lab_credit_hours: cleanNumericValue(lab_credit_hours),
        tutorial_credit_hours: cleanNumericValue(tutorial_credit_hours),
        student_count: parseInt(student_count) || 0,
        teaching_hours: cleanNumericValue(teaching_hours),
        module_hours: cleanNumericValue(module_hours),
        lecture_sections: parseInt(lecture_sections) || 0,
        lab_sections: parseInt(lab_sections) || 0,
        assignment_students: parseInt(assignment_students) || 0,
        exam_students: parseInt(exam_students) || 0,
        rate_category: rate_category || "default",
        contract_type,
        academic_year_ec,
        contract_duration_from,
        contract_duration_to,
        is_overload: is_overload ? 1 : 0,
        overload_hours: cleanNumericValue(overload_hours),
        total_hours_worked: cleanNumericValue(total_hours_worked),
        status: "draft",
      };

      // === PAYMENT CALCULATION ===
      try {
        // Check if calculatePayment exists in the service
        if (typeof WorkloadNRPService.calculatePayment === "function") {
          const paymentCalculation = await WorkloadNRPService.calculatePayment({
            ...nrpData,
            academic_rank: staff.academic_rank,
          });
          Object.assign(nrpData, paymentCalculation);
        } else {
          console.log(
            "calculatePayment not available, using default calculation"
          );
          // Default payment calculation
          let defaultPayment = 0;
          const hours = nrpData.credit_hours || 3;

          switch (program_type.toLowerCase()) {
            case "extension":
            case "weekend":
              defaultPayment = hours * 500;
              break;
            case "summer":
              defaultPayment = nrpData.teaching_hours * 450;
              break;
            case "distance":
              defaultPayment = nrpData.module_hours * 520;
              break;
            default:
              defaultPayment = hours * 500;
          }

          nrpData.total_payment = defaultPayment;
          nrpData.teaching_payment = defaultPayment;
        }
      } catch (calcError) {
        console.error("Payment calculation error:", calcError);
        // Use safe default
        const defaultPayment = (nrpData.credit_hours || 3) * 500;
        nrpData.total_payment = defaultPayment;
        nrpData.teaching_payment = defaultPayment;
      }

      // === VALIDATION ===
      try {
        // Check if validateWorkload exists
        if (typeof WorkloadNRPService.validateWorkload === "function") {
          const validation = await WorkloadNRPService.validateWorkload(nrpData);
          if (!validation.valid) {
            return sendError(res, "Please fix the following issues:", 400, {
              errors: validation.errors,
              warnings: validation.warnings,
              message:
                "There are some issues with your workload data. Please review and correct them.",
            });
          }
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
        // Continue without validation if it fails
      }

      // === CREATE THE WORKLOAD ===
      console.log("Creating NRP workload with data:", nrpData);
      const workload = await WorkloadNRPModel.createOrUpdate(nrpData);

      // === SUCCESS RESPONSE ===
      return sendSuccess(
        res,
        "Workload created successfully! ✅",
        {
          nrp_id: workload.nrp_id,
          contract_number: workload.contract_number,
          status: workload.status,
          total_payment: workload.total_payment,
          next_steps: [
            {
              action: "review",
              title: "Review your workload",
              description: "Check all the details are correct",
            },
            {
              action: "edit",
              title: "Make changes if needed",
              description:
                "You can edit this workload while it's in draft status",
            },
            {
              action: "submit",
              title: "Submit for approval",
              description:
                "Once everything is correct, submit it to your department head",
            },
          ],
          helpful_tips: [
            "Keep your contract number for future reference",
            "You can find this workload in your 'Draft' section",
            "Contact your department head if you have questions",
          ],
        },
        201
      );
    } catch (error) {
      console.error("Create NRP workload error:", error);

      // User-friendly error messages based on error type
      let userMessage = "We couldn't create your workload. ";
      let statusCode = 500;

      if (error.code === "ER_DUP_ENTRY") {
        userMessage += "This workload already exists in the system.";
        statusCode = 409;
      } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
        userMessage +=
          "Some information you entered doesn't exist in our records. Please check the semester, course, or staff details.";
        statusCode = 400;
      } else if (error.code === "ER_DATA_TOO_LONG") {
        userMessage +=
          "Some information you entered is too long. Please shorten any text fields and try again.";
        statusCode = 400;
      } else if (error.message && error.message.includes("timeout")) {
        userMessage +=
          "The request took too long. Please try again in a moment.";
        statusCode = 408;
      } else if (error.message && error.message.includes("connection")) {
        userMessage +=
          "We're having trouble connecting to our database. Please try again in a few minutes.";
        statusCode = 503;
      } else {
        userMessage +=
          "An unexpected error occurred. Our team has been notified.";
      }

      return sendError(res, userMessage, statusCode);
    }
  }

  // Get all NRP workloads
  static async getAllNRPWorkloads(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        semester_id,
        department_id,
        college_id,
        program_type,
        status,
        staff_id,
        date_from,
        date_to,
        search,
      } = req.query;

      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Build filters
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
      };

      // Add optional filters
      if (semester_id) filters.semester_id = parseInt(semester_id);
      if (department_id) filters.department_id = parseInt(department_id);
      if (college_id) filters.college_id = parseInt(college_id);
      if (program_type) filters.program_type = program_type;
      if (status) filters.status = status;
      if (staff_id) filters.staff_id = parseInt(staff_id);
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;
      if (search) {
        filters.course_code = search;
        filters.contract_number = search;
      }

      // Role-based filtering
      if (user_role === "instructor") {
        // Instructors can only see their own workloads
        const staff = await StaffModel.findByUserId(user_id);
        if (staff) {
          filters.staff_id = staff.staff_id;
        } else {
          return sendSuccess(res, "No workloads found", {
            workloads: [],
            pagination: { total: 0 },
          });
        }
      } else if (user_role === "department_head") {
        // Department heads can see workloads in their department
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          filters.department_id = staff.department_id;
        }
      } else if (user_role === "dean") {
        // Deans can see workloads in their college
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          const [college] = await query(
            "SELECT college_id FROM departments WHERE department_id = ?",
            [staff.department_id]
          );
          if (college) {
            filters.college_id = college.college_id;
          }
        }
      }

      const result = await WorkloadNRPModel.findAll(filters);

      return sendSuccess(res, "NRP workloads retrieved successfully", result);
    } catch (error) {
      console.error("Get all NRP workloads error:", error);
      return sendError(
        res,
        `Failed to retrieve NRP workloads: ${error.message}`,
        500
      );
    }
  }

  // Get NRP workload by ID
  static async getNRPWorkloadById(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      console.log(
        `Getting NRP workload ${id} for user ${user_id} with role ${user_role}`
      );

      const workload = await WorkloadNRPModel.findById(parseInt(id));

      if (!workload) {
        return sendError(res, "NRP workload not found", 404);
      }

      // Authorization check
      let authorized = false;

      if (user_role === "admin") {
        authorized = true;
      } else if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        authorized = staff?.staff_id === workload.staff_id;
      } else if (user_role === "department_head") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          // Get department of workload staff
          const [workloadDept] = await query(
            "SELECT department_id FROM staff_profiles WHERE staff_id = ?",
            [workload.staff_id]
          );
          authorized = staff.department_id === workloadDept?.department_id;
        }
      } else if (user_role === "dean") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          // Get college of current user
          const [userCollege] = await query(
            `SELECT c.college_id FROM colleges c 
             JOIN departments d ON c.college_id = d.college_id 
             WHERE d.department_id = ?`,
            [staff.department_id]
          );

          // Get department of workload staff
          const [workloadDept] = await query(
            "SELECT department_id FROM staff_profiles WHERE staff_id = ?",
            [workload.staff_id]
          );

          if (workloadDept) {
            // Get college of workload staff
            const [workloadCollege] = await query(
              `SELECT c.college_id FROM colleges c 
               JOIN departments d ON c.college_id = d.college_id 
               WHERE d.department_id = ?`,
              [workloadDept.department_id]
            );

            authorized =
              userCollege?.college_id === workloadCollege?.college_id;
          }
        }
      } else {
        // Other roles (registrar, finance, cde_director, hr_director, vpaf, etc.)
        authorized = true;
      }

      if (!authorized) {
        return sendError(
          res,
          "You are not authorized to view this workload",
          403
        );
      }

      return sendSuccess(res, "NRP workload retrieved successfully", workload);
    } catch (error) {
      console.error("Get NRP workload error:", error);
      return sendError(
        res,
        `Failed to retrieve NRP workload: ${error.message}`,
        500
      );
    }
  }

  // Update NRP workload
  static async updateNRPWorkload(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      const workload = await WorkloadNRPModel.findById(parseInt(id));

      if (!workload) {
        return sendError(res, "NRP workload not found", 404);
      }

      // Check authorization
      let canUpdate = false;

      if (user_role === "admin") {
        canUpdate = true;
      } else if (user_role === "instructor") {
        const staff = await StaffModel.findByUserId(user_id);
        canUpdate =
          staff?.staff_id === workload.staff_id && workload.status === "draft";
      } else if (user_role === "department_head") {
        const staff = await StaffModel.findByUserId(user_id);
        if (staff && staff.department_id) {
          const [workloadDept] = await query(
            "SELECT department_id FROM staff_profiles WHERE staff_id = ?",
            [workload.staff_id]
          );
          canUpdate =
            staff.department_id === workloadDept?.department_id &&
            (workload.status === "draft" || workload.status === "rejected");
        }
      }

      if (!canUpdate) {
        return sendError(
          res,
          "You are not authorized to update this workload",
          403
        );
      }

      const updateData = req.body;

      // Don't allow updating certain fields if already submitted
      if (workload.status !== "draft") {
        const restrictedFields = [
          "staff_id",
          "semester_id",
          "program_type",
          "course_id",
        ];
        restrictedFields.forEach((field) => {
          if (updateData[field] !== undefined) {
            delete updateData[field];
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
        // "tutorial_sessions",
        "assignment_students",
        "exam_students",
        "project_groups",
        "student_count",
        "rate_category",
        "is_overload",
        "overload_hours",
      ];

      const needsRecalculation = paymentFields.some(
        (field) => updateData[field] !== undefined
      );

      if (needsRecalculation) {
        // Get staff for rank-based calculation
        const staff = await StaffModel.findById(workload.staff_id);

        // Merge current data with updates
        const updatedWorkloadData = { ...workload, ...updateData };

        // Calculate total hours
        updatedWorkloadData.total_hours_worked =
          WorkloadNRPService.calculateTotalHours(updatedWorkloadData);

        // Calculate payment
        const paymentCalculation = await WorkloadNRPService.calculatePayment({
          ...updatedWorkloadData,
          academic_rank: staff?.academic_rank || "lecturer",
        });

        // Add payment data to update
        Object.assign(updateData, paymentCalculation);
      }

      const updatedWorkload = await WorkloadNRPModel.update(
        parseInt(id),
        updateData
      );
      return sendSuccess(
        res,
        "NRP workload updated successfully",
        updatedWorkload
      );
    } catch (error) {
      console.error("Update NRP workload error:", error);
      return sendError(
        res,
        `Failed to update NRP workload: ${error.message}`,
        500
      );
    }
  }

  // Submit for approval
  static async submitForApproval(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;

      const workload = await WorkloadNRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "NRP workload not found", 404);
      }

      // Check if user owns this workload
      const staff = await StaffModel.findByUserId(user_id);
      if (staff?.staff_id !== workload.staff_id) {
        return sendError(res, "You can only submit your own workloads", 403);
      }

      // Check if workload is in draft status
      if (workload.status !== "draft") {
        return sendError(res, "Only draft workloads can be submitted", 400);
      }

      // Validate workload before submission
      const validation = await WorkloadNRPService.validateWorkload(workload);
      if (!validation.valid) {
        return sendError(
          res,
          "Workload needs correction before submission",
          400,
          {
            validation: validation,
          }
        );
      }

      // Update status to submitted
      const updatedWorkload = await WorkloadNRPModel.update(parseInt(id), {
        status: "submitted",
      });

      // Create approval workflow entry
      await query(
        `INSERT INTO approval_workflow 
         (entity_type, entity_id, approver_role, status, created_at) 
         VALUES ('workload_nrp', ?, ?, 'pending', NOW())`,
        [id, "department_head"]
      );

      return sendSuccess(
        res,
        "NRP workload submitted for approval",
        updatedWorkload
      );
    } catch (error) {
      console.error("Submit for approval error:", error);
      return sendError(
        res,
        `Failed to submit for approval: ${error.message}`,
        500
      );
    }
  }

  // Get NRP statistics
  static async getNRPStatistics(req, res) {
    try {
      const { semester_id, department_id, program_type, date_from, date_to } =
        req.query;

      const user_id = req.user.user_id;
      const user_role = req.user.role;

      // Build filters
      const filters = {};
      if (semester_id) filters.semester_id = semester_id;
      if (department_id) filters.department_id = department_id;
      if (program_type) filters.program_type = program_type;
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;

      // Get dashboard statistics
      const stats = await WorkloadNRPService.getDashboardStats(
        user_role,
        user_id,
        filters
      );

      return sendSuccess(res, "NRP statistics retrieved", stats);
    } catch (error) {
      console.error("Get NRP statistics error:", error);
      return sendError(
        res,
        `Failed to get NRP statistics: ${error.message}`,
        500
      );
    }
  }

  // Get my NRP workloads (instructor only)
  static async getMyNRPWorkloads(req, res) {
    try {
      const user_id = req.user.user_id;
      const staff = await StaffModel.findByUserId(user_id);

      if (!staff) {
        return sendSuccess(res, "No workloads found", { workloads: [] });
      }

      const { semester_id, program_type, status } = req.query;

      const filters = {
        staff_id: staff.staff_id,
      };

      if (semester_id) filters.semester_id = parseInt(semester_id);
      if (program_type) filters.program_type = program_type;
      if (status) filters.status = status;

      const result = await WorkloadNRPModel.findAll(1, 100, filters);

      return sendSuccess(res, "My NRP workloads retrieved", result.workloads);
    } catch (error) {
      console.error("Get my NRP workloads error:", error);
      return sendError(res, `Failed to get workloads: ${error.message}`, 500);
    }
  }

  // Calculate payment for a workload
  static async calculatePayment(req, res) {
    try {
      const { id } = req.params;

      const workload = await WorkloadNRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "NRP workload not found", 404);
      }

      // Get staff for rank-based calculation
      const staff = await StaffModel.findById(workload.staff_id);

      // Calculate payment
      const paymentCalculation = await WorkloadNRPService.calculatePayment({
        ...workload,
        academic_rank: staff?.academic_rank || "lecturer",
      });

      return sendSuccess(res, "Payment calculated successfully", {
        workload_id: id,
        ...paymentCalculation,
      });
    } catch (error) {
      console.error("Calculate payment error:", error);
      return sendError(
        res,
        `Failed to calculate payment: ${error.message}`,
        500
      );
    }
  }

  // Get approval workflow for NRP
  static async getApprovalWorkflow(req, res) {
    try {
      const { id } = req.params;

      const workload = await WorkloadNRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "NRP workload not found", 404);
      }

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
        [id]
      );

      return sendSuccess(res, "Approval workflow retrieved", {
        workload_id: id,
        current_status: workload.status,
        approvals: approvals || [],
      });
    } catch (error) {
      console.error("Get approval workflow error:", error);
      return sendError(
        res,
        `Failed to get approval workflow: ${error.message}`,
        500
      );
    }
  }

  // Approve workload step
  static async approveWorkloadStep(req, res) {
    try {
      const { id } = req.params;
      const { comments = "" } = req.body;
      const approver_id = req.user.user_id;
      const approver_role = req.user.role;

      const workload = await WorkloadNRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "NRP workload not found", 404);
      }

      // Check if user can approve this step
      const [pendingApproval] = await query(
        `SELECT * FROM approval_workflow 
         WHERE entity_type = 'workload_nrp' 
           AND entity_id = ? 
           AND approver_role = ? 
           AND status = 'pending'
         ORDER BY created_at LIMIT 1`,
        [id, approver_role]
      );

      if (!pendingApproval) {
        return sendError(res, "No pending approval found for your role", 400);
      }

      // Update approval
      await query(
        `UPDATE approval_workflow 
         SET status = 'approved',
             approver_id = ?,
             comments = ?,
             updated_at = NOW()
         WHERE approval_id = ?`,
        [approver_id, comments, pendingApproval.approval_id]
      );

      // Determine next status based on approver role
      const statusMap = {
        department_head: "dh_approved",
        dean: "dean_approved",
        cde_director: "cde_approved",
        hr_director: "hr_approved",
        vpaf: "vpaf_approved",
        finance: "finance_approved",
      };

      const newStatus = statusMap[approver_role];
      if (newStatus) {
        await WorkloadNRPModel.update(parseInt(id), { status: newStatus });
      }

      // Create next approval step if needed
      const nextRoleMap = {
        department_head: "dean",
        dean: "cde_director",
        cde_director: "hr_director",
        hr_director: "vpaf",
        vpaf: "finance",
        finance: null,
      };

      const nextRole = nextRoleMap[approver_role];
      if (nextRole) {
        await query(
          `INSERT INTO approval_workflow 
           (entity_type, entity_id, approver_role, status, created_at) 
           VALUES ('workload_nrp', ?, ?, 'pending', NOW())`,
          [id, nextRole]
        );
      }

      const updatedWorkload = await WorkloadNRPModel.findById(parseInt(id));
      return sendSuccess(
        res,
        "Workload approved successfully",
        updatedWorkload
      );
    } catch (error) {
      console.error("Approve workload step error:", error);
      return sendError(
        res,
        `Failed to approve workload: ${error.message}`,
        500
      );
    }
  }

  // Reject workload
  static async rejectWorkload(req, res) {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const approver_id = req.user.user_id;
      const approver_role = req.user.role;

      if (!comments) {
        return sendError(res, "Rejection comments are required", 400);
      }

      const workload = await WorkloadNRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "NRP workload not found", 404);
      }

      // Check if user can reject (same roles that can approve)
      const allowedRoles = [
        "department_head",
        "dean",
        "cde_director",
        "hr_director",
        "vpaf",
        "finance",
      ];
      if (!allowedRoles.includes(approver_role)) {
        return sendError(
          res,
          "You are not authorized to reject workloads",
          403
        );
      }

      // Update any pending approvals
      await query(
        `UPDATE approval_workflow 
         SET status = 'rejected',
             approver_id = ?,
             comments = ?,
             updated_at = NOW()
         WHERE entity_type = 'workload_nrp' 
           AND entity_id = ? 
           AND status = 'pending'`,
        [approver_id, comments, id]
      );

      // Update workload status
      const updatedWorkload = await WorkloadNRPModel.update(parseInt(id), {
        status: "rejected",
      });

      return sendSuccess(
        res,
        "Workload rejected successfully",
        updatedWorkload
      );
    } catch (error) {
      console.error("Reject workload error:", error);
      return sendError(res, `Failed to reject workload: ${error.message}`, 500);
    }
  }

  // Return workload for correction
  static async returnForCorrection(req, res) {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const approver_id = req.user.user_id;
      const approver_role = req.user.role;

      if (!comments) {
        return sendError(res, "Return comments are required", 400);
      }

      const workload = await WorkloadNRPModel.findById(parseInt(id));
      if (!workload) {
        return sendError(res, "NRP workload not found", 404);
      }

      // Check if user can return (same roles that can approve)
      const allowedRoles = [
        "department_head",
        "dean",
        "cde_director",
        "hr_director",
        "vpaf",
        "finance",
      ];
      if (!allowedRoles.includes(approver_role)) {
        return sendError(
          res,
          "You are not authorized to return workloads",
          403
        );
      }

      // Update the current pending approval
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
        [approver_id, comments, id]
      );

      // Update workload status back to draft
      const updatedWorkload = await WorkloadNRPModel.update(parseInt(id), {
        status: "draft",
      });

      return sendSuccess(
        res,
        "Workload returned for correction",
        updatedWorkload
      );
    } catch (error) {
      console.error("Return for correction error:", error);
      return sendError(res, `Failed to return workload: ${error.message}`, 500);
    }
  }

  // Get pending approvals for current user
  static async getMyPendingApprovals(req, res) {
    try {
      const user_id = req.user.user_id;
      const user_role = req.user.role;

      const pendingApprovals = await query(
        `SELECT aw.*,
                wn.nrp_id,
                wn.program_type,
                wn.course_code,
                wn.course_title,
                wn.total_payment,
                wn.status as workload_status,
                sp.first_name as staff_first_name,
                sp.last_name as staff_last_name,
                sp.employee_id,
                d.department_name,
                s.semester_code,
                s.semester_name
         FROM approval_workflow aw
         JOIN workload_nrp wn ON aw.entity_id = wn.nrp_id
         JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
         JOIN departments d ON sp.department_id = d.department_id
         JOIN semesters s ON wn.semester_id = s.semester_id
         WHERE aw.approver_role = ? 
           AND aw.status = 'pending'
         ORDER BY aw.created_at`,
        [user_role]
      );

      return sendSuccess(res, "Pending approvals retrieved", pendingApprovals);
    } catch (error) {
      console.error("Get pending approvals error:", error);
      return sendError(
        res,
        `Failed to get pending approvals: ${error.message}`,
        500
      );
    }
  }
}

export default WorkloadNRPController;

