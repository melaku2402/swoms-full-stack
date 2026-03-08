// src/pages/workload/WorkloadReport.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import workloadReportAPI from "../../api/workloadReportAPI";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Printer,
  Filter,
  Calendar,
  Users,
  Clock,
  DollarSign,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  RefreshCw,
  FileText,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";

const WorkloadReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    semester_id: null,
    program_type: "",
    status: "",
    date_from: "",
    date_to: "",
  });
  const [semesters, setSemesters] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [activeTab, setActiveTab] = useState("overview");
  const [exporting, setExporting] = useState(false);
  const chartRef = useRef();

  useEffect(() => {
    fetchSemesters();
    fetchReport();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [filters.semester_id]);

  const fetchSemesters = async () => {
    try {
      const response = await workloadReportAPI.getAvailableSemesters();
      setSemesters(response.data || []);
      if (response.data && response.data.length > 0 && !filters.semester_id) {
        setFilters((prev) => ({
          ...prev,
          semester_id: response.data[0].semester_id,
        }));
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      toast.error("Failed to load semesters");
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filters.semester_id) params.semester_id = filters.semester_id;
      if (filters.program_type) params.program_type = filters.program_type;
      if (filters.status) params.status = filters.status;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
     
      const response = await workloadReportAPI.generateReport(params);

      console.log(response);
      
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load workload report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const response = await workloadReportAPI.exportReport(reportData, format);

      // Create download link
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        response.headers["content-disposition"]?.split("filename=")[1] ||
        `report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    fetchReport();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Chart colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  // Prepare chart data
  const prepareChartData = () => {
    if (!reportData) return [];

    const data = [
      {
        name: "RP Workloads",
        value: reportData.statistics?.rp?.total_workloads || 0,
        color: COLORS[0],
      },
      {
        name: "NRP Workloads",
        value: reportData.statistics?.nrp?.total_workloads || 0,
        color: COLORS[1],
      },
      {
        name: "Total Hours",
        value: reportData.statistics?.overall?.total_hours || 0,
        color: COLORS[2],
      },
      {
        name: "Total Payment",
        value: reportData.statistics?.overall?.total_payment || 0,
        color: COLORS[3],
      },
    ];

    return data;
  };

  // Prepare program distribution data
  const prepareProgramData = () => {
    if (!reportData?.breakdown?.by_program) return [];

    return Object.entries(reportData.breakdown.by_program).map(
      ([program, data], index) => ({
        name: program.toUpperCase(),
        value: data.workload_count || 0,
        payment: data.total_payment || 0,
        color: COLORS[index % COLORS.length],
      })
    );
  };

  // Prepare status distribution data
  const prepareStatusData = () => {
    if (!reportData?.breakdown?.by_status) return [];

    return reportData.breakdown.by_status.map((status, index) => ({
      name: status.status.replace("_", " ").toUpperCase(),
      value: status.total_count || 0,
      color: COLORS[index % COLORS.length],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workload report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Data Available
        </h3>
        <p className="text-gray-600">
          No workload data found for the selected filters.
        </p>
        <button
          onClick={fetchReport}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Workload Report</h1>
            <p className="text-blue-100">
              Comprehensive analysis of teaching workload and performance
              {reportData.report?.generated_at && (
                <span className="ml-2 text-sm">
                  • Generated:{" "}
                  {new Date(
                    reportData.report.generated_at
                  ).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <div className="relative">
              <select
                className="appearance-none bg-white/20 border border-white/30 rounded-lg py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-white"
                onChange={(e) => handleExport(e.target.value)}
                disabled={exporting}
              >
                <option value="">Export as...</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:text-blue-600 text-blue-600 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            Report Filters
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChartType("bar")}
              className={`p-2 rounded-lg ${
                chartType === "bar"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`p-2 rounded-lg ${
                chartType === "pie"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <PieChartIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-2 rounded-lg ${
                chartType === "line"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <LineChartIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.semester_id || ""}
              onChange={(e) =>
                handleFilterChange("semester_id", e.target.value)
              }
            >
              <option value="">All Semesters</option>
              {semesters.map((semester) => (
                <option key={semester.semester_id} value={semester.semester_id}>
                  {semester.semester_name} ({semester.year_code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.program_type}
              onChange={(e) =>
                handleFilterChange("program_type", e.target.value)
              }
            >
              <option value="">All Programs</option>
              <option value="extension">Extension</option>
              <option value="weekend">Weekend</option>
              <option value="summer">Summer</option>
              <option value="distance">Distance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {["overview", "rp", "nrp", "financial", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Workloads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.statistics?.overall?.total_workloads || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="text-blue-600 font-medium">
                  {reportData.statistics?.rp?.total_workloads || 0} RP
                </span>
                {" • "}
                <span className="text-green-600 font-medium">
                  {reportData.statistics?.nrp?.total_workloads || 0} NRP
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      reportData.statistics?.overall?.total_hours || 0
                    )}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Average:{" "}
                {(
                  reportData.statistics?.overall?.average_hours_per_staff || 0
                ).toFixed(1)}{" "}
                hours/staff
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Payment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      reportData.statistics?.overall?.total_payment || 0
                    )}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="text-green-600 font-medium">
                  {formatCurrency(
                    reportData.statistics?.nrp?.total_payment || 0
                  )}
                </span>
                {" NRP"}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.statistics?.overall?.staff_count || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Across {reportData.statistics?.overall?.department_count || 0}{" "}
                departments
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Workload Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "pie" ? (
                    <PieChart>
                      <Pie
                        data={prepareChartData()}
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
                        {prepareChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Value"]} />
                      <Legend />
                    </PieChart>
                  ) : chartType === "line" ? (
                    <LineChart data={prepareChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Value"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={prepareChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Value"]} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Program Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareProgramData()}
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
                      {prepareProgramData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "payment")
                          return [formatCurrency(value), "Payment"];
                        return [value, "Workloads"];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Workload Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {prepareStatusData().map((status, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 text-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <p className="text-lg font-bold text-gray-900">
                    {status.value}
                  </p>
                  <p className="text-sm text-gray-600">{status.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RP Tab */}
      {activeTab === "rp" && (
        <div className="space-y-6">
          {/* RP Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">RP Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Workloads:</span>
                  <span className="font-semibold">
                    {reportData.statistics?.rp?.total_workloads || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Hours:</span>
                  <span className="font-semibold">
                    {Math.round(reportData.statistics?.rp?.total_hours || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Load:</span>
                  <span className="font-semibold">
                    {(reportData.statistics?.rp?.average_load || 0).toFixed(1)}{" "}
                    hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Overpayment:</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(
                      reportData.statistics?.rp?.total_over_payment || 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* RP Recent Workloads */}
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Recent RP Workloads
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Course
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Staff
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Hours
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data?.rp_workloads
                      ?.slice(0, 5)
                      .map((workload, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">
                              {workload.course_code}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {workload.first_name} {workload.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {workload.employee_id}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">
                              {workload.total_load}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                workload.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : workload.status === "submitted"
                                  ? "bg-blue-100 text-blue-800"
                                  : workload.status === "draft"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {workload.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(workload.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NRP Tab */}
      {activeTab === "nrp" && (
        <div className="space-y-6">
          {/* NRP Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                NRP Financial Summary
              </h3>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Total NRP Payment</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {formatCurrency(
                          reportData.statistics?.nrp?.total_payment || 0
                        )}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Payment:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        reportData.statistics?.nrp?.average_payment || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Hours:</span>
                    <span className="font-semibold">
                      {Math.round(reportData.statistics?.nrp?.total_hours || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Workloads:</span>
                    <span className="font-semibold">
                      {reportData.statistics?.nrp?.total_workloads || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Program Type Breakdown
              </h3>
              <div className="space-y-4">
                {reportData.breakdown?.by_program?.map((program, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {program.program_type}
                      </span>
                      <span className="font-bold text-purple-600">
                        {program.workload_count} workloads
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatCurrency(program.total_payment)}</span>
                      <span>{program.total_hours} hours</span>
                      <span>{program.staff_count} staff</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Department Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Department Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Department
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Staff
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      RP Workloads
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      NRP Workloads
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Total Hours
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Total Payment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.breakdown?.by_department?.map((dept, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {dept.department_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dept.department_code}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium">
                          {dept.staff_count}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{dept.rp_count}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{dept.nrp_count}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          {Math.round(dept.total_hours)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-emerald-600">
                          {formatCurrency(dept.total_payment)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              Recommendations & Insights
            </h3>
            <div className="space-y-3">
              {reportData.report?.recommendations?.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div
                    className={`p-1.5 rounded-full ${
                      rec.type === "warning"
                        ? "bg-yellow-100 text-yellow-600"
                        : rec.type === "financial"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{rec.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                    <p className="text-xs text-blue-600 mt-2">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Report generated for:{" "}
          {reportData.user_context?.generated_by || "Unknown User"}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/workload/rp")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            View RP Workloads
          </button>
          <button
            onClick={() => navigate("/workload/nrp")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            View NRP Workloads
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Download Full Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkloadReport;
