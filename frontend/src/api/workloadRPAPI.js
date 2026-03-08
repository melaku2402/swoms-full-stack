// src/api/workloadRPAPI.js
import apiClient from "./client";

export const workloadRPAPI = {
  // Instructor (My) Workload
  getMyWorkload: (params) => apiClient.get("/api/workload-rp/me", { params }),
  getMyWorkloadDashboard: (params) =>
    apiClient.get("/api/workload-rp/me/dashboard", { params }),
  createOrUpdateMyWorkload: (data) =>
    apiClient.post("/api/workload-rp/me", data),
  calculateFromMySections: (data) =>
    apiClient.post("/api/workload-rp/me/calculate-from-sections", data),
  submitMyWorkload: (id) => apiClient.post(`/api/workload-rp/me/${id}/submit`),

  // All Workloads (Management)
  getAllWorkloads: (params) => apiClient.get("/api/workload-rp", { params }),
  getWorkloadById: (id) => apiClient.get(`/api/workload-rp/${id}`),
  createOrUpdateWorkload: (data) => apiClient.post("/api/workload-rp", data),
  calculateFromSections: (data) =>
    apiClient.post("/api/workload-rp/calculate-from-sections", data),
  deleteWorkload: (id) => apiClient.delete(`/workload-rp/${id}`),

  // Statistics & Reports
  getWorkloadStatistics: (params) =>
    apiClient.get("/api/workload-rp/statistics/overview", { params }),
  getDepartmentWorkloadSummary: (departmentId, params) =>
    apiClient.get(`/api/workload-rp/department/${departmentId}/summary`, {
      params,
    }),

  // Approval Workflow
  getMyPendingApprovals: () =>
    apiClient.get("/api/workload-rp/approvals/pending"),
  getApprovalWorkflow: (id) =>
    apiClient.get(`/api/workload-rp/${id}/approvals`),
  approveStep: (approvalId, data) =>
    apiClient.post(`/api/workload-rp/approvals/${approvalId}/approve`, data),
  rejectWorkload: (id, data) =>
    apiClient.post(`/api/workload-rp/${id}/reject`, data),
  returnForCorrection: (id, data) =>
    apiClient.post(`/api/workload-rp/${id}/return`, data),
};

export default workloadRPAPI;
