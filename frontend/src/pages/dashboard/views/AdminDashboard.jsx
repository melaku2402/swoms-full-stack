// // import { useState } from "react";
// // import {
// //   Users,
// //   Building,
// //   GraduationCap,
// //   BookOpen,
// //   DollarSign,
// //   Shield,
// //   Settings,
// //   BarChart3,
// //   Activity,
// //   TrendingUp,
// //   PieChart,
// //   Target,
// //   Award,
// //   Trophy,
// //   Star,
// //   Database,
// //   Cpu,
// //   Network,
// //   Server,
// //   Lock,
// //   TrendingDown,
// //   FileText,
// // } from "lucide-react";
// // import { Link } from "react-router-dom";

// // const AdminDashboard = ({ activeTab, setActiveTab }) => {
// //   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// //   const tabs = [
// //     { id: "overview", label: "Overview", icon: Activity, color: "cyan" },
// //     { id: "users", label: "Users", icon: Users, color: "blue" },
// //     { id: "academic", label: "Academic", icon: GraduationCap, color: "purple" },
// //     { id: "financial", label: "Financial", icon: DollarSign, color: "emerald" },
// //     { id: "security", label: "Security", icon: Shield, color: "red" },
// //     { id: "analytics", label: "Analytics", icon: BarChart3, color: "orange" },
// //     { id: "system", label: "System", icon: Settings, color: "gray" },
// //   ];

// //   const renderContent = () => {
// //     switch (activeTab) {
// //       case "users":
// //         return <UsersView />;
// //       case "academic":
// //         return <AcademicView />;
// //       case "financial":
// //         return <FinancialView />;
// //       case "security":
// //         return <SecurityView />;
// //       case "analytics":
// //         return <AnalyticsView />;
// //       case "system":
// //         return <SystemView />;
// //       default:
// //         return <OverviewView />;
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col lg:flex-row gap-6">
// //       {/* Admin Dashboard Sidebar */}
// //       <div
// //         className={`lg:w-64 transition-all duration-300 ${
// //           sidebarCollapsed ? "lg:w-20" : ""
// //         }`}
// //       >
// //         <div className="card-glass overflow-hidden">
// //           <div className="p-4 border-b border-white/10">
// //             <div className="flex items-center justify-between">
// //               <h3
// //                 className={`text-lg font-semibold text-white transition-opacity ${
// //                   sidebarCollapsed ? "lg:hidden" : ""
// //                 }`}
// //               >
// //                 Admin Console
// //               </h3>
// //               <button
// //                 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
// //                 className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors"
// //               >
// //                 <div className="w-4 h-4 flex items-center justify-center">
// //                   <div
// //                     className={`w-2 h-0.5 bg-gray-400 transform transition-transform ${
// //                       sidebarCollapsed
// //                         ? "rotate-45 translate-y-0.5"
// //                         : "-rotate-45 -translate-y-0.5"
// //                     }`}
// //                   ></div>
// //                   <div
// //                     className={`w-2 h-0.5 bg-gray-400 transform transition-transform ${
// //                       sidebarCollapsed
// //                         ? "-rotate-45 -translate-y-0.5"
// //                         : "rotate-45 translate-y-0.5"
// //                     }`}
// //                   ></div>
// //                 </div>
// //               </button>
// //             </div>
// //           </div>

// //           <div className="p-2">
// //             <nav className="space-y-1">
// //               {tabs.map((tab) => {
// //                 const Icon = tab.icon;
// //                 return (
// //                   <button
// //                     key={tab.id}
// //                     onClick={() => setActiveTab(tab.id)}
// //                     className={`w-full flex items-center ${
// //                       sidebarCollapsed ? "justify-center px-3" : "px-4"
// //                     } py-3 rounded-lg transition-all duration-200 ${
// //                       activeTab === tab.id
// //                         ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-400/30`
// //                         : "text-gray-400 hover:text-white hover:bg-gray-800/50"
// //                     }`}
// //                   >
// //                     <Icon className="h-5 w-5" />
// //                     {!sidebarCollapsed && (
// //                       <span className="ml-3 font-medium">{tab.label}</span>
// //                     )}
// //                   </button>
// //                 );
// //               })}
// //             </nav>
// //           </div>

