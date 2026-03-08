// import React, { useState, useEffect } from "react";
// import { useWorkload } from "../../contexts/WorkloadContext";
// import {
//   TrendingUp,
//   Plus,
//   Edit,
//   Trash2,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   BarChart3,
//   Download,
//   Filter,
//   Search,
//   ChevronRight,
//   RefreshCw,
//   Eye,
//   Calendar,
//   Users,
//   BookOpen,
//   DollarSign,
//   XCircle,
//   FileText,
//   ChevronDown,
// } from "lucide-react";
// import { format } from "date-fns";
// import toast from "react-hot-toast";

// const NRPWorkload = () => {
//   const { workloads, loading, fetchNRPWorkloads, submitWorkloadForApproval } =
//     useWorkload();
//   const [filters, setFilters] = useState({
//     program_type: "all",
//     status: "all",
//     search: "",
//     sortBy: "updated_at",
//     sortOrder: "desc",
//   });
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showDetailsModal, setShowDetailsModal] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(null);
//   const [newWorkload, setNewWorkload] = useState({
//     program_type: "extension",
//     course_code: "",
//     course_title: "",
//     credit_hours: 3,
//     student_count: 30,
//     teaching_hours: 45,
//     contract_number: "",
//     academic_year: new Date().getFullYear().toString(),
//   });
//   const [stats, setStats] = useState({
//     total: 0,
//     extension: 0,
//     weekend: 0,
//     summer: 0,
//     distance: 0,
//     totalHours: 0,
//     totalPayment: 0,
//   });

//   useEffect(() => {
//     fetchNRPWorkloads();
//   }, [filters.program_type, filters.status]);

//   useEffect(() => {
//     calculateStats();
//   }, [workloads.nrp]);

//   const calculateStats = () => {
//     const nrpWorkloads = workloads.nrp || [];

//     const stats = {
//       total: nrpWorkloads.length,
//       extension: nrpWorkloads.filter((w) => w.program_type === "extension")
//         .length,
//       weekend: nrpWorkloads.filter((w) => w.program_type === "weekend").length,
//       summer: nrpWorkloads.filter((w) => w.program_type === "summer").length,
//       distance: nrpWorkloads.filter((w) => w.program_type === "distance")
//         .length,
//       totalHours: nrpWorkloads.reduce(
//         (sum, w) => sum + (w.total_hours_worked || 0),
//         0
//       ),
//       totalPayment: nrpWorkloads.reduce(
//         (sum, w) => sum + (w.total_payment || 0),
//         0
//       ),
//     };

//     setStats(stats);
//   };

//   const handleSubmitForApproval = async (id) => {
//     try {
//       await submitWorkloadForApproval("nrp", id);
//       toast.success("NRP workload submitted for approval");
//     } catch (error) {
//       toast.error(error.message || "Failed to submit workload");
//     }
//   };

//   const handleCreateWorkload = async () => {
//     try {
//       // Generate contract number if not provided
//       const contractNumber =
//         newWorkload.contract_number ||
//         `NRP-${newWorkload.program_type.toUpperCase()}-${Date.now()
//           .toString()
//           .slice(-6)}`;

//       const workloadData = {
//         ...newWorkload,
//         contract_number: contractNumber,
//         status: "draft",
//       };

//       // This would call the API
//       // await createNRPWorkload(workloadData);

//       toast.success("NRP workload created successfully");
//       setShowCreateModal(false);
//       setNewWorkload({
//         program_type: "extension",
//         course_code: "",
//         course_title: "",
//         credit_hours: 3,
//         student_count: 30,
//         teaching_hours: 45,
//         contract_number: "",
//         academic_year: new Date().getFullYear().toString(),
//       });

//       fetchNRPWorkloads();
//     } catch (error) {
//       toast.error(error.message || "Failed to create workload");
//     }
//   };

//   const filteredWorkloads =
//     workloads.nrp?.filter((workload) => {
//       if (
//         filters.program_type !== "all" &&
//         workload.program_type !== filters.program_type
//       )
//         return false;
//       if (filters.status !== "all" && workload.status !== filters.status)
//         return false;
//       if (filters.search) {
//         const searchLower = filters.search.toLowerCase();
//         return (
//           workload.course_code?.toLowerCase().includes(searchLower) ||
//           workload.course_title?.toLowerCase().includes(searchLower) ||
//           workload.contract_number?.toLowerCase().includes(searchLower)
//         );
//       }
//       return true;
//     }) || [];

