// src/api/staff.js
import apiClient from "./client";

// ================ STAFF API (COMPLETE FRONTEND CLIENT) ================
export const staffAPI = {
  // ===== PUBLIC STAFF ROUTES (for instructors to view their own data) =====

  // Get my staff profile
  getMyProfile: () => apiClient.get("/api/staff/me"),

  // Check if I have a staff profile
  checkMyStaffProfile: () => apiClient.get("/api/staff/me/profile-check"),

  // Update my profile
  updateMyProfile: (data) => apiClient.put("/api/staff/me", data),

  // Get my workload summary
  getMyWorkloadSummary: (params) =>
    apiClient.get("/api/staff/me/workload-summary", { params }),

  // ===== ADMIN/MANAGEMENT ROUTES =====

  // Get all staff with filters
  getAllStaff: (params) => apiClient.get("/api/staff", { params }),

  // Search staff
  searchStaff: (params) => apiClient.get("/api/staff/search", { params }),

  // Get staff statistics
  getStaffStatistics: (params) =>
    apiClient.get("/api/staff/statistics", { params }),

  // Create new staff (admin, registrar, HR only)
  createStaff: (data) => apiClient.post("/api/staff", data),

  // ===== SPECIFIC STAFF ROUTES =====

  // Get staff by ID
  getStaffById: (id) => apiClient.get(`/api/staff/${id}`),

  // Update staff
  updateStaff: (id, data) => apiClient.put(`/api/staff/${id}`, data),

  // Delete staff (soft delete)
  deleteStaff: (id) => apiClient.delete(`/api/staff/${id}`),

  // Get staff by user ID
  getStaffByUserId: (userId) => apiClient.get(`/api/staff/user/${userId}`),

  // Get staff by department
  getStaffByDepartment: (departmentId, params) =>
    apiClient.get(`/api/staff/department/${departmentId}`, { params }),

  // Get staff workload summary
  getStaffWorkloadSummary: (id, params) =>
    apiClient.get(`/api/staff/${id}/workload-summary`, { params }),

  // Update staff rank
  updateStaffRank: (id, data) => apiClient.put(`/api/staff/${id}/rank`, data),

  // Assign staff to department
  assignToDepartment: (id, data) =>
    apiClient.put(`/api/staff/${id}/assign-department`, data),

  // Get staff by rank
  getStaffByRank: (rank, params) =>
    apiClient.get(`/api/staff/rank/${rank}`, { params }),

  // ===== HIERARCHY-BASED ROUTES (for role-based creation) =====

  // Create staff with hierarchy validation
  createStaffWithHierarchy: (data) =>
    apiClient.post("/api/staff/with-hierarchy", data),

  // Get staff by creator
  getStaffByCreator: (creatorId, params) =>
    apiClient.get(`/api/staff/creator/${creatorId}`, { params }),

  // Get role-based statistics
  getRoleBasedStatistics: (role) =>
    apiClient.get(`/api/staff/role-statistics/${role}`),

  // Get staff rank history
  getStaffRankHistory: (staffId) =>
    apiClient.get(`/api/staff/${staffId}/rank-history`),
};