// //           {/* Quick links */}
// //           {!sidebarCollapsed && (
// //             <div className="p-4 border-t border-white/10">
// //               <p className="text-xs text-gray-500 mb-2">Quick Links</p>
// //               <div className="space-y-2">
// //                 <Link
// //                   to="/admin/users"
// //                   className="flex items-center text-sm text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800/30 transition-colors"
// //                 >
// //                   <Users className="h-4 w-4 mr-2" />
// //                   User Management
// //                 </Link>
// //                 <Link
// //                   to="/admin/rules"
// //                   className="flex items-center text-sm text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800/30 transition-colors"
// //                 >
// //                   <Shield className="h-4 w-4 mr-2" />
// //                   System Rules
// //                 </Link>
// //                 <Link
// //                   to="/admin/audit-log"
// //                   className="flex items-center text-sm text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800/30 transition-colors"
// //                 >
// //                   <Database className="h-4 w-4 mr-2" />
// //                   Audit Log
// //                 </Link>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Main Content Area */}
// //       <div className="flex-1">{renderContent()}</div>
// //     </div>
// //   );
// // };

// // // Different Views for Admin Dashboard
// // const OverviewView = () => (
// //   <div className="space-y-6">
// //     {/* Stats Grid */}
// //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// //       <div className="card-glass p-5">
// //         <div className="flex items-center justify-between mb-4">
// //           <div>
// //             <p className="text-sm text-gray-400">Total Users</p>
// //             <p className="text-2xl font-bold text-white mt-1">156</p>
// //           </div>
// //           <div className="p-3 rounded-lg bg-blue-500/20">
// //             <Users className="h-6 w-6 text-blue-400" />
// //           </div>
// //         </div>
// //         <div className="text-xs text-emerald-400 flex items-center">
// //           <TrendingUp className="h-3 w-3 mr-1" />
// //           +12% this month
// //         </div>
// //       </div>

// //       <div className="card-glass p-5">
// //         <div className="flex items-center justify-between mb-4">
// //           <div>
// //             <p className="text-sm text-gray-400">Active Workloads</p>
// //             <p className="text-2xl font-bold text-white mt-1">42</p>
// //           </div>
// //           <div className="p-3 rounded-lg bg-cyan-500/20">
// //             <Activity className="h-6 w-6 text-cyan-400" />
// //           </div>
// //         </div>
// //         <div className="text-xs text-emerald-400 flex items-center">
// //           <TrendingUp className="h-3 w-3 mr-1" />
// //           +8% this week
// //         </div>
// //       </div>

// //       <div className="card-glass p-5">
// //         <div className="flex items-center justify-between mb-4">
// //           <div>
// //             <p className="text-sm text-gray-400">Revenue</p>
// //             <p className="text-2xl font-bold text-white mt-1">$24,568</p>
// //           </div>
// //           <div className="p-3 rounded-lg bg-emerald-500/20">
// //             <DollarSign className="h-6 w-6 text-emerald-400" />
// //           </div>
// //         </div>
// //         <div className="text-xs text-emerald-400 flex items-center">
// //           <TrendingUp className="h-3 w-3 mr-1" />
// //           +23% from last month
// //         </div>
// //       </div>

// //       <div className="card-glass p-5">
// //         <div className="flex items-center justify-between mb-4">
// //           <div>
// //             <p className="text-sm text-gray-400">System Load</p>
// //             <p className="text-2xl font-bold text-white mt-1">68%</p>
// //           </div>
// //           <div className="p-3 rounded-lg bg-purple-500/20">
// //             <Cpu className="h-6 w-6 text-purple-400" />
// //           </div>
// //         </div>
// //         <div className="text-xs text-red-400 flex items-center">
// //           <TrendingDown className="h-3 w-3 mr-1" />
// //           -5% from peak
// //         </div>
// //       </div>
// //     </div>

