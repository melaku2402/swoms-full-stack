// // import apiClient from "./client";
// // const departmentApi = {
// //   // ==================== CORE CRUD OPERATIONS ====================

// //   // Get all departments with filters
// //   getAllDepartments: (params = {}) => {
// //     return apiClient.get("/api/departments", { params });
// //   },

// //   // Get departments by college
// //   getDepartmentsByCollege: (collegeId, params = {}) => {
// //     return apiClient.get(`/api/departments/college/${collegeId}`, { params });
// //   },

// //   // Get department by ID
// //   getDepartmentById: (id, params = {}) => {
// //     return apiClient.get(`/api/departments/${id}`, { params });
// //   },

// //   // Create department
// //   createDepartment: (data) => {
// //     return apiClient.post("/api/departments", data);
// //   },

// //   // Update department
// //   updateDepartment: (id, data) => {
// //     return apiClient.put(`/api/departments/${id}`, data);
// //   },

// //   // Delete department (soft delete)
// //   deleteDepartment: (id) => {
// //     return apiClient.delete(`/api/departments/${id}`);
// //   },

// //   // Assign head to department
// //   assignHead: (id, userId) => {
// //     return apiClient.post(`/api/departments/${id}/assign-head`, {
// //       user_id: userId,
// //     });
// //   },

// //   // ==================== DASHBOARD & ANALYTICS ====================

// //   // Get department dashboard data
// //   getDepartmentDashboard: (id, timeRange = "current_semester") => {
// //     return apiClient.get(`/api/departments/${id}/dashboard`, {
// //       params: { time_range: timeRange },
// //     });
// //   },

// //   // Get department statistics
// //   getDepartmentStats: (id, type = "detailed") => {
// //     return apiClient.get(`/api/departments/${id}/statistics`, {
// //       params: { type },
// //     });
// //   },

// //   // Get department workload summary
// //   getDepartmentWorkloadSummary: (id, semesterId = null) => {
// //     return apiClient.get(`/api/departments/${id}/workload-summary`, {
// //       params: { semester_id: semesterId },
// //     });
// //   },

// //   // ==================== DEPARTMENT DATA ====================

// //   // Get department staff list
// //   getDepartmentStaff: (id, params = {}) => {
// //     return apiClient.get(`/api/departments/${id}/staff`, { params });
// //   },

// //   // Get department courses
// //   getDepartmentCourses: (id, semesterId = null) => {
// //     return apiClient.get(`/api/departments/${id}/courses`, {
// //       params: { semester_id: semesterId },
// //     });
// //   },

// //   // ==================== ADVANCED OPERATIONS ====================

// //   // Export department data
// //   exportDepartmentData: (id, format = "json") => {
// //     return apiClient.get(`/api/departments/${id}/export`, {
// //       params: { format },
// //       responseType: format === "json" ? "json" : "blob",
// //     });
// //   },

// //   // Advanced search
// //   advancedSearch: (params = {}) => {
// //     return apiClient.get("/api/departments/search/advanced", { params });
// //   },

// //   // Update department status
// //   updateDepartmentStatus: (id, status) => {
// //     return apiClient.post(`/api/departments/${id}/status`, { status });
// //   },

// //   // Merge departments
// //   mergeDepartments: (sourceId, targetId) => {
// //     return apiClient.post("/api/departments/merge", {
// //       source_department_id: sourceId,
// //       target_department_id: targetId,
// //     });
// //   },

// //   // Bulk update departments
// //   bulkUpdateDepartments: (updates = []) => {
// //     return apiClient.post("/api/departments/bulk/update", { updates });
// //   },

// //   // ==================== ALIASES FOR BACKWARD COMPATIBILITY ====================
// //   // If you have existing code using different names, keep these aliases temporarily

// //   // Alias: getDepartments → getAllDepartments
// //   getDepartments: (params = {}) => departmentApi.getAllDepartments(params),

// //   // Alias: assignHeadToDepartment → assignHead
// //   assignHeadToDepartment: (id, userId) => departmentApi.assignHead(id, userId),

// //   // Alias: getDepartmentStatistics → getDepartmentStats
// //   getDepartmentStatistics: (id, type) =>
// //     departmentApi.getDepartmentStats(id, type),
// // };

// // export default departmentApi;

// import apiClient from "./client";

// const departmentAPI = {
//   getAllDepartments: (params = {}) => {
//     return apiClient.get("/api/departments", { params });
//   },

//   getDepartmentsByCollege: (collegeId, params = {}) => {
//     return apiClient.get(`/api/departments/college/${collegeId}`, { params });
//   },

//   getDepartmentById: (id, params = {}) => {
//     return apiClient.get(`/api/departments/${id}`, { params });
//   },

//   createDepartment: (data) => {
//     return apiClient.post("/api/departments", data);
//   },

//   updateDepartment: (id, data) => {
//     return apiClient.put(`/api/departments/${id}`, data);
//   },

//   deleteDepartment: (id) => {
//     return apiClient.delete(`/api/departments/${id}`);
//   },

//   assignHead: (id, userId) => {
//     return apiClient.post(`/api/departments/${id}/assign-head`, {
//       user_id: userId,
//     });
//   },

//   getDepartmentDashboard: (id, timeRange = "current_semester") => {
//     return apiClient.get(`/api/departments/${id}/dashboard`, {
//       params: { time_range: timeRange },
//     });
//   },

//   getDepartmentStats: (id, type = "detailed") => {
//     return apiClient.get(`/api/departments/${id}/statistics`, {
//       params: { type },
//     });
//   },

//   getDepartmentWorkloadSummary: (id, semesterId = null) => {
//     return apiClient.get(`/api/departments/${id}/workload-summary`, {
//       params: { semester_id: semesterId },
//     });
//   },

