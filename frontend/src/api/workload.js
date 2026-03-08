


// // src/api/workload.js
// import apiClient from './client';

// const workloadAPI = {
//   // Get workload dashboard stats
//   getDashboardStats: async () => {
//     try {
//       return await apiClient.get('/workload/dashboard');
//     } catch (error) {
//       console.error('Error fetching workload dashboard:', error);
//       throw error;
//     }
//   },

//   // Get all assignments for current instructor
//   getMyAssignments: async (params = {}) => {
//     try {
//       return await apiClient.get('/workload/assignments', { params });
//     } catch (error) {
//       console.error('Error fetching assignments:', error);
//       throw error;
//     }
//   },

//   // Accept/decline assignment
//   updateAssignmentStatus: async (assignmentId, status, reason = '') => {
//     try {
//       return await apiClient.put(`/workload/assignments/${assignmentId}/status`, {
//         status,
//         reason
//       });
//     } catch (error) {
//       console.error('Error updating assignment status:', error);
//       throw error;
//     }
//   },

//   // Get RP workload
//   getRPWorkload: async (params = {}) => {
//     try {
//       return await apiClient.get('/workload/rp', { params });
//     } catch (error) {
//       console.error('Error fetching RP workload:', error);
//       throw error;
//     }
//   },

//   // Create/update RP workload
//   saveRPWorkload: async (data) => {
//     try {
//       if (data.workload_id) {
//         return await apiClient.put(`/workload/rp/${data.workload_id}`, data);
//       } else {
//         return await apiClient.post('/workload/rp', data);
//       }
//     } catch (error) {
//       console.error('Error saving RP workload:', error);
//       throw error;
//     }
//   },

//   // Submit RP workload for approval
//   submitRPWorkload: async (workloadId) => {
//     try {
//       return await apiClient.post(`/workload/rp/${workloadId}/submit`);
//     } catch (error) {
//       console.error('Error submitting RP workload:', error);
//       throw error;
//     }
//   },

//   // Get NRP workload
//   getNRPWorkload: async (params = {}) => {
//     try {
//       return await apiClient.get('/workload/nrp', { params });
//     } catch (error) {
//       console.error('Error fetching NRP workload:', error);
//       throw error;
//     }
//   },

//   // Create/update NRP workload
//   saveNRPWorkload: async (data) => {
//     try {
//       if (data.nrp_id) {
//         return await apiClient.put(`/workload/nrp/${data.nrp_id}`, data);
//       } else {
//         return await apiClient.post('/workload/nrp', data);
//       }
//     } catch (error) {
//       console.error('Error saving NRP workload:', error);
//       throw error;
//     }
//   },

//   // Submit NRP workload for approval
//   submitNRPWorkload: async (nrpId) => {
//     try {
//       return await apiClient.post(`/workload/nrp/${nrpId}/submit`);
//     } catch (error) {
//       console.error('Error submitting NRP workload:', error);
//       throw error;
//     }
//   },

//   // Get workload summary
//   getWorkloadSummary: async (semesterId = null) => {
//     try {
//       const params = semesterId ? { semester_id: semesterId } : {};
//       return await apiClient.get('/workload/summary', { params });
//     } catch (error) {
//       console.error('Error fetching workload summary:', error);
//       throw error;
//     }
//   },

//   // Calculate overload status
//   checkOverload: async (semesterId = null) => {
//     try {
//       const params = semesterId ? { semester_id: semesterId } : {};
//       return await apiClient.get('/workload/overload-check', { params });
//     } catch (error) {
//       console.error('Error checking overload:', error);
//       throw error;
//     }
//   },

//   // Get approval workflow status
//   getApprovalStatus: async (workloadId, type = 'rp') => {
//     try {
//       return await apiClient.get(`/workload/${type}/${workloadId}/approvals`);
//     } catch (error) {
//       console.error('Error fetching approval status:', error);
//       throw error;
//     }
//   },

//   // Get available courses for requests
//   getAvailableCourses: async (params = {}) => {
//     try {
//       return await apiClient.get('/courses/available', { params });
//     } catch (error) {
//       console.error('Error fetching available courses:', error);
//       throw error;
//     }
//   },

//   // Request a course
//   requestCourse: async (courseId, semesterId, sectionCode = '', reason = '') => {
//     try {
//       return await apiClient.post('/course-requests', {
//         course_id: courseId,
//         semester_id: semesterId,
//         section_code: sectionCode,
//         reason: reason
//       });
//     } catch (error) {
//       console.error('Error requesting course:', error);
//       throw error;
//     }
//   },

//   // Get my course requests
//   getMyCourseRequests: async (params = {}) => {
//     try {
//       return await apiClient.get('/course-requests/my', { params });
//     } catch (error) {
//       console.error('Error fetching course requests:', error);
//       throw error;
//     }
//   }



//   //..................................................................................................................................................................................................................................................................................................................
  
// };




// export default workloadAPI;

// src/api/workload.js
import apiClient from "./client";

export const workloadAPI = {
  // RP Workload endpoints
  rp: {
    createOrUpdate: (data) => apiClient.post("/api/workload-rp", data),
    getAllWorkloads: (params) => apiClient.get("/api/workload-rp", { params }),
    getWorkloadById: (id) => apiClient.get(`/api/workload-rp/${id}`),
    getMyWorkload: (params) => apiClient.get("/api/workload-rp/me", { params }),
    submitForApproval: (id) => apiClient.post(`/api/workload-rp/${id}/submit`),
    calculateFromSections: (data) =>
      apiClient.post("/api/workload-rp/calculate-from-sections", data),
    getStatistics: (params) =>
      apiClient.get("/api/workload-rp/statistics", { params }),
    getPendingApprovals: () =>
      apiClient.get("/api/workload-rp/approvals/pending"),
  },

  // NRP Workload endpoints
  nrp: {
    createOrUpdate: (data) => apiClient.post("/api/workload-nrp", data),
    getAllNRPWorkloads: (params) =>
      apiClient.get("/api/workload-nrp", { params }),
    getWorkloadById: (id) => apiClient.get(`/api/workload-nrp/${id}`),
    getMyWorkloads: (params) =>
      apiClient.get("/api/workload-nrp/me", { params }),
    submitForApproval: (id) => apiClient.post(`/api/workload-nrp/${id}/submit`),
    calculatePayment: (id) =>
      apiClient.get(`/api/workload-nrp/${id}/calculate-payment`),
    getStatistics: (params) =>
      apiClient.get("/api/workload-nrp/statistics", { params }),
    getPendingApprovals: () =>
      apiClient.get("/api/workload-nrp/approvals/pending"),
  },

  // Report endpoints
  report: {
    generate: (params) =>
      apiClient.get("/api/workload-report/generate", { params }),
    export: (data, format) =>
      apiClient.post(`/api/workload-report/export?format=${format}`, data),
    getDashboard: () => apiClient.get("/api/workload-report/dashboard"),
    getSemesters: () => apiClient.get("/api/workload-report/semesters"),
  },
};

export default workloadAPI;