// // // // src/pages/dashboard/views/DepartmentHeadDashboard.jsx
// // // import React, { useState, useEffect, useCallback } from "react";
// // // import { useAuth } from "../../../contexts/AuthContext"
// // // import {
// // //   Building,
// // //   Users,
// // //   BookOpen,
// // //   Clock,
// // //   TrendingUp,
// // //   AlertCircle,
// // //   CheckCircle,
// // //   BarChart3,
// // //   Calendar,
// // //   FileText,
// // //   Target,
// // //   Award,
// // //   ChevronRight,
// // //   RefreshCw,
// // //   Filter,
// // //   Download,
// // //   Eye,
// // //   Edit,
// // //   Loader2,
// // //   FileSpreadsheet,
// // //   CheckSquare,
// // //   AlertTriangle,
// // //   PieChart,
// // //   CalendarDays,
// // //   UserCheck,
// // //   Layers,
// // //   TrendingDown,
// // //   Check,
// // //   X,
// // //   Search,
// // //   MoreVertical,
// // //   ArrowUpRight,
// // //   ArrowDownRight,
// // //   DollarSign,
// // //   ChartBar,
// // //   FolderOpen,
// // //   ClipboardCheck,
// // //   UserPlus,
// // //   Zap,
// // // } from "lucide-react";
// // // import { Link, useNavigate } from "react-router-dom";
// // // import toast from "react-hot-toast";
// // // import {
// // //   departmentAPI,
// // //   courseRequestAPI,
// // //   overloadDetectionAPI,
// // //   courseAssignmentAPI,
// // //   staffAPI,
// // //   workloadAPI,
// // // } from "../../../api";

// // // // Format number with commas
// // // const formatNumber = (num) => {
// // //   if (num === undefined || num === null) return "0";
// // //   return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// // // };

// // // // Format date
// // // const formatDate = (dateString) => {
// // //   if (!dateString) return "N/A";
// // //   return new Date(dateString).toLocaleDateString("en-US", {
// // //     month: "short",
// // //     day: "numeric",
// // //     year: "numeric",
// // //   });
// // // };

// // // const DepartmentHeadDashboard = () => {
// // //   const { user } = useAuth();
// // //   const navigate = useNavigate();

// // //   // State management
// // //   const [loading, setLoading] = useState(true);
// // //   const [refreshing, setRefreshing] = useState(false);
// // //   const [department, setDepartment] = useState(null);
// // //   const [stats, setStats] = useState({
// // //     totalStaff: 0,
// // //     totalCourses: 0,
// // //     assignedCourses: 0,
// // //     pendingAssignments: 0,
// // //     pendingApprovals: 0,
// // //     overloadAlerts: 0,
// // //     averageWorkload: 0,
// // //     completionRate: 0,
// // //     totalWorkloadHours: 0,
// // //     semester: "Spring 2024",
// // //     budgetUtilization: 0,
// // //     studentEnrollment: 0,
// // //   });

// // //   const [recentActivities, setRecentActivities] = useState([]);
// // //   const [pendingRequests, setPendingRequests] = useState([]);
// // //   const [overloadAlerts, setOverloadAlerts] = useState([]);
// // //   const [staffList, setStaffList] = useState([]);
// // //   const [assignments, setAssignments] = useState([]);
// // //   const [timeRange, setTimeRange] = useState("current_semester");
// // //   const [activeSemester, setActiveSemester] = useState(null);
// // //   const [workloadSummary, setWorkloadSummary] = useState(null);

// // //   // Fetch all department data
// // //   const fetchDepartmentData = useCallback(async () => {
// // //     if (!user?.department_id) {
// // //       toast.error("You are not assigned to a department");
// // //       navigate("/dashboard");
// // //       return;
// // //     }

// // //     try {
// // //       setLoading(true);
// // //       setRefreshing(true);

// // //       const departmentId = user.department_id;

// // //       // 1. Fetch department details
// // //       const deptResponse = await departmentAPI.getDepartmentById(departmentId);
// // //       setDepartment(deptResponse.data);

// // //       // 2. Fetch department dashboard stats
// // //       const dashboardResponse = await departmentAPI.getDepartmentDashboard(
// // //         departmentId,
// // //         timeRange
// // //       );
// // //       const dashboardData = dashboardResponse.data;
// // //       setStats({
// // //         totalStaff: dashboardData.total_staff || 0,
// // //         totalCourses: dashboardData.total_courses || 0,
// // //         assignedCourses: dashboardData.assigned_courses || 0,
// // //         pendingAssignments: dashboardData.pending_assignments || 0,
// // //         pendingApprovals: dashboardData.pending_approvals || 0,
// // //         overloadAlerts: dashboardData.overload_alerts || 0,
// // //         averageWorkload: dashboardData.average_workload || 0,
// // //         completionRate: dashboardData.completion_rate || 0,
// // //         totalWorkloadHours: dashboardData.total_workload_hours || 0,
// // //         semester: dashboardData.semester || "Spring 2024",
// // //         budgetUtilization: dashboardData.budget_utilization || 0,
// // //         studentEnrollment: dashboardData.student_enrollment || 0,
// // //       });

// // //       // 3. Fetch recent activities
// // //       const activitiesResponse = await departmentAPI.getDepartmentActivities(
// // //         departmentId
// // //       );
// // //       setRecentActivities(activitiesResponse.data || []);

// // //       // 4. Fetch pending course requests
// // //       const requestsResponse = await courseRequestAPI.getPendingRequests({
// // //         department_id: departmentId,
// // //       });
// // //       setPendingRequests(requestsResponse.data || []);

// // //       // 5. Fetch overload alerts
// // //       const overloadResponse =
// // //         await overloadDetectionAPI.checkDepartmentOverload(
// // //           departmentId,
// // //           activeSemester?.semester_id
// // //         );
// // //       setOverloadAlerts(overloadResponse.data?.overloaded_staff || []);

// // //       // 6. Fetch department staff
// // //       const staffResponse = await departmentAPI.getDepartmentStaff(
// // //         departmentId
// // //       );
// // //       setStaffList(staffResponse.data || []);

// // //       // 7. Fetch assignments
// // //       const assignmentsResponse =
// // //         await courseAssignmentAPI.getDepartmentAssignments({
// // //           department_id: departmentId,
// // //           status: "pending",
// // //         });
// // //       setAssignments(assignmentsResponse.data || []);

// // //       // 8. Fetch workload summary
// // //       const workloadResponse = await departmentAPI.getDepartmentWorkloadSummary(
// // //         departmentId
// // //       );
// // //       setWorkloadSummary(workloadResponse.data);

// // //       // 9. Get active semester
// // //       try {
// // //         const semesterResponse = await api.get("/api/semesters/active");
// // //         setActiveSemester(semesterResponse.data);
// // //       } catch (error) {
// // //         console.warn("Could not fetch active semester:", error);
// // //       }

// // //       toast.success("Dashboard data loaded successfully");
// // //     } catch (error) {
// // //       console.error("Error fetching department data:", error);
// // //       toast.error(
// // //         error.response?.data?.message || "Failed to load department dashboard"
// // //       );
// // //     } finally {
// // //       setLoading(false);
// // //       setRefreshing(false);
// // //     }
// // //   }, [user?.department_id, timeRange, activeSemester, navigate]);

// // //   // Initial data fetch
// // //   useEffect(() => {
// // //     if (user?.department_id) {
// // //       fetchDepartmentData();
// // //     }
// // //   }, [user?.department_id, fetchDepartmentData]);

// // //   // Handle refresh
// // //   const handleRefresh = () => {
// // //     setRefreshing(true);
// // //     fetchDepartmentData();
// // //   };

// // //   // Handle approve request
// // //   const handleApproveRequest = async (requestId) => {
// // //     try {
// // //       await courseRequestAPI.approveRequest(
// // //         requestId,
// // //         "Approved by Department Head"
// // //       );
// // //       toast.success("Request approved successfully");
// // //       fetchDepartmentData(); // Refresh data
// // //     } catch (error) {
// // //       console.error("Error approving request:", error);
// // //       toast.error(error.response?.data?.message || "Failed to approve request");
// // //     }
// // //   };

// // //   // Handle reject request
// // //   const handleRejectRequest = async (requestId) => {
// // //     try {
// // //       await courseRequestAPI.rejectRequest(
// // //         requestId,
// // //         "Rejected by Department Head"
// // //       );
// // //       toast.success("Request rejected");
// // //       fetchDepartmentData(); // Refresh data
// // //     } catch (error) {
// // //       console.error("Error rejecting request:", error);
// // //       toast.error(error.response?.data?.message || "Failed to reject request");
// // //     }
// // //   };

// // //   // Handle export report
// // //   const handleExportReport = async (reportType = "dashboard") => {
// // //     try {
// // //       const response = await departmentAPI.exportDepartmentReport(
// // //         user.department_id,
// // //         reportType
// // //       );

// // //       // Create download link
// // //       const url = window.URL.createObjectURL(new Blob([response.data]));
// // //       const link = document.createElement("a");
// // //       link.href = url;
// // //       link.setAttribute(
// // //         "download",
// // //         `${department?.department_name}-report-${
// // //           new Date().toISOString().split("T")[0]
// // //         }.pdf`
// // //       );
// // //       document.body.appendChild(link);
// // //       link.click();
// // //       link.remove();

// // //       toast.success("Report exported successfully");
// // //     } catch (error) {
// // //       console.error("Error exporting report:", error);
// // //       toast.error("Failed to export report");
// // //     }
// // //   };

// // //   // Handle view staff details
// // //   const handleViewStaffDetails = (staffId) => {
// // //     navigate(`/department/staff/${staffId}`);
// // //   };

// // //   // Handle view overload details
// // //   const handleViewOverloadDetails = (staffId) => {
// // //     navigate(`/overload/dept/staff/${staffId}`);
// // //   };

// // //   // Handle view assignment details
// // //   const handleViewAssignment = (assignmentId) => {
// // //     navigate(`/workload/dept/assignments/${assignmentId}`);
// // //   };

// // //   // Handle approve assignment
// // //   const handleApproveAssignment = async (assignmentId) => {
// // //     try {
// // //       await courseAssignmentAPI.acceptAssignment(assignmentId);
// // //       toast.success("Assignment approved");
// // //       fetchDepartmentData();
// // //     } catch (error) {
// // //       console.error("Error approving assignment:", error);
// // //       toast.error("Failed to approve assignment");
// // //     }
// // //   };

// // //   // Handle withdraw assignment
// // //   const handleWithdrawAssignment = async (assignmentId) => {
// // //     try {
// // //       await courseAssignmentAPI.withdrawAssignment(
// // //         assignmentId,
// // //         "Withdrawn by Department Head"
// // //       );
// // //       toast.success("Assignment withdrawn");
// // //       fetchDepartmentData();
// // //     } catch (error) {
// // //       console.error("Error withdrawing assignment:", error);
// // //       toast.error("Failed to withdraw assignment");
// // //     }
// // //   };

// // //   // Loading state
// // //   if (loading) {
// // //     return (
// // //       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
// // //         <div className="relative">
// // //           <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
// // //           <div className="absolute inset-0 flex items-center justify-center">
// // //             <Building className="h-8 w-8 text-blue-400" />
// // //           </div>
// // //         </div>
// // //         <div className="text-center">
// // //           <p className="text-lg font-semibold text-gray-700">
// // //             Loading Department Dashboard
// // //           </p>
// // //           <p className="text-sm text-gray-500 mt-2">
// // //             Fetching data for {department?.department_name || "your department"}
// // //             ...
// // //           </p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="space-y-6 animate-fadeIn">
// // //       {/* Header with Department Info */}
// // //       <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 shadow-xl">
// // //         <div className="flex flex-col md:flex-row md:items-center justify-between">
// // //           <div className="flex-1">
// // //             <div className="flex items-start space-x-4 mb-4">
// // //               <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
// // //                 <Building className="h-10 w-10" />
// // //               </div>
// // //               <div className="flex-1">
// // //                 <div className="flex items-center space-x-3 mb-2">
// // //                   <h1 className="text-3xl font-bold tracking-tight">
// // //                     {department?.department_name || "Department Dashboard"}
// // //                   </h1>
// // //                   <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium border border-amber-500/30">
// // //                     Department Head
// // //                   </span>
// // //                 </div>
// // //                 <p className="text-blue-200 text-lg">
// // //                   {department?.college_name || "College"} •{" "}
// // //                   <span className="font-semibold">{stats.semester}</span>
// // //                 </p>
// // //                 <div className="flex flex-wrap items-center gap-4 mt-4">
// // //                   <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
// // //                     <CalendarDays className="h-4 w-4 text-amber-400" />
// // //                     <span>AY: 2024-2025</span>
// // //                   </div>
// // //                   <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
// // //                     <Clock className="h-4 w-4 text-emerald-400" />
// // //                     <span>Semester: I</span>
// // //                   </div>
// // //                   <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
// // //                     <UserCheck className="h-4 w-4 text-cyan-400" />
// // //                     <span>Active Staff: {formatNumber(stats.totalStaff)}</span>
// // //                   </div>
// // //                   <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
// // //                     <BookOpen className="h-4 w-4 text-purple-400" />
// // //                     <span>Courses: {formatNumber(stats.totalCourses)}</span>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>
// // //           <div className="mt-4 md:mt-0 flex flex-col space-y-3">
// // //             <button
// // //               onClick={() => handleExportReport("dashboard")}
// // //               className="flex items-center justify-center space-x-2 px-5 py-3 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
// // //             >
// // //               <FileSpreadsheet className="h-5 w-5" />
// // //               <span>Export Dashboard</span>
// // //             </button>
// // //             <button
// // //               onClick={() => navigate("/department/reports")}
// // //               className="flex items-center justify-center space-x-2 px-5 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium border border-white/30"
// // //             >
// // //               <ChartBar className="h-5 w-5" />
// // //               <span>View All Reports</span>
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Action Bar */}
// // //       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
// // //         <div className="flex items-center space-x-4">
// // //           <div className="relative">
// // //             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
// // //             <select
// // //               value={timeRange}
// // //               onChange={(e) => {
// // //                 setTimeRange(e.target.value);
// // //                 fetchDepartmentData();
// // //               }}
// // //               className="pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
// // //             >
// // //               <option value="current_semester">Current Semester</option>
// // //               <option value="last_semester">Last Semester</option>
// // //               <option value="academic_year">Academic Year</option>
// // //               <option value="custom">Custom Range</option>
// // //             </select>
// // //           </div>
// // //           <button
// // //             onClick={handleRefresh}
// // //             disabled={refreshing}
// // //             className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// // //           >
// // //             <RefreshCw
// // //               className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
// // //             />
// // //             <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
// // //           </button>
// // //         </div>
// // //         <div className="flex items-center space-x-3">
// // //           {stats.pendingApprovals > 0 && (
// // //             <Link
// // //               to="/approvals/pending"
// // //               className="flex items-center space-x-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
// // //             >
// // //               <CheckSquare className="h-4 w-4" />
// // //               <span className="font-medium">
// // //                 Pending Approvals ({formatNumber(stats.pendingApprovals)})
// // //               </span>
// // //               <AlertTriangle className="h-4 w-4 animate-pulse" />
// // //             </Link>
// // //           )}
// // //           {stats.overloadAlerts > 0 && (
// // //             <Link
// // //               to="/overload/dept/alerts"
// // //               className="flex items-center space-x-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
// // //             >
// // //               <AlertTriangle className="h-4 w-4" />
// // //               <span className="font-medium">
// // //                 Overload Alerts ({formatNumber(stats.overloadAlerts)})
// // //               </span>
// // //             </Link>
// // //           )}
// // //           <Link
// // //             to="/workload/dept/assignments"
// // //             className="flex items-center space-x-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
// // //           >
// // //             <ClipboardCheck className="h-4 w-4" />
// // //             <span>Manage Assignments</span>
// // //           </Link>
// // //         </div>
// // //       </div>

// // //       {/* Main Stats Grid */}
// // //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// // //         {/* Staff Card */}
// // //         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-300">
// // //           <div className="flex items-center justify-between mb-4">
// // //             <div className="flex items-center space-x-3">
// // //               <div className="p-3 bg-blue-50 rounded-lg">
// // //                 <Users className="h-6 w-6 text-blue-600" />
// // //               </div>
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-600">
// // //                   Department Staff
// // //                 </p>
// // //                 <p className="text-2xl font-bold text-gray-900 mt-1">
// // //                   {formatNumber(stats.totalStaff)}
// // //                 </p>
// // //               </div>
// // //             </div>
// // //             <div className="text-green-600 flex items-center text-sm">
// // //               <TrendingUp className="h-4 w-4 mr-1" />
// // //               <span>Active</span>
// // //             </div>
// // //           </div>
// // //           <div className="space-y-2">
// // //             <div className="flex justify-between text-sm">
// // //               <span className="text-gray-500">Professors</span>
// // //               <span className="font-medium">
// // //                 {
// // //                   staffList.filter((s) => s.academic_rank === "professor")
// // //                     .length
// // //                 }
// // //               </span>
// // //             </div>
// // //             <div className="flex justify-between text-sm">
// // //               <span className="text-gray-500">Lecturers</span>
// // //               <span className="font-medium">
// // //                 {staffList.filter((s) => s.academic_rank === "lecturer").length}
// // //               </span>
// // //             </div>
// // //           </div>
// // //           <Link
// // //             to="/department/staff"
// // //             className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group"
// // //           >
// // //             View Staff Directory
// // //             <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
// // //           </Link>
// // //         </div>

// // //         {/* Courses Card */}
// // //         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-green-300">
// // //           <div className="flex items-center justify-between mb-4">
// // //             <div className="flex items-center space-x-3">
// // //               <div className="p-3 bg-green-50 rounded-lg">
// // //                 <BookOpen className="h-6 w-6 text-green-600" />
// // //               </div>
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-600">
// // //                   Course Assignments
// // //                 </p>
// // //                 <p className="text-2xl font-bold text-gray-900 mt-1">
// // //                   {formatNumber(stats.assignedCourses)}/
// // //                   {formatNumber(stats.totalCourses)}
// // //                 </p>
// // //               </div>
// // //             </div>
// // //             <div
// // //               className={`text-sm flex items-center ${
// // //                 stats.pendingAssignments > 0
// // //                   ? "text-amber-600"
// // //                   : "text-green-600"
// // //               }`}
// // //             >
// // //               {stats.pendingAssignments > 0 ? (
// // //                 <>
// // //                   <AlertCircle className="h-4 w-4 mr-1" />
// // //                   <span>{formatNumber(stats.pendingAssignments)} pending</span>
// // //                 </>
// // //               ) : (
// // //                 <>
// // //                   <CheckCircle className="h-4 w-4 mr-1" />
// // //                   <span>Complete</span>
// // //                 </>
// // //               )}
// // //             </div>
// // //           </div>
// // //           <div className="space-y-2">
// // //             <div className="flex justify-between text-sm">
// // //               <span className="text-gray-500">Assigned</span>
// // //               <span className="font-medium text-green-600">
// // //                 {formatNumber(stats.assignedCourses)}
// // //               </span>
// // //             </div>
// // //             <div className="flex justify-between text-sm">
// // //               <span className="text-gray-500">Unassigned</span>
// // //               <span className="font-medium text-amber-600">
// // //                 {formatNumber(stats.totalCourses - stats.assignedCourses)}
// // //               </span>
// // //             </div>
// // //           </div>
// // //           <Link
// // //             to="/workload/dept/assignments"
// // //             className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group"
// // //           >
// // //             Manage Assignments
// // //             <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
// // //           </Link>
// // //         </div>

// // //         {/* Workload Card */}
// // //         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-purple-300">
// // //           <div className="flex items-center justify-between mb-4">
// // //             <div className="flex items-center space-x-3">
// // //               <div className="p-3 bg-purple-50 rounded-lg">
// // //                 <Clock className="h-6 w-6 text-purple-600" />
// // //               </div>
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-600">
// // //                   Workload Hours
// // //                 </p>
// // //                 <p className="text-2xl font-bold text-gray-900 mt-1">
// // //                   {formatNumber(stats.totalWorkloadHours)}h
// // //                 </p>
// // //               </div>
// // //             </div>
// // //             <div
// // //               className={`text-sm ${
// // //                 stats.averageWorkload > 15 ? "text-red-600" : "text-green-600"
// // //               }`}
// // //             >
// // //               Avg: {stats.averageWorkload}h/staff
// // //             </div>
// // //           </div>
// // //           <div className="mb-3">
// // //             <div className="flex justify-between text-sm mb-1">
// // //               <span className="text-gray-500">Utilization</span>
// // //               <span className="font-medium">{stats.completionRate}%</span>
// // //             </div>
// // //             <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
// // //               <div
// // //                 className={`h-full ${
// // //                   stats.completionRate >= 90
// // //                     ? "bg-green-500"
// // //                     : stats.completionRate >= 75
// // //                     ? "bg-amber-500"
// // //                     : "bg-red-500"
// // //                 }`}
// // //                 style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
// // //               ></div>
// // //             </div>
// // //           </div>
// // //           <Link
// // //             to="/workload/dept/overview"
// // //             className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group"
// // //           >
// // //             Workload Overview
// // //             <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
// // //           </Link>
// // //         </div>

// // //         {/* Performance Card */}
// // //         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-emerald-300">
// // //           <div className="flex items-center justify-between mb-4">
// // //             <div className="flex items-center space-x-3">
// // //               <div className="p-3 bg-emerald-50 rounded-lg">
// // //                 <Award className="h-6 w-6 text-emerald-600" />
// // //               </div>
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-600">Performance</p>
// // //                 <p className="text-2xl font-bold text-gray-900 mt-1">
// // //                   {stats.completionRate}%
// // //                 </p>
// // //               </div>
// // //             </div>
// // //             <div
// // //               className={`text-sm flex items-center ${
// // //                 stats.completionRate >= 90
// // //                   ? "text-green-600"
// // //                   : stats.completionRate >= 75
// // //                   ? "text-amber-600"
// // //                   : "text-red-600"
// // //               }`}
// // //             >
// // //               {stats.completionRate >= 90 ? (
// // //                 <>
// // //                   <TrendingUp className="h-4 w-4 mr-1" />
// // //                   <span>Excellent</span>
// // //                 </>
// // //               ) : stats.completionRate >= 75 ? (
// // //                 <>
// // //                   <TrendingUp className="h-4 w-4 mr-1" />
// // //                   <span>Good</span>
// // //                 </>
// // //               ) : (
// // //                 <>
// // //                   <TrendingDown className="h-4 w-4 mr-1" />
// // //                   <span>Needs Attention</span>
// // //                 </>
// // //               )}
// // //             </div>
// // //           </div>
// // //           <div className="space-y-2">
// // //             <div className="flex justify-between text-sm">
// // //               <span className="text-gray-500">Student Enrollment</span>
// // //               <span className="font-medium">
// // //                 {formatNumber(stats.studentEnrollment)}
// // //               </span>
// // //             </div>
// // //             <div className="flex justify-between text-sm">
// // //               <span className="text-gray-500">Budget Used</span>
// // //               <span className="font-medium">{stats.budgetUtilization}%</span>
// // //             </div>
// // //           </div>
// // //           <Link
// // //             to="/department/reports"
// // //             className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group"
// // //           >
// // //             View Reports
// // //             <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
// // //           </Link>
// // //         </div>
// // //       </div>

// // //       {/* Quick Actions and Alerts */}
// // //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// // //         {/* Quick Actions */}
// // //         <div className="lg:col-span-2">
// // //           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
// // //             <div className="flex items-center justify-between mb-6">
// // //               <div>
// // //                 <h3 className="text-lg font-semibold text-gray-900">
// // //                   Quick Actions
// // //                 </h3>
// // //                 <p className="text-sm text-gray-500 mt-1">
// // //                   Manage your department efficiently
// // //                 </p>
// // //               </div>
// // //               <Link
// // //                 to="/department/actions"
// // //                 className="text-sm text-blue-600 hover:text-blue-800 font-medium"
// // //               >
// // //                 View all actions
// // //               </Link>
// // //             </div>
// // //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // //               <Link
// // //                 to="/workload/dept/assignments"
// // //                 className="group p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-blue-50"
// // //               >
// // //                 <div className="flex items-center space-x-3 mb-3">
// // //                   <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
// // //                     <ClipboardCheck className="h-5 w-5 text-blue-600" />
// // //                   </div>
// // //                   <div>
// // //                     <p className="font-semibold text-gray-900 group-hover:text-blue-800">
// // //                       Course Assignments
// // //                     </p>
// // //                     <p className="text-sm text-gray-500">
// // //                       Assign courses to staff members
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //                 <div className="flex items-center justify-between">
// // //                   <span className="text-xs text-gray-500">
// // //                     {stats.pendingAssignments} pending assignments
// // //                   </span>
// // //                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
// // //                 </div>
// // //               </Link>

// // //               <Link
// // //                 to="/department/staff"
// // //                 className="group p-4 rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-purple-50"
// // //               >
// // //                 <div className="flex items-center space-x-3 mb-3">
// // //                   <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
// // //                     <Users className="h-5 w-5 text-purple-600" />
// // //                   </div>
// // //                   <div>
// // //                     <p className="font-semibold text-gray-900 group-hover:text-purple-800">
// // //                       Staff Management
// // //                     </p>
// // //                     <p className="text-sm text-gray-500">
// // //                       View and manage department staff
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //                 <div className="flex items-center justify-between">
// // //                   <span className="text-xs text-gray-500">
// // //                     {formatNumber(stats.totalStaff)} staff members
// // //                   </span>
// // //                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
// // //                 </div>
// // //               </Link>

// // //               <Link
// // //                 to="/approvals"
// // //                 className="group p-4 rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-green-50"
// // //               >
// // //                 <div className="flex items-center space-x-3 mb-3">
// // //                   <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
// // //                     <CheckSquare className="h-5 w-5 text-green-600" />
// // //                   </div>
// // //                   <div>
// // //                     <p className="font-semibold text-gray-900 group-hover:text-green-800">
// // //                       Approvals & Requests
// // //                     </p>
// // //                     <p className="text-sm text-gray-500">
// // //                       Approve course requests and assignments
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //                 <div className="flex items-center justify-between">
// // //                   <span className="text-xs text-gray-500">
// // //                     {formatNumber(stats.pendingApprovals)} pending requests
// // //                   </span>
// // //                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-transform" />
// // //                 </div>
// // //               </Link>

// // //               <Link
// // //                 to="/department/reports"
// // //                 className="group p-4 rounded-xl border border-gray-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-amber-50"
// // //               >
// // //                 <div className="flex items-center space-x-3 mb-3">
// // //                   <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
// // //                     <BarChart3 className="h-5 w-5 text-amber-600" />
// // //                   </div>
// // //                   <div>
// // //                     <p className="font-semibold text-gray-900 group-hover:text-amber-800">
// // //                       Reports & Analytics
// // //                     </p>
// // //                     <p className="text-sm text-gray-500">
// // //                       Generate department reports and analytics
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //                 <div className="flex items-center justify-between">
// // //                   <span className="text-xs text-gray-500">
// // //                     5+ report templates available
// // //                   </span>
// // //                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-transform" />
// // //                 </div>
// // //               </Link>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Pending Requests & Alerts Sidebar */}
// // //         <div className="space-y-6">
// // //           {/* Pending Requests */}
// // //           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
// // //             <div className="flex items-center justify-between mb-4">
// // //               <div>
// // //                 <h3 className="text-lg font-semibold text-gray-900">
// // //                   Pending Requests
// // //                 </h3>
// // //                 <p className="text-sm text-gray-500">Require your attention</p>
// // //               </div>
// // //               <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
// // //                 {pendingRequests.length} new
// // //               </span>
// // //             </div>
// // //             <div className="space-y-3">
// // //               {pendingRequests.length > 0 ? (
// // //                 pendingRequests.slice(0, 3).map((request) => (
// // //                   <div
// // //                     key={request.id}
// // //                     className="p-4 bg-amber-50 rounded-lg border border-amber-200 hover:border-amber-300 transition-colors"
// // //                   >
// // //                     <div className="flex items-start justify-between mb-2">
// // //                       <div className="flex-1">
// // //                         <p className="font-semibold text-gray-900 truncate">
// // //                           {request.course_name || request.course_code}
// // //                         </p>
// // //                         <p className="text-sm text-gray-600 mt-1">
// // //                           Requested by:{" "}
// // //                           <span className="font-medium">
// // //                             {request.staff_name}
// // //                           </span>
// // //                         </p>
// // //                         {request.reason && (
// // //                           <p className="text-xs text-gray-500 mt-1 line-clamp-2">
// // //                             {request.reason}
// // //                           </p>
// // //                         )}
// // //                       </div>
// // //                     </div>
// // //                     <div className="flex items-center justify-between">
// // //                       <span className="text-xs text-gray-500">
// // //                         {formatDate(request.created_at)}
// // //                       </span>
// // //                       <div className="flex items-center space-x-2">
// // //                         <button
// // //                           onClick={() => handleApproveRequest(request.id)}
// // //                           className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors flex items-center"
// // //                           title="Approve"
// // //                         >
// // //                           <Check className="h-3 w-3 mr-1" />
// // //                           Approve
// // //                         </button>
// // //                         <button
// // //                           onClick={() => handleRejectRequest(request.id)}
// // //                           className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center"
// // //                           title="Reject"
// // //                         >
// // //                           <X className="h-3 w-3 mr-1" />
// // //                           Reject
// // //                         </button>
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                 ))
// // //               ) : (
// // //                 <div className="text-center py-6">
// // //                   <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
// // //                   <p className="text-gray-500">No pending requests</p>
// // //                   <p className="text-sm text-gray-400 mt-1">
// // //                     All requests are processed
// // //                   </p>
// // //                 </div>
// // //               )}
// // //             </div>
// // //             {pendingRequests.length > 3 && (
// // //               <Link
// // //                 to="/approvals/pending"
// // //                 className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2 border-t border-gray-100"
// // //               >
// // //                 View all {pendingRequests.length} requests
// // //               </Link>
// // //             )}
// // //           </div>

// // //           {/* Overload Alerts */}
// // //           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
// // //             <div className="flex items-center justify-between mb-4">
// // //               <div>
// // //                 <h3 className="text-lg font-semibold text-gray-900">
// // //                   Overload Alerts
// // //                 </h3>
// // //                 <p className="text-sm text-gray-500">
// // //                   Staff exceeding workload limits
// // //                 </p>
// // //               </div>
// // //               <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
// // //                 {overloadAlerts.length} alerts
// // //               </span>
// // //             </div>
// // //             <div className="space-y-3">
// // //               {overloadAlerts.length > 0 ? (
// // //                 overloadAlerts.slice(0, 3).map((alert) => (
// // //                   <div
// // //                     key={alert.staff_id}
// // //                     className="p-4 bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors cursor-pointer"
// // //                     onClick={() => handleViewOverloadDetails(alert.staff_id)}
// // //                   >
// // //                     <div className="flex items-start justify-between">
// // //                       <div className="flex-1">
// // //                         <p className="font-semibold text-gray-900">
// // //                           {alert.staff_name}
// // //                         </p>
// // //                         <div className="flex items-center space-x-4 mt-2">
// // //                           <div className="text-sm">
// // //                             <span className="text-gray-600">Current:</span>
// // //                             <span className="font-medium text-red-600 ml-1">
// // //                               {alert.current_hours}h
// // //                             </span>
// // //                           </div>
// // //                           <div className="text-sm">
// // //                             <span className="text-gray-600">Limit:</span>
// // //                             <span className="font-medium ml-1">
// // //                               {alert.max_hours}h
// // //                             </span>
// // //                           </div>
// // //                           <div className="text-sm">
// // //                             <span className="text-gray-600">Excess:</span>
// // //                             <span className="font-medium text-red-600 ml-1">
// // //                               {alert.excess_hours}h
// // //                             </span>
// // //                           </div>
// // //                         </div>
// // //                       </div>
// // //                       <div className="p-1 bg-red-100 rounded">
// // //                         <AlertTriangle className="h-5 w-5 text-red-600" />
// // //                       </div>
// // //                     </div>
// // //                     <div className="mt-3">
// // //                       <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
// // //                         <div
// // //                           className="h-full bg-gradient-to-r from-red-500 to-red-600"
// // //                           style={{
// // //                             width: `${Math.min(
// // //                               (alert.current_hours / alert.max_hours) * 100,
// // //                               100
// // //                             )}%`,
// // //                           }}
// // //                         ></div>
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                 ))
// // //               ) : (
// // //                 <div className="text-center py-6">
// // //                   <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
// // //                   <p className="text-gray-500">No overload alerts</p>
// // //                   <p className="text-sm text-gray-400 mt-1">
// // //                     All staff are within limits
// // //                   </p>
// // //                 </div>
// // //               )}
// // //             </div>
// // //             {overloadAlerts.length > 3 && (
// // //               <Link
// // //                 to="/overload/dept/alerts"
// // //                 className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2 border-t border-gray-100"
// // //               >
// // //                 View all {overloadAlerts.length} alerts
// // //               </Link>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Recent Activities */}
// // //       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
// // //         <div className="flex items-center justify-between mb-6">
// // //           <div>
// // //             <h3 className="text-lg font-semibold text-gray-900">
// // //               Recent Activities
// // //             </h3>
// // //             <p className="text-sm text-gray-500 mt-1">
// // //               Latest department activities
// // //             </p>
// // //           </div>
// // //           <Link
// // //             to="/department/activities"
// // //             className="text-sm font-medium text-blue-600 hover:text-blue-800"
// // //           >
// // //             View all activities
// // //           </Link>
// // //         </div>
// // //         <div className="space-y-4">
// // //           {recentActivities.length > 0 ? (
// // //             recentActivities.map((activity, idx) => (
// // //               <div
// // //                 key={idx}
// // //                 className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
// // //               >
// // //                 <div className="flex-shrink-0 mt-1">
// // //                   <div
// // //                     className={`w-8 h-8 rounded-full flex items-center justify-center ${
// // //                       activity.type === "assignment"
// // //                         ? "bg-blue-100 text-blue-600"
// // //                         : activity.type === "approval"
// // //                         ? "bg-green-100 text-green-600"
// // //                         : activity.type === "alert"
// // //                         ? "bg-red-100 text-red-600"
// // //                         : "bg-gray-100 text-gray-600"
// // //                     }`}
// // //                   >
// // //                     {activity.type === "assignment" ? (
// // //                       <ClipboardCheck className="h-4 w-4" />
// // //                     ) : activity.type === "approval" ? (
// // //                       <CheckSquare className="h-4 w-4" />
// // //                     ) : activity.type === "alert" ? (
// // //                       <AlertTriangle className="h-4 w-4" />
// // //                     ) : (
// // //                       <FileText className="h-4 w-4" />
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //                 <div className="flex-1 min-w-0">
// // //                   <p className="text-sm text-gray-900">
// // //                     {activity.description}
// // //                   </p>
// // //                   <div className="flex items-center space-x-2 mt-1">
// // //                     <span className="text-xs text-gray-500">
// // //                       {formatDate(activity.timestamp)}
// // //                     </span>
// // //                     <span className="text-xs text-gray-400">•</span>
// // //                     <span className="text-xs font-medium text-gray-700">
// // //                       {activity.user_name}
// // //                     </span>
// // //                     {activity.course_code && (
// // //                       <>
// // //                         <span className="text-xs text-gray-400">•</span>
// // //                         <span className="text-xs text-blue-600 font-medium">
// // //                           {activity.course_code}
// // //                         </span>
// // //                       </>
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //                 {activity.status === "pending" && (
// // //                   <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
// // //                     Pending
// // //                   </span>
// // //                 )}
// // //               </div>
// // //             ))
// // //           ) : (
// // //             <div className="text-center py-8">
// // //               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
// // //                 <FileText className="h-8 w-8 text-gray-400" />
// // //               </div>
// // //               <p className="text-gray-500">No recent activities</p>
// // //               <p className="text-sm text-gray-400 mt-1">
// // //                 Activities will appear here as they occur
// // //               </p>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default DepartmentHeadDashboard;

// // // src/pages/dashboard/views/DepartmentHeadDashboard.jsx
// // import React, { useState, useEffect } from "react";
// // import { useNavigate, Link } from "react-router-dom";
// // import {
// //   Building,
// //   Users,
// //   BookOpen,
// //   Clock,
// //   TrendingUp,
// //   AlertCircle,
// //   CheckCircle,
// //   BarChart3,
// //   Calendar,
// //   FileText,
// //   Target,
// //   Award,
// //   ChevronRight,
// //   RefreshCw,
// //   Filter,
// //   Download,
// //   Eye,
// //   Edit,
// //   Loader2,
// //   FileSpreadsheet,
// //   CheckSquare,
// //   AlertTriangle,
// //   PieChart,
// //   CalendarDays,
// //   UserCheck,
// //   Layers,
// //   TrendingDown,
// //   Check,
// //   X,
// //   Search,
// //   ArrowUpRight,
// //   ArrowDownRight,
// //   DollarSign,
// //   ChartBar,
// //   FolderOpen,
// //   ClipboardCheck,
// //   UserPlus,
// //   Zap,
// //   Shield,
// //   Book,
// //   GraduationCap,
// //   Building2,
// // } from "lucide-react";
// // import toast from "react-hot-toast";
// // import { useAuth } from "../../../contexts/AuthContext";
// // import {
// //   departmentAPI,
// //   courseRequestAPI,
// //   overloadDetectionAPI,
// //   courseAssignmentAPI,
// //   staffAPI,
// //   workloadAPI
// // } from "../../../api";

// // const DepartmentHeadDashboard = () => {
// //   const { user } = useAuth();
// //   const navigate = useNavigate();

// //   const [loading, setLoading] = useState(true);
// //   const [stats, setStats] = useState({
// //     totalStaff: 0,
// //     totalCourses: 0,
// //     assignedCourses: 0,
// //     pendingAssignments: 0,
// //     pendingApprovals: 0,
// //     overloadAlerts: 0,
// //     averageWorkload: 0,
// //     completionRate: 0,
// //     totalWorkloadHours: 0,
// //     semester: "Spring 2024",
// //     budgetUtilization: 0,
// //     studentEnrollment: 0,
// //   });

// //   const [recentActivities, setRecentActivities] = useState([]);
// //   const [pendingRequests, setPendingRequests] = useState([]);
// //   const [overloadAlerts, setOverloadAlerts] = useState([]);
// //   const [staffList, setStaffList] = useState([]);
// //   const [department, setDepartment] = useState(null);
// //   const [timeRange, setTimeRange] = useState("current_semester");

// //   useEffect(() => {
// //     if (user?.department_id) {
// //       fetchDepartmentData();
// //     }
// //   }, [user?.department_id]);

// //   const fetchDepartmentData = async () => {
// //     try {
// //       setLoading(true);

// //       // Fetch department details
// //       const deptResponse = await departmentAPI.getDepartmentById(user.department_id);
// //       setDepartment(deptResponse.data);

// //       // Fetch department dashboard stats
// //       const dashboardResponse = await departmentAPI.getDepartmentDashboard(
// //         user.department_id,
// //         timeRange
// //       );
// //       const dashboardData = dashboardResponse.data;
// //       setStats({
// //         totalStaff: dashboardData.total_staff || 0,
// //         totalCourses: dashboardData.total_courses || 0,
// //         assignedCourses: dashboardData.assigned_courses || 0,
// //         pendingAssignments: dashboardData.pending_assignments || 0,
// //         pendingApprovals: dashboardData.pending_approvals || 0,
// //         overloadAlerts: dashboardData.overload_alerts || 0,
// //         averageWorkload: dashboardData.average_workload || 0,
// //         completionRate: dashboardData.completion_rate || 0,
// //         totalWorkloadHours: dashboardData.total_workload_hours || 0,
// //         semester: dashboardData.semester || "Spring 2024",
// //         budgetUtilization: dashboardData.budget_utilization || 0,
// //         studentEnrollment: dashboardData.student_enrollment || 0,
// //       });

// //       // Fetch recent activities
// //       const activitiesResponse = await departmentAPI.getDepartmentActivities(
// //         user.department_id
// //       );
// //       setRecentActivities(activitiesResponse.data || []);

// //       // Fetch pending requests
// //       const requestsResponse = await courseRequestAPI.getPendingRequests({
// //         department_id: user.department_id,
// //       });
// //       setPendingRequests(requestsResponse.data || []);

// //       // Fetch overload alerts
// //       const overloadResponse = await overloadDetectionAPI.checkDepartmentOverload(
// //         user.department_id
// //       );
// //       setOverloadAlerts(overloadResponse.data?.overloaded_staff || []);

// //       // Fetch department staff
// //       const staffResponse = await departmentAPI.getDepartmentStaff(user.department_id);
// //       setStaffList(staffResponse.data || []);

// //     } catch (error) {
// //       console.error("Error fetching department data:", error);
// //       toast.error("Failed to load department dashboard");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleRefresh = () => {
// //     fetchDepartmentData();
// //     toast.success("Dashboard refreshed");
// //   };

// //   const handleApproveRequest = async (requestId) => {
// //     try {
// //       await courseRequestAPI.approveRequest(requestId);
// //       toast.success("Request approved successfully");
// //       fetchDepartmentData();
// //     } catch (error) {
// //       toast.error("Failed to approve request");
// //     }
// //   };

// //   const handleRejectRequest = async (requestId) => {
// //     try {
// //       await courseRequestAPI.rejectRequest(requestId, "Rejected by department head");
// //       toast.success("Request rejected");
// //       fetchDepartmentData();
// //     } catch (error) {
// //       toast.error("Failed to reject request");
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center h-96">
// //         <div className="text-center">
// //           <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
// //           <p className="text-gray-600">Loading department dashboard...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white rounded-2xl p-6 shadow-xl">
// //         <div className="flex flex-col md:flex-row md:items-center justify-between">
// //           <div>
// //             <div className="flex items-center space-x-3 mb-4">
// //               <div className="p-3 bg-white/20 rounded-xl">
// //                 <Building className="h-8 w-8" />
// //               </div>
// //               <div>
// //                 <h1 className="text-2xl font-bold">{department?.department_name}</h1>
// //                 <p className="text-blue-200">
// //                   Department Head Dashboard • {stats.semester}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //           <div className="mt-4 md:mt-0">
// //             <button
// //               onClick={handleRefresh}
// //               className="flex items-center space-x-2 px-4 py-3 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
// //             >
// //               <RefreshCw className="h-5 w-5" />
// //               <span>Refresh Data</span>
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Stats Grid */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-600">Department Staff</p>
// //               <p className="text-2xl font-bold text-gray-900 mt-1">
// //                 {stats.totalStaff}
// //               </p>
// //             </div>
// //             <div className="p-3 bg-blue-50 rounded-lg">
// //               <Users className="h-6 w-6 text-blue-600" />
// //             </div>
// //           </div>
// //           <Link
// //             to="/department/staff"
// //             className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
// //           >
// //             View Staff Directory
// //             <ChevronRight className="h-4 w-4 ml-1" />
// //           </Link>
// //         </div>

// //         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-600">Course Assignments</p>
// //               <p className="text-2xl font-bold text-gray-900 mt-1">
// //                 {stats.assignedCourses}/{stats.totalCourses}
// //               </p>
// //             </div>
// //             <div className="p-3 bg-green-50 rounded-lg">
// //               <BookOpen className="h-6 w-6 text-green-600" />
// //             </div>
// //           </div>
// //           <Link
// //             to="/workload/dept/assignments"
// //             className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
// //           >
// //             Manage Assignments
// //             <ChevronRight className="h-4 w-4 ml-1" />
// //           </Link>
// //         </div>

// //         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-600">Pending Approvals</p>
// //               <p className="text-2xl font-bold text-gray-900 mt-1">
// //                 {stats.pendingApprovals}
// //               </p>
// //             </div>
// //             <div className="p-3 bg-amber-50 rounded-lg">
// //               <CheckSquare className="h-6 w-6 text-amber-600" />
// //             </div>
// //           </div>
// //           <Link
// //             to="/approvals/pending"
// //             className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
// //           >
// //             View Requests
// //             <ChevronRight className="h-4 w-4 ml-1" />
// //           </Link>
// //         </div>

// //         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-600">Overload Alerts</p>
// //               <p className="text-2xl font-bold text-gray-900 mt-1">
// //                 {stats.overloadAlerts}
// //               </p>
// //             </div>
// //             <div className="p-3 bg-red-50 rounded-lg">
// //               <AlertTriangle className="h-6 w-6 text-red-600" />
// //             </div>
// //           </div>
// //           <Link
// //             to="/overload/dept/alerts"
// //             className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
// //           >
// //             View Alerts
// //             <ChevronRight className="h-4 w-4 ml-1" />
// //           </Link>
// //         </div>
// //       </div>

// //       {/* Quick Actions */}
// //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //         <div className="lg:col-span-2">
// //           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
// //             <div className="flex items-center justify-between mb-6">
// //               <h3 className="text-lg font-semibold text-gray-900">
// //                 Quick Actions
// //               </h3>
// //               <Link
// //                 to="/department/actions"
// //                 className="text-sm text-blue-600 hover:text-blue-800"
// //               >
// //                 View all actions
// //               </Link>
// //             </div>
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <Link
// //                 to="/workload/dept/assignments"
// //                 className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
// //               >
// //                 <div className="flex items-center space-x-3">
// //                   <div className="p-2 bg-blue-100 rounded-lg">
// //                     <FileText className="h-5 w-5 text-blue-600" />
// //                   </div>
// //                   <div>
// //                     <p className="font-medium text-gray-900">
// //                       Course Assignments
// //                     </p>
// //                     <p className="text-sm text-gray-500">
// //                       Assign courses to staff
// //                     </p>
// //                   </div>
// //                 </div>
// //                 <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
// //               </Link>

// //               <Link
// //                 to="/department/staff"
// //                 className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
// //               >
// //                 <div className="flex items-center space-x-3">
// //                   <div className="p-2 bg-purple-100 rounded-lg">
// //                     <Users className="h-5 w-5 text-purple-600" />
// //                   </div>
// //                   <div>
// //                     <p className="font-medium text-gray-900">
// //                       Staff Management
// //                     </p>
// //                     <p className="text-sm text-gray-500">
// //                       View and manage staff
// //                     </p>
// //                   </div>
// //                 </div>
// //                 <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
// //               </Link>

// //               <Link
// //                 to="/approvals"
// //                 className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group"
// //               >
// //                 <div className="flex items-center space-x-3">
// //                   <div className="p-2 bg-green-100 rounded-lg">
// //                     <CheckSquare className="h-5 w-5 text-green-600" />
// //                   </div>
// //                   <div>
// //                     <p className="font-medium text-gray-900">Approvals</p>
// //                     <p className="text-sm text-gray-500">
// //                       {stats.pendingApprovals} pending requests
// //                     </p>
// //                   </div>
// //                 </div>
// //                 <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
// //               </Link>

// //               <Link
// //                 to="/department/reports"
// //                 className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
// //               >
// //                 <div className="flex items-center space-x-3">
// //                   <div className="p-2 bg-amber-100 rounded-lg">
// //                     <BarChart3 className="h-5 w-5 text-amber-600" />
// //                   </div>
// //                   <div>
// //                     <p className="font-medium text-gray-900">Reports</p>
// //                     <p className="text-sm text-gray-500">
// //                       Generate department reports
// //                     </p>
// //                   </div>
// //                 </div>
// //                 <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600" />
// //               </Link>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Pending Requests */}
// //         <div className="space-y-6">
// //           {pendingRequests.length > 0 && (
// //             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h3 className="text-lg font-semibold text-gray-900">
// //                   Pending Requests
// //                 </h3>
// //                 <span className="text-sm font-medium text-amber-600">
// //                   {pendingRequests.length} new
// //                 </span>
// //               </div>
// //               <div className="space-y-4">
// //                 {pendingRequests.slice(0, 3).map((request) => (
// //                   <div
// //                     key={request.id}
// //                     className="p-3 bg-amber-50 rounded-lg border border-amber-200"
// //                   >
// //                     <div className="flex items-start justify-between">
// //                       <div>
// //                         <p className="font-medium text-gray-900">
// //                           {request.course_name}
// //                         </p>
// //                         <p className="text-sm text-gray-600">
// //                           Requested by: {request.staff_name}
// //                         </p>
// //                       </div>
// //                       <div className="flex items-center space-x-2">
// //                         <button
// //                           onClick={() => handleApproveRequest(request.id)}
// //                           className="p-1 text-green-600 hover:bg-green-100 rounded"
// //                           title="Approve"
// //                         >
// //                           <Check className="h-4 w-4" />
// //                         </button>
// //                         <button
// //                           onClick={() => handleRejectRequest(request.id)}
// //                           className="p-1 text-red-600 hover:bg-red-100 rounded"
// //                           title="Reject"
// //                         >
// //                           <X className="h-4 w-4" />
// //                         </button>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //               {pendingRequests.length > 3 && (
// //                 <Link
// //                   to="/approvals/pending"
// //                   className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-800"
// //                 >
// //                   View all {pendingRequests.length} requests
// //                 </Link>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Recent Activities */}
// //       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
// //         <div className="flex items-center justify-between mb-6">
// //           <h3 className="text-lg font-semibold text-gray-900">
// //             Recent Activities
// //           </h3>
// //           <Link
// //             to="/department/activities"
// //             className="text-sm text-blue-600 hover:text-blue-800"
// //           >
// //             View all activities
// //           </Link>
// //         </div>
// //         <div className="space-y-4">
// //           {recentActivities.length > 0 ? (
// //             recentActivities.map((activity, idx) => (
// //               <div key={idx} className="flex items-start space-x-3">
// //                 <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
// //                 <div className="flex-1">
// //                   <p className="text-sm text-gray-900">
// //                     {activity.description}
// //                   </p>
// //                   <p className="text-xs text-gray-500 mt-1">
// //                     {activity.timestamp}
// //                   </p>
// //                 </div>
// //               </div>
// //             ))
// //           ) : (
// //             <p className="text-gray-500 text-center py-4">
// //               No recent activities
// //             </p>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DepartmentHeadDashboard;

// // src/pages/dashboard/views/DepartmentHeadDashboard.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useAuth } from "../../../contexts/AuthContext";
// import {
//   Building,
//   Users,
//   BookOpen,
//   Clock,
//   TrendingUp,
//   AlertCircle,
//   CheckCircle,
//   BarChart3,
//   FileText,
//   Award,
//   ChevronRight,
//   RefreshCw,
//   Filter,
//   FileSpreadsheet,
//   CheckSquare,
//   AlertTriangle,
//   CalendarDays,
//   UserCheck,
//   TrendingDown,
//   Check,
//   X,
//   ChartBar,
//   ClipboardCheck,
//   Loader2,
// } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import {
//   departmentAPI,
//   courseRequestAPI,
//   overloadDetectionAPI,
//   courseAssignmentAPI,
//   staffAPI,
// } from "../../../api";

// // Format number with commas
// const formatNumber = (num) => {
//   if (num === undefined || num === null) return "0";
//   return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// };

// // Format date
// const formatDate = (dateString) => {
//   if (!dateString) return "N/A";
//   return new Date(dateString).toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// };

// const DepartmentHeadDashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // State management
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [department, setDepartment] = useState(null);
//   const [staffProfile, setStaffProfile] = useState(null);
//   const [stats, setStats] = useState({
//     totalStaff: 0,
//     totalCourses: 0,
//     assignedCourses: 0,
//     pendingAssignments: 0,
//     pendingApprovals: 0,
//     overloadAlerts: 0,
//     averageWorkload: 0,
//     completionRate: 0,
//     totalWorkloadHours: 0,
//     semester: "Spring 2024",
//     budgetUtilization: 0,
//     studentEnrollment: 0,
//   });

//   const [recentActivities, setRecentActivities] = useState([]);
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [overloadAlerts, setOverloadAlerts] = useState([]);
//   const [staffList, setStaffList] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [timeRange, setTimeRange] = useState("current_semester");
//   const [activeSemester, setActiveSemester] = useState(null);

//   // Get staff profile first to get department_id
//   const fetchStaffProfile = useCallback(async () => {
//     if (!user?.id) {
//       toast.error("User not found");
//       navigate("/dashboard");
//       return null;
//     }

//     try {
//       // Fetch staff profile by user_id
//       const staffResponse = await staffAPI.getStaffByUserId(user.id);
//       if (staffResponse.data) {
//         setStaffProfile(staffResponse.data);
//         return staffResponse.data;
//       }
//       return null;
//     } catch (error) {
//       console.error("Error fetching staff profile:", error);
//       toast.error("Failed to load staff profile");
//       navigate("/dashboard");
//       return null;
//     }
//   }, [user?.id, navigate]);

//   // Fetch all department data
//   const fetchDepartmentData = useCallback(async () => {
//     // First get staff profile to get department_id
//     const profile = await fetchStaffProfile();
//     if (!profile?.department_id) {
//       toast.error("You are not assigned to a department");
//       navigate("/dashboard");
//       return;
//     }

//     try {
//       setLoading(true);
//       setRefreshing(true);

//       const departmentId = profile.department_id;

//       // 1. Fetch department details
//       const deptResponse = await departmentAPI.getDepartmentById(departmentId);
//       setDepartment(deptResponse.data);

//       // 2. Fetch department dashboard stats
//       const dashboardResponse = await departmentAPI.getDepartmentDashboard(
//         departmentId,
//         timeRange
//       );
//       const dashboardData = dashboardResponse.data;
//       setStats({
//         totalStaff: dashboardData.total_staff || 0,
//         totalCourses: dashboardData.total_courses || 0,
//         assignedCourses: dashboardData.assigned_courses || 0,
//         pendingAssignments: dashboardData.pending_assignments || 0,
//         pendingApprovals: dashboardData.pending_approvals || 0,
//         overloadAlerts: dashboardData.overload_alerts || 0,
//         averageWorkload: dashboardData.average_workload || 0,
//         completionRate: dashboardData.completion_rate || 0,
//         totalWorkloadHours: dashboardData.total_workload_hours || 0,
//         semester: dashboardData.semester || "Spring 2024",
//         budgetUtilization: dashboardData.budget_utilization || 0,
//         studentEnrollment: dashboardData.student_enrollment || 0,
//       });

//       // 3. Fetch recent activities
//       const activitiesResponse = await departmentAPI.getDepartmentActivities(
//         departmentId
//       );
//       setRecentActivities(activitiesResponse.data || []);

//       // 4. Fetch pending course requests
//       const requestsResponse = await courseRequestAPI.getPendingRequests({
//         department_id: departmentId,
//       });
//       setPendingRequests(requestsResponse.data || []);

//       // 5. Fetch overload alerts
//       const overloadResponse =
//         await overloadDetectionAPI.checkDepartmentOverload(
//           departmentId,
//           activeSemester?.semester_id
//         );
//       setOverloadAlerts(overloadResponse.data?.overloaded_staff || []);

//       // 6. Fetch department staff
//       const staffResponse = await departmentAPI.getDepartmentStaff(
//         departmentId
//       );
//       setStaffList(staffResponse.data || []);

//       // 7. Fetch assignments
//       const assignmentsResponse =
//         await courseAssignmentAPI.getDepartmentAssignments({
//           department_id: departmentId,
//           status: "pending",
//         });
//       setAssignments(assignmentsResponse.data || []);

//       toast.success("Dashboard data loaded successfully");
//     } catch (error) {
//       console.error("Error fetching department data:", error);
//       toast.error(
//         error.response?.data?.message || "Failed to load department dashboard"
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [fetchStaffProfile, timeRange, activeSemester, navigate]);

//   // Initial data fetch
//   useEffect(() => {
//     if (user?.id) {
//       fetchDepartmentData();
//     }
//   }, [user?.id, fetchDepartmentData]);

//   // Handle refresh
//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchDepartmentData();
//   };

