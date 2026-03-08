// ============================================
// FILE: src/validators/WorkloadNRPValidator.js
// ============================================

class WorkloadNRPValidator {
  // Validate NRP workload creation
  static validateCreate(data) {
    const errors = [];
    const warnings = [];

    // Required fields
    const requiredFields = ["semester_id", "program_type"];
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    }

    // Validate program type
    const validProgramTypes = ["extension", "weekend", "summer", "distance"];
    if (data.program_type && !validProgramTypes.includes(data.program_type)) {
      errors.push(
        `program_type must be one of: ${validProgramTypes.join(", ")}`
      );
    }

    // Program-specific validations
    if (data.program_type) {
      switch (data.program_type) {
        case "extension":
        case "weekend":
          // Credit hours validation
          if (data.credit_hours !== undefined) {
            const creditHours = parseFloat(data.credit_hours);
            if (isNaN(creditHours) || creditHours < 0) {
              errors.push("credit_hours must be a non-negative number");
            } else if (creditHours > 6) {
              warnings.push(
                "Credit hours exceed recommended maximum of 6 for extension/weekend programs"
              );
            } else if (creditHours === 0) {
              errors.push(
                "credit_hours must be greater than 0 for extension/weekend programs"
              );
            }
          }

          // Contract number validation
          if (!data.contract_number) {
            warnings.push(
              "Contract number is recommended for extension/weekend programs"
            );
          }
          break;

        case "summer":
          // Teaching hours validation
          if (data.teaching_hours !== undefined) {
            const teachingHours = parseFloat(data.teaching_hours);
            if (isNaN(teachingHours) || teachingHours < 0) {
              errors.push("teaching_hours must be a non-negative number");
            } else if (teachingHours > 40) {
              warnings.push(
                "Teaching hours exceed recommended maximum of 40 for summer program"
              );
            } else if (teachingHours === 0) {
              warnings.push("No teaching hours specified for summer program");
            }
          }

          // Student count validation
          if (data.student_count !== undefined) {
            const studentCount = parseInt(data.student_count);
            if (isNaN(studentCount) || studentCount < 0) {
              errors.push("student_count must be a non-negative integer");
            } else if (studentCount > 100) {
              warnings.push("High student count for summer program");
            }
          }
          break;

        case "distance":
          // Module hours validation
          if (data.module_hours !== undefined) {
            const moduleHours = parseFloat(data.module_hours);
            if (isNaN(moduleHours) || moduleHours < 0) {
              errors.push("module_hours must be a non-negative number");
            } else if (moduleHours > 60) {
              warnings.push(
                "Module hours exceed recommended maximum of 60 for distance program"
              );
            } else if (moduleHours === 0) {
              errors.push(
                "module_hours must be greater than 0 for distance program"
              );
            }
          }

          // Student count validation
          if (data.student_count !== undefined) {
            const studentCount = parseInt(data.student_count);
            if (isNaN(studentCount) || studentCount < 0) {
              errors.push("student_count must be a non-negative integer");
            } else if (studentCount > 200) {
              warnings.push("Very high student count for distance program");
            }
          }
          break;
      }
    }

    // Numeric field validations
    const numericFields = [
      "lecture_credit_hours",
      "lab_credit_hours",
      "tutorial_credit_hours",
      "lecture_sections",
      "lab_sections",
      "tutorial_sessions",
      "student_count_dept",
      "student_count_year",
      "student_count_section",
      "assignment_students",
      "exam_students",
      "project_groups",
    ];

    for (const field of numericFields) {
      if (
        data[field] !== undefined &&
        data[field] !== null &&
        data[field] !== ""
      ) {
        const value = parseFloat(data[field]);
        if (isNaN(value) || value < 0) {
          errors.push(`${field} must be a non-negative number`);
        }
      }
    }

    // Date validations
    if (data.contract_duration_from && data.contract_duration_to) {
      const fromDate = new Date(data.contract_duration_from);
      const toDate = new Date(data.contract_duration_to);

      if (isNaN(fromDate.getTime())) {
        errors.push("contract_duration_from must be a valid date");
      }

      if (isNaN(toDate.getTime())) {
        errors.push("contract_duration_to must be a valid date");
      }

      if (fromDate > toDate) {
        errors.push(
          "contract_duration_from must be before contract_duration_to"
        );
      }
    }

    // Status validation
    const validStatuses = [
      "draft",
      "submitted",
      "dh_approved",
      "dean_approved",
      "cde_approved",
      "hr_approved",
      "vpaf_approved",
      "finance_approved",
      "rejected",
      "paid",
    ];

    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(", ")}`);
    }

    // Rate category validation
    const validRateCategories = ["A", "B", "C", "default"];
    if (
      data.rate_category &&
      !validRateCategories.includes(data.rate_category)
    ) {
      errors.push(
        `rate_category must be one of: ${validRateCategories.join(", ")}`
      );
    }

    // Contract type validation
    const validContractTypes = ["teaching", "tutorial_correction", "combined"];
    if (
      data.contract_type &&
      !validContractTypes.includes(data.contract_type)
    ) {
      errors.push(
        `contract_type must be one of: ${validContractTypes.join(", ")}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: {
        ...data,
        // Parse numeric fields
        credit_hours: data.credit_hours ? parseFloat(data.credit_hours) : 0,
        lecture_credit_hours: data.lecture_credit_hours
          ? parseFloat(data.lecture_credit_hours)
          : 0,
        lab_credit_hours: data.lab_credit_hours
          ? parseFloat(data.lab_credit_hours)
          : 0,
        tutorial_credit_hours: data.tutorial_credit_hours
          ? parseFloat(data.tutorial_credit_hours)
          : 0,
        teaching_hours: data.teaching_hours
          ? parseFloat(data.teaching_hours)
          : 0,
        module_hours: data.module_hours ? parseFloat(data.module_hours) : 0,
        lecture_sections: data.lecture_sections
          ? parseInt(data.lecture_sections)
          : 0,
        lab_sections: data.lab_sections ? parseInt(data.lab_sections) : 0,
        tutorial_sessions: data.tutorial_sessions
          ? parseInt(data.tutorial_sessions)
          : 0,
        student_count: data.student_count ? parseInt(data.student_count) : 0,
        student_count_dept: data.student_count_dept
          ? parseInt(data.student_count_dept)
          : 0,
        student_count_year: data.student_count_year
          ? parseInt(data.student_count_year)
          : 0,
        student_count_section: data.student_count_section
          ? parseInt(data.student_count_section)
          : 0,
        assignment_students: data.assignment_students
          ? parseInt(data.assignment_students)
          : 0,
        exam_students: data.exam_students ? parseInt(data.exam_students) : 0,
        project_groups: data.project_groups ? parseInt(data.project_groups) : 0,
      },
    };
  }

  // Validate NRP workload update
  static validateUpdate(data, existingWorkload) {
    const errors = [];
    const warnings = [];

    // Check if workload can be updated
    if (existingWorkload.status !== "draft") {
      errors.push("Only draft workloads can be updated");
    }

    // Validate program type if changing
    if (
      data.program_type &&
      data.program_type !== existingWorkload.program_type
    ) {
      const validProgramTypes = ["extension", "weekend", "summer", "distance"];
      if (!validProgramTypes.includes(data.program_type)) {
        errors.push(
          `program_type must be one of: ${validProgramTypes.join(", ")}`
        );
      }
    }

    // Validate numeric fields
    const numericFields = [
      "credit_hours",
      "lecture_credit_hours",
      "lab_credit_hours",
      "tutorial_credit_hours",
      "teaching_hours",
      "module_hours",
      "lecture_sections",
      "lab_sections",
      "tutorial_sessions",
      "student_count",
      "student_count_dept",
      "student_count_year",
      "student_count_section",
      "assignment_students",
      "exam_students",
      "project_groups",
    ];

    for (const field of numericFields) {
      if (
        data[field] !== undefined &&
        data[field] !== null &&
        data[field] !== ""
      ) {
        const value = parseFloat(data[field]);
        if (isNaN(value) || value < 0) {
          errors.push(`${field} must be a non-negative number`);
        }
      }
    }

    // Status validation for updates
    const validStatuses = [
      "draft",
      "submitted",
      "dh_approved",
      "dean_approved",
      "cde_approved",
      "hr_approved",
      "vpaf_approved",
      "finance_approved",
      "rejected",
      "paid",
    ];

    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(", ")}`);
    }

    // Rate category validation
    const validRateCategories = ["A", "B", "C", "default"];
    if (
      data.rate_category &&
      !validRateCategories.includes(data.rate_category)
    ) {
      errors.push(
        `rate_category must be one of: ${validRateCategories.join(", ")}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Validate NRP workload submission
  static validateSubmission(workload) {
    const errors = [];
    const warnings = [];

    // Check if already submitted
    if (workload.status !== "draft") {
      errors.push("Workload already submitted");
    }

    // Program-specific required fields
    switch (workload.program_type) {
      case "extension":
      case "weekend":
        if (!workload.credit_hours || workload.credit_hours <= 0) {
          errors.push("Credit hours must be greater than 0");
        }
        if (!workload.contract_number) {
          warnings.push("Contract number is recommended");
        }
        break;
      case "summer":
        if (!workload.teaching_hours || workload.teaching_hours <= 0) {
          errors.push("Teaching hours must be greater than 0");
        }
        break;
      case "distance":
        if (!workload.module_hours || workload.module_hours <= 0) {
          errors.push("Module hours must be greater than 0");
        }
        break;
    }

    // Check if semester is active
    if (workload.semester && !workload.semester.is_active) {
      warnings.push("Semester is not active");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Validate approval action
  static validateApproval(action, comments, userRole, currentStatus) {
    const errors = [];

    if (!action || !["approve", "reject"].includes(action)) {
      errors.push('action must be "approve" or "reject"');
    }

    if (action === "reject" && (!comments || comments.trim().length === 0)) {
      errors.push("comments are required when rejecting a workload");
    }

    // Check if user has permission for current status
    const workflowMap = {
      draft: [],
      submitted: ["department_head"],
      dh_approved: ["dean"],
      dean_approved: ["cde_director", "hr_director"],
      cde_approved: ["hr_director"],
      hr_approved: ["vpaf"],
      vpaf_approved: ["finance"],
      finance_approved: [],
      rejected: [],
      paid: [],
    };

    const allowedRoles = workflowMap[currentStatus] || [];
    if (!allowedRoles.includes(userRole)) {
      errors.push(
        `You don't have permission to approve workloads in ${currentStatus} status`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Validate payment sheet generation
  static validatePaymentSheet(nrp_id, payment_type) {
    const errors = [];

    if (!nrp_id) {
      errors.push("nrp_id is required");
    }

    if (!payment_type) {
      errors.push("payment_type is required");
    }

    const validPaymentTypes = [
      "extension",
      "weekend",
      "summer",
      "distance",
      "overload",
    ];
    if (payment_type && !validPaymentTypes.includes(payment_type)) {
      errors.push(
        `payment_type must be one of: ${validPaymentTypes.join(", ")}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Validate bulk update
  static validateBulkUpdate(workload_ids, status, reason) {
    const errors = [];

    if (
      !workload_ids ||
      !Array.isArray(workload_ids) ||
      workload_ids.length === 0
    ) {
      errors.push("workload_ids must be a non-empty array");
    }

    if (!status) {
      errors.push("status is required");
    }

    const validStatuses = [
      "draft",
      "submitted",
      "dh_approved",
      "dean_approved",
      "cde_approved",
      "hr_approved",
      "vpaf_approved",
      "finance_approved",
      "rejected",
      "paid",
    ];

    if (status && !validStatuses.includes(status)) {
      errors.push(`status must be one of: ${validStatuses.join(", ")}`);
    }

    if (status === "rejected" && (!reason || reason.trim().length === 0)) {
      errors.push("reason is required when rejecting workloads");
    }

    // Validate each workload_id is a number
    if (workload_ids) {
      workload_ids.forEach((id, index) => {
        if (isNaN(parseInt(id))) {
          errors.push(`workload_ids[${index}] must be a valid number`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Sanitize input data
  static sanitize(data) {
    const sanitized = { ...data };

    // Trim string fields
    const stringFields = [
      "contract_number",
      "academic_year",
      "academic_year_ec",
      "project_advising",
      "notes",
      "course_code",
      "course_title",
    ];

    stringFields.forEach((field) => {
      if (sanitized[field] && typeof sanitized[field] === "string") {
        sanitized[field] = sanitized[field].trim();
      }
    });

    // Convert empty strings to null for optional fields
    const optionalFields = [
      "contract_number",
      "academic_year_ec",
      "project_advising",
      "notes",
      "rate_category",
    ];

    optionalFields.forEach((field) => {
      if (sanitized[field] === "") {
        sanitized[field] = null;
      }
    });

    // Parse dates
    const dateFields = ["contract_duration_from", "contract_duration_to"];
    dateFields.forEach((field) => {
      if (sanitized[field]) {
        const date = new Date(sanitized[field]);
        if (isNaN(date.getTime())) {
          sanitized[field] = null;
        } else {
          sanitized[field] = date.toISOString().split("T")[0];
        }
      }
    });

    return sanitized;
  }

  // Validate filter parameters
  static validateFilters(filters) {
    const errors = [];
    const validated = {};

    // Validate page and limit
    if (filters.page !== undefined) {
      const page = parseInt(filters.page);
      if (isNaN(page) || page < 1) {
        errors.push("page must be a positive integer");
      } else {
        validated.page = page;
      }
    }

    if (filters.limit !== undefined) {
      const limit = parseInt(filters.limit);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        errors.push("limit must be between 1 and 100");
      } else {
        validated.limit = limit;
      }
    }

    // Validate program_type
    if (filters.program_type) {
      const validProgramTypes = ["extension", "weekend", "summer", "distance"];
      if (!validProgramTypes.includes(filters.program_type)) {
        errors.push(
          `program_type must be one of: ${validProgramTypes.join(", ")}`
        );
      } else {
        validated.program_type = filters.program_type;
      }
    }

    // Validate status
    if (filters.status) {
      const validStatuses = [
        "draft",
        "submitted",
        "dh_approved",
        "dean_approved",
        "cde_approved",
        "hr_approved",
        "vpaf_approved",
        "finance_approved",
        "rejected",
        "paid",
      ];
      if (!validStatuses.includes(filters.status)) {
        errors.push(`status must be one of: ${validStatuses.join(", ")}`);
      } else {
        validated.status = filters.status;
      }
    }

    // Validate numeric IDs
    const idFields = ["semester_id", "department_id", "staff_id"];
    idFields.forEach((field) => {
      if (filters[field] !== undefined) {
        const id = parseInt(filters[field]);
        if (isNaN(id) || id < 1) {
          errors.push(`${field} must be a positive integer`);
        } else {
          validated[field] = id;
        }
      }
    });

    // Validate year and month
    if (filters.year !== undefined) {
      const year = parseInt(filters.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 2000 || year > currentYear + 1) {
        errors.push(`year must be between 2000 and ${currentYear + 1}`);
      } else {
        validated.year = year;
      }
    }

    if (filters.month !== undefined) {
      const month = parseInt(filters.month);
      if (isNaN(month) || month < 1 || month > 12) {
        errors.push("month must be between 1 and 12");
      } else {
        validated.month = month;
      }
    }

    // Validate search term
    if (filters.search !== undefined) {
      if (typeof filters.search !== "string") {
        errors.push("search must be a string");
      } else if (filters.search.length > 100) {
        errors.push("search term too long (max 100 characters)");
      } else {
        validated.search = filters.search.trim();
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      filters: validated,
    };
  }
}

export default WorkloadNRPValidator;
