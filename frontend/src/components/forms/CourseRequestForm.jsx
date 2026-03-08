import React, { useState, useEffect } from "react";
import { courseRequestAPI, courseRequestUtils } from "../api";

const CourseRequestForm = ({ staffId }) => {
  const [formData, setFormData] = useState({
    course_id: "",
    semester_id: "",
    section_code: "",
    preferred_schedule: "",
    reason: "",
  });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableCourses();
  }, []);

  const loadAvailableCourses = async () => {
    try {
      const result = await courseRequestAPI.getAvailableCourses();
      setAvailableCourses(result.courses || []);
    } catch (error) {
      console.error("Failed to load available courses:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = courseRequestUtils.validateRequestData(formData);
    if (Object.keys(errors).length > 0) {
      alert("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const requestData = courseRequestUtils.prepareRequestFormData({
        ...formData,
        staff_id: staffId, // From props or context
      });

      const result = await courseRequestAPI.createRequest(requestData);

      alert("Course request submitted successfully!");
      // Reset form
      setFormData({
        course_id: "",
        semester_id: "",
        section_code: "",
        preferred_schedule: "",
        reason: "",
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-request-form">
      <h2>Request Course</h2>

      <form onSubmit={handleSubmit}>
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
            {availableCourses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_code} - {course.course_title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Reason:</label>
          <textarea
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            placeholder="Explain why you want to teach this course..."
            rows="4"
            required
          />
          <small>Minimum 10 characters</small>
        </div>

        <div>
          <label>Preferred Schedule:</label>
          <input
            type="text"
            value={formData.preferred_schedule}
            onChange={(e) =>
              setFormData({ ...formData, preferred_schedule: e.target.value })
            }
            placeholder="e.g., Monday-Wednesday 8-10 AM"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default CourseRequestForm;
