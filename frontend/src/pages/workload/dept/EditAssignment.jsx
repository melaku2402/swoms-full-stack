// src/pages/workload/dept/EditAssignment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  BookOpen,
  User,
  Calendar,
  Hash,
  FileText,
  AlertTriangle,
  Users,
  Clock,
  GraduationCap,
  Building,
  Shield,
  Zap,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  courseAssignmentAPI,
  courseAssignmentUtils,
} from "../../../api/";
import toast from "react-hot-toast";
import Select from "react-select";
import AsyncSelect from "react-select/async";

const EditAssignment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingFeasibility, setCheckingFeasibility] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    semester_id: "",
    staff_id: "",
    student_year: "",
    section_code: "",
    program_type: "regular",
    notes: "",
    confirm_overload: false,
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [formOptions, setFormOptions] = useState({
    semesters: [],
    programTypes: [],
    studentYears: [],
    availableSections: [],
    usedSections: [],
  });
  const [overloadWarning, setOverloadWarning] = useState(null);
  const [feasibilityData, setFeasibilityData] = useState(null);
  const [staffWorkload, setStaffWorkload] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [instructorDetails, setInstructorDetails] = useState(null);
  const [semesterDetails, setSemesterDetails] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchAssignmentData();
    fetchStaticFormOptions();
  }, [id]);

  useEffect(() => {
    // Check if any field has changed
    const changed = Object.keys(formData).some((key) => {
      if (key === "confirm_overload") return false; // Don't count this as a change
      return formData[key] !== originalData[key];
    });
    setHasChanges(changed);
  }, [formData, originalData]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      const response = await courseAssignmentAPI.getAssignmentById(id);

      if (response.success && response.data) {
        const assignment = response.data;

        // Store original data for comparison
        const initialData = {
          course_id: assignment.course_id?.toString(),
          semester_id: assignment.semester_id?.toString(),
          staff_id: assignment.staff_id?.toString(),
          student_year: assignment.student_year?.toString() || "",
          section_code: assignment.section_code || "",
          program_type: assignment.program_type || "regular",
          notes: assignment.notes || "",
          confirm_overload: assignment.is_overload || false,
        };

        setFormData(initialData);
        setOriginalData(initialData);

        // Store details
        setCourseDetails({
          id: assignment.course_id,
          code: assignment.course_code,
          title: assignment.course_title,
          credits: assignment.credit_hours,
        });

        setInstructorDetails({
          id: assignment.staff_id,
          name: `${assignment.staff_first_name} ${assignment.staff_last_name}`,
          employee_id: assignment.employee_id,
          rank: assignment.academic_rank,
        });

        setSemesterDetails({
          id: assignment.semester_id,
          name: assignment.semester_name,
          code: assignment.semester_code,
        });

        // Fetch available sections for this course and semester
        await fetchAvailableSections(
          assignment.course_id,
          assignment.semester_id
        );

        // Check feasibility for current assignment
        await checkFeasibility(initialData);
      } else {
        toast.error("Failed to load assignment data");
        navigate("/workload/dept/assignments");
      }
    } catch (error) {
      console.error("Error fetching assignment:", error);
      toast.error("Failed to load assignment data");
      navigate("/workload/dept/assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaticFormOptions = async () => {
    try {
      const [programTypesRes, studentYearsRes, formDataRes] = await Promise.all(
        [
          courseAssignmentAPI.getProgramTypes(),
          courseAssignmentAPI.getStudentYears(),
          courseAssignmentAPI.getAssignmentFormData(),
        ]
      );

      setFormOptions((prev) => ({
        ...prev,
        programTypes: programTypesRes.data || [],
        studentYears: studentYearsRes.data || [],
        semesters: formDataRes.data?.semesters || [],
      }));
    } catch (error) {
      console.error("Error fetching form options:", error);
      toast.error("Failed to load form options");
    }
  };

  const fetchAvailableSections = async (courseId, semesterId) => {
    if (!courseId || !semesterId) return;

    try {
      const response = await courseAssignmentAPI.getAvailableSections(
        courseId,
        semesterId
      );

      console.log(response.data);
      

      if (response.success) {
        setFormOptions((prev) => ({
          ...prev,
          availableSections: response.data?.available || [],
          usedSections: response.data?.used || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching available sections:", error);
    }
  };

  const loadCourses = async (inputValue) => {
    try {
      const response = await courseAssignmentAPI.getCoursesForAssignmentForm({
        search: inputValue,
        semester_id: formData.semester_id,
      });

      if (response.success) {
        return (response.data?.courses || []).map((course) => ({
          value: course.course_id,
          label: `${course.course_code} - ${course.course_title}`,
          credits: course.credit_hours,
          program_type: course.program_type,
          year: course.course_year,
          semester: course.course_semester,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading courses:", error);
      return [];
    }
  };

  const loadInstructors = async (inputValue) => {
    try {
      const response = await courseAssignmentAPI.getInstructorsForAssignment({
        search: inputValue,
        semester_id: formData.semester_id,
        available_only: "false", // Show all for edit mode
      });

      if (response.success) {
        return (response.data?.instructors || []).map((instructor) => ({
          value: instructor.staff_id,
          label: `${instructor.first_name} ${instructor.last_name} (${instructor.employee_id})`,
          rank: instructor.academic_rank,
          workload: instructor.workload,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading instructors:", error);
      return [];
    }
  };

  const checkFeasibility = async (data = null) => {
    const checkData = data || formData;

    if (!checkData.course_id || !checkData.semester_id || !checkData.staff_id) {
      return;
    }

    setCheckingFeasibility(true);
    try {
      const response = await courseAssignmentAPI.checkFeasibility({
        course_id: checkData.course_id,
        semester_id: checkData.semester_id,
        staff_id: checkData.staff_id,
      });

      if (response.success && response.data) {
        const {
          is_feasible,
          is_overload,
          projection,
          risk_assessment,
          alternatives,
        } = response.data;
        setFeasibilityData(response.data);

        if (is_overload) {
          setOverloadWarning({
            title: "⚠️ Overload Warning",
            message: "This assignment would exceed workload limits",
            projection,
            risk_assessment,
            alternatives,
            is_feasible,
          });
        } else {
          setOverloadWarning(null);
        }

        // Fetch staff workload for display
        await fetchStaffWorkload(checkData.staff_id, checkData.semester_id);
      }
    } catch (error) {
      console.error("Error checking feasibility:", error);
      toast.error("Failed to check assignment feasibility");
    } finally {
      setCheckingFeasibility(false);
    }
  };

  const fetchStaffWorkload = async (staffId, semesterId) => {
    try {
      const response = await courseAssignmentAPI.getStaffWorkload(
        staffId,
        semesterId
      );
      if (response.success) {
        setStaffWorkload(response.data);
      }
    } catch (error) {
      console.error("Error fetching staff workload:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Handle side effects
    if (name === "course_id" || name === "semester_id") {
      // Re-fetch available sections
      if (formData.course_id && formData.semester_id) {
        fetchAvailableSections(formData.course_id, formData.semester_id);
      }
    }

    // Schedule feasibility check if key fields changed
    if (["course_id", "staff_id", "semester_id"].includes(name)) {
      setTimeout(() => {
        if (formData.course_id && formData.semester_id && formData.staff_id) {
          checkFeasibility();
        }
      }, 1000);
    }
  };

  const handleSelectChange = (selectedOption, { name }) => {
    const newValue = selectedOption?.value || "";

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Update details based on selection
    if (name === "course_id" && selectedOption) {
      setCourseDetails({
        id: selectedOption.value,
        code: selectedOption.label.split(" - ")[0],
        title: selectedOption.label.split(" - ")[1],
        credits: selectedOption.credits,
      });
    }

    if (name === "staff_id" && selectedOption) {
      setInstructorDetails({
        id: selectedOption.value,
        name: selectedOption.label.split(" (")[0],
        employee_id: selectedOption.label.match(/\((.*?)\)/)?.[1] || "",
        rank: selectedOption.rank,
      });
    }

    if (name === "semester_id" && selectedOption) {
      setSemesterDetails({
        id: selectedOption.value,
        name: selectedOption.label.split(" (")[0],
        code: selectedOption.label.match(/\((.*?)\)/)?.[1] || "",
      });

      // Reset course and instructor when semester changes
      setFormData((prev) => ({
        ...prev,
        course_id: "",
        staff_id: "",
      }));
      setCourseDetails(null);
      setInstructorDetails(null);
    }

    // Trigger feasibility check after a delay
    setTimeout(() => {
      if (formData.course_id && formData.semester_id && formData.staff_id) {
        checkFeasibility();
      }
    }, 500);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course_id) {
      newErrors.course_id = "Course is required";
    }
    if (!formData.semester_id) {
      newErrors.semester_id = "Semester is required";
    }
    if (!formData.staff_id) {
      newErrors.staff_id = "Instructor is required";
    }
    if (
      formData.student_year &&
      (parseInt(formData.student_year) < 1 ||
        parseInt(formData.student_year) > 7)
    ) {
      newErrors.student_year = "Student year must be between 1 and 7";
    }
    if (formData.section_code && !/^[A-Z]$/.test(formData.section_code)) {
      newErrors.section_code = "Section code must be a single letter A-Z";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Check for overload warning
    if (overloadWarning?.is_overload && !formData.confirm_overload) {
      toast.error("Please confirm the overload assignment");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        course_id: parseInt(formData.course_id),
        semester_id: parseInt(formData.semester_id),
        staff_id: parseInt(formData.staff_id),
        student_year: formData.student_year
          ? parseInt(formData.student_year)
          : null,
        section_code: formData.section_code || null,
        notes: formData.notes || null,
        program_type: formData.program_type,
        confirm_overload: formData.confirm_overload,
      };

      const response = await courseAssignmentAPI.updateAssignment(
        id,
        updateData
      );

      if (response.success) {
        toast.success("Assignment updated successfully");
        navigate("/workload/dept/assignments");
      } else {
        toast.error(response.message || "Failed to update assignment");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);

      // Handle specific error cases
      if (error.response?.status === 409) {
        toast.error(
          "This course is already assigned to the selected instructor"
        );
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update assignment. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?"
        )
      ) {
        navigate("/workload/dept/assignments");
      }
    } else {
      navigate("/workload/dept/assignments");
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    setOverloadWarning(null);
    setFeasibilityData(null);
    toast.success("Form reset to original values");
  };

  const renderRiskLevel = (level) => {
    const colors = {
      none: "bg-green-100 text-green-800 border-green-200",
      low: "bg-blue-100 text-blue-800 border-blue-200",
      moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200",
    };

    const icons = {
      none: <CheckCircle className="w-4 h-4" />,
      low: <AlertCircle className="w-4 h-4" />,
      moderate: <AlertTriangle className="w-4 h-4" />,
      high: <AlertTriangle className="w-4 h-4" />,
      critical: <AlertTriangle className="w-4 h-4" />,
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
          colors[level] || colors.moderate
        }`}
      >
        {icons[level] || icons.moderate}
        <span className="ml-1">{level?.toUpperCase() || "MODERATE"}</span>
      </span>
    );
  };

  const renderFeasibilityStatus = () => {
    if (!feasibilityData) return null;

    const { is_feasible, is_overload, risk_assessment } = feasibilityData;

    if (is_feasible && !is_overload) {
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h4 className="font-medium text-green-900">
                Assignment Feasible
              </h4>
              <p className="text-sm text-green-700 mt-1">
                This assignment is within workload limits and can be assigned.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-amber-600 mr-3" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-amber-900">Overload Detected</h4>
              {renderRiskLevel(risk_assessment?.level)}
            </div>
            <p className="text-sm text-amber-700 mt-1">
              {risk_assessment?.description ||
                "This assignment exceeds workload limits."}
            </p>
            {risk_assessment?.requires_approval && (
              <p className="text-sm text-amber-700 mt-2 font-medium">
                ⚠️ Requires dean approval for overload assignment
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading assignment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Assignment
            </h1>
            {hasChanges && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-gray-600">
            Update assignment details and check workload feasibility
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feasibility Status */}
          {renderFeasibilityStatus()}

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Assignment Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Edit the assignment information below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Semester *
                  </div>
                </label>
                <Select
                  name="semester_id"
                  value={formOptions.semesters.find(
                    (s) => s.semester_id.toString() === formData.semester_id
                  )}
                  onChange={handleSelectChange}
                  options={formOptions.semesters.map((s) => ({
                    value: s.semester_id,
                    label: `${s.semester_name} (${s.semester_code})`,
                    type: s.semester_type,
                  }))}
                  placeholder="Select a semester..."
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable
                  getOptionLabel={(option) => (
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {option.type}
                      </div>
                    </div>
                  )}
                />
                {errors.semester_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.semester_id}
                  </p>
                )}
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Course *
                  </div>
                </label>
                <AsyncSelect
                  name="course_id"
                  value={
                    formData.course_id
                      ? {
                          value: formData.course_id,
                          label: courseDetails
                            ? `${courseDetails.code} - ${courseDetails.title}`
                            : "Loading...",
                        }
                      : null
                  }
                  onChange={handleSelectChange}
                  loadOptions={loadCourses}
                  defaultOptions
                  placeholder="Search for a course..."
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable
                  cacheOptions
                  loadingMessage={() => "Loading courses..."}
                  noOptionsMessage={() => "No courses found"}
                  getOptionLabel={(option) => (
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">
                        {option.credits} credits • {option.program_type}
                      </div>
                    </div>
                  )}
                />
                {errors.course_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.course_id}
                  </p>
                )}
                {courseDetails && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{courseDetails.credits} credit hours</span>
                  </div>
                )}
              </div>

              {/* Instructor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Instructor *
                  </div>
                </label>
                <AsyncSelect
                  name="staff_id"
                  value={
                    formData.staff_id
                      ? {
                          value: formData.staff_id,
                          label: instructorDetails
                            ? `${instructorDetails.name} (${instructorDetails.employee_id})`
                            : "Loading...",
                        }
                      : null
                  }
                  onChange={handleSelectChange}
                  loadOptions={loadInstructors}
                  defaultOptions
                  placeholder="Search for an instructor..."
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable
                  cacheOptions
                  loadingMessage={() => "Loading instructors..."}
                  noOptionsMessage={() => "No instructors found"}
                  getOptionLabel={(option) => (
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">
                        {/* {courseAssignmentUtils.formatAcademicRank(option.rank)} */}
                      </div>
                    </div>
                  )}
                />
                {errors.staff_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.staff_id}</p>
                )}
              </div>

              {/* Program Type & Student Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Type
                  </label>
                  <select
                    name="program_type"
                    value={formData.program_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {formOptions.programTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Student Year
                    </div>
                  </label>
                  <select
                    name="student_year"
                    value={formData.student_year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Not specified</option>
                    {formOptions.studentYears.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  {errors.student_year && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.student_year}
                    </p>
                  )}
                </div>
              </div>

              {/* Section Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    Section Code
                  </div>
                  <span className="text-sm text-gray-500 font-normal">
                    Available:{" "}
                    {formOptions.availableSections.join(", ") || "None"} |
                    Taken: {formOptions.usedSections.join(", ") || "None"}
                  </span>
                </label>
                <select
                  name="section_code"
                  value={formData.section_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Not assigned</option>
                  {Array.from({ length: 26 }, (_, i) =>
                    String.fromCharCode(65 + i)
                  ).map((letter) => (
                    <option
                      key={letter}
                      value={letter}
                      className={
                        formOptions.usedSections.includes(letter)
                          ? "text-gray-400"
                          : ""
                      }
                    >
                      Section {letter}{" "}
                      {formOptions.usedSections.includes(letter)
                        ? "(Taken)"
                        : ""}
                    </option>
                  ))}
                </select>
                {errors.section_code && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.section_code}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </div>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about this assignment..."
                />
              </div>

              {/* Overload Confirmation */}
              {overloadWarning && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-red-900">
                          {overloadWarning.title}
                        </h3>
                        {renderRiskLevel(
                          overloadWarning.risk_assessment?.level
                        )}
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        {overloadWarning.message}
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-red-700">Current Load:</span>
                            <span className="ml-2 font-medium">
                              {overloadWarning.projection?.current_load
                                ?.total_hours || 0}
                              h
                            </span>
                          </div>
                          <div>
                            <span className="text-red-700">Course Adds:</span>
                            <span className="ml-2 font-medium">
                              {overloadWarning.projection?.proposed_addition
                                ?.course_load || 0}
                              h
                            </span>
                          </div>
                          <div>
                            <span className="text-red-700">
                              Projected Total:
                            </span>
                            <span className="ml-2 font-medium">
                              {overloadWarning.projection?.new_total || 0}h
                            </span>
                          </div>
                          <div>
                            <span className="text-red-700">Limit:</span>
                            <span className="ml-2 font-medium">
                              {overloadWarning.projection?.rank_limit || 0}h
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-red-100 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-red-800">
                              Overload:
                            </span>
                            <span className="font-bold text-red-900">
                              +{overloadWarning.projection?.overload_hours || 0}
                              h (
                              {overloadWarning.projection
                                ?.overload_percentage || 0}
                              %)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-start">
                        <input
                          type="checkbox"
                          id="confirm_overload"
                          name="confirm_overload"
                          checked={formData.confirm_overload}
                          onChange={handleChange}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                        />
                        <label
                          htmlFor="confirm_overload"
                          className="ml-2 text-sm text-red-700"
                        >
                          I acknowledge that this assignment exceeds workload
                          limits and may require additional approval. I confirm
                          to proceed with this overload assignment.
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {hasChanges ? "You have unsaved changes" : "No changes made"}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      (!hasChanges && !overloadWarning?.is_overload) ||
                      (overloadWarning?.is_overload &&
                        !formData.confirm_overload)
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Details & Workload */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Course</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {courseDetails?.code || "Not selected"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Instructor</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {instructorDetails?.name || "Not selected"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Semester</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {semesterDetails?.name || "Not selected"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Hash className="w-4 h-4 text-amber-500 mr-2" />
                  <span className="text-sm text-gray-600">Section</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formData.section_code || "Not assigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Workload Summary */}
          {feasibilityData && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Workload Analysis
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Current Load</span>
                    <span className="text-sm font-medium">
                      {feasibilityData.projection?.current_load?.total_hours ||
                        0}
                      h
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        feasibilityData.is_overload
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          ((feasibilityData.projection?.current_load
                            ?.total_hours || 0) /
                            (feasibilityData.projection?.rank_limit || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      With New Course
                    </span>
                    <span className="text-sm font-medium">
                      {feasibilityData.projection?.new_total || 0}h
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        feasibilityData.is_overload
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          ((feasibilityData.projection?.new_total || 0) /
                            (feasibilityData.projection?.rank_limit || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Limit</p>
                    <p className="text-lg font-bold text-gray-900">
                      {feasibilityData.projection?.rank_limit || 0}h
                    </p>
                  </div>
                  <div
                    className={`text-center p-3 rounded-lg ${
                      feasibilityData.projection?.available_capacity > 0
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">Available</p>
                    <p
                      className={`text-lg font-bold ${
                        feasibilityData.projection?.available_capacity > 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {feasibilityData.projection?.available_capacity || 0}h
                    </p>
                  </div>
                </div>

                {feasibilityData.is_overload && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-800">
                        Overload
                      </span>
                      <span className="text-sm font-bold text-red-900">
                        +{feasibilityData.projection?.overload_hours }h
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alternative Instructors */}
          {feasibilityData?.alternatives &&
            feasibilityData.alternatives.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Alternative Instructors
                </h3>
                <div className="space-y-3">
                  {feasibilityData.alternatives
                    .slice(0, 3)
                    .map((alt, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {alt.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {alt.employee_id}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                staff_id: alt.staff_id.toString(),
                              }));
                              setInstructorDetails({
                                id: alt.staff_id,
                                name: alt.name,
                                employee_id: alt.employee_id,
                                rank: alt.academic_rank,
                              });
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                          >
                            Select
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Shield className="w-3 h-3 mr-1" />
                            {courseAssignmentUtils.formatAcademicRank(
                              alt.academic_rank
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Available: {alt.available_capacity.toFixed(1)}h
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => checkFeasibility()}
                disabled={
                  checkingFeasibility ||
                  !formData.course_id ||
                  !formData.staff_id ||
                  !formData.semester_id
                }
                className="w-full flex items-center justify-between p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <Target className="w-4 h-4 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">
                    {checkingFeasibility ? "Checking..." : "Check Feasibility"}
                  </span>
                </div>
                <Zap className="w-4 h-4 text-blue-500" />
              </button>
              <button
                onClick={() => navigate(`/workload/dept/assignments`)}
                className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <ArrowLeft className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">
                    All Assignments
                  </span>
                </div>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">
                    Refresh Data
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAssignment;
