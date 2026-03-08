// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
//   IconButton,
//   Button,
//   TextField,
//   InputAdornment,
//   CircularProgress,
//   Alert,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   Avatar,
//   Tooltip,
//   TablePagination,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   CardHeader,
//   LinearProgress,
// } from "@mui/material";
// import {
//   Search,
//   FilterList,
//   Add,
//   Edit,
//   Delete,
//   Visibility,
//   MoreVert,
//   Refresh,
//   People,
//   School,
//   Assignment,
//   TrendingUp,
//   ArrowUpward,
//   ArrowDownward,
//   Sort,
//   CloudDownload,
//   Print,
//   Share,
//   ContentCopy,
//   Archive,
//   Restore,
//   Settings,
//   Group,
//   Home,
//   ChevronRight,
// } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import departmentApi from "../../api";

// const DepartmentList = () => {
//   const navigate = useNavigate();

//   // State Management
//   const [departments, setDepartments] = useState([]);
//   const [filteredDepartments, setFilteredDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [sortField, setSortField] = useState("department_name");
//   const [sortDirection, setSortDirection] = useState("asc");
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [selectedDepartment, setSelectedDepartment] = useState(null);
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedActionDepartment, setSelectedActionDepartment] =
//     useState(null);
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     inactive: 0,
//     totalStaff: 0,
//     totalCourses: 0,
//   });

//   // Fetch Departments
//   const fetchDepartments = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await departmentApi.getAllDepartments({
//         page: page + 1,
//         limit: rowsPerPage,
//         search: searchQuery,
//         sort_by: sortField,
//         order: sortDirection,
//       });

//       setDepartments(response.data.departments || []);
//       setFilteredDepartments(response.data.departments || []);

//       // Calculate statistics
//       if (response.data.departments) {
//         const activeDepts = response.data.departments.filter(
//           (dept) => dept.status === "active"
//         ).length;

//         setStats({
//           total: response.data.departments.length,
//           active: activeDepts,
//           inactive: response.data.departments.length - activeDepts,
//           totalStaff: response.data.departments.reduce(
//             (sum, dept) => sum + (dept.staff_count || 0),
//             0
//           ),
//           totalCourses: response.data.departments.reduce(
//             (sum, dept) => sum + (dept.course_count || 0),
//             0
//           ),
//         });
//       }
//     } catch (err) {
//       console.error("Error fetching departments:", err);
//       setError(err.response?.data?.message || "Failed to load departments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial Load
//   useEffect(() => {
//     fetchDepartments();
//   }, [page, rowsPerPage, sortField, sortDirection]);

