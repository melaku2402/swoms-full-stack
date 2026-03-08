// src/pages/workload/dept/ViewAssignment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  workloadDeptAPI,
  courseAssignmentAPI,
  courseAssignmentUtils,
} from "../../../api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  BookOpen,
  Clock,
  AlertCircle,
  UserCheck,
  UserX,
  FileText,
  Award,
  GraduationCap,
  Building,
  CreditCard,
  Loader2,
  Printer,
  Download,
  Mail,
  Copy,
  Link,
  Shield,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  History,
  FileSpreadsheet,
  Calculator,
  ChartBar,
  Clock as ClockIcon,
  DollarSign,
  Percent,
  UserCircle,
  Bell,
  MessageSquare,
  ExternalLink,
  Home,
  School,
  Layers,
  Target,
  Zap,
  Activity,
  Filter,
  Search,
  Upload,
  Download as DownloadIcon,
  MoreVertical,
  Star,
  ShieldCheck,
  Bookmark,
  Flag,
  HelpCircle,
  Info,
  Check,
  X,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Share2,
  Book,
  FolderOpen,
  Database,
  Server,
  Network,
  Cpu,
  HardDrive,
  Cloud,
  Lock,
  Key,
  Grid,
  PieChart,
  LineChart,
  TrendingDown,
} from "lucide-react";

const ViewAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [workloadData, setWorkloadData] = useState(null);
  const [staffDetails, setStaffDetails] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [semesterDetails, setSemesterDetails] = useState(null);
  const [departmentDetails, setDepartmentDetails] = useState(null);
  const [relatedAssignments, setRelatedAssignments] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showOverloadDetails, setShowOverloadDetails] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    fetchAssignmentData();
  }, [id]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);

      // Fetch assignment details
      const assignmentResponse = await courseAssignmentAPI.getAssignmentById(
        id
      );

      if (assignmentResponse?.data) {
        const assignmentData = assignmentResponse.data;
        setAssignment(assignmentData);

        // Fetch workload data for the staff
        if (assignmentData.staff_id && assignmentData.semester_id) {
          try {
            const workloadResponse = await workloadDeptAPI.getStaffWorkload(
              assignmentData.staff_id,
              assignmentData.semester_id
            );
            if (workloadResponse?.data) {
              setWorkloadData(workloadResponse.data);
            }
          } catch (error) {
            console.error("Error fetching workload:", error);
          }
        }

        // Fetch staff details
        if (assignmentData.staff_id) {
          try {
            const staffResponse = await workloadDeptAPI.getStaffDetails(
              assignmentData.staff_id
            );
            if (staffResponse?.data) {
              setStaffDetails(staffResponse.data);
            }
          } catch (error) {
            console.error("Error fetching staff details:", error);
          }
        }

        // Fetch course details
        if (assignmentData.course_id) {
          try {
            const courseResponse = await workloadDeptAPI.getCourseDetails(
              assignmentData.course_id
            );
            if (courseResponse?.data) {
              setCourseDetails(courseResponse.data);
            }
          } catch (error) {
            console.error("Error fetching course details:", error);
          }
        }

        // Fetch semester details
        if (assignmentData.semester_id) {
          try {
            const semesterResponse = await workloadDeptAPI.getSemesterDetails(
              assignmentData.semester_id
            );
            if (semesterResponse?.data) {
              setSemesterDetails(semesterResponse.data);
            }
          } catch (error) {
            console.error("Error fetching semester details:", error);
          }
        }

        // Fetch department details
        if (user?.department_id) {
          try {
            const deptResponse = await workloadDeptAPI.getDepartmentDetails(
              user.department_id
            );
            if (deptResponse?.data) {
              setDepartmentDetails(deptResponse.data);
            }
          } catch (error) {
            console.error("Error fetching department details:", error);
          }
        }

        // Fetch related assignments
        try {
          const relatedResponse = await workloadDeptAPI.getRelatedAssignments(
            assignmentData.staff_id
          );
          if (relatedResponse?.data) {
            setRelatedAssignments(relatedResponse.data);
          }
        } catch (error) {
          console.error("Error fetching related assignments:", error);
        }

        // Fetch audit log
        try {
          const auditResponse = await workloadDeptAPI.getAssignmentAuditLog(id);
          if (auditResponse?.data) {
            setAuditLog(auditResponse.data);
          }
        } catch (error) {
          console.error("Error fetching audit log:", error);
        }
      } else {
        toast.error("Assignment not found");
        navigate("/workload/dept/assignments");
      }
    } catch (error) {
      console.error("Error fetching assignment:", error);
      toast.error("Failed to load assignment details");
      navigate("/workload/dept/assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      setLoadingAction(true);

      switch (action) {
        case "accept":
          const acceptResponse = await courseAssignmentAPI.acceptAssignment(id);
          if (acceptResponse?.success) {
            toast.success("Assignment accepted successfully");
            fetchAssignmentData();
          } else {
            toast.error(
              acceptResponse?.message || "Failed to accept assignment"
            );
          }
          break;

        case "decline":
          const reason = prompt("Please provide a reason for declining:");
          if (reason) {
            const declineResponse = await courseAssignmentAPI.declineAssignment(
              id,
              reason
            );
            if (declineResponse?.success) {
              toast.success("Assignment declined successfully");
              fetchAssignmentData();
            } else {
              toast.error(
                declineResponse?.message || "Failed to decline assignment"
              );
            }
          }
          break;

        case "withdraw":
          const withdrawReason = prompt(
            "Please provide a reason for withdrawal:"
          );
          if (withdrawReason) {
            const withdrawResponse =
              await courseAssignmentAPI.withdrawAssignment(id, withdrawReason);
            if (withdrawResponse?.success) {
              toast.success("Assignment withdrawn successfully");
              fetchAssignmentData();
            } else {
              toast.error(
                withdrawResponse?.message || "Failed to withdraw assignment"
              );
            }
          }
          break;

        case "delete":
          setShowConfirmDelete(true);
          break;

        case "edit":
          navigate(`/workload/dept/assignments/edit/${id}`);
          break;

        case "refresh":
          fetchAssignmentData();
          toast.success("Assignment data refreshed");
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} assignment`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await workloadDeptAPI.deleteAssignment(id);
      if (response?.success) {
        toast.success("Assignment deleted successfully");
        navigate("/workload/dept/assignments");
      } else {
        toast.error(response?.message || "Failed to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment");
    } finally {
      setShowConfirmDelete(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      assigned: {
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        icon: ClockIcon,
        label: "Assigned",
        bg: "bg-yellow-100",
      },
      accepted: {
        color: "text-green-600 bg-green-50 border-green-200",
        icon: CheckCircle,
        label: "Accepted",
        bg: "bg-green-100",
      },
      declined: {
        color: "text-red-600 bg-red-50 border-red-200",
        icon: XCircle,
        label: "Declined",
        bg: "bg-red-100",
      },
      withdrawn: {
        color: "text-gray-600 bg-gray-50 border-gray-200",
        icon: UserX,
        label: "Withdrawn",
        bg: "bg-gray-100",
      },
    };
    return configs[status] || configs.assigned;
  };

  const getProgramTypeConfig = (type) => {
    const configs = {
      regular: {
        color: "text-blue-600 bg-blue-50",
        icon: BookOpen,
        label: "Regular Program",
      },
      extension: {
        color: "text-purple-600 bg-purple-50",
        icon: FileText,
        label: "Extension Program",
      },
      summer: {
        color: "text-orange-600 bg-orange-50",
        icon: Award,
        label: "Summer Program",
      },
      distance: {
        color: "text-teal-600 bg-teal-50",
        icon: ExternalLink,
        label: "Distance Education",
      },
      weekend: {
        color: "text-indigo-600 bg-indigo-50",
        icon: Calendar,
        label: "Weekend Program",
      },
    };
    return configs[type] || configs.regular;
  };

  const calculateWorkloadPercentage = () => {
    if (!workloadData || !workloadData.limits) return 0;
    const current = workloadData.current_workload?.total_hours || 0;
    const max = workloadData.limits.rank_max || 1;
    return Math.min((current / max) * 100, 100);
  };

  const calculateOverload = () => {
    if (!workloadData || !workloadData.limits) return 0;
    const current = workloadData.current_workload?.total_hours || 0;
    const max = workloadData.limits.rank_max || 0;
    return Math.max(0, current - max);
  };

  const renderWorkloadMeter = () => {
    const percentage = calculateWorkloadPercentage();
    const isOverloaded = percentage > 100;

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current Workload</span>
          <span className="font-semibold">
            {workloadData?.current_workload?.total_hours?.toFixed(1) || 0}h /{" "}
            {workloadData?.limits?.rank_max || 0}h
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverloaded ? "bg-red-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span className={isOverloaded ? "text-red-600 font-semibold" : ""}>
            {percentage.toFixed(1)}%
          </span>
          <span>100%</span>
        </div>
        {isOverloaded && (
          <div className="mt-2 flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            Overload: {calculateOverload().toFixed(1)} hours above limit
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = () => {
    const status = assignment?.status;
    const isDepartmentHead = user?.role === "department_head";
    const isInstructor = user?.role === "instructor";

    // return (
    //   <div className="flex flex-wrap gap-3">
    //     <button
    //       onClick={() => handleAction("refresh")}
    //       disabled={loadingAction}
    //       className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50"
    //     >
    //       <RefreshCw className="w-4 h-4 mr-2" />
    //       Refresh
    //     </button>

    //     {isDepartmentHead && (
    //       <>
    //         <button
    //           onClick={() => handleAction("edit")}
    //           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
    //         >
    //           <Edit className="w-4 h-4 mr-2" />
    //           Edit
    //         </button>
    //         {status === "assigned" && (
    //           <button
    //             onClick={() => handleAction("withdraw")}
    //             disabled={loadingAction}
    //             className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center disabled:opacity-50"
    //           >
    //             <UserX className="w-4 h-4 mr-2" />
    //             Withdraw
    //           </button>
    //         )}
    //         <button
    //           onClick={() => handleAction("delete")}
    //           className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
    //         >
    //           <Trash2 className="w-4 h-4 mr-2" />
    //           Delete
    //         </button>
    //       </>
    //     )}

    //     {isInstructor && status === "assigned" && (
    //       <>
    //         <button
    //           onClick={() => handleAction("accept")}
    //           disabled={loadingAction}
    //           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
    //         >
    //           <CheckCircle className="w-4 h-4 mr-2" />
    //           Accept Assignment
    //         </button>
    //         <button
    //           onClick={() => handleAction("decline")}
    //           disabled={loadingAction}
    //           className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50"
    //         >
    //           <XCircle className="w-4 h-4 mr-2" />
    //           Decline Assignment
    //         </button>
    //       </>
    //     )}

    //     <button
    //       onClick={() => window.print()}
    //       className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
    //     >
    //       <Printer className="w-4 h-4 mr-2" />
    //       Print
    //     </button>
    //   </div>
    // );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Assignment Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested assignment could not be found.
          </p>
          <button
            onClick={() => navigate("/workload/dept/assignments")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(assignment.status);
  const programTypeConfig = getProgramTypeConfig(assignment.program_type);
  const StatusIcon = statusConfig.icon;
  const ProgramTypeIcon = programTypeConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      {/* <div className="bg-gradient-to-r from-[#1a365d] to-[#2d4a7c] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <button
                onClick={() => navigate("/workload/dept/assignments")}
                className="flex items-center text-blue-200 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Assignments
              </button>

              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {assignment.course_code} - {assignment.course_title}
                  </h1>
                  <p className="text-blue-100 mb-6">
                    Course Assignment Details • {assignment.semester_name}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-blue-300" />
                      <span className="text-sm">
                        {assignment.credit_hours || 0} Credit Hours
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-300" />
                      <span className="text-sm">
                        Instructor: {assignment.staff_first_name}{" "}
                        {assignment.staff_last_name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Building className="w-5 h-5 mr-2 text-blue-300" />
                      <span className="text-sm">
                        {departmentDetails?.department_name || "Department"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div
                    className={`px-4 py-2 rounded-lg border ${statusConfig.color} flex items-center mb-3`}
                  >
                    <StatusIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{statusConfig.label}</span>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${programTypeConfig.color} flex items-center`}
                  >
                    <ProgramTypeIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">
                      {programTypeConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Action Bar */}
      

        <div className=" gap-8">
          {/* Left Column - Assignment Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Assignment Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Course Details
                      </label>
                      <div className="flex items-start">
                        <BookOpen className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {assignment.course_code} - {assignment.course_title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {courseDetails?.course_description ||
                              "No description available"}
                          </p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {assignment.credit_hours || 0} credit hours
                            {courseDetails?.lecture_hours && (
                              <span className="ml-3">
                                ({courseDetails.lecture_hours} lecture,{" "}
                                {courseDetails.lab_hours || 0} lab)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Instructor
                      </label>
                      <div className="flex items-center">
                        <UserCircle className="w-5 h-5 text-purple-600 mr-3" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {assignment.staff_first_name}{" "}
                            {assignment.staff_last_name}
                          </p>
                          <div className="flex items-center mt-1 space-x-3">
                            <span className="text-sm text-gray-600">
                              ID: {assignment.employee_id}
                            </span>
                            <span className="text-sm text-gray-600">
                              Rank:{" "}
                              {courseAssignmentUtils.formatAcademicRank(
                                assignment.academic_rank
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Semester & Academic Period
                      </label>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {assignment.semester_name} (
                            {assignment.semester_code})
                          </p>
                          {semesterDetails && (
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(semesterDetails.start_date)} -{" "}
                              {formatDate(semesterDetails.end_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Program & Student Details
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <School className="w-5 h-5 text-indigo-600 mr-3" />
                          <span className="font-medium">
                            {programTypeConfig.label}
                          </span>
                        </div>
                        {assignment.student_year && (
                          <div className="flex items-center">
                            <GraduationCap className="w-5 h-5 text-amber-600 mr-3" />
                            <span>Year {assignment.student_year} Students</span>
                          </div>
                        )}
                        {assignment.section_code && (
                          <div className="flex items-center">
                            <Layers className="w-5 h-5 text-teal-600 mr-3" />
                            <span>Section {assignment.section_code}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Department
                      </label>
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {departmentDetails?.department_name || "Department"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {departmentDetails?.department_code || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Assignment Timeline
                      </label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Assigned:</span>
                          <span className="font-medium">
                            {formatDate(assignment.assigned_date)}
                          </span>
                        </div>
                        {assignment.accepted_date && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Accepted:</span>
                            <span className="font-medium">
                              {formatDate(assignment.accepted_date)}
                            </span>
                          </div>
                        )}
                        {assignment.updated_at && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="font-medium">
                              {formatDate(assignment.updated_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {assignment.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Additional Notes
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {assignment.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Workload Analysis Card */}
            {workloadData && (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Workload Analysis
                    </h3>
                    {assignment.is_overload && (
                      <button
                        onClick={() =>
                          setShowOverloadDetails(!showOverloadDetails)
                        }
                        className="text-sm text-amber-600 hover:text-amber-800 flex items-center"
                      >
                        {showOverloadDetails ? (
                          <EyeOff className="w-4 h-4 mr-1" />
                        ) : (
                          <Eye className="w-4 h-4 mr-1" />
                        )}
                        {showOverloadDetails
                          ? "Hide Overload Details"
                          : "Show Overload Details"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {/* Workload Meter */}
                  <div className="mb-6">{renderWorkloadMeter()}</div>

                  {/* Workload Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 mb-1">
                        Current Hours
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {workloadData.current_workload?.total_hours?.toFixed(
                          1
                        ) || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 mb-1">
                        Maximum Limit
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {workloadData.limits?.rank_max || 0}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <p className="text-sm text-amber-600 mb-1">
                        Available Capacity
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.max(
                          0,
                          (workloadData.limits?.rank_max || 0) -
                            (workloadData.current_workload?.total_hours || 0)
                        ).toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-600 mb-1">
                        Overload Status
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {assignment.is_overload ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  {/* Overload Details */}
                  {showOverloadDetails && assignment.is_overload && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <h4 className="font-semibold text-red-800">
                          Overload Warning
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm text-red-700">
                        <p>
                          This assignment contributes to the instructor's
                          overload condition.
                        </p>
                        {assignment.overload_hours && (
                          <p>
                            Additional overload hours:{" "}
                            {assignment.overload_hours.toFixed(1)}
                          </p>
                        )}
                        <p>
                          Overload percentage:{" "}
                          {calculateWorkloadPercentage().toFixed(1)}%
                        </p>
                        {assignment.notes &&
                          assignment.notes.includes("OVERLOAD") && (
                            <p className="mt-2 font-medium">
                              Note: {assignment.notes.split("[OVERLOAD:")[0]}
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Assignment Breakdown */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Current Assignments Breakdown
                    </h4>
                    <div className="space-y-2">
                      {workloadData.assignments?.map((assgn, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 text-gray-500 mr-3" />
                            <span className="font-medium">
                              {assgn.course_code}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {assgn.estimated_load}h •{" "}
                            {assgn.credit_hours} credits
                          </div>
                        </div>
                      ))}
                      {(!workloadData.assignments ||
                        workloadData.assignments.length === 0) && (
                        <p className="text-gray-500 text-center py-4">
                          No other assignments found
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Log Card */}
            {auditLog.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <History className="w-5 h-5 mr-2 text-blue-600" />
                    Activity History
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {auditLog.slice(0, 5).map((log, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <ClockIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-gray-900">
                              {log.action}
                            </p>
                            <span className="text-sm text-gray-500">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {log.description}
                          </p>
                          {log.performed_by && (
                            <p className="text-xs text-gray-500 mt-1">
                              By: {log.performed_by}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

         
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">
                  Confirm Deletion
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this assignment? This action
                cannot be undone and will remove all related data.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAssignment;