//   // Handle approve request
//   const handleApproveRequest = async (requestId) => {
//     try {
//       await courseRequestAPI.approveRequest(
//         requestId,
//         "Approved by Department Head"
//       );
//       toast.success("Request approved successfully");
//       fetchDepartmentData(); // Refresh data
//     } catch (error) {
//       console.error("Error approving request:", error);
//       toast.error(error.response?.data?.message || "Failed to approve request");
//     }
//   };

//   // Handle reject request
//   const handleRejectRequest = async (requestId) => {
//     try {
//       await courseRequestAPI.rejectRequest(
//         requestId,
//         "Rejected by Department Head"
//       );
//       toast.success("Request rejected");
//       fetchDepartmentData(); // Refresh data
//     } catch (error) {
//       console.error("Error rejecting request:", error);
//       toast.error(error.response?.data?.message || "Failed to reject request");
//     }
//   };

//   // Handle export report
//   const handleExportReport = async (reportType = "dashboard") => {
//     if (!staffProfile?.department_id) {
//       toast.error("Department not found");
//       return;
//     }

//     try {
//       const response = await departmentAPI.exportDepartmentReport(
//         staffProfile.department_id,
//         reportType
//       );

//       // Create download link
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute(
//         "download",
//         `${department?.department_name}-report-${
//           new Date().toISOString().split("T")[0]
//         }.pdf`
//       );
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       toast.success("Report exported successfully");
//     } catch (error) {
//       console.error("Error exporting report:", error);
//       toast.error("Failed to export report");
//     }
//   };

//   // Handle view staff details
//   const handleViewStaffDetails = (staffId) => {
//     navigate(`/department/staff/${staffId}`);
//   };

//   // Handle view overload details
//   const handleViewOverloadDetails = (staffId) => {
//     navigate(`/overload/dept/staff/${staffId}`);
//   };

//   // Handle view assignment details
//   const handleViewAssignment = (assignmentId) => {
//     navigate(`/workload/dept/assignments/${assignmentId}`);
//   };

//   // Handle approve assignment
//   const handleApproveAssignment = async (assignmentId) => {
//     try {
//       await courseAssignmentAPI.acceptAssignment(assignmentId);
//       toast.success("Assignment approved");
//       fetchDepartmentData();
//     } catch (error) {
//       console.error("Error approving assignment:", error);
//       toast.error("Failed to approve assignment");
//     }
//   };

//   // Handle withdraw assignment
//   const handleWithdrawAssignment = async (assignmentId) => {
//     try {
//       await courseAssignmentAPI.withdrawAssignment(
//         assignmentId,
//         "Withdrawn by Department Head"
//       );
//       toast.success("Assignment withdrawn");
//       fetchDepartmentData();
//     } catch (error) {
//       console.error("Error withdrawing assignment:", error);
//       toast.error("Failed to withdraw assignment");
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
//         <div className="relative">
//           <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
//           <div className="absolute inset-0 flex items-center justify-center">
//             <Building className="h-8 w-8 text-blue-400" />
//           </div>
//         </div>
//         <div className="text-center">
//           <p className="text-lg font-semibold text-gray-700">
//             Loading Department Dashboard
//           </p>
//           <p className="text-sm text-gray-500 mt-2">
//             Fetching data for {department?.department_name || "your department"}
//             ...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 animate-fadeIn">
//       {/* Header with Department Info */}
//       <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 shadow-xl">
//         <div className="flex flex-col md:flex-row md:items-center justify-between">
//           <div className="flex-1">
//             <div className="flex items-start space-x-4 mb-4">
//               <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
//                 <Building className="h-10 w-10" />
//               </div>
//               <div className="flex-1">
//                 <div className="flex items-center space-x-3 mb-2">
//                   <h1 className="text-3xl font-bold tracking-tight">
//                     {department?.department_name || "Department Dashboard"}
//                   </h1>
//                   <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium border border-amber-500/30">
//                     Department Head
//                   </span>
//                 </div>
//                 <p className="text-blue-200 text-lg">
//                   {department?.college_name || "College"} •{" "}
//                   <span className="font-semibold">{stats.semester}</span>
//                 </p>
//                 <div className="flex flex-wrap items-center gap-4 mt-4">
//                   <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
//                     <CalendarDays className="h-4 w-4 text-amber-400" />
//                     <span>AY: 2024-2025</span>
//                   </div>
//                   <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
//                     <Clock className="h-4 w-4 text-emerald-400" />
//                     <span>Semester: I</span>
//                   </div>
//                   <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
//                     <UserCheck className="h-4 w-4 text-cyan-400" />
//                     <span>Active Staff: {formatNumber(stats.totalStaff)}</span>
//                   </div>
//                   <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
//                     <BookOpen className="h-4 w-4 text-purple-400" />
//                     <span>Courses: {formatNumber(stats.totalCourses)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="mt-4 md:mt-0 flex flex-col space-y-3">
//             <button
//               onClick={() => handleExportReport("dashboard")}
//               className="flex items-center justify-center space-x-2 px-5 py-3 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
//             >
//               <FileSpreadsheet className="h-5 w-5" />
//               <span>Export Dashboard</span>
//             </button>
//             <button
//               onClick={() => navigate("/department/reports")}
//               className="flex items-center justify-center space-x-2 px-5 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium border border-white/30"
//             >
//               <ChartBar className="h-5 w-5" />
//               <span>View All Reports</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Action Bar */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="flex items-center space-x-4">
//           <div className="relative">
//             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <select
//               value={timeRange}
//               onChange={(e) => {
//                 setTimeRange(e.target.value);
//                 fetchDepartmentData();
//               }}
//               className="pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
//             >
//               <option value="current_semester">Current Semester</option>
//               <option value="last_semester">Last Semester</option>
//               <option value="academic_year">Academic Year</option>
//               <option value="custom">Custom Range</option>
//             </select>
//           </div>
//           <button
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             <RefreshCw
//               className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
//             />
//             <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
//           </button>
//         </div>
//         <div className="flex items-center space-x-3">
//           {stats.pendingApprovals > 0 && (
//             <Link
//               to="/approvals/pending"
//               className="flex items-center space-x-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
//             >
//               <CheckSquare className="h-4 w-4" />
//               <span className="font-medium">
//                 Pending Approvals ({formatNumber(stats.pendingApprovals)})
//               </span>
//               <AlertTriangle className="h-4 w-4 animate-pulse" />
//             </Link>
//           )}
//           {stats.overloadAlerts > 0 && (
//             <Link
//               to="/overload/dept/alerts"
//               className="flex items-center space-x-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
//             >
//               <AlertTriangle className="h-4 w-4" />
//               <span className="font-medium">
//                 Overload Alerts ({formatNumber(stats.overloadAlerts)})
//               </span>
//             </Link>
//           )}
//           <Link
//             to="/workload/dept/assignments"
//             className="flex items-center space-x-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
//           >
//             <ClipboardCheck className="h-4 w-4" />
//             <span>Manage Assignments</span>
//           </Link>
//         </div>
//       </div>

//       {/* Main Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Staff Card */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-300">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <Users className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Department Staff
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {formatNumber(stats.totalStaff)}
//                 </p>
//               </div>
//             </div>
//             <div className="text-green-600 flex items-center text-sm">
//               <TrendingUp className="h-4 w-4 mr-1" />
//               <span>Active</span>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Professors</span>
//               <span className="font-medium">
//                 {
//                   staffList.filter((s) => s.academic_rank === "professor")
//                     .length
//                 }
//               </span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Lecturers</span>
//               <span className="font-medium">
//                 {staffList.filter((s) => s.academic_rank === "lecturer").length}
//               </span>
//             </div>
//           </div>
//           <Link
//             to="/department/staff"
//             className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group"
//           >
//             View Staff Directory
//             <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>

//         {/* Courses Card */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-green-300">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-3 bg-green-50 rounded-lg">
//                 <BookOpen className="h-6 w-6 text-green-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Course Assignments
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {formatNumber(stats.assignedCourses)}/
//                   {formatNumber(stats.totalCourses)}
//                 </p>
//               </div>
//             </div>
//             <div
//               className={`text-sm flex items-center ${
//                 stats.pendingAssignments > 0
//                   ? "text-amber-600"
//                   : "text-green-600"
//               }`}
//             >
//               {stats.pendingAssignments > 0 ? (
//                 <>
//                   <AlertCircle className="h-4 w-4 mr-1" />
//                   <span>{formatNumber(stats.pendingAssignments)} pending</span>
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle className="h-4 w-4 mr-1" />
//                   <span>Complete</span>
//                 </>
//               )}
//             </div>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Assigned</span>
//               <span className="font-medium text-green-600">
//                 {formatNumber(stats.assignedCourses)}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Unassigned</span>
//               <span className="font-medium text-amber-600">
//                 {formatNumber(stats.totalCourses - stats.assignedCourses)}
//               </span>
//             </div>
//           </div>
//           <Link
//             to="/workload/dept/assignments"
//             className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group"
//           >
//             Manage Assignments
//             <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>

//         {/* Workload Card */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-purple-300">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-3 bg-purple-50 rounded-lg">
//                 <Clock className="h-6 w-6 text-purple-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Workload Hours
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {formatNumber(stats.totalWorkloadHours)}h
//                 </p>
//               </div>
//             </div>
//             <div
//               className={`text-sm ${
//                 stats.averageWorkload > 15 ? "text-red-600" : "text-green-600"
//               }`}
//             >
//               Avg: {stats.averageWorkload}h/staff
//             </div>
//           </div>
//           <div className="mb-3">
//             <div className="flex justify-between text-sm mb-1">
//               <span className="text-gray-500">Utilization</span>
//               <span className="font-medium">{stats.completionRate}%</span>
//             </div>
//             <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//               <div
//                 className={`h-full ${
//                   stats.completionRate >= 90
//                     ? "bg-green-500"
//                     : stats.completionRate >= 75
//                     ? "bg-amber-500"
//                     : "bg-red-500"
//                 }`}
//                 style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
//               ></div>
//             </div>
//           </div>
//           <Link
//             to="/workload/dept/overview"
//             className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group"
//           >
//             Workload Overview
//             <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>

//         {/* Performance Card */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-emerald-300">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-3 bg-emerald-50 rounded-lg">
//                 <Award className="h-6 w-6 text-emerald-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Performance</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {stats.completionRate}%
//                 </p>
//               </div>
//             </div>
//             <div
//               className={`text-sm flex items-center ${
//                 stats.completionRate >= 90
//                   ? "text-green-600"
//                   : stats.completionRate >= 75
//                   ? "text-amber-600"
//                   : "text-red-600"
//               }`}
//             >
//               {stats.completionRate >= 90 ? (
//                 <>
//                   <TrendingUp className="h-4 w-4 mr-1" />
//                   <span>Excellent</span>
//                 </>
//               ) : stats.completionRate >= 75 ? (
//                 <>
//                   <TrendingUp className="h-4 w-4 mr-1" />
//                   <span>Good</span>
//                 </>
//               ) : (
//                 <>
//                   <TrendingDown className="h-4 w-4 mr-1" />
//                   <span>Needs Attention</span>
//                 </>
//               )}
//             </div>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Student Enrollment</span>
//               <span className="font-medium">
//                 {formatNumber(stats.studentEnrollment)}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Budget Used</span>
//               <span className="font-medium">{stats.budgetUtilization}%</span>
//             </div>
//           </div>
//           <Link
//             to="/department/reports"
//             className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group"
//           >
//             View Reports
//             <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>
//       </div>

//       {/* Quick Actions and Alerts */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Quick Actions */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Quick Actions
//                 </h3>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Manage your department efficiently
//                 </p>
//               </div>
//               <Link
//                 to="/department/actions"
//                 className="text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 View all actions
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Link
//                 to="/workload/dept/assignments"
//                 className="group p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-blue-50"
//               >
//                 <div className="flex items-center space-x-3 mb-3">
//                   <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
//                     <ClipboardCheck className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-900 group-hover:text-blue-800">
//                       Course Assignments
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       Assign courses to staff members
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-500">
//                     {stats.pendingAssignments} pending assignments
//                   </span>
//                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
//                 </div>
//               </Link>

//               <Link
//                 to="/department/staff"
//                 className="group p-4 rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-purple-50"
//               >
//                 <div className="flex items-center space-x-3 mb-3">
//                   <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
//                     <Users className="h-5 w-5 text-purple-600" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-900 group-hover:text-purple-800">
//                       Staff Management
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       View and manage department staff
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-500">
//                     {formatNumber(stats.totalStaff)} staff members
//                   </span>
//                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
//                 </div>
//               </Link>

//               <Link
//                 to="/approvals"
//                 className="group p-4 rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-green-50"
//               >
//                 <div className="flex items-center space-x-3 mb-3">
//                   <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
//                     <CheckSquare className="h-5 w-5 text-green-600" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-900 group-hover:text-green-800">
//                       Approvals & Requests
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       Approve course requests and assignments
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-500">
//                     {formatNumber(stats.pendingApprovals)} pending requests
//                   </span>
//                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-transform" />
//                 </div>
//               </Link>

//               <Link
//                 to="/department/reports"
//                 className="group p-4 rounded-xl border border-gray-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-amber-50"
//               >
//                 <div className="flex items-center space-x-3 mb-3">
//                   <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
//                     <BarChart3 className="h-5 w-5 text-amber-600" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-900 group-hover:text-amber-800">
//                       Reports & Analytics
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       Generate department reports and analytics
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-500">
//                     5+ report templates available
//                   </span>
//                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-transform" />
//                 </div>
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Pending Requests & Alerts Sidebar */}
//         <div className="space-y-6">
//           {/* Pending Requests */}
//           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Pending Requests
//                 </h3>
//                 <p className="text-sm text-gray-500">Require your attention</p>
//               </div>
//               <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
//                 {pendingRequests.length} new
//               </span>
//             </div>
//             <div className="space-y-3">
//               {pendingRequests.length > 0 ? (
//                 pendingRequests.slice(0, 3).map((request) => (
//                   <div
//                     key={request.id}
//                     className="p-4 bg-amber-50 rounded-lg border border-amber-200 hover:border-amber-300 transition-colors"
//                   >
//                     <div className="flex items-start justify-between mb-2">
//                       <div className="flex-1">
//                         <p className="font-semibold text-gray-900 truncate">
//                           {request.course_name || request.course_code}
//                         </p>
//                         <p className="text-sm text-gray-600 mt-1">
//                           Requested by:{" "}
//                           <span className="font-medium">
//                             {request.staff_name}
//                           </span>
//                         </p>
//                         {request.reason && (
//                           <p className="text-xs text-gray-500 mt-1 line-clamp-2">
//                             {request.reason}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs text-gray-500">
//                         {formatDate(request.created_at)}
//                       </span>
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={() => handleApproveRequest(request.id)}
//                           className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors flex items-center"
//                           title="Approve"
//                         >
//                           <Check className="h-3 w-3 mr-1" />
//                           Approve
//                         </button>
//                         <button
//                           onClick={() => handleRejectRequest(request.id)}
//                           className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center"
//                           title="Reject"
//                         >
//                           <X className="h-3 w-3 mr-1" />
//                           Reject
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-6">
//                   <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
//                   <p className="text-gray-500">No pending requests</p>
//                   <p className="text-sm text-gray-400 mt-1">
//                     All requests are processed
//                   </p>
//                 </div>
//               )}
//             </div>
//             {pendingRequests.length > 3 && (
//               <Link
//                 to="/approvals/pending"
//                 className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2 border-t border-gray-100"
//               >
//                 View all {pendingRequests.length} requests
//               </Link>
//             )}
//           </div>

//           {/* Overload Alerts */}
//           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Overload Alerts
//                 </h3>
//                 <p className="text-sm text-gray-500">
//                   Staff exceeding workload limits
//                 </p>
//               </div>
//               <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
//                 {overloadAlerts.length} alerts
//               </span>
//             </div>
//             <div className="space-y-3">
//               {overloadAlerts.length > 0 ? (
//                 overloadAlerts.slice(0, 3).map((alert) => (
//                   <div
//                     key={alert.staff_id}
//                     className="p-4 bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors cursor-pointer"
//                     onClick={() => handleViewOverloadDetails(alert.staff_id)}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <p className="font-semibold text-gray-900">
//                           {alert.staff_name}
//                         </p>
//                         <div className="flex items-center space-x-4 mt-2">
//                           <div className="text-sm">
//                             <span className="text-gray-600">Current:</span>
//                             <span className="font-medium text-red-600 ml-1">
//                               {alert.current_hours}h
//                             </span>
//                           </div>
//                           <div className="text-sm">
//                             <span className="text-gray-600">Limit:</span>
//                             <span className="font-medium ml-1">
//                               {alert.max_hours}h
//                             </span>
//                           </div>
//                           <div className="text-sm">
//                             <span className="text-gray-600">Excess:</span>
//                             <span className="font-medium text-red-600 ml-1">
//                               {alert.excess_hours}h
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="p-1 bg-red-100 rounded">
//                         <AlertTriangle className="h-5 w-5 text-red-600" />
//                       </div>
//                     </div>
//                     <div className="mt-3">
//                       <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-gradient-to-r from-red-500 to-red-600"
//                           style={{
//                             width: `${Math.min(
//                               (alert.current_hours / alert.max_hours) * 100,
//                               100
//                             )}%`,
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-6">
//                   <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
//                   <p className="text-gray-500">No overload alerts</p>
//                   <p className="text-sm text-gray-400 mt-1">
//                     All staff are within limits
//                   </p>
//                 </div>
//               )}
//             </div>
//             {overloadAlerts.length > 3 && (
//               <Link
//                 to="/overload/dept/alerts"
//                 className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2 border-t border-gray-100"
//               >
//                 View all {overloadAlerts.length} alerts
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Recent Activities */}
//       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">
//               Recent Activities
//             </h3>
//             <p className="text-sm text-gray-500 mt-1">
//               Latest department activities
//             </p>
//           </div>
//           <Link
//             to="/department/activities"
//             className="text-sm font-medium text-blue-600 hover:text-blue-800"
//           >
//             View all activities
//           </Link>
//         </div>
//         <div className="space-y-4">
//           {recentActivities.length > 0 ? (
//             recentActivities.map((activity, idx) => (
//               <div
//                 key={idx}
//                 className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <div className="flex-shrink-0 mt-1">
//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                       activity.type === "assignment"
//                         ? "bg-blue-100 text-blue-600"
//                         : activity.type === "approval"
//                         ? "bg-green-100 text-green-600"
//                         : activity.type === "alert"
//                         ? "bg-red-100 text-red-600"
//                         : "bg-gray-100 text-gray-600"
//                     }`}
//                   >
//                     {activity.type === "assignment" ? (
//                       <ClipboardCheck className="h-4 w-4" />
//                     ) : activity.type === "approval" ? (
//                       <CheckSquare className="h-4 w-4" />
//                     ) : activity.type === "alert" ? (
//                       <AlertTriangle className="h-4 w-4" />
//                     ) : (
//                       <FileText className="h-4 w-4" />
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm text-gray-900">
//                     {activity.description}
//                   </p>
//                   <div className="flex items-center space-x-2 mt-1">
//                     <span className="text-xs text-gray-500">
//                       {formatDate(activity.timestamp)}
//                     </span>
//                     <span className="text-xs text-gray-400">•</span>
//                     <span className="text-xs font-medium text-gray-700">
//                       {activity.user_name}
//                     </span>
//                     {activity.course_code && (
//                       <>
//                         <span className="text-xs text-gray-400">•</span>
//                         <span className="text-xs text-blue-600 font-medium">
//                           {activity.course_code}
//                         </span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//                 {activity.status === "pending" && (
//                   <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
//                     Pending
//                   </span>
//                 )}
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-8">
//               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FileText className="h-8 w-8 text-gray-400" />
//               </div>
//               <p className="text-gray-500">No recent activities</p>
//               <p className="text-sm text-gray-400 mt-1">
//                 Activities will appear here as they occur
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DepartmentHeadDashboard;

// src/components/dashboard/DepartmentHeadDashboard.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useAuth } from "../../../contexts/AuthContext";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   departmentAPI,
//   staffAPI,
//   courseAssignmentAPI,
//   courseRequestAPI,
//   overloadDetectionAPI,
//   academicAPI,
// } from "../../../api";
// import toast from "react-hot-toast";
// import {
//   Users,
//   BookOpen,
//   Clock,
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   BarChart3,
//   TrendingUp,
//   Calendar,
//   Download,
//   Eye,
//   Edit,
//   MoreVertical,
//   ChevronRight,
//   Plus,
//   RefreshCw,
//   Filter,
//   Search,
//   UserCheck,
//   FileText,
//   CheckSquare,
//   AlertCircle,
//   ArrowUpRight,
//   ArrowDownRight,
//   DollarSign,
//   PieChart,
//   Target,
//   Activity,
//   Shield,
// } from "lucide-react";

// const DepartmentHeadDashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // State management
//   const [loading, setLoading] = useState(true);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [departmentInfo, setDepartmentInfo] = useState(null);
//   const [stats, setStats] = useState({
//     totalStaff: 0,
//     activeCourses: 0,
//     pendingRequests: 0,
//     workloadHours: 0,
//     overloadCount: 0,
//     averageLoad: 0,
//     completionRate: 0,
//   });

//   const [recentActivities, setRecentActivities] = useState([]);
//   const [staffList, setStaffList] = useState([]);
//   const [pendingApprovals, setPendingApprovals] = useState([]);
//   const [overloadAlerts, setOverloadAlerts] = useState([]);
//   const [semesterInfo, setSemesterInfo] = useState(null);

//   // Fetch dashboard data
//   const fetchDashboardData = useCallback(async () => {
//     try {
//       setLoading(true);

//       // Get current semester
//       const semesterRes = await academicAPI.getCurrentSemester();
//       const currentSemester = semesterRes.data;
//       setSemesterInfo(currentSemester);

//       // Get department head's staff profile
//       const staffRes = await staffAPI.getMyProfile();
//       const staffData = staffRes.data;

//       // Get department details
//       const deptRes = await departmentAPI.getDepartmentById(
//         staffData.department_id
//       );
//       const department = deptRes.data;
//       setDepartmentInfo(department);

//       // Get department dashboard data
//       const dashboardRes = await departmentAPI.getDepartmentDashboard(
//         staffData.department_id,
//         "current_semester"
//       );

//       // Get staff in department
//       const staffListRes = await departmentAPI.getDepartmentStaff(
//         staffData.department_id,
//         {
//           page: 1,
//           limit: 10,
//           is_active: true,
//         }
//       );

//       // Get pending course requests
//       const requestsRes = await courseRequestAPI.getPendingRequests({
//         department_id: staffData.department_id,
//         status: "pending",
//       });

//       // Get department assignments
//       const assignmentsRes = await courseAssignmentAPI.getDepartmentAssignments(
//         {
//           department_id: staffData.department_id,
//           semester_id: currentSemester.semester_id,
//         }
//       );

//       // Get overload alerts
//       const overloadRes = await overloadDetectionAPI.checkDepartmentOverload(
//         staffData.department_id,
//         currentSemester.semester_id
//       );

//       // Calculate statistics
//       const dashboardStats = dashboardRes.data || {};
//       const assignments = assignmentsRes.data?.assignments || [];
//       const requests = requestsRes.data?.requests || [];
//       const staffs = staffListRes.data?.staff || [];
//       const overloadData = overloadRes.data || {};

//       // Calculate workload hours
//       const totalWorkloadHours = assignments.reduce((sum, assignment) => {
//         return sum + (assignment.total_hours || 0);
//       }, 0);

//       // Calculate overload count
//       const overloadCount = overloadData.overloaded_staff?.length || 0;

//       // Calculate average load percentage
//       const avgLoad =
//         staffs.length > 0
//           ? staffs.reduce(
//               (sum, staff) => sum + (staff.load_percentage || 0),
//               0
//             ) / staffs.length
//           : 0;

//       // Set stats
//       setStats({
//         totalStaff: staffs.length,
//         activeCourses: assignments.length,
//         pendingRequests: requests.length,
//         workloadHours: totalWorkloadHours,
//         overloadCount,
//         averageLoad: Math.round(avgLoad),
//         completionRate: dashboardStats.completion_rate || 0,
//       });

//       // Set staff list with workload info
//       const formattedStaff = staffs.map((staff) => ({
//         ...staff,
//         workload_status: getWorkloadStatus(staff.load_percentage),
//         action_required:
//           staff.load_percentage > 100 || staff.pending_approvals > 0,
//       }));
//       setStaffList(formattedStaff);

//       // Set pending approvals
//       setPendingApprovals(requests.slice(0, 5));

//       // Set overload alerts
//       const alerts = overloadData.overloaded_staff?.slice(0, 5) || [];
//       setOverloadAlerts(alerts);

//       // Set recent activities
//       const activities = generateRecentActivities(
//         assignments,
//         requests,
//         overloadData.overloaded_staff
//       );
//       setRecentActivities(activities.slice(0, 10));

//       // Set complete dashboard data
//       setDashboardData(dashboardRes.data);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       toast.error("Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Helper function to get workload status
//   const getWorkloadStatus = (percentage) => {
//     if (!percentage)
//       return { label: "No Data", color: "gray", variant: "secondary" };
//     if (percentage < 80)
//       return { label: "Normal", color: "green", variant: "success" };
//     if (percentage < 100)
//       return { label: "High", color: "amber", variant: "warning" };
//     return { label: "Overloaded", color: "red", variant: "danger" };
//   };

//   // Generate recent activities
//   const generateRecentActivities = (assignments, requests, overloads) => {
//     const activities = [];

//     // Add recent assignments
//     assignments.slice(0, 3).forEach((assignment) => {
//       activities.push({
//         id: `assign-${assignment.assignment_id}`,
//         type: "assignment",
//         title: "New Course Assignment",
//         description: `${assignment.course_code} assigned to ${assignment.instructor_name}`,
//         time: assignment.created_at,
//         icon: BookOpen,
//         color: "text-blue-600",
//         bgColor: "bg-blue-50",
//       });
//     });

//     // Add recent requests
//     requests.slice(0, 3).forEach((request) => {
//       activities.push({
//         id: `request-${request.request_id}`,
//         type: "request",
//         title: "Course Request Submitted",
//         description: `${request.staff_name} requested ${request.course_code}`,
//         time: request.created_at,
//         icon: FileText,
//         color: "text-purple-600",
//         bgColor: "bg-purple-50",
//       });
//     });

//     // Add overload alerts
//     (overloads || []).slice(0, 3).forEach((staff) => {
//       activities.push({
//         id: `overload-${staff.staff_id}`,
//         type: "overload",
//         title: "Overload Alert",
//         description: `${staff.staff_name} at ${staff.load_percentage}% capacity`,
//         time: new Date().toISOString(),
//         icon: AlertTriangle,
//         color: "text-red-600",
//         bgColor: "bg-red-50",
//       });
//     });

//     return activities.sort((a, b) => new Date(b.time) - new Date(a.time));
//   };

//   // Quick action handlers
//   const handleAssignCourse = () => {
//     navigate("/workload/dept/assignments");
//   };

//   const handleApproveRequests = () => {
//     navigate("/approvals/course-requests");
//   };

//   const handleViewOverload = () => {
//     navigate("/overload/dept");
//   };

//   const handleExportReport = async () => {
//     try {
//       toast.loading("Generating report...");
//       // Implementation for export
//       toast.success("Report exported successfully");
//     } catch (error) {
//       toast.error("Failed to export report");
//     }
//   };

//   // Handle staff action
//   const handleStaffAction = (staffId, action) => {
//     switch (action) {
//       case "view":
//         navigate(`/workload/dept/staff/${staffId}`);
//         break;
//       case "assign":
//         navigate(`/workload/dept/assign?staff_id=${staffId}`);
//         break;
//       case "review":
//         navigate(`/overload/dept/staff/${staffId}`);
//         break;
//     }
//   };

