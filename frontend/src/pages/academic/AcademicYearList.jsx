import React, { useState, useEffect } from "react";
import { academicAPI } from "./api/academicAPI";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  Pagination,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

const AcademicYearList = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [formData, setFormData] = useState({
    year_code: "",
    year_name: "",
    start_date: "",
    end_date: "",
    is_active: false,
  });

  // Fetch academic years
  const fetchAcademicYears = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await academicAPI.getAcademicYears({
        page,
        limit: pagination.limit,
      });

      if (response.data) {
        setAcademicYears(response.data.years || response.data);
        setPagination(
          response.data.pagination || {
            page,
            limit: pagination.limit,
            total: response.data.length || 0,
            pages: Math.ceil((response.data.length || 0) / pagination.limit),
          }
        );
      }
    } catch (err) {
      console.error("Error fetching academic years:", err);
      setError(err.response?.data?.message || "Failed to load academic years");
    } finally {
      setLoading(false);
    }
  };

  // Fetch active academic year
  const fetchActiveAcademicYear = async () => {
    try {
      const response = await academicAPI.getActiveAcademicYear();
      return response.data;
    } catch (err) {
      console.error("Error fetching active academic year:", err);
      return null;
    }
  };

  // Create academic year
  const handleCreateAcademicYear = async () => {
    try {
      setLoading(true);

      const response = await academicAPI.createAcademicYear(formData);

      if (response.data) {
        await fetchAcademicYears();
        handleCloseDialog();
        setError(null);
      }
    } catch (err) {
      console.error("Error creating academic year:", err);
      setError(err.response?.data?.message || "Failed to create academic year");
    } finally {
      setLoading(false);
    }
  };

  // Update academic year
  const handleUpdateAcademicYear = async () => {
    try {
      setLoading(true);

      const response = await academicAPI.updateAcademicYear(
        selectedYear.academic_year_id,
        formData
      );

      if (response.data) {
        await fetchAcademicYears(pagination.page);
        handleCloseDialog();
        setError(null);
      }
    } catch (err) {
      console.error("Error updating academic year:", err);
      setError(err.response?.data?.message || "Failed to update academic year");
    } finally {
      setLoading(false);
    }
  };

  // Delete academic year
  const handleDeleteAcademicYear = async (id) => {
    if (window.confirm("Are you sure you want to delete this academic year?")) {
      try {
        setLoading(true);
        await academicAPI.deleteAcademicYear(id);
        await fetchAcademicYears(pagination.page);
        setError(null);
      } catch (err) {
        console.error("Error deleting academic year:", err);
        setError(
          err.response?.data?.message || "Failed to delete academic year"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Activate academic year
  const handleActivateAcademicYear = async (id) => {
    try {
      setLoading(true);
      await academicAPI.activateAcademicYear(id);
      await fetchAcademicYears(pagination.page);
      setError(null);
    } catch (err) {
      console.error("Error activating academic year:", err);
      setError(
        err.response?.data?.message || "Failed to activate academic year"
      );
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for create/edit
  const handleOpenDialog = (year = null) => {
    if (year) {
      setSelectedYear(year);
      setFormData({
        year_code: year.year_code,
        year_name: year.year_name,
        start_date: year.start_date.split("T")[0],
        end_date: year.end_date.split("T")[0],
        is_active: year.is_active,
      });
    } else {
      setSelectedYear(null);
      setFormData({
        year_code: "",
        year_name: "",
        start_date: "",
        end_date: "",
        is_active: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedYear(null);
    setFormData({
      year_code: "",
      year_name: "",
      start_date: "",
      end_date: "",
      is_active: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "is_active" ? checked : value,
    }));
  };

  const handlePageChange = (event, value) => {
    fetchAcademicYears(value);
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  return (
    <div>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Academic Years
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 1 }}
          >
            Add Academic Year
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchAcademicYears(pagination.page)}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Year Code</TableCell>
              <TableCell>Year Name</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Semesters</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : academicYears.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No academic years found
                </TableCell>
              </TableRow>
            ) : (
              academicYears.map((year) => (
                <TableRow key={year.academic_year_id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarIcon sx={{ mr: 1, color: "primary.main" }} />
                      {year.year_code}
                    </Box>
                  </TableCell>
                  <TableCell>{year.year_name}</TableCell>
                  <TableCell>
                    {format(new Date(year.start_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(year.end_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${year.semester_count || 0} semesters`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {year.is_active ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Active"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip label="Inactive" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(year)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleActivateAcademicYear(year.academic_year_id)
                      }
                      title="Activate"
                      disabled={year.is_active}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleDeleteAcademicYear(year.academic_year_id)
                      }
                      title="Delete"
                      disabled={year.semester_count > 0}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedYear ? "Edit Academic Year" : "Create Academic Year"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year Code"
                  name="year_code"
                  value={formData.year_code}
                  onChange={handleInputChange}
                  required
                  disabled={!!selectedYear}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year Name"
                  name="year_name"
                  value={formData.year_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      name="is_active"
                    />
                  }
                  label="Set as Active Academic Year"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={
              selectedYear ? handleUpdateAcademicYear : handleCreateAcademicYear
            }
            variant="contained"
            disabled={loading}
          >
            {loading ? "Saving..." : selectedYear ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AcademicYearList;