// //     {/* Charts and Analytics */}
// //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //       <div className="card-glass p-6">
// //         <div className="flex items-center justify-between mb-6">
// //           <h3 className="text-lg font-semibold text-white">
// //             Performance Metrics
// //           </h3>
// //           <BarChart3 className="h-5 w-5 text-gray-400" />
// //         </div>
// //         <div className="space-y-4">
// //           {[
// //             { label: "API Response Time", value: 85, color: "cyan" },
// //             { label: "Database Queries", value: 72, color: "blue" },
// //             { label: "Cache Hit Rate", value: 94, color: "emerald" },
// //             { label: "Uptime", value: 99.9, color: "purple" },
// //           ].map((metric, index) => (
// //             <div key={index}>
// //               <div className="flex items-center justify-between text-sm mb-2">
// //                 <span className="text-gray-400">{metric.label}</span>
// //                 <span className="text-white">{metric.value}%</span>
// //               </div>
// //               <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
// //                 <div
// //                   className={`h-full bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600`}
// //                   style={{ width: `${metric.value}%` }}
// //                 ></div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       <div className="card-glass p-6">
// //         <div className="flex items-center justify-between mb-6">
// //           <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
// //           <Activity className="h-5 w-5 text-gray-400" />
// //         </div>
// //         <div className="space-y-4">
// //           {[
// //             {
// //               user: "John Doe",
// //               action: "Created new course",
// //               time: "2 min ago",
// //               icon: BookOpen,
// //             },
// //             {
// //               user: "Sarah Smith",
// //               action: "Updated workload",
// //               time: "15 min ago",
// //               icon: FileText,
// //             },
// //             {
// //               user: "Mike Johnson",
// //               action: "Processed payment",
// //               time: "1 hour ago",
// //               icon: DollarSign,
// //             },
// //             {
// //               user: "Admin",
// //               action: "Updated system rules",
// //               time: "2 hours ago",
// //               icon: Settings,
// //             },
// //           ].map((activity, index) => {
// //             const Icon = activity.icon;
// //             return (
// //               <div
// //                 key={index}
// //                 className="flex items-center space-x-3 p-3 hover:bg-gray-800/30 rounded-lg transition-colors"
// //               >
// //                 <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
// //                   <Icon className="h-4 w-4 text-cyan-400" />
// //                 </div>
// //                 <div className="flex-1">
// //                   <p className="text-sm text-white">{activity.user}</p>
// //                   <p className="text-xs text-gray-400">{activity.action}</p>
// //                 </div>
// //                 <span className="text-xs text-gray-500">{activity.time}</span>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>
// //     </div>
// //   </div>
// // );

// // const UsersView = () => (
// //   <div className="card-glass p-6">
// //     <h2 className="text-xl font-bold text-white mb-6">Users Management</h2>
// //     {/* User management content */}
// //   </div>
// // );

// // const AcademicView = () => (
// //   <div className="card-glass p-6">
// //     <h2 className="text-xl font-bold text-white mb-6">Academic Management</h2>
// //     {/* Academic management content */}
// //   </div>
// // );

// // const FinancialView = () => (
// //   <div className="card-glass p-6">
// //     <h2 className="text-xl font-bold text-white mb-6">Financial Overview</h2>
// //     {/* Financial content */}
// //   </div>
// // );

// // const SecurityView = () => (
// //   <div className="card-glass p-6">
// //     <h2 className="text-xl font-bold text-white mb-6">Security Dashboard</h2>
// //     {/* Security content */}
// //   </div>
// // );

// // const AnalyticsView = () => (
// //   <div className="card-glass p-6">
// //     <h2 className="text-xl font-bold text-white mb-6">Analytics & Reports</h2>
// //     {/* Analytics content */}
// //   </div>
// // );

// // const SystemView = () => (
// //   <div className="card-glass p-6">
// //     <h2 className="text-xl font-bold text-white mb-6">System Configuration</h2>
// //     {/* System configuration content */}
// //   </div>
// // );

// // export default AdminDashboard;

// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   Filter,
//   Plus,
//   Edit,
//   MoreVertical,
//   Eye,
//   Download,
//   Printer,
//   Trash2,
//   Calendar,
//   ChevronDown,
//   ChevronRight,
//   ChevronLeft,
//   Users,
//   Building,
//   GraduationCap,
//   BookOpen,
//   FileText,
//   DollarSign,
//   Settings,
//   Bell,
//   HelpCircle,
//   User,
//   Database,
//   Shield,
//   TrendingUp,
//   TrendingDown,
//   Activity,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   BarChart3,
//   PieChart,
//   Target,
//   Award,
//   MessageSquare,
//   Mail,
//   Phone,
//   Globe,
//   RefreshCw,
//   Loader2,
// } from "lucide-react";
// import { useAuth } from "../../../contexts/AuthContext";
// import { academicAPI,workloadAPI,paymentAPI } from "../../../api";
// import toast from "react-hot-toast";

// const AdminDashboard = () => {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState("courses");
//   const [departmentFilter, setDepartmentFilter] = useState("All Departments");
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [activeSection, setActiveSection] = useState("dashboard");
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalCourses: 0,
//     totalDepartments: 0,
//     totalColleges: 0,
//     totalUsers: 0,
//     pendingWorkloads: 0,
//     totalPayments: 0,
//   });
//   const [courses, setCourses] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [recentActivities, setRecentActivities] = useState([]);

//   // Fetch dashboard data
//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Fetch statistics from backend
//       const [coursesData, departmentsData, usersData, workloadsData] =
//         await Promise.all([
//           academicAPI.getCourses({ limit: 5 }),
//           academicAPI.getDepartments({ limit: 1 }),
//           academicAPI.getUsers({ limit: 1 }),
//           workloadAPI.getWorkloads({ status: "pending", limit: 1 }),
//         ]);

//       // Update stats
//       setStats({
//         totalCourses: coursesData?.pagination?.total || 0,
//         totalDepartments: departmentsData?.pagination?.total || 0,
//         totalColleges: 5, // You'll need an API for this
//         totalUsers: usersData?.pagination?.total || 0,
//         pendingWorkloads: workloadsData?.pagination?.total || 0,
//         totalPayments: 0, // You'll need an API for this
//       });

//       // Set courses data
//       setCourses(coursesData?.data || []);

//       // Set recent activities (mock for now - you'll need an API)
//       setRecentActivities([
//         {
//           user: "Dr. Johnson",
//           action: "Added new course",
//           time: "10 min ago",
//           type: "add",
//         },
//         {
//           user: "Prof. Smith",
//           action: "Updated workload hours",
//           time: "25 min ago",
//           type: "update",
//         },
//         {
//           user: "Admin",
//           action: "Approved 3 courses",
//           time: "1 hour ago",
//           type: "approve",
//         },
//         {
//           user: "System",
//           action: "Automated backup completed",
//           time: "2 hours ago",
//           type: "system",
//         },
//       ]);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       toast.error("Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const sidebarItems = [
//     {
//       id: "dashboard",
//       label: "Dashboard",
//       icon: Activity,
//       color: "text-blue-500",
//       bgColor: "bg-blue-500/10",
//     },
//     {
//       id: "academic",
//       label: "ACADEMIC STRUCTURE",
//       icon: GraduationCap,
//       color: "text-purple-500",
//       bgColor: "bg-purple-500/10",
//       subItems: [
//         {
//           id: "years",
//           label: "Years & Semesters",
//           icon: Calendar,
//           path: "/academic/years",
//         },
//         {
//           id: "colleges",
//           label: "Colleges & Depts",
//           icon: Building,
//           path: "/academic/colleges",
//         },
//         {
//           id: "courses",
//           label: "Courses & Sections",
//           icon: BookOpen,
//           path: "/academic/courses",
//           active: true,
//         },
//       ],
//     },
//     {
//       id: "people",
//       label: "PEOPLE & ROLES",
//       icon: Users,
//       color: "text-green-500",
//       bgColor: "bg-green-500/10",
//       subItems: [
//         {
//           id: "staff",
//           label: "Staff Directory",
//           icon: Users,
//           path: "/admin/staff",
//         },
//         {
//           id: "roles",
//           label: "User Roles",
//           icon: Shield,
//           path: "/admin/roles",
//         },
//       ],
//     },
//     {
//       id: "workloads",
//       label: "WORKLOADS",
//       icon: FileText,
//       color: "text-amber-500",
//       bgColor: "bg-amber-500/10",
//       subItems: [
//         {
//           id: "regular",
//           label: "Regular Program",
//           icon: FileText,
//           path: "/workload/regular",
//         },
//         {
//           id: "nrp",
//           label: "Non-Regular (NRP)",
//           icon: AlertCircle,
//           path: "/workload/nrp",
//         },
//         {
//           id: "alerts",
//           label: "Overload Alerts",
//           icon: Bell,
//           path: "/workload/alerts",
//         },
//       ],
//     },
//     {
//       id: "notes",
//       label: "Notes",
//       icon: MessageSquare,
//       color: "text-indigo-500",
//       bgColor: "bg-indigo-500/10",
//       path: "/notes",
//     },
//     {
//       id: "finance",
//       label: "FINANCE",
//       icon: DollarSign,
//       color: "text-emerald-500",
//       bgColor: "bg-emerald-500/10",
//       subItems: [
//         {
//           id: "payments",
//           label: "Payments",
//           icon: DollarSign,
//           path: "/payments",
//         },
//         {
//           id: "rates",
//           label: "Rules & Rates",
//           icon: Settings,
//           path: "/payments/rates",
//         },
//       ],
//     },
//   ];

//   const statsCards = [
//     {
//       label: "Total Courses",
//       value: stats.totalCourses,
//       change: "+12%",
//       icon: BookOpen,
//       color: "blue",
//     },
//     {
//       label: "Total Departments",
//       value: stats.totalDepartments,
//       change: "+8%",
//       icon: Building,
//       color: "purple",
//     },
//     {
//       label: "Total Users",
//       value: stats.totalUsers,
//       change: "+5%",
//       icon: Users,
//       color: "green",
//     },
//     {
//       label: "Pending Workloads",
//       value: stats.pendingWorkloads,
//       change: "-2%",
//       icon: AlertCircle,
//       color: "amber",
//     },
//     {
//       label: "Colleges",
//       value: stats.totalColleges,
//       change: "+3%",
//       icon: GraduationCap,
//       color: "cyan",
//     },
//     {
//       label: "System Uptime",
//       value: "99.9%",
//       change: "0%",
//       icon: CheckCircle,
//       color: "emerald",
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
//           <p className="mt-4 text-gray-600">Loading dashboard data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
//       {/* Top Navigation */}
//       <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg">
//         <div className="px-4 sm:px-6 lg:px-8 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//                 className="p-2 hover:bg-blue-600 rounded-lg transition-colors lg:hidden"
//               >
//                 {sidebarCollapsed ? (
//                   <ChevronRight size={20} />
//                 ) : (
//                   <ChevronLeft size={20} />
//                 )}
//               </button>

//               <div className="flex items-center space-x-3">
//                 <div className="hidden sm:flex items-center space-x-2">
//                   <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
//                     <GraduationCap className="h-6 w-6 text-white" />
//                   </div>
//                   <div>
//                     <h1 className="text-xl font-bold">SWOMS</h1>
//                     <p className="text-xs text-blue-200">Injibara University</p>
//                   </div>
//                 </div>

//                 <div className="hidden md:block border-l border-blue-600 h-8"></div>

//                 <div className="flex items-center space-x-2 bg-blue-600/30 px-4 py-1.5 rounded-lg">
//                   <Calendar className="h-4 w-4" />
//                   <span className="text-sm font-medium">
//                     Fall 2024-25 - Semester 1
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="hidden md:flex items-center space-x-3">
//                 <button className="relative p-2 hover:bg-blue-600 rounded-lg">
//                   <Bell className="h-5 w-5" />
//                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-700"></span>
//                 </button>
//                 <button
//                   onClick={fetchDashboardData}
//                   className="p-2 hover:bg-blue-600 rounded-lg"
//                   title="Refresh Data"
//                 >
//                   <RefreshCw className="h-5 w-5" />
//                 </button>
//                 <button className="p-2 hover:bg-blue-600 rounded-lg">
//                   <HelpCircle className="h-5 w-5" />
//                 </button>
//               </div>

//               <div className="flex items-center space-x-3 bg-blue-600/30 px-4 py-2 rounded-lg">
//                 <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
//                   <User className="h-5 w-5" />
//                 </div>
//                 <div className="hidden sm:block">
//                   <p className="text-sm font-medium">
//                     {user?.name || "Admin User"}
//                   </p>
//                   <p className="text-xs text-blue-200">
//                     {user?.role?.replace("_", " ") || "Admin"}
//                   </p>
//                 </div>
//                 <ChevronDown className="h-4 w-4" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex">
//         {/* Sidebar */}
//         <div
//           className={`${
//             sidebarCollapsed ? "w-0 lg:w-20" : "w-64"
//           } bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white transition-all duration-300 overflow-hidden`}
//         >
//           <nav className="p-4 h-[calc(100vh-64px)] overflow-y-auto">
//             <div className="space-y-1">
//               {sidebarItems.map((item) => (
//                 <div key={item.id} className="mb-4">
//                   {item.subItems ? (
//                     <div>
//                       <button
//                         onClick={() =>
//                           setActiveSection(
//                             activeSection === item.id ? null : item.id
//                           )
//                         }
//                         className={`flex items-center justify-between w-full px-3 py-2 mb-2 rounded-lg transition-colors ${
//                           activeSection === item.id ||
//                           item.subItems.some((sub) => sub.active)
//                             ? "bg-white/10"
//                             : "hover:bg-white/5"
//                         }`}
//                       >
//                         <div className="flex items-center">
//                           <item.icon
//                             className={`h-5 w-5 ${item.color} ${
//                               sidebarCollapsed ? "" : "mr-3"
//                             }`}
//                           />
//                           {!sidebarCollapsed && (
//                             <span className="text-sm font-medium">
//                               {item.label}
//                             </span>
//                           )}
//                         </div>
//                         {!sidebarCollapsed && (
//                           <ChevronDown
//                             className={`h-4 w-4 text-blue-300 transition-transform ${
//                               activeSection === item.id ? "rotate-180" : ""
//                             }`}
//                           />
//                         )}
//                       </button>

//                       {!sidebarCollapsed && activeSection === item.id && (
//                         <div className="space-y-1 ml-8">
//                           {item.subItems.map((subItem) => (
//                             <a
//                               key={subItem.id}
//                               href={subItem.path}
//                               className={`flex items-center px-3 py-2 rounded text-sm transition-colors ${
//                                 subItem.active
//                                   ? "bg-white/20 text-white"
//                                   : "text-blue-200 hover:bg-white/10 hover:text-white"
//                               }`}
//                             >
//                               <subItem.icon className="h-4 w-4 mr-3" />
//                               {subItem.label}
//                             </a>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <a
//                       href={item.path}
//                       className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
//                         activeSection === item.id
//                           ? "bg-white/20 text-white"
//                           : "text-blue-200 hover:bg-white/10 hover:text-white"
//                       }`}
//                     >
//                       <item.icon
//                         className={`h-5 w-5 ${item.color} ${
//                           sidebarCollapsed ? "mx-auto" : "mr-3"
//                         }`}
//                       />
//                       {!sidebarCollapsed && (
//                         <span className="text-sm font-medium">
//                           {item.label}
//                         </span>
//                       )}
//                     </a>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* System Status */}
//             {!sidebarCollapsed && (
//               <div className="mt-8 p-3 bg-white/10 rounded-lg">
//                 <div className="flex items-center mb-2">
//                   <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
//                   <span className="text-xs text-emerald-300">
//                     System Online
//                   </span>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-blue-200">Database</span>
//                     <span className="text-xs text-emerald-300">✓</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-xs text-blue-200">API</span>
//                     <span className="text-xs text-emerald-300">✓</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </nav>
//         </div>

//         {/* Main Content */}
//         <div
//           className={`flex-1 p-4 md:p-6 transition-all duration-300 ${
//             sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
//           }`}
//         >
//           {/* Page Header */}
//           <div className="mb-8">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
//                   {activeSection === "dashboard"
//                     ? "Dashboard Overview"
//                     : activeSection === "courses"
//                     ? "Courses & Sections"
//                     : activeSection === "users"
//                     ? "User Management"
//                     : "Admin Dashboard"}
//                 </h1>
//                 <p className="text-gray-600">
//                   {activeSection === "dashboard"
//                     ? "Welcome to SWOMS Admin Dashboard"
//                     : activeSection === "courses"
//                     ? "Manage curriculum, course catalogue and section offerings"
//                     : "System administration and management"}
//                 </p>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
//                   <Download className="h-4 w-4" />
//                   <span>Export Data</span>
//                 </button>
//                 <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm hover:from-blue-700 hover:to-blue-800">
//                   <Plus className="h-4 w-4" />
//                   <span>New Course</span>
//                 </button>
//               </div>
//             </div>

//             {/* Quick Stats */}
//             <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//               {statsCards.map((stat, index) => (
//                 <div
//                   key={index}
//                   className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-xs text-gray-500">{stat.label}</p>
//                       <p className="text-lg font-bold text-gray-900 mt-1">
//                         {stat.value}
//                       </p>
//                     </div>
//                     <div
//                       className={`p-2 rounded-lg ${
//                         stat.color === "blue"
//                           ? "bg-blue-50"
//                           : stat.color === "green"
//                           ? "bg-green-50"
//                           : stat.color === "purple"
//                           ? "bg-purple-50"
//                           : stat.color === "amber"
//                           ? "bg-amber-50"
//                           : stat.color === "cyan"
//                           ? "bg-cyan-50"
//                           : "bg-emerald-50"
//                       }`}
//                     >
//                       <stat.icon
//                         className={`h-5 w-5 ${
//                           stat.color === "blue"
//                             ? "text-blue-500"
//                             : stat.color === "green"
//                             ? "text-green-500"
//                             : stat.color === "purple"
//                             ? "text-purple-500"
//                             : stat.color === "amber"
//                             ? "text-amber-500"
//                             : stat.color === "cyan"
//                             ? "text-cyan-500"
//                             : "text-emerald-500"
//                         }`}
//                       />
//                     </div>
//                   </div>
//                   <div
//                     className={`text-xs mt-2 flex items-center ${
//                       stat.change.startsWith("+")
//                         ? "text-green-600"
//                         : stat.change.startsWith("-")
//                         ? "text-red-600"
//                         : "text-gray-600"
//                     }`}
//                   >
//                     {stat.change.startsWith("+") ? (
//                       <TrendingUp className="h-3 w-3 mr-1" />
//                     ) : stat.change.startsWith("-") ? (
//                       <TrendingDown className="h-3 w-3 mr-1" />
//                     ) : null}
//                     {stat.change}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <div className="mb-6">
//             <div className="border-b border-gray-200">
//               <nav className="-mb-px flex space-x-8">
//                 {[
//                   "overview",
//                   "courses",
//                   "sections",
//                   "curriculum",
//                   "analytics",
//                 ].map((tab) => (
//                   <button
//                     key={tab}
//                     onClick={() => setActiveTab(tab)}
//                     className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
//                       activeTab === tab
//                         ? "border-blue-600 text-blue-600"
//                         : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                     }`}
//                   >
//                     {tab === "overview" ? "Dashboard" : tab}
//                   </button>
//                 ))}
//               </nav>
//             </div>
//           </div>

//           {/* Search and Filter Bar */}
//           <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
//             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//               <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search courses by code or title..."
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <select
//                     value={departmentFilter}
//                     onChange={(e) => setDepartmentFilter(e.target.value)}
//                     className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option>All Departments</option>
//                     <option>Computer Science</option>
//                     <option>Mathematics</option>
//                     <option>English Dept</option>
//                   </select>

//                   <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
//                     <Filter className="h-4 w-4" />
//                     <span>More Filters</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Main Content Area */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Courses Table */}
//             <div className="lg:col-span-2">
//               <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
//                 <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900">
//                         Recent Courses
//                       </h3>
//                       <p className="text-sm text-gray-600 mt-1">
//                         Latest courses added to the system
//                       </p>
//                     </div>
//                     <span className="text-sm text-gray-500">
//                       {courses.length} courses
//                     </span>
//                   </div>
//                 </div>

//                 {courses.length > 0 ? (
//                   <>
//                     <div className="overflow-x-auto">
//                       <table className="w-full">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Code
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Course Title
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Department
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Status
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Actions
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-200">
//                           {courses.slice(0, 5).map((course, index) => (
//                             <tr
//                               key={index}
//                               className="hover:bg-gray-50 transition-colors"
//                             >
//                               <td className="px-6 py-4 whitespace-nowrap">
//                                 <div className="font-medium text-blue-600">
//                                   {course.code}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-900 font-medium">
//                                   {course.title}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-600">
//                                   {course.department}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap">
//                                 <span
//                                   className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                     course.status === "Active"
//                                       ? "bg-green-100 text-green-800"
//                                       : "bg-amber-100 text-amber-800"
//                                   }`}
//                                 >
//                                   {course.status}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap">
//                                 <div className="flex items-center space-x-2">
//                                   <button className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded">
//                                     <Eye className="h-4 w-4" />
//                                   </button>
//                                   <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
//                                     <Edit className="h-4 w-4" />
//                                   </button>
//                                   <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
//                                     <MoreVertical className="h-4 w-4" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>

//                     <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
//                       <div className="flex items-center justify-between">
//                         <div className="text-sm text-gray-700">
//                           Showing <span className="font-medium">1</span> to{" "}
//                           <span className="font-medium">
//                             {Math.min(courses.length, 5)}
//                           </span>{" "}
//                           of{" "}
//                           <span className="font-medium">{courses.length}</span>{" "}
//                           courses
//                         </div>
//                         <a
//                           href="/academic/courses"
//                           className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//                         >
//                           View all courses →
//                         </a>
//                       </div>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="px-6 py-12 text-center">
//                     <BookOpen className="h-12 w-12 text-gray-400 mx-auto" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">
//                       No courses found
//                     </h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                       Get started by creating a new course.
//                     </p>
//                     <div className="mt-6">
//                       <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
//                         <Plus className="-ml-1 mr-2 h-5 w-5" />
//                         New Course
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Right Sidebar - Analytics & Activity */}
//             <div className="space-y-6">
//               {/* Recent Activity */}
//               <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     Recent Activity
//                   </h3>
//                   <Activity className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <div className="space-y-4">
//                   {recentActivities.map((activity, index) => (
//                     <div key={index} className="flex items-start space-x-3">
//                       <div
//                         className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                           activity.type === "add"
//                             ? "bg-blue-100"
//                             : activity.type === "update"
//                             ? "bg-amber-100"
//                             : activity.type === "approve"
//                             ? "bg-green-100"
//                             : "bg-purple-100"
//                         }`}
//                       >
//                         {activity.type === "add" && (
//                           <Plus className="h-4 w-4 text-blue-600" />
//                         )}
//                         {activity.type === "update" && (
//                           <Edit className="h-4 w-4 text-amber-600" />
//                         )}
//                         {activity.type === "approve" && (
//                           <CheckCircle className="h-4 w-4 text-green-600" />
//                         )}
//                         {activity.type === "system" && (
//                           <Database className="h-4 w-4 text-purple-600" />
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <p className="text-sm font-medium text-gray-900">
//                           {activity.user}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {activity.action}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-1">
//                           {activity.time}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
//                   View all activity →
//                 </button>
//               </div>

//               {/* System Overview */}
//               <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     System Overview
//                   </h3>
//                   <BarChart3 className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex items-center justify-between text-sm mb-2">
//                       <span className="text-gray-600">Server Load</span>
//                       <span className="font-medium text-gray-900">42%</span>
//                     </div>
//                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-2/5"></div>
//                     </div>
//                   </div>
//                   <div>
//                     <div className="flex items-center justify-between text-sm mb-2">
//                       <span className="text-gray-600">Database Usage</span>
//                       <span className="font-medium text-gray-900">68%</span>
//                     </div>
//                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 w-2/3"></div>
//                     </div>
//                   </div>
//                   <div>
//                     <div className="flex items-center justify-between text-sm mb-2">
//                       <span className="text-gray-600">Active Users</span>
//                       <span className="font-medium text-gray-900">24</span>
//                     </div>
//                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-1/2"></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Actions */}
//               <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   Quick Actions
//                 </h3>
//                 <div className="space-y-3">
//                   <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
//                     <div className="flex items-center">
//                       <Users className="h-5 w-5 text-blue-600 mr-3" />
//                       <span className="text-sm font-medium text-gray-900">
//                         Add New User
//                       </span>
//                     </div>
//                     <ChevronRight className="h-4 w-4 text-gray-400" />
//                   </button>
//                   <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
//                     <div className="flex items-center">
//                       <FileText className="h-5 w-5 text-green-600 mr-3" />
//                       <span className="text-sm font-medium text-gray-900">
//                         Create Report
//                       </span>
//                     </div>
//                     <ChevronRight className="h-4 w-4 text-gray-400" />
//                   </button>
//                   <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
//                     <div className="flex items-center">
//                       <Settings className="h-5 w-5 text-purple-600 mr-3" />
//                       <span className="text-sm font-medium text-gray-900">
//                         System Settings
//                       </span>
//                     </div>
//                     <ChevronRight className="h-4 w-4 text-gray-400" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Stats */}
//           <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
//             <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-5">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm opacity-90">Today's Logins</p>
//                   <p className="text-2xl font-bold mt-1">42</p>
//                 </div>
//                 <Users className="h-8 w-8 opacity-80" />
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-5">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm opacity-90">Pending Approvals</p>
//                   <p className="text-2xl font-bold mt-1">7</p>
//                 </div>
//                 <AlertCircle className="h-8 w-8 opacity-80" />
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-5">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm opacity-90">Active Sessions</p>
//                   <p className="text-2xl font-bold mt-1">18</p>
//                 </div>
//                 <Activity className="h-8 w-8 opacity-80" />
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-5">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm opacity-90">System Alerts</p>
//                   <p className="text-2xl font-bold mt-1">2</p>
//                 </div>
//                 <Bell className="h-8 w-8 opacity-80" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="border-t border-gray-200 bg-white py-4 px-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between">
//           <div className="text-sm text-gray-600">
//             © {new Date().getFullYear()} Injibara University - SWOMS v2.0
//           </div>
//           <div className="flex items-center space-x-4 mt-2 md:mt-0">
//             <div className="flex items-center text-sm text-gray-600">
//               <Globe className="h-4 w-4 mr-1" />
//               <span>
//                 Last updated: Today,{" "}
//                 {new Date().toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </span>
//             </div>
//             <div className="hidden md:flex items-center text-sm text-gray-600">
//               <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
//               <span>All systems operational</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;