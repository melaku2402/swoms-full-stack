// import apiClient from "./client";

// export const exportAPI = {
//   // Comprehensive Export
//   exportDashboard: (format) =>
//     apiClient.get(`/api/export/dashboard/${format}`, {
//       responseType: "blob",
//     }),

//   // Specific Exports
//   exportWorkloads: (params) =>
//     apiClient.get("/api/export/workloads", {
//       params,
//       responseType: "blob",
//     }),

//   exportPayments: (params) =>
//     apiClient.get("/api/export/payments", {
//       params,
//       responseType: "blob",
//     }),

//   exportUsers: (params) =>
//     apiClient.get("/api/export/users", {
//       params,
//       responseType: "blob",
//     }),

//   // Report Generation
//   generateReport: (type, params) =>
//     apiClient.get(`/api/export/reports/${type}`, {
//       params,
//       responseType: "blob",
//     }),
// };

// src/api/export.js
import apiClient from './client';

export const exportAPI = {
  // Dashboard export - DIRECT MATCH to controller method
  exportDashboard: (format) => {
    console.log('📤 Exporting dashboard in format:', format);
    return apiClient.get(`/api/export/dashboard/${format}`, {
      responseType: "blob",
    }).then(response => {
      console.log('📤 Dashboard export response:', response);
      return response;
    });
  },

  // Workloads export - DIRECT MATCH to controller method
  exportWorkloads: (params) => {
    console.log('📤 Exporting workloads with params:', params);
    return apiClient.get("/api/export/workloads", {
      params,
      responseType: "blob",
    }).then(response => {
      console.log('📤 Workloads export response:', response);
      return response;
    });
  },

  // Payments export - DIRECT MATCH to controller method
  exportPayments: (params) => {
    console.log('📤 Exporting payments with params:', params);
    return apiClient.get("/api/export/payments", {
      params,
      responseType: "blob",
    }).then(response => {
      console.log('📤 Payments export response:', response);
      return response;
    });
  },

  // Users export - DIRECT MATCH to controller method
  exportUsers: (params) => {
    console.log('📤 Exporting users with params:', params);
    return apiClient.get("/api/export/users", {
      params,
      responseType: "blob",
    }).then(response => {
      console.log('📤 Users export response:', response);
      return response;
    });
  },

  // Custom reports - DIRECT MATCH to controller method
  generateReport: (type, params) => {
    console.log('📤 Generating report type:', type, 'with params:', params);
    return apiClient.get(`/api/export/reports/${type}`, {
      params,
      responseType: "blob",
    }).then(response => {
      console.log('📤 Generate report response:', response);
      return response;
    });
  },

  // NRP contracts export - DIRECT MATCH to route
  exportNRPContracts: (params) => {
    console.log('📤 Exporting NRP contracts with params:', params);
    return apiClient.get("/api/export/nrp-contracts", {
      params,
      responseType: "blob",
    }).then(response => {
      console.log('📤 NRP contracts export response:', response);
      return response;
    });
  },

  // Staff directory export - DIRECT MATCH to route
  exportStaffDirectory: (params) => {
    console.log('📤 Exporting staff directory with params:', params);
    return apiClient.get("/api/export/staff-directory", {
      params,
      responseType: "blob",
    }).then(response => {
      console.log('📤 Staff directory export response:', response);
      return response;
    });
  },

  // Course catalog export - DIRECT MATCH to route
  exportCourseCatalog: (params) => {
    console.log('📤 Exporting course catalog with params:', params);
    return apiClient.get("/api/export/course-catalog", {
      params,
      responseType: "blob",
    }).then(response => {
      console.log('📤 Course catalog export response:', response);
      return response;
    });
  },

  // Financial report export - DIRECT MATCH to route
  exportFinancialReport: (params) => {
    console.log('📤 Exporting financial report with params:', params);
    return apiClient.get("/api/export/financial-report", {
      params,
      responseType: "blob",
    }).then(response => {
      console.log('📤 Financial report export response:', response);
      return response;
    });
  },

  // Overload report export - DIRECT MATCH to route
  exportOverloadReport: (params) => {
    console.log('📤 Exporting overload report with params:', params);
    return apiClient.get("/api/export/overload-report", {
      params,
      responseType: "blob",
    }).then(response => {
      console.log('📤 Overload report export response:', response);
      return response;
    });
  }
};

// Remove duplicate default export
// export default exportAPI;