//   const sortedWorkloads = [...filteredWorkloads].sort((a, b) => {
//     let aValue = a[filters.sortBy];
//     let bValue = b[filters.sortBy];

//     if (filters.sortBy.includes("date") || filters.sortBy.includes("_at")) {
//       aValue = new Date(aValue);
//       bValue = new Date(bValue);
//     }

//     if (filters.sortOrder === "asc") {
//       return aValue > bValue ? 1 : -1;
//     }
//     return aValue < bValue ? 1 : -1;
//   });

//   const getProgramTypeBadge = (type) => {
//     const typeConfig = {
//       extension: { color: "bg-blue-100 text-blue-800", label: "Extension" },
//       weekend: { color: "bg-purple-100 text-purple-800", label: "Weekend" },
//       summer: { color: "bg-amber-100 text-amber-800", label: "Summer" },
//       distance: { color: "bg-green-100 text-green-800", label: "Distance" },
//     };

//     const config = typeConfig[type] || typeConfig.extension;

//     return (
//       <span
//         className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
//       >
//         {config.label}
//       </span>
//     );
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       draft: { color: "bg-gray-100 text-gray-800", icon: Clock },
//       submitted: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
//       dh_approved: { color: "bg-amber-100 text-amber-800", icon: CheckCircle },
//       dean_approved: {
//         color: "bg-purple-100 text-purple-800",
//         icon: CheckCircle,
//       },
//       cde_approved: {
//         color: "bg-indigo-100 text-indigo-800",
//         icon: CheckCircle,
//       },
//       hr_approved: { color: "bg-pink-100 text-pink-800", icon: CheckCircle },
//       vpaf_approved: { color: "bg-rose-100 text-rose-800", icon: CheckCircle },
//       finance_approved: {
//         color: "bg-green-100 text-green-800",
//         icon: CheckCircle,
//       },
//       paid: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
//       rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
//     };

//     const config = statusConfig[status] || statusConfig.draft;
//     const Icon = config.icon;

//     return (
//       <span
//         className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.color}`}
//       >
//         <Icon className="h-3 w-3" />
//         <span>
//           {status
//             .split("_")
//             .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(" ")}
//         </span>
//       </span>
//     );
//   };

//   const WorkloadCard = ({ workload }) => (
//     <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
//       <div className="p-6">
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex-1">
//             <div className="flex items-center space-x-3 mb-2">
//               <div
//                 className={`p-2 rounded-lg ${
//                   workload.program_type === "extension"
//                     ? "bg-blue-50 text-blue-600"
//                     : workload.program_type === "weekend"
//                     ? "bg-purple-50 text-purple-600"
//                     : workload.program_type === "summer"
//                     ? "bg-amber-50 text-amber-600"
//                     : "bg-green-50 text-green-600"
//                 }`}
//               >
//                 <TrendingUp className="h-5 w-5" />
//               </div>
//               <div>
//                 <div className="flex items-center space-x-2 mb-1">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {workload.course_code || "Unnamed Course"}
//                   </h3>
//                   {getProgramTypeBadge(workload.program_type)}
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   {workload.course_title || "No title provided"}
//                 </p>
//                 <div className="flex items-center space-x-4 mt-1">
//                   <span className="text-sm text-gray-600">
//                     Contract: {workload.contract_number}
//                   </span>
//                   <span className="text-sm text-gray-600">
//                     Hours: {workload.total_hours_worked || 0}h
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
//               <div>
//                 <p className="text-xs text-gray-500 mb-1">Credit Hours</p>
//                 <p className="text-sm font-medium text-gray-900">
//                   {workload.credit_hours || "0.0"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-500 mb-1">Students</p>
//                 <p className="text-sm font-medium text-gray-900">
//                   {workload.student_count || "0"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-500 mb-1">Total Payment</p>
//                 <p className="text-sm font-medium text-emerald-600">
//                   ${workload.total_payment?.toLocaleString() || "0"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="ml-4">{getStatusBadge(workload.status)}</div>
//         </div>

