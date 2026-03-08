// import apiClient from "./client";

// // ================ OVERLOAD DETECTION API ================
// export const overloadDetectionAPI = {
//   // Check staff overload
//   checkStaffOverload: (staffId, semesterId) =>
//     apiClient.get(`/api/overload-detection/staff/${staffId}/${semesterId}`),

//   // Check department overload
//   checkDepartmentOverload: (departmentId, semesterId) =>
//     apiClient.get(
//       `/api/overload-detection/department/${departmentId}/${semesterId}`
//     ),

//   // Check my overload (for instructors)
//   checkMyOverload: (params = {}) =>
//     apiClient.get("/api/overload-detection/my", { params }),

//   // Predict overload trend
//   predictOverloadTrend: (staffId, upcomingSemesterId) =>
//     apiClient.post(`/api/overload-detection/predict/${staffId}`, {
//       upcoming_semester_id: upcomingSemesterId,
//     }),

//   // Generate overload report for approval
//   generateOverloadReport: (staffId, semesterId) =>
//     apiClient.get(`/api/overload-detection/report/${staffId}/${semesterId}`),

//   // Get overload alerts
//   getOverloadAlerts: (params = {}) =>
//     apiClient.get("/api/overload-detection/alerts", { params }),
// };

// // ================ OVERLOAD DETECTION UTILITIES ================
// export const overloadDetectionUtils = {
//   // Get workload status label
//   getWorkloadStatus: (percentage) => {
//     if (percentage <= 0) return "No Load";
//     if (percentage < 50) return "Underloaded";
//     if (percentage < 80) return "Normal";
//     if (percentage < 100) return "High Load";
//     if (percentage < 120) return "Moderate Overload";
//     if (percentage < 150) return "High Overload";
//     return "Critical Overload";
//   },

//   // Get status color
//   getStatusColor: (percentage) => {
//     if (percentage < 50) return "#3b82f6"; // blue
//     if (percentage < 80) return "#10b981"; // green
//     if (percentage < 100) return "#f59e0b"; // amber
//     if (percentage < 120) return "#f97316"; // orange
//     if (percentage < 150) return "#ef4444"; // red
//     return "#991b1b"; // dark red
//   },

//   // Get alert priority
//   getAlertPriority: (loadPercentage) => {
//     if (loadPercentage >= 150) return 5; // Critical
//     if (loadPercentage >= 120) return 4; // High
//     if (loadPercentage >= 100) return 3; // Medium
//     if (loadPercentage >= 90) return 2; // Low
//     return 1; // Warning
//   },

//   // Format overload report for display
//   formatOverloadReport: (report) => {
//     if (!report) return null;

//     return {
//       ...report,
//       financial_summary: {
//         ...report.financial_summary,
//         formatted: {
//           gross_amount: report.financial_summary.gross_amount?.toLocaleString(
//             "en-US",
//             {
//               style: "currency",
//               currency: "ETB",
//             }
//           ),
//           tax_amount: report.financial_summary.tax_amount?.toLocaleString(
//             "en-US",
//             {
//               style: "currency",
//               currency: "ETB",
//             }
//           ),
//           net_amount: report.financial_summary.net_amount?.toLocaleString(
//             "en-US",
//             {
//               style: "currency",
//               currency: "ETB",
//             }
//           ),
//         },
//       },
//       approval_steps: report.approval_steps?.map((step, index) => ({
//         ...step,
//         step_number: index + 1,
//         status_color:
//           step.status === "approved"
//             ? "success"
//             : step.status === "rejected"
//             ? "danger"
//             : step.status === "pending"
//             ? "warning"
//             : "secondary",
//       })),
//     };
//   },

//   // Generate recommendations from overload data
//   generateRecommendations: (overloadData) => {
//     const recommendations = [];
//     const { current_workload, rank_limits, breakdown } = overloadData || {};

//     if (!current_workload || !rank_limits) return recommendations;

//     const loadPercentage =
//       (current_workload.total_hours / rank_limits.max) * 100;

