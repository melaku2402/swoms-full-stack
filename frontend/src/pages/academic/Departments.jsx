// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   Users,
//   Building,
//   GraduationCap,
// } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";
// import { academicAPI } from "../../api/academic";
// import EnhancedTable from "../../components/common/EnhancedTable";
// import Modal from "../../components/common/Modal";
// import ConfirmDialog from "../../components/common/ConfirmDialog";
// import DepartmentForm from "../../components/features/academic/DepartmentForm";
// import toast from "react-hot-toast";

// const Departments = () => {
//   const { user } = useAuth();
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [selectedDepartment, setSelectedDepartment] = useState(null);
//   const [formLoading, setFormLoading] = useState(false);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 0,
//     from: 1,
//     to: 10,
//   });

//   const columns = [
//     {
//       key: "department_code",
//       title: "Department",
//       sortable: true,
//       render: (value, row) => (
//         <div className="flex items-center">
//           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
//             <Users className="h-4 w-4 text-blue-600" />
//           </div>
//           <div>
//             <div className="font-medium text-gray-900">{value}</div>
//             <div className="text-sm text-gray-500">{row.department_name}</div>
//             <div className="text-xs text-gray-400">
//               College: {row.college?.college_name}
//             </div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "college",
//       title: "College",
//       sortable: true,
//       render: (value, row) => row.college?.college_name || "-",
//     },
//     {
//       key: "head",
//       title: "Department Head",
//       render: (value, row) => (
//         <div>
//           {row.head_user_id ? (
//             <div className="text-sm">
//               <div className="font-medium">Dr. Sarah Johnson</div>
//               <div className="text-gray-500">Head since 2022</div>
//             </div>
//           ) : (
//             <span className="text-gray-400">Not assigned</span>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "stats",
//       title: "Statistics",
//       render: (value, row) => (
//         <div className="flex space-x-4 text-sm">
//           <div className="text-center">
//             <div className="font-semibold text-blue-600">24</div>
//             <div className="text-gray-500">Staff</div>
//           </div>
//           <div className="text-center">
//             <div className="font-semibold text-green-600">8</div>
//             <div className="text-gray-500">Courses</div>
//           </div>
//           <div className="text-center">
//             <div className="font-semibold text-purple-600">3</div>
//             <div className="text-gray-500">Programs</div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "status",
//       title: "Status",
//       render: (value) => (
//         <span
//           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//             value === "active"
//               ? "bg-green-100 text-green-800"
//               : "bg-gray-100 text-gray-800"
//           }`}
//         >
//           {value === "active" ? "Active" : "Inactive"}
//         </span>
//       ),
//     },
//   ];

//   useEffect(() => {
//     fetchDepartments();
//   }, [pagination.page]);

//   const fetchDepartments = async (page = pagination.page) => {
//     try {
//       setLoading(true);
//       const response = await academicAPI.getDepartments({
//         page,
//         limit: pagination.limit,
//         include_college: true,
//       });

//       setDepartments(response.departments || response);

//       if (response.pagination) {
//         const { page, limit, total, pages } = response.pagination;
//         setPagination((prev) => ({
//           ...prev,
//           page,
//           limit,
//           total,
//           pages,
//           from: (page - 1) * limit + 1,
//           to: Math.min(page * limit, total),
//         }));
//       }
//     } catch (error) {
//       toast.error("Failed to load departments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = () => {
//     setSelectedDepartment(null);
//     setShowForm(true);
//   };

//   const handleEdit = (department) => {
//     setSelectedDepartment(department);
//     setShowForm(true);
//   };

//   const handleView = (department) => {
//     // Navigate to department detail page
//     console.log("View department:", department);
//   };

//   const handleDelete = (department) => {
//     setSelectedDepartment(department);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (!selectedDepartment) return;

//     try {
//       setFormLoading(true);
//       await academicAPI.deleteDepartment(selectedDepartment.department_id);
//       toast.success("Department deleted successfully");
//       fetchDepartments();
//     } catch (error) {
//       toast.error("Failed to delete department");
//     } finally {
//       setFormLoading(false);
//       setShowDeleteDialog(false);
//       setSelectedDepartment(null);
//     }
//   };

//   const handleFormSubmit = async (data) => {
//     try {
//       setFormLoading(true);
//       if (selectedDepartment) {
//         await academicAPI.updateDepartment(
//           selectedDepartment.department_id,
//           data
//         );
//         toast.success("Department updated successfully");
//       } else {
//         await academicAPI.createDepartment(data);
//         toast.success("Department created successfully");
//       }
//       setShowForm(false);
//       fetchDepartments();
//     } catch (error) {
//       toast.error(error.message || "Operation failed");
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const rowActions = (row) => (
//     <>
//       <Link
//         to={`/academic/departments/${row.department_id}`}
//         className="p-1 text-blue-600 hover:bg-blue-50 rounded"
//         title="View Details"
//       >
//         <Eye size={16} />
//       </Link>
//       <button
//         onClick={() => handleEdit(row)}
//         className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
//         title="Edit"
//       >
//         <Edit size={16} />
//       </button>
//       <button
//         onClick={() => handleDelete(row)}
//         className="p-1 text-red-600 hover:bg-red-50 rounded"
//         title="Delete"
//       >
//         <Trash2 size={16} />
//       </button>
//     </>
//   );

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 flex items-center">
//             <Users className="mr-2" />
//             Departments Management
//           </h1>
//           <p className="text-gray-600">
//             Manage academic departments and assign department heads
//           </p>
//         </div>
//         <button
//           onClick={handleCreate}
//           className="btn-primary flex items-center"
//         >
//           <Plus size={20} className="mr-2" />
//           Add Department
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="card hover:shadow-lg transition-shadow">
//           <div className="flex items-center">
//             <div className="p-3 bg-blue-100 rounded-lg">
//               <Users className="h-8 w-8 text-blue-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm text-gray-500">Total Departments</p>
//               <p className="text-2xl font-semibold">{pagination.total}</p>
//             </div>
//           </div>
//         </div>

//         <div className="card hover:shadow-lg transition-shadow">
//           <div className="flex items-center">
//             <div className="p-3 bg-green-100 rounded-lg">
//               <GraduationCap className="h-8 w-8 text-green-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm text-gray-500">Academic Staff</p>
//               <p className="text-2xl font-semibold">156</p>
//             </div>
//           </div>
//         </div>

//         <div className="card hover:shadow-lg transition-shadow">
//           <div className="flex items-center">
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <Building className="h-8 w-8 text-purple-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm text-gray-500">Colleges</p>
//               <p className="text-2xl font-semibold">12</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Departments Table */}
//       <EnhancedTable
//         columns={columns}
//         data={departments}
//         loading={loading}
//         pagination={pagination}
//         onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
//         onRowClick={handleView}
//         rowActions={rowActions}
//         onRefresh={() => fetchDepartments()}
//         showExport={true}
//         searchPlaceholder="Search departments..."
//       />

//       {/* Department Form Modal */}
//       <Modal
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         title={selectedDepartment ? "Edit Department" : "Create New Department"}
//         size="lg"
//       >
//         <DepartmentForm
//           initialData={selectedDepartment}
//           onSubmit={handleFormSubmit}
//           onCancel={() => setShowForm(false)}
//           loading={formLoading}
//         />
//       </Modal>

//       {/* Delete Confirmation Dialog */}
//       <ConfirmDialog
//         isOpen={showDeleteDialog}
//         onClose={() => setShowDeleteDialog(false)}
//         onConfirm={handleConfirmDelete}
//         title="Delete Department"
//         message={`Are you sure you want to delete "${selectedDepartment?.department_name}"? This will also remove all associated courses and programs.`}
//         type="danger"
//         confirmText="Delete"
//         destructive={true}
//         loading={formLoading}
//       />
//     </div>
//   );
// };

// export default Departments;

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardActions,
  CardHeader,
  TablePagination,
  Switch,
  FormControlLabel,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import {
  People,
  School,
  Assignment,
  TrendingUp,
  Download,
  Refresh,
  Edit,
  Delete,
  Add,
  Search,
  FilterList,
  MoreVert,
  CalendarToday,
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  Group,
  Subject,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  Dashboard as DashboardIcon,
  Home,
  ViewList,
  ViewModule,
  CloudDownload,
  CloudUpload,
  Print,
  Share,
  Visibility,
  CheckCircle,
  Warning,
  Error,
  Info,
  ArrowUpward,
  ArrowDownward,
  ArrowForward,
  ChevronRight,
} from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import departmentApi from "../../api";
import {
  // BarChart,
  Bar,
  // PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
// import DepartmentList from "../../components/ui/DepartmentList";
const Departments
 = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState(null);
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [timeRange, setTimeRange] = useState("current_semester");
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch Data Function
  const fetchDepartmentData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel for better performance
      const [dashboardResponse, statsResponse, staffResponse, coursesResponse] =
        await Promise.all([
          departmentApi.getDepartmentDashboard(id, timeRange),
          departmentApi.getDepartmentStats(id, "detailed"),
          departmentApi.getDepartmentStaff(id, { page: 1, limit: 100 }),
          departmentApi.getDepartmentCourses(id),
        ]);

      setDashboardData(dashboardResponse.data);
      setStats(statsResponse.data);
      setStaff(staffResponse.data.staff || []);
      setFilteredStaff(staffResponse.data.staff || []);
      setCourses(coursesResponse.data.courses || []);
      setFilteredCourses(coursesResponse.data.courses || []);

      setSuccess("Data loaded successfully");
    } catch (err) {
      console.error("Error fetching department data:", err);
      setError(err.response?.data?.message || "Failed to load department data");
    } finally {
      setLoading(false);
    }
  }, [id, timeRange]);

  // Initial Load
  useEffect(() => {
    fetchDepartmentData();
  }, [fetchDepartmentData, refreshKey]);

  // Search and Filter Functions
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = staff.filter(
        (member) =>
          member.first_name.toLowerCase().includes(query) ||
          member.last_name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.academic_rank.toLowerCase().includes(query) ||
          member.employee_id.toLowerCase().includes(query)
      );
      setFilteredStaff(filtered);

      const filteredCoursesList = courses.filter(
        (course) =>
          course.course_code.toLowerCase().includes(query) ||
          course.course_title.toLowerCase().includes(query)
      );
      setFilteredCourses(filteredCoursesList);
    } else {
      setFilteredStaff(staff);
      setFilteredCourses(courses);
    }
  }, [searchQuery, staff, courses]);

  // Handle Export
  const handleExport = async () => {
    try {
      const response = await departmentApi.exportDepartmentData(
        id,
        exportFormat
      );

      if (exportFormat === "csv") {
        // Create and download CSV file
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `department-${id}-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Download JSON file
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `department-${id}-${new Date().toISOString().split("T")[0]}.json`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      setSuccess(`Data exported successfully as ${exportFormat.toUpperCase()}`);
      setExportDialogOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export data");
    }
  };

  // Handle Staff Selection
  const handleStaffClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setStaffDialogOpen(true);
  };

  // Handle Course Selection
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCourseDialogOpen(true);
  };

  // Handle Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format Rank Name
  const formatRankName = (rank) => {
    const rankMap = {
      graduate_assistant: "Graduate Assistant",
      assistant_lecturer: "Assistant Lecturer",
      lecturer: "Lecturer",
      assistant_professor: "Assistant Professor",
      associate_professor: "Associate Professor",
      professor: "Professor",
    };
    return rankMap[rank] || rank;
  };

  // Format Employment Type
  const formatEmploymentType = (type) => {
    const typeMap = {
      full_time: "Full Time",
      part_time: "Part Time",
      contract: "Contract",
    };
    return typeMap[type] || type;
  };

  // Get Status Color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  // Prepare Chart Data
  const prepareStaffByRankData = () => {
    if (!dashboardData?.staff_by_rank) return [];

    const COLORS = [
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#8884D8",
      "#82CA9D",
    ];

    return Object.entries(dashboardData.staff_by_rank).map(
      ([rank, count], index) => ({
        name: formatRankName(rank),
        value: count,
        color: COLORS[index % COLORS.length],
      })
    );
  };

  const prepareWorkloadStatusData = () => {
    if (!dashboardData?.workload_status) return [];

    return [
      {
        name: "Draft",
        value: dashboardData.workload_status.draft || 0,
        color: "#FFA500",
      },
      {
        name: "Submitted",
        value: dashboardData.workload_status.submitted || 0,
        color: "#0088FE",
      },
      {
        name: "Approved",
        value: dashboardData.workload_status.approved || 0,
        color: "#00C49F",
      },
      {
        name: "Rejected",
        value: dashboardData.workload_status.rejected || 0,
        color: "#FF4444",
      },
    ];
  };

  const prepareMonthlyTrendData = () => {
    if (!dashboardData?.monthly_trend) return [];

    return Object.entries(dashboardData.monthly_trend).map(
      ([month, count]) => ({
        month,
        workloads: count,
      })
    );
  };

  if (loading && !dashboardData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Department Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => setRefreshKey((prev) => prev + 1)}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <MuiLink
              component={Link}
              to="/dashboard"
              color="inherit"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="small" />
              Dashboard
            </MuiLink>
            <MuiLink
              component={Link}
              to="/departments"
              color="inherit"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Group sx={{ mr: 0.5 }} fontSize="small" />
              Departments
            </MuiLink>
            <Typography
              color="text.primary"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ChevronRight sx={{ mr: 0.5 }} fontSize="small" />
              {stats?.department_name || "Department Dashboard"}
            </Typography>
          </Breadcrumbs>

          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Department Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {stats?.department_name} • {stats?.college_name} •{" "}
                {stats?.department_code}
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: "flex", gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    label="Time Range"
                  >
                    <MenuItem value="current_semester">
                      Current Semester
                    </MenuItem>
                    <MenuItem value="current_year">Current Year</MenuItem>
                    <MenuItem value="last_6_months">Last 6 Months</MenuItem>
                    <MenuItem value="last_year">Last Year</MenuItem>
                  </Select>
                </FormControl>

                <Tooltip title="Refresh Data">
                  <IconButton
                    color="primary"
                    onClick={() => setRefreshKey((prev) => prev + 1)}
                    sx={{ border: "1px solid #e0e0e0" }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Export Data">
                  <IconButton
                    color="primary"
                    onClick={() => setExportDialogOpen(true)}
                    sx={{ border: "1px solid #e0e0e0" }}
                  >
                    <CloudDownload />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/departments/create")}
                  sx={{ ml: 1 }}
                >
                  Add Staff
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Notifications */}
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

        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                borderLeft: "4px solid #2196f3",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "#e3f2fd", mr: 2 }}>
                    <People sx={{ color: "#2196f3" }} />
                  </Avatar>
                  <Typography color="textSecondary" variant="body2">
                    TOTAL STAFF
                  </Typography>
                </Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  {stats?.total_staff || 0}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ArrowUpward
                    sx={{ color: "success.main", fontSize: 16, mr: 0.5 }}
                  />
                  <Typography variant="body2" color="success.main">
                    {stats?.full_time_staff || 0} Full-time
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ backgroundColor: "#fafafa", p: 2 }}>
                <Button
                  size="small"
                  startIcon={<Group />}
                  onClick={() => setTabValue(1)}
                >
                  View All Staff
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                borderLeft: "4px solid #4caf50",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "#e8f5e9", mr: 2 }}>
                    <School sx={{ color: "#4caf50" }} />
                  </Avatar>
                  <Typography color="textSecondary" variant="body2">
                    ACTIVE COURSES
                  </Typography>
                </Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  {stats?.active_courses || 0}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Subject
                    sx={{ color: "primary.main", fontSize: 16, mr: 0.5 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {stats?.core_courses || 0} Core courses
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ backgroundColor: "#fafafa", p: 2 }}>
                <Button
                  size="small"
                  startIcon={<Subject />}
                  onClick={() => setTabValue(2)}
                >
                  View Courses
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                borderLeft: "4px solid #ff9800",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "#fff3e0", mr: 2 }}>
                    <Assignment sx={{ color: "#ff9800" }} />
                  </Avatar>
                  <Typography color="textSecondary" variant="body2">
                    CURRENT WORKLOADS
                  </Typography>
                </Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  {dashboardData?.overview?.rp_workloads || 0}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Chip
                    label={`${
                      dashboardData?.workload_status?.approved || 0
                    } approved`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ backgroundColor: "#fafafa", p: 2 }}>
                <Button
                  size="small"
                  startIcon={<Assessment />}
                  onClick={() => navigate(`/departments/${id}/workloads`)}
                >
                  View Workloads
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                borderLeft: "4px solid #9c27b0",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "#f3e5f5", mr: 2 }}>
                    <TrendingUp sx={{ color: "#9c27b0" }} />
                  </Avatar>
                  <Typography color="textSecondary" variant="body2">
                    AVG. WORKLOAD
                  </Typography>
                </Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  {dashboardData?.summary?.avg_workload?.toFixed(1) || "0.0"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Max:{" "}
                    {dashboardData?.summary?.max_workload?.toFixed(1) || "0.0"}{" "}
                    hrs
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ backgroundColor: "#fafafa", p: 2 }}>
                <Button
                  size="small"
                  startIcon={<Timeline />}
                  onClick={() => setTabValue(3)}
                >
                  View Analytics
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Navigation */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<DashboardIcon />} label="Overview" />
            <Tab icon={<People />} label="Staff" />
            <Tab icon={<School />} label="Courses" />
            <Tab icon={<Assessment />} label="Analytics" />
            <Tab icon={<Timeline />} label="Reports" />
          </Tabs>
        </Card>

        {/* Tab Content */}
        <Box>
          {/* Tab 0: Overview */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Charts Section */}
              <Grid item xs={12} md={8}>
                <Card sx={{ height: "100%" }}>
                  <CardHeader
                    title="Workload Trend"
                    subheader="Monthly workload distribution"
                    action={
                      <IconButton>
                        <MoreVert />
                      </IconButton>
                    }
                  />
                  <CardContent sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={prepareMonthlyTrendData()}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="workloads"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Grid container spacing={3} direction="column">
                  <Grid item>
                    <Card>
                      <CardHeader
                        title="Staff Distribution"
                        subheader="By academic rank"
                      />
                      <CardContent sx={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareStaffByRankData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareStaffByRankData().map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item>
                    <Card>
                      <CardHeader
                        title="Workload Status"
                        subheader="Current semester"
                      />
                      <CardContent sx={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={prepareWorkloadStatusData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Recent Activities */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title="Recent Activities"
                    action={
                      <Button size="small" startIcon={<Refresh />}>
                        Refresh
                      </Button>
                    }
                  />
                  <CardContent>
                    {dashboardData?.recent_activities?.length > 0 ? (
                      <List>
                        {dashboardData.recent_activities
                          .slice(0, 5)
                          .map((activity, index) => (
                            <React.Fragment key={index}>
                              <ListItem>
                                <ListItemIcon>
                                  <Avatar sx={{ bgcolor: "#e3f2fd" }}>
                                    <Person />
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={activity.description}
                                  secondary={
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        activity.timestamp
                                      ).toLocaleString()}
                                    </Typography>
                                  }
                                />
                                <Chip
                                  label={activity.action}
                                  size="small"
                                  color={
                                    activity.action === "CREATE"
                                      ? "success"
                                      : activity.action === "UPDATE"
                                      ? "info"
                                      : activity.action === "DELETE"
                                      ? "error"
                                      : "default"
                                  }
                                />
                              </ListItem>
                              {index <
                                dashboardData.recent_activities.length - 1 && (
                                <Divider />
                              )}
                            </React.Fragment>
                          ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary" align="center" py={3}>
                        No recent activities
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Staff */}
          {tabValue === 1 && (
            <Card>
              <CardHeader
                title="Department Staff"
                subheader={`Total: ${staff.length} staff members`}
                action={
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      size="small"
                      placeholder="Search staff..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <Search sx={{ mr: 1, color: "text.secondary" }} />
                        ),
                      }}
                      sx={{ width: 250 }}
                    />
                    <Tooltip title="Grid View">
                      <IconButton
                        onClick={() => setViewMode("grid")}
                        color={viewMode === "grid" ? "primary" : "default"}
                      >
                        <ViewModule />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="List View">
                      <IconButton
                        onClick={() => setViewMode("list")}
                        color={viewMode === "list" ? "primary" : "default"}
                      >
                        <ViewList />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate("/staff/create")}
                    >
                      Add Staff
                    </Button>
                  </Box>
                }
              />
              <CardContent>
                {viewMode === "list" ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Staff Member</TableCell>
                          <TableCell>Rank</TableCell>
                          <TableCell>Employment</TableCell>
                          <TableCell>Current Load</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredStaff
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((member) => (
                            <TableRow key={member.staff_id} hover>
                              <TableCell>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Avatar sx={{ mr: 2, bgcolor: "#e3f2fd" }}>
                                    {member.first_name?.[0]}
                                    {member.last_name?.[0]}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle2">
                                      {member.first_name} {member.last_name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {member.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatRankName(member.academic_rank)}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatEmploymentType(
                                    member.employment_type
                                  )}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography fontWeight="bold">
                                    {member.current_semester_load || 0} hrs
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {member.total_workloads || 0} total
                                    workloads
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    member.user_active ? "Active" : "Inactive"
                                  }
                                  size="small"
                                  color={
                                    member.user_active ? "success" : "error"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleStaffClick(member)}
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        navigate(
                                          `/staff/${member.staff_id}/edit`
                                        )
                                      }
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Assign Workload">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        navigate(
                                          `/staff/${member.staff_id}/workload`
                                        )
                                      }
                                    >
                                      <Assignment fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredStaff.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableContainer>
                ) : (
                  <Grid container spacing={3}>
                    {filteredStaff.map((member) => (
                      <Grid item xs={12} sm={6} md={4} key={member.staff_id}>
                        <Card sx={{ height: "100%" }}>
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  mr: 2,
                                  width: 56,
                                  height: 56,
                                  bgcolor: "#e3f2fd",
                                }}
                              >
                                {member.first_name?.[0]}
                                {member.last_name?.[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="h6">
                                  {member.first_name} {member.last_name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {member.employee_id}
                                </Typography>
                              </Box>
                            </Box>

                            <Grid container spacing={1} sx={{ mb: 2 }}>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Rank
                                </Typography>
                                <Typography variant="body2">
                                  {formatRankName(member.academic_rank)}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Type
                                </Typography>
                                <Typography variant="body2">
                                  {formatEmploymentType(member.employment_type)}
                                </Typography>
                              </Grid>
                            </Grid>

                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Current Workload
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(
                                    (member.current_semester_load || 0) * 10,
                                    100
                                  )}
                                  sx={{ flexGrow: 1 }}
                                />
                                <Typography variant="body2">
                                  {member.current_semester_load || 0} hrs
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Chip
                                label={
                                  member.user_active ? "Active" : "Inactive"
                                }
                                size="small"
                                color={member.user_active ? "success" : "error"}
                              />
                              <Box>
                                <Tooltip title="View">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStaffClick(member)}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      navigate(`/staff/${member.staff_id}/edit`)
                                    }
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab 2: Courses */}
          {tabValue === 2 && (
            <Card>
              <CardHeader
                title="Department Courses"
                subheader={`Total: ${courses.length} courses`}
                action={
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      size="small"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <Search sx={{ mr: 1, color: "text.secondary" }} />
                        ),
                      }}
                      sx={{ width: 250 }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate("/courses/create")}
                    >
                      Add Course
                    </Button>
                  </Box>
                }
              />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Course Code</TableCell>
                        <TableCell>Course Title</TableCell>
                        <TableCell>Credit Hours</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Sections</TableCell>
                        <TableCell>Students</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <TableRow key={course.course_id} hover>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {course.course_code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {course.course_title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${course.credit_hours} credits`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={course.program_type}
                              size="small"
                              color={
                                course.is_core_course ? "primary" : "default"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Typography>{course.section_count || 0}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {course.total_students || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={course.status}
                              size="small"
                              color={
                                course.status === "active" ? "success" : "error"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleCourseClick(course)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(
                                      `/courses/${course.course_id}/edit`
                                    )
                                  }
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Assign Section">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(
                                      `/courses/${course.course_id}/sections`
                                    )
                                  }
                                >
                                  <Group fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Analytics */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title="Department Analytics"
                    subheader="Comprehensive department insights"
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ height: "100%" }}>
                          <CardHeader title="Workload Distribution" />
                          <CardContent sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={prepareWorkloadStatusData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ height: "100%" }}>
                          <CardHeader title="Staff by Employment Type" />
                          <CardContent sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    {
                                      name: "Full Time",
                                      value: stats?.full_time_staff || 0,
                                    },
                                    {
                                      name: "Part Time",
                                      value: stats?.part_time_staff || 0,
                                    },
                                    {
                                      name: "Contract",
                                      value: stats?.contract_staff || 0,
                                    },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  <Cell fill="#0088FE" />
                                  <Cell fill="#00C49F" />
                                  <Cell fill="#FFBB28" />
                                </Pie>
                                <RechartsTooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 4: Reports */}
          {tabValue === 4 && (
            <Card>
              <CardHeader
                title="Department Reports"
                subheader="Generate and download reports"
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: "#e3f2fd",
                            width: 60,
                            height: 60,
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <Assessment sx={{ fontSize: 32, color: "#2196f3" }} />
                        </Avatar>
                        <Typography variant="h6" gutterBottom>
                          Workload Report
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          Detailed workload analysis for current semester
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() =>
                            navigate(`/departments/${id}/reports/workload`)
                          }
                          fullWidth
                        >
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: "#e8f5e9",
                            width: 60,
                            height: 60,
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <People sx={{ fontSize: 32, color: "#4caf50" }} />
                        </Avatar>
                        <Typography variant="h6" gutterBottom>
                          Staff Report
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          Complete staff directory with workload information
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() =>
                            navigate(`/departments/${id}/reports/staff`)
                          }
                          fullWidth
                        >
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: "#fff3e0",
                            width: 60,
                            height: 60,
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <School sx={{ fontSize: 32, color: "#ff9800" }} />
                        </Avatar>
                        <Typography variant="h6" gutterBottom>
                          Course Report
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          Course catalog with section and enrollment data
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() =>
                            navigate(`/departments/${id}/reports/courses`)
                          }
                          fullWidth
                        >
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Export Dialog */}
        <Dialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
        >
          <DialogTitle>Export Department Data</DialogTitle>
          <DialogContent>
            <Typography paragraph>
              Select the format you want to export the department data in:
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                label="Export Format"
              >
                <MenuItem value="json">JSON (Recommended)</MenuItem>
                <MenuItem value="csv">CSV (Spreadsheet)</MenuItem>
                <MenuItem value="excel">Excel (Coming Soon)</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ mt: 2 }}>
              The export will include: Department details, Staff list, Courses,
              and Statistics.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleExport}
              variant="contained"
              startIcon={<CloudDownload />}
            >
              Export
            </Button>
          </DialogActions>
        </Dialog>

        {/* Staff Detail Dialog */}
        <Dialog
          open={staffDialogOpen}
          onClose={() => setStaffDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedStaff && (
            <>
              <DialogTitle>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#e3f2fd" }}>
                    {selectedStaff.first_name?.[0]}
                    {selectedStaff.last_name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedStaff.first_name} {selectedStaff.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStaff.employee_id}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Personal Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Email"
                          secondary={selectedStaff.email}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Phone"
                          secondary={selectedStaff.phone || "Not provided"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Hire Date"
                          secondary={selectedStaff.hire_date || "Not provided"}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Professional Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Academic Rank"
                          secondary={formatRankName(
                            selectedStaff.academic_rank
                          )}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Employment Type"
                          secondary={formatEmploymentType(
                            selectedStaff.employment_type
                          )}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Current Workload"
                          secondary={`${
                            selectedStaff.current_semester_load || 0
                          } hours`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setStaffDialogOpen(false)}>Close</Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    navigate(`/staff/${selectedStaff.staff_id}/edit`)
                  }
                >
                  Edit Profile
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Course Detail Dialog */}
        <Dialog
          open={courseDialogOpen}
          onClose={() => setCourseDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedCourse && (
            <>
              <DialogTitle>
                <Typography variant="h6">
                  {selectedCourse.course_code} - {selectedCourse.course_title}
                </Typography>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Credit Hours
                    </Typography>
                    <Typography variant="body1">
                      {selectedCourse.credit_hours} credits
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Course Type
                    </Typography>
                    <Chip
                      label={
                        selectedCourse.is_core_course
                          ? "Core Course"
                          : "Elective"
                      }
                      color={
                        selectedCourse.is_core_course ? "primary" : "default"
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Program Type
                    </Typography>
                    <Typography variant="body1">
                      {selectedCourse.program_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedCourse.status}
                      color={
                        selectedCourse.status === "active" ? "success" : "error"
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedCourse.course_title}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCourseDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    navigate(`/courses/${selectedCourse.course_id}/edit`)
                  }
                >
                  Edit Course
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Departments
;