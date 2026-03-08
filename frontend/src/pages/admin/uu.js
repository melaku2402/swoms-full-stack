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

  // CALCULATE STATS LOCALLY - SIMPLE AND RELIABLE
  const stats = React.useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.is_active).length,
      instructors: users.filter((u) => u.role === "instructor").length,
      admins: users.filter((u) => u.role === "admin").length,
    };
  }, [users]);

  // Role display mapping
  const ROLE_DISPLAY = {
    admin: { label: "Admin", color: "error", icon: <SecurityIcon /> },
    instructor: { label: "Instructor", color: "success", icon: <SchoolIcon /> },
    department_head: {
      label: "Department Head",
      color: "info",
      icon: <WorkIcon />,
    },
    dean: { label: "Dean", color: "warning", icon: <PersonIcon /> },
    registrar: { label: "Registrar", color: "primary", icon: <PersonIcon /> },
    hr_director: {
      label: "HR Director",
      color: "secondary",
      icon: <PersonIcon />,
    },
    vpaa: { label: "VP Academic", color: "default", icon: <PersonIcon /> },
    vpaf: {
      label: "VP Admin & Finance",
      color: "default",
      icon: <PersonIcon />,
    },
    finance: { label: "Finance", color: "default", icon: <PersonIcon /> },
    cde_director: {
      label: "CDE Director",
      color: "default",
      icon: <PersonIcon />,
    },
  };

  // Fetch departments
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

  // REMOVE ALL THESE FUNCTIONS - THEY'RE CAUSING THE ERROR
  // const fetchStats = async () => {
  //   try {
  //     const response = await authAPI.getUserStats();
  //     if (response.success && response.data) {
  //       setStats(response.data);
  //     } else {
  //       // Fallback: calculate from current users
  //       calculateLocalStats();
  //     }
  //   } catch (error) {
  //     console.error("Error fetching stats:", error);
  //     calculateLocalStats();
  //   }
  // };

  // const calculateLocalStats = () => {
  //   setStats({
  //     total: users.length,
  //     active: users.filter((u) => u.is_active).length,
  //     instructors: users.filter((u) => u.role === "instructor").length,
  //     admins: users.filter((u) => u.role === "admin").length,
  //   });
  // };

  // REMOVE THESE useEffect HOOKS
  // useEffect(() => {
  //   calculateLocalStats();
  // }, [users]);

  // useEffect(() => {
  //   if (users.length > 0) {
  //     fetchStats();
  //   }
  // }, [users.length]);

  useEffect(() => {
    fetchUsers(pagination.page, pagination.rowsPerPage);
    fetchDepartments();
  }, []);

  const handlePageChange = (event, newPage) => {
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
      ? "Are you sure you want to deactivate this user?"
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
    <Box>
      {/* Stats Cards - Use the stats calculated by useMemo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Active Users
                  </Typography>
                  <Typography variant="h4">{stats.active}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Instructors
                  </Typography>
                  <Typography variant="h4">{stats.instructors}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "error.main" }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Admins
                  </Typography>
                  <Typography variant="h4">{stats.admins}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search users"
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Name, username, email..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={(e) => updateFilters({ role: e.target.value })}
              >
                <MenuItem value="all">All Roles</MenuItem>
                {Object.keys(ROLE_DISPLAY).map((role) => (
                  <MenuItem key={role} value={role}>
                    {ROLE_DISPLAY[role].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => updateFilters({ status: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department_id}
                label="Department"
                onChange={(e) =>
                  updateFilters({ department_id: e.target.value })
                }
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map((dept) => {
                  const deptId = dept.department_id || dept.id;
                  const deptName = dept.department_name || dept.name;
                  return (
                    <MenuItem key={deptId} value={deptId}>
                      {deptName}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                sx={{ flex: 1 }}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
              <Button
                variant="outlined"
                onClick={exportUsers}
                startIcon={<DownloadIcon />}
              >
                Export
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {loading && <LinearProgress />}

        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
            Users ({pagination.total})
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => fetchUsers(pagination.page, pagination.rowsPerPage)}
          >
            Refresh
          </Button>
        </Toolbar>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 1 }}>Loading users...</Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No users found
                    </Typography>
                    <Button
                      sx={{ mt: 1 }}
                      onClick={() => {
                        resetFilters();
                        fetchUsers(0, pagination.rowsPerPage);
                      }}
                    >
                      Clear filters
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.user_id || user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: user.is_active
                              ? "primary.main"
                              : "grey.500",
                          }}
                        >
                          {getUserInitials(user)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {user.staff_profile
                              ? `${user.staff_profile.first_name || ""} ${
                                  user.staff_profile.last_name || ""
                                }`
                              : user.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      {user.staff_profile?.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {user.staff_profile.phone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ROLE_DISPLAY[user.role]?.label || user.role}
                        color={ROLE_DISPLAY[user.role]?.color || "default"}
                        size="small"
                        icon={ROLE_DISPLAY[user.role]?.icon}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getDepartmentName(user.staff_profile?.department_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? "Active" : "Inactive"}
                        color={user.is_active ? "success" : "error"}
                        size="small"
                        icon={
                          user.is_active ? <ActiveIcon /> : <InactiveIcon />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.last_login)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleViewUser(user.user_id || user.id)
                            }
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleEditUser(user.user_id || user.id)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={user.is_active ? "Deactivate" : "Activate"}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(user)}
                            color={user.is_active ? "error" : "success"}
                          >
                            {user.is_active ? <InactiveIcon /> : <ActiveIcon />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Reset Password">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleResetPassword(user.user_id || user.id)
                            }
                            color="warning"
                          >
                            <ResetIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
    </Box>
  );
};
// src/controllers/AuthController.js
import { query } from "../config/database.js"; // ← ADD THIS IMPORT
import UserModel from "../models/UserModel.js";
import StaffModel from "../models/StaffModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

class AuthController {
  // ... other methods ...

  // GET USER BY ID - FIXED VERSION
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      console.log(`🔍 Fetching user with ID: ${id}`);

      // Validate ID
      const userId = parseInt(id);
      if (isNaN(userId)) {
        return sendError(res, 'Invalid user ID', 400);
      }

      // Check permissions
      const allowedRoles = ["admin", "registrar", "hr_director"];
      if (!allowedRoles.includes(currentUser.role) && userId !== currentUser.user_id) {
        return sendError(res, "Unauthorized to view this user", 403);
      }

      // Get user from database
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Get staff profile if exists
      let staffProfile = null;
      const rolesWithStaff = ["instructor", "department_head", "dean", "registrar", "hr_director"];
      
      if (rolesWithStaff.includes(user.role)) {
        try {
          staffProfile = await StaffModel.findByUserId(userId);
        } catch (staffError) {
          console.log(`No staff profile for user ${userId}`);
        }
      }

      return sendSuccess(res, 'User retrieved successfully', {
        ...user,
        staff_profile: staffProfile,
      });
      
    } catch (error) {
      console.error('❌ Get user by ID error:', error);
      return sendError(res, 'Failed to retrieve user', 500);
    }
  }

  // USER STATS ENDPOINT
  static async getUserStats(req, res) {
    try {
      const currentUser = req.user;
      
      if (!["admin", "registrar", "hr_director"].includes(currentUser.role)) {
        return sendError(res, "Access denied", 403);
      }

      // Get all stats
      const [stats] = await query(`
        SELECT 
          COUNT(*) as total,
          SUM(is_active = 1) as active,
          SUM(role = 'instructor') as instructors,
          SUM(role = 'admin') as admins
        FROM users
      `);

      return sendSuccess(res, "User stats retrieved successfully", {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        instructors: parseInt(stats.instructors) || 0,
        admins: parseInt(stats.admins) || 0,
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      return sendError(res, "Failed to retrieve user stats", 500);
    }
  }

  // ... other methods ...
}

export default AuthController;