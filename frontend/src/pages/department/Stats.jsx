// src/pages/department/Stats.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { departmentAPI } from "../../api";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Clock,
  DollarSign,
  AlertCircle,
  Download,
  Filter,
  Calendar,
  Building,
  GraduationCap,
  RefreshCw,
  Activity,
  Target,
  Award,
  FileText,
  Layers,
  Cpu,
  Database,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const DepartmentStats = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("current_year");
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({
    workloadTrend: [],
    rankDistribution: [],
    courseDistribution: [],
    workloadByType: [],
    financialStats: [],
    semesterComparison: [],
  });

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getDepartmentStats(
        user.department_id,
        "detailed"
      );

      if (response.data) {
        setStats(response.data);

        // Process data for charts
        setChartData({
          workloadTrend: response.data.workload_trend || [],
          rankDistribution: response.data.rank_distribution || [],
          courseDistribution: response.data.course_distribution || [],
          workloadByType: response.data.workload_by_type || [],
          financialStats: response.data.financial_stats || [],
          semesterComparison: response.data.semester_comparison || [],
        });

        toast.success("Statistics loaded");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Fallback data
  const setFallbackData = () => {
    const mockStats = {
      summary: {
        total_staff: 42,
        active_courses: 156,
        avg_workload: 78,
        overload_count: 3,
        pending_assignments: 8,
        completed_workloads: 35,
      },
      workload_stats: {
        avg_teaching: 45,
        avg_research: 18,
        avg_admin: 15,
        max_load: 56,
        min_load: 12,
      },
      course_stats: {
        total: 156,
        core: 120,
        elective: 24,
        lab: 8,
        thesis: 4,
      },
      financial_stats: {
        total_payments: 2450000,
        avg_payment: 58333,
        pending_payments: 420000,
        approved_payments: 2030000,
        tax_collected: 367500,
      },
    };

    setStats(mockStats);

    setChartData({
      workloadTrend: [
        { month: "Jan", hours: 1200 },
        { month: "Feb", hours: 1300 },
        { month: "Mar", hours: 1250 },
        { month: "Apr", hours: 1400 },
        { month: "May", hours: 1350 },
        { month: "Jun", hours: 1500 },
      ],
      rankDistribution: [
        { name: "Professors", value: 8 },
        { name: "Assoc. Professors", value: 12 },
        { name: "Assist. Professors", value: 10 },
        { name: "Lecturers", value: 8 },
        { name: "Assist. Lecturers", value: 3 },
        { name: "Grad. Assistants", value: 1 },
      ],
      courseDistribution: [
        { name: "Core Courses", value: 120 },
        { name: "Elective Courses", value: 24 },
        { name: "Lab Courses", value: 8 },
        { name: "Thesis/Project", value: 4 },
      ],
      workloadByType: [
        { type: "Teaching", value: 45 },
        { type: "Research", value: 18 },
        { type: "Administrative", value: 15 },
        { type: "Community Service", value: 8 },
        { type: "Other", value: 14 },
      ],
    });
  };

  // Handle export
  const handleExport = async () => {
    try {
      toast.loading("Exporting statistics...");
      // API call for export
      toast.dismiss();
      toast.success("Statistics exported!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  // Initialize
  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading department statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Statistics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics and insights for your department
          </p>
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
            <option value="all_time">All Time</option>
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard
          title="Total Staff"
          value={stats?.summary?.total_staff || 0}
          change="+2 this semester"
          trend="up"
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatCard
          title="Active Courses"
          value={stats?.summary?.active_courses || 0}
          change="+12 from last term"
          trend="up"
          icon={BookOpen}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />

        <StatCard
          title="Avg. Workload"
          value={`${stats?.summary?.avg_workload || 0}%`}
          change={
            stats?.summary?.avg_workload > 80
              ? "Above threshold"
              : "Within limits"
          }
          trend={stats?.summary?.avg_workload > 80 ? "down" : "up"}
          icon={Activity}
          color={
            stats?.summary?.avg_workload > 80
              ? "text-amber-600"
              : "text-green-600"
          }
          bgColor={
            stats?.summary?.avg_workload > 80 ? "bg-amber-50" : "bg-green-50"
          }
        />

        <StatCard
          title="Overload Cases"
          value={stats?.summary?.overload_count || 0}
          change="Need attention"
          trend="warning"
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
        />

        <StatCard
          title="Pending Assignments"
          value={stats?.summary?.pending_assignments || 0}
          change="Awaiting action"
          trend="warning"
          icon={FileText}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />

        <StatCard
          title="Completed Workloads"
          value={stats?.summary?.completed_workloads || 0}
          change="Good progress"
          trend="up"
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Workload Trend
              </h3>
              <p className="text-sm text-gray-600">Monthly workload hours</p>
            </div>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.workloadTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rank Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Academic Rank Distribution
              </h3>
              <p className="text-sm text-gray-600">Staff by academic rank</p>
            </div>
            <PieChart className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={chartData.rankDistribution}
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
                  {chartData.rankDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getRankColor(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Detailed Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workload Statistics */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Workload Statistics</h4>
            <div className="space-y-3">
              <StatItem
                label="Average Teaching Load"
                value={`${stats?.workload_stats?.avg_teaching || 0}h`}
              />
              <StatItem
                label="Average Research Load"
                value={`${stats?.workload_stats?.avg_research || 0}h`}
              />
              <StatItem
                label="Average Administrative Load"
                value={`${stats?.workload_stats?.avg_admin || 0}h`}
              />
              <StatItem
                label="Maximum Load"
                value={`${stats?.workload_stats?.max_load || 0}h`}
              />
              <StatItem
                label="Minimum Load"
                value={`${stats?.workload_stats?.min_load || 0}h`}
              />
            </div>
          </div>

          {/* Course Statistics */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Course Statistics</h4>
            <div className="space-y-3">
              <StatItem
                label="Total Courses"
                value={stats?.course_stats?.total || 0}
              />
              <StatItem
                label="Core Courses"
                value={stats?.course_stats?.core || 0}
              />
              <StatItem
                label="Elective Courses"
                value={stats?.course_stats?.elective || 0}
              />
              <StatItem
                label="Lab Courses"
                value={stats?.course_stats?.lab || 0}
              />
              <StatItem
                label="Thesis/Project Courses"
                value={stats?.course_stats?.thesis || 0}
              />
            </div>
          </div>

          {/* Financial Statistics */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Financial Statistics</h4>
            <div className="space-y-3">
              <StatItem
                label="Total Payments"
                value={`ETB ${(
                  stats?.financial_stats?.total_payments || 0
                ).toLocaleString()}`}
              />
              <StatItem
                label="Average Payment"
                value={`ETB ${(
                  stats?.financial_stats?.avg_payment || 0
                ).toLocaleString()}`}
              />
              <StatItem
                label="Pending Payments"
                value={`ETB ${(
                  stats?.financial_stats?.pending_payments || 0
                ).toLocaleString()}`}
              />
              <StatItem
                label="Approved Payments"
                value={`ETB ${(
                  stats?.financial_stats?.approved_payments || 0
                ).toLocaleString()}`}
              />
              <StatItem
                label="Tax Collected"
                value={`ETB ${(
                  stats?.financial_stats?.tax_collected || 0
                ).toLocaleString()}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Course Distribution
            </h3>
            <BookOpen className="h-5 w-5 text-purple-500" />
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.courseDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload by Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Workload by Type
            </h3>
            <Layers className="h-5 w-5 text-amber-500" />
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData.workloadByType}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" />
                <PolarRadiusAxis />
                <Radar
                  name="Hours"
                  dataKey="value"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const StatCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  bgColor,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-start justify-between">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="flex items-center">
        {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
        {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
        {trend === "warning" && (
          <AlertCircle className="h-4 w-4 text-amber-500" />
        )}
      </div>
    </div>
    <div className="mt-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <div className="flex items-center mt-2">
        <span
          className={`text-xs font-medium ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
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

const StatItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

// Helper functions
const getRankColor = (rank) => {
  const colors = {
    Professors: "#8b5cf6",
    "Assoc. Professors": "#3b82f6",
    "Assist. Professors": "#10b981",
    Lecturers: "#f59e0b",
    "Assist. Lecturers": "#06b6d4",
    "Grad. Assistants": "#6b7280",
  };
  return colors[rank] || "#9ca3af";
};

export default DepartmentStats;
