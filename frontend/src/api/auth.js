import apiClient from "./client";

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/api/auth/login", credentials);

      if (response.success && response.data) {
        const { token, user, staff_profile } = response.data;

        if (token && user) {
          const userWithProfile = {
            ...user,
            staff_profile: staff_profile || null,
            name: staff_profile
              ? `${staff_profile.first_name || ""} ${
                  staff_profile.last_name || ""
                }`.trim()
              : user.username || "User",
          };

          apiClient.setToken(token);
          apiClient.setUser(userWithProfile);
          localStorage.setItem("user_role", user.role);

          return {
            success: true,
            data: response.data,
            message: response.message || "Login successful",
          };
        } else {
          return {
            success: false,
            message: "Invalid response: missing token or user data",
          };
        }
      } else {
        return {
          success: false,
          message: response.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login API error:", error);
      return {
        success: false,
        message: error.message || "Network error. Please try again.",
      };
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      apiClient.clearAuth();
      localStorage.removeItem("user_role");
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get("/api/auth/profile");

      if (response.success && response.data) {
        const { user, staff_profile } = response.data;

        const userWithProfile = {
          ...user,
          staff_profile: staff_profile || null,
          name: staff_profile
            ? `${staff_profile.first_name || ""} ${
                staff_profile.last_name || ""
              }`.trim()
            : user.username || "User",
        };

        apiClient.setUser(userWithProfile);
        localStorage.setItem("user_role", user.role);

        return {
          success: true,
          data: userWithProfile,
          message: response.message,
        };
      }

      return {
        success: false,
        message: response.message || "Failed to get profile",
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        message: error.message || "Network error",
      };
    }
  },

  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get("/api/auth/users", { params });
      return response;
    } catch (error) {
      console.error("Get users error:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch users",
        data: null,
      };
    }
  },

  createUser: async (data) => {
    try {
      const response = await apiClient.post("/api/auth/users", data);
      return response;
    } catch (error) {
      console.error("Create user error:", error);
      return {
        success: false,
        message: error.message || "Failed to create user",
        data: null,
      };
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await apiClient.put(`/api/auth/users/${id}`, data);
      return response;
    } catch (error) {
      console.error("Update user error:", error);
      return {
        success: false,
        message: error.message || "Failed to update user",
        data: null,
      };
    }
  },

  getUser: async (id) => {
    try {
      const response = await apiClient.get(`/api/auth/users/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to get user ${id}:`, error.message);
      return {
        success: false,
        message: "User not found or server error",
        data: null,
        status: 500,
      };
    }
  },

  getUserStats: async () => {
    try {
      const response = await apiClient.get("/api/auth/users/stats");
      return response;
    } catch (error) {
      console.warn("User stats endpoint not available:", error.message);
      return {
        success: false,
        message: "Stats not available",
        data: null,
      };
    }
  },

  deactivateUser: async (id) => {
    try {
      const response = await apiClient.put(`/api/auth/users/${id}/deactivate`);
      return response;
    } catch (error) {
      console.error("Deactivate user error:", error);
      return {
        success: false,
        message: error.message || "Failed to deactivate user",
        data: null,
      };
    }
  },

  activateUser: async (id) => {
    try {
      const response = await apiClient.put(`/api/auth/users/${id}/activate`);
      return response;
    } catch (error) {
      console.error("Activate user error:", error);
      return {
        success: false,
        message: error.message || "Failed to activate user",
        data: null,
      };
    }
  },

  resetPassword: async (id, newPassword) => {
    try {
      const response = await apiClient.put(
        `/api/auth/users/${id}/reset-password`,
        { newPassword }
      );
      return response;
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: error.message || "Failed to reset password",
        data: null,
      };
    }
  },

  updateUserProfile: async (id, data) => {
    try {
      const response = await apiClient.put(
        `/api/auth/users/${id}/profile`,
        data
      );
      return response;
    } catch (error) {
      console.error("Update user profile error:", error);
      return {
        success: false,
        message: error.message || "Failed to update profile",
        data: null,
      };
    }
  },

  isAuthenticated: () => {
    const token = apiClient.getToken();
    const user = apiClient.getUser();
    return !!(token && user);
  },

  getCurrentUser: () => {
    const user = apiClient.getUser();
    if (user) {
      return {
        ...user,
        role: localStorage.getItem("user_role") || user.role,
      };
    }
    return null;
  },

  hasPermission: (requiredRoles = []) => {
    const user = apiClient.getUser();
    if (!user) return false;
    if (requiredRoles.length === 0) return true;
    return requiredRoles.includes(user.role);
  },

  canManageUsers: () => {
    const user = apiClient.getUser();
    if (!user) return false;
    const allowedRoles = ["admin", "registrar", "hr_director"];
    return allowedRoles.includes(user.role);
  },

  canResetPassword: () => {
    const user = apiClient.getUser();
    return user?.role === "admin";
  },

  checkUsername: async (username) => {
    try {
      const response = await apiClient.get(
        `/api/auth/check-username/${username}`
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to check username",
        data: null,
      };
    }
  },

  checkEmail: async (email) => {
    try {
      const response = await apiClient.get(`/api/auth/check-email/${email}`);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to check email",
        data: null,
      };
    }
  },

  
  // getProfile: async () => {
  //   try {
  //     const response = await apiClient.get('/api/auth/profile');
  //     return response;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message || 'Failed to load profile',
  //       data: null
  //     };
  //   }
  // },

  // updateUserProfile: async (userId, data) => {
  //   try {
  //     const response = await apiClient.put(`/api/auth/users/${userId}/profile`, data);
  //     return response;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message || 'Failed to update profile',
  //       data: null
  //     };
  //   }
  // },

  changePassword: async (data) => {
    try {
      const response = await apiClient.put('/api/auth/change-password', data);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to change password',
        data: null
      };
    }
  }

};

export default authAPI