

// src/components/dashboard/InstructorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../../contexts/AuthContext";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  DollarSign,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  BookOpen,
  FileText,
  CheckSquare,
  Loader,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  Receipt,
  Eye,
  Download,
  Upload,
  Filter,
  Search,
  ChevronDown,
  MoreHorizontal,
  Send,
  X,
  Save,
  Calculator,
  User
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Import all the APIs
import apiClient, {
  workloadAPI,
  workloadRPAPI,
  workloadNRPAPI,
  courseAPI,
  courseAssignmentAPI,
  courseRequestAPI,
  paymentAPI,
  overloadDetectionAPI,
  academicAPI,
  staffAPI,
  systemAPI,
  exportAPI
} from "../../../api";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dashboard States
  const [dashboardStats, setDashboardStats] = useState({
    overview: null,
    workload: null,
    payments: null,
    overload: null,
    courses: null
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [workloadData, setWorkloadData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [overloadData, setOverloadData] = useState(null);
  const [chartData, setChartData] = useState({
    workloadDistribution: [],
    paymentTrends: [],
    courseLoad: []
  });

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch multiple data sources in parallel
      const [
        workloadRes,
        paymentRes,
        overloadRes,
        coursesRes,
        activitiesRes,
        assignmentsRes
      ] = await Promise.allSettled([
        // Workload Data
        workloadRPAPI.getMyWorkloadDashboard(),
        workloadAPI.getWorkloadRP({ status: 'active', limit: 5 }),
        
        // Payment Data
        paymentAPI.getMyPayments({ limit: 5 }),
        paymentAPI.getPaymentStats(),
        
        // Overload Data
        overloadDetectionAPI.checkMyOverload(),
        
        // Course Data
        courseAPI.getMyCourses(),
        courseAssignmentAPI.getMyAssignments(),
        
        // Recent Activities
        systemAPI.getRecentActivities({ limit: 10 }),
        
        // Course Requests
        courseRequestAPI.getMyRequests({ limit: 5 })
      ]);

      // Process workload data
      const workloadStats = workloadRes.status === 'fulfilled' ? workloadRes.value.data : null;
      const workloadList = assignmentsRes.status === 'fulfilled' ? assignmentsRes.value.data : [];
      
      if (workloadStats) {
        setWorkloadData(workloadStats);
        
        // Prepare chart data for workload distribution
        const workloadChartData = [
          { name: 'Lectures', hours: workloadStats.lecture_hours || 0, color: '#3b82f6' },
          { name: 'Labs', hours: workloadStats.lab_hours || 0, color: '#10b981' },
          { name: 'Tutorials', hours: workloadStats.tutorial_hours || 0, color: '#f59e0b' },
          { name: 'Administrative', hours: workloadStats.admin_hours || 0, color: '#8b5cf6' }
        ];
        setChartData(prev => ({
          ...prev,
          workloadDistribution: workloadChartData
        }));
      }

      // Process payment data
      if (paymentRes.status === 'fulfilled') {
        const paymentStats = paymentRes.value.data;
        setPaymentData(paymentStats);
        
        // Prepare payment trend data (last 6 months)
        if (paymentStats.trends) {
          setChartData(prev => ({
            ...prev,
            paymentTrends: paymentStats.trends
          }));
        }
      }

      // Process overload data
      if (overloadRes.status === 'fulfilled') {
        const overloadStats = overloadRes.value.data;
        setOverloadData(overloadStats);
        
        // Generate recommendations
        const recommendations = generateOverloadRecommendations(overloadStats);
        setDashboardStats(prev => ({
          ...prev,
          overload: {
            ...overloadStats,
            recommendations
          }
        }));
      }

      // Process course data
      if (coursesRes.status === 'fulfilled') {
        const courseStats = coursesRes.value.data;
        setDashboardStats(prev => ({
          ...prev,
          courses: courseStats
        }));
      }

      // Set recent activities
      if (activitiesRes.status === 'fulfilled') {
        setRecentActivities(activitiesRes.value.data || []);
      }

      // Set upcoming deadlines from assignments
      if (assignmentsRes.status === 'fulfilled') {
        const deadlines = processDeadlines(assignmentsRes.value.data || []);
        setUpcomingDeadlines(deadlines);
      }

      // Calculate summary statistics
      calculateSummaryStats();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Generate overload recommendations
  const generateOverloadRecommendations = (overloadData) => {
    if (!overloadData) return [];
    
    const recommendations = [];
    const { current_load, max_load } = overloadData;
    const loadPercentage = (current_load / max_load) * 100;

    if (loadPercentage > 100) {
      recommendations.push({
        type: 'critical',
        message: 'You are currently overloaded. Consider requesting workload reduction.',
        action: '/workload/assignments/approve'
      });
    } else if (loadPercentage > 90) {
      recommendations.push({
        type: 'warning',
        message: 'You are approaching overload limit. Monitor your workload carefully.',
        action: '/overload/check'
      });
    }

    if (overloadData.upcoming_courses > 3) {
      recommendations.push({
        type: 'info',
        message: `You have ${overloadData.upcoming_courses} upcoming course requests.`,
        action: '/course-requests/my'
      });
    }

    return recommendations.slice(0, 3);
  };

  // Process deadlines from assignments
  const processDeadlines = (assignments) => {
    if (!assignments.length) return [];
    
    return assignments
      .filter(assignment => assignment.deadline)
      .map(assignment => ({
        id: assignment.assignment_id,
        title: assignment.course_title,
        deadline: assignment.deadline,
        type: assignment.type || 'assignment',
        status: getDeadlineStatus(assignment.deadline),
        link: `/workload/assignments/${assignment.assignment_id}`
      }))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  };

  // Calculate deadline status
  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 1) return 'urgent';
    if (diffDays <= 3) return 'approaching';
    return 'upcoming';
  };

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    const stats = {
      totalWorkloadHours: workloadData?.total_hours || 0,
      pendingApprovals: workloadData?.pending_approvals || 0,
      totalPayments: paymentData?.total_amount || 0,
      overloadPercentage: overloadData?.load_percentage || 0,
      activeCourses: dashboardStats.courses?.active_courses || 0,
      studentsCount: dashboardStats.courses?.total_students || 0,
      completionRate: dashboardStats.courses?.completion_rate || 0,
      upcomingDeadlines: upcomingDeadlines.length
    };
    
    setDashboardStats(prev => ({
      ...prev,
      overview: stats
    }));
  };

  // Handle quick actions
  const handleQuickAction = async (action) => {
    switch(action) {
      case 'refresh':
        setRefreshKey(prev => prev + 1);
        toast.success('Refreshing data...');
        await fetchDashboardData();
        break;
        
      case 'export':
        try {
          toast.loading('Exporting data...');
          await exportAPI.exportDashboard('excel');
          toast.success('Export completed!');
        } catch (error) {
          toast.error('Export failed');
        }
        break;
        
      case 'submit_all':
        // Implement bulk submission logic
        toast.success('All pending items submitted for approval');
        break;
    }
  };

  // Handle assignment action
  const handleAssignmentAction = async (assignmentId, action) => {
    try {
      switch(action) {
        case 'accept':
          await courseAssignmentAPI.acceptAssignment(assignmentId);
          toast.success('Assignment accepted');
          break;
        case 'decline':
          await courseAssignmentAPI.declineAssignment(assignmentId, 'Busy schedule');
          toast.success('Assignment declined');
          break;
        case 'view':
          // Navigation handled by Link
          break;
      }
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${action} assignment`);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time remaining
  const formatTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    return `${Math.floor(diffDays / 30)} months`;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      urgent: 'bg-orange-100 text-orange-800',
      approaching: 'bg-yellow-100 text-yellow-800',
      upcoming: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      overdue: AlertCircle,
      urgent: AlertCircle,
      approaching: Clock
    };
    return icons[status] || CheckCircle;
  };

  // Load data on mount and when refreshKey changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshKey]);

  // Main dashboard content
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Instructor'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your workload and payment overview for this semester.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuickAction('refresh')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          
          <button
            onClick={() => handleQuickAction('export')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'workload', 'payments', 'courses', 'alerts', 'new-workload'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Workload Hours"
              value={dashboardStats.overview?.totalWorkloadHours || 0}
              change="+2.5%"
              changeType="positive"
              icon={Clock}
              color="blue"
              link="/workload"
            />
            
            <StatCard
              title="Pending Approvals"
              value={dashboardStats.overview?.pendingApprovals || 0}
              change="Requires attention"
              changeType="warning"
              icon={AlertCircle}
              color="amber"
              link="/workload/assignments/approve"
            />
            
            <StatCard
              title="Total Payments"
              value={formatCurrency(dashboardStats.overview?.totalPayments || 0)}
              change="+12.3%"
              changeType="positive"
              icon={DollarSign}
              color="green"
              link="/payments"
            />
            
            <StatCard
              title="Overload Level"
              value={`${dashboardStats.overview?.overloadPercentage || 0}%`}
              change="Approaching limit"
              changeType={dashboardStats.overview?.overloadPercentage > 90 ? 'negative' : 'positive'}
              icon={TrendingUp}
              color={dashboardStats.overview?.overloadPercentage > 90 ? 'red' : 'blue'}
              link="/overload/check"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workload Distribution Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Workload Distribution</h3>
                <Link to="/workload" className="text-sm text-blue-600 hover:text-blue-800">
                  View Details
                </Link>
              </div>
              
              {chartData.workloadDistribution.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.workloadDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="hours"
                      >
                        {chartData.workloadDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} hours`, 'Hours']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No workload data available
                </div>
              )}
            </div>

            {/* Payment Trends Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Trends</h3>
                <Link to="/payments/history" className="text-sm text-blue-600 hover:text-blue-800">
                  View History
                </Link>
              </div>
              
              {chartData.paymentTrends.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.paymentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                      <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No payment trend data available
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <QuickActionLink
                    icon={FolderOpen}
                    title="Submit Workload"
                    description="Submit your current workload for approval"
                    link="/workload"
                    color="blue"
                  />
                  <QuickActionLink
                    icon={Receipt}
                    title="View Payment Sheets"
                    description="Check your payment sheets and status"
                    link="/payments/sheets"
                    color="green"
                  />
                  <QuickActionLink
                    icon={BookOpen}
                    title="Request Course"
                    description="Request new course assignment"
                    link="/course-requests/create"
                    color="purple"
                  />
                  <QuickActionLink
                    icon={Eye}
                    title="Check Overload"
                    description="Monitor your current overload status"
                    link="/overload/check"
                    color="amber"
                  />
                  <QuickActionLink
                    icon={Download}
                    title="Export Reports"
                    description="Download your workload and payment reports"
                    onClick={() => handleQuickAction('export')}
                    color="indigo"
                  />
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                  <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800">
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity, index) => (
                      <ActivityItem key={index} activity={activity} />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activities</p>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
                  <Link to="/workload/assignments" className="text-sm text-blue-600 hover:text-blue-800">
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((deadline) => (
                      <DeadlineItem key={deadline.id} deadline={deadline} />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workload Tab */}
      {activeTab === 'workload' && (
        <WorkloadTab
          workloadData={workloadData}
          onRefresh={() => handleQuickAction('refresh')}
        />
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <PaymentsTab
          paymentData={paymentData}
          onRefresh={() => handleQuickAction('refresh')}
        />
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <CoursesTab
          coursesData={dashboardStats.courses}
          assignments={workloadData?.assignments || []}
          onRefresh={() => handleQuickAction('refresh')}
        />
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <AlertsTab
          overloadData={overloadData}
          recommendations={dashboardStats.overload?.recommendations || []}
          pendingApprovals={dashboardStats.overview?.pendingApprovals || 0}
          onRefresh={() => handleQuickAction('refresh')}
        />
      )}

      {/* New Workload Tab */}
      {activeTab === 'new-workload' && (
        <NewWorkloadTab />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, changeType, icon: Icon, color, link }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  const changeColorClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    warning: 'text-amber-600'
  };

  return (
    <Link to={link} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${changeColorClasses[changeType]}`}>
                {change}
              </span>
            </div>
          </div>
          <div className={`p-3 ${colorClasses[color]} rounded-lg`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                changeType === 'positive' ? 'bg-green-500' :
                changeType === 'negative' ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: '70%' }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Quick Action Link Component
const QuickActionLink = ({ icon: Icon, title, description, link, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  const Wrapper = link ? Link : 'button';
  const props = link ? { to: link } : { onClick, type: 'button' };

  return (
    <Wrapper
      {...props}
      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all w-full text-left"
    >
      <div className={`p-2 ${colorClasses[color]} rounded-lg mr-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </Wrapper>
  );
};

