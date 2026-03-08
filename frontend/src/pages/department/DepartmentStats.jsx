// src/pages/department/Staff.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { departmentAPI, staffAPI } from "../../api";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  UserCheck,
  Shield,
  Award,
  Building,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const DepartmentStaff = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academic_rank: "",
    employment_type: "",
    status: "active",
  });
  const [stats, setStats] = useState({
    total: 0,
    professors: 0,
    associate_professors: 0,
    assistant_professors: 0,
    lecturers: 0,
    assistant_lecturers: 0,
    graduate_assistants: 0,
  });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getDepartmentStaff(
        user.department_id,
        {
          include_workload: true,
          include_courses: true,
        }
      );

      if (response.data) {
        setStaff(response.data.staff || []);
        setFilteredStaff(response.data.staff || []);
        setStats(response.data.summary || {});
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff data");
      // Fallback data
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = staff;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (member) =>
          member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rank filter
    if (filters.academic_rank) {
      result = result.filter(
        (member) => member.academic_rank === filters.academic_rank
      );
    }

    // Employment type filter
    if (filters.employment_type) {
      result = result.filter(
        (member) => member.employment_type === filters.employment_type
      );
    }

    // Status filter
    if (filters.status) {
      const isActive = filters.status === "active";
      result = result.filter((member) => member.is_active === isActive);
    }

    setFilteredStaff(result);
  }, [staff, searchTerm, filters]);

  // Initialize
  useEffect(() => {
    fetchStaff();
  }, []);

  // Fallback data
  const setFallbackData = () => {
    const mockStaff = [
      {
        staff_id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@university.edu",
        employee_id: "CS001",
        academic_rank: "professor",
        employment_type: "full_time",
        phone: "+1234567890",
        hire_date: "2020-01-15",
        is_active: true,
        current_workload: { total_hours: 45 },
        workload_status: "balanced",
      },
      // Add more mock data as needed
    ];

    setStaff(mockStaff);
    setFilteredStaff(mockStaff);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowDetails(true);
  };

  const handleExport = async () => {
    try {
      toast.loading("Exporting staff data...");
      // API call for export
      toast.dismiss();
      toast.success("Staff data exported!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const handleRefresh = () => {
    fetchStaff();
    toast.success("Staff data refreshed");
  };

  const getRankDisplay = (rank) => {
    const rankMap = {
      professor: "Professor",
      associate_professor: "Associate Professor",
      assistant_professor: "Assistant Professor",
      lecturer: "Lecturer",
      assistant_lecturer: "Assistant Lecturer",
      graduate_assistant: "Graduate Assistant",
    };
    return rankMap[rank] || rank;
  };

  const getRankColor = (rank) => {
    const colors = {
      professor: "bg-purple-100 text-purple-800",
      associate_professor: "bg-blue-100 text-blue-800",
      assistant_professor: "bg-green-100 text-green-800",
      lecturer: "bg-amber-100 text-amber-800",
      assistant_lecturer: "bg-cyan-100 text-cyan-800",
      graduate_assistant: "bg-gray-100 text-gray-800",
    };
    return colors[rank] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Staff</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all staff members in your department
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <Link
            to="/role-registration/hr/create-instructors"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total || staff.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {[
          "professors",
          "associate_professors",
          "assistant_professors",
          "lecturers",
          "assistant_lecturers",
          "graduate_assistants",
        ].map((rank, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{getRankDisplay(rank)}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats[rank] || 0}
                </p>
              </div>
              <GraduationCap
                className={`h-8 w-8 ${
                  rank.includes("professor")
                    ? "text-purple-600"
                    : rank.includes("lecturer")
                    ? "text-amber-600"
                    : "text-gray-600"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff by name, email, or ID..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filters.academic_rank}
              onChange={(e) =>
                handleFilterChange("academic_rank", e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Ranks</option>
              <option value="professor">Professor</option>
              <option value="associate_professor">Associate Professor</option>
              <option value="assistant_professor">Assistant Professor</option>
              <option value="lecturer">Lecturer</option>
              <option value="assistant_lecturer">Assistant Lecturer</option>
              <option value="graduate_assistant">Graduate Assistant</option>
            </select>

            <select
              value={filters.employment_type}
              onChange={(e) =>
                handleFilterChange("employment_type", e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
            </select>

            <button
              onClick={() =>
                setFilters({
                  academic_rank: "",
                  employment_type: "",
                  status: "active",
                })
              }
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workload
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No staff members found
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <StaffTableRow
                    key={member.staff_id}
                    member={member}
                    onViewDetails={handleViewDetails}
                    getRankDisplay={getRankDisplay}
                    getRankColor={getRankColor}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedStaff && (
        <StaffDetailsModal
          staff={selectedStaff}
          onClose={() => setShowDetails(false)}
          getRankDisplay={getRankDisplay}
          getRankColor={getRankColor}
        />
      )}
    </div>
  );
};

const StaffTableRow = ({
  member,
  onViewDetails,
  getRankDisplay,
  getRankColor,
}) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="h-10 w-10 flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="font-semibold text-blue-800">
              {member.first_name?.charAt(0)}
              {member.last_name?.charAt(0)}
            </span>
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {member.first_name} {member.last_name}
          </div>
          <div className="text-sm text-gray-500">{member.employee_id}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRankColor(
          member.academic_rank
        )}`}
      >
        {getRankDisplay(member.academic_rank)}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {member.employment_type?.replace(/_/g, " ")}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{member.email}</div>
      <div className="text-sm text-gray-500">{member.phone || "N/A"}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {member.current_workload?.total_hours || 0}h
      </div>
      <div
        className={`text-xs ${
          member.workload_status === "overloaded"
            ? "text-red-600"
            : member.workload_status === "balanced"
            ? "text-green-600"
            : "text-amber-600"
        }`}
      >
        {member.workload_status?.toUpperCase() || "N/A"}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        {member.is_active ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Active</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">Inactive</span>
          </>
        )}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewDetails(member)}
          className="text-blue-600 hover:text-blue-900 p-1"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button className="text-gray-600 hover:text-gray-900 p-1" title="Edit">
          <Edit className="h-4 w-4" />
        </button>
        <button
          className="text-gray-600 hover:text-gray-900 p-1"
          title="More Options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
);

const StaffDetailsModal = ({
  staff,
  onClose,
  getRankDisplay,
  getRankColor,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Staff Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Staff details content */}
        <div className="space-y-6">
          {/* Profile header */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-800">
                {staff.first_name?.charAt(0)}
                {staff.last_name?.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                {staff.first_name} {staff.last_name}
              </h4>
              <p className="text-gray-600">{staff.employee_id}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getRankColor(
                    staff.academic_rank
                  )}`}
                >
                  {getRankDisplay(staff.academic_rank)}
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {staff.employment_type?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">
                Contact Information
              </h5>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{staff.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{staff.phone || "N/A"}</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">
                Employment Details
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hire Date:</span>
                  <span className="text-sm font-medium">
                    {staff.hire_date
                      ? new Date(staff.hire_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Years of Service:
                  </span>
                  <span className="text-sm font-medium">
                    {staff.years_of_service || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Workload information */}
          <div className="border-t pt-6">
            <h5 className="text-sm font-medium text-gray-500 mb-4">
              Current Workload
            </h5>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.current_workload?.total_hours || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Regular Load</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.current_workload?.regular_hours || 0}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-600">NRP Load</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.current_workload?.nrp_hours || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Courses assigned */}
          <div className="border-t pt-6">
            <h5 className="text-sm font-medium text-gray-500 mb-4">
              Current Courses
            </h5>
            <div className="space-y-2">
              {staff.courses?.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{course.course_code}</p>
                    <p className="text-sm text-gray-600">
                      {course.course_title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{course.hours}h</p>
                    <p className="text-xs text-gray-500">{course.section}</p>
                  </div>
                </div>
              ))}
              {(!staff.courses || staff.courses.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  No courses assigned
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <Link
            to={`/profile/${staff.user_id}`}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            View Full Profile
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default DepartmentStaff;
