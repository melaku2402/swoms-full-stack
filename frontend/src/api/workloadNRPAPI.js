// src/api/workloadNRPAPI.js

import apiClient from "./client";
export const workloadNRPAPI = {
  // Create & Update
  createNRPWorkload: (data) => apiClient.post("/api/workload-nrp", data),
  updateNRPWorkload: (id, data) =>
    apiClient.put(`/api/workload-nrp/${id}`, data),

  // Read
  getAllNRPWorkloads: (params) =>
    apiClient.get("/api/workload-nrp", { params }),
  getNRPWorkloadById: (id) => apiClient.get(`/api/workload-nrp/${id}`),
  getMyNRPWorkloads: (params) =>
    apiClient.get("/api/workload-nrp/me", { params }),

  // Submit & Approvals
  submitForApproval: (id) => apiClient.post(`/api/workload-nrp/${id}/submit`),
  getApprovalWorkflow: (id) =>
    apiClient.get(`/api/workload-nrp/${id}/approvals`),
  approveWorkloadStep: (id, data) =>
    apiClient.post(`/api/workload-nrp/${id}/approve`, data),
  rejectWorkload: (id, data) =>
    apiClient.post(`/api/workload-nrp/${id}/reject`, data),
  returnForCorrection: (id, data) =>
    apiClient.post(`/api/workload-nrp/${id}/return`, data),

  // Statistics & Dashboard
  getNRPStatistics: (params) =>
    apiClient.get("/api/workload-nrp/statistics/dashboard", { params }),
  getMyPendingApprovals: () => apiClient.get("/workload-nrp/approvals/pending"),

  // Payment Calculation
  calculatePayment: (id) => apiClient.get(`/api/workload-nrp/${id}/calculate`),

  // From Course (if implemented)
  calculateFromCourse: (staffId, semesterId, courseId, programType) =>
    apiClient.post("/api/workload-nrp/calculate-from-course", {
      staff_id: staffId,
      semester_id: semesterId,
      course_id: courseId,
      program_type: programType,
    }),
};

export default workloadNRPAPI;
