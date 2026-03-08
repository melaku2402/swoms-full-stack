// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
//   Grid,
//   Alert,
//   CircularProgress,
//   InputAdornment,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
//   Divider,
//   Stepper,
//   Step,
//   StepLabel,
//   StepContent,
//   Paper,
//   Autocomplete,
//   Chip,
//   IconButton,
//   Tooltip,
// } from "@mui/material";
// import {
//   Save,
//   Cancel,
//   ArrowBack,
//   Add,
//   Search,
//   Person,
//   School,
//   Settings,
//   CheckCircle,
//   Error,
//   Info,
// } from "@mui/icons-material";
// import { useNavigate, useParams } from "react-router-dom";
// import * as yup from "yup";
// import { useFormik } from "formik";
// import departmentApi from "../../api/departmentApi";
// import collegeApi from "../../api/";
// // import userApi from "../../api/userApi";

// const DepartmentForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditMode = Boolean(id);

//   // State Management
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [colleges, setColleges] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [activeStep, setActiveStep] = useState(0);
//   const [collegeOptions, setCollegeOptions] = useState([]);
//   const [headOptions, setHeadOptions] = useState([]);

//   // Validation Schema
//   const validationSchema = yup.object({
//     department_code: yup
//       .string()
//       .required("Department code is required")
//       .min(2, "Department code must be at least 2 characters")
//       .max(20, "Department code cannot exceed 20 characters")
//       .matches(
//         /^[A-Z0-9_-]+$/,
//         "Only uppercase letters, numbers, hyphens, and underscores allowed"
//       ),

//     department_name: yup
//       .string()
//       .required("Department name is required")
//       .min(3, "Department name must be at least 3 characters")
//       .max(150, "Department name cannot exceed 150 characters"),

//     college_id: yup
//       .number()
//       .required("College is required")
//       .positive("Please select a college"),

//     head_user_id: yup.number().nullable(),

//     status: yup
//       .string()
//       .required("Status is required")
//       .oneOf(["active", "inactive"], "Invalid status"),
//   });

//   // Formik Setup
//   const formik = useFormik({
//     initialValues: {
//       department_code: "",
//       department_name: "",
//       college_id: "",
//       head_user_id: "",
//       status: "active",
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       await handleSubmit(values);
//     },
//   });

//   // Load Data
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         // Load colleges
//         const collegesResponse = await collegeApi.getAllColleges({
//           limit: 100,
//         });
//         setColleges(collegesResponse.data.colleges || []);
//         setCollegeOptions(
//           collegesResponse.data.colleges.map((college) => ({
//             value: college.college_id,
//             label: `${college.college_name} (${college.college_code})`,
//           }))
//         );

//         // Load users for head selection
//         const usersResponse = await userApi.getAllUsers({
//           roles: ["instructor", "department_head", "dean"],
//           status: "active",
//           limit: 100,
//         });
//         setUsers(usersResponse.data.users || []);
//         setHeadOptions(
//           usersResponse.data.users.map((user) => ({
//             value: user.user_id,
//             label: `${user.username} - ${user.email}`,
//           }))
//         );

//         // Load department data if in edit mode
//         if (isEditMode) {
//           const departmentResponse = await departmentApi.getDepartmentById(id);
//           const department = departmentResponse.data.department;

//           formik.setValues({
//             department_code: department.department_code || "",
//             department_name: department.department_name || "",
//             college_id: department.college_id || "",
//             head_user_id: department.head_user_id || "",
//             status: department.status || "active",
//           });
//         }
//       } catch (err) {
//         console.error("Error loading data:", err);
//         setError("Failed to load required data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [id, isEditMode]);

//   // Handle Form Submission
//   const handleSubmit = async (values) => {
//     setSubmitting(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       if (isEditMode) {
//         // Update existing department
//         await departmentApi.updateDepartment(id, values);
//         setSuccess("Department updated successfully!");
//       } else {
//         // Create new department
//         await departmentApi.createDepartment(values);
//         setSuccess("Department created successfully!");
//       }

//       // Redirect after success
//       setTimeout(() => {
//         navigate("/departments");
//       }, 1500);
//     } catch (err) {
//       console.error("Error saving department:", err);
//       setError(err.response?.data?.message || "Failed to save department");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle Cancel
//   const handleCancel = () => {
//     navigate("/departments");
//   };

//   // Stepper Steps
//   const steps = [
//     {
//       label: "Basic Information",
//       description: "Enter department code and name",
//     },
//     {
//       label: "College Assignment",
//       description: "Select the college this department belongs to",
//     },
//     {
//       label: "Department Head",
//       description: "Assign a head to the department (optional)",
//     },
//     {
//       label: "Review & Submit",
//       description: "Review all information and submit",
//     },
//   ];

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "400px",
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}
//     >
//       {/* Header */}
//       <Box sx={{ mb: 4 }}>
//         <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
//           <IconButton onClick={handleCancel} sx={{ mr: 2 }}>
//             <ArrowBack />
//           </IconButton>
//           <Typography variant="h4" sx={{ fontWeight: 600 }}>
//             {isEditMode ? "Edit Department" : "Create New Department"}
//           </Typography>
//         </Box>

//         <Typography variant="body1" color="text.secondary" paragraph>
//           {isEditMode
//             ? "Update department information and settings"
//             : "Add a new academic department to the system"}
//         </Typography>

//         {/* Notifications */}
//         {error && (
//           <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}

//         {success && (
//           <Alert
//             severity="success"
//             onClose={() => setSuccess(null)}
//             sx={{ mb: 2 }}
//           >
//             {success}
//           </Alert>
//         )}
//       </Box>

//       <Grid container spacing={3}>
//         {/* Left Side: Form */}
//         <Grid item xs={12} md={8}>
//           <Card>
//             <CardContent>
//               {/* Stepper for Create Mode */}
//               {!isEditMode && (
//                 <Stepper
//                   activeStep={activeStep}
//                   orientation="vertical"
//                   sx={{ mb: 4 }}
//                 >
//                   {steps.map((step, index) => (
//                     <Step key={step.label}>
//                       <StepLabel>{step.label}</StepLabel>
//                       <StepContent>
//                         <Typography variant="body2">
//                           {step.description}
//                         </Typography>
//                       </StepContent>
//                     </Step>
//                   ))}
//                 </Stepper>
//               )}

//               <form onSubmit={formik.handleSubmit}>
//                 <Grid container spacing={3}>
//                   {/* Department Code */}
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       fullWidth
//                       label="Department Code"
//                       name="department_code"
//                       value={formik.values.department_code}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       error={
//                         formik.touched.department_code &&
//                         Boolean(formik.errors.department_code)
//                       }
//                       helperText={
//                         formik.touched.department_code &&
//                         formik.errors.department_code
//                       }
//                       required
//                       disabled={submitting}
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <School />
//                           </InputAdornment>
//                         ),
//                       }}
//                       placeholder="e.g., CSE, ECE, MECH"
//                     />
//                   </Grid>

//                   {/* Department Name */}
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       fullWidth
//                       label="Department Name"
//                       name="department_name"
//                       value={formik.values.department_name}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       error={
//                         formik.touched.department_name &&
//                         Boolean(formik.errors.department_name)
//                       }
//                       helperText={
//                         formik.touched.department_name &&
//                         formik.errors.department_name
//                       }
//                       required
//                       disabled={submitting}
//                       placeholder="e.g., Computer Science and Engineering"
//                     />
//                   </Grid>

//                   {/* College Selection */}
//                   <Grid item xs={12} md={6}>
//                     <FormControl
//                       fullWidth
//                       error={
//                         formik.touched.college_id &&
//                         Boolean(formik.errors.college_id)
//                       }
//                       disabled={submitting}
//                     >
//                       <InputLabel required>College</InputLabel>
//                       <Select
//                         name="college_id"
//                         value={formik.values.college_id}
//                         onChange={formik.handleChange}
//                         onBlur={formik.handleBlur}
//                         label="College"
//                       >
//                         <MenuItem value="">
//                           <em>Select a college</em>
//                         </MenuItem>
//                         {colleges.map((college) => (
//                           <MenuItem
//                             key={college.college_id}
//                             value={college.college_id}
//                           >
//                             {college.college_name} ({college.college_code})
//                           </MenuItem>
//                         ))}
//                       </Select>
//                       {formik.touched.college_id &&
//                         formik.errors.college_id && (
//                           <Typography
//                             variant="caption"
//                             color="error"
//                             sx={{ mt: 0.5, ml: 2 }}
//                           >
//                             {formik.errors.college_id}
//                           </Typography>
//                         )}
//                     </FormControl>
//                   </Grid>

//                   {/* Department Head */}
//                   <Grid item xs={12} md={6}>
//                     <FormControl fullWidth disabled={submitting}>
//                       <InputLabel>Department Head</InputLabel>
//                       <Select
//                         name="head_user_id"
//                         value={formik.values.head_user_id}
//                         onChange={formik.handleChange}
//                         onBlur={formik.handleBlur}
//                         label="Department Head"
//                       >
//                         <MenuItem value="">
//                           <em>Not assigned</em>
//                         </MenuItem>
//                         {users
//                           .filter(
//                             (user) =>
//                               user.role === "instructor" ||
//                               user.role === "department_head"
//                           )
//                           .map((user) => (
//                             <MenuItem key={user.user_id} value={user.user_id}>
//                               {user.username} - {user.email}
//                             </MenuItem>
//                           ))}
//                       </Select>
//                       <Typography
//                         variant="caption"
//                         color="text.secondary"
//                         sx={{ mt: 0.5 }}
//                       >
//                         Optional - can be assigned later
//                       </Typography>
//                     </FormControl>
//                   </Grid>

//                   {/* Status */}
//                   <Grid item xs={12} md={6}>
//                     <FormControl fullWidth disabled={submitting}>
//                       <InputLabel required>Status</InputLabel>
//                       <Select
//                         name="status"
//                         value={formik.values.status}
//                         onChange={formik.handleChange}
//                         onBlur={formik.handleBlur}
//                         label="Status"
//                       >
//                         <MenuItem value="active">Active</MenuItem>
//                         <MenuItem value="inactive">Inactive</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Grid>

//                   {/* Selected College Info */}
//                   {formik.values.college_id && (
//                     <Grid item xs={12}>
//                       <Paper elevation={0} sx={{ p: 2, bgcolor: "#fafafa" }}>
//                         <Typography variant="subtitle2" gutterBottom>
//                           Selected College Information
//                         </Typography>
//                         {colleges
//                           .filter(
//                             (c) => c.college_id === formik.values.college_id
//                           )
//                           .map((college) => (
//                             <Grid
//                               container
//                               spacing={2}
//                               key={college.college_id}
//                             >
//                               <Grid item xs={6} md={3}>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   College Name
//                                 </Typography>
//                                 <Typography variant="body2">
//                                   {college.college_name}
//                                 </Typography>
//                               </Grid>
//                               <Grid item xs={6} md={3}>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   College Code
//                                 </Typography>
//                                 <Typography variant="body2">
//                                   {college.college_code}
//                                 </Typography>
//                               </Grid>
//                               <Grid item xs={6} md={3}>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   Dean
//                                 </Typography>
//                                 <Typography variant="body2">
//                                   {college.dean_username || "Not assigned"}
//                                 </Typography>
//                               </Grid>
//                               <Grid item xs={6} md={3}>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   Departments
//                                 </Typography>
//                                 <Typography variant="body2">
//                                   {college.department_count || 0} departments
//                                 </Typography>
//                               </Grid>
//                             </Grid>
//                           ))}
//                       </Paper>
//                     </Grid>
//                   )}

//                   {/* Action Buttons */}
//                   <Grid item xs={12}>
//                     <Divider sx={{ my: 2 }} />
//                     <Box
//                       sx={{
//                         display: "flex",
//                         justifyContent: "flex-end",
//                         gap: 2,
//                       }}
//                     >
//                       <Button
//                         variant="outlined"
//                         startIcon={<Cancel />}
//                         onClick={handleCancel}
//                         disabled={submitting}
//                       >
//                         Cancel
//                       </Button>
//                       <Button
//                         type="submit"
//                         variant="contained"
//                         startIcon={
//                           submitting ? <CircularProgress size={20} /> : <Save />
//                         }
//                         disabled={submitting || !formik.isValid}
//                       >
//                         {submitting
//                           ? "Saving..."
//                           : isEditMode
//                           ? "Update Department"
//                           : "Create Department"}
//                       </Button>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </form>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Side: Help & Information */}
//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 <Info sx={{ mr: 1, verticalAlign: "middle" }} />
//                 Department Guidelines
//               </Typography>

//               <Box sx={{ mb: 3 }}>
//                 <Typography
//                   variant="subtitle2"
//                   color="text.secondary"
//                   gutterBottom
//                 >
//                   Department Code
//                 </Typography>
//                 <Typography variant="body2" paragraph>
//                   • Use uppercase letters and numbers only
//                   <br />
//                   • Maximum 20 characters
//                   <br />
//                   • No spaces or special characters except hyphens
//                   <br />• Example: CSE, ECE-2024, MECH-01
//                 </Typography>

//                 <Typography
//                   variant="subtitle2"
//                   color="text.secondary"
//                   gutterBottom
//                 >
//                   Department Name
//                 </Typography>
//                 <Typography variant="body2" paragraph>
//                   • Use the full official name
//                   <br />
//                   • Maximum 150 characters
//                   <br />• Example: "Computer Science and Engineering"
//                 </Typography>

//                 <Typography
//                   variant="subtitle2"
//                   color="text.secondary"
//                   gutterBottom
//                 >
//                   Status
//                 </Typography>
//                 <Typography variant="body2" paragraph>
//                   • <strong>Active:</strong> Department is operational and can
//                   accept enrollments
//                   <br />• <strong>Inactive:</strong> Department is archived or
//                   temporarily suspended
//                 </Typography>
//               </Box>

//               <Divider sx={{ my: 2 }} />

//               <Typography
//                 variant="subtitle2"
//                 color="text.secondary"
//                 gutterBottom
//               >
//                 Quick Actions
//               </Typography>
//               <Grid container spacing={1}>
//                 <Grid item xs={6}>
//                   <Button
//                     fullWidth
//                     variant="outlined"
//                     size="small"
//                     startIcon={<School />}
//                     onClick={() => navigate("/colleges")}
//                   >
//                     View Colleges
//                   </Button>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Button
//                     fullWidth
//                     variant="outlined"
//                     size="small"
//                     startIcon={<Person />}
//                     onClick={() => navigate("/staff")}
//                   >
//                     View Staff
//                   </Button>
//                 </Grid>
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* Form Validation Status */}
//           <Card sx={{ mt: 3 }}>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 <CheckCircle sx={{ mr: 1, verticalAlign: "middle" }} />
//                 Validation Status
//               </Typography>

//               <Box sx={{ mt: 2 }}>
//                 {[
//                   {
//                     field: "department_code",
//                     label: "Department Code",
//                     valid:
//                       !formik.errors.department_code &&
//                       formik.touched.department_code,
//                   },
//                   {
//                     field: "department_name",
//                     label: "Department Name",
//                     valid:
//                       !formik.errors.department_name &&
//                       formik.touched.department_name,
//                   },
//                   {
//                     field: "college_id",
//                     label: "College",
//                     valid:
//                       !formik.errors.college_id && formik.touched.college_id,
//                   },
//                   {
//                     field: "status",
//                     label: "Status",
//                     valid: !formik.errors.status && formik.touched.status,
//                   },
//                 ].map((item) => (
//                   <Box
//                     key={item.field}
//                     sx={{ display: "flex", alignItems: "center", mb: 1 }}
//                   >
//                     {item.valid ? (
//                       <CheckCircle
//                         sx={{ color: "success.main", mr: 1, fontSize: 16 }}
//                       />
//                     ) : formik.touched[item.field] ? (
//                       <Error
//                         sx={{ color: "error.main", mr: 1, fontSize: 16 }}
//                       />
//                     ) : (
//                       <Typography sx={{ width: 16, mr: 1 }}>•</Typography>
//                     )}
//                     <Typography variant="body2">{item.label}</Typography>
//                   </Box>
//                 ))}
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default DepartmentForm;
