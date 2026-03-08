

// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Database,
  Network,
  Shield,
  Cpu,
  Users,
  BookOpen,
  Building,
  GraduationCap,
  DollarSign,
  FileText,
  FolderOpen,
  BarChart3,
  Target,
  Award,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AdminDashboard from "../admin/AdminDashboard";
import InstructorDashboard from "./views/InstructorDashboard";
import DepartmentHeadDashboard from "./views/DepartmentHeadDashboard";
import DeanDashboard from "./views/DeanDashboard";
import FinanceDashboard from "./views/FinanceDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Dashboard data refreshed");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  // Render role-specific dashboard
  const renderDashboardByRole = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      );
    }

    switch (user?.role) {
      case "admin":
        return <AdminDashboard />;
      case "instructor":
        return <InstructorDashboard />;
      case "department_head":
        return <DepartmentHeadDashboard />;
      case "dean":
        return <DeanDashboard />;
      case "finance":
      case "vpaf":
        return <FinanceDashboard />;
      default:
        // return <DefaultDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Dashboard content */}
      {renderDashboardByRole()}

      {/* System Status Footer */}
      {/* <SystemStatusFooter /> */}
    </div>
  );
};

// Default Dashboard for roles without specific dashboard
// const DefaultDashboard = () => (
//   <div className="space-y-6">
//     {/* Welcome Card */}
//     {/* <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white rounded-2xl p-6 shadow-xl">
//       <div className="flex flex-col md:flex-row md:items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold mb-2">Welcome to SWOMS</h2>
//           <p className="text-blue-200">
//             Staff Workload & Overtime Management System for Injibara University
//           </p>
//           <div className="flex items-center mt-4 space-x-4">
//             <div className="flex items-center space-x-2">
//               <Calendar className="h-5 w-5 text-amber-400" />
//               <span>Academic Year: 2024-2025</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Clock className="h-5 w-5 text-amber-400" />
//               <span>Semester I</span>
//             </div>
//           </div>
//         </div>
//         <div className="mt-4 md:mt-0">
//           <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
//             <GraduationCap className="h-8 w-8 text-blue-900" />
//           </div>
//         </div>
//       </div>
//     </div> */}

//     {/* Quick Stats */}
//     {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">Active Courses</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
//           </div>
//           <div className="p-3 bg-blue-50 rounded-lg">
//             <BookOpen className="h-6 w-6 text-blue-600" />
//           </div>
//         </div>
//         <div className="mt-3 flex items-center text-green-600 text-sm">
//           <TrendingUp className="h-4 w-4 mr-1" />
//           <span>+8% from last month</span>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">Departments</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
//           </div>
//           <div className="p-3 bg-purple-50 rounded-lg">
//             <Building className="h-6 w-6 text-purple-600" />
//           </div>
//         </div>
//         <div className="mt-3 flex items-center text-green-600 text-sm">
//           <TrendingUp className="h-4 w-4 mr-1" />
//           <span>+2 this year</span>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">Faculty Members</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">342</p>
//           </div>
//           <div className="p-3 bg-green-50 rounded-lg">
//             <Users className="h-6 w-6 text-green-600" />
//           </div>
//         </div>
//         <div className="mt-3 flex items-center text-green-600 text-sm">
//           <TrendingUp className="h-4 w-4 mr-1" />
//           <span>+12% from last year</span>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">Pending Approvals</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">18</p>
//           </div>
//           <div className="p-3 bg-amber-50 rounded-lg">
//             <AlertCircle className="h-6 w-6 text-amber-600" />
//           </div>
//         </div>
//         <div className="mt-3 flex items-center text-red-600 text-sm">
//           <TrendingDown className="h-4 w-4 mr-1" />
//           <span>-3 from yesterday</span>
//         </div>
//       </div>
//     </div> */}

//     {/* Quick Actions */}
//     {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       <div className="lg:col-span-2">
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Quick Actions
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Link
//               to="/workload/my"
//               className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
//             >
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <FileText className="h-5 w-5 text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">Submit Workload</p>
//                   <p className="text-sm text-gray-500">Regular or NRP</p>
//                 </div>
//               </div>
//               <ChevronRight className="h-5 w-5 text-gray-400" />
//             </Link>

//             <Link
//               to="/reports/workload"
//               className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
//             >
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-purple-100 rounded-lg">
//                   <BarChart3 className="h-5 w-5 text-purple-600" />
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">View Reports</p>
//                   <p className="text-sm text-gray-500">Workload & Analytics</p>
//                 </div>
//               </div>
//               <ChevronRight className="h-5 w-5 text-gray-400" />
//             </Link>

//             <Link
//               to="/academic/courses"
//               className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all"
//             >
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <BookOpen className="h-5 w-5 text-green-600" />
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">Course Catalog</p>
//                   <p className="text-sm text-gray-500">Browse all courses</p>
//                 </div>
//               </div>
//               <ChevronRight className="h-5 w-5 text-gray-400" />
//             </Link>

//             <Link
//               to="/finance/payments"
//               className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all"
//             >
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-amber-100 rounded-lg">
//                   <DollarSign className="h-5 w-5 text-amber-600" />
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">Payment Status</p>
//                   <p className="text-sm text-gray-500">Check payments</p>
//                 </div>
//               </div>
//               <ChevronRight className="h-5 w-5 text-gray-400" />
//             </Link>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">
//           System Status
//         </h3>
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//               <span className="text-sm text-gray-600">API Server</span>
//             </div>
//             <span className="text-sm text-green-600 font-medium">99.9%</span>
//           </div>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//               <span className="text-sm text-gray-600">Database</span>
//             </div>
//             <span className="text-sm text-green-600 font-medium">Healthy</span>
//           </div>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
//               <span className="text-sm text-gray-600">Storage</span>
//             </div>
//             <span className="text-sm text-emerald-600 font-medium">78% Free</span>
//           </div>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//               <span className="text-sm text-gray-600">Security</span>
//             </div>
//             <span className="text-sm text-blue-600 font-medium">Protected</span>
//           </div>
//         </div>
//       </div>
//     </div> */}
//   </div>
// );

// System Status Footer Component
// const SystemStatusFooter = () => (
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
//     <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-sm font-medium text-gray-700">System Components</h3>
//         <Activity className="h-4 w-4 text-gray-400" />
//       </div>
//       <div className="grid grid-cols-2 gap-3">
//         <div className="p-3 rounded-lg bg-gray-50">
//           <div className="flex items-center space-x-2">
//             <Cpu className="h-4 w-4 text-blue-500" />
//             <span className="text-xs text-gray-600">API Server</span>
//           </div>
//           <div className="mt-2 text-sm font-medium">99.9% Uptime</div>
//         </div>
//         <div className="p-3 rounded-lg bg-gray-50">
//           <div className="flex items-center space-x-2">
//             <Database className="h-4 w-4 text-emerald-500" />
//             <span className="text-xs text-gray-600">Database</span>
//           </div>
//           <div className="mt-2 text-sm font-medium">Healthy</div>
//         </div>
//         <div className="p-3 rounded-lg bg-gray-50">
//           <div className="flex items-center space-x-2">
//             <Network className="h-4 w-4 text-blue-500" />
//             <span className="text-xs text-gray-600">Network</span>
//           </div>
//           <div className="mt-2 text-sm font-medium">45ms Latency</div>
//         </div>
//         <div className="p-3 rounded-lg bg-gray-50">
//           <div className="flex items-center space-x-2">
//             <Shield className="h-4 w-4 text-purple-500" />
//             <span className="text-xs text-gray-600">Security</span>
//           </div>
//           <div className="mt-2 text-sm font-medium">Protected</div>
//         </div>
//       </div>
//     </div>

//     <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-sm font-medium text-gray-700">Recent Activity</h3>
//         <Clock className="h-4 w-4 text-gray-400" />
//       </div>
//       <div className="space-y-3">
//         {[
//           "System backup completed",
//           "3 new course sections added",
//           "Payment batch processed",
//           "User permissions updated",
//         ].map((activity, idx) => (
//           <div key={idx} className="flex items-start space-x-3">
//             <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
//             <div className="flex-1">
//               <p className="text-sm text-gray-900">{activity}</p>
//               <p className="text-xs text-gray-500">
//                 {idx === 0 ? "2 hours ago" : `${idx + 1} hours ago`}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>

//     <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-sm font-medium text-gray-700">Performance</h3>
//         <Target className="h-4 w-4 text-gray-400" />
//       </div>
//       <div className="space-y-4">
//         <div>
//           <div className="flex items-center justify-between text-sm mb-1">
//             <span className="text-gray-600">System Load</span>
//             <span className="text-emerald-600">42%</span>
//           </div>
//           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 w-2/5"></div>
//           </div>
//         </div>
//         <div>
//           <div className="flex items-center justify-between text-sm mb-1">
//             <span className="text-gray-600">Active Users</span>
//             <span className="text-blue-600">24</span>
//           </div>
//           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 w-3/4"></div>
//           </div>
//         </div>
//         <div>
//           <div className="flex items-center justify-between text-sm mb-1">
//             <span className="text-gray-600">Response Time</span>
//             <span className="text-purple-600">89ms</span>
//           </div>
//           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 w-1/3"></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

export default Dashboard;