import apiClient from "./client";
import { PROGRAM_TYPES } from "../../../../backend/src/config/constants"; 

// ================ PROGRAM API - COMPLETE VERSION ================
export const programAPI = {
 
  getAllPrograms: (params = {}) => {
    const defaultParams = { page: 1, limit: 20 };
    return apiClient.get("/api/programs", {
      params: { ...defaultParams, ...params },
    });
  },

  getProgramById: (id) => {
    return apiClient.get(`/api/programs/${id}`);
  },

 
  getProgramsByDepartment: (departmentId, params = {}) => {
    return apiClient.get(`/api/programs/department/${departmentId}`, {
      params: { page: 1, limit: 20, ...params },
    });
  },

  
  getProgramsByType: (type, params = {}) => {
    // Validate program type
    const validTypes = Object.values(PROGRAM_TYPES);
    if (!validTypes.includes(type)) {
      return Promise.reject(
        new Error(
          `Invalid program type. Must be one of: ${validTypes.join(", ")}`
        )
      );
    }

    return apiClient.get(`/api/programs/type/${type}`, {
      params: { page: 1, limit: 20, ...params },
    });
  },

  getProgramTypes: () => {
    return apiClient.get("/api/programs/types/all");
  },

  getProgramStats: (params = {}) => {
    return apiClient.get("/api/programs/statistics/overview", { params });
  },

  getProgramTypesDashboard: () => {
    return apiClient.get("/api/programs/dashboard/types");
  },

  createProgram: (data) => {
    // Validate required fields
    const required = [
      "program_code",
      "program_name",
      "department_id",
      "program_type",
    ];
    const missing = required.filter((field) => !data[field]);

    if (missing.length > 0) {
      return Promise.reject(
        new Error(`Missing required fields: ${missing.join(", ")}`)
      );
    }

    // Validate program type
    const validTypes = Object.values(PROGRAM_TYPES);
    if (!validTypes.includes(data.program_type)) {
      return Promise.reject(
        new Error(
          `Invalid program type. Must be one of: ${validTypes.join(", ")}`
        )
      );
    }

    // Set default status if not provided
    const programData = {
      status: "active",
      ...data,
    };

    return apiClient.post("/api/programs", programData);
  },

  updateProgram: (id, data) => {
    // Validate program type if provided
    if (data.program_type) {
      const validTypes = Object.values(PROGRAM_TYPES);
      if (!validTypes.includes(data.program_type)) {
        return Promise.reject(
          new Error(
            `Invalid program type. Must be one of: ${validTypes.join(", ")}`
          )
        );
      }
    }

    return apiClient.put(`/api/programs/${id}`, data);
  },

  deleteProgram: (id) => {
    return apiClient.delete(`/api/programs/${id}`);
  },

  assignCoursesToProgram: (id, courseIds) => {
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return Promise.reject(
        new Error("Course IDs array is required and cannot be empty")
      );
    }

    return apiClient.post(`/api/programs/${id}/assign-courses`, {
      course_ids: courseIds,
    });
  },


  createProgramYear: (data) => {
    const required = ["program_id", "year_number"];
    const missing = required.filter((field) => !data[field]);

    if (missing.length > 0) {
      return Promise.reject(
        new Error(`Missing required fields: ${missing.join(", ")}`)
      );
    }

    return apiClient.post("/api/program-years", data);
  },

  /**
   * Get program year by ID
   */
  getProgramYearById: (id) => {
    return apiClient.get(`/api/program-years/${id}`);
  },

  /*
  getProgramYearsByProgram: (programId) => {
    return apiClient.get(`/api/program-years/program/${programId}`);
  },

  /**
   * Update program year
   */
  updateProgramYear: (id, data) => {
    return apiClient.put(`/api/program-years/${id}`, data);
  },

  /**
   * Delete program year
   */
  deleteProgramYear: (id) => {
    return apiClient.delete(`/api/program-years/${id}`);
  },

  /**
   * Get year statistics for program
   */
  getProgramYearStatistics: (programId) => {
    return apiClient.get(`/api/program-years/statistics/${programId}`);
  },

  // ===============================
  // BULK OPERATIONS
  // ===============================

  /**
   * Get all programs without pagination (for dropdowns)
   */
  // getAllProgramsList: async (filters = {}) => {
  //   // try {
  //   //   // First get total count with filters
  //   //   const response = await apiClient.get("/api/programs", {
  //   //     params: { ...filters, page: 1, limit: 1 },
  //   //   });

  //   //   const total = response.data?.pagination?.total || 0;

  //   //   // Then fetch all records
  //   //   if (total > 0) {
  //   //     const allResponse = await apiClient.get("/api/programs", {
  //   //       params: { ...filters, page: 1, limit: total },
  //   //     });
  //   //     return allResponse.data;
  //   //   }

  //   //   return { programs: [], pagination: { total: 0 } };
  //   // } catch (error) {
  //   //   throw error;
  //   // }
  // },

  /**
   * Get programs for dropdown (id, name, code)
   */
  // getProgramsForDropdown: async (filters = {}) => {
  //   try {
  //     const response = await programAPI.getAllProgramsList(filters);
  //     const programs = response.programs || [];

  //     return programs.map((program) => ({
  //       id: program.program_id,
  //       value: program.program_id,
  //       label: `${program.program_code} - ${program.program_name}`,
  //       code: program.program_code,
  //       name: program.program_name,
  //       type: program.program_type,
  //       department_id: program.department_id,
  //       status: program.status,
  //     }));
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  /**
   * Bulk update program status
   */
  bulkUpdateStatus: (programIds, status) => {
    if (!Array.isArray(programIds) || programIds.length === 0) {
      return Promise.reject(new Error("Program IDs array is required"));
    }

    if (!["active", "inactive"].includes(status)) {
      return Promise.reject(new Error("Status must be 'active' or 'inactive'"));
    }

    // Execute updates in parallel with limit
    const updatePromises = programIds.map((id) =>
      programAPI.updateProgram(id, { status })
    );

    return Promise.allSettled(updatePromises);
  },

  // ===============================
  // VALIDATION & HELPER FUNCTIONS
  // ===============================

  /**
   * Validate program data
   */
  validateProgramData: (data, isUpdate = false) => {
    const errors = {};

    if (!isUpdate || data.program_code !== undefined) {
      if (!data.program_code?.trim()) {
        errors.program_code = "Program code is required";
      } else if (data.program_code.length > 20) {
        errors.program_code = "Program code must be 20 characters or less";
      }
    }

    if (!isUpdate || data.program_name !== undefined) {
      if (!data.program_name?.trim()) {
        errors.program_name = "Program name is required";
      } else if (data.program_name.length > 150) {
        errors.program_name = "Program name must be 150 characters or less";
      }
    }

    if (!isUpdate || data.department_id !== undefined) {
      if (!data.department_id) {
        errors.department_id = "Department is required";
      }
    }

    if (!isUpdate || data.program_type !== undefined) {
      if (!data.program_type) {
        errors.program_type = "Program type is required";
      } else {
        const validTypes = Object.values(PROGRAM_TYPES);
        if (!validTypes.includes(data.program_type)) {
          errors.program_type = `Invalid program type. Must be one of: ${validTypes.join(
            ", "
          )}`;
        }
      }
    }

    return errors;
  },

  /**
   * Validate program year data
   */
  validateProgramYearData: (data, isUpdate = false) => {
    const errors = {};

    if (!isUpdate || data.program_id !== undefined) {
      if (!data.program_id) {
        errors.program_id = "Program is required";
      }
    }

    if (!isUpdate || data.year_number !== undefined) {
      if (!data.year_number || data.year_number < 1 || data.year_number > 10) {
        errors.year_number = "Year number must be between 1 and 10";
      }
    }

    if (data.year_name && data.year_name.length > 100) {
      errors.year_name = "Year name must be 100 characters or less";
    }

    if (
      data.total_credits &&
      (data.total_credits < 0 || data.total_credits > 200)
    ) {
      errors.total_credits = "Total credits must be between 0 and 200";
    }

    return errors;
  },

  /**
   * Get program type display name
   */
  getProgramTypeDisplay: (type) => {
    const typeMap = {
      UG: "Undergraduate",
      PG: "Postgraduate",
      PHD: "Doctorate",
      DIPLOMA: "Diploma",
      CERTIFICATE: "Certificate",
      regular: "Regular",
      extension: "Extension",
      weekend: "Weekend",
      summer: "Summer",
      distance: "Distance",
    };

    return typeMap[type] || type;
  },

  /**
   * Get program type color for UI
   */
  getProgramTypeColor: (type) => {
    const colors = {
      regular: "primary",
      extension: "success",
      weekend: "warning",
      summer: "info",
      distance: "secondary",
      UG: "primary",
      PG: "success",
      PHD: "warning",
      DIPLOMA: "info",
      CERTIFICATE: "secondary",
    };

    return colors[type] || "default";
  },

  /**
   * Get program status display
   */
  getProgramStatusDisplay: (status) => {
    const statusMap = {
      active: { text: "Active", color: "success", variant: "success" },
      inactive: { text: "Inactive", color: "danger", variant: "danger" },
      draft: { text: "Draft", color: "warning", variant: "warning" },
      archived: { text: "Archived", color: "secondary", variant: "secondary" },
    };

    return (
      statusMap[status] || {
        text: status,
        color: "default",
        variant: "default",
      }
    );
  },

  /**
   * Check if program can be deleted
   */
  canDeleteProgram: (program) => {
    return program && program.course_count === 0;
  },

  /**
   * Check if program is active
   */
  isProgramActive: (program) => {
    return program && program.status === "active";
  },

  // ===============================
  // STATISTICS & ANALYTICS
  // ===============================

  /**
   * Calculate program metrics
   */
  calculateProgramMetrics: (programs) => {
    if (!Array.isArray(programs)) return null;

    const metrics = {
      totalPrograms: programs.length,
      activePrograms: 0,
      inactivePrograms: 0,
      totalCourses: 0,
      averageCoursesPerProgram: 0,
      programsByType: {},
      coursesByType: {},
      totalStudents: 0, // Estimated from sections
      totalSections: 0,
    };

    programs.forEach((program) => {
      // Count status
      if (program.status === "active") {
        metrics.activePrograms++;
      } else {
        metrics.inactivePrograms++;
      }

      // Count courses
      const courseCount = program.course_count || 0;
      metrics.totalCourses += courseCount;

      // Group by type
      const type = program.program_type;
      metrics.programsByType[type] = (metrics.programsByType[type] || 0) + 1;
      metrics.coursesByType[type] =
        (metrics.coursesByType[type] || 0) + courseCount;

      // Add other statistics if available
      if (program.section_count) {
        metrics.totalSections += program.section_count;
      }
      if (program.student_count) {
        metrics.totalStudents += program.student_count;
      }
    });

    // Calculate averages
    metrics.averageCoursesPerProgram =
      metrics.totalPrograms > 0
        ? (metrics.totalCourses / metrics.totalPrograms).toFixed(1)
        : 0;

    // Calculate percentages
    metrics.activePercentage =
      metrics.totalPrograms > 0
        ? ((metrics.activePrograms / metrics.totalPrograms) * 100).toFixed(1)
        : 0;

    return metrics;
  },

  /**
   * Prepare program data for charts
   */
  prepareProgramChartData: (programs) => {
    if (!Array.isArray(programs) || programs.length === 0) {
      return null;
    }

    // Group by type
    const typeData = {};
    programs.forEach((program) => {
      const type = program.program_type;
      const typeDisplay = programAPI.getProgramTypeDisplay(type);

      if (!typeData[typeDisplay]) {
        typeData[typeDisplay] = {
          count: 0,
          courses: 0,
          color: programAPI.getProgramTypeColor(type),
        };
      }

      typeData[typeDisplay].count++;
      typeData[typeDisplay].courses += program.course_count || 0;
    });

    // Convert to arrays for charts
    const labels = Object.keys(typeData);
    const counts = labels.map((label) => typeData[label].count);
    const courses = labels.map((label) => typeData[label].courses);
    const colors = labels.map((label) => typeData[label].color);

    return {
      labels,
      datasets: [
        {
          label: "Programs by Type",
          data: counts,
          backgroundColor: colors,
        },
        {
          label: "Courses by Type",
          data: courses,
          backgroundColor: colors.map((color) => `${color}80`), // Add transparency
        },
      ],
    };
  },

  // ===============================
  // TRANSFORMERS (for UI display)
  // ===============================

  /**
   * Transform program for display in UI
   */
  transformProgramForDisplay: (program) => {
    if (!program) return null;

    const typeDisplay = programAPI.getProgramTypeDisplay(program.program_type);
    const statusInfo = programAPI.getProgramStatusDisplay(program.status);

    return {
      ...program,
      display_name: `${program.program_code} - ${program.program_name}`,
      short_name: program.program_name,
      type_display: typeDisplay,
      type_color: programAPI.getProgramTypeColor(program.program_type),
      status_display: statusInfo.text,
      status_color: statusInfo.color,
      is_active: programAPI.isProgramActive(program),
      can_delete: programAPI.canDeleteProgram(program),
      department_display: program.department_name
        ? `${program.department_code} - ${program.department_name}`
        : "N/A",
      college_display: program.college_name
        ? `${program.college_code} - ${program.college_name}`
        : "N/A",
      course_count: program.course_count || 0,
      course_count_display: `${program.course_count || 0} course${
        program.course_count !== 1 ? "s" : ""
      }`,
      created_date: program.created_at
        ? new Date(program.created_at).toLocaleDateString()
        : "",
      updated_date: program.updated_at
        ? new Date(program.updated_at).toLocaleDateString()
        : "",
      actions: {
        canEdit: true,
        canDelete: programAPI.canDeleteProgram(program),
        canView: true,
        canAssign: true,
        canActivate: program.status !== "active",
        canDeactivate: program.status === "active",
      },
    };
  },

  /**
   * Transform program list for table display
   */
  transformProgramListForTable: (programs) => {
    if (!Array.isArray(programs)) return [];

    return programs.map((program) => ({
      id: program.program_id,
      code: program.program_code,
      name: program.program_name,
      type: program.program_type,
      type_display: programAPI.getProgramTypeDisplay(program.program_type),
      type_color: programAPI.getProgramTypeColor(program.program_type),
      department: program.department_name,
      department_code: program.department_code,
      college: program.college_name,
      courses: program.course_count || 0,
      status: program.status,
      status_display: programAPI.getProgramStatusDisplay(program.status).text,
      status_color: programAPI.getProgramStatusDisplay(program.status).color,
      is_active: program.status === "active",
      created_at: program.created_at,
      updated_at: program.updated_at,
      actions: {
        canEdit: true,
        canDelete: programAPI.canDeleteProgram(program),
        canView: true,
        canAssign: true,
        canActivate: program.status !== "active",
        canDeactivate: program.status === "active",
      },
    }));
  },

  /**
   * Transform program year for display
   */
  transformProgramYearForDisplay: (programYear) => {
    if (!programYear) return null;

    return {
      ...programYear,
      display_name: `Year ${programYear.year_number}${
        programYear.year_name ? ` - ${programYear.year_name}` : ""
      }`,
      short_name: programYear.year_name || `Year ${programYear.year_number}`,
      course_count: programYear.course_count || 0,
      total_credits: programYear.total_credits || 0,
      created_date: programYear.created_at
        ? new Date(programYear.created_at).toLocaleDateString()
        : "",
      updated_date: programYear.updated_at
        ? new Date(programYear.updated_at).toLocaleDateString()
        : "",
    };
  },

  // ===============================
  // ERROR HANDLING
  // ===============================

  /**
   * Handle program API errors
   */
  handleProgramError: (error) => {
    if (!error.response) {
      return {
        message: "Network error. Please check your connection.",
        type: "network",
        severity: "error",
      };
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return {
          message: data.message || "Invalid request data",
          type: "validation",
          severity: "warning",
          details: data.errors,
          field: programAPI.extractFieldFromError(data.message),
        };
      case 401:
        return {
          message: "You are not authorized to perform this action",
          type: "auth",
          severity: "error",
        };
      case 403:
        return {
          message: "You don't have permission to access this resource",
          type: "permission",
          severity: "error",
        };
      case 404:
        return {
          message: "Program not found",
          type: "not_found",
          severity: "warning",
        };
      case 409:
        return {
          message: data.message || "Program code already exists",
          type: "conflict",
          severity: "warning",
        };
      case 422:
        return {
          message:
            data.message || "Cannot delete program with existing courses",
          type: "business_rule",
          severity: "warning",
        };
      case 500:
        return {
          message: "Server error. Please try again later.",
          type: "server",
          severity: "error",
        };
      default:
        return {
          message: "An unexpected error occurred",
          type: "unknown",
          severity: "error",
        };
    }
  },

  /**
   * Extract field name from error message
   */
  extractFieldFromError: (message) => {
    if (!message) return null;

    const fieldMap = {
      program_code: "code",
      program_name: "name",
      department_id: "department",
      program_type: "type",
      year_number: "year",
      total_credits: "credits",
    };

    for (const [field, displayName] of Object.entries(fieldMap)) {
      if (message.toLowerCase().includes(field)) {
        return displayName;
      }
    }

    return null;
  },

  // ===============================
  // CACHE MANAGEMENT
  // ===============================

  /**
   * Cache key for programs
   */
  cacheKeys: {
    PROGRAMS_LIST: (params = {}) => {
      const key = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");
      return `programs_list_${key}`;
    },
    PROGRAM_DETAIL: (id) => `program_detail_${id}`,
    PROGRAMS_BY_DEPARTMENT: (deptId) => `programs_by_dept_${deptId}`,
    PROGRAMS_BY_TYPE: (type) => `programs_by_type_${type}`,
    PROGRAM_TYPES: "program_types_list",
    PROGRAM_STATS: "program_statistics",
    PROGRAM_YEARS: (programId) => `program_years_${programId}`,
  },

  /**
   * Clear program cache
   */
  clearProgramCache: () => {
    // This would depend on your caching implementation
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("program_")) {
        localStorage.removeItem(key);
      }
    });
  },
};

// ================ PROGRAM YEAR API ================
export const programYearAPI = {
  /**
   * Create program year
   */
  createProgramYear: (data) => {
    return apiClient.post("/api/program-years", data);
  },

  /**
   * Get program year by ID
   */
  getProgramYearById: (id) => {
    return apiClient.get(`/api/program-years/${id}`);
  },

  /**
   * Get years by program
   */
  getProgramYearsByProgram: (programId) => {
    return apiClient.get(`/api/program-years/program/${programId}`);
  },

  
   //Update program year
   
  updateProgramYear: (id, data) => {
    return apiClient.put(`/api/program-years/${id}`, data);
  },

  
   // Delete program year
   
  deleteProgramYear: (id) => {
    return apiClient.delete(`/api/program-years/${id}`);
  },

  
    //Get year statistics
   
  getYearStatistics: (programId) => {
    return apiClient.get(`/api/program-years/statistics/${programId}`);
  },

  /**
   * Validate program year data
   */
  validateData: (data) => {
    return programAPI.validateProgramYearData(data, false);
  },

  
   // Transform for display
   
  transformForDisplay: (programYear) => {
    return programAPI.transformProgramYearForDisplay(programYear);
  },
};

// ================ PROGRAM UTILITIES ================
export const programUtils = {
  /**
   * Format program code for display
   */
  formatProgramCode: (code, name) => {
    return code && name ? `${code} - ${name}` : code || name || "";
  },

  /**
   * Get program abbreviation
   */
  getProgramAbbreviation: (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  },

  /**
   * Calculate program duration in years
   */
  calculateProgramDuration: (program) => {
    // Logic to calculate duration based on program type
    const durationMap = {
      UG: 4,
      PG: 2,
      PHD: 3,
      DIPLOMA: 2,
      CERTIFICATE: 1,
      regular: 4,
      extension: 5,
      weekend: 4,
      summer: 4,
      distance: 4,
    };

    return durationMap[program.program_type] || 4;
  },

  /**
   * Check if program has required years
   */
  hasCompleteYears: (years, expectedCount) => {
    if (!Array.isArray(years)) return false;
    if (years.length !== expectedCount) return false;

    // Check if years are sequential
    const yearNumbers = years.map((y) => y.year_number).sort((a, b) => a - b);
    for (let i = 0; i < yearNumbers.length; i++) {
      if (yearNumbers[i] !== i + 1) return false;
    }

    return true;
  },

  /**
   * Generate year options for dropdown
   */
  generateYearOptions: (maxYears = 5) => {
    const years = [];
    for (let i = 1; i <= maxYears; i++) {
      years.push({
        value: i,
        label: `Year ${i}`,
      });
    }
    return years;
  },

  /**
   * Prepare program data for export
   */
  prepareForExport: (programs) => {
    if (!Array.isArray(programs)) return [];

    return programs.map((program) => ({
      "Program Code": program.program_code,
      "Program Name": program.program_name,
      Type: programAPI.getProgramTypeDisplay(program.program_type),
      Department: program.department_name,
      College: program.college_name,
      Status: program.status,
      "Course Count": program.course_count || 0,
      "Created Date": program.created_at
        ? new Date(program.created_at).toLocaleDateString()
        : "",
      "Last Updated": program.updated_at
        ? new Date(program.updated_at).toLocaleDateString()
        : "",
    }));
  },

  /**
   * Generate CSV content
   */
  generateCSV: (programs) => {
    const data = programUtils.prepareForExport(programs);
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes
            const escaped = ("" + value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  },
};

// ================ HOOKS FOR REACT COMPONENTS ================


 // Custom hook for program operations
 
export const useProgram = () => {
  // You can implement React hooks here
  return {
    // Hook implementations
  };
};

// Export everything
export default {
  program: programAPI,
  programYear: programYearAPI,
  utils: programUtils,
};
