import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  ChevronRight,
  Building,
  GraduationCap,
  FileText,
  Eye,
  ChartBar,
  UserPlus
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { collegeAPI } from "../../../api";

const DeanDashboard = () => {
  const { user } = useAuth();
  const [college, setCollege] = useState(null);
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalStaff: 0,
    totalCourses: 0,
    pendingApprovals: 3,
    budgetUtilization: 78,
  });

  useEffect(() => {
    // Fetch college data
    if (user?.college_id) {
      fetchCollegeData();
    }
  }, [user]);

  const fetchCollegeData = async () => {
    try {
      const response = await collegeAPI.getCollegeById(user.college_id);
      setCollege(response.data);

      // Fetch college stats
      const statsResponse = await collegeAPI.getCollegeStats(user.college_id);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching college data:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {college?.college_name || "College Dashboard"}
            </h1>
            <p className="text-teal-200">Dean Dashboard • Spring 2024</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalDepartments}
              </p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg">
              <Building className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Faculty Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalStaff}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Courses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalCourses}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.pendingApprovals}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/college/departments"
            className="p-4 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-teal-600" />
              <span className="font-medium">Departments</span>
            </div>
          </Link>

          <Link
            to="/approvals/workload"
            className="p-4 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Workload Approvals</span>
            </div>
          </Link>

          <Link
            to="/college/stats"
            className="p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <ChartBar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">College Reports</span>
            </div>
          </Link>

          <Link
            to="/role-registration/dean/create-department-heads"
            className="p-4 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <UserPlus className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Assign Department Heads</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeanDashboard;
