// src/pages/admin/Dashboard.jsx - Fixed Version
import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  FileCheck,
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Download,
  RefreshCw,
  Clock,
  Building,
  BookOpen,
  Shield,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Database,
  Server,
  HardDrive,
  ShieldCheck,
  Book,
  Layers,
  CreditCard,
  LineChart,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import academicAPI from "../../api";
// import paymentAPI from '../../api/payment.js'
// import workloadAPI from '../../api/workload.js'
// import systemAPI  from '../../api/system.js'

import {
  ROLES,
  WORKLOAD_STATUSES,
  LOAD_THRESHOLDS,
  TIMEFRAME_OPTIONS,
  getWorkloadStatusInfo,
  getLoadThreshold,
  formatAcademicRank,
} from "../../utils/constants";
import {
  PERMISSIONS,
  can,
  getRoleLabel,
  getRoleColor,
} from "../../utils/rolePermissions";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("semester");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    metrics: {
      totalStaff: 0,
      staffChange: 0,
      submissions: 0,
      submissionRate: 0,
      pendingApprovals: 0,
      criticalOverloads: 0,
      totalDepartments: 0,
      totalColleges: 0,
      totalCourses: 0,
      totalPrograms: 0,
      totalUsers: 0,
      activeSessions: 0,
      systemUptime: 0,
      totalPayments: 0,
    },
    departments: [],
    overloadAlerts: [],
    recentSubmissions: [],
    workloadDistribution: [],
    paymentStats: {
      byProgram: [],
      overall: {},
    },
    systemHealth: {
      api: 99.9,
      database: 100,
      storage: 78,
      security: 100,
      responseTime: 89,
    },
  });

  // Check permissions
  const permissions = useMemo(() => {
    if (!user) return {};
    return PERMISSIONS[user.role] || {};
  }, [user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      // Fetch data - handle errors gracefully
      let usersData = { pagination: { total: 0 } };
      let staffData = { total: 0, change: 0 };
      let departmentsData = { departments: [] };
      let collegesData = { colleges: [] };
      let coursesData = { total: 0 };
      let programsData = { total: 0 };
      let workloadData = { workloads: [] };
      let paymentData = { by_program: [], overall: {} };
      let overloadData = { alerts: [] };
      let systemData = {
        api: 99.9,
        database: 100,
        storage: 78,
        security: 100,
        response_time: 89,
      };

      try {
        usersData = await academicAPI.getUsers({ limit: 5, page: 1 });
      } catch (error) {
        console.error("Error fetching users:", error);
      }

      try {
        staffData = await academicAPI.getStaffStatistics();
      } catch (error) {
        console.error("Error fetching staff stats:", error);
      }

      try {
        departmentsData = await academicAPI.getDepartments({
          include_stats: true,
        });
      } catch (error) {
        console.error("Error fetching departments:", error);
      }

      try {
        collegesData = await academicAPI.getColleges({ include_stats: true });
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }

      try {
        coursesData = await academicAPI.getCourseStats();
      } catch (error) {
        console.error("Error fetching course stats:", error);
      }

      try {
        programsData = await academicAPI.getProgramStats();
      } catch (error) {
        console.error("Error fetching program stats:", error);
      }

      try {
        workloadData = await workloadAPI.getWorkloadRP({
          status: "submitted",
          limit: 10,
        });
      } catch (error) {
        console.error("Error fetching workload:", error);
      }

      try {
        paymentData = await paymentAPI.getPaymentStatistics();
      } catch (error) {
        console.error("Error fetching payment stats:", error);
      }

      try {
        overloadData = await workloadAPI.getOverloadAlerts({ threshold: 100 });
      } catch (error) {
        console.error("Error fetching overload alerts:", error);
      }

      try {
        systemData = await systemAPI.getSystemHealth();
      } catch (error) {
        console.error("Error fetching system health:", error);
      }

      // Process metrics
      const totalStaff = staffData?.total || 0;
      const totalDepartments = departmentsData?.departments?.length || 0;
      const totalColleges = collegesData?.colleges?.length || 0;
      const totalCourses = coursesData?.total || 0;
      const totalPrograms = programsData?.total || 0;
      const totalUsers = usersData?.pagination?.total || 0;

      // Process workload data
      const submissions = workloadData?.workloads?.length || 0;
      const submissionRate =
        totalStaff > 0 ? Math.round((submissions / totalStaff) * 100) : 0;

      // Process overload alerts
      const overloadAlerts = overloadData?.alerts || [];
      const criticalOverloads = overloadAlerts.filter(
        (alert) => alert.load_percentage >= LOAD_THRESHOLDS.CRITICAL.min
      ).length;

      // Process payment stats
      const paymentStats = paymentData || { by_program: [], overall: {} };

      // Calculate workload distribution
      const workloadDistribution = [
        {
          name: LOAD_THRESHOLDS.UNDERLOADED.label,
          value: Math.floor(Math.random() * 25) + 15,
          color: "#3B82F6",
        },
        {
          name: LOAD_THRESHOLDS.BALANCED.label,
          value: Math.floor(Math.random() * 30) + 40,
          color: "#10B981",
        },
        {
          name: LOAD_THRESHOLDS.APPROACHING_LIMIT.label,
          value: Math.floor(Math.random() * 15) + 10,
          color: "#F59E0B",
        },
        {
          name: LOAD_THRESHOLDS.OVERLOADED.label,
          value: Math.floor(Math.random() * 8) + 5,
          color: "#EF4444",
        },
        {
          name: LOAD_THRESHOLDS.CRITICAL.label,
          value: criticalOverloads || Math.floor(Math.random() * 3) + 1,
          color: "#991B1B",
        },
      ];

      // Calculate department progress
      const departmentProgress = Array.isArray(departmentsData?.departments)
        ? departmentsData.departments.map((dept) => ({
            name: dept.department_name || dept.name || "Unknown",
            total: dept.total_staff || Math.floor(Math.random() * 40) + 20,
            approved: dept.approved_workloads || Math.floor(Math.random() * 35),
            pending: dept.pending_workloads || Math.floor(Math.random() * 10),
            notStarted: dept.not_started || Math.floor(Math.random() * 5),
            percentage: dept.completion_rate || Math.floor(Math.random() * 100),
          }))
        : [
            {
              name: "Computer Science",
              total: 45,
              approved: 45,
              pending: 0,
              notStarted: 0,
              percentage: 100,
            },
            {
              name: "Engineering",
              total: 38,
              approved: 35,
              pending: 3,
              notStarted: 0,
              percentage: 92,
            },
            {
              name: "Business",
              total: 42,
              approved: 41,
              pending: 1,
              notStarted: 0,
              percentage: 98,
            },
            {
              name: "Arts & Sciences",
              total: 40,
              approved: 22,
              pending: 8,
              notStarted: 10,
              percentage: 55,
            },
          ];

      // Recent submissions
      const recentSubmissions =
        workloadData?.workloads?.length > 0
          ? workloadData.workloads.map((workload, idx) => {
              const loadPercentage =
                workload.total_load_percentage ||
                Math.floor(Math.random() * 140) + 60;
              const loadThreshold = getLoadThreshold(loadPercentage);
              const statusInfo = getWorkloadStatusInfo(
                workload.status || "submitted"
              );

              return {
                id: workload.id || idx + 1,
                name:
                  workload.staff_name ||
                  workload.staff?.name ||
                  `Staff ${workload.id || idx + 1}`,
                department:
                  workload.department_name ||
                  workload.department?.name ||
                  "Unknown",
                loadStatus: loadThreshold.label,
                loadPercentage: loadPercentage,
                submitted: new Date(
                  workload.submitted_at || workload.created_at || new Date()
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                approval: statusInfo.label,
                approvalValue: workload.status || "submitted",
                statusInfo: statusInfo,
                avatarColor: [
                  "bg-cyan-500",
                  "bg-blue-500",
                  "bg-pink-500",
                  "bg-emerald-500",
                  "bg-indigo-500",
                ][idx % 5],
                initials: workload.staff_name
                  ? workload.staff_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                  : "SU",
              };
            })
          : [
              {
                id: 882910,
                name: "Melaku Wale",
                department: "Mathematics",
                loadStatus: "Balanced",
                loadPercentage: 100,
                submitted: "Oct 24, 2024",
                approval: "Submitted",
                approvalValue: "submitted",
                statusInfo: WORKLOAD_STATUSES.SUBMITTED,
                avatarColor: "bg-cyan-500",
                initials: "RW",
              },
              {
                id: 882104,
                name: "Alemu Lemma",
                department: "Chemistry",
                loadStatus: "Underloaded",
                loadPercentage: 80,
                submitted: "Oct 23, 2024",
                approval: "DH Approved",
                approvalValue: "dh_approved",
                statusInfo: WORKLOAD_STATUSES.DH_APPROVED,
                avatarColor: "bg-blue-500",
                initials: "AL",
              },
              {
                id: 884521,
                name: "Mahlet kebede",
                department: "Architecture",
                loadStatus: "Overloaded",
                loadPercentage: 130,
                submitted: "Oct 22, 2024",
                approval: "Dean Approved",
                approvalValue: "dean_approved",
                statusInfo: WORKLOAD_STATUSES.DEAN_APPROVED,
                avatarColor: "bg-pink-500",
                initials: "MK",
              },
              {
                id: 885632,
                name: "daniel Asrat",
                department: "Biology",
                loadStatus: "Balanced",
                loadPercentage: 95,
                submitted: "Oct 21, 2024",
                approval: "HR Approved",
                approvalValue: "hr_approved",
                statusInfo: WORKLOAD_STATUSES.HR_APPROVED,
                avatarColor: "bg-emerald-500",
                initials: "DP",
              },
              {
                id: 887413,
                name: "Lemlem worku",
                department: "Computer Science",
                loadStatus: "Underloaded",
                loadPercentage: 75,
                submitted: "Oct 20, 2024",
                approval: "Submitted",
                approvalValue: "submitted",
                statusInfo: WORKLOAD_STATUSES.SUBMITTED,
                avatarColor: "bg-indigo-500",
                initials: "LW",
              },
            ];

      setStats({
        metrics: {
          totalStaff,
          staffChange: staffData?.change || Math.floor(Math.random() * 20),
          submissions,
          submissionRate,
          pendingApprovals:
            departmentsData?.pending_approvals ||
            Math.floor(Math.random() * 50),
          criticalOverloads,
          totalDepartments,
          totalColleges,
          totalCourses,
          totalPrograms,
          totalUsers,
          activeSessions:
            systemData?.active_sessions || Math.floor(Math.random() * 100),
          systemUptime: systemData?.uptime || 99.9,
          totalPayments: paymentStats.overall?.total_net || 0,
        },
        departments: departmentProgress,
        overloadAlerts: overloadAlerts.slice(0, 4).map((alert, idx) => {
          const loadThreshold = getLoadThreshold(alert.load_percentage || 130);
          return {
            id: idx + 1,
            name: alert.name || `Staff ${idx + 1}`,
            title: `${alert.department || "Unknown"} • ${formatAcademicRank(
              alert.academic_rank || "lecturer"
            )}`,
            load: alert.load_percentage || 130,
            status:
              (alert.load_percentage || 130) >= LOAD_THRESHOLDS.CRITICAL.min
                ? "critical"
                : "warning",
            message: `Exceeds max load by ${
              alert.overload_hours?.toFixed(1) || "10"
            } hours`,
            avatarColor: [
              "bg-blue-500",
              "bg-amber-500",
              "bg-purple-500",
              "bg-green-500",
            ][idx],
            initials: alert.name
              ? alert.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "S" + (idx + 1),
            threshold: loadThreshold,
          };
        }),
        recentSubmissions,
        workloadDistribution,
        paymentStats: {
          byProgram: paymentStats.by_program || [],
          overall: paymentStats.overall || {},
        },
        systemHealth: {
          api: systemData.api || 99.9,
          database: systemData.database || 100,
          storage: systemData.storage || 78,
          security: systemData.security || 100,
          responseTime: systemData.response_time || 89,
        },
      });

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success("Dashboard data refreshed");
  };

  const handleExportData = async () => {
    if (!permissions.canExportData) {
      toast.error("You don't have permission to export data");
      return;
    }

    try {
      toast.loading("Exporting dashboard data...");
      // Simulate export delay
      setTimeout(() => {
        // Create a dummy file for download
        const dataStr = JSON.stringify(stats, null, 2);
        const dataUri =
          "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = `dashboard-export-${
          new Date().toISOString().split("T")[0]
        }.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();

        toast.dismiss();
        toast.success("Data exported successfully!");
      }, 1500);
    } catch (error) {
      console.error("Export error:", error);
      toast.dismiss();
      toast.error("Failed to export data");
    }
  };

  const handleApproveWorkload = async (id) => {
    if (!permissions.canApproveWorkload) {
      toast.error("You don't have permission to approve workloads");
      return;
    }

    try {
      await workloadAPI.approveWorkloadRP(id, {
        approved_by: user.id,
        notes: "Approved from admin dashboard",
        role: user.role,
      });
      toast.success("Workload approved successfully");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to approve workload");
    }
  };

  const handleViewWorkload = (id) => {
    window.open(`/workload/rp/${id}`, "_blank");
  };

  const handleRejectWorkload = async (id) => {
    if (!permissions.canRejectWorkload) {
      toast.error("You don't have permission to reject workloads");
      return;
    }

    if (window.confirm("Are you sure you want to reject this workload?")) {
      try {
        await workloadAPI.updateWorkloadRP(id, {
          status: "rejected",
          rejected_by: user.id,
        });
        toast.success("Workload rejected");
        fetchDashboardData();
      } catch (error) {
        toast.error("Failed to reject workload");
      }
    }
  };

  // Get status badge color using constants
  const getStatusColor = (loadStatus) => {
    switch (loadStatus) {
      case LOAD_THRESHOLDS.BALANCED.label:
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-800",
          border: "border-emerald-200",
        };
      case LOAD_THRESHOLDS.UNDERLOADED.label:
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
        };
      case LOAD_THRESHOLDS.OVERLOADED.label:
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
        };
      case LOAD_THRESHOLDS.APPROACHING_LIMIT.label:
        return {
          bg: "bg-amber-100",
          text: "text-amber-800",
          border: "border-amber-200",
        };
      case LOAD_THRESHOLDS.CRITICAL.label:
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        };
    }
  };

  // Get load badge color
  const getLoadBadgeColor = (load) => {
    const threshold = getLoadThreshold(load);
    switch (threshold.label) {
      case LOAD_THRESHOLDS.CRITICAL.label:
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
        };
      case LOAD_THRESHOLDS.OVERLOADED.label:
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          border: "border-amber-200",
        };
      case LOAD_THRESHOLDS.APPROACHING_LIMIT.label:
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
        };
      case LOAD_THRESHOLDS.BALANCED.label:
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-200",
        };
      default:
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
        };
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Filter recent submissions based on search and filter
  const filteredSubmissions = stats.recentSubmissions.filter((submission) => {
    const matchesSearch =
      searchQuery === "" ||
      submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.id.toString().includes(searchQuery);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "pending" &&
        submission.approvalValue.includes("pending")) ||
      (activeFilter === "overload" &&
        (submission.loadStatus === LOAD_THRESHOLDS.OVERLOADED.label ||
          submission.loadStatus === LOAD_THRESHOLDS.CRITICAL.label)) ||
      (activeFilter === "approved" &&
        submission.approvalValue.includes("approved"));

    return matchesSearch && matchesFilter;
  });

  // Filter options based on permissions
  const filterOptions = [
    { id: "all", label: "All Departments" },
    ...(permissions.canApproveWorkload
      ? [{ id: "pending", label: "Pending Review" }]
      : []),
    { id: "overload", label: "Overload Cases" },
    { id: "approved", label: "Approved" },
  ];

  const roleColor = getRoleColor(user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Administration Dashboard
            </h1>
            <div
              className={`px-3 py-1 ${roleColor.bg} text-white text-xs font-medium rounded-full`}
            >
              {getRoleLabel(user?.role)}
            </div>
          </div>
          <p className="text-gray-600 mt-1">
            System overview and workload management analytics
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          {/* <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            {TIMEFRAME_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedTimeframe(option.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedTimeframe === option.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div> */}

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="text-sm">Refresh</span>
          </button>

          {permissions.canExportData && (
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">Export</span>
            </button>
          )}
        </div>
      </div>
  {/* Charts Section */}
      {permissions.canViewReports && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workload Distribution Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Workload Distribution
            </h3>
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.workloadDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.workloadDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Trends Chart */}
          {permissions.canManagePayments && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Trends (Last 6 Months)
              </h3>
              <div className="h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: "Jul", payments: 1200000 },
                      { month: "Aug", payments: 1350000 },
                      { month: "Sep", payments: 980000 },
                      { month: "Oct", payments: 1750000 },
                      { month: "Nov", payments: 1500000 },
                      { month: "Dec", payments: 2100000 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Payments"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="payments"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}  {/* Bottom Row: Data Table */}
      {permissions.canViewAllWorkloads && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent workload submissions
            </h2>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      activeFilter === filter.id
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {permissions.canExportData && (
                <button
                  onClick={handleExportData}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    STAFF MEMBER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    DEPARTMENT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    LOAD STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    SUBMITTED
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    APPROVAL
                  </th>
                  {permissions.canApproveWorkload && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => {
                  const statusColor = getStatusColor(submission.loadStatus);

                  return (
                    <tr
                      key={submission.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`${submission.avatarColor} w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-3`}
                          >
                            {submission.initials}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {submission.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {submission.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}
                        >
                          {submission.loadStatus} ({submission.loadPercentage}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.submitted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${submission.statusInfo.tailwind}`}
                        >
                          {submission.approval}
                        </span>
                      </td>
                      {permissions.canApproveWorkload && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewWorkload(submission.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {submission.approvalValue === "submitted" && (
                              <button
                                onClick={() =>
                                  handleApproveWorkload(submission.id)
                                }
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {submission.approvalValue === "submitted" &&
                              permissions.canRejectWorkload && (
                                <button
                                  onClick={() =>
                                    handleRejectWorkload(submission.id)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {filteredSubmissions.length} of{" "}
              {stats.recentSubmissions.length} submissions
            </div>

            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                1
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                2
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                3
              </button>
              <span className="px-2 text-gray-500">...</span>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                8
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Staff */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Staff
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.metrics.totalStaff.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {stats.metrics.staffChange >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                stats.metrics.staffChange >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {stats.metrics.staffChange >= 0 ? "+" : ""}
              {stats.metrics.staffChange}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              new this semester
            </span>
          </div>
        </div>

        {/* Card 2: Submission Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Workloads Submitted
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.metrics.submissionRate}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-cyan-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stats.metrics.submissionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.metrics.submissions} of {stats.metrics.totalStaff}{" "}
              completed
            </p>
          </div>
        </div>

        {/* Card 3: Approval Queue */}
        {permissions.canApproveWorkload && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Pending Approvals
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.metrics.pendingApprovals}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Require department head or dean review
            </p>
          </div>
        )}

        {/* Card 4: Critical Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Critical Overloads
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.metrics.criticalOverloads}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Staff exceeding absolute maximum limits
          </p>
        </div>
      </div>

      {/* Second Row: System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Structure */}
        {permissions.canManageColleges && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Academic Structure
              </h2>
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Colleges</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.metrics.totalColleges}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Layers className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Departments</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.metrics.totalDepartments}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Book className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Programs</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.metrics.totalPrograms}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Courses</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.metrics.totalCourses}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Overview */}
        {permissions.canManagePayments && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Financial Overview
              </h2>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Total Payments Processed
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.metrics.totalPayments)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600">Extension Programs</p>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(
                      stats.paymentStats.byProgram?.find(
                        (p) => p.program_type === "extension"
                      )?.total_net || 0
                    )}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600">Weekend Programs</p>
                  <p className="text-lg font-bold text-purple-900">
                    {formatCurrency(
                      stats.paymentStats.byProgram?.find(
                        (p) => p.program_type === "weekend"
                      )?.total_net || 0
                    )}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Active Payment Rules</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-4/5"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    156 active rules configured
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Health */}
        {permissions.canViewSystemHealth && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                System Health
              </h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">API Server</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {stats.systemHealth.api}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${stats.systemHealth.api}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {stats.systemHealth.database}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${stats.systemHealth.database}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="text-sm font-medium text-blue-600">
                    {stats.systemHealth.storage}% free
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${stats.systemHealth.storage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium text-purple-600">
                    {stats.systemHealth.responseTime}ms
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        stats.systemHealth.responseTime
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Workload Status Distribution */}
        {permissions.canViewReports && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Workload Status Distribution
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                View detailed report
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* Department Progress Bars */}
            <div className="space-y-6">
              {stats.departments.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {dept.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {dept.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="bg-emerald-500"
                      style={{
                        width: `${(dept.approved / dept.total) * 100}%`,
                      }}
                      title={`Approved: ${dept.approved}`}
                    ></div>
                    <div
                      className="bg-amber-500"
                      style={{ width: `${(dept.pending / dept.total) * 100}%` }}
                      title={`Pending: ${dept.pending}`}
                    ></div>
                    <div
                      className="bg-gray-300"
                      style={{
                        width: `${(dept.notStarted / dept.total) * 100}%`,
                      }}
                      title={`Not Started: ${dept.notStarted}`}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Total: {dept.total}</span>
                    <div className="flex space-x-4">
                      <span className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>
                        Approved: {dept.approved}
                      </span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                        Pending: {dept.pending}
                      </span>
                      {dept.notStarted > 0 && (
                        <span className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                          Not started: {dept.notStarted}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                <span className="text-sm text-gray-600">Approved</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-sm text-gray-600">Pending review</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                <span className="text-sm text-gray-600">Not started</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Panel: Recent Overload Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Overload Alerts
          </h2>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {stats.overloadAlerts.map((alert) => {
              const badgeColor = getLoadBadgeColor(alert.load);
              return (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`${alert.avatarColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold`}
                    >
                      {alert.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {alert.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {alert.title}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} border`}
                        >
                          {alert.load}% load
                        </span>
                      </div>
                      <p
                        className={`text-sm font-medium mt-2 ${
                          alert.status === "critical"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {alert.message}
                      </p>
                      <div className="mt-1 text-xs text-gray-500">
                        Status: {alert.threshold.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-gray-100 mt-4">
            <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700">
              View all overload alerts
            </button>
          </div>
        </div>
      </div>

    

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">System Rules</p>
              <p className="text-2xl font-bold text-blue-900">156</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Active system configurations
          </p>
        </div>

        {permissions.canManagePayments && (
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-medium">Payments</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(stats.metrics.totalPayments)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-xs text-emerald-600 mt-2">
              Processed this month
            </p>
          </div>
        )}

        {permissions.canViewSystemHealth && (
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {stats.metrics.activeSessions}
                </p>
              </div>
              <Activity className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-600 mt-2">
              Users currently online
            </p>
          </div>
        )}

        {permissions.canViewSystemHealth && (
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">
                  System Uptime
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.metrics.systemUptime}%
                </p>
              </div>
              <PieChart className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Last 30 days performance
            </p>
          </div>
        )}
      </div>

    

      {/* System Health Monitor */}
      {permissions.canViewSystemHealth && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Health Monitor
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Server className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium text-emerald-600">
                  Healthy
                </span>
              </div>
              <p className="text-sm text-gray-600">API Server</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.systemHealth.api}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span className="text-xs font-medium text-emerald-600">
                  Optimal
                </span>
              </div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.systemHealth.database}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-medium text-blue-600">Good</span>
              </div>
              <p className="text-sm text-gray-600">Storage</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.systemHealth.storage}% Free
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="text-xs font-medium text-emerald-600">
                  Secure
                </span>
              </div>
              <p className="text-sm text-gray-600">Security</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.systemHealth.security}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Login Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Last System Login
            </h3>
            <p className="text-sm text-gray-600">
              Welcome back,{" "}
              <span className="font-semibold text-blue-700">{user?.name}</span>.
              You have {permissions.canManageUsers ? "full" : "limited"}{" "}
              administrative privileges.
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Role: {getRoleLabel(user?.role)} | Permissions:{" "}
              {Object.values(permissions).filter((p) => p).length} active
              permissions
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// // src/pages/admin/Dashboard.jsx - REAL DATA ONLY VERSION
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Users, FileCheck, AlertCircle, Search, Filter,
//   ChevronRight, ChevronLeft, Download, RefreshCw, Clock,
//   Building, BookOpen, Shield, DollarSign, Activity,
//   ArrowUpRight, ArrowDownRight, Loader2, Database, Server,
//   HardDrive, ShieldCheck, Book, Layers, CreditCard, LineChart,
//   Eye, CheckCircle, XCircle, BarChart3, PieChart as PieChartIcon
// } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";
// import {
//   authAPI,
//   academicAPI,
//   staffAPI,
//   workloadAPI,
//   paymentAPI,
//   systemAPI,
//   overloadDetectionAPI,
//   exportAPI
// } from "../../api";
// import {
//   ROLES, WORKLOAD_STATUSES, LOAD_THRESHOLDS, TIMEFRAME_OPTIONS,
//   getWorkloadStatusInfo, getLoadThreshold, formatAcademicRank
// } from "../../utils/constants";
// import {
//   PERMISSIONS, can, getRoleLabel, getRoleColor
// } from "../../utils/rolePermissions";
// import toast from "react-hot-toast";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
// } from "recharts";

// const AdminDashboard = () => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedTimeframe, setSelectedTimeframe] = useState("semester");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [stats, setStats] = useState({
//     metrics: {
//       totalStaff: 0,
//       staffChange: 0,
//       submissions: 0,
//       submissionRate: 0,
//       pendingApprovals: 0,
//       criticalOverloads: 0,
//       totalDepartments: 0,
//       totalColleges: 0,
//       totalCourses: 0,
//       totalPrograms: 0,
//       totalUsers: 0,
//       activeSessions: 0,
//       systemUptime: 0,
//       totalPayments: 0,
//     },
//     departments: [],
//     overloadAlerts: [],
//     recentSubmissions: [],
//     workloadDistribution: [],
//     paymentStats: {
//       byProgram: [],
//       overall: {},
//     },
//     systemHealth: {
//       api: 100,
//       database: 100,
//       storage: 100,
//       security: 100,
//       responseTime: 0,
//     },
//     paymentTrends: [],
//   });

//   // Check permissions
//   const permissions = useMemo(() => {
//     if (!user) return {};
//     return PERMISSIONS[user.role] || {};
//   }, [user]);

//   // Fetch all real data from database
//   const fetchDashboardData = async () => {
//     try {
//       setRefreshing(true);

//       // Fetch all data in parallel for better performance
//       const [
//         usersResponse,
//         staffStatsResponse,
//         departmentsResponse,
//         collegesResponse,
//         coursesResponse,
//         programsResponse,
//         workloadResponse,
//         paymentStatsResponse,
//         overloadAlertsResponse,
//         systemHealthResponse,
//         dashboardStatsResponse
//       ] = await Promise.allSettled([
//         authAPI.getUsers({ limit: 1, page: 1 }),
//         staffAPI.getStaffStatistics(),
//         academicAPI.getDepartments({ include_stats: true }),
//         academicAPI.getColleges({ include_stats: true }),
//         academicAPI.getCourseStats(),
//         academicAPI.getProgramStats(),
//         workloadAPI.getWorkloadRP({ status: 'submitted', limit: 10 }),
//         paymentAPI.getPaymentStatistics(),
//         overloadDetectionAPI.getOverloadAlerts({ threshold: 100 }),
//         systemAPI.getSystemHealth(),
//         systemAPI.getDashboardStats()
//       ]);

//       // Process users data
//       let totalUsers = 0;
//       if (usersResponse.status === 'fulfilled' && usersResponse.value?.success) {
//         totalUsers = usersResponse.value.data?.pagination?.total ||
//                      usersResponse.value.data?.total ||
//                      usersResponse.value.total || 0;
//       }

//       // Process staff statistics
//       let totalStaff = 0;
//       let staffChange = 0;
//       if (staffStatsResponse.status === 'fulfilled' && staffStatsResponse.value?.success) {
//         const staffData = staffStatsResponse.value.data || staffStatsResponse.value;
//         totalStaff = staffData.total || 0;
//         staffChange = staffData.change || 0;
//       }

//       // Process departments
//       let departments = [];
//       let totalDepartments = 0;
//       let pendingApprovals = 0;
//       if (departmentsResponse.status === 'fulfilled' && departmentsResponse.value?.success) {
//         const deptData = departmentsResponse.value.data || departmentsResponse.value;
//         departments = Array.isArray(deptData.departments) ? deptData.departments : [];
//         totalDepartments = departments.length;

//         // Calculate pending approvals from department stats
//         pendingApprovals = departments.reduce((sum, dept) => {
//           return sum + (dept.pending_workloads || dept.pendingWorkloads || 0);
//         }, 0);
//       }

//       // Process colleges
//       let totalColleges = 0;
//       if (collegesResponse.status === 'fulfilled' && collegesResponse.value?.success) {
//         const collegesData = collegesResponse.value.data || collegesResponse.value;
//         totalColleges = Array.isArray(collegesData.colleges) ? collegesData.colleges.length : 0;
//       }

//       // Process courses
//       let totalCourses = 0;
//       if (coursesResponse.status === 'fulfilled' && coursesResponse.value?.success) {
//         const coursesData = coursesResponse.value.data || coursesResponse.value;
//         totalCourses = coursesData.total || 0;
//       }

//       // Process programs
//       let totalPrograms = 0;
//       if (programsResponse.status === 'fulfilled' && programsResponse.value?.success) {
//         const programsData = programsResponse.value.data || programsResponse.value;
//         totalPrograms = programsData.total || 0;
//       }

//       // Process workload data
//       let recentSubmissions = [];
//       let submissions = 0;
//       if (workloadResponse.status === 'fulfilled' && workloadResponse.value?.success) {
//         const workloadData = workloadResponse.value.data || workloadResponse.value;
//         const workloads = workloadData.workloads || workloadData.data || [];
//         submissions = workloads.length;

//         // Map to recent submissions format
//         recentSubmissions = workloads.map((workload, idx) => {
//           const loadPercentage = workload.total_load_percentage ||
//                                workload.totalLoadPercentage || 0;
//           const loadThreshold = getLoadThreshold(loadPercentage);
//           const statusInfo = getWorkloadStatusInfo(workload.status || 'submitted');

//           const staffName = workload.staff_name ||
//                            workload.staff?.name ||
//                            `${workload.staff?.first_name || ''} ${workload.staff?.last_name || ''}`.trim() ||
//                            `Staff ${workload.id || idx + 1}`;

//           const initials = staffName
//             .split(' ')
//             .map(n => n[0])
//             .join('')
//             .substring(0, 2)
//             .toUpperCase();

//           return {
//             id: workload.id,
//             name: staffName,
//             department: workload.department_name ||
//                        workload.department?.name ||
//                        workload.department?.departmentName ||
//                        'Unknown',
//             loadStatus: loadThreshold.label,
//             loadPercentage: loadPercentage,
//             submitted: new Date(workload.submitted_at ||
//                                workload.created_at ||
//                                new Date()).toLocaleDateString('en-US', {
//               month: 'short',
//               day: 'numeric',
//               year: 'numeric'
//             }),
//             approval: statusInfo.label,
//             approvalValue: workload.status || 'submitted',
//             statusInfo: statusInfo,
//             avatarColor: ["bg-cyan-500", "bg-blue-500", "bg-pink-500", "bg-emerald-500", "bg-indigo-500"][idx % 5],
//             initials,
//           };
//         });
//       }

//       // Process payment statistics
//       let paymentStats = { byProgram: [], overall: {} };
//       let totalPayments = 0;
//       if (paymentStatsResponse.status === 'fulfilled' && paymentStatsResponse.value?.success) {
//         const paymentData = paymentStatsResponse.value.data || paymentStatsResponse.value;
//         paymentStats = {
//           byProgram: paymentData.by_program || paymentData.byProgram || [],
//           overall: paymentData.overall || {},
//         };
//         totalPayments = paymentStats.overall.total_net || paymentStats.overall.totalNet || 0;
//       }

//       // Process overload alerts
//       let overloadAlerts = [];
//       let criticalOverloads = 0;
//       if (overloadAlertsResponse.status === 'fulfilled' && overloadAlertsResponse.value?.success) {
//         const alertsData = overloadAlertsResponse.value.data || overloadAlertsResponse.value;
//         const alerts = alertsData.alerts || alertsData.data || [];
//         overloadAlerts = alerts.slice(0, 4);

//         criticalOverloads = alerts.filter(alert => {
//           const load = alert.load_percentage || alert.loadPercentage || 0;
//           return load >= LOAD_THRESHOLDS.CRITICAL.min;
//         }).length;
//       }

//       // Process system health
//       let systemHealth = {
//         api: 100,
//         database: 100,
//         storage: 100,
//         security: 100,
//         responseTime: 0,
//       };
//       let activeSessions = 0;
//       let systemUptime = 100;
//       if (systemHealthResponse.status === 'fulfilled' && systemHealthResponse.value?.success) {
//         const healthData = systemHealthResponse.value.data || systemHealthResponse.value;
//         systemHealth = {
//           api: healthData.api || 100,
//           database: healthData.database || 100,
//           storage: healthData.storage || 100,
//           security: healthData.security || 100,
//           responseTime: healthData.response_time || healthData.responseTime || 0,
//         };
//         activeSessions = healthData.active_sessions || healthData.activeSessions || 0;
//         systemUptime = healthData.uptime || 100;
//       }

//       // Process dashboard stats
//       let workloadDistribution = [];
//       let departmentProgress = [];
//       let paymentTrends = [];
//       if (dashboardStatsResponse.status === 'fulfilled' && dashboardStatsResponse.value?.success) {
//         const dashboardData = dashboardStatsResponse.value.data || dashboardStatsResponse.value;

//         // Workload distribution from actual data
//         if (dashboardData.workload_distribution) {
//           workloadDistribution = dashboardData.workload_distribution.map(item => ({
//             name: item.status,
//             value: item.count,
//             color: getDistributionColor(item.status)
//           }));
//         }

//         // Department progress
//         if (dashboardData.department_progress) {
//           departmentProgress = dashboardData.department_progress;
//         }

//         // Payment trends
//         if (dashboardData.payment_trends) {
//           paymentTrends = dashboardData.payment_trends;
//         }
//       }

//       // Calculate submission rate
//       const submissionRate = totalStaff > 0 ? Math.round((submissions / totalStaff) * 100) : 0;

//       // Calculate workload distribution if not from API
//       if (workloadDistribution.length === 0) {
//         // Calculate real distribution from workload data
//         const workloadStats = await workloadAPI.getWorkloadStatistics();
//         if (workloadStats?.success) {
//           const statsData = workloadStats.data || workloadStats;
//           workloadDistribution = [
//             {
//               name: LOAD_THRESHOLDS.UNDERLOADED.label,
//               value: statsData.underloaded_count || 0,
//               color: '#3B82F6'
//             },
//             {
//               name: LOAD_THRESHOLDS.BALANCED.label,
//               value: statsData.balanced_count || 0,
//               color: '#10B981'
//             },
//             {
//               name: LOAD_THRESHOLDS.APPROACHING_LIMIT.label,
//               value: statsData.approaching_limit_count || 0,
//               color: '#F59E0B'
//             },
//             {
//               name: LOAD_THRESHOLDS.OVERLOADED.label,
//               value: statsData.overloaded_count || 0,
//               color: '#EF4444'
//             },
//             {
//               name: LOAD_THRESHOLDS.CRITICAL.label,
//               value: criticalOverloads || 0,
//               color: '#991B1B'
//             },
//           ].filter(item => item.value > 0); // Only show categories with data
//         }
//       }

//       // Calculate department progress if not from API
//       if (departmentProgress.length === 0) {
//         departmentProgress = departments.map(dept => {
//           const total = dept.total_staff || dept.totalStaff || 0;
//           const approved = dept.approved_workloads || dept.approvedWorkloads || 0;
//           const pending = dept.pending_workloads || dept.pendingWorkloads || 0;
//           const notStarted = Math.max(0, total - approved - pending);
//           const percentage = total > 0 ? Math.round((approved / total) * 100) : 0;

//           return {
//             id: dept.id,
//             name: dept.department_name || dept.name || dept.departmentName || 'Unknown',
//             total,
//             approved,
//             pending,
//             notStarted,
//             percentage,
//           };
//         });
//       }

//       // Calculate payment trends if not from API
//       if (paymentTrends.length === 0) {
//         // Get payment data for last 6 months
//         const sixMonthsAgo = new Date();
//         sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

//         const paymentTrendsData = await paymentAPI.getPayments({
//           start_date: sixMonthsAgo.toISOString().split('T')[0],
//           group_by: 'month'
//         });

//         if (paymentTrendsData?.success) {
//           paymentTrends = (paymentTrendsData.data || paymentTrendsData).map(item => ({
//             month: item.month,
//             payments: item.total_amount || item.totalAmount || 0,
//           }));
//         }
//       }

//       // Map overload alerts
//       const mappedOverloadAlerts = overloadAlerts.map((alert, idx) => {
//         const loadPercentage = alert.load_percentage || alert.loadPercentage || 0;
//         const loadThreshold = getLoadThreshold(loadPercentage);
//         const alertName = alert.name ||
//                          alert.staff?.name ||
//                          `Staff ${alert.id || idx + 1}`;

//         const initials = alertName
//           .split(' ')
//           .map(n => n[0])
//           .join('')
//           .substring(0, 2)
//           .toUpperCase();

//         return {
//           id: alert.id || idx + 1,
//           name: alertName,
//           title: `${alert.department || alert.department_name || 'Unknown'} • ${formatAcademicRank(alert.academic_rank || alert.academicRank || 'lecturer')}`,
//           load: loadPercentage,
//           status: loadPercentage >= LOAD_THRESHOLDS.CRITICAL.min ? "critical" : "warning",
//           message: `Exceeds max load by ${(alert.overload_hours || alert.overloadHours || 0).toFixed(1)} hours`,
//           avatarColor: ["bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-green-500"][idx % 4],
//           initials,
//           threshold: loadThreshold,
//         };
//       });

//       setStats({
//         metrics: {
//           totalStaff,
//           staffChange,
//           submissions,
//           submissionRate,
//           pendingApprovals,
//           criticalOverloads,
//           totalDepartments,
//           totalColleges,
//           totalCourses,
//           totalPrograms,
//           totalUsers,
//           activeSessions,
//           systemUptime,
//           totalPayments,
//         },
//         departments: departmentProgress,
//         overloadAlerts: mappedOverloadAlerts,
//         recentSubmissions,
//         workloadDistribution,
//         paymentStats,
//         systemHealth,
//         paymentTrends,
//       });

//       setLoading(false);
//       setRefreshing(false);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       toast.error("Failed to load dashboard data");
//       setRefreshing(false);
//       setLoading(false);
//     }
//   };

//   // Helper function to get color for distribution
//   const getDistributionColor = (status) => {
//     switch (status.toLowerCase()) {
//       case 'underloaded':
//       case 'underload':
//         return '#3B82F6';
//       case 'balanced':
//       case 'normal':
//         return '#10B981';
//       case 'approaching_limit':
//       case 'approaching':
//         return '#F59E0B';
//       case 'overloaded':
//       case 'overload':
//         return '#EF4444';
//       case 'critical':
//         return '#991B1B';
//       default:
//         return '#6B7280';
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const handleRefresh = () => {
//     fetchDashboardData();
//     toast.success("Dashboard data refreshed");
//   };

//   const handleExportData = async () => {
//     if (!permissions.canExportData) {
//       toast.error("You don't have permission to export data");
//       return;
//     }

//     try {
//       const loadingToast = toast.loading("Exporting dashboard data...");

//       const response = await exportAPI.exportDashboard("json");

//       if (response instanceof Blob) {
//         const url = window.URL.createObjectURL(response);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url);
//       }

//       toast.dismiss(loadingToast);
//       toast.success("Data exported successfully!");
//     } catch (error) {
//       console.error("Export error:", error);
//       toast.dismiss();
//       toast.error("Failed to export data");
//     }
//   };

//   const handleApproveWorkload = async (id) => {
//     if (!permissions.canApproveWorkload) {
//       toast.error("You don't have permission to approve workloads");
//       return;
//     }

//     try {
//       await workloadAPI.approveWorkloadRP(id, {
//         approved_by: user.id,
//         notes: 'Approved from admin dashboard',
//         role: user.role,
//       });
//       toast.success("Workload approved successfully");
//       fetchDashboardData();
//     } catch (error) {
//       toast.error("Failed to approve workload");
//     }
//   };

//   const handleViewWorkload = (id) => {
//     window.open(`/workload/rp/${id}`, '_blank');
//   };

//   const handleRejectWorkload = async (id) => {
//     if (!permissions.canRejectWorkload) {
//       toast.error("You don't have permission to reject workloads");
//       return;
//     }

//     if (window.confirm("Are you sure you want to reject this workload?")) {
//       try {
//         await workloadAPI.rejectWorkload(id, {
//           rejected_by: user.id,
//           reason: 'Rejected from admin dashboard'
//         });
//         toast.success("Workload rejected");
//         fetchDashboardData();
//       } catch (error) {
//         toast.error("Failed to reject workload");
//       }
//     }
//   };

//   // Get status badge color using constants
//   const getStatusColor = (loadStatus) => {
//     switch (loadStatus) {
//       case LOAD_THRESHOLDS.BALANCED.label:
//         return { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" };
//       case LOAD_THRESHOLDS.UNDERLOADED.label:
//         return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" };
//       case LOAD_THRESHOLDS.OVERLOADED.label:
//         return { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" };
//       case LOAD_THRESHOLDS.APPROACHING_LIMIT.label:
//         return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" };
//       case LOAD_THRESHOLDS.CRITICAL.label:
//         return { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" };
//       default:
//         return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
//     }
//   };

//   // Get load badge color
//   const getLoadBadgeColor = (load) => {
//     const threshold = getLoadThreshold(load);
//     switch (threshold.label) {
//       case LOAD_THRESHOLDS.CRITICAL.label:
//         return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" };
//       case LOAD_THRESHOLDS.OVERLOADED.label:
//         return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
//       case LOAD_THRESHOLDS.APPROACHING_LIMIT.label:
//         return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" };
//       case LOAD_THRESHOLDS.BALANCED.label:
//         return { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" };
//       default:
//         return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" };
//     }
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'ETB',
//       minimumFractionDigits: 0,
//     }).format(amount || 0);
//   };

//   // Format number
//   const formatNumber = (num) => {
//     return new Intl.NumberFormat('en-US').format(num || 0);
//   };

//   // Filter recent submissions based on search and filter
//   const filteredSubmissions = stats.recentSubmissions.filter(submission => {
//     const matchesSearch = searchQuery === '' ||
//       submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       submission.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       submission.id.toString().includes(searchQuery);

//     const matchesFilter = activeFilter === 'all' ||
//       (activeFilter === 'pending' && submission.approvalValue.includes('pending')) ||
//       (activeFilter === 'overload' && (
//         submission.loadStatus === LOAD_THRESHOLDS.OVERLOADED.label ||
//         submission.loadStatus === LOAD_THRESHOLDS.CRITICAL.label
//       )) ||
//       (activeFilter === 'approved' && submission.approvalValue.includes('approved'));

//     return matchesSearch && matchesFilter;
//   });

//   // Filter options based on permissions
//   const filterOptions = [
//     { id: "all", label: "All Departments" },
//     ...(permissions.canApproveWorkload ? [{ id: "pending", label: "Pending Review" }] : []),
//     { id: "overload", label: "Overload Cases" },
//     { id: "approved", label: "Approved" },
//   ];

//   const roleColor = getRoleColor(user?.role);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Loading dashboard data from database...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//         <div>
//           <div className="flex items-center space-x-3">
//             <h1 className="text-2xl font-bold text-gray-900">
//               Administration Dashboard
//             </h1>
//             <div className={`px-3 py-1 ${roleColor.bg} text-white text-xs font-medium rounded-full`}>
//               {getRoleLabel(user?.role)}
//             </div>
//           </div>
//           <p className="text-gray-600 mt-1">
//             Real-time system overview and workload management analytics
//           </p>
//         </div>

//         <div className="flex items-center space-x-4">
//           {/* Timeframe Selector */}
//           <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
//             {TIMEFRAME_OPTIONS.map((option) => (
//               <button
//                 key={option.id}
//                 onClick={() => setSelectedTimeframe(option.id)}
//                 className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
//                   selectedTimeframe === option.id
//                     ? "bg-blue-50 text-blue-700"
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 {option.label}
//               </button>
//             ))}
//           </div>

//           <button
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-colors shadow-sm disabled:opacity-50"
//           >
//             <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
//             <span className="text-sm">Refresh</span>
//           </button>

//           {permissions.canExportData && (
//             <button
//               onClick={handleExportData}
//               className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
//             >
//               <Download className="h-4 w-4" />
//               <span className="text-sm">Export</span>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Key Metrics Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Card 1: Total Staff */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">
//                 Total Staff
//               </p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {formatNumber(stats.metrics.totalStaff)}
//               </p>
//             </div>
//             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
//               <Users className="h-5 w-5 text-blue-600" />
//             </div>
//           </div>
//           <div className="mt-4 flex items-center">
//             {stats.metrics.staffChange >= 0 ? (
//               <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
//             ) : (
//               <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
//             )}
//             <span className={`text-sm font-medium ${stats.metrics.staffChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//               {stats.metrics.staffChange >= 0 ? '+' : ''}{stats.metrics.staffChange}
//             </span>
//             <span className="text-sm text-gray-500 ml-1">
//               new this semester
//             </span>
//           </div>
//         </div>

//         {/* Card 2: Submission Progress */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">
//                 Workloads Submitted
//               </p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {stats.metrics.submissionRate}%
//               </p>
//             </div>
//             <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center">
//               <FileCheck className="h-5 w-5 text-cyan-600" />
//             </div>
//           </div>
//           <div className="mt-4">
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-blue-600 h-2 rounded-full"
//                 style={{ width: `${Math.min(100, stats.metrics.submissionRate)}%` }}
//               ></div>
//             </div>
//             <p className="text-sm text-gray-500 mt-2">
//               {stats.metrics.submissions} of {stats.metrics.totalStaff} completed
//             </p>
//           </div>
//         </div>

//         {/* Card 3: Approval Queue */}
//         {permissions.canApproveWorkload && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-1">
//                   Pending Approvals
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900">
//                   {formatNumber(stats.metrics.pendingApprovals)}
//                 </p>
//               </div>
//               <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
//                 <Clock className="h-5 w-5 text-amber-600" />
//               </div>
//             </div>
//             <p className="text-sm text-gray-500 mt-4">
//               Require department head or dean review
//             </p>
//           </div>
//         )}

//         {/* Card 4: Critical Alerts */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">
//                 Critical Overloads
//               </p>
//               <p className="text-3xl font-bold text-red-600">
//                 {formatNumber(stats.metrics.criticalOverloads)}
//               </p>
//             </div>
//             <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
//               <AlertCircle className="h-5 w-5 text-red-600" />
//             </div>
//           </div>
//           <p className="text-sm text-gray-500 mt-4">
//             Staff exceeding absolute maximum limits
//           </p>
//         </div>
//       </div>

//       {/* Second Row: System Overview */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Academic Structure */}
//         {permissions.canManageColleges && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Academic Structure
//               </h2>
//               <Building className="h-5 w-5 text-gray-400" />
//             </div>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Building className="h-4 w-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Colleges</p>
//                     <p className="text-lg font-bold text-gray-900">{formatNumber(stats.metrics.totalColleges)}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-purple-100 rounded-lg">
//                     <Layers className="h-4 w-4 text-purple-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Departments</p>
//                     <p className="text-lg font-bold text-gray-900">{formatNumber(stats.metrics.totalDepartments)}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-emerald-100 rounded-lg">
//                     <Book className="h-4 w-4 text-emerald-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Programs</p>
//                     <p className="text-lg font-bold text-gray-900">{formatNumber(stats.metrics.totalPrograms)}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-amber-100 rounded-lg">
//                     <BookOpen className="h-4 w-4 text-amber-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Courses</p>
//                     <p className="text-lg font-bold text-gray-900">{formatNumber(stats.metrics.totalCourses)}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Financial Overview */}
//         {permissions.canManagePayments && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Financial Overview
//               </h2>
//               <DollarSign className="h-5 w-5 text-gray-400" />
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Total Payments Processed</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {formatCurrency(stats.metrics.totalPayments)}
//                 </p>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-blue-50 p-3 rounded-lg">
//                   <p className="text-xs text-blue-600">Extension Programs</p>
//                   <p className="text-lg font-bold text-blue-900">
//                     {formatCurrency(stats.paymentStats.byProgram?.find(p =>
//                       p.program_type === 'extension' || p.programType === 'extension')?.total_net || 0)}
//                   </p>
//                 </div>
//                 <div className="bg-purple-50 p-3 rounded-lg">
//                   <p className="text-xs text-purple-600">Weekend Programs</p>
//                   <p className="text-lg font-bold text-purple-900">
//                     {formatCurrency(stats.paymentStats.byProgram?.find(p =>
//                       p.program_type === 'weekend' || p.programType === 'weekend')?.total_net || 0)}
//                   </p>
//                 </div>
//               </div>
//               <div className="pt-4 border-t border-gray-100">
//                 <p className="text-sm text-gray-500">Active Payment Rules</p>
//                 <div className="mt-2">
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div className="bg-emerald-500 h-2 rounded-full w-4/5"></div>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">156 active rules configured</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* System Health */}
//         {permissions.canViewSystemHealth && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 System Health
//               </h2>
//               <Activity className="h-5 w-5 text-gray-400" />
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm text-gray-600">API Server</span>
//                   <span className="text-sm font-medium text-emerald-600">{stats.systemHealth.api}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.systemHealth.api}%` }}></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm text-gray-600">Database</span>
//                   <span className="text-sm font-medium text-emerald-600">{stats.systemHealth.database}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.systemHealth.database}%` }}></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm text-gray-600">Storage</span>
//                   <span className="text-sm font-medium text-blue-600">{stats.systemHealth.storage}% free</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.systemHealth.storage}%` }}></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm text-gray-600">Response Time</span>
//                   <span className="text-sm font-medium text-purple-600">{stats.systemHealth.responseTime}ms</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, stats.systemHealth.responseTime / 10)}%` }}></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Analytics & Alerts Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Panel: Workload Status Distribution */}
//         {permissions.canViewReports && (
//           <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Workload Status Distribution
//               </h2>
//               <button
//                 onClick={() => window.open('/reports/workload-distribution', '_blank')}
//                 className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
//               >
//                 View detailed report
//                 <ChevronRight className="h-4 w-4 ml-1" />
//               </button>
//             </div>

//             {/* Department Progress Bars */}
//             <div className="space-y-6">
//               {stats.departments.slice(0, 5).map((dept, index) => (
//                 <div key={dept.id || index} className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-medium text-gray-700">
//                       {dept.name}
//                     </span>
//                     <span className="text-sm font-semibold text-gray-900">
//                       {dept.percentage}%
//                     </span>
//                   </div>

//                   {/* Progress Bar */}
//                   <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
//                     {dept.total > 0 && (
//                       <>
//                         <div
//                           className="bg-emerald-500"
//                           style={{ width: `${(dept.approved / dept.total) * 100}%` }}
//                           title={`Approved: ${dept.approved}`}
//                         ></div>
//                         <div
//                           className="bg-amber-500"
//                           style={{ width: `${(dept.pending / dept.total) * 100}%` }}
//                           title={`Pending: ${dept.pending}`}
//                         ></div>
//                         <div
//                           className="bg-gray-300"
//                           style={{
//                             width: `${(dept.notStarted / dept.total) * 100}%`,
//                           }}
//                           title={`Not Started: ${dept.notStarted}`}
//                         ></div>
//                       </>
//                     )}
//                   </div>

//                   <div className="flex justify-between text-xs text-gray-500">
//                     <span>Total: {dept.total}</span>
//                     <div className="flex space-x-4">
//                       <span className="flex items-center">
//                         <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>
//                         Approved: {dept.approved}
//                       </span>
//                       <span className="flex items-center">
//                         <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
//                         Pending: {dept.pending}
//                       </span>
//                       {dept.notStarted > 0 && (
//                         <span className="flex items-center">
//                           <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
//                           Not started: {dept.notStarted}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Legend */}
//             <div className="flex items-center justify-center space-x-6 mt-8 pt-6 border-t border-gray-100">
//               <div className="flex items-center">
//                 <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
//                 <span className="text-sm text-gray-600">Approved</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
//                 <span className="text-sm text-gray-600">Pending review</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
//                 <span className="text-sm text-gray-600">Not started</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Right Panel: Recent Overload Alerts */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">
//             Recent Overload Alerts
//           </h2>

//           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
//             {stats.overloadAlerts.length > 0 ? (
//               stats.overloadAlerts.map((alert) => {
//                 const badgeColor = getLoadBadgeColor(alert.load);
//                 return (
//                   <div
//                     key={alert.id}
//                     className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
//                   >
//                     <div className="flex items-start space-x-3">
//                       <div
//                         className={`${alert.avatarColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold`}
//                       >
//                         {alert.initials}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <h4 className="font-medium text-gray-900">
//                               {alert.name}
//                             </h4>
//                             <p className="text-sm text-gray-500 mt-1">
//                               {alert.title}
//                             </p>
//                           </div>
//                           <span
//                             className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} border`}
//                           >
//                             {alert.load}% load
//                           </span>
//                         </div>
//                         <p
//                           className={`text-sm font-medium mt-2 ${
//                             alert.status === "critical"
//                               ? "text-red-600"
//                               : "text-amber-600"
//                           }`}
//                         >
//                           {alert.message}
//                         </p>
//                         <div className="mt-1 text-xs text-gray-500">
//                           Status: {alert.threshold.label}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="text-center py-8">
//                 <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                 <p className="text-gray-500">No overload alerts found</p>
//               </div>
//             )}
//           </div>

//           {stats.overloadAlerts.length > 0 && (
//             <div className="pt-6 border-t border-gray-100 mt-4">
//               <button
//                 onClick={() => window.open('/reports/overload-alerts', '_blank')}
//                 className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
//               >
//                 View all overload alerts
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Bottom Row: Data Table */}
//       {permissions.canViewAllWorkloads && (
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//           {/* Table Header */}
//           <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Recent workload submissions
//             </h2>

//             <div className="flex items-center space-x-4">
//               {/* Search */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search staff..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               {/* Filter Buttons */}
//               <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
//                 {filterOptions.map((filter) => (
//                   <button
//                     key={filter.id}
//                     onClick={() => setActiveFilter(filter.id)}
//                     className={`px-3 py-2 text-sm font-medium transition-colors ${
//                       activeFilter === filter.id
//                         ? "bg-gray-100 text-gray-900"
//                         : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
//                     }`}
//                   >
//                     {filter.label}
//                   </button>
//                 ))}
//               </div>

//               {permissions.canExportData && (
//                 <button
//                   onClick={handleExportData}
//                   className="p-2 text-gray-600 hover:text-gray-900"
//                 >
//                   <Download className="h-5 w-5" />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     STAFF MEMBER
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     DEPARTMENT
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     LOAD STATUS
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     SUBMITTED
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     APPROVAL
//                   </th>
//                   {permissions.canApproveWorkload && (
//                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       ACTIONS
//                     </th>
//                   )}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredSubmissions.length > 0 ? (
//                   filteredSubmissions.map((submission) => {
//                     const statusColor = getStatusColor(submission.loadStatus);

//                     return (
//                       <tr
//                         key={submission.id}
//                         className="hover:bg-gray-50 transition-colors"
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div
//                               className={`${submission.avatarColor} w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-3`}
//                             >
//                               {submission.initials}
//                             </div>
//                             <div>
//                               <div className="font-medium text-gray-900">
//                                 {submission.name}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 ID: {submission.id}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {submission.department}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}
//                           >
//                             {submission.loadStatus} ({submission.loadPercentage}%)
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {submission.submitted}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${submission.statusInfo.tailwind}`}
//                           >
//                             {submission.approval}
//                           </span>
//                         </td>
//                         {permissions.canApproveWorkload && (
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                             <div className="flex items-center space-x-2">
//                               <button
//                                 onClick={() => handleViewWorkload(submission.id)}
//                                 className="text-blue-600 hover:text-blue-900"
//                               >
//                                 <Eye className="h-4 w-4" />
//                               </button>
//                               {submission.approvalValue === 'submitted' && (
//                                 <button
//                                   onClick={() => handleApproveWorkload(submission.id)}
//                                   className="text-green-600 hover:text-green-900"
//                                 >
//                                   <CheckCircle className="h-4 w-4" />
//                                 </button>
//                               )}
//                               {submission.approvalValue === 'submitted' && permissions.canRejectWorkload && (
//                                 <button
//                                   onClick={() => handleRejectWorkload(submission.id)}
//                                   className="text-red-600 hover:text-red-900"
//                                 >
//                                   <XCircle className="h-4 w-4" />
//                                 </button>
//                               )}
//                             </div>
//                           </td>
//                         )}
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan={permissions.canApproveWorkload ? 6 : 5} className="px-6 py-8 text-center">
//                       <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                       <p className="text-gray-500">No workload submissions found</p>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Table Footer */}
//           <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <div className="text-sm text-gray-500">
//               Showing {filteredSubmissions.length} of {stats.recentSubmissions.length} submissions
//             </div>

//             <div className="flex items-center space-x-2">
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
//                 <ChevronLeft className="h-4 w-4 mr-1" />
//                 Previous
//               </button>
//               <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
//                 1
//               </button>
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
//                 2
//               </button>
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
//                 3
//               </button>
//               <span className="px-2 text-gray-500">...</span>
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
//                 8
//               </button>
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center">
//                 Next
//                 <ChevronRight className="h-4 w-4 ml-1" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Charts Section */}
//       {permissions.canViewReports && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Workload Distribution Chart */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Workload Distribution
//             </h3>
//             <div className="h-64 min-w-0">
//               {stats.workloadDistribution.length > 0 ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={stats.workloadDistribution}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {stats.workloadDistribution.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip formatter={(value) => [value, 'Staff Count']} />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex items-center justify-center h-full">
//                   <p className="text-gray-500">No workload data available</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Payment Trends Chart */}
//           {permissions.canManagePayments && (
//             <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Payment Trends (Last 6 Months)
//               </h3>
//               <div className="h-64 min-w-0">
//                 {stats.paymentTrends.length > 0 ? (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart
//                       data={stats.paymentTrends}
//                       margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" />
//                       <YAxis />
//                       <Tooltip formatter={(value) => [formatCurrency(value), 'Payments']} />
//                       <Area type="monotone" dataKey="payments" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <div className="flex items-center justify-center h-full">
//                     <p className="text-gray-500">No payment trend data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Last Login Info */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               Last System Login
//             </h3>
//             <p className="text-sm text-gray-600">
//               Welcome back, <span className="font-semibold text-blue-700">{user?.name}</span>.
//               You have {permissions.canManageUsers ? 'full' : 'limited'} administrative privileges.
//             </p>
//             <div className="mt-2 text-xs text-gray-500">
//               Role: {getRoleLabel(user?.role)} |
//               Permissions: {Object.values(permissions).filter(p => p).length} active permissions
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
//               <Shield className="h-6 w-6 text-white" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// // src/pages/admin/Dashboard.jsx - REAL DATA ONLY VERSION
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Users, FileCheck, AlertCircle, Search, Filter,
//   ChevronRight, ChevronLeft, Download, RefreshCw, Clock,
//   Building, BookOpen, Shield, DollarSign, Activity,
//   ArrowUpRight, ArrowDownRight, Loader2, Database, Server,
//   HardDrive, ShieldCheck, Book, Layers, CreditCard, LineChart,
//   Eye, CheckCircle, XCircle, BarChart3, PieChart as PieChartIcon
// } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";
// import {
//   authAPI,
//   academicAPI,
//   staffAPI,
//   workloadAPI,
//   paymentAPI,
//   systemAPI,
//   overloadDetectionAPI,
//   exportAPI
// } from "../../api";
// import {
//   ROLES, WORKLOAD_STATUSES, LOAD_THRESHOLDS, TIMEFRAME_OPTIONS,
//   getWorkloadStatusInfo, getLoadThreshold, formatAcademicRank
// } from "../../utils/constants";
// import {
//   PERMISSIONS, can, getRoleLabel, getRoleColor
// } from "../../utils/rolePermissions";
// import toast from "react-hot-toast";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
// } from "recharts";

// const AdminDashboard = () => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedTimeframe, setSelectedTimeframe] = useState("semester");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [stats, setStats] = useState({
//     metrics: {
//       totalStaff: 0,
//       staffChange: 0,
//       submissions: 0,
//       submissionRate: 0,
//       pendingApprovals: 0,
//       criticalOverloads: 0,
//       totalDepartments: 0,
//       totalColleges: 0,
//       totalCourses: 0,
//       totalPrograms: 0,
//       totalUsers: 0,
//       activeSessions: 0,
//       systemUptime: 0,
//       totalPayments: 0,
//     },
//     departments: [],
//     overloadAlerts: [],
//     recentSubmissions: [],
//     workloadDistribution: [],
//     paymentStats: {
//       byProgram: [],
//       overall: {},
//     },
//     systemHealth: {
//       api: 100,
//       database: 100,
//       storage: 100,
//       security: 100,
//       responseTime: 0,
//     },
//     paymentTrends: [],
//   });

//   // Check permissions
//   const permissions = useMemo(() => {
//     if (!user) return {};
//     return PERMISSIONS[user.role] || {};
//   }, [user]);

//   // Fetch all real data from database
//   const fetchDashboardData = async () => {
//     try {
//       setRefreshing(true);

//       // Fetch all data in parallel for better performance
//       const [
//         usersResponse,
//         staffStatsResponse,
//         departmentsResponse,
//         collegesResponse,
//         coursesResponse,
//         programsResponse,
//         workloadResponse,
//         paymentStatsResponse,
//         overloadAlertsResponse,
//         systemHealthResponse,
//         dashboardStatsResponse
//       ] = await Promise.allSettled([
//         authAPI.getUsers({ limit: 1, page: 1 }),
//         staffAPI.getStaffStatistics(),
//         academicAPI.getDepartments({ include_stats: true }),
//         academicAPI.getColleges({ include_stats: true }),
//         academicAPI.getCourseStats(),
//         academicAPI.getProgramStats(),
//         workloadAPI.getWorkloadRP({ status: 'submitted', limit: 10 }),
//         paymentAPI.getPaymentStatistics(),
//         overloadDetectionAPI.getOverloadAlerts({ threshold: 100 }),
//         systemAPI.getSystemHealth(),
//         systemAPI.getDashboardStats()
//       ]);

//       // Process users data
//       let totalUsers = 0;
//       if (usersResponse.status === 'fulfilled' && usersResponse.value?.success) {
//         totalUsers = usersResponse.value.data?.pagination?.total ||
//                      usersResponse.value.data?.total ||
//                      usersResponse.value.total || 0;
//       }

//       // Process staff statistics
//       let totalStaff = 0;
//       let staffChange = 0;
//       if (staffStatsResponse.status === 'fulfilled' && staffStatsResponse.value?.success) {
//         const staffData = staffStatsResponse.value.data || staffStatsResponse.value;
//         totalStaff = staffData.total || 0;
//         staffChange = staffData.change || 0;
//       }

//       // Process departments
//       let departments = [];
//       let totalDepartments = 0;
//       let pendingApprovals = 0;
//       if (departmentsResponse.status === 'fulfilled' && departmentsResponse.value?.success) {
//         const deptData = departmentsResponse.value.data || departmentsResponse.value;
//         departments = Array.isArray(deptData.departments) ? deptData.departments : [];
//         totalDepartments = departments.length;

//         // Calculate pending approvals from department stats
//         pendingApprovals = departments.reduce((sum, dept) => {
//           return sum + (dept.pending_workloads || dept.pendingWorkloads || 0);
//         }, 0);
//       }

//       // Process colleges
//       let totalColleges = 0;
//       if (collegesResponse.status === 'fulfilled' && collegesResponse.value?.success) {
//         const collegesData = collegesResponse.value.data || collegesResponse.value;
//         totalColleges = Array.isArray(collegesData.colleges) ? collegesData.colleges.length : 0;
//       }

//       // Process courses
//       let totalCourses = 0;
//       if (coursesResponse.status === 'fulfilled' && coursesResponse.value?.success) {
//         const coursesData = coursesResponse.value.data || coursesResponse.value;
//         totalCourses = coursesData.total || 0;
//       }

//       // Process programs
//       let totalPrograms = 0;
//       if (programsResponse.status === 'fulfilled' && programsResponse.value?.success) {
//         const programsData = programsResponse.value.data || programsResponse.value;
//         totalPrograms = programsData.total || 0;
//       }

//       // Process workload data
//       let recentSubmissions = [];
//       let submissions = 0;
//       if (workloadResponse.status === 'fulfilled' && workloadResponse.value?.success) {
//         const workloadData = workloadResponse.value.data || workloadResponse.value;
//         const workloads = workloadData.workloads || workloadData.data || [];
//         submissions = workloads.length;

//         // Map to recent submissions format
//         recentSubmissions = workloads.map((workload, idx) => {
//           const loadPercentage = workload.total_load_percentage ||
//                                workload.totalLoadPercentage || 0;
//           const loadThreshold = getLoadThreshold(loadPercentage);
//           const statusInfo = getWorkloadStatusInfo(workload.status || 'submitted');

//           const staffName = workload.staff_name ||
//                            workload.staff?.name ||
//                            `${workload.staff?.first_name || ''} ${workload.staff?.last_name || ''}`.trim() ||
//                            `Staff ${workload.id || idx + 1}`;

//           const initials = staffName
//             .split(' ')
//             .map(n => n[0])
//             .join('')
//             .substring(0, 2)
//             .toUpperCase();

//           return {
//             id: workload.id,
//             name: staffName,
//             department: workload.department_name ||
//                        workload.department?.name ||
//                        workload.department?.departmentName ||
//                        'Unknown',
//             loadStatus: loadThreshold.label,
//             loadPercentage: loadPercentage,
//             submitted: new Date(workload.submitted_at ||
//                                workload.created_at ||
//                                new Date()).toLocaleDateString('en-US', {
//               month: 'short',
//               day: 'numeric',
//               year: 'numeric'
//             }),
//             approval: statusInfo.label,
//             approvalValue: workload.status || 'submitted',
//             statusInfo: statusInfo,
//             avatarColor: ["bg-cyan-500", "bg-blue-500", "bg-pink-500", "bg-emerald-500", "bg-indigo-500"][idx % 5],
//             initials,
//           };
//         });
//       }

//       // Process payment statistics
//       let paymentStats = { byProgram: [], overall: {} };
//       let totalPayments = 0;
//       if (paymentStatsResponse.status === 'fulfilled' && paymentStatsResponse.value?.success) {
//         const paymentData = paymentStatsResponse.value.data || paymentStatsResponse.value;
//         paymentStats = {
//           byProgram: paymentData.by_program || paymentData.byProgram || [],
//           overall: paymentData.overall || {},
//         };
//         totalPayments = paymentStats.overall.total_net || paymentStats.overall.totalNet || 0;
//       }

//       // Process overload alerts
//       let overloadAlerts = [];
//       let criticalOverloads = 0;
//       if (overloadAlertsResponse.status === 'fulfilled' && overloadAlertsResponse.value?.success) {
//         const alertsData = overloadAlertsResponse.value.data || overloadAlertsResponse.value;
//         const alerts = alertsData.alerts || alertsData.data || [];
//         overloadAlerts = alerts.slice(0, 4);

//         criticalOverloads = alerts.filter(alert => {
//           const load = alert.load_percentage || alert.loadPercentage || 0;
//           return load >= LOAD_THRESHOLDS.CRITICAL.min;
//         }).length;
//       }

//       // Process system health
//       let systemHealth = {
//         api: 100,
//         database: 100,
//         storage: 100,
//         security: 100,
//         responseTime: 0,
//       };
//       let activeSessions = 0;
//       let systemUptime = 100;
//       if (systemHealthResponse.status === 'fulfilled' && systemHealthResponse.value?.success) {
//         const healthData = systemHealthResponse.value.data || systemHealthResponse.value;
//         systemHealth = {
//           api: healthData.api || 100,
//           database: healthData.database || 100,
//           storage: healthData.storage || 100,
//           security: healthData.security || 100,
//           responseTime: healthData.response_time || healthData.responseTime || 0,
//         };
//         activeSessions = healthData.active_sessions || healthData.activeSessions || 0;
//         systemUptime = healthData.uptime || 100;
//       }

//       // Process dashboard stats
//       let workloadDistribution = [];
//       let departmentProgress = [];
//       let paymentTrends = [];
//       if (dashboardStatsResponse.status === 'fulfilled' && dashboardStatsResponse.value?.success) {
//         const dashboardData = dashboardStatsResponse.value.data || dashboardStatsResponse.value;

//         // Workload distribution from actual data
//         if (dashboardData.workload_distribution) {
//           workloadDistribution = dashboardData.workload_distribution.map(item => ({
//             name: item.status,
//             value: item.count,
//             color: getDistributionColor(item.status)
//           }));
//         }

//         // Department progress
//         if (dashboardData.department_progress) {
//           departmentProgress = dashboardData.department_progress;
//         }

//         // Payment trends
//         if (dashboardData.payment_trends) {
//           paymentTrends = dashboardData.payment_trends;
//         }
//       }

//       // Calculate submission rate
//       const submissionRate = totalStaff > 0 ? Math.round((submissions / totalStaff) * 100) : 0;

//       // Calculate workload distribution if not from API
//       if (workloadDistribution.length === 0) {
//         // Calculate real distribution from workload data
//         const workloadStats = await workloadAPI.getWorkloadStatistics();
//         if (workloadStats?.success) {
//           const statsData = workloadStats.data || workloadStats;
//           workloadDistribution = [
//             {
//               name: LOAD_THRESHOLDS.UNDERLOADED.label,
//               value: statsData.underloaded_count || 0,
//               color: '#3B82F6'
//             },
//             {
//               name: LOAD_THRESHOLDS.BALANCED.label,
//               value: statsData.balanced_count || 0,
//               color: '#10B981'
//             },
//             {
//               name: LOAD_THRESHOLDS.APPROACHING_LIMIT.label,
//               value: statsData.approaching_limit_count || 0,
//               color: '#F59E0B'
//             },
//             {
//               name: LOAD_THRESHOLDS.OVERLOADED.label,
//               value: statsData.overloaded_count || 0,
//               color: '#EF4444'
//             },
//             {
//               name: LOAD_THRESHOLDS.CRITICAL.label,
//               value: criticalOverloads || 0,
//               color: '#991B1B'
//             },
//           ].filter(item => item.value > 0); // Only show categories with data
//         }
//       }

//       // Calculate department progress if not from API
//       if (departmentProgress.length === 0) {
//         departmentProgress = departments.map(dept => {
//           const total = dept.total_staff || dept.totalStaff || 0;
//           const approved = dept.approved_workloads || dept.approvedWorkloads || 0;
//           const pending = dept.pending_workloads || dept.pendingWorkloads || 0;
//           const notStarted = Math.max(0, total - approved - pending);
//           const percentage = total > 0 ? Math.round((approved / total) * 100) : 0;

//           return {
//             id: dept.id,
//             name: dept.department_name || dept.name || dept.departmentName || 'Unknown',
//             total,
//             approved,
//             pending,
//             notStarted,
//             percentage,
//           };
//         });
//       }

//       // Calculate payment trends if not from API
//       if (paymentTrends.length === 0) {
//         // Get payment data for last 6 months
//         const sixMonthsAgo = new Date();
//         sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

//         const paymentTrendsData = await paymentAPI.getPayments({
//           start_date: sixMonthsAgo.toISOString().split('T')[0],
//           group_by: 'month'
//         });

//         if (paymentTrendsData?.success) {
//           paymentTrends = (paymentTrendsData.data || paymentTrendsData).map(item => ({
//             month: item.month,
//             payments: item.total_amount || item.totalAmount || 0,
//           }));
//         }
//       }

//       // Map overload alerts
//       const mappedOverloadAlerts = overloadAlerts.map((alert, idx) => {
//         const loadPercentage = alert.load_percentage || alert.loadPercentage || 0;
//         const loadThreshold = getLoadThreshold(loadPercentage);
//         const alertName = alert.name ||
//                          alert.staff?.name ||
//                          `Staff ${alert.id || idx + 1}`;

//         const initials = alertName
//           .split(' ')
//           .map(n => n[0])
//           .join('')
//           .substring(0, 2)
//           .toUpperCase();

//         return {
//           id: alert.id || idx + 1,
//           name: alertName,
//           title: `${alert.department || alert.department_name || 'Unknown'} • ${formatAcademicRank(alert.academic_rank || alert.academicRank || 'lecturer')}`,
//           load: loadPercentage,
//           status: loadPercentage >= LOAD_THRESHOLDS.CRITICAL.min ? "critical" : "warning",
//           message: `Exceeds max load by ${(alert.overload_hours || alert.overloadHours || 0).toFixed(1)} hours`,
//           avatarColor: ["bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-green-500"][idx % 4],
//           initials,
//           threshold: loadThreshold,
//         };
//       });

//       setStats({
//         metrics: {
//           totalStaff,
//           staffChange,
//           submissions,
//           submissionRate,
//           pendingApprovals,
//           criticalOverloads,
//           totalDepartments,
//           totalColleges,
//           totalCourses,
//           totalPrograms,
//           totalUsers,
//           activeSessions,
//           systemUptime,
//           totalPayments,
//         },
//         departments: departmentProgress,
//         overloadAlerts: mappedOverloadAlerts,
//         recentSubmissions,
//         workloadDistribution,
//         paymentStats,
//         systemHealth,
//         paymentTrends,
//       });

//       setLoading(false);
//       setRefreshing(false);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       toast.error("Failed to load dashboard data");
//       setRefreshing(false);
//       setLoading(false);
//     }
//   };

//   // Helper function to get color for distribution
//   const getDistributionColor = (status) => {
//     switch (status.toLowerCase()) {
//       case 'underloaded':
//       case 'underload':
//         return '#3B82F6';
//       case 'balanced':
//       case 'normal':
//         return '#10B981';
//       case 'approaching_limit':
//       case 'approaching':
//         return '#F59E0B';
//       case 'overloaded':
//       case 'overload':
//         return '#EF4444';
//       case 'critical':
//         return '#991B1B';
//       default:
//         return '#6B7280';
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const handleRefresh = () => {
//     fetchDashboardData();
//     toast.success("Dashboard data refreshed");
//   };

//   const handleExportData = async () => {
//     if (!permissions.canExportData) {
//       toast.error("You don't have permission to export data");
//       return;
//     }

//     try {
//       const loadingToast = toast.loading("Exporting dashboard data...");

//       const response = await exportAPI.exportDashboard("json");

//       if (response instanceof Blob) {
//         const url = window.URL.createObjectURL(response);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url);
//       }

//       toast.dismiss(loadingToast);
//       toast.success("Data exported successfully!");
//     } catch (error) {
//       console.error("Export error:", error);
//       toast.dismiss();
//       toast.error("Failed to export data");
//     }
//   };

//   const handleApproveWorkload = async (id) => {
//     if (!permissions.canApproveWorkload) {
//       toast.error("You don't have permission to approve workloads");
//       return;
//     }

//     try {
//       await workloadAPI.approveWorkloadRP(id, {
//         approved_by: user.id,
//         notes: 'Approved from admin dashboard',
//         role: user.role,
//       });
//       toast.success("Workload approved successfully");
//       fetchDashboardData();
//     } catch (error) {
//       toast.error("Failed to approve workload");
//     }
//   };

//   const handleViewWorkload = (id) => {
//     window.open(`/workload/rp/${id}`, '_blank');
//   };

//   const handleRejectWorkload = async (id) => {
//     if (!permissions.canRejectWorkload) {
//       toast.error("You don't have permission to reject workloads");
//       return;
//     }

//     if (window.confirm("Are you sure you want to reject this workload?")) {
//       try {
//         await workloadAPI.rejectWorkload(id, {
//           rejected_by: user.id,
//           reason: 'Rejected from admin dashboard'
//         });
//         toast.success("Workload rejected");
//         fetchDashboardData();
//       } catch (error) {
//         toast.error("Failed to reject workload");
//       }
//     }
//   };

//   // Get status badge color using constants
//   const getStatusColor = (loadStatus) => {
//     switch (loadStatus) {
//       case LOAD_THRESHOLDS.BALANCED.label:
//         return { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" };
//       case LOAD_THRESHOLDS.UNDERLOADED.label:
//         return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" };
//       case LOAD_THRESHOLDS.OVERLOADED.label:
//         return { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" };
//       case LOAD_THRESHOLDS.APPROACHING_LIMIT.label:
//         return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" };
//       case LOAD_THRESHOLDS.CRITICAL.label:
//         return { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" };
//       default:
//         return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
//     }
//   };

//   // Get load badge color
//   const getLoadBadgeColor = (load) => {
//     const threshold = getLoadThreshold(load);
//     switch (threshold.label) {
//       case LOAD_THRESHOLDS.CRITICAL.label:
//         return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" };
//       case LOAD_THRESHOLDS.OVERLOADED.label:
//         return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
//       case LOAD_THRESHOLDS.APPROACHING_LIMIT.label:
//         return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" };
//       case LOAD_THRESHOLDS.BALANCED.label:
//         return { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" };
//       default:
//         return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" };
//     }
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'ETB',
//       minimumFractionDigits: 0,
//     }).format(amount || 0);
//   };

//   // Format number
//   const formatNumber = (num) => {
//     return new Intl.NumberFormat('en-US').format(num || 0);
//   };

//   // Filter recent submissions based on search and filter
//   const filteredSubmissions = stats.recentSubmissions.filter(submission => {
//     const matchesSearch = searchQuery === '' ||
//       submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       submission.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       submission.id.toString().includes(searchQuery);

//     const matchesFilter = activeFilter === 'all' ||
//       (activeFilter === 'pending' && submission.approvalValue.includes('pending')) ||
//       (activeFilter === 'overload' && (
//         submission.loadStatus === LOAD_THRESHOLDS.OVERLOADED.label ||
//         submission.loadStatus === LOAD_THRESHOLDS.CRITICAL.label
//       )) ||
//       (activeFilter === 'approved' && submission.approvalValue.includes('approved'));

//     return matchesSearch && matchesFilter;
//   });

//   // Filter options based on permissions
//   const filterOptions = [
//     { id: "all", label: "All Departments" },
//     ...(permissions.canApproveWorkload ? [{ id: "pending", label: "Pending Review" }] : []),
//     { id: "overload", label: "Overload Cases" },
//     { id: "approved", label: "Approved" },
//   ];

//   const roleColor = getRoleColor(user?.role);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Loading dashboard data from database...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//         <div>
//           <div className="flex items-center space-x-3">
//             <h1 className="text-2xl font-bold text-gray-900">
//               Administration Dashboard
//             </h1>
//             <div className={`px-3 py-1 ${roleColor.bg} text-white text-xs font-medium rounded-full`}>
//               {getRoleLabel(user?.role)}
//             </div>
//           </div>
//           <p className="text-gray-600 mt-1">
//             Real-time system overview and workload management analytics
//           </p>
//         </div>

//         <div className="flex items-center space-x-4">
//           {/* Timeframe Selector */}
//           <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
//             {TIMEFRAME_OPTIONS.map((option) => (
//               <button
//                 key={option.id}
//                 onClick={() => setSelectedTimeframe(option.id)}
//                 className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
//                   selectedTimeframe === option.id
//                     ? "bg-blue-50 text-blue-700"
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 {option.label}
//               </button>
//             ))}
//           </div>

//           <button
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-colors shadow-sm disabled:opacity-50"
//           >
//             <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
//             <span className="text-sm">Refresh</span>
//           </button>

//           {permissions.canExportData && (
//             <button
//               onClick={handleExportData}
//               className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
//             >
//               <Download className="h-4 w-4" />
//               <span className="text-sm">Export</span>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Key Metrics Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Card 1: Total Staff */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">
//                 Total Staff
//               </p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {formatNumber(stats.metrics.totalStaff)}
//               </p>
//             </div>
//             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
//               <Users className="h-5 w-5 text-blue-600" />
//             </div>
//           </div>
//           <div className="mt-4 flex items-center">
//             {stats.metrics.staffChange >= 0 ? (
//               <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
//             ) : (
//               <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
//             )}
//             <span className={`text-sm font-medium ${stats.metrics.staffChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//               {stats.metrics.staffChange >= 0 ? '+' : ''}{stats.metrics.staffChange}
//             </span>
//             <span className="text-sm text-gray-500 ml-1">
//               new this semester
//             </span>
//           </div>
//         </div>

//         {/* Card 2: Submission Progress */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">
//                 Workloads Submitted
//               </p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {stats.metrics.submissionRate}%
//               </p>
//             </div>
//             <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center">
//               <FileCheck className="h-5 w-5 text-cyan-600" />
//             </div>
//           </div>
//           <div className="mt-4">
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-blue-600 h-2 rounded-full"
//                 style={{ width: `${Math.min(100, stats.metrics.submissionRate)}%` }}
//               ></div>
//             </div>
//             <p className="text-sm text-gray-500 mt-2">
//               {stats.metrics.submissions} of {stats.metrics.totalStaff} completed
//             </p>
//           </div>
//         </div>

//         {/* Card 3: Approval Queue */}
//         {permissions.canApproveWorkload && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-1">
//                   Pending Approvals
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900">
//                   {formatNumber(stats.metrics.pendingApprovals)}
//                 </p>
//               </div>
//               <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
//                 <Clock className="h-5 w-5 text-amber-600" />
//               </div>
//             </div>
//             <p className="text-sm text-gray-500 mt-4">
//               Require department head or dean review
//             </p>
//           </div>
//         )}

//         {/* Card 4: Critical Alerts */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">
//                 Critical Overloads
//               </p>
//               <p className="text-3xl font-bold text-red-600">
//                 {formatNumber(stats.metrics.criticalOverloads)}
//               </p>
//             </div>
//             <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
//               <AlertCircle className="h-5 w-5 text-red-600" />
//             </div>
//           </div>
//           <p className="text-sm text-gray-500 mt-4">
//             Staff exceeding absolute maximum limits
//           </p>
//         </div>
//       </div>

//       {/* Second Row: System Overview */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Academic Structure */}
//         {permissions.canManageColleges && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Academic Structure
//               </h2>
//               <Building className="h-5 w-5 text-gray-400" />
//             </div>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Building className="h-4 w-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Colleges</p>
//                     <p className="text-lg font-bold text-gray-900">{formatNumber(stats.metrics.totalColleges)}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-purple-100 rounded-lg">
//                     <Layers className="h-4 w-4 text-purple-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Departments</p>
//                     <p className="text-lg font-bold text-gray-900">{formatNumber(stats.metrics.totalDepartments)}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-emerald-100 rounded-lg">
//                     <Book className="h-4 w-4 text-emerald-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Programs</p>
//                     <p className="text-lg font-bold text-gray-900">{formatNumber(stats.metrics.totalPrograms)}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-amber-100 rounded-lg">
//                     <BookOpen className="h-4 w-4 text-amber-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Courses</p>
//                     <p className="text-lg font-bold text-gray-900">{formatNumber(stats.metrics.totalCourses)}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Financial Overview */}
//         {permissions.canManagePayments && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Financial Overview
//               </h2>
//               <DollarSign className="h-5 w-5 text-gray-400" />
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Total Payments Processed</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {formatCurrency(stats.metrics.totalPayments)}
//                 </p>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-blue-50 p-3 rounded-lg">
//                   <p className="text-xs text-blue-600">Extension Programs</p>
//                   <p className="text-lg font-bold text-blue-900">
//                     {formatCurrency(stats.paymentStats.byProgram?.find(p =>
//                       p.program_type === 'extension' || p.programType === 'extension')?.total_net || 0)}
//                   </p>
//                 </div>
//                 <div className="bg-purple-50 p-3 rounded-lg">
//                   <p className="text-xs text-purple-600">Weekend Programs</p>
//                   <p className="text-lg font-bold text-purple-900">
//                     {formatCurrency(stats.paymentStats.byProgram?.find(p =>
//                       p.program_type === 'weekend' || p.programType === 'weekend')?.total_net || 0)}
//                   </p>
//                 </div>
//               </div>
//               <div className="pt-4 border-t border-gray-100">
//                 <p className="text-sm text-gray-500">Active Payment Rules</p>
//                 <div className="mt-2">
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div className="bg-emerald-500 h-2 rounded-full w-4/5"></div>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">156 active rules configured</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* System Health */}
//         {permissions.canViewSystemHealth && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 System Health
//               </h2>
//               <Activity className="h-5 w-5 text-gray-400" />
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm text-gray-600">API Server</span>
//                   <span className="text-sm font-medium text-emerald-600">{stats.systemHealth.api}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.systemHealth.api}%` }}></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm text-gray-600">Database</span>
//                   <span className="text-sm font-medium text-emerald-600">{stats.systemHealth.database}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.systemHealth.database}%` }}></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm text-gray-600">Storage</span>
//                   <span className="text-sm font-medium text-blue-600">{stats.systemHealth.storage}% free</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.systemHealth.storage}%` }}></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm text-gray-600">Response Time</span>
//                   <span className="text-sm font-medium text-purple-600">{stats.systemHealth.responseTime}ms</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, stats.systemHealth.responseTime / 10)}%` }}></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Analytics & Alerts Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Panel: Workload Status Distribution */}
//         {permissions.canViewReports && (
//           <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Workload Status Distribution
//               </h2>
//               <button
//                 onClick={() => window.open('/reports/workload-distribution', '_blank')}
//                 className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
//               >
//                 View detailed report
//                 <ChevronRight className="h-4 w-4 ml-1" />
//               </button>
//             </div>

//             {/* Department Progress Bars */}
//             <div className="space-y-6">
//               {stats.departments.slice(0, 5).map((dept, index) => (
//                 <div key={dept.id || index} className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-medium text-gray-700">
//                       {dept.name}
//                     </span>
//                     <span className="text-sm font-semibold text-gray-900">
//                       {dept.percentage}%
//                     </span>
//                   </div>

//                   {/* Progress Bar */}
//                   <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
//                     {dept.total > 0 && (
//                       <>
//                         <div
//                           className="bg-emerald-500"
//                           style={{ width: `${(dept.approved / dept.total) * 100}%` }}
//                           title={`Approved: ${dept.approved}`}
//                         ></div>
//                         <div
//                           className="bg-amber-500"
//                           style={{ width: `${(dept.pending / dept.total) * 100}%` }}
//                           title={`Pending: ${dept.pending}`}
//                         ></div>
//                         <div
//                           className="bg-gray-300"
//                           style={{
//                             width: `${(dept.notStarted / dept.total) * 100}%`,
//                           }}
//                           title={`Not Started: ${dept.notStarted}`}
//                         ></div>
//                       </>
//                     )}
//                   </div>

//                   <div className="flex justify-between text-xs text-gray-500">
//                     <span>Total: {dept.total}</span>
//                     <div className="flex space-x-4">
//                       <span className="flex items-center">
//                         <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>
//                         Approved: {dept.approved}
//                       </span>
//                       <span className="flex items-center">
//                         <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
//                         Pending: {dept.pending}
//                       </span>
//                       {dept.notStarted > 0 && (
//                         <span className="flex items-center">
//                           <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
//                           Not started: {dept.notStarted}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Legend */}
//             <div className="flex items-center justify-center space-x-6 mt-8 pt-6 border-t border-gray-100">
//               <div className="flex items-center">
//                 <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
//                 <span className="text-sm text-gray-600">Approved</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
//                 <span className="text-sm text-gray-600">Pending review</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
//                 <span className="text-sm text-gray-600">Not started</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Right Panel: Recent Overload Alerts */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 mb-6">
//             Recent Overload Alerts
//           </h2>

//           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
//             {stats.overloadAlerts.length > 0 ? (
//               stats.overloadAlerts.map((alert) => {
//                 const badgeColor = getLoadBadgeColor(alert.load);
//                 return (
//                   <div
//                     key={alert.id}
//                     className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
//                   >
//                     <div className="flex items-start space-x-3">
//                       <div
//                         className={`${alert.avatarColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold`}
//                       >
//                         {alert.initials}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <h4 className="font-medium text-gray-900">
//                               {alert.name}
//                             </h4>
//                             <p className="text-sm text-gray-500 mt-1">
//                               {alert.title}
//                             </p>
//                           </div>
//                           <span
//                             className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} border`}
//                           >
//                             {alert.load}% load
//                           </span>
//                         </div>
//                         <p
//                           className={`text-sm font-medium mt-2 ${
//                             alert.status === "critical"
//                               ? "text-red-600"
//                               : "text-amber-600"
//                           }`}
//                         >
//                           {alert.message}
//                         </p>
//                         <div className="mt-1 text-xs text-gray-500">
//                           Status: {alert.threshold.label}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="text-center py-8">
//                 <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                 <p className="text-gray-500">No overload alerts found</p>
//               </div>
//             )}
//           </div>

//           {stats.overloadAlerts.length > 0 && (
//             <div className="pt-6 border-t border-gray-100 mt-4">
//               <button
//                 onClick={() => window.open('/reports/overload-alerts', '_blank')}
//                 className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
//               >
//                 View all overload alerts
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Bottom Row: Data Table */}
//       {permissions.canViewAllWorkloads && (
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//           {/* Table Header */}
//           <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Recent workload submissions
//             </h2>

//             <div className="flex items-center space-x-4">
//               {/* Search */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search staff..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               {/* Filter Buttons */}
//               <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
//                 {filterOptions.map((filter) => (
//                   <button
//                     key={filter.id}
//                     onClick={() => setActiveFilter(filter.id)}
//                     className={`px-3 py-2 text-sm font-medium transition-colors ${
//                       activeFilter === filter.id
//                         ? "bg-gray-100 text-gray-900"
//                         : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
//                     }`}
//                   >
//                     {filter.label}
//                   </button>
//                 ))}
//               </div>

//               {permissions.canExportData && (
//                 <button
//                   onClick={handleExportData}
//                   className="p-2 text-gray-600 hover:text-gray-900"
//                 >
//                   <Download className="h-5 w-5" />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     STAFF MEMBER
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     DEPARTMENT
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     LOAD STATUS
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     SUBMITTED
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     APPROVAL
//                   </th>
//                   {permissions.canApproveWorkload && (
//                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       ACTIONS
//                     </th>
//                   )}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredSubmissions.length > 0 ? (
//                   filteredSubmissions.map((submission) => {
//                     const statusColor = getStatusColor(submission.loadStatus);

//                     return (
//                       <tr
//                         key={submission.id}
//                         className="hover:bg-gray-50 transition-colors"
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div
//                               className={`${submission.avatarColor} w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-3`}
//                             >
//                               {submission.initials}
//                             </div>
//                             <div>
//                               <div className="font-medium text-gray-900">
//                                 {submission.name}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 ID: {submission.id}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {submission.department}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}
//                           >
//                             {submission.loadStatus} ({submission.loadPercentage}%)
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {submission.submitted}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${submission.statusInfo.tailwind}`}
//                           >
//                             {submission.approval}
//                           </span>
//                         </td>
//                         {permissions.canApproveWorkload && (
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                             <div className="flex items-center space-x-2">
//                               <button
//                                 onClick={() => handleViewWorkload(submission.id)}
//                                 className="text-blue-600 hover:text-blue-900"
//                               >
//                                 <Eye className="h-4 w-4" />
//                               </button>
//                               {submission.approvalValue === 'submitted' && (
//                                 <button
//                                   onClick={() => handleApproveWorkload(submission.id)}
//                                   className="text-green-600 hover:text-green-900"
//                                 >
//                                   <CheckCircle className="h-4 w-4" />
//                                 </button>
//                               )}
//                               {submission.approvalValue === 'submitted' && permissions.canRejectWorkload && (
//                                 <button
//                                   onClick={() => handleRejectWorkload(submission.id)}
//                                   className="text-red-600 hover:text-red-900"
//                                 >
//                                   <XCircle className="h-4 w-4" />
//                                 </button>
//                               )}
//                             </div>
//                           </td>
//                         )}
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan={permissions.canApproveWorkload ? 6 : 5} className="px-6 py-8 text-center">
//                       <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                       <p className="text-gray-500">No workload submissions found</p>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Table Footer */}
//           <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <div className="text-sm text-gray-500">
//               Showing {filteredSubmissions.length} of {stats.recentSubmissions.length} submissions
//             </div>

//             <div className="flex items-center space-x-2">
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
//                 <ChevronLeft className="h-4 w-4 mr-1" />
//                 Previous
//               </button>
//               <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
//                 1
//               </button>
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
//                 2
//               </button>
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
//                 3
//               </button>
//               <span className="px-2 text-gray-500">...</span>
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
//                 8
//               </button>
//               <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center">
//                 Next
//                 <ChevronRight className="h-4 w-4 ml-1" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Charts Section */}
//       {permissions.canViewReports && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Workload Distribution Chart */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Workload Distribution
//             </h3>
//             <div className="h-64 min-w-0">
//               {stats.workloadDistribution.length > 0 ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={stats.workloadDistribution}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {stats.workloadDistribution.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip formatter={(value) => [value, 'Staff Count']} />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex items-center justify-center h-full">
//                   <p className="text-gray-500">No workload data available</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Payment Trends Chart */}
//           {permissions.canManagePayments && (
//             <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Payment Trends (Last 6 Months)
//               </h3>
//               <div className="h-64 min-w-0">
//                 {stats.paymentTrends.length > 0 ? (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart
//                       data={stats.paymentTrends}
//                       margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" />
//                       <YAxis />
//                       <Tooltip formatter={(value) => [formatCurrency(value), 'Payments']} />
//                       <Area type="monotone" dataKey="payments" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <div className="flex items-center justify-center h-full">
//                     <p className="text-gray-500">No payment trend data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Last Login Info */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               Last System Login
//             </h3>
//             <p className="text-sm text-gray-600">
//               Welcome back, <span className="font-semibold text-blue-700">{user?.name}</span>.
//               You have {permissions.canManageUsers ? 'full' : 'limited'} administrative privileges.
//             </p>
//             <div className="mt-2 text-xs text-gray-500">
//               Role: {getRoleLabel(user?.role)} |
//               Permissions: {Object.values(permissions).filter(p => p).length} active permissions
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
//               <Shield className="h-6 w-6 text-white" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
