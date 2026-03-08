


// api/client/course-assignment.js
import apiClient from "./client";

// ================ COURSE ASSIGNMENT API ================
export const courseAssignmentAPI = {
  // ================ FORM DATA ENDPOINTS ================

  // Get assignment form data (all dropdowns)
  // getAssignmentFormData: () =>
  //   apiClient.get("/api/course-assignments/form-data"),

  getAssignmentFormData: async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await apiClient.get(
          "/api/course-assignments/form-data"
        );
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
      }
    }
  },

  // Get program types
  getProgramTypes: () => apiClient.get("/api/course-assignments/program-types"),

  // Get student years (1-7)
  getStudentYears: () => apiClient.get("/api/course-assignments/student-years"),

  // Get available sections for a course
  // In course-assignment.js - Fix the getAvailableSections function
  getAvailableSections: (courseId, semesterId) => {
    // Ensure courseId and semesterId are properly formatted
    const params = new URLSearchParams({
      course_id: courseId,
      semester_id: semesterId,
    }).toString();

    return apiClient.get(
      `/api/course-assignments/available-sections?${params}`
    );
  },

  // ================ ASSIGNMENT DATA ENDPOINTS ================

  // Get courses for assignment form with filters
  getCoursesForAssignmentForm: (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        cleanParams[key] = params[key];
      }
    });
    return apiClient.get("/api/course-assignments/courses", {
      params: cleanParams,
    });
  },

  // Get instructors for assignment with filters
  getInstructorsForAssignment: (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        cleanParams[key] = params[key];
      }
    });
    return apiClient.get("/api/course-assignments/instructors", {
      params: cleanParams,
    });
  },

  // ================ CORE ASSIGNMENT OPERATIONS ================

  // Create new course assignment with all fields
  // createAssignment: (data) => apiClient.post("/api/course-assignments", data),

  // In course-assignment.js - Update the createAssignment function
  createAssignment: async (data) => {
    try {
      const response = await apiClient.post("/api/course-assignments", data);
      return response;
    } catch (error) {
      // Enhance error object with more context
      if (error.response) {
        const enhancedError = new Error(
          error.response.data?.message || "Failed to create assignment"
        );
        enhancedError.response = error.response;
        enhancedError.status = error.response.status;
        enhancedError.data = error.response.data;
        throw enhancedError;
      }
      throw error;
    }
  },
  // Check assignment feasibility
  checkFeasibility: (data) =>
    apiClient.post("/api/course-assignments/check-feasibility", data),

  // Update assignment with all fields
  updateAssignment: (assignmentId, data) =>
    apiClient.put(`/api/course-assignments/${assignmentId}`, data),

  // ================ WORKLOAD & ASSIGNMENT ROUTES ================

  // Get staff workload
  getStaffWorkload: (staffId, semesterId) =>
    apiClient.get(`/api/course-assignments/staff/${staffId}/workload`, {
      params: { semester_id: semesterId },
    }),

  // // Get my assignments with filters
  // getMyAssignments: (params = {}) => {
  //   const cleanParams = {};
  //   Object.keys(params).forEach((key) => {
  //     if (
  //       params[key] !== undefined &&
  //       params[key] !== null &&
  //       params[key] !== ""
  //     ) {
  //       cleanParams[key] = params[key];
  //     }
  //   });
  //   return apiClient.get("/api/course-assignments/my", { params: cleanParams });
  // },

  // In api/client/course-assignment.js - Update getMyAssignments method
  // Get my assignments with filters
  getMyAssignments: (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        cleanParams[key] = params[key];
      }
    });

    // Add get_all parameter by default to get all assignments
    if (!cleanParams.get_all) {
      cleanParams.get_all = true; // Set to true by default
    }

    return apiClient.get("/api/course-assignments/my", {
      params: cleanParams,
    });
  },
  // Get department assignments with filters
  getDepartmentAssignments: (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        cleanParams[key] = params[key];
      }
    });
    return apiClient.get("/api/course-assignments/department", {
      params: cleanParams,
    });
  },

  // Get staff availability
  getStaffAvailability: (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        cleanParams[key] = params[key];
      }
    });
    return apiClient.get("/api/course-assignments/availability", {
      params: cleanParams,
    });
  },

  // Get assignment statistics
  getAssignmentStats: (params = {}) =>
    apiClient.get("/api/course-assignments/stats", { params }),

  // ================ SINGLE ASSIGNMENT OPERATIONS ================

  // Get assignment by ID
  getAssignmentById: (assignmentId) =>
    apiClient.get(`/api/course-assignments/${assignmentId}`),

  // Accept assignment
  acceptAssignment: (assignmentId) =>
    apiClient.put(`/api/course-assignments/${assignmentId}/accept`),

  // Decline assignment
  declineAssignment: (assignmentId, reason) =>
    apiClient.put(`/api/course-assignments/${assignmentId}/decline`, {
      reason,
    }),

  // Withdraw assignment
  withdrawAssignment: (assignmentId, reason) =>
    apiClient.put(`/api/course-assignments/${assignmentId}/withdraw`, {
      reason,
    }),

  // ================ CURRICULUM ROUTES ================

  // Get curriculum structure
  getCurriculumStructure: (params = {}) =>
    apiClient.get("/api/course-assignments/curriculum/structure", { params }),

  // Get curriculum dashboard
  getCurriculumDashboard: (params = {}) =>
    apiClient.get("/api/course-assignments/curriculum/dashboard", { params }),

  // Get courses for curriculum assignment
  getCoursesForAssignment: (params = {}) =>
    apiClient.get("/api/course-assignments/curriculum/courses", { params }),

  // Create curriculum-based assignment
  createCurriculumAssignment: (data) =>
    apiClient.post("/api/course-assignments/curriculum/assign", data),

  // Batch assign multiple courses
  batchAssignCourses: (data) =>
    apiClient.post("/api/course-assignments/curriculum/batch-assign", data),

  // Import curriculum data
  importCurriculum: (data) =>
    apiClient.post("/api/course-assignments/curriculum/import", data),

  // Get available years and semesters
  getAvailableYearsSemesters: (params = {}) =>
    apiClient.get("/api/course-assignments/curriculum/years-semesters", {
      params,
    }),

  // ================ BULK OPERATIONS ================

  // Batch assign courses (alternative endpoint)
  batchAssign: (data) => apiClient.post("/api/course-assignments/batch", data),

  // ================ FILTERED SEARCH ================

  // Search assignments with comprehensive filters
  searchAssignments: (filters = {}) => {
    const cleanParams = {};
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        cleanParams[key] = filters[key];
      }
    });
    return apiClient.get("/api/course-assignments/search", {
      params: cleanParams,
    });
  },
};