// Activity Item Component
const ActivityItem = ({ activity }) => {
  const Icon = getStatusIcon(activity.type);
  
  return (
    <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-600">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
      {activity.link && (
        <Link to={activity.link} className="text-blue-600 hover:text-blue-800">
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
};

// Deadline Item Component
const DeadlineItem = ({ deadline }) => {
  const statusColor = getStatusColor(deadline.status);
  const StatusIcon = getStatusIcon(deadline.status);
  const timeRemaining = formatTimeRemaining(deadline.deadline);
  
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${statusColor}`}>
          <StatusIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{deadline.title}</p>
          <p className="text-sm text-gray-500">
            Due: {formatDate(deadline.deadline)} ({timeRemaining})
          </p>
        </div>
      </div>
      <Link to={deadline.link} className="text-blue-600 hover:text-blue-800">
        <Eye className="h-4 w-4" />
      </Link>
    </div>
  );
};

// Workload Tab Component
const WorkloadTab = ({ workloadData, onRefresh }) => {
  const [showAll, setShowAll] = useState(false);

  if (!workloadData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No workload data available</p>
      </div>
    );
  }

  const assignments = showAll ? workloadData.assignments : workloadData.assignments?.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Workload</h2>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Hours</span>
              <span className="font-semibold">{workloadData.total_hours} hrs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Regular Program</span>
              <span className="font-semibold">{workloadData.rp_hours || 0} hrs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">NRP Program</span>
              <span className="font-semibold">{workloadData.nrp_hours || 0} hrs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workloadData.status)}`}>
                {workloadData.status}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Course Assignments</h3>
              <Link to="/workload/assignments" className="text-blue-600 hover:text-blue-800 text-sm">
                View All
              </Link>
            </div>

            {assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{assignment.course_code} - {assignment.course_title}</p>
                        <p className="text-sm text-gray-500">{assignment.section_code} • {assignment.credit_hours} credits</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{assignment.hours} hrs</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                      <Link to={`/workload/assignments/${assignment.id}`}>
                        <Eye className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No assignments found</p>
            )}

            {workloadData.assignments && workloadData.assignments.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showAll ? 'Show Less' : 'Show All Assignments'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/workload/assignments/approve"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <CheckSquare className="h-5 w-5 text-amber-600" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900">Approve/Decline</p>
            <p className="text-sm text-gray-500">Review pending assignments</p>
          </Link>

          <Link
            to="/workload/rp"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900">Regular Program</p>
            <p className="text-sm text-gray-500">View RP workload</p>
          </Link>

          <Link
            to="/workload/nrp"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900">NRP Workload</p>
            <p className="text-sm text-gray-500">View additional programs</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Payments Tab Component
const PaymentsTab = ({ paymentData, onRefresh }) => {
  const [filter, setFilter] = useState({
    academicYear: '2024-25',
    status: 'all',
    type: 'all',
    search: ''
  });

  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: 1,
      period: "Oct 2024",
      periodDetails: "Ref: PY-2024-10-001",
      paymentType: "Regular Load",
      workload: "12.0 Hours Standard",
      grossAmount: 14647.05,
      tax: 2197.05,
      netPay: 12450.00,
      status: "pending",
      datePaid: null,
      type: "regular"
    },
    {
      id: 2,
      period: "Sep 2024",
      periodDetails: "Ref: PY-2024-09-001",
      paymentType: "Regular Load",
      workload: "12.0 Hours Standard",
      grossAmount: 14647.05,
      tax: 2197.05,
      netPay: 12450.00,
      status: "paid",
      datePaid: "Sep 28, 2024",
      type: "regular"
    },
    {
      id: 3,
      period: "Aug 2024",
      periodDetails: "Ref: PY-2024-08-001",
      paymentType: "Overload",
      workload: "8.0 Hours Additional",
      grossAmount: 9800.00,
      tax: 1470.00,
      netPay: 8330.00,
      status: "paid",
      datePaid: "Aug 30, 2024",
      type: "overload"
    },
    {
      id: 4,
      period: "Jul 2024",
      periodDetails: "Ref: PY-2024-07-001",
      paymentType: "Summer Program",
      workload: "20.0 Hours Intensive",
      grossAmount: 24500.00,
      tax: 3675.00,
      netPay: 20825.00,
      status: "paid",
      datePaid: "Jul 31, 2024",
      type: "summer"
    }
  ]);

  const [summaryData, setSummaryData] = useState({
    totalEarned: 145200,
    totalEarnedChange: "+12%",
    pendingPayment: 12450,
    pendingDueDate: "Oct 30, 2024",
    totalTax: 21780,
    taxRate: "15%",
    paymentRate: 350,
    paymentRateDetails: "Based on Associate Professor rank"
  });

  // Format currency for Ethiopian Birr
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      paid: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status text
  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Filter payment history
  const filteredPayments = paymentHistory.filter(payment => {
    // Filter by search term
    if (filter.search && !payment.period.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    // Filter by status
    if (filter.status !== 'all' && payment.status !== filter.status) {
      return false;
    }
    // Filter by type
    if (filter.type !== 'all' && payment.type !== filter.type) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-1">
          Track your regular, overload, and summer program payments
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earned Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Earned (YTD)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summaryData.totalEarned)}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-green-600">
                ➤ {summaryData.totalEarnedChange} vs last academic year
              </span>
            </div>
          </div>
        </div>

        {/* Pending Payment Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Payment</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summaryData.pendingPayment)}
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-amber-600">
                ➤ Expected by {summaryData.pendingDueDate}
              </span>
            </div>
          </div>
        </div>

        {/* Total Tax Withheld Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Tax Withheld</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summaryData.totalTax)}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-600">
                ➤ Flat rate {summaryData.taxRate} applied
              </span>
            </div>
          </div>
        </div>

        {/* Payment Rate Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Payment Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ETB {summaryData.paymentRate}/hr
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-purple-600">
                ➤ {summaryData.paymentRateDetails}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search payments..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Calendar className="h-4 w-4 mr-1.5" />
              Academic Year {filter.academicYear}
            </div>
            
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
            </select>
            
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="regular">Regular Load</option>
              <option value="overload">Overload</option>
              <option value="summer">Summer Program</option>
            </select>
            
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  REFERENCE / PERIOD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PAYMENT TYPE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WORKLOAD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GROSS AMOUNT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TAX (15%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NET PAY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATE PAID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{payment.period}</div>
                      <div className="text-sm text-gray-500">{payment.periodDetails}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.paymentType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.workload}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.grossAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.tax)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.netPay)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.datePaid || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {/* View details */}}
                      >
                        View
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {/* Download receipt */}}
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredPayments.length}</span> of{" "}
            <span className="font-medium">{paymentHistory.length}</span> payments
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {/* Previous page */}}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">Page 1 of 1</span>
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {/* Next page */}}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Payment Schedule</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Regular payments processed at the end of each month
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Overload payments processed separately
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Summer program payments upon course completion
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tax Information</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Receipt className="h-4 w-4 text-blue-500 mr-2" />
                15% income tax deducted at source
              </li>
              <li className="flex items-center">
                <Receipt className="h-4 w-4 text-blue-500 mr-2" />
                Tax receipts available for download
              </li>
              <li className="flex items-center">
                <Receipt className="h-4 w-4 text-blue-500 mr-2" />
                Year-end tax certificate provided in January
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Need Help?</h4>
              <p className="text-sm text-gray-600">
                Contact the finance department for payment-related inquiries
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export Statements
              </button>
              <Link
                to="/payments/support"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Courses Tab Component
