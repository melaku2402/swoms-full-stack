import React, { useState, useEffect } from "react";
import { courseAssignmentAPI, courseAssignmentUtils } from "../api";

const CourseAssignmentForm = () => {
  const [formData, setFormData] = useState({
    course_id: "",
    semester_id: "",
    staff_id: "",
    section_code: "",
    notes: "",
    confirm_overload: false,
  });
  const [courses, setCourses] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feasibilityReport, setFeasibilityReport] = useState(null);

  // Load courses and staff on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Get active semester
      const [semestersResponse, coursesResponse] = await Promise.all([
        apiClient.get("/api/semesters/active"),
        courseAssignmentAPI.getCoursesForAssignment({
          unassigned_only: "true",
        }),
      ]);

      if (semestersResponse?.semesters?.[0]) {
        setFormData((prev) => ({
          ...prev,
          semester_id: semestersResponse.semesters[0].semester_id,
        }));
      }

      // Flatten courses from all programs
      const allCourses = Object.values(
        coursesResponse.courses_by_program || {}
      ).flatMap((program) => program.courses);
      setCourses(allCourses);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckFeasibility = async () => {
    try {
      const result = await courseAssignmentAPI.checkFeasibility({
        course_id: formData.course_id,
        semester_id: formData.semester_id,
        staff_id: formData.staff_id,
      });
      setFeasibilityReport(result);
    } catch (error) {
      console.error("Feasibility check failed:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = courseAssignmentUtils.validateAssignmentData(formData);
    if (Object.keys(errors).length > 0) {
      alert("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const assignmentData =
        courseAssignmentUtils.prepareAssignmentFormData(formData);
      const result = await courseAssignmentAPI.createAssignment(assignmentData);

      alert("Course assigned successfully!");
      // Reset form or redirect
      setFormData({
        course_id: "",
        semester_id: formData.semester_id, // Keep semester
        staff_id: "",
        section_code: "",
        notes: "",
        confirm_overload: false,
      });
      setFeasibilityReport(null);
    } catch (error) {
      // Handle overload warning
      if (error.status === 400 && error.data?.requires_confirmation) {
        const shouldProceed = window.confirm(
          `This assignment will cause overload. Do you want to proceed?\n\n` +
            `Overload: ${error.data.details.workload_analysis.overload_hours} hours\n` +
            `Risk Level: ${error.data.details.risk_assessment.level}`
        );

        if (shouldProceed) {
          // Retry with confirmation
          const retryData = { ...formData, confirm_overload: true };
          const assignmentData =
            courseAssignmentUtils.prepareAssignmentFormData(retryData);
          const result = await courseAssignmentAPI.createAssignment(
            assignmentData
          );
          alert("Course assigned with overload confirmation!");
        }
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="course-assignment-form">
      <h2>Assign Course</h2>

      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <div>
          <label>Course:</label>
          <select
            value={formData.course_id}
            onChange={(e) =>
              setFormData({ ...formData, course_id: e.target.value })
            }
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_code} - {course.course_title}
              </option>
            ))}
          </select>
        </div>

        {/* Other form fields for semester, staff, etc. */}

        {feasibilityReport && (
          <div className="feasibility-report">
            <h3>Feasibility Report</h3>
            <p>
              Status:{" "}
              {feasibilityReport.is_feasible ? "✅ Feasible" : "⚠️ Overload"}
            </p>
            {/* Display more details from feasibilityReport */}
          </div>
        )}

        <button type="button" onClick={handleCheckFeasibility}>
          Check Feasibility
        </button>

        <button type="submit" disabled={loading}>
          {loading ? "Assigning..." : "Assign Course"}
        </button>
      </form>
    </div>
  );
};

export default CourseAssignmentForm;