// ================ COURSE ASSIGNMENT UTILITY FUNCTIONS ================
export const courseAssignmentUtils = {
  // Format assignment status for display
  formatAssignmentStatus: (status) => {
    const statusMap = {
      assigned: {
        text: "Assigned",
        color: "warning",
        variant: "warning",
        icon: "assignment",
      },
      accepted: {
        text: "Accepted",
        color: "success",
        variant: "success",
        icon: "check_circle",
      },
      declined: {
        text: "Declined",
        color: "danger",
        variant: "danger",
        icon: "cancel",
      },
      withdrawn: {
        text: "Withdrawn",
        color: "secondary",
        variant: "secondary",
        icon: "undo",
      },
    };
    return (
      statusMap[status] || {
        text: status,
        color: "default",
        variant: "default",
        icon: "help",
      }
    );
  },

  // Format program type for display
  formatProgramType: (programType) => {
    const programTypeMap = {
      regular: { text: "Regular", color: "primary", icon: "school" },
      extension: { text: "Extension", color: "info", icon: "extension" },
      weekend: { text: "Weekend", color: "success", icon: "weekend" },
      summer: { text: "Summer", color: "warning", icon: "wb_sunny" },
      distance: { text: "Distance", color: "secondary", icon: "computer" },
    };
    return (
      programTypeMap[programType] || {
        text: programType,
        color: "default",
        icon: "category",
      }
    );
  },

  // Format academic rank for display
  formatAcademicRank: (rank) => {
    const rankMap = {
      graduate_assistant: "Graduate Assistant",
      assistant_lecturer: "Assistant Lecturer",
      lecturer: "Lecturer",
      assistant_professor: "Assistant Professor",
      associate_professor: "Associate Professor",
      professor: "Professor",
    };
    return rankMap[rank] || rank.replace(/_/g, " ").toUpperCase();
  },

  // Calculate overload percentage
  calculateOverloadPercentage: (currentLoad, maxLoad, newCourseHours) => {
    const total = currentLoad + newCourseHours;
    const overload = Math.max(0, total - maxLoad);
    return maxLoad > 0 ? (overload / maxLoad) * 100 : 0;
  },

  // Get risk level based on overload percentage
  getRiskLevel: (overloadPercentage) => {
    if (overloadPercentage <= 0) return "none";
    if (overloadPercentage <= 10) return "low";
    if (overloadPercentage <= 20) return "moderate";
    if (overloadPercentage <= 30) return "high";
    return "critical";
  },

  // Format risk level for display
  formatRiskLevel: (riskLevel) => {
    const riskMap = {
      none: { text: "No Risk", color: "success", icon: "check" },
      low: { text: "Low Risk", color: "info", icon: "info" },
      moderate: { text: "Moderate Risk", color: "warning", icon: "warning" },
      high: { text: "High Risk", color: "error", icon: "error" },
      critical: { text: "Critical Risk", color: "error", icon: "dangerous" },
    };
    return riskMap[riskLevel] || { text: riskLevel, color: "default" };
  },

  // Format workload status for display
  formatWorkloadStatus: (loadPercentage) => {
    if (loadPercentage < 50)
      return { text: "Underloaded", color: "#3b82f6", icon: "trending_down" };
    if (loadPercentage < 80)
      return { text: "Balanced", color: "#10b981", icon: "trending_flat" };
    if (loadPercentage < 100)
      return {
        text: "Approaching Limit",
        color: "#f59e0b",
        icon: "trending_up",
      };
    if (loadPercentage < 120)
      return {
        text: "Moderate Overload",
        color: "#f97316",
        icon: "warning",
      };
    if (loadPercentage < 150)
      return { text: "High Overload", color: "#ef4444", icon: "error" };
    return {
      text: "Critical Overload",
      color: "#991b1b",
      icon: "dangerous",
    };
  },

  // Validate assignment data with all fields
  validateAssignmentData: (assignmentData) => {
    const errors = {};

    if (!assignmentData.course_id) {
      errors.course_id = "Course is required";
    }

    if (!assignmentData.staff_id) {
      errors.staff_id = "Instructor is required";
    }

    if (!assignmentData.semester_id) {
      errors.semester_id = "Semester is required";
    }

    // Validate student year if provided
    if (
      assignmentData.student_year &&
      (assignmentData.student_year < 1 || assignmentData.student_year > 7)
    ) {
      errors.student_year = "Student year must be between 1 and 7";
    }

    // Validate program type if provided
    if (assignmentData.program_type) {
      const validProgramTypes = [
        "regular",
        "extension",
        "weekend",
        "summer",
        "distance",
      ];
      if (!validProgramTypes.includes(assignmentData.program_type)) {
        errors.program_type = "Invalid program type";
      }
    }

    // Validate section code if provided
    if (assignmentData.section_code) {
      if (!/^[A-Z]$/.test(assignmentData.section_code)) {
        errors.section_code = "Section code must be a single letter A-Z";
      }
    }

    return errors;
  },

  // Prepare assignment form data with all fields
  prepareAssignmentFormData: (formData) => {
    return {
      course_id: parseInt(formData.course_id) || null,
      semester_id: parseInt(formData.semester_id) || null,
      staff_id: parseInt(formData.staff_id) || null,
      program_type: formData.program_type || "regular",
      student_year: formData.student_year
        ? parseInt(formData.student_year)
        : null,
      section_code: formData.section_code || null,
      notes: formData.notes || null,
      confirm_overload: formData.confirm_overload || false,
    };
  },

  // Prepare batch assignment data
  prepareBatchAssignmentData: (assignments, semesterId, overrideWarnings) => {
    return {
      assignments: assignments.map((assignment) => ({
        course_id: parseInt(assignment.course_id),
        staff_id: parseInt(assignment.staff_id),
        student_year: assignment.student_year
          ? parseInt(assignment.student_year)
          : null,
        program_type: assignment.program_type || "regular",
        section_code: assignment.section_code || null,
        notes: assignment.notes || null,
      })),
      semester_id: parseInt(semesterId),
      override_warnings: overrideWarnings || false,
    };
  },

  // Prepare curriculum import data
  prepareCurriculumImportData: (data) => {
    return {
      department_id: parseInt(data.department_id),
      program_id: data.program_id ? parseInt(data.program_id) : null,
      curriculum_data: data.curriculum_data.map((item) => ({
        course_code: item.course_code.trim(),
        course_title: item.course_title.trim(),
        credit_hours: parseFloat(item.credit_hours),
        lecture_hours: parseFloat(item.lecture_hours),
        lab_hours: parseFloat(item.lab_hours || 0),
        tutorial_hours: parseFloat(item.tutorial_hours || 0),
        year: parseInt(item.year),
        semester: parseInt(item.semester),
        is_core: item.is_core !== false,
        prerequisites: item.prerequisites || null,
        program_type: item.program_type || "regular",
        max_students: parseInt(item.max_students || 60),
        min_students: parseInt(item.min_students || 15),
      })),
      replace_existing: data.replace_existing || false,
    };
  },

  // Calculate workload summary for display
  calculateWorkloadSummary: (workloadData) => {
    if (!workloadData) return null;

    const { current_workload, limits } = workloadData;
    const availableHours = Math.max(
      0,
      limits.rank_max - current_workload.total_hours
    );
    const loadPercentage =
      limits.rank_max > 0
        ? (current_workload.total_hours / limits.rank_max) * 100
        : 0;

    return {
      currentHours: current_workload.total_hours,
      maxHours: limits.rank_max,
      availableHours,
      loadPercentage: parseFloat(loadPercentage.toFixed(1)),
      isOverloaded: current_workload.total_hours > limits.rank_max,
      overloadHours: Math.max(
        0,
        current_workload.total_hours - limits.rank_max
      ),
      status: courseAssignmentUtils.formatWorkloadStatus(loadPercentage),
    };
  },

  // Generate suggested section codes
  generateSectionCodes: (usedSections = []) => {
    const allSections = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(65 + i)
    );
    const available = allSections.filter(
      (section) => !usedSections.includes(section)
    );
    return {
      available,
      used: usedSections,
      suggested: available.slice(0, 5),
    };
  },

  // Calculate course load (credit hours * load factor)
  calculateCourseLoad: (creditHours, loadFactor = 1.5) => {
    return creditHours * loadFactor;
  },

  // Check if assignment would cause overload
  checkOverload: (currentLoad, maxLoad, newCourseLoad) => {
    const projectedTotal = currentLoad + newCourseLoad;
    const overloadHours = Math.max(0, projectedTotal - maxLoad);
    const overloadPercentage = maxLoad > 0 ? (overloadHours / maxLoad) * 100 : 0;

    return {
      isOverload: overloadHours > 0,
      overloadHours,
      overloadPercentage: parseFloat(overloadPercentage.toFixed(1)),
      projectedTotal,
      riskLevel: courseAssignmentUtils.getRiskLevel(overloadPercentage),
    };
  },

  // Prepare filter parameters for API calls
  prepareFilterParams: (filters) => {
    const cleanParams = {};
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        // Handle arrays
        if (Array.isArray(filters[key]) && filters[key].length > 0) {
          cleanParams[key] = filters[key].join(",");
        } else {
          cleanParams[key] = filters[key];
        }
      }
    });
    return cleanParams;
  },

  // Format assignment for display
  formatAssignmentForDisplay: (assignment) => {
    return {
      ...assignment,
      formatted_status: courseAssignmentUtils.formatAssignmentStatus(
        assignment.status
      ),
      formatted_program_type: courseAssignmentUtils.formatProgramType(
        assignment.program_type
      ),
      display_name: `${assignment.course_code} - ${assignment.course_title}`,
      staff_display_name: `${assignment.staff_first_name} ${assignment.staff_last_name}`,
      semester_display_name: `${assignment.semester_name} (${assignment.semester_code})`,
      has_section: !!assignment.section_code,
      has_student_year: !!assignment.student_year,
    };
  },

  // Export assignments to CSV/Excel
  exportAssignments: (assignments, format = "csv") => {
    const headers = [
      "Assignment ID",
      "Course Code",
      "Course Title",
      "Instructor",
      "Employee ID",
      "Academic Rank",
      "Semester",
      "Program Type",
      "Student Year",
      "Section",
      "Status",
      "Assigned Date",
      "Notes",
    ];

    const rows = assignments.map((assignment) => [
      assignment.assignment_id,
      assignment.course_code,
      assignment.course_title,
      `${assignment.staff_first_name} ${assignment.staff_last_name}`,
      assignment.employee_id,
      courseAssignmentUtils.formatAcademicRank(assignment.academic_rank),
      assignment.semester_name,
      assignment.program_type,
      assignment.student_year || "N/A",
      assignment.section_code || "N/A",
      assignment.status,
      new Date(assignment.assigned_date).toLocaleDateString(),
      assignment.notes || "",
    ]);

    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");
      return csvContent;
    }

    // For Excel format (would need a library like xlsx)
    return { headers, rows };
  },

  // In courseAssignmentUtils.js - add these methods
// Enrich assignment data with calculated fields
//  enrichAssignmentData = (assignment) => {
//   if (!assignment) return assignment;

//   const lectureHours = parseFloat(assignment.lecture_hours || 0);
//   const labHours = parseFloat(assignment.lab_hours || 0);
//   const tutorialHours = parseFloat(assignment.tutorial_hours || 0);
//   const creditHours = parseFloat(assignment.credit_hours || 0);

//   return {
//     ...assignment,
//     // Raw hours
//     lecture_hours: lectureHours,
//     lab_hours: labHours,
//     tutorial_hours: tutorialHours,
//     credit_hours: creditHours,
    
//     // Calculated totals
//     total_contact_hours: (lectureHours + labHours + tutorialHours).toFixed(1),
    
//     // Workload calculations using standard factors
//     lecture_workload: (lectureHours * 1.0).toFixed(1),
//     lab_workload: (labHours * 0.75).toFixed(1),
//     tutorial_workload: (tutorialHours * 0.5).toFixed(1),
//     total_workload_hours: (
//       lectureHours * 1.0 +
//       labHours * 0.75 +
//       tutorialHours * 0.5
//     ).toFixed(1),
    
//     // Hours per week (assuming 16-week semester)
//     lecture_hours_per_week: (lectureHours / 16).toFixed(1),
//     lab_hours_per_week: (labHours / 16).toFixed(1),
//     total_hours_per_week: (
//       (lectureHours + labHours + tutorialHours) / 16
//     ).toFixed(1),
    