//   // Handle approval action
//   const handleApprovalAction = async (requestId, action) => {
//     try {
//       if (action === "approve") {
//         await courseRequestAPI.approveRequest(requestId);
//         toast.success("Request approved");
//       } else {
//         await courseRequestAPI.rejectRequest(
//           requestId,
//           "Rejected by department head"
//         );
//         toast.success("Request rejected");
//       }
//       fetchDashboardData(); // Refresh data
//     } catch (error) {
//       toast.error("Action failed");
//     }
//   };

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchDashboardData();

//     // Refresh every 5 minutes
//     const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, [fetchDashboardData]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {departmentInfo?.department_name || "Department"} Dashboard
//           </h1>
//           <p className="text-gray-600 mt-1">
//             {semesterInfo
//               ? `${semesterInfo.semester_name} - ${semesterInfo.year_code}`
//               : "Current Semester"}{" "}
//             • Last updated: {new Date().toLocaleTimeString()}
//           </p>
//         </div>
//         <div className="mt-4 md:mt-0 flex space-x-3">
//           <button
//             onClick={fetchDashboardData}
//             className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
//           >
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Refresh
//           </button>
//           <button
//             onClick={handleExportReport}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
//           >
//             <Download className="h-4 w-4 mr-2" />
//             Export Report
//           </button>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {/* Total Staff */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 font-medium">Total Staff</p>
//               <p className="text-2xl font-bold text-gray-900 mt-1">
//                 {stats.totalStaff}
//               </p>
//               <div className="flex items-center mt-2">
//                 <span className="text-xs text-green-600 font-medium flex items-center">
//                   <ArrowUpRight className="h-3 w-3 mr-1" />+
//                   {Math.floor(stats.totalStaff * 0.1)} this semester
//                 </span>
//               </div>
//             </div>
//             <div className="p-3 bg-blue-50 rounded-lg">
//               <Users className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//           <div className="mt-4 pt-4 border-t">
//             <Link
//               to="/department/staff"
//               className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
//             >
//               View all staff
//               <ChevronRight className="h-4 w-4 ml-1" />
//             </Link>
//           </div>
//         </div>

//         {/* Active Courses */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 font-medium">
//                 Active Courses
//               </p>
//               <p className="text-2xl font-bold text-gray-900 mt-1">
//                 {stats.activeCourses}
//               </p>
//               <div className="flex items-center mt-2">
//                 <span className="text-xs text-amber-600 font-medium">
//                   {stats.pendingRequests} pending assignments
//                 </span>
//               </div>
//             </div>
//             <div className="p-3 bg-green-50 rounded-lg">
//               <BookOpen className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//           <div className="mt-4 pt-4 border-t">
//             <button
//               onClick={handleAssignCourse}
//               className="text-sm text-green-600 hover:text-green-800 flex items-center"
//             >
//               <Plus className="h-4 w-4 mr-1" />
//               Assign course
//             </button>
//           </div>
//         </div>

//         {/* Workload Hours */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 font-medium">
//                 Workload Hours
//               </p>
//               <p className="text-2xl font-bold text-gray-900 mt-1">
//                 {stats.workloadHours}
//               </p>
//               <div className="flex items-center mt-2">
//                 <span
//                   className={`text-xs font-medium ${
//                     stats.averageLoad < 80
//                       ? "text-green-600"
//                       : stats.averageLoad < 100
//                       ? "text-amber-600"
//                       : "text-red-600"
//                   }`}
//                 >
//                   Avg load: {stats.averageLoad}%
//                 </span>
//               </div>
//             </div>
//             <div className="p-3 bg-purple-50 rounded-lg">
//               <Clock className="h-6 w-6 text-purple-600" />
//             </div>
//           </div>
//           <div className="mt-4 pt-4 border-t">
//             <Link
//               to="/workload/dept/overview"
//               className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
//             >
//               Workload overview
//               <ChevronRight className="h-4 w-4 ml-1" />
//             </Link>
//           </div>
//         </div>

//         {/* Overload Alerts */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 font-medium">
//                 Overload Alerts
//               </p>
//               <p className="text-2xl font-bold text-gray-900 mt-1">
//                 {stats.overloadCount}
//               </p>
//               <div className="flex items-center mt-2">
//                 <span className="text-xs text-red-600 font-medium flex items-center">
//                   <AlertTriangle className="h-3 w-3 mr-1" />
//                   Requires attention
//                 </span>
//               </div>
//             </div>
//             <div className="p-3 bg-red-50 rounded-lg">
//               <AlertCircle className="h-6 w-6 text-red-600" />
//             </div>
//           </div>
//           <div className="mt-4 pt-4 border-t">
//             <button
//               onClick={handleViewOverload}
//               className="text-sm text-red-600 hover:text-red-800 flex items-center"
//             >
//               View alerts
//               <ChevronRight className="h-4 w-4 ml-1" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Staff Workload */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Staff Workload Table */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Staff Workload Status
//                 </h2>
//                 <div className="flex items-center space-x-2">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       type="text"
//                       placeholder="Search staff..."
//                       className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                   </div>
//                   <button className="p-2 border border-gray-300 rounded-lg">
//                     <Filter className="h-4 w-4 text-gray-600" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Staff Member
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Rank
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Current Load
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {staffList.map((staff) => {
//                     const status = getWorkloadStatus(staff.load_percentage);
//                     return (
//                       <tr key={staff.staff_id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                               {staff.first_name?.charAt(0)}
//                               {staff.last_name?.charAt(0)}
//                             </div>
//                             <div className="ml-4">
//                               <div className="text-sm font-medium text-gray-900">
//                                 {staff.first_name} {staff.last_name}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 {staff.employee_id}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
//                             {staff.academic_rank?.replace("_", " ") ||
//                               "Lecturer"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {staff.total_hours || 0} hrs
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {staff.load_percentage || 0}% of capacity
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
//                             ${
//                               status.variant === "success"
//                                 ? "bg-green-100 text-green-800"
//                                 : status.variant === "warning"
//                                 ? "bg-amber-100 text-amber-800"
//                                 : status.variant === "danger"
//                                 ? "bg-red-100 text-red-800"
//                                 : "bg-gray-100 text-gray-800"
//                             }`}
//                           >
//                             {status.label}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <div className="flex items-center space-x-2">
//                             <button
//                               onClick={() =>
//                                 handleStaffAction(staff.staff_id, "view")
//                               }
//                               className="text-blue-600 hover:text-blue-900"
//                               title="View Details"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </button>
//                             <button
//                               onClick={() =>
//                                 handleStaffAction(staff.staff_id, "assign")
//                               }
//                               className="text-green-600 hover:text-green-900"
//                               title="Assign Course"
//                             >
//                               <Plus className="h-4 w-4" />
//                             </button>
//                             <button
//                               onClick={() =>
//                                 handleStaffAction(staff.staff_id, "review")
//                               }
//                               className="text-amber-600 hover:text-amber-900"
//                               title="Review Overload"
//                             >
//                               <AlertTriangle className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="p-4 border-t border-gray-200">
//               <Link
//                 to="/department/staff"
//                 className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
//               >
//                 View all staff members
//                 <ChevronRight className="h-4 w-4 ml-1" />
//               </Link>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Quick Actions
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               <button
//                 onClick={handleAssignCourse}
//                 className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group text-left"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 bg-blue-50 rounded-lg">
//                     <BookOpen className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
//                 </div>
//                 <p className="font-medium text-gray-900">Assign Course</p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Assign courses to staff members
//                 </p>
//               </button>

//               <button
//                 onClick={handleApproveRequests}
//                 className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group text-left"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 bg-green-50 rounded-lg">
//                     <CheckSquare className="h-5 w-5 text-green-600" />
//                   </div>
//                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
//                 </div>
//                 <p className="font-medium text-gray-900">Approve Requests</p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {stats.pendingRequests} requests pending
//                 </p>
//               </button>

//               <button
//                 onClick={handleViewOverload}
//                 className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-300 hover:shadow-md transition-all group text-left"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 bg-red-50 rounded-lg">
//                     <AlertTriangle className="h-5 w-5 text-red-600" />
//                   </div>
//                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
//                 </div>
//                 <p className="font-medium text-gray-900">Overload Management</p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {stats.overloadCount} overload alerts
//                 </p>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Sidebar */}
//         <div className="space-y-6">
//           {/* Pending Approvals */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <CheckSquare className="h-5 w-5 text-amber-600 mr-2" />
//                 Pending Approvals
//                 <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
//                   {pendingApprovals.length}
//                 </span>
//               </h2>
//             </div>

//             <div className="max-h-96 overflow-y-auto">
//               {pendingApprovals.length > 0 ? (
//                 pendingApprovals.map((request) => (
//                   <div
//                     key={request.request_id}
//                     className="p-4 border-b hover:bg-gray-50"
//                   >
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <h4 className="font-medium text-gray-900">
//                           {request.course_code}
//                         </h4>
//                         <p className="text-sm text-gray-600 mt-1">
//                           Requested by {request.staff_name}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-1">
//                           {new Date(request.created_at).toLocaleDateString()}
//                         </p>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={() =>
//                             handleApprovalAction(request.request_id, "approve")
//                           }
//                           className="p-1 text-green-600 hover:bg-green-50 rounded"
//                           title="Approve"
//                         >
//                           <CheckCircle className="h-4 w-4" />
//                         </button>
//                         <button
//                           onClick={() =>
//                             handleApprovalAction(request.request_id, "reject")
//                           }
//                           className="p-1 text-red-600 hover:bg-red-50 rounded"
//                           title="Reject"
//                         >
//                           <XCircle className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </div>
//                     <div className="mt-2 text-xs text-gray-600 line-clamp-2">
//                       {request.reason}
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-8 text-center">
//                   <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-500">No pending approvals</p>
//                 </div>
//               )}
//             </div>

//             <div className="p-4 border-t">
//               <Link
//                 to="/approvals/course-requests"
//                 className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
//               >
//                 View all pending requests
//                 <ChevronRight className="h-4 w-4 ml-1" />
//               </Link>
//             </div>
//           </div>

//           {/* Overload Alerts */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
//                 Overload Alerts
//                 <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
//                   {overloadAlerts.length}
//                 </span>
//               </h2>
//             </div>

//             <div className="max-h-80 overflow-y-auto">
//               {overloadAlerts.length > 0 ? (
//                 overloadAlerts.map((alert) => (
//                   <div
//                     key={alert.staff_id}
//                     className="p-4 border-b hover:bg-red-50"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h4 className="font-medium text-gray-900">
//                           {alert.staff_name}
//                         </h4>
//                         <div className="flex items-center mt-1">
//                           <div className="w-full bg-gray-200 rounded-full h-1.5">
//                             <div
//                               className={`h-1.5 rounded-full ${
//                                 alert.load_percentage < 100
//                                   ? "bg-amber-500"
//                                   : "bg-red-600"
//                               }`}
//                               style={{
//                                 width: `${Math.min(
//                                   alert.load_percentage,
//                                   100
//                                 )}%`,
//                               }}
//                             ></div>
//                           </div>
//                           <span className="ml-2 text-sm font-medium text-red-600">
//                             {alert.load_percentage}%
//                           </span>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() =>
//                           handleStaffAction(alert.staff_id, "review")
//                         }
//                         className="text-sm text-red-600 hover:text-red-800"
//                       >
//                         Review
//                       </button>
//                     </div>
//                     <div className="mt-2 text-xs text-gray-600">
//                       {alert.courses_count} courses • {alert.total_hours} hours
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-8 text-center">
//                   <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
//                   <p className="text-gray-500">No overload alerts</p>
//                   <p className="text-sm text-gray-400 mt-1">
//                     All staff within limits
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Recent Activities */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <Activity className="h-5 w-5 text-blue-600 mr-2" />
//                 Recent Activities
//               </h2>
//             </div>

//             <div className="max-h-96 overflow-y-auto">
//               {recentActivities.length > 0 ? (
//                 recentActivities.map((activity) => (
//                   <div
//                     key={activity.id}
//                     className="p-4 border-b hover:bg-gray-50"
//                   >
//                     <div className="flex items-start space-x-3">
//                       <div className={`p-2 rounded-lg ${activity.bgColor}`}>
//                         <activity.icon
//                           className={`h-4 w-4 ${activity.color}`}
//                         />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="text-sm font-medium text-gray-900">
//                           {activity.title}
//                         </h4>
//                         <p className="text-sm text-gray-600 mt-1">
//                           {activity.description}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-1">
//                           {new Date(activity.time).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-8 text-center">
//                   <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-500">No recent activities</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DepartmentHeadDashboard;


// src/components/dashboard/DepartmentHeadDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  departmentAPI,
  staffAPI,
  courseAssignmentAPI,
  courseRequestAPI,
  overloadDetectionAPI,
  semesterAPI,
  semesterUtils,
  staffUtils,
  courseAssignmentUtils
} from '../../../api';
import toast from 'react-hot-toast';
import {
  Users,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  Edit,
  MoreVertical,
  ChevronRight,
  Plus,
  RefreshCw,
  Filter,
  Search,
  UserCheck,
  FileText,
  CheckSquare,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart,
  Target,
  Activity,
  Shield,
  Building,
  GraduationCap,
  Layers
} from 'lucide-react';

const DepartmentHeadDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeCourses: 0,
    pendingRequests: 0,
    workloadHours: 0,
    overloadCount: 0,
    averageLoad: 0,
    completionRate: 0,
    assignedSections: 0,
    totalStudents: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [overloadAlerts, setOverloadAlerts] = useState([]);
  const [semesterInfo, setSemesterInfo] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current semester using semesterAPI
      const semesterRes = await semesterAPI.getCurrentSemester();
      const currentSemester = semesterRes.data;
      setSemesterInfo(currentSemester);
      
      if (!currentSemester) {
        toast.error('No active semester found');
        return;
      }
      
      // Get department head's staff profile
      let staffData;
      try {
        const staffRes = await staffAPI.getMyProfile();
        staffData = staffRes.data;
      } catch (staffError) {
        console.log('No staff profile found, trying department API...');
        // If no staff profile, try to get department from user context
        staffData = {
          department_id: user?.department_id || null
        };
      }
      
      if (!staffData?.department_id) {
        toast.error('You are not assigned to any department');
        setLoading(false);
        return;
      }
      
      // Get department details
      try {
        const deptRes = await departmentAPI.getDepartmentById(staffData.department_id);
        const department = deptRes.data;
        setDepartmentInfo(department);
      } catch (deptError) {
        console.error('Error fetching department:', deptError);
        toast.error('Failed to load department information');
      }
      
      // Fetch multiple data in parallel
      const [
        dashboardRes,
        staffListRes,
        requestsRes,
        assignmentsRes,
        overloadRes
      ] = await Promise.allSettled([
        departmentAPI.getDepartmentDashboard?.(staffData.department_id, 'current_semester'),
        departmentAPI.getDepartmentStaff?.(staffData.department_id, { 
          page: 1, 
          limit: 10,
          is_active: true 
        }),
        courseRequestAPI.getPendingRequests?.({
          department_id: staffData.department_id,
          status: 'pending'
        }),
        courseAssignmentAPI.getDepartmentAssignments?.({
          department_id: staffData.department_id,
          semester_id: currentSemester.semester_id
        }),
        overloadDetectionAPI.checkDepartmentOverload?.(
          staffData.department_id,
          currentSemester.semester_id
        )
      ]);
      
      // Calculate statistics
      const dashboardStats = dashboardRes.value?.data || {};
      const staffs = staffListRes.value?.data?.staff || staffListRes.value?.data || [];
      const requests = requestsRes.value?.data?.requests || requestsRes.value?.data || [];
      const assignments = assignmentsRes.value?.data?.assignments || assignmentsRes.value?.data || [];
      const overloadData = overloadRes.value?.data || {};
      
      // Calculate workload hours
      const totalWorkloadHours = assignments.reduce((sum, assignment) => {
        return sum + (assignment.total_hours || assignment.credit_hours || 0);
      }, 0);
      
      // Calculate overload count
      const overloadCount = overloadData.overloaded_staff?.length || 0;
      
      // Calculate staff workload percentages
      let totalLoadPercentage = 0;
      let staffCount = 0;
      
      const formattedStaff = staffs.map(staff => {
        const loadPercentage = calculateStaffLoadPercentage(staff, assignments, currentSemester.semester_id);
        totalLoadPercentage += loadPercentage;
        if (loadPercentage > 0) staffCount++;
        
        return {
          ...staff,
          load_percentage: loadPercentage,
          total_hours: calculateStaffTotalHours(staff, assignments),
          workload_status: getWorkloadStatus(loadPercentage),
          action_required: loadPercentage > 100 || (staff.pending_approvals > 0)
        };
      });
      
      // Calculate assigned sections and students
      const assignedSections = assignments.filter(a => a.instructor_id).length;
      const totalStudents = assignments.reduce((sum, assignment) => 
        sum + (assignment.student_count || 0), 0
      );
      
      // Set stats
      setStats({
        totalStaff: staffs.length,
        activeCourses: assignments.length,
        pendingRequests: requests.length,
        workloadHours: totalWorkloadHours,
        overloadCount,
        averageLoad: staffCount > 0 ? Math.round(totalLoadPercentage / staffCount) : 0,
        completionRate: dashboardStats.completion_rate || 0,
        assignedSections,
        totalStudents
      });
      
      // Set staff list
      setStaffList(formattedStaff);
      
      // Set pending approvals
      setPendingApprovals(requests.slice(0, 5));
      
      // Set overload alerts
      const alerts = overloadData.overloaded_staff?.slice(0, 5) || [];
      setOverloadAlerts(alerts);
      
      // Generate and set recent activities
      const activities = generateRecentActivities(
        assignments,
        requests,
        alerts
      );
      setRecentActivities(activities.slice(0, 10));
      
      // Set complete dashboard data
      setDashboardData(dashboardStats);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Helper function to calculate staff load percentage
  const calculateStaffLoadPercentage = (staff, assignments, semesterId) => {
    const staffAssignments = assignments.filter(
      a => a.staff_id === staff.staff_id || a.instructor_id === staff.user_id
    );
    
    const totalHours = staffAssignments.reduce((sum, a) => 
      sum + (a.total_hours || a.credit_hours || 0), 0
    );
    
    // Default max hours based on academic rank
    const rankLimits = {
      graduate_assistant: 12,
      assistant_lecturer: 15,
      lecturer: 18,
      assistant_professor: 16,
      associate_professor: 14,
      professor: 12
    };
    
    const maxHours = rankLimits[staff.academic_rank] || 18;
    return maxHours > 0 ? Math.round((totalHours / maxHours) * 100) : 0;
  };

  // Helper function to calculate staff total hours
  const calculateStaffTotalHours = (staff, assignments) => {
    const staffAssignments = assignments.filter(
      a => a.staff_id === staff.staff_id || a.instructor_id === staff.user_id
    );
    
    return staffAssignments.reduce((sum, a) => 
      sum + (a.total_hours || a.credit_hours || 0), 0
    );
  };

  // Helper function to get workload status
  const getWorkloadStatus = (percentage) => {
    if (!percentage) return { label: 'No Data', color: 'gray', variant: 'secondary' };
    if (percentage < 50) return { label: 'Light', color: 'green', variant: 'success' };
    if (percentage < 80) return { label: 'Normal', color: 'green', variant: 'success' };
    if (percentage < 100) return { label: 'High', color: 'amber', variant: 'warning' };
    return { label: 'Overloaded', color: 'red', variant: 'danger' };
  };

  // Generate recent activities
  const generateRecentActivities = (assignments, requests, overloads) => {
    const activities = [];
    
    // Add recent assignments (last 3 days)
    const recentAssignments = assignments.filter(assignment => {
      const createdDate = new Date(assignment.created_at || assignment.assigned_date);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return createdDate > threeDaysAgo;
    });
    
    recentAssignments.slice(0, 3).forEach(assignment => {
      activities.push({
        id: `assign-${assignment.assignment_id || assignment.id}`,
        type: 'assignment',
        title: 'Course Assigned',
        description: `${assignment.course_code || 'Course'} assigned`,
        time: assignment.created_at || new Date().toISOString(),
        icon: BookOpen,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      });
    });
    
    // Add recent requests
    requests.slice(0, 3).forEach(request => {
      activities.push({
        id: `request-${request.request_id || request.id}`,
        type: 'request',
        title: 'Course Request',
        description: `Request for ${request.course_code || 'course'}`,
        time: request.created_at || new Date().toISOString(),
        icon: FileText,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      });
    });
    
    // Add overload alerts
    (overloads || []).slice(0, 3).forEach(alert => {
      activities.push({
        id: `overload-${alert.staff_id || alert.id}`,
        type: 'overload',
        title: 'Overload Alert',
        description: alert.staff_name ? `${alert.staff_name} overloaded` : 'Staff overload detected',
        time: new Date().toISOString(),
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    });
    
    return activities.sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  // Quick action handlers
  const handleAssignCourse = () => {
    navigate('/workload/dept/assignments');
  };

  const handleApproveRequests = () => {
    navigate('/approvals/course-requests');
  };

  const handleViewOverload = () => {
    navigate('/overload/dept');
  };

  const handleViewDepartment = () => {
    navigate('/department');
  };

  const handleExportReport = async () => {
    try {
      toast.loading('Generating report...');
      // Implementation for export
      // You can use exportAPI here
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  // Handle staff action
  const handleStaffAction = (staffId, action) => {
    switch (action) {
      case 'view':
        navigate(`/workload/dept/staff/${staffId}`);
        break;
      case 'assign':
        navigate(`/workload/dept/assign?staff_id=${staffId}`);
        break;
      case 'review':
        navigate(`/overload/dept/staff/${staffId}`);
        break;
      default:
        break;
    }
  };

  // Handle approval action
  const handleApprovalAction = async (requestId, action) => {
    try {
      if (action === 'approve') {
        await courseRequestAPI.approveRequest?.(requestId);
        toast.success('Request approved');
      } else {
        await courseRequestAPI.rejectRequest?.(requestId, 'Rejected by department head');
        toast.success('Request rejected');
      }
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Action failed');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading department dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {departmentInfo?.department_name || 'Department'} Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                {departmentInfo?.department_code ? `${departmentInfo.department_code} • ` : ''}
                {semesterInfo ? `${semesterInfo.semester_name} ${semesterInfo.year_code}` : 'Current Semester'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStaff}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-green-600 font-medium flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Active members
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link 
              to="/department/staff" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View all staff
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Active Courses */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeCourses}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-amber-600 font-medium">
                  {stats.assignedSections} sections assigned
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={handleAssignCourse}
              className="text-sm text-green-600 hover:text-green-800 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Assign course
            </button>
          </div>
        </div>

        {/* Workload Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Workload</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.workloadHours} hrs</p>
              <div className="flex items-center mt-2">
                <span className={`text-xs font-medium ${
                  stats.averageLoad < 80 ? 'text-green-600' :
                  stats.averageLoad < 100 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  Avg: {stats.averageLoad}% capacity
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link 
              to="/workload/dept/overview" 
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
            >
              Workload overview
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Overload Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.overloadCount}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-red-600 font-medium flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overload alerts
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={handleViewOverload}
              className="text-sm text-red-600 hover:text-red-800 flex items-center"
            >
              View alerts
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingRequests}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <CheckSquare className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <button
            onClick={handleApproveRequests}
            className="mt-4 text-sm text-amber-600 hover:text-amber-800 font-medium"
          >
            Review requests →
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Assigned Sections</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.assignedSections}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Layers className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {stats.totalStudents} total students
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completionRate}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Workload assignment progress
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Staff Workload */}
        <div className="lg:col-span-2 space-y-6">
          {/* Staff Workload Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Staff Workload Status</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search staff..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-48"
                    />
                  </div>
                  <Link
                    to="/department/staff"
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Load
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staffList.length > 0 ? (
                    staffList.map((staff) => {
                      const status = staff.workload_status || getWorkloadStatus(staff.load_percentage);
                      const fullName = staffUtils.formatFullName?.(staff) || 
                                       `${staff.first_name} ${staff.last_name}`;
                      const rankDisplay = staffUtils.formatAcademicRank?.(staff.academic_rank) || 
                                         staff.academic_rank?.replace('_', ' ') || 'Staff';
                      
                      return (
                        <tr key={staff.staff_id || staff.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {staff.first_name?.charAt(0) || 'S'}{staff.last_name?.charAt(0) || 'T'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {staff.employee_id || staff.username || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {rankDisplay}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{staff.total_hours || 0} hrs</div>
                            <div className="text-xs text-gray-500">
                              {staff.load_percentage || 0}% capacity
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${status.variant === 'success' ? 'bg-green-100 text-green-800' : 
                                status.variant === 'warning' ? 'bg-amber-100 text-amber-800' : 
                                status.variant === 'danger' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleStaffAction(staff.staff_id || staff.id, 'view')}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStaffAction(staff.staff_id || staff.id, 'assign')}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Assign Course"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              {staff.load_percentage > 80 && (
                                <button
                                  onClick={() => handleStaffAction(staff.staff_id || staff.id, 'review')}
                                  className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                  title="Review Overload"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No staff members found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Staff will appear here once assigned to department
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <Link
                to="/workload/dept/assignments"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign new course
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleAssignCourse}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </div>
                <p className="font-medium text-gray-900">Assign Courses</p>
                <p className="text-sm text-gray-500 mt-1">Assign courses to staff</p>
              </button>
              
              <button
                onClick={handleApproveRequests}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                </div>
                <p className="font-medium text-gray-900">Approve Requests</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.pendingRequests} pending
                </p>
              </button>
              
              <button
                onClick={handleViewOverload}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-300 hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                </div>
                <p className="font-medium text-gray-900">Overload Control</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.overloadCount} alerts
                </p>
              </button>
              
              <button
                onClick={handleViewDepartment}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Building className="h-5 w-5 text-purple-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                </div>
                <p className="font-medium text-gray-900">Department Info</p>
                <p className="text-sm text-gray-500 mt-1">View department details</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckSquare className="h-5 w-5 text-amber-600 mr-2" />
                Pending Approvals
                {stats.pendingRequests > 0 && (
                  <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {stats.pendingRequests}
                  </span>
                )}
              </h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((request) => (
                  <div
                    key={request.request_id || request.id}
                    className="p-4 border-b hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {request.course_code || 'Course Request'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {request.staff_name || 'Staff'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleApprovalAction(request.request_id || request.id, 'approve')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApprovalAction(request.request_id || request.id, 'reject')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {request.reason && (
                      <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                        {request.reason}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending approvals</p>
                  <p className="text-sm text-gray-400 mt-1">All caught up!</p>
                </div>
              )}
            </div>
            
            {stats.pendingRequests > 0 && (
              <div className="p-4 border-t">
                <Link
                  to="/approvals/course-requests"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
                >
                  View all pending requests
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            )}
          </div>

          {/* Overload Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                Overload Alerts
                {stats.overloadCount > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {stats.overloadCount}
                  </span>
                )}
              </h2>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {overloadAlerts.length > 0 ? (
                overloadAlerts.map((alert, index) => {
                  const staffName = alert.staff_name || alert.name || `Staff ${index + 1}`;
                  const loadPercentage = alert.load_percentage || 100;
                  
                  return (
                    <div
                      key={alert.staff_id || alert.id || index}
                      className="p-4 border-b hover:bg-red-50 cursor-pointer"
                      onClick={() => handleStaffAction(alert.staff_id || alert.id, 'review')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{staffName}</h4>
                          <div className="flex items-center mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  loadPercentage < 100 ? 'bg-amber-500' : 'bg-red-600'
                                }`}
                                style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-red-600">
                              {loadPercentage}%
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {alert.courses_count || alert.course_count || 0} courses
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-500">No overload alerts</p>
                  <p className="text-sm text-gray-400 mt-1">All staff within limits</p>
                </div>
              )}
            </div>
            
            {stats.overloadCount > 0 && (
              <div className="p-4 border-t">
                <button
                  onClick={handleViewOverload}
                  className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center justify-center w-full"
                >
                  Manage all overloads
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 text-blue-600 mr-2" />
                Recent Activities
              </h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="p-4 border-b hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.time).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activities</p>
                  <p className="text-sm text-gray-400 mt-1">Activities will appear here</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="text-xs text-gray-500 text-center">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHeadDashboard;