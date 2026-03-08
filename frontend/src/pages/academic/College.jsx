// CollegeManagement.jsx - Complete Functional Component
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Tooltip,
  TablePagination,
  Autocomplete,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  ShowChart as StatsIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import collegeAPI from "../../api/college";

const CollegeManagement = () => {
  // State Management
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalColleges, setTotalColleges] = useState(0);

  // Form States
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("create"); // 'create' or 'edit'
  const [currentCollege, setCurrentCollege] = useState(null);

  // Filter/Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Statistics
  const [stats, setStats] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    college_code: "",
    college_name: "",
    dean_user_id: null,
    status: "active",
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch colleges from database
  const fetchColleges = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await collegeAPI.getAllColleges({
        page: page + 1,
        limit: rowsPerPage,
        include_stats: true,
      });

      if (response.success) {
        setColleges(response.data.colleges || []);
        setTotalColleges(response.data.pagination?.total || 0);

        // Set overall statistics if available
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else {
        setError(response.message || "Failed to fetch colleges");
      }
    } catch (err) {
      console.error("Error fetching colleges:", err);
      setError("Failed to load colleges. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch single college details
  const fetchCollegeDetails = async (collegeId) => {
    try {
      const response = await collegeAPI.getCollegeById(collegeId);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching college details:", err);
      return null;
    }
  };

  // Fetch college statistics
  const fetchCollegeStatistics = async (collegeId) => {
    try {
      const response = await collegeAPI.getCollegeStats(collegeId);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching college statistics:", err);
      return null;
    }
  };

  // Handle create college
  const handleCreateCollege = async () => {
    // Validate form
    const errors = {};
    if (!formData.college_code.trim())
      errors.college_code = "College code is required";
    if (!formData.college_name.trim())
      errors.college_name = "College name is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await collegeAPI.createCollege(formData);

      if (response.success) {
        setSuccess("College created successfully!");
        fetchColleges(); // Refresh list
        handleCloseDialog();
      } else {
        setError(response.message || "Failed to create college");
      }
    } catch (err) {
      console.error("Error creating college:", err);
      setError(err.response?.data?.message || "Failed to create college");
    } finally {
      setLoading(false);
    }
  };

  // Handle update college
  const handleUpdateCollege = async () => {
    if (!currentCollege) return;

    // Validate form
    const errors = {};
    if (!formData.college_code.trim())
      errors.college_code = "College code is required";
    if (!formData.college_name.trim())
      errors.college_name = "College name is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await collegeAPI.updateCollege(
        currentCollege.college_id,
        formData
      );

      if (response.success) {
        setSuccess("College updated successfully!");
        fetchColleges(); // Refresh list
        handleCloseDialog();
      } else {
        setError(response.message || "Failed to update college");
      }
    } catch (err) {
      console.error("Error updating college:", err);
      setError(err.response?.data?.message || "Failed to update college");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete college
  const handleDeleteCollege = async (collegeId) => {
    if (!window.confirm("Are you sure you want to delete this college?"))
      return;

    setLoading(true);
    try {
      const response = await collegeAPI.deleteCollege(collegeId);

      if (response.success) {
        setSuccess("College deleted successfully!");
        fetchColleges(); // Refresh list
      } else {
        setError(response.message || "Failed to delete college");
      }
    } catch (err) {
      console.error("Error deleting college:", err);
      setError(err.response?.data?.message || "Failed to delete college");
    } finally {
      setLoading(false);
    }
  };

  // Handle assign dean
  const handleAssignDean = async (collegeId, userId) => {
    if (!userId) {
      setError("Please select a user to assign as dean");
      return;
    }

    setLoading(true);
    try {
      const response = await collegeAPI.assignDean(collegeId, {
        user_id: userId,
      });

      if (response.success) {
        setSuccess("Dean assigned successfully!");
        fetchColleges(); // Refresh list
      } else {
        setError(response.message || "Failed to assign dean");
      }
    } catch (err) {
      console.error("Error assigning dean:", err);
      setError(err.response?.data?.message || "Failed to assign dean");
    } finally {
      setLoading(false);
    }
  };

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setDialogType("create");
    setFormData({
      college_code: "",
      college_name: "",
      dean_user_id: null,
      status: "active",
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = async (college) => {
    setDialogType("edit");
    setCurrentCollege(college);

    // Fetch fresh college data
    const collegeDetails = await fetchCollegeDetails(college.college_id);

    setFormData({
      college_code: collegeDetails?.college_code || college.college_code,
      college_name: collegeDetails?.college_name || college.college_name,
      dean_user_id: collegeDetails?.dean_user_id || null,
      status: collegeDetails?.status || "active",
    });

    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenStatsDialog = async (college) => {
    const stats = await fetchCollegeStatistics(college.college_id);
    if (stats) {
      // Show statistics in a dialog or modal
      alert(`Statistics for ${college.college_name}:
      - Departments: ${stats.department_count || 0}
      - Staff: ${stats.staff_count || 0}
      - Courses: ${stats.course_count || 0}`);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      college_code: "",
      college_name: "",
      dean_user_id: null,
      status: "active",
    });
    setFormErrors({});
    setCurrentCollege(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter colleges
  const filteredColleges = colleges.filter((college) => {
    const matchesSearch =
      searchTerm === "" ||
      college.college_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.college_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || college.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "default";
    }
  };

  // Initialize on component mount
  useEffect(() => {
    fetchColleges();
  }, [page, rowsPerPage]);

  // Statistics Card Component
  const StatisticsCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          College Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {totalColleges}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Colleges
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                {colleges.filter((c) => c.status === "active").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Colleges
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                {stats?.total_departments || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Departments
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                {stats?.total_staff || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Staff
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          <SchoolIcon sx={{ mr: 2, verticalAlign: "middle" }} />
          College Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ mr: 1 }}
          >
            Add College
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchColleges}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <StatisticsCard />

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Colleges"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code or name..."
              InputProps={{
                startAdornment: <SchoolIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredColleges.length} of {totalColleges} colleges
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Error/Success Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {loading && colleges.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading colleges...</Typography>
        </Box>
      ) : (
        /* Colleges Table */
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Code</strong>
                  </TableCell>
                  <TableCell>
                    <strong>College Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Dean</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Departments</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Created</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredColleges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No colleges found.{" "}
                        {searchTerm
                          ? "Try a different search."
                          : 'Click "Add College" to create one.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredColleges.map((college) => (
                    <TableRow key={college.college_id} hover>
                      <TableCell>
                        <strong>{college.college_code}</strong>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <SchoolIcon sx={{ mr: 1, color: "primary.main" }} />
                          {college.college_name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {college.dean_username ? (
                          <Chip
                            icon={<PersonIcon />}
                            label={college.dean_username}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={college.department_count || 0}
                          size="small"
                          color={
                            college.department_count > 0 ? "info" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={college.status}
                          color={getStatusColor(college.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(college.created_at)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleOpenEditDialog(college)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit College">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditDialog(college)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Statistics">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleOpenStatsDialog(college)}
                            >
                              <StatsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete College">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteCollege(college.college_id)
                              }
                              disabled={college.department_count > 0}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalColleges}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === "create" ? "Create New College" : "Edit College"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="College Code"
                  name="college_code"
                  value={formData.college_code}
                  onChange={handleInputChange}
                  error={!!formErrors.college_code}
                  helperText={formErrors.college_code}
                  required
                  placeholder="e.g., ENGG, ARTS"
                  InputProps={{
                    startAdornment: (
                      <SchoolIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="College Name"
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleInputChange}
                  error={!!formErrors.college_name}
                  helperText={formErrors.college_name}
                  required
                  placeholder="e.g., College of Engineering"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dean User ID"
                  name="dean_user_id"
                  type="number"
                  value={formData.dean_user_id || ""}
                  onChange={handleInputChange}
                  placeholder="Optional: Enter user ID for dean"
                  InputProps={{
                    startAdornment: (
                      <PersonIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Leave empty if no dean assigned yet
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={
              dialogType === "create"
                ? handleCreateCollege
                : handleUpdateCollege
            }
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : dialogType === "create" ? (
              "Create College"
            ) : (
              "Update College"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CollegeManagement;
