


// src/pages/workload/WorkloadDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  FileText,
  Calendar,
  Users,
  DollarSign,
  ChevronRight,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Check,
  X,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import workloadAPI from '../../api/workload';
import semesterAPI from '../../api';
import staffAPI from '../../api/staffAPI';

const WorkloadDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    rpHours: 0,
    nrpHours: 0,
    assignments: 0,
    pendingApprovals: 0,
    overloadPercentage: 0,
    paymentEstimate: 0
  });
  const [assignments, setAssignments] = useState([]);
  const [rpWorkloads, setRpWorkloads] = useState([]);
  const [nrpWorkloads, setNrpWorkloads] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get staff profile
      const user = JSON.parse(localStorage.getItem('swoms_user'));
      const staffResponse = await staffAPI.getStaffByUserId(user.user_id);
      setStaffProfile(staffResponse.data);

      // Get active semester
      const semesterResponse = await semesterAPI.getActiveSemester();
      setActiveSemester(semesterResponse.data);

      // Fetch all dashboard data
      const [statsRes, assignmentsRes, rpRes, nrpRes] = await Promise.all([
        workloadAPI.getDashboardStats(),
        workloadAPI.getMyAssignments({ limit: 5 }),
        workloadAPI.getRPWorkload({ limit: 3 }),
        workloadAPI.getNRPWorkload({ limit: 3 })
      ]);

      setStats(statsRes.data || {});
      setAssignments(assignmentsRes.data?.assignments || []);
      setRpWorkloads(rpRes.data?.workloads || []);
      setNrpWorkloads(nrpRes.data?.workloads || []);

      // Simulate recent activity
      const activity = [
        ...(assignmentsRes.data?.assignments?.slice(0, 2) || []).map(a => ({
          type: 'assignment',
          title: `New assignment: ${a.course_code}`,
          time: '2 hours ago',
          status: a.status
        })),
        ...(rpRes.data?.workloads?.slice(0, 2) || []).map(w => ({
          type: 'workload',
          title: `RP workload ${w.status}`,
          time: '1 day ago',
          status: w.status
        }))
      ];
      setRecentActivity(activity);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading workload dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workload Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your teaching assignments, workload, and payments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <Link
            to="/workload/summary"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>View Summary</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalHours || 0}h</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">This semester</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${Math.min(stats.overloadPercentage || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Assignments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.assignments || 0}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Active courses</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pending: {assignments.filter(a => a.status === 'assigned').length}</span>
              <Link to="/workload/assignments/approve" className="text-blue-600 hover:text-blue-800">
                Review →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Approvals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingApprovals || 0}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Waiting review</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <span className="text-gray-600">40% complete</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Payment Estimate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.paymentEstimate || 0)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">This month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                to="/workload/assignments"
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </div>
                <p className="font-medium text-gray-900">My Assignments</p>
                <p className="text-sm text-gray-500">View all courses</p>
              </Link>

              <Link
                to="/workload/assignments/approve"
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                </div>
                <p className="font-medium text-gray-900">Approve/Decline</p>
                <p className="text-sm text-gray-500">Review assignments</p>
              </Link>

              <Link
                to="/workload/rp/create"
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                </div>
                <p className="font-medium text-gray-900">Add RP Workload</p>
                <p className="text-sm text-gray-500">Regular program</p>
              </Link>

              <Link
                to="/workload/nrp/create"
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600" />
                </div>
                <p className="font-medium text-gray-900">Add NRP Workload</p>
                <p className="text-sm text-gray-500">Non-regular program</p>
              </Link>
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
                <Link to="/workload/assignments" className="text-sm text-blue-600 hover:text-blue-800">
                  View all →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.assignment_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{assignment.course_code} - {assignment.course_title}</h3>
                          <p className="text-sm text-gray-500">
                            {assignment.section_code} • {assignment.student_count || 0} students
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                        <Link
                          to={`/workload/assignments/${assignment.assignment_id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No assignments found</p>
                  <p className="text-sm text-gray-400 mt-1">You haven't been assigned any courses yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Status & Activity */}
        <div className="space-y-6">
          {/* Overload Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Overload Status</h2>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={stats.overloadPercentage > 100 ? '#ef4444' : '#10b981'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(stats.overloadPercentage, 100) * 2.83} 283`}
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dy="0.3em"
                      className="text-2xl font-bold"
                      fill={stats.overloadPercentage > 100 ? '#ef4444' : '#111827'}
                    >
                      {Math.round(stats.overloadPercentage)}%
                    </text>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {stats.overloadPercentage > 100 ? 'Overloaded' : 'Within Limits'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.overloadPercentage > 100 
                    ? 'You are exceeding your workload capacity'
                    : 'Your current workload is manageable'
                  }
                </p>
              </div>
              <button
                onClick={() => workloadAPI.checkOverload()}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check Detailed Analysis
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'assignment' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {activity.type === 'assignment' ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">RP Workloads</span>
                <span className="font-semibold text-gray-900">{rpWorkloads.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">NRP Workloads</span>
                <span className="font-semibold text-gray-900">{nrpWorkloads.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Courses</span>
                <span className="font-semibold text-gray-900">
                  {assignments.filter(a => a.status === 'accepted').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Review</span>
                <span className="font-semibold text-amber-600">
                  {assignments.filter(a => a.status === 'assigned').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadDashboard;