import apiClient from "./apiClient";

const userApi = {
  // ==================== CORE USER OPERATIONS ====================

  // Get all users with pagination and filters
  getAllUsers: (params = {}) => {
    return apiClient.get("/api/auth/users", { params });
  },

  // Get user by ID
  getUserById: (id) => {
    return apiClient.get(`/api/auth/users/${id}`);
  },

  // Create new user
  createUser: (userData) => {
    return apiClient.post("/api/auth/users", userData);
  },

  // Update user
  updateUser: (id, userData) => {
    return apiClient.put(`/api/auth/users/${id}`, userData);
  },

  // Delete user (soft delete)
  deleteUser: (id) => {
    return apiClient.delete(`/api/auth/users/${id}`);
  },

  // Deactivate user
  deactivateUser: (id) => {
    return apiClient.put(`/api/auth/users/${id}/deactivate`);
  },

  // Activate user
  activateUser: (id) => {
    return apiClient.put(`/api/auth/users/${id}/activate`);
  },

  // Reset password
  resetPassword: (id, passwordData) => {
    return apiClient.put(`/api/auth/users/${id}/reset-password`, passwordData);
  },

  // ==================== USER PROFILE OPERATIONS ====================

  // Get user profile
  getUserProfile: () => {
    return apiClient.get("/api/auth/profile");
  },

  // Update user profile
  updateUserProfile: (profileData) => {
    return apiClient.put("/api/auth/profile", profileData);
  },

  // Change password
  changePassword: (passwordData) => {
    return apiClient.put("/api/auth/change-password", passwordData);
  },

  // ==================== ROLE & PERMISSION OPERATIONS ====================

  // Get users by role
  getUsersByRole: (role, params = {}) => {
    return apiClient.get(`/api/auth/users/role/${role}`, { params });
  },

  // Get role statistics
  getRoleStats: () => {
    return apiClient.get("/api/auth/users/role-stats");
  },

  // Update user role
  updateUserRole: (id, roleData) => {
    return apiClient.put(`/api/auth/users/${id}/role`, roleData);
  },

  // ==================== BULK OPERATIONS ====================

  // Bulk create users
  bulkCreateUsers: (usersData) => {
    return apiClient.post("/api/auth/users/bulk", usersData);
  },

  // Bulk update users
  bulkUpdateUsers: (updates) => {
    return apiClient.put("/api/auth/users/bulk", updates);
  },

  // Bulk deactivate users
  bulkDeactivateUsers: (userIds) => {
    return apiClient.post("/api/auth/users/bulk/deactivate", { userIds });
  },

  // ==================== SEARCH & FILTER OPERATIONS ====================

  // Search users
  searchUsers: (query, params = {}) => {
    return apiClient.get("/api/auth/users/search", {
      params: { q: query, ...params },
    });
  },

  // Advanced search
  advancedSearch: (filters = {}) => {
    return apiClient.get("/api/auth/users/search/advanced", {
      params: filters,
    });
  },

  // ==================== EXPORT OPERATIONS ====================

  // Export users to CSV
  exportUsersToCSV: (params = {}) => {
    return apiClient.get("/api/auth/users/export/csv", {
      params,
      responseType: "blob",
    });
  },

  // Export users to Excel
  exportUsersToExcel: (params = {}) => {
    return apiClient.get("/api/auth/users/export/excel", {
      params,
      responseType: "blob",
    });
  },

  // ==================== UTILITY OPERATIONS ====================

  // Check username availability
  checkUsernameAvailability: (username) => {
    return apiClient.get(`/api/auth/users/check-username/${username}`);
  },

  // Check email availability
  checkEmailAvailability: (email) => {
    return apiClient.get(`/api/auth/users/check-email/${email}`);
  },

  // Get user activity
  getUserActivity: (id, params = {}) => {
    return apiClient.get(`/api/auth/users/${id}/activity`, { params });
  },

  // Get user's created users (for admins who create users)
  getMyCreatedUsers: (params = {}) => {
    return apiClient.get("/api/auth/users/my-created", { params });
  },

  // ==================== DEPARTMENT & COLLEGE INTEGRATION ====================

  // Get users by department
  getUsersByDepartment: (departmentId, params = {}) => {
    return apiClient.get(`/api/auth/users/department/${departmentId}`, {
      params,
    });
  },

  // Get users by college
  getUsersByCollege: (collegeId, params = {}) => {
    return apiClient.get(`/api/auth/users/college/${collegeId}`, { params });
  },

  // Assign user to department
  assignToDepartment: (userId, departmentId) => {
    return apiClient.post(`/api/auth/users/${userId}/assign-department`, {
      department_id: departmentId,
    });
  },

  // Remove from department
  removeFromDepartment: (userId) => {
    return apiClient.delete(`/api/auth/users/${userId}/department`);
  },

  // ==================== STAFF PROFILE OPERATIONS ====================

  // Get staff profile
  getStaffProfile: (userId) => {
    return apiClient.get(`/api/auth/users/${userId}/staff-profile`);
  },

  // Update staff profile
  updateStaffProfile: (userId, profileData) => {
    return apiClient.put(
      `/api/auth/users/${userId}/staff-profile`,
      profileData
    );
  },

  // Create staff profile
  createStaffProfile: (userId, profileData) => {
    return apiClient.post(
      `/api/auth/users/${userId}/staff-profile`,
      profileData
    );
  },
};

export default userApi;