const CoursesTab = ({ coursesData, assignments, onRefresh }) => {
  const [activeCourses, setActiveCourses] = useState([]);

  useEffect(() => {
    if (assignments) {
      const active = assignments.filter(a => a.status === 'accepted' || a.status === 'assigned');
      setActiveCourses(active);
    }
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Courses */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Courses</h3>
            <Link to="/course-requests/available" className="text-blue-600 hover:text-blue-800 text-sm">
              Request More
            </Link>
          </div>

          {activeCourses.length > 0 ? (
            <div className="space-y-4">
              {activeCourses.map((course) => (
                <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-900">{course.course_code}</span>
                        <span className="text-sm text-gray-500">• {course.credit_hours} credits</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{course.course_title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Section: {course.section_code} • Students: {course.student_count || 0}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">{course.hours} hours/week</span>
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                    <Link to={`/courses/${course.course_id}`}>
                      <Eye className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No active courses assigned</p>
              <Link
                to="/course-requests/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Request Courses
              </Link>
            </div>
          )}
        </div>

        {/* Course Requests & Statistics */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Requests</h3>
            <div className="space-y-4">
              <Link
                to="/course-requests/create"
                className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Request New Course</p>
                  <p className="text-sm text-gray-500">Request assignment to a new course</p>
                </div>
              </Link>
              
              <Link
                to="/course-requests/my"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm"
              >
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">My Requests</p>
                    <span className="text-sm text-gray-500">View status</span>
                  </div>
                  <p className="text-sm text-gray-500">Check your course request status</p>
                </div>
              </Link>
              
              <Link
                to="/course-requests/available"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm"
              >
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Available Courses</p>
                  <p className="text-sm text-gray-500">Browse courses available for request</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Course Statistics */}
          {coursesData && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Courses</span>
                  <span className="font-semibold">{coursesData.total_courses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Courses</span>
                  <span className="font-semibold">{coursesData.active_courses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Students</span>
                  <span className="font-semibold">{coursesData.total_students || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Class Size</span>
                  <span className="font-semibold">{coursesData.avg_class_size || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Alerts Tab Component
const AlertsTab = ({ overloadData, recommendations, pendingApprovals, onRefresh }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const generatedAlerts = [];
    
    // Overload alerts
    if (overloadData?.load_percentage > 90) {
      generatedAlerts.push({
        id: 1,
        type: 'overload',
        title: 'High Workload Alert',
        message: `Your workload is at ${overloadData.load_percentage}% of capacity.`,
        severity: overloadData.load_percentage > 100 ? 'critical' : 'warning',
        time: 'Just now',
        link: '/overload/check'
      });
    }

    // Pending approvals alert
    if (pendingApprovals > 0) {
      generatedAlerts.push({
        id: 2,
        type: 'approval',
        title: 'Pending Approvals',
        message: `You have ${pendingApprovals} workload items pending approval.`,
        severity: 'warning',
        time: 'Today',
        link: '/workload/assignments/approve'
      });
    }

    // Add recommendations as alerts
    recommendations.forEach((rec, index) => {
      generatedAlerts.push({
        id: 3 + index,
        type: 'recommendation',
        title: 'Workload Recommendation',
        message: rec.message,
        severity: rec.type,
        time: 'Today',
        link: rec.action
      });
    });

    setAlerts(generatedAlerts);
  }, [overloadData, pendingApprovals, recommendations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Alerts & Recommendations</h2>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Overload Status Card */}
      {overloadData && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overload Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Current Load</p>
                <p className="text-2xl font-bold text-gray-900">{overloadData.current_load} hrs</p>
              </div>
              <div>
                <p className="text-gray-600">Max Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{overloadData.max_load} hrs</p>
              </div>
              <div>
                <p className="text-gray-600">Utilization</p>
                <p className={`text-2xl font-bold ${
                  overloadData.load_percentage > 100 ? 'text-red-600' :
                  overloadData.load_percentage > 90 ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {overloadData.load_percentage}%
                </p>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Workload Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {overloadData.load_percentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${Math.min(overloadData.load_percentage, 100)}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    overloadData.load_percentage > 100 ? 'bg-red-500' :
                    overloadData.load_percentage > 90 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                ></div>
              </div>
            </div>
            
            <Link
              to="/overload/report"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Detailed Overload Report
            </Link>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          <span className="text-sm text-gray-500">
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-l-4 rounded-r-lg ${
                  alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                  alert.severity === 'warning' ? 'border-l-amber-500 bg-amber-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className={`h-5 w-5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
                      }`} />
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                    <p className="text-gray-700">{alert.message}</p>
                    {alert.link && (
                      <Link
                        to={alert.link}
                        className="inline-flex items-center mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Take Action
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500">No active alerts. Everything looks good!</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className={`p-2 rounded-full ${
                  rec.type === 'critical' ? 'bg-red-100 text-red-600' :
                  rec.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {rec.type === 'critical' ? <AlertCircle className="h-4 w-4" /> :
                   rec.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                   <TrendingUp className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{rec.message}</p>
                  {rec.action && (
                    <Link to={rec.action} className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block">
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// New Workload Tab Component
const NewWorkloadTab = () => {
  const [formData, setFormData] = useState({
    courseCode: '',
    sectionCode: 'Section A',
    programType: 'Regular Program',
    lectureHours: 2,
    labHours: 3,
    tutorialHours: 0,
    studentCount: 0,
    rank: 'Associate Professor'
  });

  const [calculations, setCalculations] = useState({
    lectureLoad: 0,
    labLoad: 0,
    tutorialLoad: 0,
    advisingLoad: 0,
    classSizeAllowance: 0,
    totalLoad: 0,
    expectedWeeklyHours: 0,
    remainingCapacity: 0
  });

  const [deadline, setDeadline] = useState({
    myWorkload: '42 hrs / 48 hrs',
    myPayments: 'ETB 2,840 (Oct)',
    overloadStatus: 'High (85/100)'
  });

  // Course options
  const courseOptions = [
    { code: 'CS-301', title: 'Advanced Programming', credits: 4 },
    { code: 'SE-402', title: 'Software Architecture', credits: 3 },
    { code: 'CS-401', title: 'Database Systems', credits: 3 },
    { code: 'CS-302', title: 'Data Structures', credits: 4 },
    { code: 'SE-301', title: 'Software Engineering', credits: 3 }
  ];

  // Section options
  const sectionOptions = ['Section A', 'Section B', 'Section C', 'Section D'];

  // Program type options
  const programTypeOptions = ['Regular Program', 'NRP Program', 'Summer Program', 'Extension Program'];

  // Rank options
  const rankOptions = [
    'Assistant Professor',
    'Associate Professor',
    'Full Professor',
    'Lecturer',
    'Senior Lecturer'
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Hours') ? parseInt(value) || 0 : value
    }));
    
    // Recalculate when hours change
    if (name.includes('Hours') || name === 'studentCount') {
      calculateLoad();
    }
  };

  // Calculate load based on inputs
  const calculateLoad = () => {
    const { lectureHours, labHours, tutorialHours, studentCount, rank } = formData;
    
    // Load factors based on rank (these would come from backend in real app)
    const loadFactors = {
      'Assistant Professor': { lecture: 1.0, lab: 0.5, tutorial: 0.75 },
      'Associate Professor': { lecture: 1.0, lab: 0.5, tutorial: 0.75 },
      'Full Professor': { lecture: 0.9, lab: 0.45, tutorial: 0.675 },
      'Lecturer': { lecture: 1.1, lab: 0.55, tutorial: 0.825 },
      'Senior Lecturer': { lecture: 1.05, lab: 0.525, tutorial: 0.7875 }
    };

    const factor = loadFactors[rank] || loadFactors['Associate Professor'];
    
    // Calculate loads
    const lectureLoad = lectureHours * factor.lecture;
    const labLoad = labHours * factor.lab;
    const tutorialLoad = tutorialHours * factor.tutorial;
    
    // Advising load (simplified - could be more complex)
    const advisingLoad = studentCount > 20 ? 2 : 1;
    
    // Class size allowance
    const classSizeAllowance = studentCount > 40 ? 1.5 : studentCount > 20 ? 1 : 0.5;
    
    // Total load
    const totalLoad = lectureLoad + labLoad + tutorialLoad + advisingLoad + classSizeAllowance;
    
    // Expected weekly hours (total load * conversion factor)
    const expectedWeeklyHours = totalLoad * 2.5;
    
    // Remaining capacity (based on max 48 hours)
    const remainingCapacity = 48 - expectedWeeklyHours;

    setCalculations({
      lectureLoad: parseFloat(lectureLoad.toFixed(2)),
      labLoad: parseFloat(labLoad.toFixed(2)),
      tutorialLoad: parseFloat(tutorialLoad.toFixed(2)),
      advisingLoad,
      classSizeAllowance: parseFloat(classSizeAllowance.toFixed(2)),
      totalLoad: parseFloat(totalLoad.toFixed(2)),
      expectedWeeklyHours: parseFloat(expectedWeeklyHours.toFixed(2)),
      remainingCapacity: parseFloat(remainingCapacity.toFixed(2))
    });
  };

  // Handle form submission
  const handleSubmit = (action) => {
    switch(action) {
      case 'draft':
        console.log('Saving draft:', formData);
        alert('Draft saved successfully!');
        break;
      case 'submit':
        console.log('Submitting for approval:', { ...formData, calculations });
        alert('Submitted for approval!');
        break;
      case 'cancel':
        console.log('Cancelled');
        break;
    }
  };

  // Get selected course details
  const selectedCourse = courseOptions.find(course => course.code === formData.courseCode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Workload Entry</h1>
          <p className="text-gray-600 mt-1">
            Submit a new workload entry for approval
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Calendar className="h-4 w-4 mr-1.5" />
            Semester I, 2024-2025
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Deadline & Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deadline</h3>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">My Workload</span>
                  </div>
                  <p className="text-sm text-gray-600">{deadline.myWorkload}</p>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">My Payments</span>
                  </div>
                  <p className="text-sm text-gray-600">{deadline.myPayments}</p>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-gray-900">Overload Status</span>
                  </div>
                  <p className="text-sm text-gray-600">{deadline.overloadStatus}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Logged in as Dr. Abebe</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form - Code & Details */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Course Code Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Code</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Selection
                  </label>
                  <div className="relative">
                    <select
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a course</option>
                      {courseOptions.map(course => (
                        <option key={course.code} value={course.code}>
                          {course.code}: {course.title} ({course.credits} Cr)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  {selectedCourse && (
                    <p className="mt-2 text-sm text-gray-500">
                      Course credit hours will be automatically fetched. ({selectedCourse.credits} credits)
                    </p>
                  )}
                </div>

                {/* Section and Program Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Code
                    </label>
                    <div className="relative">
                      <select
                        name="sectionCode"
                        value={formData.sectionCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {sectionOptions.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Type
                    </label>
                    <div className="relative">
                      <select
                        name="programType"
                        value={formData.programType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {programTypeOptions.map(program => (
                          <option key={program} value={program}>{program}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Hours Per Week */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Hours Per Week
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Lecture Hours/WK</span>
                      </div>
                      <input
                        type="number"
                        name="lectureHours"
                        value={formData.lectureHours}
                        onChange={handleInputChange}
                        min="0"
                        max="20"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calculator className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Lab Hours/WK</span>
                      </div>
                      <input
                        type="number"
                        name="labHours"
                        value={formData.labHours}
                        onChange={handleInputChange}
                        min="0"
                        max="20"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Tutorial Hours/WK</span>
                      </div>
                      <input
                        type="number"
                        name="tutorialHours"
                        value={formData.tutorialHours}
                        onChange={handleInputChange}
                        min="0"
                        max="20"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Details Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Students
                  </label>
                  <input
                    type="number"
                    name="studentCount"
                    value={formData.studentCount}
                    onChange={handleInputChange}
                    min="0"
                    max="200"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter number of students enrolled"
                  />
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Note on Class Size</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Class size affects load calculation. Larger classes may include additional allowances for grading and administration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Load Calculation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Load Calculation</h3>
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="space-y-6">
              {/* Rank Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calculate for Rank
                </label>
                <div className="relative">
                  <select
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {rankOptions.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Load Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Lecture Load</span>
                  <span className="text-sm font-medium text-gray-900">
                    ({formData.lectureHours} hrs x 1.0) = {calculations.lectureLoad}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Lab Load</span>
                  <span className="text-sm font-medium text-gray-900">
                    ({formData.labHours} hrs x 0.5) = {calculations.labLoad}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Tutorial Load</span>
                  <span className="text-sm font-medium text-gray-900">
                    ({formData.tutorialHours} hrs x 0.75) = {calculations.tutorialLoad}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Advising Load</span>
                  <span className="text-sm font-medium text-gray-900">
                    {calculations.advisingLoad}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Class Size Allowance</span>
                  <span className="text-sm font-medium text-gray-900">
                    {calculations.classSizeAllowance}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-2">
                  <span className="text-base font-semibold text-gray-900">Total Load</span>
                  <span className="text-base font-bold text-gray-900">
                    {calculations.totalLoad}
                  </span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Expected Weekly Hours</span>
                    <span className="text-lg font-bold text-blue-600">
                      {calculations.expectedWeeklyHours}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Based on load calculation and conversion factor
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-green-700">Remaining Capacity</span>
                    <span className={`text-lg font-bold ${
                      calculations.remainingCapacity > 10 ? 'text-green-600' :
                      calculations.remainingCapacity > 0 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {calculations.remainingCapacity}
                    </span>
                  </div>
                  <p className="text-xs text-green-600">
                    Out of 48 maximum weekly hours
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSubmit('cancel')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => handleSubmit('draft')}
                    className="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Draft
                  </button>
                  
                  <button
                    onClick={() => handleSubmit('submit')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Submit
                  </button>
                </div>
                
                {/* Validation Message */}
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-amber-700">
                      {calculations.remainingCapacity < 0 
                        ? 'Warning: This exceeds your weekly capacity!' 
                        : calculations.remainingCapacity < 5
                        ? 'Warning: Low remaining capacity'
                        : 'Ready for submission'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workload Entry Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Required Information</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Course code and section must be selected
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Hours per week must be specified
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Student count required for load calculation
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Approval Process</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                Drafts can be saved and edited later
              </li>
              <li className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                Submitted entries go to department head
              </li>
              <li className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                Approval typically takes 3-5 business days
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Load Calculation</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Calculator className="h-4 w-4 text-purple-500 mr-2" />
                Based on academic rank and course type
              </li>
              <li className="flex items-center">
                <Calculator className="h-4 w-4 text-purple-500 mr-2" />
                Includes class size allowances
              </li>
              <li className="flex items-center">
                <Calculator className="h-4 w-4 text-purple-500 mr-2" />
                Maximum weekly capacity: 48 hours
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;