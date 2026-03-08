// // src/pages/workload/dept/CourseAssignments.jsx
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../../contexts/AuthContext";
// import { courseAssignmentAPI, courseAssignmentUtils } from "../../../api/";
// import toast from "react-hot-toast";
// import {
//   Search,
//   Filter,
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   CheckCircle,
//   XCircle,
//   Users,
//   Calendar,
//   BookOpen,
//   Clock,
//   Download,
//   Upload,
//   ChevronDown,
//   ChevronRight,
//   Loader2,
//   AlertCircle,
//   UserCheck,
//   UserX,
//   FileText,
//   BarChart3,
//   MoreVertical,
//   RefreshCw,
//   ExternalLink,
//   Printer,
//   Mail,
//   Copy,
//   Link,
//   Shield,
//   TrendingUp,
//   Award,
// } from "lucide-react";

// // Subcomponents
// const AssignmentCard = ({ assignment, onAction }) => {
//   const [showActions, setShowActions] = useState(false);

//   const statusConfig = {
//     assigned: {
//       color: "border-l-yellow-500",
//       bg: "bg-yellow-50",
//       text: "Assigned",
//       icon: Clock,
//     },
//     accepted: {
//       color: "border-l-green-500",
//       bg: "bg-green-50",
//       text: "Accepted",
//       icon: CheckCircle,
//     },
//     declined: {
//       color: "border-l-red-500",
//       bg: "bg-red-50",
//       text: "Declined",
//       icon: XCircle,
//     },
//     pending: {
//       color: "border-l-blue-500",
//       bg: "bg-blue-50",
//       text: "Pending",
//       icon: AlertCircle,
//     },
//     withdrawn: {
//       color: "border-l-gray-500",
//       bg: "bg-gray-50",
//       text: "Withdrawn",
//       icon: UserX,
//     },
//   };

//   const programTypeConfig = {
//     regular: { color: "bg-blue-100 text-blue-800", icon: BookOpen },
//     extension: { color: "bg-purple-100 text-purple-800", icon: FileText },
//     summer: { color: "bg-orange-100 text-orange-800", icon: Award },
//     distance: { color: "bg-teal-100 text-teal-800", icon: ExternalLink },
//     weekend: { color: "bg-indigo-100 text-indigo-800", icon: Calendar },
//   };

//   const status = statusConfig[assignment.status] || statusConfig.assigned;
//   const programType =
//     programTypeConfig[assignment.program_type] || programTypeConfig.regular;
//   const StatusIcon = status.icon;

//   return (
//     <div
//       className={`border-l-4 ${status.color} border rounded-lg p-4 ${status.bg} hover:shadow-md transition-shadow`}
//     >
//       <div className="flex justify-between items-start">
//         <div className="flex-1">
//           <div className="flex items-start justify-between">
//             <div>
//               <h4 className="font-semibold text-gray-900 flex items-center gap-2">
//                 <BookOpen className="w-4 h-4 text-gray-500" />
//                 {assignment.course_code} - {assignment.course_title}
//               </h4>
//               <p className="text-sm text-gray-600 mt-1">
//                 {assignment.course_description}
//               </p>
//             </div>
//             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border">
//               <StatusIcon className="w-3 h-3 mr-1" />
//               {status.text}
//             </span>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
//             <div className="space-y-1">
//               <p className="text-xs text-gray-500">Instructor</p>
//               <div className="flex items-center gap-2">
//                 <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
//                   <Users className="w-3 h-3 text-purple-600" />
//                 </div>
//                 <p className="text-sm font-medium">
//                   {assignment.staff_first_name} {assignment.staff_last_name}
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-1">
//               <p className="text-xs text-gray-500">Program Type</p>
//               <span
//                 className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${programType.color}`}
//               >
//                 {assignment.program_type?.charAt(0).toUpperCase() +
//                   assignment.program_type?.slice(1)}
//               </span>
//             </div>

//             <div className="space-y-1">
//               <p className="text-xs text-gray-500">Student Year</p>
//               <p className="text-sm font-medium">
//                 Year {assignment.student_year || "N/A"}
//               </p>
//             </div>

//             <div className="space-y-1">
//               <p className="text-xs text-gray-500">Section</p>
//               <p className="text-sm font-medium">
//                 {assignment.section_code || "N/A"}
//               </p>
//             </div>
//           </div>

//           <div className="mt-4 pt-3 border-t border-gray-200">
//             <div className="flex items-center justify-between text-sm">
//               <div className="flex items-center gap-4">
//                 <span className="text-gray-600">
//                   <Calendar className="w-4 h-4 inline mr-1" />
//                   {new Date(assignment.assigned_date).toLocaleDateString()}
//                 </span>
//                 <span className="text-gray-600">
//                   <Clock className="w-4 h-4 inline mr-1" />
//                   {assignment.credit_hours} credit hours
//                 </span>
//               </div>
//               {assignment.is_overload && (
//                 <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
//                   <AlertCircle className="w-3 h-3 mr-1" />
//                   Overload
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="relative ml-4">
//           <button
//             onClick={() => setShowActions(!showActions)}
//             className="p-1 hover:bg-gray-100 rounded"
//           >
//             <MoreVertical className="w-5 h-5 text-gray-500" />
//           </button>

