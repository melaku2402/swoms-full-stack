// src/api/workloadDeptAPI.js - COMPLETE FIXED VERSION
import apiClient from "./client";

export const workloadDeptAPI = {
  // ===============================
  // CORE ASSIGNMENT ROUTES
  // ===============================

  // Create new course assignment (with overload checking)
  createCourseAssignment: (data) => {
    return apiClient.post("/api/course-assignments", data);
  },

  // Update existing assignment
  updateAssignment: (assignmentId, data) => {
    return apiClient.put(
      `/api/course-assignments/${assignmentId}/update`,
      data
    );
  },

  // Check assignment feasibility without creating it
  checkAssignmentFeasibility: (data) => {
    return apiClient.post("/api/course-assignments/check-feasibility", data);
  },

  // Get staff workload details
  getStaffWorkload: (staffId, semesterId) => {
    return apiClient.get(`/api/course-assignments/staff/${staffId}/workload`, {
      params: { semester_id: semesterId },
    });
  },

  // Get my assignments (for instructors)
  getMyAssignments: (params = {}) => {
    return apiClient.get("/api/course-assignments/my", { params });
  },

  // Get department assignments (for department heads)
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

  // Get staff availability for assignments
  getStaffAvailability: (params = {}) => {
    return apiClient.get("/api/course-assignments/availability", { params });
  },

  // Get assignment statistics
  getAssignmentStats: (params = {}) => {
    return apiClient.get("/api/course-assignments/stats", { params });
  },

  // ===============================
  // SINGLE ASSIGNMENT OPERATIONS
  // ===============================

  // Get assignment by ID
  getAssignmentById: (assignmentId) => {
    return apiClient.get(`/api/course-assignments/${assignmentId}`);
  },

  // Accept assignment (instructor)
  acceptAssignment: (assignmentId) => {
    return apiClient.put(`/api/course-assignments/${assignmentId}/accept`);
  },

  // Decline assignment (instructor)
  declineAssignment: (assignmentId, reason) => {
    return apiClient.put(`/api/course-assignments/${assignmentId}/decline`, {
      reason,
    });
  },

  // Withdraw assignment (department head)
  withdrawAssignment: (assignmentId, reason) => {
    return apiClient.put(`/api/course-assignments/${assignmentId}/withdraw`, {
      reason,
    });
  },

  // ===============================
  // CURRICULUM-BASED ROUTES
  // ===============================

  // Get curriculum structure
  getCurriculumStructure: (params = {}) => {
    return apiClient.get("/api/course-assignments/curriculum/structure", {
      params,
    });
  },

  // Get curriculum dashboard
  getCurriculumDashboard: (params = {}) => {
    return apiClient.get("/api/course-assignments/curriculum/dashboard", {
      params,
    });
  },

  // Get courses for assignment with filters
  getCoursesForAssignment: (params = {}) => {
    return apiClient.get("/api/course-assignments/curriculum/courses", {
      params,
    });
  },

  // Create curriculum-based assignment
  createCurriculumAssignment: (data) => {
    return apiClient.post("/api/course-assignments/curriculum/assign", data);
  },

  // Batch assign multiple courses
  batchAssignCourses: (data) => {
    return apiClient.post(
      "/api/course-assignments/curriculum/batch-assign",
      data
    );
  },

  // Import curriculum data
  importCurriculum: (data) => {
    return apiClient.post("/api/course-assignments/curriculum/import", data);
  },

  // Get available years and semesters for curriculum
  getAvailableYearsSemesters: (params = {}) => {
    return apiClient.get("/api/course-assignments/curriculum/years-semesters", {
      params,
    });
  },

  // ===============================
  // DEPARTMENT MANAGEMENT
  // ===============================

  // Get department details for current user
  getMyDepartment: () => {
    return apiClient.get("/api/departments/my");
  },

  // Get active semester
  getActiveSemester: () => {
    return apiClient.get("/api/semesters/active");
  },

  // Get department courses - NEW: Use course assignment endpoint
  getDepartmentCourses: (departmentId, params = {}) => {
    // First try the courses endpoint
    return apiClient.get(`/api/courses/department/${departmentId}`, { params });
  },

  // Get unassigned courses for current semester and department
  getUnassignedCourses: (departmentId, params = {}) => {
    return apiClient.get("/api/course-assignments/curriculum/courses", {
      params: {
        ...params,
        unassigned_only: "true",
        department_id: departmentId,
      },
    });
  },

  // Get department staff - FIXED: Use staff endpoint
  getDepartmentStaff: (departmentId, params = {}) => {
    return apiClient.get(`/api/staff/department/${departmentId}`, {
      params: { ...params, include_inactive: false },
    });
  },

  // Get department programs
  getDepartmentPrograms: (departmentId) => {
    return apiClient.get(`/api/programs/department/${departmentId}`);
  },

  // ===============================
  // STAFF MANAGEMENT
  // ===============================

  // Get staff by ID
  getStaffById: (staffId) => {
    return apiClient.get(`/api/staff/${staffId}`);
  },

  // Search staff
  searchStaff: (query, params = {}) => {
    return apiClient.get("/api/staff/search", {
      params: { q: query, ...params },
    });
  },

  // ===============================
  // COURSE MANAGEMENT
  // ===============================

  // Get course by ID
  getCourseById: (courseId) => {
    return apiClient.get(`/api/courses/${courseId}`);
  },

  // Search courses
  searchCourses: (query, params = {}) => {
    return apiClient.get("/api/courses/search", {
      params: { q: query, ...params },
    });
  },

  // Get courses by program
  getCoursesByProgram: (programId, params = {}) => {
    return apiClient.get(`/api/courses/program/${programId}`, { params });
  },

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  // Download bulk assignment template
  downloadBulkAssignmentTemplate: () => {
    return apiClient.get("/api/course-assignments/bulk-template", {
      responseType: "blob",
    });
  },

  // Get assignment overview summary
  getAssignmentOverview: (params = {}) => {
    return apiClient.get("/api/course-assignments/department/overview", {
      params,
    });
  },

  // Get year level statistics
  getYearLevelStats: (departmentId, params = {}) => {
    return apiClient.get(`/api/departments/${departmentId}/year-stats`, {
      params,
    });
  },

  // Get courses by year level
  getCoursesByYearLevel: (departmentId, params = {}) => {
    return apiClient.get(`/api/courses/year-level`, {
      params: { department_id: departmentId, ...params },
    });
  },

  // Check if user has staff profile
  checkMyStaffProfile: () => {
    return apiClient.get("/api/staff/me/profile-check");
  },

  // Get my staff profile
  getMyStaffProfile: () => {
    return apiClient.get("/api/staff/me");
  },
};

// ===============================
// UTILITY FUNCTIONS
// ===============================

export const workloadDeptUtils = {
  // Format assignment for display
  formatAssignmentForDisplay: (assignment) => {
    if (!assignment) return null;

    const getStatusColor = (status) => {
      const colors = {
        assigned: "bg-yellow-100 text-yellow-800",
        accepted: "bg-green-100 text-green-800",
        declined: "bg-red-100 text-red-800",
        withdrawn: "bg-gray-100 text-gray-800",
        pending: "bg-blue-100 text-blue-800",
      };
      return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getProgramTypeColor = (type) => {
      const colors = {
        regular: "bg-blue-100 text-blue-800",
        extension: "bg-purple-100 text-purple-800",
        summer: "bg-orange-100 text-orange-800",
        distance: "bg-teal-100 text-teal-800",
        weekend: "bg-indigo-100 text-indigo-800",
      };
      return colors[type] || "bg-gray-100 text-gray-800";
    };

    return {
      ...assignment,
      display_code: `${assignment.course_code} - ${assignment.course_title}`,
      instructor_display: assignment.staff_first_name
        ? `${assignment.staff_first_name} ${assignment.staff_last_name}`
        : "Unassigned",
      semester_display: assignment.semester_name || "N/A",
      program_type_display:
        assignment.program_type?.charAt(0).toUpperCase() +
          assignment.program_type?.slice(1) || "Regular",
      status_display: assignment.status
        ? assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)
        : "Unknown",
      assigned_date_formatted: assignment.assigned_date
        ? new Date(assignment.assigned_date).toLocaleDateString()
        : "N/A",
      status_color: getStatusColor(assignment.status),
      program_type_color: getProgramTypeColor(assignment.program_type),
    };
  },

  // Calculate workload percentage
  calculateWorkloadPercentage: (currentHours, maxHours) => {
    if (!maxHours || maxHours === 0) return 0;
    return Math.round((currentHours / maxHours) * 100);
  },

  // Get workload status
  getWorkloadStatus: (percentage) => {
    if (percentage < 60) return { status: "Available", color: "success" };
    if (percentage < 80) return { status: "Moderate", color: "warning" };
    if (percentage < 100) return { status: "High", color: "danger" };
    return { status: "Overloaded", color: "error" };
  },

  // Validate assignment data
  validateAssignmentData: (data) => {
    const errors = {};

    if (!data.course_id) {
      errors.course_id = "Course is required";
    }

    if (!data.staff_id) {
      errors.staff_id = "Instructor is required";
    }

    if (!data.semester_id) {
      errors.semester_id = "Semester is required";
    }

    return errors;
  },

  // Prepare bulk assignment data
  prepareBulkAssignmentData: (
    assignments,
    semesterId,
    overrideWarnings = false
  ) => {
    return {
      assignments: assignments.map((assignment) => ({
        course_id: parseInt(assignment.course_id),
        staff_id: parseInt(assignment.staff_id),
        section_code: assignment.section_code || null,
        notes: assignment.notes || null,
      })),
      semester_id: parseInt(semesterId),
      override_warnings: overrideWarnings,
    };
  },
};
