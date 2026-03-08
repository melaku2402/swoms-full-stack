// src/pages/department/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  departmentAPI,
  staffAPI,
  courseAPI,
  workloadAPI,
  courseAssignmentAPI,
  overloadDetectionAPI,
} from "../../api";
import {
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  FileText,
  Calendar,
  Building,
  GraduationCap,
  DollarSign,
  BarChart3,
  Target,
  ChevronRight,
  Loader2,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Search,
  Plus,
  Shield,
  Activity,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Building2,
  School,
  Award,
  UserCheck,
  FileBarChart,
  Bell,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Settings,
  ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("current_semester");
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeCourses: 0,
    totalWorkloadHours: 0,
    pendingAssignments: 0,
    overloadAlerts: 0,
    averageLoad: 0,
    completedWorkloads: 0,
    pendingApprovals: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [workloadTrend, setWorkloadTrend] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [quickStats, setQuickStats] = useState({
    staffByRank: [],
    courseDistribution: [],
    workloadStatus: [],
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user?.department_id) return;

    try {
      setLoading(true);

      // 1. Fetch department dashboard data
      const deptResponse = await departmentAPI.getDepartmentDashboard(
        user.department_id,
        timeRange
      );

      if (deptResponse.data) {
        setDashboardData(deptResponse.data);
        setDepartmentInfo(deptResponse.data.departmentInfo);
        setStats(deptResponse.data.summary || {});
        setRecentActivities(deptResponse.data.recentActivities || []);
      }

      // 2. Fetch department statistics
      const statsResponse = await departmentAPI.getDepartmentStats(
        user.department_id,
        "detailed"
      );

      if (statsResponse.data) {
        setQuickStats({
          staffByRank: statsResponse.data.staff_by_rank || [],
          courseDistribution: statsResponse.data.course_distribution || [],
          workloadStatus: statsResponse.data.workload_status || [],
        });
      }

      // 3. Fetch workload trend data
      const workloadResponse = await workloadAPI.getWorkloadStatistics({
        department_id: user.department_id,
        time_range: timeRange,
      });

      if (workloadResponse.data?.trend) {
        setWorkloadTrend(workloadResponse.data.trend);
      }

      // 4. Fetch overload alerts
      const alertsResponse = await overloadDetectionAPI.getOverloadAlerts({
        department_id: user.department_id,
        limit: 5,
      });

      // Update stats with overload alerts
      if (alertsResponse.data) {
        setStats((prev) => ({
          ...prev,
          overloadAlerts: alertsResponse.data.count || 0,
        }));
      }

      toast.success("Dashboard data loaded");
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");

      // Fallback to mock data for development
      setFallbackData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.department_id, timeRange]);

  // Fallback data for development
  const setFallbackData = () => {
    setDepartmentInfo({
      department_name: user?.department_name || "Computer Science",
      college: { college_name: "College of Engineering" },
    });

    setStats({
      totalStaff: 42,
      activeCourses: 156,
      totalWorkloadHours: 1256,
      pendingAssignments: 8,
      overloadAlerts: 3,
      averageLoad: 78,
      completedWorkloads: 35,
      pendingApprovals: 12,
    });

    setWorkloadTrend([
      { month: "Jan", hours: 1200, average: 1100 },
      { month: "Feb", hours: 1300, average: 1150 },
      { month: "Mar", hours: 1250, average: 1200 },
      { month: "Apr", hours: 1400, average: 1250 },
      { month: "May", hours: 1350, average: 1300 },
      { month: "Jun", hours: 1500, average: 1350 },
    ]);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    toast.success("Refreshing dashboard data...");
  };

  // Handle export
  const handleExportData = async () => {
    try {
      toast.loading("Exporting department data...");

      // In a real app, you would call your export API
      const response = await departmentAPI.exportDepartmentData(
        user.department_id,
        "excel"
      );

      // Create and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `department_dashboard_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss();
      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  // Initialize on mount and when timeRange changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading department dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching your department data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Building className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {departmentInfo?.department_name || "Department"} Dashboard
            </h1>
            {departmentInfo?.college && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {departmentInfo.college.college_name}
              </span>
            )}
          </div>
          <p className="text-gray-600">
            Welcome back, Department Head! Manage your department's workload,
            staff, and courses.
          </p>
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>AY: 2024-25 • Semester I</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Last updated: Just now</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="current_semester">Current Semester</option>
            <option value="last_semester">Last Semester</option>
            <option value="current_year">This Year</option>
            <option value="last_year">Last Year</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={handleExportData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard
          title="Total Staff"
          value={stats.totalStaff}
          change="+2 this semester"
          trend="up"
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-50"
          onClick={() => navigate("/department/staff")}
        />

        <StatCard
          title="Active Courses"
          value={stats.activeCourses}
          change="+12 from last term"
          trend="up"
          icon={BookOpen}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          onClick={() => navigate("/academic/courses")}
        />

        <StatCard
          title="Workload Hours"
          value={`${stats.totalWorkloadHours}h`}
          change={`${stats.averageLoad}% avg load`}
          trend={stats.averageLoad > 80 ? "down" : "up"}
          icon={Clock}
          color={stats.averageLoad > 80 ? "text-amber-600" : "text-green-600"}
          bgColor={stats.averageLoad > 80 ? "bg-amber-50" : "bg-green-50"}
          onClick={() => navigate("/workload/dept/assignments")}
        />

        <StatCard
          title="Pending Assignments"
          value={stats.pendingAssignments}
          change="Requires attention"
          trend="warning"
          icon={AlertCircle}
          color="text-amber-600"
          bgColor="bg-amber-50"
          onClick={() => navigate("/workload/dept/assignments")}
        />

        <StatCard
          title="Overload Alerts"
          value={stats.overloadAlerts}
          change="Need review"
          trend={stats.overloadAlerts > 0 ? "critical" : "good"}
          icon={Activity}
          color={stats.overloadAlerts > 0 ? "text-red-600" : "text-green-600"}
          bgColor={stats.overloadAlerts > 0 ? "bg-red-50" : "bg-green-50"}
          onClick={() => navigate("/overload/dept/alerts")}
        />

        <StatCard
          title="Completed Workloads"
          value={stats.completedWorkloads}
          change={`${Math.round(
            (stats.completedWorkloads / stats.totalStaff) * 100
          )}% submitted`}
          trend="up"
          icon={CheckCircle}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          onClick={() => navigate("/workload/dept/overview")}
        />

        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          change="Awaiting action"
          trend="warning"
          icon={FileText}
          color="text-purple-600"
          bgColor="bg-purple-50"
          onClick={() => navigate("/approvals/pending")}
        />

        <StatCard
          title="Avg. Load"
          value={`${stats.averageLoad}%`}
          change={stats.averageLoad > 80 ? "Above threshold" : "Within limits"}
          trend={stats.averageLoad > 80 ? "down" : "up"}
          icon={TrendingUp}
          color={stats.averageLoad > 80 ? "text-red-600" : "text-green-600"}
          bgColor={stats.averageLoad > 80 ? "bg-red-50" : "bg-green-50"}
          onClick={() => navigate("/overload/dept")}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Workload Trend
              </h3>
              <p className="text-sm text-gray-600">Monthly workload hours</p>
            </div>
            <div className="flex items-center space-x-2">
              <LineChartIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-500">Last 6 months</span>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={workloadTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value) => [`${value} hours`, "Workload"]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name="Total Hours"
                />
                <Area
                  type="monotone"
                  dataKey="average"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name="Department Average"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Staff Distribution
              </h3>
              <p className="text-sm text-gray-600">By academic rank</p>
            </div>
            <button
              onClick={() => navigate("/department/staff")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View Details <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={quickStats.staffByRank}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {quickStats.staffByRank.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getRankColor(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} staff`, name]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              title="Manage Staff"
              description="View and assign department staff"
              icon={Users}
              color="blue"
              path="/department/staff"
              badge={stats.totalStaff}
            />

            <QuickActionCard
              title="Assign Courses"
              description="Assign courses to instructors"
              icon={BookOpen}
              color="green"
              path="/workload/dept/assignments"
              badge={stats.pendingAssignments}
              badgeColor="amber"
            />

            <QuickActionCard
              title="Approve Workloads"
              description="Review and approve submitted workloads"
              icon={CheckCircle}
              color="emerald"
              path="/approvals/workload"
              badge={stats.pendingApprovals}
              badgeColor="purple"
            />

            <QuickActionCard
              title="Monitor Overload"
              description="Check and manage overload cases"
              icon={Activity}
              color="red"
              path="/overload/dept"
              badge={stats.overloadAlerts}
              badgeColor="red"
            />

            <QuickActionCard
              title="Generate Reports"
              description="Create department reports"
              icon={FileBarChart}
              color="purple"
              path="/reports/department"
            />

            <QuickActionCard
              title="Department Settings"
              description="Configure department parameters"
              icon={Settings}
              color="gray"
              path="/department/settings"
            />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activities
              </h3>
              <p className="text-sm text-gray-600">Latest department updates</p>
            </div>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities
                .slice(0, 5)
                .map((activity, index) => (
                  <ActivityItem
                    key={index}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    type={activity.type}
                    user={activity.user}
                    status={activity.status}
                  />
                ))
            ) : (
              <>
                <ActivityItem
                  title="New Staff Member"
                  description="Dr. Samuel joined the department"
                  time="2 days ago"
                  type="staff"
                  status="completed"
                />
                <ActivityItem
                  title="Course Assignment"
                  description="Advanced Programming assigned to Dr. Abebe"
                  time="1 day ago"
                  type="assignment"
                  status="completed"
                />
                <ActivityItem
                  title="Workload Submitted"
                  description="Dr. Mesfin submitted semester workload"
                  time="4 hours ago"
                  type="workload"
                  status="pending"
                />
                <ActivityItem
                  title="Overload Alert"
                  description="Workload threshold exceeded for Dr. Alemayehu"
                  time="3 days ago"
                  type="alert"
                  status="warning"
                />
              </>
            )}

            <Link
              to="/department/staff?tab=activity"
              className="block text-center mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all activities →
            </Link>
          </div>
        </div>
      </div>

      {/* Department Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Department Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Staff by Rank */}
          <SummaryCard title="Staff by Rank" icon={GraduationCap} color="blue">
            {quickStats.staffByRank.map((rank, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">{rank.name}</span>
                <span className="font-medium">{rank.value}</span>
              </div>
            ))}
          </SummaryCard>

          {/* Course Distribution */}
          <SummaryCard
            title="Course Distribution"
            icon={BookOpen}
            color="emerald"
          >
            {quickStats.courseDistribution.map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">{course.type}</span>
                <span className="font-medium">{course.count}</span>
              </div>
            ))}
          </SummaryCard>

          {/* Workload Status */}
          <SummaryCard title="Workload Status" icon={Activity} color="amber">
            {quickStats.workloadStatus.map((status, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">{status.status}</span>
                <span
                  className={`font-medium ${getWorkloadStatusColor(
                    status.status
                  )}`}
                >
                  {status.count}
                </span>
              </div>
            ))}
          </SummaryCard>

          {/* Quick Links */}
          <SummaryCard title="Quick Links" icon={ExternalLink} color="purple">
            <Link
              to="/department/stats"
              className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg"
            >
              <span className="text-sm text-gray-600">View Statistics</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              to="/reports/department"
              className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg"
            >
              <span className="text-sm text-gray-600">Generate Report</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              to="/workload/dept/bulk"
              className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg"
            >
              <span className="text-sm text-gray-600">Bulk Assignments</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              to="/department/settings"
              className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg"
            >
              <span className="text-sm text-gray-600">Settings</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </Link>
          </SummaryCard>
        </div>
      </div>
    </div>
  );
};

// ============================================
// REUSABLE COMPONENTS
// ============================================

const StatCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  bgColor,
  onClick,
}) => {
  const trendIcons = {
    up: <ArrowUpRight className="h-4 w-4 text-green-500" />,
    down: <ArrowDownRight className="h-4 w-4 text-red-500" />,
    warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
    critical: <AlertCircle className="h-4 w-4 text-red-500" />,
    good: <CheckCircle className="h-4 w-4 text-green-500" />,
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>{trendIcons[trend]}</div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center mt-2">
          <span
            className={`text-xs font-medium ${
              trend === "up" || trend === "good"
                ? "text-green-600"
                : trend === "down" || trend === "critical"
                ? "text-red-600"
                : "text-amber-600"
            }`}
          >
            {change}
          </span>
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  color,
  path,
  badge,
  badgeColor,
}) => {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
    },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
    },
  };

  const badgeColors = {
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
  };

  return (
    <Link
      to={path}
      className={`flex items-center justify-between p-4 rounded-lg border ${colors[color].border} hover:shadow-sm transition-all ${colors[color].bg}`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${colors[color].bg}`}>
          <Icon className={`h-5 w-5 ${colors[color].text}`} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="flex items-center">
        {badge && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              badgeColors[badgeColor || "blue"]
            } mr-2`}
          >
            {badge}
          </span>
        )}
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
};

const ActivityItem = ({ title, description, time, type, user, status }) => {
  const typeIcons = {
    assignment: BookOpen,
    workload: FileText,
    staff: Users,
    approval: CheckCircle,
    alert: AlertCircle,
    system: Settings,
  };

  const statusColors = {
    pending: "text-amber-600 bg-amber-50",
    completed: "text-green-600 bg-green-50",
    warning: "text-red-600 bg-red-50",
    in_progress: "text-blue-600 bg-blue-50",
  };

  const Icon = typeIcons[type] || Activity;

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className="p-2 rounded-full bg-blue-50">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        {user && <p className="text-xs text-gray-500 mt-1">By: {user}</p>}
      </div>
      <div className="text-right">
        <span className="text-xs text-gray-500 whitespace-nowrap block mb-1">
          {time}
        </span>
        {status && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, icon: Icon, color, children }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getRankColor = (rank) => {
  const colors = {
    Professor: "#8b5cf6",
    "Associate Professor": "#3b82f6",
    "Assistant Professor": "#10b981",
    Lecturer: "#f59e0b",
    "Assistant Lecturer": "#06b6d4",
    "Graduate Assistant": "#6b7280",
  };
  return colors[rank] || "#9ca3af";
};

const getWorkloadStatusColor = (status) => {
  const colors = {
    Underloaded: "text-blue-600",
    Balanced: "text-green-600",
    "Approaching Limit": "text-amber-600",
    Overloaded: "text-red-600",
    Critical: "text-red-800",
  };
  return colors[status] || "text-gray-600";
};

export default DepartmentDashboard;
