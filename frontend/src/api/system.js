// import apiClient from "./client";

// export const systemAPI = {
//   // System Health
//   getSystemHealth: () => apiClient.get("/api/system/health"),
//   getSystemMetrics: () => apiClient.get("/api/system/metrics"),
//   getActiveSessions: () => apiClient.get("/api/system/active-sessions"),
//   getSystemLogs: (params) => apiClient.get("/api/system/logs", { params }),

//   // Backup & Export
//   createBackup: () => apiClient.post("/api/system/backup"),
//   exportData: (format) =>
//     apiClient.get(`/api/system/export/${format}`, {
//       responseType: "blob",
//     }),

//   // Dashboard Stats
//   getDashboardStats: (params) =>
//     apiClient.get("/api/system/dashboard-stats", { params }),
//   getRecentActivities: () => apiClient.get("/api/system/recent-activities"),
// };
// export default systemAPI;


import apiClient from "./client";

// ================ SYSTEM API ================
export const systemAPI = {
  // Get system health (public)
  getSystemHealth: () => apiClient.get("/api/system/health"),

  // Get dashboard statistics
  getDashboardStats: () => apiClient.get("/api/system/dashboard-stats"),

  // Get recent activities
  getRecentActivities: (params = {}) =>
    apiClient.get("/api/system/recent-activities", { params }),

  // Get audit log
  getAuditLog: (params = {}) =>
    apiClient.get("/api/system/audit-log", { params }),

  // Get system metrics
  getSystemMetrics: () => apiClient.get("/api/system/metrics"),

  // Backup database
  backupDatabase: () => apiClient.post("/api/system/backup"),

  // Restore database
  restoreDatabase: (backupFile, confirm) =>
    apiClient.post("/api/system/restore", { backup_file: backupFile, confirm }),

  // Clear cache
  clearCache: () => apiClient.post("/api/system/clear-cache"),

  // Get server status
  getServerStatus: () => apiClient.get("/api/system/server-status"),

  // Get database statistics
  getDatabaseStats: () => apiClient.get("/api/system/database-stats"),
};

// ================ SYSTEM UTILITIES ================
export const systemUtils = {
  // Format bytes to human readable
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },

  // Format uptime
  formatUptime: (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
  },

  // Get health status color
  getHealthStatusColor: (status) => {
    const colors = {
      healthy: "success",
      degraded: "warning",
      unhealthy: "danger",
    };
    return colors[status] || "secondary";
  },

  // Get service status icon
  getServiceStatusIcon: (status) => {
    const icons = {
      running: "✅",
      connected: "✅",
      available: "✅",
      stopped: "❌",
      disconnected: "❌",
      unavailable: "❌",
      warning: "⚠️",
    };
    return icons[status] || "❓";
  },

  // Parse audit log entry
  parseAuditEntry: (entry) => {
    const changes = entry.changes
      ? {
          from:
            typeof entry.changes.from === "string"
              ? JSON.parse(entry.changes.from)
              : entry.changes.from,
          to:
            typeof entry.changes.to === "string"
              ? JSON.parse(entry.changes.to)
              : entry.changes.to,
        }
      : null;

    return {
      ...entry,
      timestamp: new Date(entry.timestamp).toLocaleString(),
      user_label: `${entry.username} (${entry.role})`,
      action_label: entry.action.replace(/_/g, " ").toUpperCase(),
      changes,
    };
  },

  // Calculate system load percentage
  calculateLoadPercentage: (loadavg, cores) => {
    // loadavg[0] is 1-minute average
    const loadPercentage = (loadavg[0] / cores) * 100;
    return Math.min(100, Math.max(0, loadPercentage));
  },

  // Get load status
  getLoadStatus: (percentage) => {
    if (percentage < 50) return { status: "Low", color: "success" };
    if (percentage < 80) return { status: "Normal", color: "warning" };
    return { status: "High", color: "danger" };
  },

  // Prepare dashboard data for charts
  prepareDashboardCharts: (dashboardData) => {
    if (!dashboardData) return null;

    const charts = {
      counts: {
        labels: ["Users", "Staff", "Courses", "Departments", "Colleges"],
        datasets: [
          {
            label: "Count",
            data: [
              dashboardData.counts?.users || 0,
              dashboardData.counts?.staff || 0,
              dashboardData.counts?.courses || 0,
              dashboardData.counts?.departments || 0,
              dashboardData.counts?.colleges || 0,
            ],
            backgroundColor: [
              "rgba(59, 130, 246, 0.7)",
              "rgba(16, 185, 129, 0.7)",
              "rgba(245, 158, 11, 0.7)",
              "rgba(139, 92, 246, 0.7)",
              "rgba(239, 68, 68, 0.7)",
            ],
            borderColor: [
              "rgb(59, 130, 246)",
              "rgb(16, 185, 129)",
              "rgb(245, 158, 11)",
              "rgb(139, 92, 246)",
              "rgb(239, 68, 68)",
            ],
            borderWidth: 1,
          },
        ],
      },
      financial: {
        labels: ["Paid", "Pending"],
        datasets: [
          {
            label: "Amount (ETB)",
            data: [
              dashboardData.overview?.financial_summary?.total_paid || 0,
              dashboardData.overview?.financial_summary?.total_pending || 0,
            ],
            backgroundColor: [
              "rgba(16, 185, 129, 0.7)",
              "rgba(245, 158, 11, 0.7)",
            ],
            borderColor: ["rgb(16, 185, 129)", "rgb(245, 158, 11)"],
            borderWidth: 1,
          },
        ],
      },
    };

    return charts;
  },

  // Filter audit log by action type
  filterAuditByActionType: (auditLog, actionTypes = []) => {
    if (!actionTypes.length) return auditLog;

    return auditLog.filter((entry) =>
      actionTypes.some((type) => entry.action.includes(type))
    );
  },

  // Group activities by date
  groupActivitiesByDate: (activities) => {
    const grouped = {};

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString();

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(activity);
    });

    return Object.entries(grouped)
      .map(([date, items]) => ({
        date,
        items,
        count: items.length,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },
};

// export default systemAPI;