//     // Format for display
//     formatted_hours: {
//       lecture: `${lectureHours} hrs (${(lectureHours * 1.0).toFixed(1)} workload)`,
//       lab: `${labHours} hrs (${(labHours * 0.75).toFixed(1)} workload)`,
//       tutorial: `${tutorialHours} hrs (${(tutorialHours * 0.5).toFixed(1)} workload)`,
//       total: `${(lectureHours + labHours + tutorialHours).toFixed(1)} hrs`,
//       workload_total: (
//         lectureHours * 1.0 +
//         labHours * 0.75 +
//         tutorialHours * 0.5
//       ).toFixed(1) + ' hrs',
//     }
//   };
// }

// // Format hours breakdown for UI display
//   formatHoursBreakdown = (assignment) => {
//   const enriched = enrichAssignmentData(assignment);
  
//   return {
//     sections: [
//       {
//         title: "Contact Hours",
//         items: [
//           { label: "Lecture Hours", value: `${enriched.lecture_hours}`, color: "blue" },
//           { label: "Lab Hours", value: `${enriched.lab_hours}`, color: "green" },
//           { label: "Tutorial Hours", value: `${enriched.tutorial_hours}`, color: "purple" },
//           { 
//             label: "Total Contact Hours", 
//             value: enriched.total_contact_hours, 
//             color: "indigo",
//             isTotal: true 
//           },
//         ]
//       },
//       {
//         title: "Workload Calculation",
//         items: [
//           { 
//             label: "Lecture Workload", 
//             value: `${enriched.lecture_workload} hrs`, 
//             description: `${enriched.lecture_hours} × 1.0 factor` 
//           },
//           { 
//             label: "Lab Workload", 
//             value: `${enriched.lab_workload} hrs`, 
//             description: `${enriched.lab_hours} × 0.75 factor` 
//           },
//           { 
//             label: "Tutorial Workload", 
//             value: `${enriched.tutorial_workload} hrs`, 
//             description: `${enriched.tutorial_hours} × 0.5 factor` 
//           },
//           { 
//             label: "Total Workload", 
//             value: `${enriched.total_workload_hours} hrs`,
//             isTotal: true,
//             color: "amber" 
//           },
//         ]
//       },
//       {
//         title: "Weekly Distribution (16-week semester)",
//         items: [
//           { label: "Lecture Hours/Week", value: enriched.lecture_hours_per_week },
//           { label: "Lab Hours/Week", value: enriched.lab_hours_per_week },
//           { label: "Total Hours/Week", value: enriched.total_hours_per_week },
//         ]
//       }
//     ],
//     summary: {
//       credit_hours: enriched.credit_hours,
//       contact_hours: enriched.total_contact_hours,
//       workload_hours: enriched.total_workload_hours,
//       intensity_ratio: (enriched.total_workload_hours / enriched.credit_hours).toFixed(2)
//     }
//   };
// };

};

// ================ HOOKS FOR REACT COMPONENTS ================
export const useCourseAssignment = () => {
  // Custom hooks can be defined here
  // Example: useAssignmentForm, useWorkloadCalculator, etc.
  
  return {
    // Hook implementations would go here
  };
};

// ================ DEFAULT EXPORT ================
export default courseAssignmentAPI;