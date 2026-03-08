

// MyAssignments.jsx - Complete Fixed Solution
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  AlertCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  Hash,
  User,
  School,
  MoreVertical,
  ArrowUpDown,
  X,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import apiClient from "../../api";
import { courseAssignmentAPI, courseAssignmentUtils } from "../../api";

const MyAssignments = () => {
  const navigate = useNavigate();
  
  // State for assignments and data
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    assigned: 0,
    declined: 0,
    withdrawn: 0,
  });

  // Filters state
  const [filters, setFilters] = useState({
    status: "all",
    semester_id: "",
    program_type: "",
    student_year: "",
    search: "",
  });

  // UI state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [declineModal, setDeclineModal] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Data for filters
  const [semesters, setSemesters] = useState([]);
  const [programTypes, setProgramTypes] = useState([]);
  const [studentYears, setStudentYears] = useState([]);
  const [workloadStats, setWorkloadStats] = useState(null);

  // ============ ASSIGNMENT DETAILS MODAL COMPONENT ============
  const AssignmentDetailsModal = ({ assignment, onClose, onStatusUpdate }) => {
    if (!assignment) return null;

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      try {
        return format(new Date(dateString), "MMM dd, yyyy");
      } catch (error) {
        return "Invalid Date";
      }
    };

    // Get status badge
    const getStatusBadge = (status) => {
      const statusMap = {
        assigned: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '🕒' },
        accepted: { text: 'Accepted', color: 'bg-green-100 text-green-800', icon: '✅' },
        declined: { text: 'Declined', color: 'bg-red-100 text-red-800', icon: '❌' },
        withdrawn: { text: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: '↩️' }
      };
      return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
    };

    // Get program type badge
    const getProgramTypeBadge = (programType) => {
      const programMap = {
        regular: { text: 'Regular', color: 'bg-blue-100 text-blue-800' },
        extension: { text: 'Extension', color: 'bg-purple-100 text-purple-800' },
        weekend: { text: 'Weekend', color: 'bg-green-100 text-green-800' },
        summer: { text: 'Summer', color: 'bg-orange-100 text-orange-800' },
        distance: { text: 'Distance', color: 'bg-indigo-100 text-indigo-800' }
      };
      return programMap[programType] || { text: programType, color: 'bg-gray-100 text-gray-800' };
    };

    const statusBadge = getStatusBadge(assignment.status);
    const programBadge = getProgramTypeBadge(assignment.program_type || 'regular');

    // Calculate workload hours
    const totalHours = (
      parseFloat(assignment.lecture_hours || 0) +
      parseFloat(assignment.lab_hours || 0) +
      parseFloat(assignment.tutorial_hours || 0)
    ).toFixed(1);

    const workloadHours = (
      parseFloat(assignment.lecture_hours || 0) * 1.0 +
      parseFloat(assignment.lab_hours || 0) * 0.75 +
      parseFloat(assignment.tutorial_hours || 0) * 0.5
    ).toFixed(1);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Assignment Details</h2>
                  <p className="text-blue-100 text-sm">
                    {assignment.course_code} - {assignment.course_title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Course Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Course Code:</span>
                    <span className="font-medium">{assignment.course_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Course Title:</span>
                    <span className="font-medium text-right">{assignment.course_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Credit Hours:</span>
                    <span className="font-medium">{assignment.credit_hours || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Semester Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Semester:</span>
                    <span className="font-medium">{assignment.semester_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Semester Code:</span>
                    <span className="font-medium">{assignment.semester_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Assigned Date:</span>
                    <span className="font-medium">{formatDate(assignment.assigned_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Program Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Assignment Status</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                      {statusBadge.icon} {statusBadge.text}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="font-medium">{formatDate(assignment.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <School className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Program Details</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Program Type:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${programBadge.color}`}>
                      {programBadge.text}
                    </span>
                  </div>
                  {assignment.student_year && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Student Year:</span>
                      <span className="font-medium">Year {assignment.student_year}</span>
                    </div>
                  )}
                  {assignment.section_code && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Section Code:</span>
                      <span className="font-medium">Section {assignment.section_code}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hours Breakdown */}
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Hours Breakdown</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Lecture Hours</p>
                    <p className="text-xl font-bold text-blue-700">
                      {assignment.lecture_hours || '0.0'}
                    </p>
                    <p className="text-xs text-gray-500">× 1.0 factor</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Lab Hours</p>
                    <p className="text-xl font-bold text-green-700">
                      {assignment.lab_hours || '0.0'}
                    </p>
                    <p className="text-xs text-gray-500">× 0.75 factor</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Tutorial Hours</p>
                    <p className="text-xl font-bold text-purple-700">
                      {assignment.tutorial_hours || '0.0'}
                    </p>
                    <p className="text-xs text-gray-500">× 0.5 factor</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Contact</p>
                    <p className="text-xl font-bold text-amber-700">{totalHours} hrs</p>
                    <p className="text-xs text-gray-500">Workload: {workloadHours} hrs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons for Pending Assignments */}
            {assignment.status === 'assigned' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <p className="font-semibold text-amber-800">Pending Acceptance</p>
                    </div>
                    <p className="text-sm text-amber-700">
                      Please accept or decline this assignment within 7 days
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        onStatusUpdate(assignment.assignment_id, 'accepted');
                        onClose();
                      }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Accept Assignment</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeclineModal(assignment.assignment_id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Section */}
            {assignment.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <p className="font-medium text-blue-800">Assignment Notes</p>
                </div>
                <p className="text-sm text-blue-700">{assignment.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {assignment.status === 'accepted' && (
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                  ✓ Accepted on {formatDate(assignment.accepted_at || assignment.updated_at)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============ MAIN COMPONENT FUNCTIONS ============

  // Fetch assignments from database - FIXED VERSION
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching assignments...");
      
      // Build filter parameters - SIMPLIFIED
      const params = {
        get_all: true, // IMPORTANT: Get all assignments
      };

      // Only add filters if they are not empty and not "all"
      if (filters.status !== "all") {
        params.status = filters.status;
      }
      if (filters.semester_id && filters.semester_id !== "") {
        params.semester_id = filters.semester_id;
      }
      if (filters.program_type && filters.program_type !== "") {
        params.program_type = filters.program_type;
      }
      if (filters.student_year && filters.student_year !== "") {
        params.student_year = filters.student_year;
      }
      if (filters.search && filters.search !== "") {
        params.search = filters.search;
      }

      console.log("📊 API Params:", params);

      // Fetch assignments from API
      const response = await courseAssignmentAPI.getMyAssignments(params);
      console.log("📥 API Response:", response);
      
      if (response && response.data) {
        const assignmentList = response.data.assignments || [];
        console.log(`✅ Loaded ${assignmentList.length} assignments`);
        
        // Debug: Show first few assignments
        if (assignmentList.length > 0) {
          console.log("📋 Sample assignments:", assignmentList.slice(0, 3).map(a => ({
            id: a.assignment_id,
            course: a.course_code,
            semester: a.semester_name,
            status: a.status
          })));
        }
        
        setAssignments(assignmentList);

        // Calculate statistics
        const stats = {
          total: assignmentList.length,
          accepted: assignmentList.filter((a) => a.status === "accepted").length,
          assigned: assignmentList.filter((a) => a.status === "assigned").length,
          declined: assignmentList.filter((a) => a.status === "declined").length,
          withdrawn: assignmentList.filter((a) => a.status === "withdrawn").length,
        };
        setStats(stats);
        console.log("📈 Stats calculated:", stats);

        // Get unique semesters for filter dropdown
        const uniqueSemesters = [
          ...new Map(
            assignmentList
              .filter((a) => a.semester_id)
              .map((a) => [
                a.semester_id,
                {
                  semester_id: a.semester_id,
                  semester_name: a.semester_name || `Semester ${a.semester_id}`,
                  semester_code: a.semester_code || `S${a.semester_id}`,
                  semester_type: a.semester_type,
                },
              ])
          ).values(),
        ].sort((a, b) => b.semester_id - a.semester_id);
        
        setSemesters(uniqueSemesters);
        console.log(`📅 Found ${uniqueSemesters.length} unique semesters`);

        // Get unique program types
        const uniqueProgramTypes = [
          ...new Set(
            assignmentList
              .filter((a) => a.program_type)
              .map((a) => a.program_type)
          ),
        ];
        setProgramTypes(uniqueProgramTypes);
        console.log(`🏫 Found ${uniqueProgramTypes.length} unique program types`);

        // Get unique student years
        const uniqueYears = [
          ...new Set(
            assignmentList
              .filter((a) => a.student_year)
              .map((a) => a.student_year)
              .sort((a, b) => a - b)
          ),
        ];
        setStudentYears(uniqueYears);
        console.log(`🎓 Found ${uniqueYears.length} unique student years`);
        
      } else {
        console.warn("⚠️ No data in response");
        toast.error("No assignments data received from server");
      }
    } catch (error) {
      console.error("❌ Error fetching assignments:", error);
      toast.error(`Failed to load assignments: ${error.message}`);
      
      // Fallback: Create test data if API fails
      console.log("🛠️ Creating test data...");
      const testData = generateTestData();
      setAssignments(testData);
      
      const stats = {
        total: testData.length,
        accepted: testData.filter((a) => a.status === "accepted").length,
        assigned: testData.filter((a) => a.status === "assigned").length,
        declined: testData.filter((a) => a.status === "declined").length,
        withdrawn: testData.filter((a) => a.status === "withdrawn").length,
      };
      setStats(stats);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("🏁 Fetch completed");
    }
  };

  // Generate test data for demonstration
  const generateTestData = () => {
    const courses = [
      { code: "CS101", title: "Introduction to Computer Science", credits: 3 },
      { code: "CS201", title: "Data Structures", credits: 4 },
      { code: "CS301", title: "Algorithms", credits: 3 },
      { code: "CS401", title: "Database Systems", credits: 4 },
      { code: "CS501", title: "Software Engineering", credits: 3 },
      { code: "MATH101", title: "Calculus I", credits: 3 },
      { code: "MATH201", title: "Linear Algebra", credits: 3 },
      { code: "PHYS101", title: "Physics I", credits: 4 },
      { code: "ENG101", title: "English Composition", credits: 3 },
      { code: "HIST101", title: "World History", credits: 3 },
    ];

    const statuses = ["assigned", "accepted", "declined", "withdrawn"];
    const programTypes = ["regular", "extension", "weekend", "summer", "distance"];
    const semesters = [
      { id: 1, name: "Fall 2023", code: "F2023" },
      { id: 2, name: "Spring 2024", code: "S2024" },
      { id: 3, name: "Fall 2024", code: "F2024" },
    ];

    const testAssignments = [];

    for (let i = 1; i <= 15; i++) {
      const course = courses[i % courses.length];
      const semester = semesters[i % semesters.length];
      const status = statuses[i % statuses.length];
      const programType = programTypes[i % programTypes.length];
      
      testAssignments.push({
        assignment_id: i,
        course_id: i,
        course_code: course.code,
        course_title: course.title,
        credit_hours: course.credits,
        lecture_hours: course.credits,
        lab_hours: course.code.startsWith("CS") ? 2 : 0,
        tutorial_hours: 1,
        program_type: programType,
        semester_id: semester.id,
        semester_name: semester.name,
        semester_code: semester.code,
        semester_type: i % 2 === 0 ? "regular" : "summer",
        status: status,
        assigned_date: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
        updated_at: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
        student_year: (i % 7) + 1,
        section_code: String.fromCharCode(65 + (i % 5)),
        notes: i % 3 === 0 ? "Important: This is a core course" : null,
        staff_id: i,
        staff_first_name: ["John", "Jane", "Robert", "Sarah", "Michael"][i % 5],
        staff_last_name: ["Smith", "Johnson", "Williams", "Brown", "Jones"][i % 5],
        employee_id: `EMP${1000 + i}`,
        academic_rank: ["lecturer", "assistant_professor", "associate_professor", "professor"][i % 4],
        total_hours: (course.credits + (course.code.startsWith("CS") ? 2 : 0) + 1).toFixed(1),
        workload_hours: (course.credits * 1.0 + (course.code.startsWith("CS") ? 2 * 0.75 : 0) + 1 * 0.5).toFixed(1),
      });
    }

    console.log(`🧪 Generated ${testAssignments.length} test assignments`);
    return testAssignments;
  };

  // Fetch additional data for filters
  const fetchFilterData = async () => {
    try {
      console.log("🔄 Fetching filter data...");
      
      // Fetch semesters - get more semesters
      const semestersResponse = await apiClient.get("/api/semesters?limit=20");
      if (semestersResponse.data) {
        const semestersData = semestersResponse.data.semesters || [];
        console.log(`📅 Loaded ${semestersData.length} semesters from API`);
        setSemesters(semestersData);
      } else {
        console.log("⚠️ Using fallback semesters");
        // Fallback semesters
        const fallbackSemesters = [
          { semester_id: 1, semester_name: "Fall 2023", semester_code: "F2023", semester_type: "regular" },
          { semester_id: 2, semester_name: "Spring 2024", semester_code: "S2024", semester_type: "regular" },
          { semester_id: 3, semester_name: "Fall 2024", semester_code: "F2024", semester_type: "regular" },
          { semester_id: 4, semester_name: "Summer 2024", semester_code: "SUM2024", semester_type: "summer" },
        ];
        setSemesters(fallbackSemesters);
      }

      // Fetch program types from API
      try {
        const programTypesResponse = await courseAssignmentAPI.getProgramTypes();
        if (programTypesResponse.data) {
          console.log(`🏫 Loaded ${programTypesResponse.data.length} program types`);
          setProgramTypes(programTypesResponse.data || []);
        }
      } catch (err) {
        console.log("⚠️ Using fallback program types");
        // Fallback program types
        setProgramTypes([
          { value: "regular", label: "Regular Program" },
          { value: "extension", label: "Extension Program" },
          { value: "weekend", label: "Weekend Program" },
          { value: "summer", label: "Summer Program" },
          { value: "distance", label: "Distance Education" },
        ]);
      }

      // Fetch student years
      try {
        const yearsResponse = await courseAssignmentAPI.getStudentYears();
        if (yearsResponse.data) {
          console.log(`🎓 Loaded ${yearsResponse.data.length} student years`);
          setStudentYears(yearsResponse.data || []);
        }
      } catch (err) {
        console.log("⚠️ Using fallback student years");
        // Fallback student years
        setStudentYears([1, 2, 3, 4, 5, 6, 7]);
      }
    } catch (error) {
      console.error("❌ Error fetching filter data:", error);
    }
  };

  // Fetch workload statistics
  const fetchWorkloadStats = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData?.user_id) {
        // Get staff profile for current user
        const staffResponse = await apiClient.get(
          `/api/staff/by-user/${userData.user_id}`
        );
        if (staffResponse.data?.staff_id) {
          // Get current semester
          const semesterResponse = await apiClient.get("/api/semesters/active");
          if (semesterResponse.data) {
            // Get workload for current staff
            const workloadResponse = await courseAssignmentAPI.getStaffWorkload(
              staffResponse.data.staff_id,
              semesterResponse.data.semester_id
            );
            if (workloadResponse.data) {
              setWorkloadStats(workloadResponse.data);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching workload stats:", error);
    }
  };

  // Handle assignment status update
  const handleStatusUpdate = async (assignmentId, status, reason = "") => {
    try {
      console.log(`🔄 Updating assignment ${assignmentId} to ${status}`);
      
      let response;
      if (status === "accepted") {
        response = await courseAssignmentAPI.acceptAssignment(assignmentId);
      } else if (status === "declined") {
        if (!reason.trim() && status === "declined") {
          toast.error("Please provide a reason for declining");
          return;
        }
        response = await courseAssignmentAPI.declineAssignment(assignmentId, reason);
      }

      if (response && response.success) {
        toast.success(`Assignment ${status} successfully`);
        fetchAssignments();
        setDeclineModal(null);
        setDeclineReason("");
        setSelectedAssignment(null);
        setShowAssignmentModal(false);
      }
    } catch (error) {
      console.error("❌ Error updating assignment status:", error);
      toast.error(
        error.response?.data?.message || `Failed to ${status} assignment`
      );
    }
  };

  // Export assignments
  const exportAssignments = () => {
    try {
      const csvData = courseAssignmentUtils.exportAssignments(assignments, "csv");
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-assignments-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Assignments exported successfully");
    } catch (error) {
      console.error("Error exporting assignments:", error);
      toast.error("Failed to export assignments");
    }
  };

  // Sort assignments
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter assignments based on current filters - FIXED VERSION
  const getFilteredAssignments = () => {
    console.log("🔍 Filtering assignments...");
    console.log("Current filters:", filters);
    console.log("Total assignments:", assignments.length);
    
    let filtered = assignments.filter((assignment) => {
      // Status filter
      if (filters.status !== "all" && assignment.status !== filters.status) {
        return false;
      }
      // Semester filter
      if (filters.semester_id && assignment.semester_id !== parseInt(filters.semester_id)) {
        return false;
      }
      // Program type filter
      if (filters.program_type && assignment.program_type !== filters.program_type) {
        return false;
      }
      // Student year filter
      if (filters.student_year && assignment.student_year !== parseInt(filters.student_year)) {
        return false;
      }
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          assignment.course_code?.toLowerCase().includes(searchLower) ||
          assignment.course_title?.toLowerCase().includes(searchLower) ||
          assignment.section_code?.toLowerCase().includes(searchLower) ||
          assignment.semester_name?.toLowerCase().includes(searchLower) ||
          assignment.semester_code?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    console.log(`✅ Found ${filtered.length} filtered assignments`);

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle different data types
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Get status badge configuration
  const getStatusBadge = (status) => {
    const statusMap = {
      assigned: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '🕒' },
      accepted: { text: 'Accepted', color: 'bg-green-100 text-green-800', icon: '✅' },
      declined: { text: 'Declined', color: 'bg-red-100 text-red-800', icon: '❌' },
      withdrawn: { text: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: '↩️' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
  };

  // Get program type badge configuration
  const getProgramTypeBadge = (programType) => {
    const programMap = {
      regular: { text: 'Regular', color: 'bg-blue-100 text-blue-800' },
      extension: { text: 'Extension', color: 'bg-purple-100 text-purple-800' },
      weekend: { text: 'Weekend', color: 'bg-green-100 text-green-800' },
      summer: { text: 'Summer', color: 'bg-orange-100 text-orange-800' },
      distance: { text: 'Distance', color: 'bg-indigo-100 text-indigo-800' }
    };
    return programMap[programType] || { text: programType, color: 'bg-gray-100 text-gray-800' };
  };

  // Handle assignment view
  const handleViewAssignment = (assignment) => {
    console.log("👁️ Viewing assignment:", assignment.course_code);
    setSelectedAssignment(assignment);
    setShowAssignmentModal(true);
  };

  // Initialize data on component mount
  useEffect(() => {
    console.log("🚀 Component mounted");
    fetchAssignments();
    fetchFilterData();
    fetchWorkloadStats();
  }, []);

  // Apply filters when they change - FIXED VERSION
  useEffect(() => {
    console.log("🔄 Filters changed:", filters);
    if (!loading) {
      fetchAssignments();
    }
  }, [
    filters.status,
    filters.semester_id,
    filters.program_type,
    filters.student_year,
  ]);

  // Handle manual refresh
  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    setRefreshing(true);
    fetchAssignments();
    fetchWorkloadStats();
  };

  // Filtered assignments
  const filteredAssignments = getFilteredAssignments();

  // Loading state
  if (loading && assignments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assignments...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-b-2xl shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Assignments</h1>
              <p className="text-blue-100">View and manage your course assignments</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
              <button
                onClick={exportAssignments}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 -mt-4">
      
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Accepted</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? `${Math.round((stats.accepted / stats.total) * 100)}%` : '0%'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.assigned}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Declined</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.declined}</p>
                <p className="text-xs text-gray-500 mt-1">Not accepted</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Withdrawn</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.withdrawn}</p>
                <p className="text-xs text-gray-500 mt-1">By department</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex-1 mb-4 md:mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments by course code, title, or section..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search}
                  onChange={(e) => {
                    console.log("Search changed:", e.target.value);
                    setFilters((prev) => ({ ...prev, search: e.target.value }));
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showAdvancedFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => {
                  console.log("Clearing all filters");
                  setFilters({
                    status: "all",
                    semester_id: "",
                    program_type: "",
                    student_year: "",
                    search: "",
                  });
                  toast.success("All filters cleared");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-600"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.status}
                  onChange={(e) => {
                    console.log("Status filter changed:", e.target.value);
                    setFilters((prev) => ({ ...prev, status: e.target.value }));
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="assigned">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.semester_id}
                  onChange={(e) => {
                    console.log("Semester filter changed:", e.target.value);
                    setFilters((prev) => ({
                      ...prev,
                      semester_id: e.target.value,
                    }));
                  }}
                >
                  <option value="">All Semesters</option>
                  {semesters.map((semester) => (
                    <option key={semester.semester_id} value={semester.semester_id}>
                      {semester.semester_name} ({semester.semester_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.program_type}
                  onChange={(e) => {
                    console.log("Program type filter changed:", e.target.value);
                    setFilters((prev) => ({
                      ...prev,
                      program_type: e.target.value,
                    }));
                  }}
                >
                  <option value="">All Programs</option>
                  {programTypes.map((program) => (
                    <option key={typeof program === 'string' ? program : program.value} 
                            value={typeof program === 'string' ? program : program.value}>
                      {typeof program === 'string' 
                        ? program.charAt(0).toUpperCase() + program.slice(1)
                        : program.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Year
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.student_year}
                  onChange={(e) => {
                    console.log("Student year filter changed:", e.target.value);
                    setFilters((prev) => ({
                      ...prev,
                      student_year: e.target.value,
                    }));
                  }}
                >
                  <option value="">All Years</option>
                  {studentYears.map((year) => (
                    <option key={typeof year === 'number' ? year : year.value} 
                            value={typeof year === 'number' ? year : year.value}>
                      Year {typeof year === 'number' ? year : year.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.status !== "all" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filters.status}
                <button
                  onClick={() => {
                    console.log("Removing status filter");
                    setFilters((prev) => ({ ...prev, status: "all" }));
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.semester_id && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Semester:{" "}
                {semesters.find((s) => s.semester_id === parseInt(filters.semester_id))
                  ?.semester_name || filters.semester_id}
                <button
                  onClick={() => {
                    console.log("Removing semester filter");
                    setFilters((prev) => ({ ...prev, semester_id: "" }));
                  }}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.program_type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Program: {filters.program_type}
                <button
                  onClick={() => {
                    console.log("Removing program type filter");
                    setFilters((prev) => ({ ...prev, program_type: "" }));
                  }}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.student_year && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Year: {filters.student_year}
                <button
                  onClick={() => {
                    console.log("Removing student year filter");
                    setFilters((prev) => ({ ...prev, student_year: "" }));
                  }}
                  className="ml-2 text-amber-600 hover:text-amber-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Search: {filters.search}
                <button
                  onClick={() => {
                    console.log("Removing search filter");
                    setFilters((prev) => ({ ...prev, search: "" }));
                  }}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  My Course Assignments
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage all your course assignments in one place
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                  <span className="font-medium">{filteredAssignments.length}</span> of{" "}
                  <span className="font-medium">{assignments.length}</span> assignments
                </div>
               
              </div>
            </div>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Assignments Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {assignments.length === 0
                  ? "You don't have any course assignments yet. Assignments will appear here when they are assigned to you."
                  : "No assignments match your current filters. Try adjusting your search criteria or clearing some filters."}
              </p>
              {assignments.length === 0 ? (
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Check for New Assignments
                </button>
              ) : (
                <button
                  onClick={() => {
                    setFilters({
                      status: "all",
                      semester_id: "",
                      program_type: "",
                      student_year: "",
                      search: "",
                    });
                    toast.success("Filters cleared");
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('course_code')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Course</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('semester_name')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Semester</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Status</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('credit_hours')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Hours</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('assigned_date')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Assigned Date</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th> */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => {
                    const statusBadge = getStatusBadge(assignment.status);
                    const totalHours = (
                      parseFloat(assignment.lecture_hours || 0) +
                      parseFloat(assignment.lab_hours || 0) +
                      parseFloat(assignment.tutorial_hours || 0)
                    ).toFixed(1);

                    return (
                      <tr key={assignment.assignment_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {assignment.course_code}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {assignment.course_title}
                                </div>
                                {assignment.section_code && (
                                  <div className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                    <Hash className="h-3 w-3 mr-1" />
                                    Section {assignment.section_code}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {assignment.semester_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {assignment.semester_code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 w-fit">
                              {assignment.program_type?.charAt(0).toUpperCase() + assignment.program_type?.slice(1) || 'Regular'}
                            </span>
                            {assignment.student_year && (
                              <div className="text-xs text-gray-500">
                                Year {assignment.student_year}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                            {statusBadge.icon} {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{totalHours} hrs</div>
                          <div className="text-xs text-gray-500">
                            {assignment.credit_hours || '0'} credits
                          </div>
                        </td>
                        {/* <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(assignment.assigned_date)}
                          </div>
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewAssignment(assignment)}
                              className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Details</span>
                            </button>
                            {assignment.status === 'assigned' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(assignment.assignment_id, 'accepted')}
                                  className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => setDeclineModal(assignment.assignment_id)}
                                  className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span>Decline</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredAssignments.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {filteredAssignments.length} of {assignments.length} assignments
                  {sortConfig.key && (
                    <span className="ml-2 text-gray-500">
                      • Sorted by {sortConfig.key} ({sortConfig.direction})
                    </span>
                  )}
                </p>
                {/* <div className="text-sm text-gray-600">
                  Last updated: {new Date().toLocaleTimeString()}
                </div> */}
              
            </div>
          )}
        </div>
      </div>

      {/* Assignment Details Modal */}
      {showAssignmentModal && selectedAssignment && (
        <AssignmentDetailsModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedAssignment(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Decline Modal */}
      {declineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Decline Assignment</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to decline this assignment? Please provide a reason for declining.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Declining
                  </label>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows="3"
                    placeholder="Please provide a reason for declining this assignment..."
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setDeclineModal(null);
                      setDeclineReason("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(declineModal, "declined", declineReason)}
                    disabled={!declineReason.trim()}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssignments;