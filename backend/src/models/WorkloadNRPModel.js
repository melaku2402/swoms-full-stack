// ============================================
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
