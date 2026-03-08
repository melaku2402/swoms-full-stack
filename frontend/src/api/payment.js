import apiClient from "./client";

export const paymentAPI = {
  getPaymentSheets: (params) =>
    apiClient.get("/api/payments/sheets", { params }),
  getPaymentSheetById: (id) => apiClient.get(`/api/payments/sheets/${id}`),
  updatePaymentStatus: (id, data) =>
    apiClient.put(`/api/payments/sheets/${id}/status`, data),
  exportPaymentSheet: (id, format = "pdf") =>
    apiClient.get(`/api/payments/sheets/${id}/export`, { params: { format } }),

  getPaymentStatistics: (params) =>
    apiClient.get("/api/payments/statistics", { params }),

  bulkUpdatePaymentStatus: (data) =>
    apiClient.post("/api/payments/bulk-update", data),

  calculateNRPPayment: (nrpId, data) =>
    apiClient.post(`/api/payments/nrp/${nrpId}/calculate`, data),
  createNRPPaymentSheet: (nrpId, data) =>
    apiClient.post(`/api/payments/nrp/${nrpId}/sheet`, data),

  calculateOverloadPayment: (staffId, semesterId, data) =>
    apiClient.post(
      `/api/payments/overload/${staffId}/${semesterId}/calculate`,
      data
    ),
  createOverloadPaymentSheet: (overloadId) =>
    apiClient.post(`/api/payments/overload/${overloadId}/sheet`),

  getPaymentsByStaff: (staffId, params) =>
    apiClient.get(`/api/payments/staff/${staffId}`, { params }),
  getPaymentsBySemester: (semesterId, params) =>
    apiClient.get(`/api/payments/semester/${semesterId}`, { params }),

  downloadPaymentSheet: (id, format = "pdf") =>
    apiClient.get(`/api/payments/${id}/download`, { params: { format } }),
  generatePaymentSummary: (params) =>
    apiClient.get("/api/payments/summary", { params }),
};