//   // Search Filter
//   useEffect(() => {
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       const filtered = departments.filter(
//         (dept) =>
//           dept.department_name.toLowerCase().includes(query) ||
//           dept.department_code.toLowerCase().includes(query) ||
//           dept.college_name.toLowerCase().includes(query) ||
//           dept.head_username?.toLowerCase().includes(query)
//       );
//       setFilteredDepartments(filtered);
//     } else {
//       setFilteredDepartments(departments);
//     }
//   }, [searchQuery, departments]);

//   // Handle Sort
//   const handleSort = (field) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     } else {
//       setSortField(field);
//       setSortDirection("asc");
//     }
//   };

//   // Handle Delete
//   const handleDelete = async () => {
//     if (!selectedDepartment) return;

//     try {
//       await departmentApi.deleteDepartment(selectedDepartment.department_id);
//       setDeleteDialogOpen(false);
//       setSelectedDepartment(null);
//       fetchDepartments(); // Refresh list
//     } catch (err) {
//       console.error("Error deleting department:", err);
//       setError("Failed to delete department");
//     }
//   };

//   // Handle Action Menu
//   const handleActionMenuOpen = (event, department) => {
//     setActionMenuAnchor(event.currentTarget);
//     setSelectedActionDepartment(department);
//   };

//   const handleActionMenuClose = () => {
//     setActionMenuAnchor(null);
//     setSelectedActionDepartment(null);
//   };

//   // Handle Department Status Change
//   const handleStatusChange = async (departmentId, newStatus) => {
//     try {
//       await departmentApi.updateDepartmentStatus(departmentId, newStatus);
//       fetchDepartments(); // Refresh list
//     } catch (err) {
//       console.error("Error updating status:", err);
//       setError("Failed to update department status");
//     }
//   };

//   // Format Date
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString();
//   };

//   if (loading && departments.length === 0) {
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
//         <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
//           Departments Management
//         </Typography>
//         <Typography variant="body1" color="text.secondary" paragraph>
//           Manage academic departments, staff assignments, and workload
//           distribution
//         </Typography>

//         {error && (
//           <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}
//       </Box>

//       {/* Statistics Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card sx={{ height: "100%" }}>
//             <CardContent>
//               <Typography color="textSecondary" gutterBottom variant="body2">
//                 TOTAL DEPARTMENTS
//               </Typography>
//               <Typography variant="h4" sx={{ fontWeight: 700 }}>
//                 {stats.total}
//               </Typography>
//               <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
//                 <Home sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
//                 <Typography variant="caption" color="text.secondary">
//                   Academic Units
//                 </Typography>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card sx={{ height: "100%" }}>
//             <CardContent>
//               <Typography color="textSecondary" gutterBottom variant="body2">
//                 ACTIVE DEPARTMENTS
//               </Typography>
//               <Typography
//                 variant="h4"
//                 sx={{ fontWeight: 700, color: "success.main" }}
//               >
//                 {stats.active}
//               </Typography>
//               <LinearProgress
//                 variant="determinate"
//                 value={(stats.active / stats.total) * 100}
//                 color="success"
//                 sx={{ mt: 1 }}
//               />
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card sx={{ height: "100%" }}>
//             <CardContent>
//               <Typography color="textSecondary" gutterBottom variant="body2">
//                 TOTAL STAFF
//               </Typography>
//               <Typography variant="h4" sx={{ fontWeight: 700 }}>
//                 {stats.totalStaff}
//               </Typography>
//               <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
//                 <People sx={{ fontSize: 16, mr: 0.5, color: "info.main" }} />
//                 <Typography variant="caption" color="text.secondary">
//                   Academic Staff
//                 </Typography>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card sx={{ height: "100%" }}>
//             <CardContent>
//               <Typography color="textSecondary" gutterBottom variant="body2">
//                 TOTAL COURSES
//               </Typography>
//               <Typography variant="h4" sx={{ fontWeight: 700 }}>
//                 {stats.totalCourses}
//               </Typography>
//               <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
//                 <School sx={{ fontSize: 16, mr: 0.5, color: "warning.main" }} />
//                 <Typography variant="caption" color="text.secondary">
//                   Course Offerings
//                 </Typography>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card sx={{ height: "100%" }}>
//             <CardContent>
//               <Typography color="textSecondary" gutterBottom variant="body2">
//                 INACTIVE DEPARTMENTS
//               </Typography>
//               <Typography
//                 variant="h4"
//                 sx={{ fontWeight: 700, color: "error.main" }}
//               >
//                 {stats.inactive}
//               </Typography>
//               <Typography
//                 variant="caption"
//                 color="text.secondary"
//                 sx={{ mt: 1 }}
//               >
//                 Requires attention
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Control Bar */}
//       <Card sx={{ mb: 3 }}>
//         <CardContent>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 placeholder="Search departments by name, code, or college..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <Search />
//                     </InputAdornment>
//                   ),
//                 }}
//                 size="small"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
//                 <Tooltip title="Refresh">
//                   <IconButton onClick={fetchDepartments}>
//                     <Refresh />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title="Filter">
//                   <IconButton>
//                     <FilterList />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title="Export">
//                   <IconButton>
//                     <CloudDownload />
//                   </IconButton>
//                 </Tooltip>
//                 <Button
//                   variant="contained"
//                   startIcon={<Add />}
//                   onClick={() => navigate("/departments/create")}
//                 >
//                   Add Department
//                 </Button>
//               </Box>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>

//       {/* Departments Table */}
//       <Card>
//         <CardHeader
//           title="Departments List"
//           subheader={`Showing ${filteredDepartments.length} of ${departments.length} departments`}
//         />
//         <CardContent>
//           <TableContainer>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>
//                     <Button
//                       size="small"
//                       onClick={() => handleSort("department_name")}
//                       startIcon={<Sort />}
//                       endIcon={
//                         sortField === "department_name" ? (
//                           sortDirection === "asc" ? (
//                             <ArrowUpward fontSize="small" />
//                           ) : (
//                             <ArrowDownward fontSize="small" />
//                           )
//                         ) : null
//                       }
//                     >
//                       Department
//                     </Button>
//                   </TableCell>
//                   <TableCell>
//                     <Button
//                       size="small"
//                       onClick={() => handleSort("college_name")}
//                       startIcon={<Sort />}
//                       endIcon={
//                         sortField === "college_name" ? (
//                           sortDirection === "asc" ? (
//                             <ArrowUpward fontSize="small" />
//                           ) : (
//                             <ArrowDownward fontSize="small" />
//                           )
//                         ) : null
//                       }
//                     >
//                       College
//                     </Button>
//                   </TableCell>
//                   <TableCell>Head</TableCell>
//                   <TableCell>
//                     <Button
//                       size="small"
//                       onClick={() => handleSort("staff_count")}
//                       startIcon={<Sort />}
//                       endIcon={
//                         sortField === "staff_count" ? (
//                           sortDirection === "asc" ? (
//                             <ArrowUpward fontSize="small" />
//                           ) : (
//                             <ArrowDownward fontSize="small" />
//                           )
//                         ) : null
//                       }
//                     >
//                       Staff
//                     </Button>
//                   </TableCell>
//                   <TableCell>Courses</TableCell>
//                   <TableCell>
//                     <Button
//                       size="small"
//                       onClick={() => handleSort("status")}
//                       startIcon={<Sort />}
//                       endIcon={
//                         sortField === "status" ? (
//                           sortDirection === "asc" ? (
//                             <ArrowUpward fontSize="small" />
//                           ) : (
//                             <ArrowDownward fontSize="small" />
//                           )
//                         ) : null
//                       }
//                     >
//                       Status
//                     </Button>
//                   </TableCell>
//                   <TableCell>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredDepartments.length > 0 ? (
//                   filteredDepartments.map((department) => (
//                     <TableRow key={department.department_id} hover>
//                       <TableCell>
//                         <Box sx={{ display: "flex", alignItems: "center" }}>
//                           <Avatar
//                             sx={{
//                               mr: 2,
//                               bgcolor:
//                                 department.status === "active"
//                                   ? "#e3f2fd"
//                                   : "#f5f5f5",
//                             }}
//                           >
//                             <School fontSize="small" />
//                           </Avatar>
//                           <Box>
//                             <Typography variant="subtitle2">
//                               {department.department_name}
//                             </Typography>
//                             <Typography
//                               variant="caption"
//                               color="text.secondary"
//                             >
//                               {department.department_code}
//                             </Typography>
//                           </Box>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2">
//                           {department.college_name}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary">
//                           {department.college_code}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         {department.head_username ? (
//                           <Box>
//                             <Typography variant="body2">
//                               {department.head_name || department.head_username}
//                             </Typography>
//                             <Typography
//                               variant="caption"
//                               color="text.secondary"
//                             >
//                               Head of Department
//                             </Typography>
//                           </Box>
//                         ) : (
//                           <Chip
//                             label="No Head Assigned"
//                             size="small"
//                             color="warning"
//                           />
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <Box sx={{ display: "flex", alignItems: "center" }}>
//                           <People
//                             sx={{ mr: 1, fontSize: 16, color: "info.main" }}
//                           />
//                           <Typography>{department.staff_count || 0}</Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Box sx={{ display: "flex", alignItems: "center" }}>
//                           <School
//                             sx={{ mr: 1, fontSize: 16, color: "warning.main" }}
//                           />
//                           <Typography>
//                             {department.course_count || 0}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={department.status}
//                           color={
//                             department.status === "active" ? "success" : "error"
//                           }
//                           size="small"
//                           onClick={() =>
//                             handleStatusChange(
//                               department.department_id,
//                               department.status === "active"
//                                 ? "inactive"
//                                 : "active"
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Box sx={{ display: "flex", gap: 1 }}>
//                           <Tooltip title="View Dashboard">
//                             <IconButton
//                               size="small"
//                               onClick={() =>
//                                 navigate(
//                                   `/departments/${department.department_id}/dashboard`
//                                 )
//                               }
//                             >
//                               <Visibility fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Edit">
//                             <IconButton
//                               size="small"
//                               onClick={() =>
//                                 navigate(
//                                   `/departments/${department.department_id}/edit`
//                                 )
//                               }
//                             >
//                               <Edit fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="More Actions">
//                             <IconButton
//                               size="small"
//                               onClick={(e) =>
//                                 handleActionMenuOpen(e, department)
//                               }
//                             >
//                               <MoreVert fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
//                       <Typography color="text.secondary">
//                         No departments found.{" "}
//                         {searchQuery && "Try a different search."}
//                       </Typography>
//                       {!searchQuery && (
//                         <Button
//                           variant="contained"
//                           startIcon={<Add />}
//                           onClick={() => navigate("/departments/create")}
//                           sx={{ mt: 2 }}
//                         >
//                           Create First Department
//                         </Button>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <TablePagination
//             rowsPerPageOptions={[5, 10, 25, 50]}
//             component="div"
//             count={departments.length}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={(e, newPage) => setPage(newPage)}
//             onRowsPerPageChange={(e) => {
//               setRowsPerPage(parseInt(e.target.value, 10));
//               setPage(0);
//             }}
//           />
//         </CardContent>
//       </Card>

//       {/* Action Menu */}
//       <Menu
//         anchorEl={actionMenuAnchor}
//         open={Boolean(actionMenuAnchor)}
//         onClose={handleActionMenuClose}
//       >
//         <MenuItem
//           onClick={() => {
//             if (selectedActionDepartment) {
//               navigate(
//                 `/departments/${selectedActionDepartment.department_id}/staff`
//               );
//             }
//             handleActionMenuClose();
//           }}
//         >
//           <ListItemIcon>
//             <People fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>View Staff</ListItemText>
//         </MenuItem>
//         <MenuItem
//           onClick={() => {
//             if (selectedActionDepartment) {
//               navigate(
//                 `/departments/${selectedActionDepartment.department_id}/courses`
//               );
//             }
//             handleActionMenuClose();
//           }}
//         >
//           <ListItemIcon>
//             <School fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>View Courses</ListItemText>
//         </MenuItem>
//         <MenuItem
//           onClick={() => {
//             if (selectedActionDepartment) {
//               navigate(
//                 `/departments/${selectedActionDepartment.department_id}/workloads`
//               );
//             }
//             handleActionMenuClose();
//           }}
//         >
//           <ListItemIcon>
//             <Assignment fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>View Workloads</ListItemText>
//         </MenuItem>
//         <Divider />
//         <MenuItem
//           onClick={() => {
//             if (selectedActionDepartment) {
//               navigate(
//                 `/departments/${selectedActionDepartment.department_id}/reports`
//               );
//             }
//             handleActionMenuClose();
//           }}
//         >
//           <ListItemIcon>
//             <Print fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>Generate Report</ListItemText>
//         </MenuItem>
//         <MenuItem
//           onClick={() => {
//             if (selectedActionDepartment) {
//               // Handle duplicate
//               console.log("Duplicate:", selectedActionDepartment);
//             }
//             handleActionMenuClose();
//           }}
//         >
//           <ListItemIcon>
//             <ContentCopy fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>Duplicate</ListItemText>
//         </MenuItem>
//         <MenuItem
//           onClick={() => {
//             if (selectedActionDepartment) {
//               // Handle archive
//               console.log("Archive:", selectedActionDepartment);
//             }
//             handleActionMenuClose();
//           }}
//         >
//           <ListItemIcon>
//             <Archive fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>Archive</ListItemText>
//         </MenuItem>
//         <Divider />
//         <MenuItem
//           onClick={() => {
//             if (selectedActionDepartment) {
//               setSelectedDepartment(selectedActionDepartment);
//               setDeleteDialogOpen(true);
//             }
//             handleActionMenuClose();
//           }}
//           sx={{ color: "error.main" }}
//         >
//           <ListItemIcon sx={{ color: "error.main" }}>
//             <Delete fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>Delete</ListItemText>
//         </MenuItem>
//       </Menu>

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteDialogOpen}
//         onClose={() => setDeleteDialogOpen(false)}
//       >
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to delete{" "}
//             <strong>{selectedDepartment?.department_name}</strong>?
//           </Typography>
//           <Alert severity="warning" sx={{ mt: 2 }}>
//             This action cannot be undone. All related data (staff, courses,
//             workloads) will be affected.
//           </Alert>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
//           <Button onClick={handleDelete} color="error" variant="contained">
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default DepartmentList;
