// src/api/workloadReportAPI.js
import apiClient from "./client";

export const workloadReportAPI = {
  // Generate comprehensive report
  generateReport: (params) =>
    apiClient.get("/api/workload-report/generate", params),

  // Export report
  exportReport: (data, format) =>
    apiClient.post(`/api/workload-report/export?format=${format}`, data, {
      responseType: format === "json" ? "json" : "blob",
    }),

  // Get available semesters
  getAvailableSemesters: () => apiClient.get("/api/workload-report/semesters"),

  // Get department statistics
  getDepartmentStats: (departmentId) =>
    apiClient.get(`/api/workload-report/department/${departmentId}/stats`),

  // Get staff performance
  getStaffPerformance: (staffId, params) =>
    apiClient.get(`/api/workload-report/staff/${staffId}/performance`, { params }),

  // Get dashboard summary
  getDashboardSummary: () => apiClient.get("/api/workload-report/dashboard"),
};

export default workloadReportAPI;
