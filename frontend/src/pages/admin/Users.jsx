


// src/components/admin/Users.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import { authAPI } from "../../api/auth";
import toast from "react-hot-toast";
import apiClient from "../../api/client";
import departmentApi from "../../api/department";
import collegeAPI from "../../api/college";

// Custom hooks remain the same
const useUsersData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    department_id: "all",
  });

  const fetchUsers = useCallback(async (page = 0, rowsPerPage = 10, customFilters = null) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(customFilters || filters),
      };

      Object.keys(params).forEach(key => {
        if (params[key] === "all") {
          delete params[key];
        }
      });

      const response = await authAPI.getUsers(params);

      if (response.success) {
        let usersData = [];
        let total = 0;

        if (Array.isArray(response.data)) {
          usersData = response.data;
          total = response.data.length;
        } else if (response.data?.users) {
          usersData = response.data.users;
          total = response.data.pagination?.total || response.data.users.length;
        } else if (response.data) {
          usersData = response.data;
          total = response.data.length || 0;
        }

        setUsers(usersData);
        setPagination(prev => ({
          ...prev,
          page,
          rowsPerPage,
          total,
        }));
      } else {
        setError(response.message || "Failed to fetch users");
        toast.error(response.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      toast.error(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      role: "all",
      status: "all",
      department_id: "all",
    });
  };

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    updateFilters,
    resetFilters,
    setPagination,
  };
};

