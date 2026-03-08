

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { courseAssignmentAPI, courseAssignmentUtils } from "../../../api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Search,
  Filter,
  BookOpen,
  Users,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Plus,
  Save,
  Eye,
  Clock,
  TrendingUp,
  Shield,
  Building,
  GraduationCap,
  Layers,
  Hash,
  MessageSquare,
  AlertTriangle,
  Calculator,
  UserCheck,
  Award,
  CheckSquare,
  XSquare,
} from "lucide-react";

const CreateAssignment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    course_id: "",
    staff_id: "",
    semester_id: "",
    program_type: "regular",
    student_year: "",
    section_code: "",
    notes: "",
    confirm_overload: false,
  });

  // Loading states
  const [loading, setLoading] = useState({
    form: true,
    courses: false,
    instructors: false,
    sections: false,
    submitting: false,
    checking: false,
  });

  // Data states
  const [formOptions, setFormOptions] = useState({
    programTypes: [],
    studentYears: [],
    semesters: [],
    academicRanks: [],
    department: null,
    currentSemester: null,
  });

  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Validation and checking
  const [validationErrors, setValidationErrors] = useState({});
  const [feasibilityResult, setFeasibilityResult] = useState(null);
  const [workloadInfo, setWorkloadInfo] = useState(null);
  const [showFeasibilityDetails, setShowFeasibilityDetails] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    program_type: "",
    student_year: "",
    search: "",
    available_only: true,
  });

  // Fetch initial form data
  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setLoading((prev) => ({ ...prev, form: true }));

      const response = await courseAssignmentAPI.getAssignmentFormData();
      if (response.data) {
        setFormOptions({
          programTypes: response.data.program_types || [],
          studentYears: response.data.student_years || [],
          semesters: response.data.semesters || [],
          academicRanks: response.data.academic_ranks || [],
          department: response.data.department,
          currentSemester: response.data.current_semester,
        });

        // Set default semester
        if (response.data.current_semester) {
          setFormData((prev) => ({
            ...prev,
            semester_id: response.data.current_semester.semester_id,
          }));
        }

        // Fetch initial data
        await fetchCourses();
        await fetchInstructors();
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
      toast.error("Failed to load form data");

      // Set default options if API fails
      setFormOptions({
        programTypes: [
          { value: "regular", label: "Regular Program" },
          { value: "extension", label: "Extension Program" },
          { value: "summer", label: "Summer Program" },
          { value: "distance", label: "Distance Education" },
          { value: "weekend", label: "Weekend Program" },
        ],
        studentYears: Array.from({ length: 7 }, (_, i) => ({
          value: i + 1,
          label: `Year ${i + 1}`,
        })),
        semesters: [],
        academicRanks: [
          "lecturer",
          "assistant_professor",
          "associate_professor",
          "professor",
        ],
      });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, courses: true }));

      const params = {
        program_type: filters.program_type || undefined,
        student_year: filters.student_year || undefined,
        search: filters.search || undefined,
        semester_id: formData.semester_id || undefined,
      };

      const response = await courseAssignmentAPI.getCoursesForAssignmentForm(
        params
      );
      if (response.data?.courses) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  }, [filters, formData.semester_id]);

  // Fetch instructors
  const fetchInstructors = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, instructors: true }));

      const params = {
        semester_id: formData.semester_id || undefined,
        available_only: filters.available_only,
        academic_rank: filters.academic_rank || undefined,
        search: filters.instructor_search || undefined,
      };

      const response = await courseAssignmentAPI.getInstructorsForAssignment(
        params
      );
      if (response.data?.instructors) {
        setInstructors(response.data.instructors);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast.error("Failed to load instructors");
    } finally {
      setLoading((prev) => ({ ...prev, instructors: false }));
    }
  }, [filters, formData.semester_id]);

  // Fetch available sections when course and semester are selected
  const fetchAvailableSections = useCallback(async () => {
    if (formData.course_id && formData.semester_id) {
      try {
        setLoading((prev) => ({ ...prev, sections: true }));

        const response = await courseAssignmentAPI.getAvailableSections(
          formData.course_id,
          formData.semester_id
        );

        if (response.data) {
          setAvailableSections(response.data.available || []);

          // Auto-select first available section
          if (response.data.suggested?.[0] && !formData.section_code) {
            setFormData((prev) => ({
              ...prev,
              section_code: response.data.suggested[0],
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching sections:", error);
      } finally {
        setLoading((prev) => ({ ...prev, sections: false }));
      }
    }
  }, [formData.course_id, formData.semester_id, formData.section_code]);


  
  // Handle form changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };

      // Reset dependent fields
      if (field === "course_id") {
        newFormData.section_code = "";
        setSelectedCourse(courses.find((c) => c.course_id == value));
      }

      if (field === "staff_id") {
        setSelectedInstructor(instructors.find((i) => i.staff_id == value));
      }

      return newFormData;
    });

    // Clear validation errors for this field
    setValidationErrors((prev) => ({ ...prev, [field]: undefined }));

    // Clear feasibility result when relevant fields change
    if (["course_id", "staff_id", "semester_id"].includes(field)) {
      setFeasibilityResult(null);
      setWorkloadInfo(null);
      setShowFeasibilityDetails(false);
    }
    
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Check feasibility - FIXED VERSION
  const checkFeasibility = async () => {
    if (!formData.course_id || !formData.staff_id || !formData.semester_id) {
      toast.error("Please select course, instructor, and semester first");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, checking: true }));

      const data = {
        course_id: formData.course_id,
        staff_id: formData.staff_id,
        semester_id: formData.semester_id,
      };

      const response = await courseAssignmentAPI.checkFeasibility(data);

      if (response.data) {
        setFeasibilityResult(response.data);
        setWorkloadInfo(response.data);
        setShowFeasibilityDetails(true);

        // Show appropriate message based on the result
        if (response.data.is_already_assigned) {
          toast.error("⚠️ This assignment already exists");
        } else if (response.data.is_feasible) {
          toast.success("✓ Assignment is feasible!");
        } else {
          toast.error("⚠️ Assignment would cause overload");
        }
      } else {
        toast.error("Failed to check feasibility. Please try again.");
      }
    } catch (error) {
      console.error("Error checking feasibility:", error);

      // Handle different types of errors
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes("already assigned")) {
          toast.error("This course is already assigned to this instructor");
          setFeasibilityResult({
            is_feasible: false,
            is_already_assigned: true,
            staff_name:
              selectedInstructor?.first_name +
              " " +
              selectedInstructor?.last_name,
            course_code: selectedCourse?.course_code,
            message: "Course already assigned to this instructor",
          });
          setShowFeasibilityDetails(true);
        } else {
          toast.error(
            error.response.data?.message || "Invalid data for feasibility check"
          );
        }
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to check feasibility");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Failed to check feasibility. Please try again.");
      }
    } finally {
      setLoading((prev) => ({ ...prev, checking: false }));
    }
  };

  // Calculate workload
  const calculateWorkload = () => {
    if (!selectedCourse || !selectedInstructor) return null;

    const courseLoad = (selectedCourse.credit_hours || 0) * 1.5;
    const currentLoad = selectedInstructor.workload?.current_hours || 0;
    const maxLoad = selectedInstructor.workload?.max_load || 12;

    const projectedTotal = currentLoad + courseLoad;
    const overloadHours = Math.max(0, projectedTotal - maxLoad);
    const overloadPercentage =
      maxLoad > 0 ? (overloadHours / maxLoad) * 100 : 0;

    return {
      isOverload: overloadHours > 0,
      overloadHours,
      overloadPercentage: parseFloat(overloadPercentage.toFixed(1)),
      projectedTotal,
      currentLoad,
      maxLoad,
      courseLoad,
    };
  };

  // Validate form
  const validateForm = () => {
    const errors = courseAssignmentUtils.validateAssignmentData(formData);

    // Additional custom validation
    if (feasibilityResult?.is_already_assigned) {
      errors.general = "This assignment already exists";
    }

    if (
      feasibilityResult &&
      !feasibilityResult.is_feasible &&
      !formData.confirm_overload
    ) {
      errors.confirm_overload = "Please confirm overload to proceed";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission - FIXED VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if assignment already exists
    if (feasibilityResult?.is_already_assigned) {
      toast.error(
        "This assignment already exists. Please select different options."
      );
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // If not feasible and not confirmed, show warning
    if (
      feasibilityResult &&
      !feasibilityResult.is_feasible &&
      !formData.confirm_overload
    ) {
      const confirmed = window.confirm(
        "This assignment will cause overload.\n\n" +
          "Current: " +
          feasibilityResult.current_load?.total_hours?.toFixed(1) +
          " hours\n" +
          "Course adds: " +
          feasibilityResult.proposed_addition?.course_load?.toFixed(1) +
          " hours\n" +
          "Projected total: " +
          feasibilityResult.projection?.new_total?.toFixed(1) +
          " hours\n" +
          "Maximum allowed: " +
          feasibilityResult.projection?.rank_limit +
          " hours\n" +
          "Overload: " +
          feasibilityResult.projection?.overload_hours?.toFixed(1) +
          " hours\n\n" +
          "Are you sure you want to proceed?"
      );

      if (!confirmed) return;
      setFormData((prev) => ({ ...prev, confirm_overload: true }));
    }

    try {
      setLoading((prev) => ({ ...prev, submitting: true }));

      const response = await courseAssignmentAPI.createAssignment(formData);

      if (response.success) {
        toast.success("✅ Assignment created successfully!");

        // Show success message with details
        const message = `Course "${response.data?.details?.course_code}" assigned to ${response.data?.details?.staff_name}`;
        toast.success(message, { duration: 5000 });

        // Navigate back to assignments list
        setTimeout(() => {
          navigate("/workload/dept/assignments");
        }, 1500);
      } else {
        toast.error(response.message || "Failed to create assignment");
      }
    } catch (error) {
      console.error("Error creating assignment:", error);

      // Handle specific errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;

        if (errorData?.details) {
          // Handle overload warning response
          if (errorData.requires_confirmation) {
            setFeasibilityResult({
              is_feasible: false,
              ...errorData.details,
            });
            setShowFeasibilityDetails(true);
            toast.error(errorData.message || "Overload detected");
          } else {
            toast.error(errorData.message || "Invalid data");
          }
        } else {
          toast.error(error.response.data?.message || "Invalid request data");
        }
      } else if (error.response?.status === 409) {
        toast.error("This assignment already exists");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create assignment"
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      course_id: "",
      staff_id: "",
      semester_id: formOptions.currentSemester?.semester_id || "",
      program_type: "regular",
      student_year: "",
      section_code: "",
      notes: "",
      confirm_overload: false,
    });
    setSelectedCourse(null);
    setSelectedInstructor(null);
    setFeasibilityResult(null);
    setWorkloadInfo(null);
    setValidationErrors({});
    setShowFeasibilityDetails(false);
    toast.success("Form reset");
  };

  // Get course description
  const getCourseDescription = (course) => {
    return `${course.credit_hours || 0} credit hours • ${
      course.program_type || "Regular"
    } • Year ${course.course_year || "N/A"}`;
  };

  // Get instructor description
  // const getInstructorDescription = (instructor) => {
  //   const rank = courseAssignmentUtils.formatAcademicRank(instructor.academic_rank);
  //   const load = instructor.workload ? `${instructor.workload.current_hours}/${instructor.workload.max_load} hours` : 'N/A';
  //   return `${rank} • ${load} • ${instructor.employment_type || 'Full-time'}`;
  // };

  // In the CreateAssignment component, update the getInstructorDescription function:

  const getInstructorDescription = (instructor) => {
    if (!instructor) return "";
    const rank = courseAssignmentUtils.formatAcademicRank(
      instructor.academic_rank
    );

    if (instructor.workload) {
      const current = instructor.workload.current_hours || 0;
      const max = instructor.workload.max_hours || 12; // Default to 12 if undefined
      const status = instructor.workload.status || "Unknown";
      const loadString = `${current}/${max} hours • ${status}`;
      const employmentType = instructor.employment_type
        ? instructor.employment_type.replace("_", " ")
        : "Full-time";

      return `${rank} • ${loadString} • ${employmentType}`;
    } else {
      return `${rank} • Workload info unavailable`;
    }
  };
  // Quick selection handlers
  const handleQuickSelect = (type, id) => {
    switch (type) {
      case "course":
        handleFormChange("course_id", id);
        break;
      case "instructor":
        handleFormChange("staff_id", id);
        break;
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchCourses();
    fetchInstructors();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      program_type: "",
      student_year: "",
      search: "",
      available_only: true,
    });
    fetchCourses();
    fetchInstructors();
  };

  // Auto-check feasibility when all required fields are filled
  useEffect(() => {
    if (formData.course_id && formData.staff_id && formData.semester_id) {
      const timer = setTimeout(() => {
        checkFeasibility();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [formData.course_id, formData.staff_id, formData.semester_id]);

  // Fetch sections when course or semester changes
  useEffect(() => {
    fetchAvailableSections();
  }, [formData.course_id, formData.semester_id]);

  // Calculate local workload
  const localWorkload = calculateWorkload();

  if (loading.form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate("/workload/dept/assignments")}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assignments
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Course Assignment
              </h1>
              <p className="text-gray-600 mt-2">
                Assign courses to instructors with detailed workload calculation
              </p>
            </div>
            <div className="flex items-center gap-3">
              {formOptions.department && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-4 h-4 mr-2" />
                  {formOptions.department.department_name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h2>
                  <div className="text-sm text-gray-500">Step 1 of 4</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Course Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      Course *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.course_id}
                        onChange={(e) =>
                          handleFormChange("course_id", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.course_id
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      >
                        <option value="">Select a course...</option>
                        {courses.map((course) => (
                          <option
                            key={course.course_id}
                            value={course.course_id}
                          >
                            {course.course_code} - {course.course_title}
                          </option>
                        ))}
                      </select>
                      {loading.courses && (
                        <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </div>
                    {validationErrors.course_id && (
                      <p className="text-sm text-red-600">
                        {validationErrors.course_id}
                      </p>
                    )}
                    {selectedCourse && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-blue-900">
                              {selectedCourse.course_title}
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              {getCourseDescription(selectedCourse)}
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              Program:{" "}
                              {selectedCourse.program_name || "General"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              {selectedCourse.credit_hours || 0} credits
                            </p>
                            <p className="text-sm text-blue-500">
                              ≈ {(selectedCourse.credit_hours || 0) * 1.5} hours
                              workload
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instructor Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Users className="w-4 h-4 inline mr-1" />
                      Instructor *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.staff_id}
                        onChange={(e) =>
                          handleFormChange("staff_id", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.staff_id
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      >
                        <option value="">Select an instructor...</option>
                        {instructors.map((instructor) => (
                          <option
                            key={instructor.staff_id}
                            value={instructor.staff_id}
                          >
                            {instructor.first_name} {instructor.last_name} (
                            {instructor.employee_id})
                          </option>
                        ))}
                      </select>
                      {loading.instructors && (
                        <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </div>
                    {validationErrors.staff_id && (
                      <p className="text-sm text-red-600">
                        {validationErrors.staff_id}
                      </p>
                    )}
                    {selectedInstructor && (
                      <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-purple-900">
                              {selectedInstructor.first_name}{" "}
                              {selectedInstructor.last_name}
                            </p>
                            <p className="text-sm text-purple-700 mt-1">
                              {getInstructorDescription(selectedInstructor)}
                            </p>
                          </div>
                          <div className="text-right">
                            {selectedInstructor.workload && (
                              <>
                                <div
                                  className={`text-lg font-bold ${
                                    selectedInstructor.workload
                                      .load_percentage > 100
                                      ? "text-red-600"
                                      : selectedInstructor.workload
                                          .load_percentage > 80
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {selectedInstructor.workload
                                    .load_percentage || 0}
                                  %
                                </div>
                                <p className="text-sm text-purple-500">
                                  {selectedInstructor.workload.status}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Program Details Card */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                    Program Details
                  </h2>
                  <div className="text-sm text-gray-500">Step 2 of 4</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Program Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Program Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                      {formOptions.programTypes.map((program) => (
                        <button
                          key={program.value}
                          type="button"
                          onClick={() =>
                            handleFormChange("program_type", program.value)
                          }
                          className={`flex items-center justify-center p-3 border rounded-lg text-sm font-medium transition-colors ${
                            formData.program_type === program.value
                              ? "bg-blue-50 border-blue-300 text-blue-700"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {program.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Student Year */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Student Year (1-7)
                    </label>
                    <select
                      value={formData.student_year}
                      onChange={(e) =>
                        handleFormChange("student_year", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select year (optional)</option>
                      {formOptions.studentYears.map((year) => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Semester *
                    </label>
                    <select
                      value={formData.semester_id}
                      onChange={(e) =>
                        handleFormChange("semester_id", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.semester_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">Select semester...</option>
                      {formOptions.semesters.map((semester) => (
                        <option
                          key={semester.semester_id}
                          value={semester.semester_id}
                        >
                          {semester.semester_name} ({semester.semester_code})
                        </option>
                      ))}
                    </select>
                    {validationErrors.semester_id && (
                      <p className="text-sm text-red-600">
                        {validationErrors.semester_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section and Notes Card */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-orange-600" />
                    Section & Notes
                  </h2>
                  <div className="text-sm text-gray-500">Step 3 of 4</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Section Code */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Hash className="w-4 h-4 inline mr-1" />
                      Section Code
                    </label>
                    <div className="relative">
                      <select
                        value={formData.section_code}
                        onChange={(e) =>
                          handleFormChange("section_code", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Auto-select (optional)</option>
                        {availableSections.map((section) => (
                          <option key={section} value={section}>
                            Section {section}
                          </option>
                        ))}
                      </select>
                      {loading.sections && (
                        <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Available sections:{" "}
                      {availableSections.join(", ") || "All taken"}
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleFormChange("notes", e.target.value)
                      }
                      rows={3}
                      placeholder="Add any special instructions or notes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Workload Validation Card */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-red-600" />
                    Workload Validation
                  </h2>
                  <div className="text-sm text-gray-500">Step 4 of 4</div>
                </div>

                {feasibilityResult || localWorkload ? (
                  <div
                    className={`p-4 rounded-lg ${
                      feasibilityResult?.is_feasible !== false &&
                      !localWorkload?.isOverload
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          {feasibilityResult?.is_feasible !== false &&
                          !localWorkload?.isOverload ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                          )}
                          <h3 className="font-bold text-lg">
                            {feasibilityResult?.is_already_assigned
                              ? "Assignment Already Exists"
                              : feasibilityResult?.is_feasible !== false &&
                                !localWorkload?.isOverload
                              ? "Assignment is Feasible"
                              : "Overload Warning"}
                          </h3>
                        </div>
                        <p className="text-sm mt-2">
                          {feasibilityResult?.is_already_assigned
                            ? "This course is already assigned to this instructor."
                            : feasibilityResult?.risk_assessment?.description ||
                              (localWorkload?.isOverload
                                ? "This assignment would exceed the instructor's workload limit."
                                : "Assignment is within acceptable workload limits.")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setShowFeasibilityDetails(!showFeasibilityDetails)
                        }
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {showFeasibilityDetails
                          ? "Hide Details"
                          : "Show Details"}
                        <ChevronDown
                          className={`w-4 h-4 ml-1 transition-transform ${
                            showFeasibilityDetails ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {showFeasibilityDetails && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Current Load</p>
                            <p className="text-lg font-bold">
                              {feasibilityResult?.current_load?.total_hours?.toFixed(
                                1
                              ) ||
                                localWorkload?.currentLoad?.toFixed(1) ||
                                0}{" "}
                              hours
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Course Adds</p>
                            <p className="text-lg font-bold">
                              {feasibilityResult?.proposed_addition?.course_load?.toFixed(
                                1
                              ) ||
                                localWorkload?.courseLoad?.toFixed(1) ||
                                0}{" "}
                              hours
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Projected Total
                            </p>
                            <p className="text-lg font-bold">
                              {feasibilityResult?.projection?.new_total?.toFixed(
                                1
                              ) ||
                                localWorkload?.projectedTotal?.toFixed(1) ||
                                0}{" "}
                              hours
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Maximum Allowed
                            </p>
                            <p className="text-lg font-bold">
                              {feasibilityResult?.projection?.rank_limit ||
                                localWorkload?.maxLoad ||
                                0}{" "}
                              hours
                            </p>
                          </div>
                        </div>

                        {(feasibilityResult?.is_feasible === false ||
                          localWorkload?.isOverload) &&
                          !feasibilityResult?.is_already_assigned && (
                            <div className="mt-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="confirm_overload"
                                  checked={formData.confirm_overload}
                                  onChange={(e) =>
                                    handleFormChange(
                                      "confirm_overload",
                                      e.target.checked
                                    )
                                  }
                                  className="rounded border-gray-300"
                                />
                                <label
                                  htmlFor="confirm_overload"
                                  className="text-sm"
                                >
                                  I confirm this overload assignment
                                </label>
                              </div>
                              {validationErrors.confirm_overload && (
                                <p className="text-sm text-red-600 mt-1">
                                  {validationErrors.confirm_overload}
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Select course, instructor, and semester to check
                      feasibility
                    </p>
                    <button
                      type="button"
                      onClick={checkFeasibility}
                      disabled={
                        !formData.course_id ||
                        !formData.staff_id ||
                        !formData.semester_id ||
                        loading.checking
                      }
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.checking ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        "Check Feasibility"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Reset Form
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/workload/dept/assignments")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading.submitting ||
                      feasibilityResult?.is_already_assigned
                    }
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {feasibilityResult?.is_already_assigned
                          ? "Assignment Exists"
                          : "Create Assignment"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Filters & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Filters Card */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-gray-500" />
                Quick Filters
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Type Filter
                  </label>
                  <select
                    value={filters.program_type}
                    onChange={(e) =>
                      handleFilterChange("program_type", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Programs</option>
                    {formOptions.programTypes.map((program) => (
                      <option key={program.value} value={program.value}>
                        {program.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Year Filter
                  </label>
                  <select
                    value={filters.student_year}
                    onChange={(e) =>
                      handleFilterChange("student_year", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Years</option>
                    {formOptions.studentYears.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Courses
                  </label>
                  <input
                    type="text"
                    placeholder="Search by code or title..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Selection Card */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-gray-500" />
                Quick Selection
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Available Instructors
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {instructors
                      .filter((i) => i.workload?.is_available)
                      .slice(0, 5)
                      .map((instructor) => (
                        <button
                          key={instructor.staff_id}
                          type="button"
                          onClick={() =>
                            handleQuickSelect("instructor", instructor.staff_id)
                          }
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            formData.staff_id == instructor.staff_id
                              ? "bg-blue-50 border-blue-300"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="font-medium">
                            {instructor.first_name} {instructor.last_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {instructor.workload?.available_hours || 0} hours
                            available
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Popular Courses
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {courses.slice(0, 5).map((course) => (
                      <button
                        key={course.course_id}
                        type="button"
                        onClick={() =>
                          handleQuickSelect("course", course.course_id)
                        }
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          formData.course_id == course.course_id
                            ? "bg-green-50 border-green-300"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium">{course.course_code}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {course.course_title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Summary Card */}
            {(selectedCourse || selectedInstructor) && (
              <div className="bg-white rounded-xl border p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-gray-500" />
                  Assignment Summary
                </h3>

                <div className="space-y-4">
                  {selectedCourse && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">
                        Selected Course
                      </p>
                      <p className="text-sm text-blue-700">
                        {selectedCourse.course_code}
                      </p>
                      <p className="text-xs text-blue-600 truncate">
                        {selectedCourse.course_title}
                      </p>
                    </div>
                  )}

                  {selectedInstructor && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-900">
                        Selected Instructor
                      </p>
                      <p className="text-sm text-purple-700">
                        {selectedInstructor.first_name}{" "}
                        {selectedInstructor.last_name}
                      </p>
                      <p className="text-xs text-purple-600">
                        {selectedInstructor.workload?.current_hours || 0} /{" "}
                        {selectedInstructor.workload?.max_load || 0} hours
                      </p>
                    </div>
                  )}

                  {feasibilityResult && (
                    <div
                      className={`p-3 rounded-lg ${
                        feasibilityResult.is_already_assigned
                          ? "bg-yellow-50"
                          : feasibilityResult.is_feasible
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Feasibility</p>
                          <p
                            className={`text-sm ${
                              feasibilityResult.is_already_assigned
                                ? "text-yellow-700"
                                : feasibilityResult.is_feasible
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {feasibilityResult.is_already_assigned
                              ? "Already Assigned"
                              : feasibilityResult.is_feasible
                              ? "Feasible"
                              : "Overload"}
                          </p>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            feasibilityResult.is_already_assigned
                              ? "text-yellow-600"
                              : feasibilityResult.is_feasible
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {feasibilityResult.risk_assessment?.level?.toUpperCase() ||
                            (feasibilityResult.is_already_assigned
                              ? "EXISTS"
                              : "CHECK")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Help & Tips Card */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-gray-500" />
                Help & Tips
              </h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Required Fields</p>
                    <p className="text-xs text-gray-600">
                      Course, Instructor, and Semester are required
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Overload Warnings</p>
                    <p className="text-xs text-gray-600">
                      Always check feasibility before assigning
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckSquare className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Best Practices</p>
                    <p className="text-xs text-gray-600">
                      Keep instructor workload below 80% capacity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;