//         {/* Payment Breakdown */}
//         <div className="mt-4">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-700">
//               Payment Breakdown
//             </span>
//             <span className="text-xs text-gray-500">
//               Total: ${workload.total_payment?.toLocaleString() || 0}
//             </span>
//           </div>
//           <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
//             <div
//               className="bg-blue-500"
//               style={{
//                 width: `${
//                   ((workload.teaching_payment || 0) / workload.total_payment) *
//                     100 || 0
//                 }%`,
//               }}
//               title="Teaching Payment"
//             ></div>
//             <div
//               className="bg-green-500"
//               style={{
//                 width: `${
//                   ((workload.tutorial_payment || 0) / workload.total_payment) *
//                     100 || 0
//                 }%`,
//               }}
//               title="Tutorial Payment"
//             ></div>
//             <div
//               className="bg-purple-500"
//               style={{
//                 width: `${
//                   ((workload.assignment_payment || 0) /
//                     workload.total_payment) *
//                     100 || 0
//                 }%`,
//               }}
//               title="Assignment Payment"
//             ></div>
//             <div
//               className="bg-amber-500"
//               style={{
//                 width: `${
//                   ((workload.exam_payment || 0) / workload.total_payment) *
//                     100 || 0
//                 }%`,
//               }}
//               title="Exam Payment"
//             ></div>
//           </div>
//           <div className="flex justify-between mt-1 text-xs text-gray-500">
//             <span>Teaching</span>
//             <span>Tutorial</span>
//             <span>Assignment</span>
//             <span>Exam</span>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => setShowDetailsModal(workload)}
//               className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
//             >
//               <Eye className="h-4 w-4" />
//               <span>View Details</span>
//             </button>
//             <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2">
//               <Download className="h-4 w-4" />
//               <span>Export</span>
//             </button>
//           </div>

//           <div className="flex items-center space-x-3">
//             {workload.status === "draft" && (
//               <>
//                 <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
//                   <Edit className="h-4 w-4" />
//                   <span>Edit</span>
//                 </button>
//                 <button
//                   onClick={() => handleSubmitForApproval(workload.nrp_id)}
//                   className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
//                 >
//                   <CheckCircle className="h-4 w-4" />
//                   <span>Submit</span>
//                 </button>
//               </>
//             )}

//             {workload.status === "draft" && (
//               <button
//                 onClick={() => setShowDeleteModal(workload.nrp_id)}
//                 className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
//               >
//                 <Trash2 className="h-4 w-4" />
//                 <span>Delete</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (loading.nrp) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading NRP workloads...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-b-2xl shadow-lg">
//         <div className="container mx-auto px-6 py-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">
//                 Non-Regular Program Workload
//               </h1>
//               <p className="text-blue-100">
//                 Manage extension, weekend, summer, and distance program
//                 workloads
//               </p>
//             </div>
//             <div className="flex items-center space-x-3 mt-4 md:mt-0">
//               <button
//                 onClick={() => fetchNRPWorkloads()}
//                 className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center space-x-2 transition-colors"
//               >
//                 <RefreshCw className="h-4 w-4" />
//                 <span>Refresh</span>
//               </button>
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className="px-4 py-2 bg-white hover:text-blue-600 text-blue-600 rounded-lg flex items-center space-x-2 transition-colors"
//               >
//                 <Plus className="h-4 w-4" />
//                 <span>New NRP Workload</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="container mx-auto px-6 py-8 -mt-4">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Total Workloads
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {stats.total}
//                 </p>
//               </div>
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <TrendingUp className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Extension</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {stats.extension}
//                 </p>
//               </div>
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <FileText className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Weekend</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {stats.weekend}
//                 </p>
//               </div>
//               <div className="p-3 bg-purple-50 rounded-lg">
//                 <Calendar className="h-6 w-6 text-purple-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Total Payment
//                 </p>
//                 <p className="text-2xl font-bold text-emerald-600 mt-1">
//                   ${stats.totalPayment.toLocaleString()}
//                 </p>
//               </div>
//               <div className="p-3 bg-emerald-50 rounded-lg">
//                 <DollarSign className="h-6 w-6 text-emerald-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by course, contract, or title..."
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   value={filters.search}
//                   onChange={(e) =>
//                     setFilters((prev) => ({ ...prev, search: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <select
//                   className="appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   value={filters.program_type}
//                   onChange={(e) =>
//                     setFilters((prev) => ({
//                       ...prev,
//                       program_type: e.target.value,
//                     }))
//                   }
//                 >
//                   <option value="all">All Programs</option>
//                   <option value="extension">Extension</option>
//                   <option value="weekend">Weekend</option>
//                   <option value="summer">Summer</option>
//                   <option value="distance">Distance</option>
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//               </div>

//               <div className="relative">
//                 <select
//                   className="appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   value={filters.status}
//                   onChange={(e) =>
//                     setFilters((prev) => ({ ...prev, status: e.target.value }))
//                   }
//                 >
//                   <option value="all">All Status</option>
//                   <option value="draft">Draft</option>
//                   <option value="submitted">Submitted</option>
//                   <option value="approved">Approved</option>
//                   <option value="paid">Paid</option>
//                   <option value="rejected">Rejected</option>
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//               </div>

//               <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                 <Filter className="h-5 w-5 text-gray-600" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Workloads List */}
//         <div className="space-y-6">
//           {sortedWorkloads.length === 0 ? (
//             <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
//               <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 No NRP Workloads Found
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 {filters.search ||
//                 filters.program_type !== "all" ||
//                 filters.status !== "all"
//                   ? "Try adjusting your filters"
//                   : "You haven't created any NRP workloads yet"}
//               </p>
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 mx-auto"
//               >
//                 <Plus className="h-5 w-5" />
//                 <span>Create Your First NRP Workload</span>
//               </button>
//             </div>
//           ) : (
//             sortedWorkloads.map((workload) => (
//               <WorkloadCard key={workload.nrp_id} workload={workload} />
//             ))
//           )}
//         </div>
//       </div>

//       {/* Create Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900">
//                     Create New NRP Workload
//                   </h3>
//                   <p className="text-gray-600">
//                     Fill in the details for your non-regular program workload
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setShowCreateModal(false)}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <XCircle className="h-6 w-6 text-gray-400" />
//                 </button>
//               </div>

//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Program Type
//                     </label>
//                     <select
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={newWorkload.program_type}
//                       onChange={(e) =>
//                         setNewWorkload((prev) => ({
//                           ...prev,
//                           program_type: e.target.value,
//                         }))
//                       }
//                     >
//                       <option value="extension">Extension Program</option>
//                       <option value="weekend">Weekend Program</option>
//                       <option value="summer">Summer Program</option>
//                       <option value="distance">Distance Program</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Course Code
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={newWorkload.course_code}
//                       onChange={(e) =>
//                         setNewWorkload((prev) => ({
//                           ...prev,
//                           course_code: e.target.value,
//                         }))
//                       }
//                       placeholder="e.g., CS101"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Course Title
//                   </label>
//                   <input
//                     type="text"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     value={newWorkload.course_title}
//                     onChange={(e) =>
//                       setNewWorkload((prev) => ({
//                         ...prev,
//                         course_title: e.target.value,
//                       }))
//                     }
//                     placeholder="Enter course title"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Credit Hours
//                     </label>
//                     <input
//                       type="number"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={newWorkload.credit_hours}
//                       onChange={(e) =>
//                         setNewWorkload((prev) => ({
//                           ...prev,
//                           credit_hours: parseFloat(e.target.value),
//                         }))
//                       }
//                       min="0"
//                       step="0.5"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Student Count
//                     </label>
//                     <input
//                       type="number"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={newWorkload.student_count}
//                       onChange={(e) =>
//                         setNewWorkload((prev) => ({
//                           ...prev,
//                           student_count: parseInt(e.target.value),
//                         }))
//                       }
//                       min="0"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Teaching Hours
//                     </label>
//                     <input
//                       type="number"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={newWorkload.teaching_hours}
//                       onChange={(e) =>
//                         setNewWorkload((prev) => ({
//                           ...prev,
//                           teaching_hours: parseFloat(e.target.value),
//                         }))
//                       }
//                       min="0"
//                       step="0.5"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Contract Number (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={newWorkload.contract_number}
//                       onChange={(e) =>
//                         setNewWorkload((prev) => ({
//                           ...prev,
//                           contract_number: e.target.value,
//                         }))
//                       }
//                       placeholder="Will be auto-generated if empty"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Academic Year
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={newWorkload.academic_year}
//                       onChange={(e) =>
//                         setNewWorkload((prev) => ({
//                           ...prev,
//                           academic_year: e.target.value,
//                         }))
//                       }
//                       placeholder="e.g., 2024"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
//                 <button
//                   onClick={() => setShowCreateModal(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleCreateWorkload}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
//                 >
//                   Create Workload
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//             <div className="p-6">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 bg-red-100 rounded-lg">
//                   <AlertCircle className="h-6 w-6 text-red-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Delete NRP Workload
//                 </h3>
//               </div>

//               <p className="text-gray-600 mb-6">
//                 Are you sure you want to delete this NRP workload? This action
//                 cannot be undone.
//               </p>

//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowDeleteModal(null)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => setShowDeleteModal(null)}
//                   className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NRPWorkload;


// src/pages/workload/NRPWorkload.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Download,
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
  Users,
  Calculator
} from 'lucide-react';
import toast from 'react-hot-toast';
import workloadAPI from '../../api/workload';
import semesterAPI from '../../api';

const NRPWorkload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workloads, setWorkloads] = useState([]);
  const [filteredWorkloads, setFilteredWorkloads] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    semester: 'all',
    program_type: 'all',
    search: ''
  });
  const [semesters, setSemesters] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    totalPayment: 0
  });

  const programTypes = [
    { value: 'extension', label: 'Extension Program' },
    { value: 'weekend', label: 'Weekend Program' },
    { value: 'summer', label: 'Summer Program' },
    { value: 'distance', label: 'Distance Program' }
  ];

  useEffect(() => {
    fetchWorkloads();
    fetchSemesters();
  }, []);

  useEffect(() => {
    filterWorkloads();
  }, [workloads, filters]);

  const fetchWorkloads = async () => {
    try {
      setLoading(true);
      const response = await workloadAPI.getNRPWorkload();
      const workloadsData = response.data?.workloads || [];
      
      setWorkloads(workloadsData);
      
      // Calculate stats
      let totalPayment = 0;
      workloadsData.forEach(w => {
        totalPayment += parseFloat(w.total_payment || 0);
      });

      const statsData = {
        total: workloadsData.length,
        draft: workloadsData.filter(w => w.status === 'draft').length,
        submitted: workloadsData.filter(w => w.status === 'submitted').length,
        approved: workloadsData.filter(w => 
          ['dh_approved', 'dean_approved', 'cde_approved', 'hr_approved', 'vpaf_approved', 'finance_approved', 'paid'].includes(w.status)
        ).length,
        totalPayment: totalPayment
      };
      setStats(statsData);
      
    } catch (error) {
      console.error('Error fetching NRP workloads:', error);
      toast.error('Failed to load workloads');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await semesterAPI.getSemesters();
      setSemesters(response.data || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const filterWorkloads = () => {
    let filtered = [...workloads];

    if (filters.status !== 'all') {
      filtered = filtered.filter(w => w.status === filters.status);
    }

    if (filters.semester !== 'all') {
      filtered = filtered.filter(w => w.semester_id?.toString() === filters.semester);
    }

    if (filters.program_type !== 'all') {
      filtered = filtered.filter(w => w.program_type === filters.program_type);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(w =>
        w.course_code?.toLowerCase().includes(searchLower) ||
        w.contract_number?.toLowerCase().includes(searchLower) ||
        w.course_title?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredWorkloads(filtered);
  };

  const handleSubmitForApproval = async (nrpId) => {
    try {
      await workloadAPI.submitNRPWorkload(nrpId);
      toast.success('Workload submitted for approval');
      fetchWorkloads();
    } catch (error) {
      console.error('Error submitting workload:', error);
      toast.error('Failed to submit workload');
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'dh_approved':
      case 'dean_approved':
      case 'cde_approved':
      case 'hr_approved':
      case 'vpaf_approved':
      case 'finance_approved':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'dh_approved': 'Dept Head Approved',
      'dean_approved': 'Dean Approved',
      'cde_approved': 'CDE Approved',
      'hr_approved': 'HR Approved',
      'vpaf_approved': 'VPAF Approved',
      'finance_approved': 'Finance Approved',
      'paid': 'Paid',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  const getProgramTypeLabel = (type) => {
    const typeMap = {
      'extension': 'Extension',
      'weekend': 'Weekend',
      'summer': 'Summer',
      'distance': 'Distance'
    };
    return typeMap[type] || type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NRP workloads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Non-Regular Program (NRP) Workload</h1>
          <p className="text-gray-600 mt-1">
            Manage your extension, weekend, summer, and distance program workloads
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/workload/nrp/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add NRP Workload</span>
          </Link>
          <button
            onClick={fetchWorkloads}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Workloads</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.draft}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Edit className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.submitted}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payment</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatCurrency(stats.totalPayment)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by course code, contract number, or title..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="dh_approved">Dept Head Approved</option>
              <option value="dean_approved">Dean Approved</option>
              <option value="cde_approved">CDE Approved</option>
              <option value="finance_approved">Finance Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.program_type}
              onChange={(e) => setFilters({...filters, program_type: e.target.value})}
            >
              <option value="all">All Programs</option>
              {programTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
            >
              <option value="all">All Semesters</option>
              {semesters.map(semester => (
                <option key={semester.semester_id} value={semester.semester_id}>
                  {semester.semester_name} ({semester.semester_code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workloads Grid */}
      {filteredWorkloads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWorkloads.map((workload) => (
            <div key={workload.nrp_id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-gray-900">
                      {workload.course_code || 'Contract Work'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workload.status)}`}>
                      {getStatusText(workload.status)}
                    </span>
                  </div>
                  <h3 className="text-gray-900 font-medium">
                    {workload.course_title || workload.program_type}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600">
                      {getProgramTypeLabel(workload.program_type)}
                    </span>
                    {workload.contract_number && (
                      <span className="text-sm text-gray-500">
                        Contract: {workload.contract_number}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(workload.total_payment)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Total Payment
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Hours</span>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Teaching:</span>
                      <span className="font-medium">{workload.teaching_hours || 0}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-bold">{workload.total_hours_worked || 0}h</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Students</span>
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-medium">{workload.student_count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Assignments:</span>
                      <span className="font-medium">{workload.assignment_students || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {workload.semester_name} • Updated {new Date(workload.updated_at).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/workload/nrp/${workload.nrp_id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </Link>
                  {workload.status === 'draft' && (
                    <>
                      <Link
                        to={`/workload/nrp/${workload.nrp_id}/edit`}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleSubmitForApproval(workload.nrp_id)}
                        className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                        title="Submit for Approval"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {workload.status === 'submitted' && (
                    <button
                      onClick={() => workloadAPI.getApprovalStatus(workload.nrp_id, 'nrp')}
                      className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600"
                      title="Check Approval Status"
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {workloads.length === 0 ? 'No NRP Workloads Found' : 'No Matching Workloads'}
          </h3>
          <p className="text-gray-600 mb-6">
            {workloads.length === 0 
              ? "You haven't created any NRP workloads yet. Start by creating your first workload."
              : "No workloads match your current filters. Try adjusting your search criteria."
            }
          </p>
          {workloads.length === 0 && (
            <Link
              to="/workload/nrp/create"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First NRP Workload</span>
            </Link>
          )}
        </div>
      )}

      {/* Program Type Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Program Type Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {programTypes.map(type => {
            const typeWorkloads = workloads.filter(w => w.program_type === type.value);
            const totalPayment = typeWorkloads.reduce((sum, w) => sum + parseFloat(w.total_payment || 0), 0);
            
            return (
              <div key={type.value} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{type.label}</span>
                  <div className={`p-2 rounded-lg ${
                    type.value === 'extension' ? 'bg-blue-50 text-blue-600' :
                    type.value === 'weekend' ? 'bg-green-50 text-green-600' :
                    type.value === 'summer' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Workloads:</span>
                    <span className="font-semibold">{typeWorkloads.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Payment:</span>
                    <span className="font-semibold text-purple-600">{formatCurrency(totalPayment)}</span>
                  </div>
                </div>
                {typeWorkloads.length > 0 && (
                  <Link
                    to={`/workload/nrp?program_type=${type.value}`}
                    className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NRPWorkload;