// Main User Management Component
const Users = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authAPI.getCurrentUser();

  const canManageUsers =
    currentUser &&
    ["admin", "registrar", "hr_director"].includes(currentUser.role);

  if (!canManageUsers) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-700">
            You don't have permission to access User Management.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
          <button
            onClick={() => navigate("/admin/users/create")}
            className="mt-4 md:mt-0 bg-[#069BFF] hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Add New User
          </button>
        </div>

        {/* Sub-navigation */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/users")}
              className={`px-4 py-2 rounded-md flex items-center ${location.pathname === "/admin/users" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              All Users
            </button>
            <button
              onClick={() => navigate("/admin/users/create")}
              className={`px-4 py-2 rounded-md flex items-center ${location.pathname.includes("/create") ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create User
            </button>
            <button
              onClick={() => navigate("/admin/users/reset-password")}
              className={`px-4 py-2 rounded-md flex items-center ${location.pathname.includes("/reset-password") ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Reset Password
            </button>
          </div>
        </div>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<AllUsers />} />
        <Route path="/create" element={<CreateUser />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:id" element={<ResetPassword />} />
        <Route path="/edit/:id" element={<EditUser />} />
        <Route path="/view/:id" element={<ViewUser />} />
        <Route path="/delete/:id" element={<DeleteUser />} />
      </Routes>
    </div>
  );
};

// All Users Component
const AllUsers = () => {
  const navigate = useNavigate();
  const {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    updateFilters,
    resetFilters,
    setPagination,
  } = useUsersData();

  const [departments, setDepartments] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  const stats = React.useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.is_active).length,
      instructors: users.filter((u) => u.role === "instructor").length,
      admins: users.filter((u) => u.role === "admin").length,
    };
  }, [users]);

  const ROLE_DISPLAY = {
    admin: { label: "Admin", color: "bg-red-100 text-red-800" },
    instructor: { label: "Instructor", color: "bg-green-100 text-green-800" },
    department_head: { label: "Department Head", color: "bg-blue-100 text-blue-800" },
    dean: { label: "Dean", color: "bg-yellow-100 text-yellow-800" },
    registrar: { label: "Registrar", color: "bg-purple-100 text-purple-800" },
    hr_director: { label: "HR Director", color: "bg-pink-100 text-pink-800" },
    vpaa: { label: "VP Academic", color: "bg-gray-100 text-gray-800" },
    vpaf: { label: "VP Admin & Finance", color: "bg-gray-100 text-gray-800" },
    finance: { label: "Finance", color: "bg-gray-100 text-gray-800" },
    cde_director: { label: "CDE Director", color: "bg-gray-100 text-gray-800" },
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAllDepartments();
      if (response.success) {
        let deptData = [];
        if (Array.isArray(response.data)) {
          deptData = response.data;
        } else if (response.data?.departments) {
          deptData = response.data.departments;
        } else if (response.data?.results) {
          deptData = response.data.results;
        }
        setDepartments(deptData);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page, pagination.rowsPerPage);
    fetchDepartments();
  }, []);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchUsers(newPage, pagination.rowsPerPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: newRowsPerPage,
      page: 0,
    }));
    fetchUsers(0, newRowsPerPage);
  };

  const handleSearch = () => {
    fetchUsers(0, pagination.rowsPerPage);
  };

  const handleClearFilters = () => {
    resetFilters();
    fetchUsers(0, pagination.rowsPerPage);
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/view/${userId}`);
  };

  const handleToggleStatus = async (user) => {
    const confirmMessage = user.is_active
      ? "Are you sure you want to deactivate this user? They will not be able to login."
      : "Are you sure you want to activate this user?";

    if (!window.confirm(confirmMessage)) return;

    try {
      let response;
      if (user.is_active) {
        response = await authAPI.deactivateUser(user.user_id || user.id);
      } else {
        response = await authAPI.activateUser(user.user_id || user.id);
      }

      if (response.success) {
        toast.success(
          `User ${user.is_active ? "deactivated" : "activated"} successfully`
        );
        fetchUsers(pagination.page, pagination.rowsPerPage);
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleResetPassword = (userId) => {
    navigate(`/admin/users/reset-password/${userId}`);
  };

  const handleDeleteUser = (user) => {
    setDeleteDialog({ open: true, user });
  };

  const confirmDeleteUser = async () => {
    if (!deleteDialog.user) return;
    
    try {
      const response = await apiClient.delete(`/api/auth/users/${deleteDialog.user.user_id || deleteDialog.user.id}`);
      
      if (response.success) {
        toast.success("User deleted successfully");
        fetchUsers(pagination.page, pagination.rowsPerPage);
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setDeleteDialog({ open: false, user: null });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const getUserInitials = (user) => {
    if (user.staff_profile) {
      return `${user.staff_profile.first_name?.[0] || ""}${
        user.staff_profile.last_name?.[0] || ""
      }`.toUpperCase();
    }
    return user.username?.[0]?.toUpperCase() || "U";
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return "N/A";
    const dept = departments.find(
      (d) => d.department_id == departmentId || d.id == departmentId
    );
    return dept?.department_name || dept?.name || `Dept ${departmentId}`;
  };

  const exportUsers = () => {
    const csvContent = [
      [
        "Username",
        "Email",
        "Role",
        "Status",
        "Department",
        "Last Login",
        "Created At",
      ],
      ...users.map((user) => [
        user.username,
        user.email,
        ROLE_DISPLAY[user.role]?.label || user.role,
        user.is_active ? "Active" : "Inactive",
        getDepartmentName(user.staff_profile?.department_id),
        formatDate(user.last_login),
        formatDate(user.created_at),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">  {pagination.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Instructors</p>
              <p className="text-2xl font-bold">{stats.instructors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold">{stats.admins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.role}
              onChange={(e) => updateFilters({ role: e.target.value })}
            >
              <option value="all">All Roles</option>
              {Object.keys(ROLE_DISPLAY).map((role) => (
                <option key={role} value={role}>
                  {ROLE_DISPLAY[role].label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* <div className="md:col-span-2">
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.department_id}
              onChange={(e) => updateFilters({ department_id: e.target.value })}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => {
                const deptId = dept.department_id || dept.id;
                const deptName = dept.department_name || dept.name;
                return (
                  <option key={deptId} value={deptId}>
                    {deptName}
                  </option>
                );
              })}
            </select>
          </div> */}

          <div className="md:col-span-3">
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Clear
              </button>
              <button
                onClick={exportUsers}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="w-full h-1 bg-blue-200">
            <div className="h-full bg-blue-600 animate-pulse"></div>
          </div>
        )}

        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({pagination.total})
          </h2>
          <button
            onClick={() => fetchUsers(pagination.page, pagination.rowsPerPage)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-2 text-gray-600">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-red-700">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="text-gray-500 mb-2">No users found</div>
                    <button
                      onClick={() => {
                        resetFilters();
                        fetchUsers(0, pagination.rowsPerPage);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.user_id || user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${user.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                          <span className="font-medium">{getUserInitials(user)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.staff_profile
                              ? `${user.staff_profile.first_name || ""} ${
                                  user.staff_profile.last_name || ""
                                }`
                              : user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.staff_profile?.phone && (
                        <div className="text-sm text-gray-500">
                          {user.staff_profile.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ROLE_DISPLAY[user.role]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {ROLE_DISPLAY[user.role]?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDepartmentName(user.staff_profile?.department_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user.user_id || user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditUser(user.user_id || user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={user.is_active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                          title={user.is_active ? "Deactivate" : "Activate"}
                        >
                          {user.is_active ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.user_id || user.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Reset Password"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">
              Showing <span className="font-medium">{users.length > 0 ? pagination.page * pagination.rowsPerPage + 1 : 0}</span> to{" "}
              <span className="font-medium">
                {Math.min((pagination.page + 1) * pagination.rowsPerPage, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span> users
            </span>
            <select
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={pagination.rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className={`px-3 py-1 rounded-md ${pagination.page === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={(pagination.page + 1) * pagination.rowsPerPage >= pagination.total}
              className={`px-3 py-1 rounded-md ${(pagination.page + 1) * pagination.rowsPerPage >= pagination.total ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Confirm Delete</h3>
              <div className="mt-2 px-2 py-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete user "{deleteDialog.user?.username}"?
                  This action cannot be undone.
                </p>
                {deleteDialog.user?.staff_profile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Name: {deleteDialog.user.staff_profile.first_name} {deleteDialog.user.staff_profile.last_name}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setDeleteDialog({ open: false, user: null })}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create User Component (truncated for brevity, but pattern follows)
const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "instructor",
    first_name: "",
    last_name: "",
    middle_name: "",
    employee_id: "",
    phone: "",
    department_id: "",
    academic_rank: "lecturer",
    employment_type: "full_time",
    is_active: true,
  });

  const currentUser = authAPI.getCurrentUser();

  const getAllowedRoles = () => {
    if (!currentUser) return ["instructor"];

    switch (currentUser.role) {
      case "admin":
        return [
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
        ];
      case "registrar":
      case "hr_director":
        return ["department_head", "instructor"];
      default:
        return ["instructor"];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptResponse = await departmentApi.getAllDepartments();
        if (deptResponse.success) {
          let deptData = [];
          if (Array.isArray(deptResponse.data)) {
            deptData = deptResponse.data;
          } else if (deptResponse.data?.departments) {
            deptData = deptResponse.data.departments;
          }
          setDepartments(deptData);
        }

        const collegeResponse = await collegeAPI.getAllColleges();
        if (collegeResponse.success) {
          let collegeData = [];
          if (Array.isArray(collegeResponse.data)) {
            collegeData = collegeResponse.data;
          } else if (collegeResponse.data?.colleges) {
            collegeData = collegeResponse.data.colleges;
          }
          setColleges(collegeData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const validateStep = () => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.username.trim()) newErrors.username = "Username is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        break;

      case 1:
        if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
        if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
        break;

      case 2:
        if (["instructor", "department_head", "dean"].includes(formData.role)) {
          if (!formData.department_id) newErrors.department_id = "Department is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setLoading(true);

      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        is_active: formData.is_active,
      };

      if (["instructor", "department_head", "dean"].includes(formData.role)) {
        userData.staff_profile = {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          middle_name: formData.middle_name?.trim() || null,
          employee_id: formData.employee_id?.trim() || null,
          phone: formData.phone?.trim() || null,
          department_id: formData.department_id || null,
          academic_rank: formData.academic_rank,
          employment_type: formData.employment_type,
        };
      }

      const response = await authAPI.createUser(userData);

      if (response.success) {
        toast.success("User created successfully!");
        
        if (window.confirm("User created successfully! Create another user?")) {
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "instructor",
            first_name: "",
            last_name: "",
            middle_name: "",
            employee_id: "",
            phone: "",
            department_id: "",
            academic_rank: "lecturer",
            employment_type: "full_time",
            is_active: true,
          });
          setStep(0);
          setErrors({});
        } else {
          navigate("/admin/users");
        }
      } else {
        toast.error(response.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    "Account Information",
    "Personal Information",
    "Academic Information",
    "Review & Create",
  ];

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.username ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.role ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              >
                {getAllowedRoles().map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.first_name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.last_name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["instructor", "department_head", "dean"].includes(formData.role) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.department_id ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    disabled={loading}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => {
                      const deptId = dept.department_id || dept.id;
                      const deptName = dept.department_name || dept.name;
                      return (
                        <option key={deptId} value={deptId}>
                          {deptName}
                        </option>
                      );
                    })}
                  </select>
                  {errors.department_id && <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Rank</label>
                  <select
                    name="academic_rank"
                    value={formData.academic_rank}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="graduate_assistant">Graduate Assistant</option>
                    <option value="assistant_lecturer">Assistant Lecturer</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="assistant_professor">Assistant Professor</option>
                    <option value="associate_professor">Associate Professor</option>
                    <option value="professor">Professor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active Account
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Username</p>
                  <p className="font-medium">{formData.username}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Role</p>
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {formData.role.charAt(0).toUpperCase() + formData.role.slice(1).replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Status</p>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {formData.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-green-700">First Name</p>
                  <p className="font-medium">{formData.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Middle Name</p>
                  <p className="font-medium">{formData.middle_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Last Name</p>
                  <p className="font-medium">{formData.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Employee ID</p>
                  <p className="font-medium">{formData.employee_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Phone</p>
                  <p className="font-medium">{formData.phone || "N/A"}</p>
                </div>
              </div>
            </div>

            {["instructor", "department_head", "dean"].includes(formData.role) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-yellow-700">Department</p>
                    <p className="font-medium">
                      {departments.find(d => (d.department_id || d.id) == formData.department_id)
                        ?.department_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-700">Academic Rank</p>
                    <p className="font-medium">{formData.academic_rank.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-700">Employment Type</p>
                    <p className="font-medium">{formData.employment_type.replace(/_/g, " ")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New User</h2>
        <p className="text-gray-600 mb-6">Fill in the details to create a new user account</p>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((label, index) => (
              <div key={label} className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${index <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${index <= step ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 h-0.5 w-16 ${index < step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <hr className="mb-6" />

        {getStepContent(step)}

        <hr className="my-6" />

        <div className="flex justify-between">
          <button
            onClick={() => navigate("/admin/users")}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Cancel
          </button>

          <div className="flex space-x-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Create User
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reset Password Component (pattern follows similar conversion)
const ResetPassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(id || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authAPI.getUsers({ limit: 100 });
        if (response.success) {
          let usersData = [];
          if (Array.isArray(response.data)) {
            usersData = response.data;
          } else if (response.data?.users) {
            usersData = response.data.users;
          }
          setUsers(usersData);

          if (id) {
            const user = usersData.find(u => u.user_id == id || u.id == id);
            if (user) {
              setSelectedUserId(user.user_id || user.id);
              setUserDetails(user);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      }
    };

    fetchUsers();
  }, [id]);

  const handleUserSelect = async (userId) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.user_id == userId || u.id == userId);
    setUserDetails(user);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedUserId) newErrors.user = "Please select a user";
    if (!newPassword) newErrors.newPassword = "New password is required";
    else if (newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm password";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await authAPI.resetPassword(selectedUserId, newPassword);

      if (response.success) {
        toast.success("Password reset successfully!");
        
        const message = `Password has been reset successfully!\n\nNew Password: ${newPassword}\n\nPlease provide this password to the user and instruct them to change it immediately.`;
        
        if (window.confirm(message + "\n\nCopy password to clipboard?")) {
          navigator.clipboard.writeText(newPassword);
          toast.success("Password copied to clipboard!");
        }

        setNewPassword("");
        setConfirmPassword("");
        if (!id) {
          setSelectedUserId("");
          setUserDetails(null);
        }
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600 mb-6">Reset password for a user account</p>

        <hr className="mb-8" />

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select User *</label>
            <select
              value={selectedUserId}
              onChange={(e) => handleUserSelect(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${errors.user ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              disabled={loading || !!id}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.user_id || user.id} value={user.user_id || user.id}>
                  {user.staff_profile
                    ? `${user.staff_profile.first_name} ${user.staff_profile.last_name}`
                    : user.username} - {user.email}
                </option>
              ))}
            </select>
            {errors.user && <p className="mt-1 text-sm text-red-600">{errors.user}</p>}
          </div>

          {userDetails && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {userDetails.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="ml-4">
                  <p className="font-medium">
                    {userDetails.staff_profile
                      ? `${userDetails.staff_profile.first_name} ${userDetails.staff_profile.last_name}`
                      : userDetails.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    {userDetails.email} • {userDetails.role} • 
                    Status: {userDetails.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              onClick={generateRandomPassword}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Generate Random Password
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          <hr className="my-4" />

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => navigate("/admin/users")}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleResetPassword}
              disabled={loading || !selectedUserId}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Resetting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Reset Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit User Component
const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authAPI.getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    is_active: true,
    first_name: "",
    last_name: "",
    middle_name: "",
    employee_id: "",
    department_id: "",
    phone: "",
    academic_rank: "lecturer",
    employment_type: "full_time",
    hire_date: "",
    address: "",
    date_of_birth: "",
    gender: "",
  });

  const getAllowedRoles = () => {
    if (!currentUser) return ["instructor"];

    switch (currentUser.role) {
      case "admin":
        return [
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
        ];
      case "registrar":
      case "hr_director":
        return ["department_head", "instructor"];
      default:
        return ["instructor"];
    }
  };

  const canEditRole = () => {
    if (!currentUser) return false;
    return ["admin", "hr_director", "registrar"].includes(currentUser.role);
  };

  const canEditUser = () => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    if (formData.role === "admin") return false;
    return ["hr_director", "registrar"].includes(currentUser.role);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const userResponse = await authAPI.getUser(id);

        if (!userResponse.success || !userResponse.data) {
          toast.error(userResponse.message || "Failed to load user");
          navigate("/admin/users");
          return;
        }

        const user = userResponse.data;
        console.log("User data loaded:", user);

        setFormData({
          username: user.username || "",
          email: user.email || "",
          role: user.role || "",
          is_active: user.is_active !== false,
          first_name: user.staff_profile?.first_name || "",
          last_name: user.staff_profile?.last_name || "",
          middle_name: user.staff_profile?.middle_name || "",
          employee_id: user.staff_profile?.employee_id || "",
          department_id: user.staff_profile?.department_id || "",
          phone: user.staff_profile?.phone || "",
          academic_rank: user.staff_profile?.academic_rank || "lecturer",
          employment_type: user.staff_profile?.employment_type || "full_time",
          hire_date: user.staff_profile?.hire_date || "",
          address: user.staff_profile?.address || "",
          date_of_birth: user.staff_profile?.date_of_birth || "",
          gender: user.staff_profile?.gender || "",
        });

        try {
          const deptResponse = await departmentApi.getAllDepartments();
          if (deptResponse.success) {
            let deptArray = [];

            if (Array.isArray(deptResponse.data)) {
              deptArray = deptResponse.data;
            } else if (deptResponse.data?.departments) {
              deptArray = deptResponse.data.departments;
            } else if (deptResponse.data?.results) {
              deptArray = deptResponse.data.results;
            }

            setDepartments(deptArray);
          }
        } catch (deptError) {
          console.error("Error fetching departments:", deptError);
          setDepartments([]);
        }

        try {
          const collegeResponse = await collegeAPI.getAllColleges();
          if (collegeResponse.success) {
            setColleges(collegeResponse.data || []);
          }
        } catch (collegeError) {
          console.error("Error fetching colleges:", collegeError);
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        toast.error("Failed to load user data");
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (["instructor", "department_head", "dean"].includes(formData.role)) {
      if (!formData.employee_id?.trim()) {
        newErrors.employee_id = "Employee ID is required";
      }
      if (!formData.department_id) {
        newErrors.department_id = "Department is required";
      }
      if (!formData.academic_rank) {
        newErrors.academic_rank = "Academic rank is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!canEditUser()) {
      toast.error("You don't have permission to edit this user");
      return;
    }

    try {
      setSaving(true);

      const userData = {
        email: formData.email.trim(),
        role: formData.role,
        is_active: formData.is_active,
      };

      const staffProfileData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        middle_name: formData.middle_name?.trim() || null,
        employee_id: formData.employee_id?.trim() || null,
        phone: formData.phone?.trim() || null,
        department_id: formData.department_id || null,
        academic_rank: formData.academic_rank,
        employment_type: formData.employment_type,
        hire_date: formData.hire_date || null,
        address: formData.address?.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
      };

      if (["instructor", "department_head", "dean"].includes(formData.role)) {
        userData.staff_profile = staffProfileData;
      }

      console.log("Submitting update data:", userData);

      const response = await authAPI.updateUser(id, userData);

      if (response.success) {
        toast.success("User updated successfully");
        navigate("/admin/users");
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-600">Loading user data...</p>
      </div>
    );
  }

  if (!canEditUser()) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-700">
            You don't have permission to edit this user. Only Admin can edit
            this user's information.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/users")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
            Edit User: {formData.username}
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/admin/users")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <button
              onClick={() => navigate(`/admin/users/reset-password/${id}`)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Reset Password
            </button>
          </div>
        </div>

        <hr className="mb-6" />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">Username cannot be changed</p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={saving}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving || !canEditRole()}
              >
                {getAllowedRoles().map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              {!canEditRole() && (
                <p className="mt-1 text-sm text-gray-500">
                  Only Admin, HR Director, and Registrar can change roles
                </p>
              )}
            </div>

            {/* Status Field */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={saving}
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active Account
              </label>
            </div>

            <div className="md:col-span-2">
              <hr className="my-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.first_name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={saving}
              />
              {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.last_name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={saving}
              />
              {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.employee_id ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={saving}
              />
              {errors.employee_id && <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              />
            </div>

            {/* Additional Fields for Academic Roles */}
            {["instructor", "department_head", "dean"].includes(formData.role) && (
              <>
                <div className="md:col-span-2">
                  <hr className="my-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.department_id ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    disabled={saving}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => {
                      const deptId = dept.department_id || dept.id;
                      const deptName = dept.department_name || dept.name;
                      return (
                        <option key={deptId} value={deptId}>
                          {deptName}
                        </option>
                      );
                    })}
                  </select>
                  {errors.department_id && <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>}
                </div>

                {/* Academic Rank */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Rank *</label>
                  <select
                    name="academic_rank"
                    value={formData.academic_rank}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.academic_rank ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    disabled={saving}
                  >
                    <option value="graduate_assistant">Graduate Assistant</option>
                    <option value="assistant_lecturer">Assistant Lecturer</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="assistant_professor">Assistant Professor</option>
                    <option value="associate_professor">Associate Professor</option>
                    <option value="professor">Professor</option>
                  </select>
                  {errors.academic_rank && <p className="mt-1 text-sm text-red-600">{errors.academic_rank}</p>}
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={saving}
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                {/* Hire Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={saving}
                  />
                </div>
              </>
            )}

            {/* Additional Personal Information */}
            <div className="md:col-span-2">
              <hr className="my-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2">
              <hr className="my-6" />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/users")}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// View User Component
const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userResponse = await authAPI.getUser(id);
        
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        } else {
          setFetchError(userResponse.message || "User not found");
          toast.error(userResponse.message || "User not found");
        }

        try {
          const deptResponse = await departmentApi.getAllDepartments();
          if (deptResponse.success) {
            setDepartments(deptResponse.data || []);
          }
        } catch (deptError) {
          console.log("Could not load departments");
        }

      } catch (err) {
        console.error("Error loading user:", err);
        setFetchError(err.message || "Failed to load user");
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      navigate("/admin/users");
    }
  }, [id, navigate]);

  const getDepartmentName = (departmentId) => {
    if (!departmentId || !departments.length) return "N/A";
    const dept = departments.find(d => 
      d.department_id == departmentId || d.id == departmentId
    );
    return dept?.department_name || dept?.name || `Dept ${departmentId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const ROLE_DISPLAY = {
    admin: { label: "Admin", color: "bg-red-100 text-red-800" },
    instructor: { label: "Instructor", color: "bg-green-100 text-green-800" },
    department_head: { label: "Department Head", color: "bg-blue-100 text-blue-800" },
    dean: { label: "Dean", color: "bg-yellow-100 text-yellow-800" },
    registrar: { label: "Registrar", color: "bg-purple-100 text-purple-800" },
    hr_director: { label: "HR Director", color: "bg-pink-100 text-pink-800" },
    vpaa: { label: "VP Academic", color: "bg-gray-100 text-gray-800" },
    vpaf: { label: "VP Admin & Finance", color: "bg-gray-100 text-gray-800" },
    finance: { label: "Finance", color: "bg-gray-100 text-gray-800" },
    cde_director: { label: "CDE Director", color: "bg-gray-100 text-gray-800" },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-600">Loading user details...</p>
      </div>
    );
  }

  if (fetchError || !user) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading User</h3>
          <p className="text-red-700">{fetchError || "User not found"}</p>
        </div>
        <button
          onClick={() => navigate("/admin/users")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Details</h2>
            <p className="text-gray-600">User ID: {id}</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={() => navigate("/admin/users")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <button
              onClick={() => navigate(`/admin/users/edit/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit User
            </button>
            <button
              onClick={() => navigate(`/admin/users/reset-password/${id}`)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Reset Password
            </button>
          </div>
        </div>

        <hr className="mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Account Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-blue-700">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Role</p>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ROLE_DISPLAY[user.role]?.color || 'bg-gray-100 text-gray-800'}`}>
                  {ROLE_DISPLAY[user.role]?.label || user.role}
                </span>
              </div>
              <div>
                <p className="text-sm text-blue-700">Status</p>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <p className="text-sm text-blue-700">Created</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Last Login</p>
                <p className="font-medium">{formatDate(user.last_login) || "Never"}</p>
              </div>
            </div>
          </div>

          {/* Staff Profile Card */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-900">Staff Profile</h3>
            </div>
            {user.staff_profile ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-green-700">Full Name</p>
                  <p className="font-medium">
                    {user.staff_profile.first_name} {user.staff_profile.middle_name} {user.staff_profile.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Employee ID</p>
                  <p className="font-medium">{user.staff_profile.employee_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Phone</p>
                  <p className="font-medium">{user.staff_profile.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Department</p>
                  <p className="font-medium">{getDepartmentName(user.staff_profile.department_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Academic Rank</p>
                  <p className="font-medium">{user.staff_profile.academic_rank?.replace(/_/g, " ") || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Employment Type</p>
                  <p className="font-medium">{user.staff_profile.employment_type?.replace(/_/g, " ") || "N/A"}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-500">No staff profile associated with this user</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex space-x-3">
          <button
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Users List
          </button>
          <button
            onClick={() => navigate(`/admin/users/edit/${id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete User Component
const DeleteUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getUser(id);
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          toast.error("Failed to load user");
          navigate("/admin/users");
        }
      } catch (error) {
        toast.error("Failed to load user");
        navigate("/admin/users");
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.delete(`/api/auth/users/${id}`);
      
      if (response.success) {
        toast.success("User deleted successfully");
        navigate("/admin/users");
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-600">Loading user...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-900">Delete User</h2>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-yellow-800 mb-1">Warning: This action cannot be undone!</p>
          <p className="text-yellow-700 text-sm">
            All user data, including staff profile and workload information, will be permanently deleted.
          </p>
        </div>

        <hr className="mb-6" />

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            {user.staff_profile && (
              <>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">
                    {user.staff_profile.first_name} {user.staff_profile.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{user.staff_profile.employee_id || "N/A"}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <hr className="my-6" />

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate("/admin/users")}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete User Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Users;