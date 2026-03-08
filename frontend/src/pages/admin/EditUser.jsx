import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";
import departmentApi from "../../api/department";
import toast from "react-hot-toast";

// Material UI Components
import {
  Box,
  Paper,
  Button,
  Typography,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  CircularProgress,
  InputAdornment,
  FormHelperText,
} from "@mui/material";

// Material UI Icons
import {
  Save as SaveIcon,
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // DEBUG: Log when component mounts and ID
  console.log("🚀 EditUser component mounted with ID:", id);
  console.log("🔍 Component path:", window.location.pathname);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
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
  });

  // FETCH USER DATA with debugging
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log(`🔄 [EditUser] Fetching user data for ID: ${id}`);
        console.log("📡 [API] Calling authAPI.getUser...");

        // Fetch user
        const userResponse = await authAPI.getUser(id);
        console.log("✅ [API] User response received:", userResponse);

        if (!userResponse.success || !userResponse.data) {
          console.error("❌ [API] User fetch failed:", userResponse.message);
          toast.error(userResponse.message || "Failed to load user");
          navigate("/admin/users");
          return;
        }

        const user = userResponse.data;
        console.log("📋 [Data] User object received:", user);
        console.log("👤 [Data] User role:", user.role);
        console.log("📝 [Data] User staff profile:", user.staff_profile);

        // Set form data
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
        });

        console.log("✅ [State] Form data set:", {
          username: user.username,
          role: user.role,
          department_id: user.staff_profile?.department_id,
        });

        // DEBUG: Check what roles should show departments
        const rolesWithDepartments = ["instructor", "department_head", "dean"];
        console.log("🎯 [Logic] Roles with departments:", rolesWithDepartments);
        console.log(
          "🎯 [Logic] Current role shows departments:",
          rolesWithDepartments.includes(user.role)
        );

        // Fetch departments with detailed debugging
        console.log("🔄 [API] Fetching departments...");
        try {
          const deptResponse = await departmentApi.getAllDepartments();
          console.log("✅ [API] Department API response:", deptResponse);
          console.log(
            "📊 [Data] Department response success:",
            deptResponse.success
          );
          console.log("📊 [Data] Department response data:", deptResponse.data);
          console.log(
            "📊 [Data] Department data type:",
            typeof deptResponse.data
          );
          console.log(
            "📊 [Data] Is department data array?",
            Array.isArray(deptResponse.data)
          );

          if (deptResponse.success && deptResponse.data) {
            // Handle different response formats
            let deptArray = [];

            if (Array.isArray(deptResponse.data)) {
              console.log("✅ [Data] Departments is already an array");
              deptArray = deptResponse.data;
            } else if (
              deptResponse.data &&
              typeof deptResponse.data === "object"
            ) {
              console.log("🔄 [Data] Converting object to array...");
              console.log(
                "📊 [Data] Object keys:",
                Object.keys(deptResponse.data)
              );

              // Check for common API response patterns
              if (
                deptResponse.data.departments &&
                Array.isArray(deptResponse.data.departments)
              ) {
                console.log(
                  "✅ [Data] Found departments array in 'departments' key"
                );
                deptArray = deptResponse.data.departments;
              } else if (
                deptResponse.data.results &&
                Array.isArray(deptResponse.data.results)
              ) {
                console.log(
                  "✅ [Data] Found departments array in 'results' key"
                );
                deptArray = deptResponse.data.results;
              } else if (
                deptResponse.data.data &&
                Array.isArray(deptResponse.data.data)
              ) {
                console.log("✅ [Data] Found departments array in 'data' key");
                deptArray = deptResponse.data.data;
              } else {
                // Try to convert object values to array
                console.log("🔄 [Data] Converting object values to array...");
                const values = Object.values(deptResponse.data);
                deptArray = values.filter(
                  (item) =>
                    item &&
                    typeof item === "object" &&
                    (item.department_id || item.id)
                );
              }
            }

            // FINAL: Ensure it's an array
            deptArray = Array.isArray(deptArray) ? deptArray : [];
            console.log("✅ [State] Final departments array:", deptArray);
            console.log(
              "✅ [State] Departments array length:",
              deptArray.length
            );

            if (deptArray.length === 0) {
              console.warn("⚠️ [State] Departments array is empty!");
            }

            setDepartments(deptArray);
          } else {
            console.warn(
              "⚠️ [API] Department API failed or returned no data:",
              deptResponse
            );
            setDepartments([]);
          }
        } catch (deptError) {
          console.error("❌ [API] Error fetching departments:", deptError);
          console.error("❌ [API] Error stack:", deptError.stack);
          setDepartments([]);
        }
      } catch (error) {
        console.error("❌ [System] Error in fetchUserData:", error);
        console.error("❌ [System] Error stack:", error.stack);
        toast.error("Failed to load user data");
        navigate("/admin/users");
      } finally {
        console.log("✅ [State] Loading complete");
        setLoading(false);
      }
    };

    if (id) {
      console.log("🎬 [Effect] Starting data fetch...");
      fetchUserData();
    } else {
      console.error("❌ [System] No ID provided, redirecting...");
      navigate("/admin/users");
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(
      `📝 [Input] ${name} changed to:`,
      type === "checkbox" ? checked : value
    );

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      console.log(`✅ [Validation] Clearing error for ${name}`);
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    console.log("🔍 [Validation] Validating form...");
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      console.log("❌ [Validation] Email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      console.log("❌ [Validation] Email is invalid:", formData.email);
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
      console.log("❌ [Validation] First name is required");
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
      console.log("❌ [Validation] Last name is required");
    }

    console.log("📊 [Validation] Total errors:", Object.keys(newErrors).length);
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 [Submit] Form submission started");

    if (!validateForm()) {
      console.log("❌ [Submit] Form validation failed");
      return;
    }

    try {
      setSaving(true);
      console.log("💾 [API] Preparing update data...");

      const userData = {
        email: formData.email.trim(),
        role: formData.role,
        is_active: formData.is_active,
        staff_profile: {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          middle_name: formData.middle_name?.trim() || null,
          employee_id: formData.employee_id?.trim() || null,
          phone: formData.phone?.trim() || null,
          department_id: formData.department_id || null,
          academic_rank: formData.academic_rank,
          employment_type: formData.employment_type,
        },
      };

      console.log("📦 [API] Update data prepared:", userData);
      console.log("📡 [API] Calling authAPI.updateUser...");

      const response = await authAPI.updateUser(id, userData);
      console.log("✅ [API] Update response:", response);

      if (response.success) {
        console.log("🎉 [System] Update successful");
        toast.success("User updated successfully");
        navigate("/admin/users");
      } else {
        console.error("❌ [API] Update failed:", response.message);
        toast.error(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("❌ [System] Error updating user:", error);
      console.error("❌ [System] Error stack:", error.stack);
      toast.error("Failed to update user");
    } finally {
      console.log("✅ [State] Saving complete");
      setSaving(false);
    }
  };

  // DEBUG: Log render cycles
  console.log("🔄 [Render] EditUser rendering...");
  console.log("📊 [State] Loading:", loading);
  console.log("📊 [State] Saving:", saving);
  console.log("📊 [State] Departments:", departments);
  console.log("📊 [State] Departments is array?", Array.isArray(departments));
  console.log("📊 [State] Departments length:", departments.length);
  console.log("📊 [State] Form data role:", formData.role);
  console.log(
    "📊 [State] Should show departments?",
    ["instructor", "department_head", "dean"].includes(formData.role)
  );

  if (loading) {
    console.log("⏳ [UI] Showing loading state...");
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading user data...</Typography>
      </Box>
    );
  }

  console.log("🎨 [UI] Rendering form...");
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" gutterBottom>
            Edit User: {formData.username}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              console.log("🔙 [Navigation] Going back to users list");
              navigate("/admin/users");
            }}
          >
            Back to Users
          </Button>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Username Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                disabled
                helperText="Username cannot be changed"
              />
            </Grid>

            {/* Email Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={saving}
              />
            </Grid>

            {/* First Name Field */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                disabled={saving}
              />
            </Grid>

            {/* Middle Name Field */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                disabled={saving}
              />
            </Grid>

            {/* Last Name Field */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                disabled={saving}
              />
            </Grid>

            {/* Employee ID Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                disabled={saving}
              />
            </Grid>

            {/* Phone Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={saving}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Academic Information (only for instructor, department_head, dean) */}
            {console.log("🎯 [Render] Checking if role shows academic info...")}
            {console.log("📊 [Render] Current role:", formData.role)}
            {console.log(
              "📊 [Render] Should show?",
              ["instructor", "department_head", "dean"].includes(formData.role)
            )}

            {["instructor", "department_head", "dean"].includes(
              formData.role
            ) && (
              <>
                {console.log("✅ [Render] Showing academic information")}
                {console.log(
                  "📊 [Render] Departments for dropdown:",
                  departments
                )}
                {console.log(
                  "📊 [Render] Departments length:",
                  departments.length
                )}

                {/* Department Select - WITH DEBUGGING */}
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    required
                    error={!!errors.department_id}
                  >
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department_id"
                      value={formData.department_id}
                      label="Department"
                      onChange={handleInputChange}
                      disabled={saving}
                    >
                      <MenuItem value="">Select Department</MenuItem>

                      {/* DEBUG: Log before rendering options */}
                      {console.log(
                        "🔍 [Render] Rendering department options..."
                      )}
                      {console.log(
                        "📊 [Render] Departments value:",
                        departments
                      )}
                      {console.log(
                        "📊 [Render] Is array?",
                        Array.isArray(departments)
                      )}
                      {console.log(
                        "📊 [Render] Can map?",
                        Array.isArray(departments)
                      )}

                      {/* PERMANENT FIX: Always check if array before mapping */}
                      {Array.isArray(departments) ? (
                        departments.length > 0 ? (
                          departments.map((dept, index) => {
                            console.log(
                              `📦 [Render] Department ${index}:`,
                              dept
                            );
                            const deptId =
                              dept.department_id || dept.id || dept.value || "";
                            const deptName =
                              dept.department_name ||
                              dept.name ||
                              dept.label ||
                              `Department ${deptId}`;

                            return (
                              <MenuItem key={deptId} value={deptId}>
                                {deptName}
                              </MenuItem>
                            );
                          })
                        ) : (
                          <MenuItem disabled>No departments available</MenuItem>
                        )
                      ) : (
                        <>
                          {console.error(
                            "❌ [Render] DEPARTMENTS IS NOT AN ARRAY! Value:",
                            departments
                          )}
                          <MenuItem disabled>
                            Error: Departments not loaded properly
                          </MenuItem>
                        </>
                      )}
                    </Select>
                    {errors.department_id && (
                      <FormHelperText>{errors.department_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Academic Rank Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Academic Rank</InputLabel>
                    <Select
                      name="academic_rank"
                      value={formData.academic_rank}
                      label="Academic Rank"
                      onChange={handleInputChange}
                      disabled={saving}
                    >
                      <MenuItem value="graduate_assistant">
                        Graduate Assistant
                      </MenuItem>
                      <MenuItem value="assistant_lecturer">
                        Assistant Lecturer
                      </MenuItem>
                      <MenuItem value="lecturer">Lecturer</MenuItem>
                      <MenuItem value="assistant_professor">
                        Assistant Professor
                      </MenuItem>
                      <MenuItem value="associate_professor">
                        Associate Professor
                      </MenuItem>
                      <MenuItem value="professor">Professor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Employment Type Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      name="employment_type"
                      value={formData.employment_type}
                      label="Employment Type"
                      onChange={handleInputChange}
                      disabled={saving}
                    >
                      <MenuItem value="full_time">Full Time</MenuItem>
                      <MenuItem value="part_time">Part Time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Role Select */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="instructor">Instructor</MenuItem>
                  <MenuItem value="department_head">Department Head</MenuItem>
                  <MenuItem value="dean">Dean</MenuItem>
                  <MenuItem value="registrar">Registrar</MenuItem>
                  <MenuItem value="hr_director">HR Director</MenuItem>
                  <MenuItem value="vpaa">VP Academic</MenuItem>
                  <MenuItem value="vpaf">VP Admin & Finance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Active Status Switch */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                }
                label="Active Account"
              />
            </Grid>

            {/* Form Actions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    console.log("❌ [Action] Form cancelled");
                    navigate("/admin/users");
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={
                    saving ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditUser;