//           {showActions && (
//             <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
//               <div className="py-1">
//                 <button
//                   onClick={() => onAction("view", assignment)}
//                   className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   <Eye className="w-4 h-4 mr-2" />
//                   View Details
//                 </button>
//                 {assignment.status === "assigned" && (
//                   <>
//                     <button
//                       onClick={() => onAction("accept", assignment)}
//                       className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
//                     >
//                       <CheckCircle className="w-4 h-4 mr-2" />
//                       Accept
//                     </button>
//                     <button
//                       onClick={() => onAction("decline", assignment)}
//                       className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
//                     >
//                       <XCircle className="w-4 h-4 mr-2" />
//                       Decline
//                     </button>
//                   </>
//                 )}
//                 <button
//                   onClick={() => onAction("edit", assignment)}
//                   className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
//                 >
//                   <Edit className="w-4 h-4 mr-2" />
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => onAction("delete", assignment)}
//                   className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
//                 >
//                   <Trash2 className="w-4 h-4 mr-2" />
//                   Delete
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatsCard = ({
//   title,
//   value,
//   icon: Icon,
//   color,
//   trend,
//   loading = false,
// }) => (
//   <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-gray-600">{title}</p>
//         {loading ? (
//           <Loader2 className="w-6 h-6 mt-2 animate-spin text-gray-400" />
//         ) : (
//           <p
//             className={`text-2xl font-bold mt-1 ${
//               color.text || "text-gray-900"
//             }`}
//           >
//             {value}
//           </p>
//         )}
//         {trend && (
//           <div className={`flex items-center mt-2 text-sm ${trend.color}`}>
//             <TrendingUp
//               className={`w-4 h-4 mr-1 ${
//                 trend.direction === "up"
//                   ? "transform rotate-0"
//                   : "transform rotate-180"
//               }`}
//             />
//             {trend.value}% from last month
//           </div>
//         )}
//       </div>
//       <div className={`p-3 rounded-lg ${color.bg || "bg-gray-100"}`}>
//         <Icon className={`w-6 h-6 ${color.icon || "text-gray-600"}`} />
//       </div>
//     </div>
//   </div>
// );

// const FilterPanel = ({
//   filters,
//   onFilterChange,
//   onApplyFilters,
//   onReset,
//   semesters,
// }) => {
//   const [advancedOpen, setAdvancedOpen] = useState(false);

//   return (
//     <div className="bg-white rounded-xl border p-5">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//           <Filter className="w-5 h-5 mr-2 text-gray-500" />
//           Filters
//         </h3>
//         <button
//           onClick={onReset}
//           className="text-sm text-gray-600 hover:text-gray-900"
//         >
//           Reset all
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             <Search className="w-4 h-4 inline mr-1" />
//             Search
//           </label>
//           <input
//             type="text"
//             placeholder="Course, instructor, or code..."
//             value={filters.search}
//             onChange={(e) => onFilterChange("search", e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Status
//           </label>
//           <select
//             value={filters.status}
//             onChange={(e) => onFilterChange("status", e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="">All Status</option>
//             <option value="assigned">Assigned</option>
//             <option value="accepted">Accepted</option>
//             <option value="declined">Declined</option>
//             <option value="pending">Pending</option>
//             <option value="withdrawn">Withdrawn</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Program Type
//           </label>
//           <select
//             value={filters.program_type}
//             onChange={(e) => onFilterChange("program_type", e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="">All Types</option>
//             <option value="regular">Regular</option>
//             <option value="extension">Extension</option>
//             <option value="summer">Summer</option>
//             <option value="distance">Distance</option>
//             <option value="weekend">Weekend</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Student Year
//           </label>
//           <select
//             value={filters.student_year}
//             onChange={(e) => onFilterChange("student_year", e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="">All Years</option>
//             {[1, 2, 3, 4, 5, 6, 7].map((year) => (
//               <option key={year} value={year}>
//                 Year {year}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <button
//         onClick={() => setAdvancedOpen(!advancedOpen)}
//         className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
//       >
//         {advancedOpen ? (
//           <ChevronDown className="w-4 h-4 mr-1" />
//         ) : (
//           <ChevronRight className="w-4 h-4 mr-1" />
//         )}
//         Advanced Filters
//       </button>

//       {advancedOpen && (
//         <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Semester
//             </label>
//             <select
//               value={filters.semester_id}
//               onChange={(e) => onFilterChange("semester_id", e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">All Semesters</option>
//               {semesters.map((semester) => (
//                 <option key={semester.semester_id} value={semester.semester_id}>
//                   {semester.semester_name} ({semester.semester_code})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Academic Rank
//             </label>
//             <select
//               value={filters.academic_rank}
//               onChange={(e) => onFilterChange("academic_rank", e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">All Ranks</option>
//               <option value="lecturer">Lecturer</option>
//               <option value="assistant_professor">Assistant Professor</option>
//               <option value="associate_professor">Associate Professor</option>
//               <option value="professor">Professor</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Sort By
//             </label>
//             <select
//               value={filters.sort_by}
//               onChange={(e) => onFilterChange("sort_by", e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="assigned_date">Assigned Date</option>
//               <option value="course_code">Course Code</option>
//               <option value="staff_name">Instructor</option>
//               <option value="status">Status</option>
//             </select>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 flex justify-end space-x-3">
//         <button
//           onClick={() => onApplyFilters(false)}
//           className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
//         >
//           <Filter className="w-4 h-4 mr-2" />
//           Apply Filters
//         </button>
//         <button
//           onClick={() => onApplyFilters(true)}
//           className="px-5 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
//         >
//           Apply & Export
//         </button>
//       </div>
//     </div>
//   );
// };

// const CourseAssignments = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // State
//   const [loading, setLoading] = useState(true);
//   const [assignments, setAssignments] = useState([]);
//   const [semesters, setSemesters] = useState([]);
//   const [formData, setFormData] = useState(null);
//   const [viewMode, setViewMode] = useState("list");
//   const [selectedAssignments, setSelectedAssignments] = useState(new Set());
//   const [showBulkActions, setShowBulkActions] = useState(false);

//   // Stats
//   const [stats, setStats] = useState({
//     total: 0,
//     assigned: 0,
//     accepted: 0,
//     declined: 0,
//     pending: 0,
//     withdrawn: 0,
//     overload: 0,
//     byProgramType: {},
//   });

//   // Filters
//   const [filters, setFilters] = useState({
//     semester_id: "",
//     status: "",
//     program_type: "",
//     student_year: "",
//     academic_rank: "",
//     search: "",
//     sort_by: "assigned_date",
//     sort_order: "desc",
//   });

//   // Pagination
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0,
//   });

//   // Fetch initial data
//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     try {
//       setLoading(true);

//       // Get form data for dropdowns
//       const formDataRes = await courseAssignmentAPI.getAssignmentFormData();
//       if (formDataRes?.data) {
//         setFormData(formDataRes.data);
//         const semestersData = formDataRes.data.semesters || [];
//         setSemesters(semestersData);

//         // Set default semester if current semester exists
//         const defaultSemester = formDataRes.data.current_semester;
//         if (defaultSemester) {
//           setFilters((prev) => ({
//             ...prev,
//             semester_id: defaultSemester.semester_id,
//           }));
//         } else if (semestersData.length > 0) {
//           // Fallback to first semester if no current semester
//           setFilters((prev) => ({
//             ...prev,
//             semester_id: semestersData[0].semester_id,
//           }));
//         }
//       } else {
//         // Fallback data if API fails
//         const fallbackSemesters = [
//           { semester_id: 1, semester_name: "Fall 2024", semester_code: "F24" },
//           {
//             semester_id: 2,
//             semester_name: "Spring 2024",
//             semester_code: "S24",
//           },
//         ];
//         setSemesters(fallbackSemesters);
//         setFilters((prev) => ({
//           ...prev,
//           semester_id: fallbackSemesters[0].semester_id,
//         }));
//         toast.error("Could not load form data. Using fallback data.");
//       }

//       await fetchAssignments();
//     } catch (error) {
//       console.error("Error fetching initial data:", error);
//       toast.error("Failed to load initial data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAssignments = useCallback(
//     async (resetPage = true) => {
//       try {
//         if (resetPage) {
//           setPagination((prev) => ({ ...prev, page: 1 }));
//         }

//         const cleanFilters = courseAssignmentUtils.prepareFilterParams(filters);
//         const params = {
//           ...cleanFilters,
//           page: pagination.page,
//           limit: pagination.limit,
//         };

//         const response = await courseAssignmentAPI.getDepartmentAssignments(
//           params
//         );

//         if (response?.data) {
//           const formattedAssignments =
//             response.data.assignments?.map((assignment) =>
//               courseAssignmentUtils.formatAssignmentForDisplay(assignment)
//             ) || [];

//           setAssignments(formattedAssignments);
//           setPagination(response.data.pagination || pagination);
//           calculateStatistics(formattedAssignments);
//         } else {
//           toast.error(response?.message || "Failed to fetch assignments");
//         }
//       } catch (error) {
//         console.error("Error fetching assignments:", error);
//         const errorMsg =
//           error.response?.data?.message ||
//           "Failed to fetch assignments. Please try again.";
//         toast.error(errorMsg);
//       }
//     },
//     [filters, pagination.page, pagination.limit]
//   );

//   const calculateStatistics = (assignmentsList) => {
//     const stats = {
//       total: assignmentsList.length,
//       assigned: assignmentsList.filter((a) => a.status === "assigned").length,
//       accepted: assignmentsList.filter((a) => a.status === "accepted").length,
//       declined: assignmentsList.filter((a) => a.status === "declined").length,
//       pending: assignmentsList.filter((a) => a.status === "pending").length,
//       withdrawn: assignmentsList.filter((a) => a.status === "withdrawn").length,
//       overload: assignmentsList.filter((a) => a.is_overload).length,
//       byProgramType: {},
//     };

//     // Calculate by program type
//     assignmentsList.forEach((assignment) => {
//       const type = assignment.program_type || "regular";
//       if (!stats.byProgramType[type]) {
//         stats.byProgramType[type] = 0;
//       }
//       stats.byProgramType[type]++;
//     });

//     setStats(stats);
//   };

//   // Handle filter changes
//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleApplyFilters = (exportData = false) => {
//     fetchAssignments(true);
//     if (exportData) {
//       handleExportAssignments();
//     }
//   };

//   const handleResetFilters = () => {
//     const defaultSemesterId =
//       formData?.current_semester?.semester_id ||
//       (semesters.length > 0 ? semesters[0].semester_id : "");

//     setFilters({
//       semester_id: defaultSemesterId,
//       status: "",
//       program_type: "",
//       student_year: "",
//       academic_rank: "",
//       search: "",
//       sort_by: "assigned_date",
//       sort_order: "desc",
//     });
//   };

//   // Handle page change
//   const handlePageChange = (newPage) => {
//     setPagination((prev) => ({ ...prev, page: newPage }));
//     fetchAssignments(false);
//   };

//   // Handle assignment actions
//   const handleAssignmentAction = async (action, assignment) => {
//     try {
//       switch (action) {
//         case "view":
//           navigate(
//             `/workload/dept/assignments/view/${assignment.assignment_id}`
//           );
//           break;
//         case "edit":
//           navigate(
//             `/workload/dept/assignments/edit/${assignment.assignment_id}`
//           );
//           break;
//         case "delete":
//           if (
//             window.confirm(`Delete assignment for ${assignment.course_code}?`)
//           ) {
//             const response = await courseAssignmentAPI.withdrawAssignment(
//               assignment.assignment_id,
//               "Deleted by department head"
//             );
//             if (response?.success) {
//               toast.success("Assignment deleted");
//               fetchAssignments();
//             } else {
//               toast.error(response?.message || "Failed to delete assignment");
//             }
//           }
//           break;
//         case "accept":
//           { const acceptResponse = await courseAssignmentAPI.acceptAssignment(
//             assignment.assignment_id
//           );
//           if (acceptResponse?.success) {
//             toast.success("Assignment accepted");
//             fetchAssignments();
//           } else {
//             toast.error(
//               acceptResponse?.message || "Failed to accept assignment"
//             );
//           }
//           break; }
//         case "decline":
//           { const declineResponse = await courseAssignmentAPI.declineAssignment(
//             assignment.assignment_id,
//             "Declined by department head"
//           );
//           if (declineResponse?.success) {
//             toast.success("Assignment declined");
//             fetchAssignments();
//           } else {
//             toast.error(
//               declineResponse?.message || "Failed to decline assignment"
//             );
//           }
//           break; }
//       }
//     } catch (error) {
//       console.error(`Error ${action} assignment:`, error);
//       const errorMsg =
//         error.response?.data?.message || `Failed to ${action} assignment`;
//       toast.error(errorMsg);
//     }
//   };

//   // Handle bulk actions
//   const handleBulkAction = async (action) => {
//     if (selectedAssignments.size === 0) {
//       toast.error("No assignments selected");
//       return;
//     }

//     try {
//       switch (action) {
//         case "accept":
//           for (const assignmentId of selectedAssignments) {
//             await courseAssignmentAPI.acceptAssignment(assignmentId);
//           }
//           toast.success(`${selectedAssignments.size} assignments accepted`);
//           break;
//         case "decline":
//           { const reason = prompt("Reason for declining:");
//           if (reason) {
//             for (const assignmentId of selectedAssignments) {
//               await courseAssignmentAPI.declineAssignment(assignmentId, reason);
//             }
//             toast.success(`${selectedAssignments.size} assignments declined`);
//           }
//           break; }
//         case "delete":
//           if (
//             window.confirm(`Delete ${selectedAssignments.size} assignments?`)
//           ) {
//             for (const assignmentId of selectedAssignments) {
//               await courseAssignmentAPI.withdrawAssignment(
//                 assignmentId,
//                 "Bulk delete"
//               );
//             }
//             toast.success(`${selectedAssignments.size} assignments deleted`);
//           }
//           break;
//       }

//       setSelectedAssignments(new Set());
//       setShowBulkActions(false);
//       fetchAssignments();
//     } catch (error) {
//       console.error("Error performing bulk action:", error);
//       const errorMsg =
//         error.response?.data?.message || "Failed to perform bulk action";
//       toast.error(errorMsg);
//     }
//   };

//   // Export assignments
//   const handleExportAssignments = () => {
//     try {
//       const exportData = courseAssignmentUtils.exportAssignments(
//         assignments,
//         "csv"
//       );
//       const blob = new Blob([exportData], { type: "text/csv" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `assignments_${new Date().toISOString().split("T")[0]}.csv`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//       toast.success("Export started");
//     } catch (error) {
//       console.error("Error exporting assignments:", error);
//       toast.error("Failed to export assignments");
//     }
//   };

//   // Toggle selection
//   const toggleAssignmentSelection = (assignmentId) => {
//     const newSelected = new Set(selectedAssignments);
//     if (newSelected.has(assignmentId)) {
//       newSelected.delete(assignmentId);
//     } else {
//       newSelected.add(assignmentId);
//     }
//     setSelectedAssignments(newSelected);
//     setShowBulkActions(newSelected.size > 0);
//   };

//   // Select all
//   const toggleSelectAll = () => {
//     if (
//       selectedAssignments.size === assignments.length &&
//       assignments.length > 0
//     ) {
//       setSelectedAssignments(new Set());
//       setShowBulkActions(false);
//     } else {
//       const allIds = new Set(assignments.map((a) => a.assignment_id));
//       setSelectedAssignments(allIds);
//       setShowBulkActions(true);
//     }
//   };

//   // Navigation handlers
//   const handleNavigateToCreate = () => {
//     navigate("/workload/dept/assignments/create");
//   };

//   const handleNavigateToBulk = () => {
//     navigate("/workload/dept/assignments/bulk");
//   };

//   const handleNavigateToAvailability = () => {
//     navigate("/workload/dept/assignments/availability");
//   };

//   // Loading state
//   if (loading && !formData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading assignments...</p>
//         </div>
//       </div>
//     );
//   }
 
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-[#214C8C]  text-white">
//         <div className="container mx-auto px-4 py-8 ">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//             <div>
//               <h1 className="text-3xl font-bold">Course Assignments</h1>
//               <p className="text-blue-100 mt-2">
//                 Manage course assignments for your department staff
//               </p>
//               <div className="flex items-center gap-4 mt-4">
//                 {/* <div className="flex items-center">
//                   <Shield className="w-5 h-5 mr-2" />
//                   <span className="text-sm">
//                     Department: {user?.role || "N/A"}
//                   </span>
//                 </div> */}
//                 <div className="flex items-center">
//                   <Users className="w-5 h-5 mr-2" />
//                   <span className="text-sm">
//                     Total: {stats.total} assignments
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-wrap gap-3">
//               <button
//                 onClick={() => fetchAssignments(true)}
//                 className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
//               >
//                 <RefreshCw className="w-4 h-4 mr-2" />
//                 Refresh
//               </button>
//               <button
//                 onClick={handleNavigateToBulk}
//                 className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
//               >
//                 <Upload className="w-4 h-4 mr-2" />
//                 Bulk Assign
//               </button>
//               <button
//                 onClick={handleNavigateToCreate}
//                 className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center transition-colors"
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 New Assignment
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-8">
//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <StatsCard
//             title="Total Assignments"
//             value={stats.total}
//             icon={FileText}
//             color={{ bg: "bg-blue-50", icon: "text-blue-600" }}
//           />
//           <StatsCard
//             title="Accepted"
//             value={stats.accepted}
//             icon={CheckCircle}
//             color={{ bg: "bg-green-50", icon: "text-green-600" }}
//           />
//           <StatsCard
//             title="Pending"
//             value={stats.pending + stats.assigned}
//             icon={AlertCircle}
//             color={{ bg: "bg-yellow-50", icon: "text-yellow-600" }}
//           />
//           <StatsCard
//             title="Overload"
//             value={stats.overload}
//             icon={Award}
//             color={{ bg: "bg-red-50", icon: "text-red-600" }}
//           />
//         </div>

//         {/* Program Type Distribution */}
//         {/* {Object.keys(stats.byProgramType).length > 0 && (
//           <div className="bg-white rounded-xl border p-5 mb-8">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <BarChart3 className="w-5 h-5 mr-2 text-gray-500" />
//               Assignments by Program Type
//             </h3>
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//               {Object.entries(stats.byProgramType).map(([type, count]) => {
//                 const percentage =
//                   stats.total > 0
//                     ? ((count / stats.total) * 100).toFixed(1)
//                     : 0;
//                 const typeColors = {
//                   regular: "bg-blue-500",
//                   extension: "bg-purple-500",
//                   summer: "bg-orange-500",
//                   distance: "bg-teal-500",
//                   weekend: "bg-indigo-500",
//                 };

//                 return (
//                   <div key={type} className="text-center">
//                     <div className="relative h-24">
//                       <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
//                         <div
//                           className={`w-16 ${
//                             typeColors[type] || "bg-gray-500"
//                           } rounded-t-lg transition-all duration-500`}
//                           style={{ height: `${Math.min(percentage, 100)}%` }}
//                         ></div>
//                       </div>
//                     </div>
//                     <div className="mt-2">
//                       <p className="font-semibold">
//                         {type.charAt(0).toUpperCase() + type.slice(1)}
//                       </p>
//                       <p className="text-2xl font-bold">{count}</p>
//                       <p className="text-sm text-gray-600">{percentage}%</p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )} */}

//         {/* Bulk Actions Bar */}
//         {showBulkActions && (
//           <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
//                 <span className="font-medium">
//                   {selectedAssignments.size} assignments selected
//                 </span>
//               </div>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => handleBulkAction("accept")}
//                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   Accept Selected
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction("decline")}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   Decline Selected
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction("delete")}
//                   className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                 >
//                   Delete Selected
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedAssignments(new Set());
//                     setShowBulkActions(false);
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Clear
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Filters Panel */}
//         <FilterPanel
//           filters={filters}
//           onFilterChange={handleFilterChange}
//           onApplyFilters={handleApplyFilters}
//           onReset={handleResetFilters}
//           semesters={semesters}
//         />

//         {/* Assignments List */}
//         <div className="bg-white rounded-xl border mt-8 overflow-hidden">
//           {/* Header Actions */}
//           <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Assignments ({assignments.length})
//               </h3>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setViewMode("list")}
//                   className={`p-2 rounded transition-colors ${
//                     viewMode === "list"
//                       ? "bg-blue-50 text-blue-600"
//                       : "text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   List
//                 </button>
//                 <button
//                   onClick={() => setViewMode("grid")}
//                   className={`p-2 rounded transition-colors ${
//                     viewMode === "grid"
//                       ? "bg-blue-50 text-blue-600"
//                       : "text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   Grid
//                 </button>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={handleExportAssignments}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 Export
//               </button>
//               <button
//                 onClick={toggleSelectAll}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 {selectedAssignments.size === assignments.length &&
//                 assignments.length > 0
//                   ? "Deselect All"
//                   : "Select All"}
//               </button>
//             </div>
//           </div>

//           {/* Assignments Content */}
//           {assignments.length === 0 ? (
//             <div className="py-12 text-center">
//               <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h4 className="text-lg font-medium text-gray-900 mb-2">
//                 No assignments found
//               </h4>
//               <p className="text-gray-600 mb-6">
//                 Try adjusting your filters or create a new assignment
//               </p>
//               <button
//                 onClick={handleNavigateToCreate}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
//               >
//                 <Plus className="w-5 h-5 inline mr-2" />
//                 Create First Assignment
//               </button>
//             </div>
//           ) : viewMode === "grid" ? (
//             // Grid View
//             <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {assignments.map((assignment) => (
//                 <AssignmentCard
//                   key={assignment.assignment_id}
//                   assignment={assignment}
//                   onAction={handleAssignmentAction}
//                 />
//               ))}
//             </div>
//           ) : (
//             // Table View
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       <input
//                         type="checkbox"
//                         checked={
//                           selectedAssignments.size === assignments.length &&
//                           assignments.length > 0
//                         }
//                         onChange={toggleSelectAll}
//                         className="rounded border-gray-300"
//                       />
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Course Details
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Instructor
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Program & Year
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {assignments.map((assignment) => {
//                     const formattedStatus =
//                       courseAssignmentUtils.formatAssignmentStatus(
//                         assignment.status
//                       );
//                     const formattedProgramType =
//                       courseAssignmentUtils.formatProgramType(
//                         assignment.program_type
//                       );

//                     return (
//                       <tr
//                         key={assignment.assignment_id}
//                         className="hover:bg-gray-50 transition-colors"
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <input
//                             type="checkbox"
//                             checked={selectedAssignments.has(
//                               assignment.assignment_id
//                             )}
//                             onChange={() =>
//                               toggleAssignmentSelection(
//                                 assignment.assignment_id
//                               )
//                             }
//                             className="rounded border-gray-300"
//                           />
//                         </td>
//                         <td className="px-6 py-4">
//                           <div>
//                             <div className="font-medium text-gray-900">
//                               {assignment.course_code} -{" "}
//                               {assignment.course_title}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               {assignment.credit_hours} credit hours
//                               {assignment.section_code &&
//                                 ` • Section ${assignment.section_code}`}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
//                               <Users className="h-4 w-4 text-purple-600" />
//                             </div>
//                             <div className="ml-3">
//                               <div className="font-medium">
//                                 {assignment.first_name} {assignment.last_name}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 {assignment.employee_id || "N/A"}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div>
//                             <span
//                               className={`inline-block px-2 py-1 text-xs font-medium rounded bg-${formattedProgramType.color}-100 text-${formattedProgramType.color}-800`}
//                             >
//                               {formattedProgramType.text}
//                             </span>
//                             {assignment.student_year && (
//                               <div className="mt-1 text-sm text-gray-600">
//                                 Year {assignment.student_year}
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${formattedStatus.color}-100 text-${formattedStatus.color}-800`}
//                           >
//                             {formattedStatus.text}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {assignment.assigned_date
//                             ? new Date(
//                                 assignment.assigned_date
//                               ).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center space-x-2">
//                             <button
//                               onClick={() =>
//                                 handleAssignmentAction("view", assignment)
//                               }
//                               className="text-gray-400 hover:text-gray-600 transition-colors"
//                               title="View"
//                             >
//                               <Eye className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() =>
//                                 handleAssignmentAction("edit", assignment)
//                               }
//                               className="text-blue-400 hover:text-blue-600 transition-colors"
//                               title="Edit"
//                             >
//                               <Edit className="w-4 h-4" />
//                             </button>
//                             {/* {assignment.status === "assigned" && (
//                               <>
//                                 <button
//                                   onClick={() =>
//                                     handleAssignmentAction("accept", assignment)
//                                   }
//                                   className="text-green-400 hover:text-green-600 transition-colors"
//                                   title="Accept"
//                                 >
//                                   <CheckCircle className="w-4 h-4" />
//                                 </button>
//                                 <button
//                                   onClick={() =>
//                                     handleAssignmentAction(
//                                       "decline",
//                                       assignment
//                                     )
//                                   }
//                                   className="text-red-400 hover:text-red-600 transition-colors"
//                                   title="Decline"
//                                 >
//                                   <XCircle className="w-4 h-4" />
//                                 </button>
//                               </>
//                             )} */}
//                             <button
//                               onClick={() =>
//                                 handleAssignmentAction("delete", assignment)
//                               }
//                               className="text-red-400 hover:text-red-600 transition-colors"
//                               title="Delete"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination */}
//           {pagination.pages > 1 && (
//             <div className="px-6 py-4 border-t border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div className="text-sm text-gray-700">
//                   Showing{" "}
//                   <span className="font-medium">
//                     {(pagination.page - 1) * pagination.limit + 1}
//                   </span>{" "}
//                   to{" "}
//                   <span className="font-medium">
//                     {Math.min(
//                       pagination.page * pagination.limit,
//                       pagination.total
//                     )}
//                   </span>{" "}
//                   of <span className="font-medium">{pagination.total}</span>{" "}
//                   assignments
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() => handlePageChange(pagination.page - 1)}
//                     disabled={pagination.page === 1}
//                     className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     Previous
//                   </button>
//                   {[...Array(Math.min(5, pagination.pages)).keys()].map(
//                     (num) => (
//                       <button
//                         key={num}
//                         onClick={() => handlePageChange(num + 1)}
//                         className={`px-3 py-1 border text-sm transition-colors ${
//                           pagination.page === num + 1
//                             ? "bg-blue-600 text-white border-blue-600"
//                             : "border-gray-300 hover:bg-gray-50"
//                         }`}
//                       >
//                         {num + 1}
//                       </button>
//                     )
//                   )}
//                   {pagination.pages > 5 && (
//                     <>
//                       <span className="px-2">...</span>
//                       <button
//                         onClick={() => handlePageChange(pagination.pages)}
//                         className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
//                       >
//                         {pagination.pages}
//                       </button>
//                     </>
//                   )}
//                   <button
//                     onClick={() => handlePageChange(pagination.page + 1)}
//                     disabled={pagination.page === pagination.pages}
//                     className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Quick Links */}
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 hover:shadow-md transition-shadow">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h4 className="font-semibold text-gray-900 mb-2">
//                   Create New Assignment
//                 </h4>
//                 <p className="text-gray-600 text-sm mb-4">
//                   Assign courses to instructors with detailed workload
//                   calculation
//                 </p>
//                 <button
//                   onClick={handleNavigateToCreate}
//                   className="inline-flex items-center text-[#23496A] hover:text-blue-800 font-medium transition-colors"
//                 >
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create Assignment
//                 </button>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <Plus className="w-6 h-6 text-[#23496A]" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 p-5 hover:shadow-md transition-shadow">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h4 className="font-semibold text-gray-900 mb-2">
//                   Staff Availability
//                 </h4>
//                 <p className="text-gray-600 text-sm mb-4">
//                   Check instructor workload and availability before assigning
//                   courses
//                 </p>
//                 <button
//                   onClick={handleNavigateToAvailability}
//                   className="inline-flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
//                 >
//                   <Users className="w-4 h-4 mr-2" />
//                   View Availability
//                 </button>
//               </div>
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <Users className="w-6 h-6 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 p-5 hover:shadow-md transition-shadow">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h4 className="font-semibold text-gray-900 mb-2">
//                   Bulk Operations
//                 </h4>
//                 <p className="text-gray-600 text-sm mb-4">
//                   Assign multiple courses at once or import assignments from CSV
//                 </p>
//                 <button
//                   onClick={handleNavigateToBulk}
//                   className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
//                 >
//                   <Upload className="w-4 h-4 mr-2" />
//                   Bulk Assign
//                 </button>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-lg">
//                 <Upload className="w-6 h-6 text-purple-600" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer Help */}
//       <div className="mt-8 border-t border-gray-200 pt-8 pb-12">
//         <div className="container mx-auto px-4">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Need Help?
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="flex items-start space-x-3">
//               <div className="p-2 bg-blue-50 rounded-lg">
//                 <FileText className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-900">Documentation</h4>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Read our guide on how to assign courses effectively
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3">
//               <div className="p-2 bg-green-50 rounded-lg">
//                 <Mail className="w-5 h-5 text-green-600" />
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-900">Contact Support</h4>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Get help from our support team for any issues
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3">
//               <div className="p-2 bg-purple-50 rounded-lg">
//                 <BarChart3 className="w-5 h-5 text-purple-600" />
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-900">Analytics</h4>
//                 <p className="text-sm text-gray-600 mt-1">
//                   View detailed reports and analytics on assignments
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CourseAssignments;

// src/pages/workload/dept/CourseAssignments.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { courseAssignmentAPI, courseAssignmentUtils } from "../../../api/";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  BookOpen,
  Clock,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  FileText,
  BarChart3,
  MoreVertical,
  RefreshCw,
  ExternalLink,
  Printer,
  Mail,
  Copy,
  Link,
  Shield,
  TrendingUp,
  Award,
} from "lucide-react";

// Debounce hook for search input
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Subcomponents
const AssignmentCard = ({ assignment, onAction }) => {
  const [showActions, setShowActions] = useState(false);

  const statusConfig = {
    assigned: {
      color: "border-l-yellow-500",
      bg: "bg-yellow-50",
      text: "Assigned",
      icon: Clock,
    },
    accepted: {
      color: "border-l-green-500",
      bg: "bg-green-50",
      text: "Accepted",
      icon: CheckCircle,
    },
    declined: {
      color: "border-l-red-500",
      bg: "bg-red-50",
      text: "Declined",
      icon: XCircle,
    },
    pending: {
      color: "border-l-blue-500",
      bg: "bg-blue-50",
      text: "Pending",
      icon: AlertCircle,
    },
    withdrawn: {
      color: "border-l-gray-500",
      bg: "bg-gray-50",
      text: "Withdrawn",
      icon: UserX,
    },
  };

  const programTypeConfig = {
    regular: { color: "bg-blue-100 text-blue-800", icon: BookOpen },
    extension: { color: "bg-purple-100 text-purple-800", icon: FileText },
    summer: { color: "bg-orange-100 text-orange-800", icon: Award },
    distance: { color: "bg-teal-100 text-teal-800", icon: ExternalLink },
    weekend: { color: "bg-indigo-100 text-indigo-800", icon: Calendar },
  };

  const status = statusConfig[assignment.status] || statusConfig.assigned;
  const programType =
    programTypeConfig[assignment.program_type] || programTypeConfig.regular;
  const StatusIcon = status.icon;

  return (
    <div
      className={`border-l-4 ${status.color} border rounded-lg p-4 ${status.bg} hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                {assignment.course_code} - {assignment.course_title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {assignment.course_description}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border">
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.text}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Instructor</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-3 h-3 text-purple-600" />
                </div>
                <p className="text-sm font-medium">
                  {assignment.staff_first_name} {assignment.staff_last_name}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Program Type</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${programType.color}`}
              >
                {assignment.program_type?.charAt(0).toUpperCase() +
                  assignment.program_type?.slice(1)}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Student Year</p>
              <p className="text-sm font-medium">
                Year {assignment.student_year || "N/A"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Section</p>
              <p className="text-sm font-medium">
                {assignment.section_code || "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {new Date(assignment.assigned_date).toLocaleDateString()}
                </span>
                <span className="text-gray-600">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {assignment.credit_hours} credit hours
                </span>
              </div>
              {assignment.is_overload && (
                <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Overload
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative ml-4">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
              <div className="py-1">
                <button
                  onClick={() => onAction("view", assignment)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                {assignment.status === "assigned" && (
                  <>
                    <button
                      onClick={() => onAction("accept", assignment)}
                      className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </button>
                    <button
                      onClick={() => onAction("decline", assignment)}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </button>
                  </>
                )}
                <button
                  onClick={() => onAction("edit", assignment)}
                  className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => onAction("delete", assignment)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  loading = false,
}) => (
  <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {loading ? (
          <Loader2 className="w-6 h-6 mt-2 animate-spin text-gray-400" />
        ) : (
          <p
            className={`text-2xl font-bold mt-1 ${
              color.text || "text-gray-900"
            }`}
          >
            {value}
          </p>
        )}
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.color}`}>
            <TrendingUp
              className={`w-4 h-4 mr-1 ${
                trend.direction === "up"
                  ? "transform rotate-0"
                  : "transform rotate-180"
              }`}
            />
            {trend.value}% from last month
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color.bg || "bg-gray-100"}`}>
        <Icon className={`w-6 h-6 ${color.icon || "text-gray-600"}`} />
      </div>
    </div>
  </div>
);

const FilterPanel = ({
  filters,
  onFilterChange,
  onReset,
  semesters,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-gray-500" />
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search className="w-4 h-4 inline mr-1" />
            Search
          </label>
          <input
            type="text"
            placeholder="Course, instructor, or code..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="pending">Pending</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Type
          </label>
          <select
            value={filters.program_type}
            onChange={(e) => onFilterChange("program_type", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="extension">Extension</option>
            <option value="summer">Summer</option>
            <option value="distance">Distance</option>
            <option value="weekend">Weekend</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Year
          </label>
          <select
            value={filters.student_year}
            onChange={(e) => onFilterChange("student_year", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Years</option>
            {[1, 2, 3, 4, 5, 6, 7].map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={() => setAdvancedOpen(!advancedOpen)}
        className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
        {advancedOpen ? (
          <ChevronDown className="w-4 h-4 mr-1" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-1" />
        )}
        Advanced Filters
      </button>

      {advancedOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={filters.semester_id}
              onChange={(e) => onFilterChange("semester_id", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Semesters</option>
              {semesters.map((semester) => (
                <option key={semester.semester_id} value={semester.semester_id}>
                  {semester.semester_name} ({semester.semester_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Rank
            </label>
            <select
              value={filters.academic_rank}
              onChange={(e) => onFilterChange("academic_rank", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Ranks</option>
              <option value="lecturer">Lecturer</option>
              <option value="assistant_professor">Assistant Professor</option>
              <option value="associate_professor">Associate Professor</option>
              <option value="professor">Professor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sort_by}
              onChange={(e) => onFilterChange("sort_by", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="assigned_date">Assigned Date</option>
              <option value="course_code">Course Code</option>
              <option value="staff_name">Instructor</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

const CourseAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [allAssignments, setAllAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [formData, setFormData] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [selectedAssignments, setSelectedAssignments] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    accepted: 0,
    declined: 0,
    pending: 0,
    withdrawn: 0,
    overload: 0,
    byProgramType: {},
  });

  // Filters
  const [filters, setFilters] = useState({
    semester_id: "",
    status: "",
    program_type: "",
    student_year: "",
    academic_rank: "",
    search: "",
    sort_by: "assigned_date",
    sort_order: "desc",
  });

  // Use ref for filters to avoid infinite loops
  const filtersRef = useRef(filters);

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Update filters ref
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Fetch data when filters change (except search which is debounced)
  useEffect(() => {
    if (allAssignments.length > 0) {
      applyFilters();
    }
  }, [
    filters.status,
    filters.program_type,
    filters.student_year,
    filters.academic_rank,
    filters.semester_id,
    filters.sort_by,
    filters.sort_order,
  ]);

  // Apply search filter when debounced value changes
  useEffect(() => {
    if (allAssignments.length > 0) {
      applyFilters();
    }
  }, [debouncedSearch]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Get form data for dropdowns
      const formDataRes = await courseAssignmentAPI.getAssignmentFormData();
      if (formDataRes?.data) {
        setFormData(formDataRes.data);
        const semestersData = formDataRes.data.semesters || [];
        setSemesters(semestersData);

        // Set default semester if current semester exists
        const defaultSemester = formDataRes.data.current_semester;
        if (defaultSemester) {
          setFilters((prev) => ({
            ...prev,
            semester_id: defaultSemester.semester_id,
          }));
        } else if (semestersData.length > 0) {
          // Fallback to first semester if no current semester
          setFilters((prev) => ({
            ...prev,
            semester_id: semestersData[0].semester_id,
          }));
        }
      } else {
        // Fallback data if API fails
        const fallbackSemesters = [
          { semester_id: 1, semester_name: "Fall 2024", semester_code: "F24" },
          {
            semester_id: 2,
            semester_name: "Spring 2024",
            semester_code: "S24",
          },
        ];
        setSemesters(fallbackSemesters);
        setFilters((prev) => ({
          ...prev,
          semester_id: fallbackSemesters[0].semester_id,
        }));
        toast.error("Could not load form data. Using fallback data.");
      }

      await fetchAllAssignments();
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAssignments = async () => {
    try {
      const response = await courseAssignmentAPI.getDepartmentAssignments({
        page: 1,
        limit: 1000, // Fetch all assignments for client-side filtering
      });

      if (response?.data) {
        const formattedAssignments =
          response.data.assignments?.map((assignment) =>
            courseAssignmentUtils.formatAssignmentForDisplay(assignment)
          ) || [];

        setAllAssignments(formattedAssignments);
        setFilteredAssignments(formattedAssignments);
        calculateStatistics(formattedAssignments);
      } else {
        toast.error(response?.message || "Failed to fetch assignments");
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to fetch assignments. Please try again.";
      toast.error(errorMsg);
    }
  };

  const applyFilters = () => {
    let filtered = [...allAssignments];

    // Apply semester filter
    if (filters.semester_id) {
      filtered = filtered.filter(
        (assignment) => assignment.semester_id == filters.semester_id
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(
        (assignment) => assignment.status === filters.status
      );
    }

    // Apply program type filter
    if (filters.program_type) {
      filtered = filtered.filter(
        (assignment) => assignment.program_type === filters.program_type
      );
    }

    // Apply student year filter
    if (filters.student_year) {
      filtered = filtered.filter(
        (assignment) => assignment.student_year == filters.student_year
      );
    }

    // Apply academic rank filter
    if (filters.academic_rank) {
      filtered = filtered.filter(
        (assignment) => assignment.academic_rank === filters.academic_rank
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (assignment) =>
          assignment.course_code?.toLowerCase().includes(searchTerm) ||
          assignment.course_title?.toLowerCase().includes(searchTerm) ||
          assignment.course_description?.toLowerCase().includes(searchTerm) ||
          assignment.staff_first_name?.toLowerCase().includes(searchTerm) ||
          assignment.staff_last_name?.toLowerCase().includes(searchTerm) ||
          `${assignment.staff_first_name} ${assignment.staff_last_name}`
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const currentFilters = filtersRef.current;
      const sortBy = currentFilters.sort_by || "assigned_date";
      const sortOrder = currentFilters.sort_order === "asc" ? 1 : -1;

      switch (sortBy) {
        case "course_code":
          return (
            sortOrder *
            (a.course_code || "").localeCompare(b.course_code || "")
          );
        case "staff_name":
          const nameA = `${a.staff_first_name} ${a.staff_last_name}`;
          const nameB = `${b.staff_first_name} ${b.staff_last_name}`;
          return sortOrder * nameA.localeCompare(nameB);
        case "status":
          return sortOrder * (a.status || "").localeCompare(b.status || "");
        case "assigned_date":
        default:
          const dateA = new Date(a.assigned_date || 0);
          const dateB = new Date(b.assigned_date || 0);
          return sortOrder * (dateA - dateB);
      }
    });

    setFilteredAssignments(filtered);
    calculateStatistics(filtered);
  };

  const calculateStatistics = (assignmentsList) => {
    const stats = {
      total: assignmentsList.length,
      assigned: assignmentsList.filter((a) => a.status === "assigned").length,
      accepted: assignmentsList.filter((a) => a.status === "accepted").length,
      declined: assignmentsList.filter((a) => a.status === "declined").length,
      pending: assignmentsList.filter((a) => a.status === "pending").length,
      withdrawn: assignmentsList.filter((a) => a.status === "withdrawn").length,
      overload: assignmentsList.filter((a) => a.is_overload).length,
      byProgramType: {},
    };

    // Calculate by program type
    assignmentsList.forEach((assignment) => {
      const type = assignment.program_type || "regular";
      if (!stats.byProgramType[type]) {
        stats.byProgramType[type] = 0;
      }
      stats.byProgramType[type]++;
    });

    setStats(stats);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    const defaultSemesterId =
      formData?.current_semester?.semester_id ||
      (semesters.length > 0 ? semesters[0].semester_id : "");

    setFilters({
      semester_id: defaultSemesterId,
      status: "",
      program_type: "",
      student_year: "",
      academic_rank: "",
      search: "",
      sort_by: "assigned_date",
      sort_order: "desc",
    });
  };

  // Handle assignment actions
  const handleAssignmentAction = async (action, assignment) => {
    try {
      switch (action) {
        case "view":
          navigate(
            `/workload/dept/assignments/view/${assignment.assignment_id}`
          );
          break;
        case "edit":
          navigate(
            `/workload/dept/assignments/edit/${assignment.assignment_id}`
          );
          break;
        case "delete":
          if (
            window.confirm(`Delete assignment for ${assignment.course_code}?`)
          ) {
            const response = await courseAssignmentAPI.withdrawAssignment(
              assignment.assignment_id,
              "Deleted by department head"
            );
            if (response?.success) {
              toast.success("Assignment deleted");
              await fetchAllAssignments(); // Refresh all assignments
            } else {
              toast.error(response?.message || "Failed to delete assignment");
            }
          }
          break;
        case "accept":
          {
            const acceptResponse = await courseAssignmentAPI.acceptAssignment(
              assignment.assignment_id
            );
            if (acceptResponse?.success) {
              toast.success("Assignment accepted");
              await fetchAllAssignments(); // Refresh all assignments
            } else {
              toast.error(
                acceptResponse?.message || "Failed to accept assignment"
              );
            }
            break;
          }
        case "decline":
          {
            const declineResponse = await courseAssignmentAPI.declineAssignment(
              assignment.assignment_id,
              "Declined by department head"
            );
            if (declineResponse?.success) {
              toast.success("Assignment declined");
              await fetchAllAssignments(); // Refresh all assignments
            } else {
              toast.error(
                declineResponse?.message || "Failed to decline assignment"
              );
            }
            break;
          }
      }
    } catch (error) {
      console.error(`Error ${action} assignment:`, error);
      const errorMsg =
        error.response?.data?.message || `Failed to ${action} assignment`;
      toast.error(errorMsg);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedAssignments.size === 0) {
      toast.error("No assignments selected");
      return;
    }

    try {
      switch (action) {
        case "accept":
          for (const assignmentId of selectedAssignments) {
            await courseAssignmentAPI.acceptAssignment(assignmentId);
          }
          toast.success(`${selectedAssignments.size} assignments accepted`);
          break;
        case "decline":
          {
            const reason = prompt("Reason for declining:");
            if (reason) {
              for (const assignmentId of selectedAssignments) {
                await courseAssignmentAPI.declineAssignment(assignmentId, reason);
              }
              toast.success(`${selectedAssignments.size} assignments declined`);
            }
            break;
          }
        case "delete":
          if (
            window.confirm(`Delete ${selectedAssignments.size} assignments?`)
          ) {
            for (const assignmentId of selectedAssignments) {
              await courseAssignmentAPI.withdrawAssignment(
                assignmentId,
                "Bulk delete"
              );
            }
            toast.success(`${selectedAssignments.size} assignments deleted`);
          }
          break;
      }

      setSelectedAssignments(new Set());
      setShowBulkActions(false);
      await fetchAllAssignments(); // Refresh all assignments
    } catch (error) {
      console.error("Error performing bulk action:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to perform bulk action";
      toast.error(errorMsg);
    }
  };

  // Export assignments
  const handleExportAssignments = () => {
    try {
      const exportData = courseAssignmentUtils.exportAssignments(
        filteredAssignments,
        "csv"
      );
      const blob = new Blob([exportData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assignments_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export started");
    } catch (error) {
      console.error("Error exporting assignments:", error);
      toast.error("Failed to export assignments");
    }
  };

  // Toggle selection
  const toggleAssignmentSelection = (assignmentId) => {
    const newSelected = new Set(selectedAssignments);
    if (newSelected.has(assignmentId)) {
      newSelected.delete(assignmentId);
    } else {
      newSelected.add(assignmentId);
    }
    setSelectedAssignments(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  // Select all
  const toggleSelectAll = () => {
    if (
      selectedAssignments.size === filteredAssignments.length &&
      filteredAssignments.length > 0
    ) {
      setSelectedAssignments(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(filteredAssignments.map((a) => a.assignment_id));
      setSelectedAssignments(allIds);
      setShowBulkActions(true);
    }
  };

  // Navigation handlers
  const handleNavigateToCreate = () => {
    navigate("/workload/dept/assignments/create");
  };

  const handleNavigateToBulk = () => {
    navigate("/workload/dept/assignments/bulk");
  };

  const handleNavigateToAvailability = () => {
    navigate("/workload/dept/assignments/availability");
  };

  // Loading state
  if (loading && !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#214C8C] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">Course Assignments</h1>
              <p className="text-blue-100 mt-2">
                Manage course assignments for your department staff
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="text-sm">
                    Total: {stats.total} assignments
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fetchAllAssignments()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleNavigateToBulk}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Assign
              </button>
              <button
                onClick={handleNavigateToCreate}
                className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Assignments"
            value={stats.total}
            icon={FileText}
            color={{ bg: "bg-blue-50", icon: "text-blue-600" }}
          />
          <StatsCard
            title="Accepted"
            value={stats.accepted}
            icon={CheckCircle}
            color={{ bg: "bg-green-50", icon: "text-green-600" }}
          />
          <StatsCard
            title="Pending"
            value={stats.pending + stats.assigned}
            icon={AlertCircle}
            color={{ bg: "bg-yellow-50", icon: "text-yellow-600" }}
          />
          <StatsCard
            title="Overload"
            value={stats.overload}
            icon={Award}
            color={{ bg: "bg-red-50", icon: "text-red-600" }}
          />
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium">
                  {selectedAssignments.size} assignments selected
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleBulkAction("accept")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept Selected
                </button>
                <button
                  onClick={() => handleBulkAction("decline")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Decline Selected
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedAssignments(new Set());
                    setShowBulkActions(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          semesters={semesters}
        />

        {/* Assignments List */}
        <div className="bg-white rounded-xl border mt-8 overflow-hidden">
          {/* Header Actions */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assignments ({filteredAssignments.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportAssignments}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {selectedAssignments.size === filteredAssignments.length &&
                filteredAssignments.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          </div>

          {/* Assignments Content */}
          {filteredAssignments.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No assignments found
              </h4>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or create a new assignment
              </p>
              <button
                onClick={handleNavigateToCreate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Create First Assignment
              </button>
            </div>
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.assignment_id}
                  assignment={assignment}
                  onAction={handleAssignmentAction}
                />
              ))}
            </div>
          ) : (
            // Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedAssignments.size === filteredAssignments.length &&
                          filteredAssignments.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program & Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => {
                    const formattedStatus =
                      courseAssignmentUtils.formatAssignmentStatus(
                        assignment.status
                      );
                    const formattedProgramType =
                      courseAssignmentUtils.formatProgramType(
                        assignment.program_type
                      );

                    return (
                      <tr
                        key={assignment.assignment_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedAssignments.has(
                              assignment.assignment_id
                            )}
                            onChange={() =>
                              toggleAssignmentSelection(
                                assignment.assignment_id
                              )
                            }
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {assignment.course_code} -{" "}
                              {assignment.course_title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.credit_hours} credit hours
                              {assignment.section_code &&
                                ` • Section ${assignment.section_code}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Users className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">
                                {assignment.first_name} {assignment.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {assignment.employee_id || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded ${formattedProgramType.color}`}
                            >
                              {formattedProgramType.text}
                            </span>
                            {assignment.student_year && (
                              <div className="mt-1 text-sm text-gray-600">
                                Year {assignment.student_year}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${formattedStatus.color}-100 text-${formattedStatus.color}-800`}
                          >
                            {formattedStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.assigned_date
                            ? new Date(
                                assignment.assigned_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleAssignmentAction("view", assignment)
                              }
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleAssignmentAction("edit", assignment)
                              }
                              className="text-blue-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleAssignmentAction("delete", assignment)
                              }
                              className="text-red-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Create New Assignment
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Assign courses to instructors with detailed workload
                  calculation
                </p>
                <button
                  onClick={handleNavigateToCreate}
                  className="inline-flex items-center text-[#23496A] hover:text-blue-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </button>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plus className="w-6 h-6 text-[#23496A]" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Staff Availability
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Check instructor workload and availability before assigning
                  courses
                </p>
                <button
                  onClick={handleNavigateToAvailability}
                  className="inline-flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Availability
                </button>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Bulk Operations
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Assign multiple courses at once or import assignments from CSV
                </p>
                <button
                  onClick={handleNavigateToBulk}
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Assign
                </button>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Help */}
      <div className="mt-8 border-t border-gray-200 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Documentation</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Read our guide on how to assign courses effectively
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Contact Support</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Get help from our support team for any issues
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-600 mt-1">
                  View detailed reports and analytics on assignments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAssignments;