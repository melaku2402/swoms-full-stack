// // src/components/dashboard/InstructorDashboard.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useAuth } from "../../../contexts/AuthContext";
// import {
//   BarChart3,
//   PieChart,
//   TrendingUp,
//   TrendingDown,
//   Clock,
//   AlertCircle,
//   DollarSign,
//   CheckCircle,
//   XCircle,
//   Calendar,
//   Users,
//   BookOpen,
//   FileText,
//   CheckSquare,
//   Loader,
//   RefreshCw,
//   ExternalLink,
//   ChevronRight,
//   FolderOpen,
//   Receipt,
//   Eye,
//   Download,
//   Upload,
//   Filter,
//   Search,
//   ChevronDown,
//   MoreHorizontal,
//   Send,
//   X,
//   Save,
//   Calculator,
//   User,
//   Home,
//   Grid,
//   Bell,
//   Settings,
//   LogOut,
//   Menu,
//   FileSpreadsheet,
//   History,
//   Activity,
//   Target,
//   Layers,
//   Briefcase,
//   CreditCard,
//   Shield,
//   Award,
//   TrendingDown as TrendingDownIcon,
//   PieChart as PieChartIcon,
//   BarChart2,
//   Menu as MenuIcon,
//   ChevronLeft,
//   ChevronRight as ChevronRightIcon,
// } from "lucide-react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
// } from "recharts";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// // Import all the APIs
// import apiClient, {
//   workloadAPI,
//   workloadRPAPI,
//   workloadNRPAPI,
//   courseAPI,
//   courseAssignmentAPI,
//   courseRequestAPI,
//   paymentAPI,
//   overloadDetectionAPI,
//   academicAPI,
//   staffAPI,
//   systemAPI,
//   exportAPI,
// } from "../../../api";

// const InstructorDashboard = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [activeSection, setActiveSection] = useState("overview");
//   const [loading, setLoading] = useState(true);
//   const [refreshKey, setRefreshKey] = useState(0);

//   // Dashboard States
//   const [dashboardData, setDashboardData] = useState({
//     overview: null,
//     workload: null,
//     payments: null,
//     courses: null,
//     alerts: null,
//   });

//   const navigationItems = [
//     {
//       id: "overview",
//       title: "Overview",
//       icon: Grid,
//       color: "text-blue-600",
//       bgColor: "bg-blue-50",
//     },
//     {
//       id: "workload",
//       title: "Workload",
//       icon: FolderOpen,
//       color: "text-green-600",
//       bgColor: "bg-green-50",
//     },
//     {
//       id: "payments",
//       title: "Payments",
//       icon: CreditCard,
//       color: "text-purple-600",
//       bgColor: "bg-purple-50",
//     },
//     {
//       id: "courses",
//       title: "Courses",
//       icon: BookOpen,
//       color: "text-amber-600",
//       bgColor: "bg-amber-50",
//     },
//     {
//       id: "alerts",
//       title: "Alerts",
//       icon: Bell,
//       color: "text-red-600",
//       bgColor: "bg-red-50",
//     },
//     {
//       id: "new-workload",
//       title: "New Workload",
//       icon: FileText,
//       color: "text-indigo-600",
//       bgColor: "bg-indigo-50",
//     },
//   ];

//   const quickLinks = [
//     {
//       title: "Submit Workload",
//       icon: FolderOpen,
//       description: "Submit your current workload",
//       path: "/workload",
//       color: "blue",
//     },
//     {
//       title: "Payment Sheets",
//       icon: Receipt,
//       description: "Check payment status",
//       path: "/payments",
//       color: "green",
//     },
//     {
//       title: "Request Course",
//       icon: BookOpen,
//       description: "Request new course assignment",
//       path: "/course-requests",
//       color: "purple",
//     },
//     {
//       title: "Check Overload",
//       icon: AlertCircle,
//       description: "Monitor your workload",
//       path: "/overload",
//       color: "amber",
//     },
//   ];

//   const stats = [
//     {
//       title: "Total Workload",
//       value: "42",
//       unit: "hrs",
//       change: "+2.5%",
//       icon: Clock,
//       color: "blue",
//     },
//     {
//       title: "Pending Approvals",
//       value: "3",
//       unit: "",
//       change: "Needs attention",
//       icon: AlertCircle,
//       color: "amber",
//     },
//     {
//       title: "Total Payments",
//       value: "2,840",
//       unit: "ETB",
//       change: "+12.3%",
//       icon: DollarSign,
//       color: "green",
//     },
//     {
//       title: "Overload Level",
//       value: "85%",
//       unit: "",
//       change: "Approaching limit",
//       icon: TrendingUp,
//       color: "red",
//     },
//   ];

//   const fetchDashboardData = useCallback(async () => {
//     setLoading(true);
//     try {
//       // Mock API calls - replace with actual API calls
//       await new Promise((resolve) => setTimeout(resolve, 500));

//       const mockData = {
//         overview: {
//           totalWorkloadHours: 42,
//           pendingApprovals: 3,
//           totalPayments: 2840,
//           overloadPercentage: 85,
//           activeCourses: 5,
//           studentsCount: 150,
//           completionRate: 92,
//           upcomingDeadlines: 2,
//         },
//         workload: {
//           total_hours: 42,
//           assignments: [
//             {
//               id: 1,
//               course_code: "CS-301",
//               course_title: "Advanced Programming",
//               status: "accepted",
//             },
//             {
//               id: 2,
//               course_code: "SE-402",
//               course_title: "Software Architecture",
//               status: "pending",
//             },
//           ],
//         },
//         payments: {
//           total_amount: 2840,
//           recent: [
//             { month: "Sep", amount: 12450, status: "paid" },
//             { month: "Oct", amount: 14647, status: "pending" },
//           ],
//         },
//         courses: {
//           active: 5,
//           total_students: 150,
//         },
//       };

//       setDashboardData(mockData);
//     } catch (error) {
//       toast.error("Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   }, [refreshKey]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

//   const handleRefresh = () => {
//     setRefreshKey((prev) => prev + 1);
//     toast.success("Dashboard refreshed");
//   };

//   const handleExport = async () => {
//     try {
//       toast.loading("Exporting data...");
//       // await exportAPI.exportDashboard('excel');
//       toast.success("Export completed!");
//     } catch (error) {
//       toast.error("Export failed");
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       toast.success("Logged out successfully");
//       navigate("/login");
//     } catch (error) {
//       toast.error("Logout failed");
//     }
//   };

//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="flex items-center justify-center h-64">
//           <Loader className="h-8 w-8 animate-spin text-blue-600" />
//         </div>
//       );
//     }

//     switch (activeSection) {
//       case "overview":
//         return <OverviewContent data={dashboardData.overview} />;
//       case "workload":
//         return <WorkloadContent data={dashboardData.workload} />;
//       case "payments":
//         return <PaymentsContent data={dashboardData.payments} />;
//       case "courses":
//         return <CoursesContent data={dashboardData.courses} />;
//       case "alerts":
//         return <AlertsContent />;
//       case "new-workload":
//         return <NewWorkloadContent />;
//       default:
//         return <OverviewContent data={dashboardData.overview} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="px-4 py-3 flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="p-2 rounded-lg hover:bg-gray-100"
//             >
//               <MenuIcon className="h-5 w-5 text-gray-600" />
//             </button>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">
//                 Instructor Dashboard
//               </h1>
//               <p className="text-sm text-gray-600">
//                 Welcome back, {user?.name?.split(" ")[0] || "Instructor"}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3">
//             <button
//               onClick={handleRefresh}
//               className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
//             >
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Refresh
//             </button>

//             <button
//               onClick={handleExport}
//               className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
//             >
//               <Download className="h-4 w-4 mr-2" />
//               Export
//             </button>
//           </div>
//         </div>
//       </header>

//       <div className="flex">
//         {/* Sidebar */}
//         <div
//           className={`${
//             sidebarOpen ? "w-64" : "w-20"
//           } bg-white border-r border-gray-200 transition-all duration-300`}
//         >
//           <div className="p-4">
//             {/* Quick Stats */}
//             <div className="mb-6">
//               <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
//                 Quick Stats
//               </h3>
//               <div className="space-y-2">
//                 {stats.map((stat, index) => (
//                   <div key={index} className="p-2 bg-gray-50 rounded-lg">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <div
//                           className={`p-1.5 rounded-md bg-${stat.color}-100`}
//                         >
//                           <stat.icon
//                             className={`h-3.5 w-3.5 text-${stat.color}-600`}
//                           />
//                         </div>
//                         {sidebarOpen && (
//                           <div>
//                             <p className="text-xs text-gray-600">
//                               {stat.title}
//                             </p>
//                             <p className="font-semibold text-gray-900">
//                               {stat.value} {stat.unit}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                       {sidebarOpen && (
//                         <span
//                           className={`text-xs font-medium ${
//                             stat.change.includes("+")
//                               ? "text-green-600"
//                               : stat.change.includes("attention")
//                               ? "text-amber-600"
//                               : "text-red-600"
//                           }`}
//                         >
//                           {stat.change}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Navigation */}
//             <nav className="space-y-1">
//               {navigationItems.map((item) => {
//                 const isActive = activeSection === item.id;
//                 return (
//                   <button
//                     key={item.id}
//                     onClick={() => setActiveSection(item.id)}
//                     className={`flex items-center w-full p-3 rounded-lg transition-colors ${
//                       isActive
//                         ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
//                         : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
//                     }`}
//                   >
//                     <div
//                       className={`p-2 rounded-lg ${item.bgColor} ${item.color}`}
//                     >
//                       <item.icon className="h-4 w-4" />
//                     </div>
//                     {sidebarOpen && (
//                       <>
//                         <span className="ml-3 font-medium">{item.title}</span>
//                         {isActive && (
//                           <ChevronRightIcon className="h-4 w-4 ml-auto text-blue-500" />
//                         )}
//                       </>
//                     )}
//                   </button>
//                 );
//               })}
//             </nav>

//             {/* Quick Links */}
//             {sidebarOpen && (
//               <div className="mt-8">
//                 <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
//                   Quick Links
//                 </h3>
//                 <div className="space-y-2">
//                   {quickLinks.map((link, index) => (
//                     <Link
//                       key={index}
//                       to={link.path}
//                       className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
//                     >
//                       <div
//                         className={`p-2 rounded-lg bg-${link.color}-50 text-${link.color}-600`}
//                       >
//                         <link.icon className="h-4 w-4" />
//                       </div>
//                       <div className="ml-3">
//                         <p className="text-sm font-medium text-gray-900">
//                           {link.title}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {link.description}
//                         </p>
//                       </div>
//                     </Link>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* System Status */}
//             <div
//               className={`mt-8 p-3 bg-gray-50 rounded-lg ${
//                 !sidebarOpen && "hidden"
//               }`}
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium text-gray-700">
//                   System Status
//                 </span>
//                 <span className="flex items-center text-xs text-emerald-600">
//                   <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></div>
//                   Online
//                 </span>
//               </div>
//               <div className="flex items-center text-xs text-gray-500">
//                 <Calendar className="h-3 w-3 mr-1.5" />
//                 Semester I, 2024-25
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 overflow-auto">
//           <div className="p-6">{renderContent()}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Content Components (Overview, Workload, Payments, etc.)
// // These remain the same as your previous InstructorDashboard components

// const OverviewContent = ({ data }) => {
//   const chartData = [
//     { month: "Jul", amount: 20825 },
//     { month: "Aug", amount: 8330 },
//     { month: "Sep", amount: 12450 },
//     { month: "Oct", amount: 14647 },
//     { month: "Nov", amount: 15600 },
//     { month: "Dec", amount: 16500 },
//   ];

//   const workloadData = [
//     { name: "Lectures", hours: 20, color: "#3b82f6" },
//     { name: "Labs", hours: 12, color: "#10b981" },
//     { name: "Tutorials", hours: 6, color: "#f59e0b" },
//     { name: "Admin", hours: 4, color: "#8b5cf6" },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           title="Total Workload Hours"
//           value={data?.totalWorkloadHours || 0}
//           change="+2.5%"
//           changeType="positive"
//           icon={Clock}
//           color="blue"
//         />

//         <StatCard
//           title="Pending Approvals"
//           value={data?.pendingApprovals || 0}
//           change="Requires attention"
//           changeType="warning"
//           icon={AlertCircle}
//           color="amber"
//         />

//         <StatCard
//           title="Total Payments"
//           value={`ETB ${data?.totalPayments?.toLocaleString() || 0}`}
//           change="+12.3%"
//           changeType="positive"
//           icon={DollarSign}
//           color="green"
//         />

//         <StatCard
//           title="Overload Level"
//           value={`${data?.overloadPercentage || 0}%`}
//           change="Approaching limit"
//           changeType="warning"
//           icon={TrendingUp}
//           color="red"
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Workload Distribution
//           </h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={workloadData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) =>
//                     `${name}: ${(percent * 100).toFixed(0)}%`
//                   }
//                   outerRadius={80}
//                   dataKey="hours"
//                 >
//                   {workloadData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => [`${value} hours`, "Hours"]} />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Payment Trends
//           </h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip
//                   formatter={(value) => [
//                     `ETB ${value.toLocaleString()}`,
//                     "Amount",
//                   ]}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="amount"
//                   stroke="#10b981"
//                   fill="#10b981"
//                   fillOpacity={0.3}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Recent Activities
//           </h3>
//           <div className="space-y-4">
//             {[1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="flex items-start space-x-3 p-3 border-b border-gray-100 last:border-0"
//               >
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <CheckCircle className="h-4 w-4 text-blue-600" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-medium text-gray-900">Course Assignment</p>
//                   <p className="text-sm text-gray-600">
//                     Assigned to CS-301 Advanced Programming
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Upcoming Deadlines
//           </h3>
//           <div className="space-y-3">
//             {[1, 2].map((i) => (
//               <div key={i} className="p-3 border border-gray-200 rounded-lg">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="font-medium text-gray-900">
//                     Mid-term Grades
//                   </span>
//                   <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
//                     Due in 3 days
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   CS-301 Advanced Programming
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">Nov 15, 2024</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => {
//   const colorClasses = {
//     blue: "bg-blue-50 text-blue-600",
//     green: "bg-green-50 text-green-600",
//     amber: "bg-amber-50 text-amber-600",
//     red: "bg-red-50 text-red-600",
//   };

//   const changeColorClasses = {
//     positive: "text-green-600",
//     negative: "text-red-600",
//     warning: "text-amber-600",
//   };

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-600 font-medium">{title}</p>
//           <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
//           <div className="flex items-center mt-2">
//             <span
//               className={`text-xs font-medium ${changeColorClasses[changeType]}`}
//             >
//               {change}
//             </span>
//           </div>
//         </div>
//         <div className={`p-3 ${colorClasses[color]} rounded-lg`}>
//           <Icon className="h-6 w-6" />
//         </div>
//       </div>
//     </div>
//   );
// };

// // Other content components (WorkloadContent, PaymentsContent, etc.)
// // You can copy these from your previous InstructorDashboard.jsx

// const WorkloadContent = ({ data }) => (
//   <div className="space-y-6">
//     <div className="bg-white rounded-xl border border-gray-200 p-6">
//       <h2 className="text-xl font-bold text-gray-900 mb-4">My Workload</h2>
//       <div className="space-y-4">
//         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//           <span className="text-gray-600">Total Hours</span>
//           <span className="font-semibold text-gray-900">
//             {data?.total_hours || 0} hrs
//           </span>
//         </div>
//         {data?.assignments?.map((assignment) => (
//           <div
//             key={assignment.id}
//             className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
//           >
//             <div>
//               <p className="font-medium text-gray-900">
//                 {assignment.course_code}
//               </p>
//               <p className="text-sm text-gray-600">{assignment.course_title}</p>
//             </div>
//             <span
//               className={`px-3 py-1 rounded-full text-sm ${
//                 assignment.status === "accepted"
//                   ? "bg-green-100 text-green-800"
//                   : assignment.status === "pending"
//                   ? "bg-amber-100 text-amber-800"
//                   : "bg-gray-100 text-gray-800"
//               }`}
//             >
//               {assignment.status}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );

// const PaymentsContent = ({ data }) => (
//   <div className="space-y-6">
//     <div className="bg-white rounded-xl border border-gray-200 p-6">
//       <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
//       <div className="space-y-4">
//         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//           <span className="text-gray-600">Total Amount</span>
//           <span className="font-semibold text-gray-900">
//             ETB {data?.total_amount?.toLocaleString() || 0}
//           </span>
//         </div>
//         {data?.recent?.map((payment, index) => (
//           <div
//             key={index}
//             className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
//           >
//             <div>
//               <p className="font-medium text-gray-900">
//                 {payment.month} 2024 Payment
//               </p>
//               <p className="text-sm text-gray-600">
//                 ETB {payment.amount?.toLocaleString()}
//               </p>
//             </div>
//             <span
//               className={`px-3 py-1 rounded-full text-sm ${
//                 payment.status === "paid"
//                   ? "bg-green-100 text-green-800"
//                   : "bg-amber-100 text-amber-800"
//               }`}
//             >
//               {payment.status}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );

// const CoursesContent = ({ data }) => (
//   <div className="space-y-6">
//     <div className="bg-white rounded-xl border border-gray-200 p-6">
//       <h2 className="text-xl font-bold text-gray-900 mb-4">My Courses</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="p-4 bg-blue-50 rounded-lg">
//           <div className="flex items-center space-x-3">
//             <BookOpen className="h-5 w-5 text-blue-600" />
//             <div>
//               <p className="text-sm text-gray-600">Active Courses</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {data?.active || 0}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="p-4 bg-green-50 rounded-lg">
//           <div className="flex items-center space-x-3">
//             <Users className="h-5 w-5 text-green-600" />
//             <div>
//               <p className="text-sm text-gray-600">Total Students</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {data?.total_students || 0}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// const AlertsContent = () => (
//   <div className="space-y-6">
//     <div className="bg-white rounded-xl border border-gray-200 p-6">
//       <h2 className="text-xl font-bold text-gray-900 mb-4">
//         Alerts & Notifications
//       </h2>
//       <div className="space-y-4">
//         {[1, 2, 3].map((i) => (
//           <div
//             key={i}
//             className="flex items-start space-x-3 p-4 border border-amber-200 bg-amber-50 rounded-lg"
//           >
//             <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
//             <div>
//               <p className="font-medium text-gray-900">Overload Warning</p>
//               <p className="text-sm text-gray-600">
//                 Your workload is approaching the limit
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );

// const NewWorkloadContent = () => (
//   <div className="space-y-6">
//     <div className="bg-white rounded-xl border border-gray-200 p-6">
//       <h2 className="text-xl font-bold text-gray-900 mb-4">
//         Submit New Workload
//       </h2>
//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Course
//           </label>
//           <input
//             type="text"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             placeholder="Enter course code"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Hours
//           </label>
//           <input
//             type="number"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             placeholder="Enter hours per week"
//           />
//         </div>
//         <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
//           Submit for Approval
//         </button>
//       </div>
//     </div>
//   </div>
// );

// export default InstructorDashboard;