//     if (loadPercentage < 50) {
//       recommendations.push({
//         type: "suggestion",
//         severity: "low",
//         message:
//           "Consider requesting additional courses to meet minimum requirements",
//       });
//     } else if (loadPercentage >= 100) {
//       recommendations.push({
//         type: "warning",
//         severity: "high",
//         message: "Reduce teaching load to stay within rank limits",
//       });

//       if (breakdown?.administrative_duties?.length > 3) {
//         recommendations.push({
//           type: "suggestion",
//           severity: "medium",
//           message: "Consider reducing administrative duties",
//         });
//       }

//       const highLoadCourses = breakdown?.regular_program?.filter(
//         (c) => c.total_load > 3
//       );
//       if (highLoadCourses?.length > 0) {
//         recommendations.push({
//           type: "warning",
//           severity: "medium",
//           message:
//             "High-load courses detected. Consider splitting or reducing credit hours",
//         });
//       }
//     } else if (loadPercentage >= 80) {
//       recommendations.push({
//         type: "alert",
//         severity: "medium",
//         message: "Monitor workload carefully - approaching overload threshold",
//       });
//     }

//     return recommendations;
//   },

//   // Calculate capacity utilization
//   calculateCapacityUtilization: (currentHours, maxHours) => {
//     const utilization = (currentHours / maxHours) * 100;
//     const available = maxHours - currentHours;

//     return {
//       utilization: parseFloat(utilization.toFixed(1)),
//       available: parseFloat(available.toFixed(1)),
//       status:
//         utilization < 80 ? "good" : utilization < 100 ? "warning" : "danger",
//     };
//   },

//   // Prepare trend prediction data for charts
//   prepareTrendData: (trendPrediction) => {
//     if (!trendPrediction) return null;

//     return {
//       labels: ["Current", "Predicted"],
//       datasets: [
//         {
//           label: "Workload Hours",
//           data: [
//             trendPrediction.current_workload,
//             trendPrediction.predicted_workload,
//           ],
//           backgroundColor: ["#3b82f6", "#ef4444"],
//           borderColor: ["#1d4ed8", "#dc2626"],
//           borderWidth: 1,
//         },
//       ],
//       limitLine: trendPrediction.rank_limit,
//     };
//   },
// };

// src/api/overloadDetection.js
import apiClient from "./client";

// export const overloadDetectionAPI = {
//   // Check staff overload - DIRECT MATCH to controller method
//   checkStaffOverload: (staffId, semesterId) => {
//     console.log('⚡ Checking staff overload:', staffId, semesterId);
//     return apiClient.get(`/api/overload-detection/staff/${staffId}/${semesterId}`)
//       .then(response => {
//         console.log('⚡ Staff overload response:', response.data);
//         return response;
//       });
//   },

//   // Check department overload - DIRECT MATCH to controller method
//   checkDepartmentOverload: (departmentId, semesterId) => {
//     console.log('⚡ Checking department overload:', departmentId, semesterId);
//     return apiClient.get(`/api/overload-detection/department/${departmentId}/${semesterId}`)
//       .then(response => {
//         console.log('⚡ Department overload response:', response.data);
//         return response;
//       });
//   },

//   // Check my overload - DIRECT MATCH to controller method
//   checkMyOverload: (params = {}) => {
//     console.log('⚡ Checking my overload with params:', params);
//     return apiClient.get("/api/overload-detection/my", { params })
//       .then(response => {
//         console.log('⚡ My overload response:', response.data);
//         return response;
//       });
//   },

//   // Predict overload trend - DIRECT MATCH to controller method
//   predictOverloadTrend: (staffId, upcomingSemesterId) => {
//     console.log('⚡ Predicting overload trend for staff:', staffId, 'semester:', upcomingSemesterId);
//     return apiClient.post(`/api/overload-detection/predict/${staffId}`, {
//       upcoming_semester_id: upcomingSemesterId,
//     }).then(response => {
//       console.log('⚡ Overload trend prediction response:', response.data);
//       return response;
//     });
//   },

//   // Generate overload report - DIRECT MATCH to controller method
//   generateOverloadReport: (staffId, semesterId) => {
//     console.log('⚡ Generating overload report:', staffId, semesterId);
//     return apiClient.get(`/api/overload-detection/report/${staffId}/${semesterId}`)
//       .then(response => {
//         console.log('⚡ Overload report response:', response.data);
//         return response;
//       });
//   },

//   // Get overload alerts - DIRECT MATCH to controller method
//   getOverloadAlerts: (params = {}) => {
//     console.log('⚡ Getting overload alerts with params:', params);
//     return apiClient.get("/api/overload-detection/alerts", { params })
//       .then(response => {
//         console.log('⚡ Overload alerts response:', response.data);
//         return response;
//       });
//   }
// };
// ================ OVERLOAD DETECTION UTILITIES ================

export const overloadDetectionAPI = {
  // Check staff overload - FIXED
  checkStaffOverload: (staffId, semesterId) => {
    console.log("⚡ Checking staff overload:", staffId, semesterId);
    return apiClient
      .get(`/api/overload-detection/staff/${staffId}/${semesterId}`)
      .then((response) => {
        console.log("⚡ Staff overload response:", response);
        return response;
      })
      .catch((error) => {
        console.error("⚡ Staff overload error:", error);
        throw error;
      });
  },

  // Check department overload - FIXED
  checkDepartmentOverload: (departmentId, semesterId) => {
    console.log("⚡ Checking department overload:", departmentId, semesterId);
    return apiClient
      .get(`/api/overload-detection/department/${departmentId}/${semesterId}`)
      .then((response) => {
        console.log("⚡ Department overload response:", response);
        return response;
      })
      .catch((error) => {
        console.error("⚡ Department overload error:", error);
        throw error;
      });
  },

  // Check my overload - FIXED
  checkMyOverload: (params = {}) => {
    console.log("⚡ Checking my overload with params:", params);
    return apiClient
      .get("/api/overload-detection/my", params)
      .then((response) => {
        console.log("⚡ My overload response:", response);
        return response;
      })
      .catch((error) => {
        console.error("⚡ My overload error:", error);
        throw error;
      });
  },

  // Get overload alerts - FIXED
  getOverloadAlerts: (params = {}) => {
    console.log("⚡ Getting overload alerts with params:", params);
    return apiClient
      .get("/api/overload-detection/alerts", params)
      .then((response) => {
        console.log("⚡ Overload alerts response:", response);
        return response;
      })
      .catch((error) => {
        console.error("⚡ Overload alerts error:", error);
        throw error;
      });
  },

  // Predict overload trend - FIXED
  predictOverloadTrend: (staffId, upcomingSemesterId) => {
    console.log(
      "⚡ Predicting overload trend for staff:",
      staffId,
      "semester:",
      upcomingSemesterId
    );
    return apiClient
      .post(`/api/overload-detection/predict/${staffId}`, {
        upcoming_semester_id: upcomingSemesterId,
      })
      .then((response) => {
        console.log("⚡ Overload trend prediction response:", response);
        return response;
      })
      .catch((error) => {
        console.error("⚡ Overload trend error:", error);
        throw error;
      });
  },

  // Generate overload report - FIXED
  generateOverloadReport: (staffId, semesterId) => {
    console.log("⚡ Generating overload report:", staffId, semesterId);
    return apiClient
      .get(`/api/overload-detection/report/${staffId}/${semesterId}`)
      .then((response) => {
        console.log("⚡ Overload report response:", response);
        return response;
      })
      .catch((error) => {
        console.error("⚡ Overload report error:", error);
        throw error;
      });
  },
};
export const overloadDetectionUtils = {
  // Get workload status label
  getWorkloadStatus: (percentage) => {
    if (percentage <= 0) return "No Load";
    if (percentage < 50) return "Underloaded";
    if (percentage < 80) return "Normal";
    if (percentage < 100) return "High Load";
    if (percentage < 120) return "Moderate Overload";
    if (percentage < 150) return "High Overload";
    return "Critical Overload";
  },

  // Get status color
  getStatusColor: (percentage) => {
    if (percentage < 50) return "#3b82f6"; // blue
    if (percentage < 80) return "#10b981"; // green
    if (percentage < 100) return "#f59e0b"; // amber
    if (percentage < 120) return "#f97316"; // orange
    if (percentage < 150) return "#ef4444"; // red
    return "#991b1b"; // dark red
  },

  // Get alert priority
  getAlertPriority: (loadPercentage) => {
    if (loadPercentage >= 150) return 5; // Critical
    if (loadPercentage >= 120) return 4; // High
    if (loadPercentage >= 100) return 3; // Medium
    if (loadPercentage >= 90) return 2; // Low
    return 1; // Warning
  },

  // Format overload report for display
  formatOverloadReport: (report) => {
    if (!report) return null;

    return {
      ...report,
      financial_summary: {
        ...report.financial_summary,
        formatted: {
          gross_amount: report.financial_summary.gross_amount?.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "ETB",
            }
          ),
          tax_amount: report.financial_summary.tax_amount?.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "ETB",
            }
          ),
          net_amount: report.financial_summary.net_amount?.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "ETB",
            }
          ),
        },
      },
      approval_steps: report.approval_steps?.map((step, index) => ({
        ...step,
        step_number: index + 1,
        status_color:
          step.status === "approved"
            ? "success"
            : step.status === "rejected"
            ? "danger"
            : step.status === "pending"
            ? "warning"
            : "secondary",
      })),
    };
  },

  // Generate recommendations from overload data
  generateRecommendations: (overloadData) => {
    const recommendations = [];
    const { current_workload, rank_limits, breakdown } = overloadData || {};

    if (!current_workload || !rank_limits) return recommendations;

    const loadPercentage =
      (current_workload.total_hours / rank_limits.max) * 100;

    if (loadPercentage < 50) {
      recommendations.push({
        type: "suggestion",
        severity: "low",
        message:
          "Consider requesting additional courses to meet minimum requirements",
      });
    } else if (loadPercentage >= 100) {
      recommendations.push({
        type: "warning",
        severity: "high",
        message: "Reduce teaching load to stay within rank limits",
      });

      if (breakdown?.administrative_duties?.length > 3) {
        recommendations.push({
          type: "suggestion",
          severity: "medium",
          message: "Consider reducing administrative duties",
        });
      }

      const highLoadCourses = breakdown?.regular_program?.filter(
        (c) => c.total_load > 3
      );
      if (highLoadCourses?.length > 0) {
        recommendations.push({
          type: "warning",
          severity: "medium",
          message:
            "High-load courses detected. Consider splitting or reducing credit hours",
        });
      }
    } else if (loadPercentage >= 80) {
      recommendations.push({
        type: "alert",
        severity: "medium",
        message: "Monitor workload carefully - approaching overload threshold",
      });
    }

    return recommendations;
  },

  // Calculate capacity utilization
  calculateCapacityUtilization: (currentHours, maxHours) => {
    const utilization = (currentHours / maxHours) * 100;
    const available = maxHours - currentHours;

    return {
      utilization: parseFloat(utilization.toFixed(1)),
      available: parseFloat(available.toFixed(1)),
      status:
        utilization < 80 ? "good" : utilization < 100 ? "warning" : "danger",
    };
  },

  // Prepare trend prediction data for charts
  prepareTrendData: (trendPrediction) => {
    if (!trendPrediction) return null;

    return {
      labels: ["Current", "Predicted"],
      datasets: [
        {
          label: "Workload Hours",
          data: [
            trendPrediction.current_workload,
            trendPrediction.predicted_workload,
          ],
          backgroundColor: ["#3b82f6", "#ef4444"],
          borderColor: ["#1d4ed8", "#dc2626"],
          borderWidth: 1,
        },
      ],
      limitLine: trendPrediction.rank_limit,
    };
  },
};
// Remove duplicate default export and duplicated code