//   getDepartmentStaff: (id, params = {}) => {
//     return apiClient.get(`/api/departments/${id}/staff`, { params });
//   },

//   getDepartmentCourses: (id, semesterId = null) => {
//     return apiClient.get(`/api/departments/${id}/courses`, {
//       params: { semester_id: semesterId },
//     });
//   },

//   // Aliases for backward compatibility
//   getDepartments: (params = {}) => departmentAPI.getAllDepartments(params),
//   assignHeadToDepartment: (id, userId) => departmentAPI.assignHead(id, userId),
//   getDepartmentStatistics: (id, type) =>
//     departmentAPI.getDepartmentStats(id, type),
// };

// export default departmentAPI;

// src/api/department.js
import apiClient from "./client";

const departmentAPI = {
  // ==================== CORE CRUD OPERATIONS ====================

  // Get all departments with filters
  getAllDepartments: (params = {}) => {
    return apiClient.get("/api/departments", { params });
  },

  // Get departments by college
  getDepartmentsByCollege: (collegeId, params = {}) => {
    return apiClient.get(`/api/departments/college/${collegeId}`, { params });
  },

  // Get department by ID
  getDepartmentById: (id, params = {}) => {
    return apiClient.get(`/api/departments/${id}`, { params });
  },

  // Create department
  createDepartment: (data) => {
    return apiClient.post("/api/departments", data);
  },

  // Update department
  updateDepartment: (id, data) => {
    return apiClient.put(`/api/departments/${id}`, data);
  },

  // Delete department (soft delete)
  deleteDepartment: (id) => {
    return apiClient.delete(`/api/departments/${id}`);
  },

  // Assign head to department
  assignHead: (id, userId) => {
    return apiClient.post(`/api/departments/${id}/assign-head`, {
      user_id: userId,
    });
  },

  // ==================== DASHBOARD & ANALYTICS ====================

  // Get department dashboard data
  getDepartmentDashboard: (id, timeRange = "current_semester") => {
    return apiClient.get(`/api/departments/${id}/dashboard`, {
      params: { time_range: timeRange },
    });
  },

  // Get department statistics
  getDepartmentStats: (id, type = "detailed") => {
    return apiClient.get(`/api/departments/${id}/statistics`, {
      params: { type },
    });
  },

  // Get department workload summary
  getDepartmentWorkloadSummary: (id, semesterId = null) => {
    return apiClient.get(`/api/departments/${id}/workload-summary`, {
      params: { semester_id: semesterId },
    });
  },

  // Get department activities
  getDepartmentActivities: (id, limit = 20) => {
    return apiClient.get(`/api/departments/${id}/activities`, {
      params: { limit },
    });
  },

  // ==================== DEPARTMENT DATA ====================

  // Get department staff list
  getDepartmentStaff: (id, params = {}) => {
    return apiClient.get(`/api/departments/${id}/staff`, { params });
  },

  // Get department courses
  getDepartmentCourses: (id, semesterId = null) => {
    return apiClient.get(`/api/departments/${id}/courses`, {
      params: { semester_id: semesterId },
    });
  },

  // Get department programs
  getDepartmentPrograms: (id) => {
    return apiClient.get(`/api/departments/${id}/programs`);
  },

  // ==================== COURSE ASSIGNMENT RELATED ====================

  // Get department course assignments
  getDepartmentAssignments: (id, params = {}) => {
    return apiClient.get(`/api/departments/${id}/assignments`, { params });
  },

  // Get pending assignments
  getPendingAssignments: (id) => {
    return apiClient.get(`/api/departments/${id}/assignments/pending`);
  },

  // Get assignment statistics
  getAssignmentStats: (id) => {
    return apiClient.get(`/api/departments/${id}/assignments/stats`);
  },

  // ==================== WORKLOAD RELATED ====================

  // Get department workload distribution
  getWorkloadDistribution: (id) => {
    return apiClient.get(`/api/departments/${id}/workload-distribution`);
  },

  // Get overload staff list
  getOverloadStaff: (id) => {
    return apiClient.get(`/api/departments/${id}/overload-staff`);
  },

  // ==================== APPROVALS ====================

  // Get pending course requests
  getPendingCourseRequests: (id) => {
    return apiClient.get(`/api/departments/${id}/course-requests/pending`);
  },

  // Get pending workload approvals
  getPendingWorkloadApprovals: (id) => {
    return apiClient.get(`/api/departments/${id}/workload-approvals/pending`);
  },

  // ==================== EXPORT & REPORTS ====================

  // Export department data
  exportDepartmentData: (id, format = "pdf") => {
    return apiClient.get(`/api/departments/${id}/export`, {
      params: { format },
      responseType: format === "json" ? "json" : "blob",
    });
  },

  // Export department report
  exportDepartmentReport: (id, reportType) => {
    return apiClient.get(`/api/departments/${id}/reports/${reportType}`, {
      responseType: "blob",
    });
  },

  // ==================== ADVANCED OPERATIONS ====================

  // Advanced search
  advancedSearch: (params = {}) => {
    return apiClient.get("/api/departments/search/advanced", { params });
  },

  // Update department status
  updateDepartmentStatus: (id, status) => {
    return apiClient.post(`/api/departments/${id}/status`, { status });
  },

  // Merge departments
  mergeDepartments: (sourceId, targetId) => {
    return apiClient.post("/api/departments/merge", {
      source_department_id: sourceId,
      target_department_id: targetId,
    });
  },

  // Bulk update departments
  bulkUpdateDepartments: (updates = []) => {
    return apiClient.post("/api/departments/bulk/update", { updates });
  },
};

export default departmentAPI;