// ================ STAFF UTILITY FUNCTIONS (For React Components) ================
export const staffUtils = {
  // Format full name
  formatFullName: (staff) => {
    if (!staff) return "";
    if (staff.middle_name) {
      return `${staff.first_name} ${staff.middle_name} ${staff.last_name}`;
    }
    return `${staff.first_name} ${staff.last_name}`;
  },

  // Format academic rank for display
  formatAcademicRank: (rank) => {
    const rankMap = {
      graduate_assistant: "Graduate Assistant",
      assistant_lecturer: "Assistant Lecturer",
      lecturer: "Lecturer",
      assistant_professor: "Assistant Professor",
      associate_professor: "Associate Professor",
      professor: "Professor",
    };
    return rankMap[rank] || rank;
  },

  // Format employment type for display
  formatEmploymentType: (type) => {
    const typeMap = {
      full_time: "Full Time",
      part_time: "Part Time",
      contract: "Contract",
    };
    return typeMap[type] || type;
  },

  // Get staff status color
  getStatusColor: (isActive) => {
    return isActive ? "success" : "danger";
  },

  // Calculate years of service
  calculateYearsOfService: (hireDate) => {
    if (!hireDate) return "N/A";
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    return months < 0 ? years - 1 : years;
  },

  // Validate staff data before submission
  validateStaffData: (staffData, isUpdate = false) => {
    const errors = {};

    if (!isUpdate) {
      if (!staffData.username?.trim()) {
        errors.username = "Username is required";
      }

      if (!staffData.email?.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(staffData.email)) {
        errors.email = "Email is invalid";
      }

      if (!staffData.password?.trim()) {
        errors.password = "Password is required";
      } else if (staffData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }

    if (!staffData.first_name?.trim()) {
      errors.first_name = "First name is required";
    }

    if (!staffData.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!staffData.employee_id?.trim()) {
      errors.employee_id = "Employee ID is required";
    }

    if (!staffData.department_id) {
      errors.department_id = "Department is required";
    }

    if (staffData.phone && !/^\+?[\d\s\-()]+$/.test(staffData.phone)) {
      errors.phone = "Phone number is invalid";
    }

    if (staffData.date_of_birth) {
      const dob = new Date(staffData.date_of_birth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();

      if (dob > now) {
        errors.date_of_birth = "Date of birth cannot be in the future";
      } else if (age < 18) {
        errors.date_of_birth = "Staff must be at least 18 years old";
      }
    }

    return errors;
  },

  // Prepare staff form data for submission
  prepareStaffFormData: (formData) => {
    const data = {
      username: formData.username?.trim(),
      email: formData.email?.trim(),
      password: formData.password?.trim(),
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      middle_name: formData.middle_name?.trim() || null,
      employee_id: formData.employee_id?.trim(),
      department_id: parseInt(formData.department_id),
      academic_rank: formData.academic_rank || "lecturer",
      employment_type: formData.employment_type || "full_time",
      role: formData.role || "instructor",
      phone: formData.phone?.trim() || null,
      address: formData.address?.trim() || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
    };

    // Only include hire_date if provided
    if (formData.hire_date) {
      data.hire_date = formData.hire_date;
    }

    return data;
  },

  // Prepare staff update data (excludes sensitive fields)
  prepareStaffUpdateData: (formData) => {
    const data = {
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      middle_name: formData.middle_name?.trim() || null,
      employee_id: formData.employee_id?.trim(),
      department_id: formData.department_id
        ? parseInt(formData.department_id)
        : undefined,
      academic_rank: formData.academic_rank,
      employment_type: formData.employment_type,
      phone: formData.phone?.trim() || null,
      address: formData.address?.trim() || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
    };

    // Only include hire_date if changed
    if (formData.hire_date) {
      data.hire_date = formData.hire_date;
    }

    // Remove undefined values
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key]
    );

    return data;
  },

  // Get allowed roles for creation based on current user role
  getAllowedRolesForCreation: (currentUserRole) => {
    const roleHierarchy = {
      admin: [
        "admin",
        "vpaa",
        "hr_director",
        "finance",
        "cde_director",
        "vpaf",
        "dean",
        "registrar",
        "department_head",
        "instructor",
      ],
      vpaa: ["dean", "registrar", "vpaf"],
      dean: ["department_head"],
      hr_director: ["instructor"],
      department_head: [],
      instructor: [],
      registrar: [],
      cde_director: [],
      vpaf: [],
      finance: [],
    };

    return roleHierarchy[currentUserRole] || [];
  },

  // Get valid academic ranks
  getValidAcademicRanks: () => [
    { value: "graduate_assistant", label: "Graduate Assistant" },
    { value: "assistant_lecturer", label: "Assistant Lecturer" },
    { value: "lecturer", label: "Lecturer" },
    { value: "assistant_professor", label: "Assistant Professor" },
    { value: "associate_professor", label: "Associate Professor" },
    { value: "professor", label: "Professor" },
  ],

  // Get employment type options
  getEmploymentTypes: () => [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
  ],

  // Get gender options
  getGenderOptions: () => [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ],

  // Check if user can create staff
  canCreateStaff: (currentUserRole) => {
    const allowedRoles = ["admin", "registrar", "hr_director"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can update staff
  canUpdateStaff: (currentUserRole) => {
    const allowedRoles = ["admin", "registrar", "hr_director"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can delete staff
  canDeleteStaff: (currentUserRole) => {
    const allowedRoles = ["admin", "hr_director"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can view staff statistics
  canViewStatistics: (currentUserRole) => {
    const allowedRoles = ["admin", "hr_director", "dean"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can assign departments
  canAssignDepartment: (currentUserRole) => {
    const allowedRoles = ["admin", "hr_director", "dean"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can update staff rank
  canUpdateRank: (currentUserRole) => {
    const allowedRoles = ["admin", "hr_director"];
    return allowedRoles.includes(currentUserRole);
  },

  // Generate CSV data for export
  generateStaffCSVData: (staffList) => {
    const headers = [
      "Employee ID",
      "Full Name",
      "Email",
      "Role",
      "Department",
      "College",
      "Academic Rank",
      "Employment Type",
      "Gender",
      "Phone",
      "Hire Date",
      "Years of Service",
      "Status",
    ];

    const rows = staffList.map((staff) => [
      staff.employee_id,
      staffUtils.formatFullName(staff),
      staff.email,
      staff.role,
      staff.department_name,
      staff.college_name,
      staffUtils.formatAcademicRank(staff.academic_rank),
      staffUtils.formatEmploymentType(staff.employment_type),
      staff.gender?.charAt(0).toUpperCase() + staff.gender?.slice(1) || "N/A",
      staff.phone || "N/A",
      staff.hire_date ? new Date(staff.hire_date).toLocaleDateString() : "N/A",
      staffUtils.calculateYearsOfService(staff.hire_date),
      staff.is_active ? "Active" : "Inactive",
    ]);

    return [headers, ...rows];
  },

  // Filter staff by various criteria
  filterStaff: (staffList, filters) => {
    return staffList.filter((staff) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          staff.first_name,
          staff.last_name,
          staff.employee_id,
          staff.email,
          staff.username,
          staff.department_name,
          staff.college_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableFields.includes(searchTerm)) {
          return false;
        }
      }

      // Department filter
      if (
        filters.department_id &&
        staff.department_id !== parseInt(filters.department_id)
      ) {
        return false;
      }

      // College filter
      if (
        filters.college_id &&
        staff.college_id !== parseInt(filters.college_id)
      ) {
        return false;
      }

      // Academic rank filter
      if (
        filters.academic_rank &&
        staff.academic_rank !== filters.academic_rank
      ) {
        return false;
      }

      // Employment type filter
      if (
        filters.employment_type &&
        staff.employment_type !== filters.employment_type
      ) {
        return false;
      }

      // Status filter
      if (
        filters.is_active !== undefined &&
        staff.is_active !== (filters.is_active === "true")
      ) {
        return false;
      }

      return true;
    });
  },

  // Sort staff by various fields
  sortStaff: (staffList, sortBy, sortDirection = "asc") => {
    return [...staffList].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = staffUtils.formatFullName(a).toLowerCase();
          bValue = staffUtils.formatFullName(b).toLowerCase();
          break;
        case "employee_id":
          aValue = a.employee_id;
          bValue = b.employee_id;
          break;
        case "department":
          aValue = a.department_name;
          bValue = b.department_name;
          break;
        case "college":
          aValue = a.college_name;
          bValue = b.college_name;
          break;
        case "rank":
          aValue = a.academic_rank;
          bValue = b.academic_rank;
          break;
        case "hire_date":
          aValue = new Date(a.hire_date || 0);
          bValue = new Date(b.hire_date || 0);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  },

  // Calculate pagination metadata
  calculatePagination: (totalItems, currentPage, itemsPerPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      totalPages,
      startItem,
      endItem,
      totalItems,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  },
};

// ================ STAFF REACT HOOKS (Custom Hooks) ================
import { useState, useEffect, useCallback } from "react";

// Hook for fetching staff data with pagination and filters
export const useStaffData = (initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState(initialFilters);

  const fetchStaff = useCallback(
    async (page = 1, customFilters = null) => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          limit: pagination.limit,
          ...(customFilters || filters),
        };

        const response = await staffAPI.getAllStaff(params);
        setData(response.data?.staff || []);
        setPagination(
          response.data?.pagination || {
            page,
            limit: pagination.limit,
            total: 0,
            pages: 0,
          }
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch staff data");
        console.error("Fetch staff error:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const changePage = useCallback(
    (page) => {
      fetchStaff(page);
    },
    [fetchStaff]
  );

  useEffect(() => {
    fetchStaff(1);
  }, [fetchStaff]);

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    fetchStaff,
    updateFilters,
    changePage,
    refetch: () => fetchStaff(pagination.page),
  };
};

// Hook for staff search
export const useStaffSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchStaff = useCallback(async (searchTerm, limit = 50) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await staffAPI.searchStaff({ q: searchTerm, limit });
      setResults(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
      console.error("Staff search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    searchStaff,
    clearResults: () => setResults([]),
  };
};

// Hook for staff statistics
export const useStaffStatistics = (params = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(
    async (customParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await staffAPI.getStaffStatistics({
          ...params,
          ...customParams,
        });
        setStats(response.data || {});
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch statistics");
        console.error("Fetch staff statistics error:", err);
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook for my staff profile
export const useMyStaffProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First check if profile exists
      const checkResponse = await staffAPI.checkMyStaffProfile();
      setHasProfile(checkResponse.data?.has_staff_profile || false);

      if (checkResponse.data?.has_staff_profile) {
        const profileResponse = await staffAPI.getMyProfile();
        setProfile(profileResponse.data || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile");
      console.error("Fetch my profile error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await staffAPI.updateMyProfile(data);
      setProfile(response.data || null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error("Update profile error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    hasProfile,
    fetchProfile,
    updateProfile,
  };
};

export default staffAPI;
