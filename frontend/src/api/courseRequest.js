import apiClient from "./client";

// ================ COURSE REQUEST API ================
export const courseRequestAPI = {
  // Create course request (instructor)
  createRequest: (data) => apiClient.post("/api/course-requests", data),

  // Get my requests (instructor)
  getMyRequests: (params = {}) =>
    apiClient.get("/api/course-requests/my", { params }),

  // Get available courses for request (instructor)
  getAvailableCourses: (params = {}) =>
    apiClient.get("/api/course-requests/available", { params }),

  // Cancel request (instructor)
  cancelRequest: (requestId) =>
    apiClient.put(`/api/course-requests/${requestId}/cancel`),

  // Get department requests (department head)
  getDepartmentRequests: (params = {}) =>
    apiClient.get("/api/course-requests/department", { params }),

  // Get pending requests (department head)
  getPendingRequests: (params = {}) =>
    apiClient.get("/api/course-requests/pending", { params }),

  // Approve request (department head)
  approveRequest: (requestId, notes = null) =>
    apiClient.put(`/api/course-requests/${requestId}/approve`, { notes }),

  // Reject request (department head)
  rejectRequest: (requestId, notes = null) =>
    apiClient.put(`/api/course-requests/${requestId}/reject`, { notes }),

  // Get request statistics
  getRequestStats: (params = {}) =>
    apiClient.get("/api/course-requests/stats", { params }),

  // Get request by ID
  getRequestById: (requestId) =>
    apiClient.get(`/api/course-requests/${requestId}`),
};

// ================ COURSE REQUEST UTILITY FUNCTIONS ================
export const courseRequestUtils = {
  // Format request status for display
  formatRequestStatus: (status) => {
    const statusMap = {
      pending: {
        text: "Pending",
        color: "warning",
        variant: "warning",
        icon: "⏳",
      },
      approved: {
        text: "Approved",
        color: "success",
        variant: "success",
        icon: "✅",
      },
      rejected: {
        text: "Rejected",
        color: "danger",
        variant: "danger",
        icon: "❌",
      },
      cancelled: {
        text: "Cancelled",
        color: "secondary",
        variant: "secondary",
        icon: "🚫",
      },
    };
    return (
      statusMap[status] || {
        text: status,
        color: "default",
        variant: "default",
        icon: "❓",
      }
    );
  },

  // Validate request data
  validateRequestData: (requestData) => {
    const errors = {};

    if (!requestData.course_id) {
      errors.course_id = "Course is required";
    }

    if (!requestData.semester_id) {
      errors.semester_id = "Semester is required";
    }

    if (!requestData.reason || requestData.reason.trim().length < 10) {
      errors.reason = "Reason must be at least 10 characters";
    }

    if (
      requestData.preferred_schedule &&
      requestData.preferred_schedule.length > 100
    ) {
      errors.preferred_schedule =
        "Preferred schedule must be less than 100 characters";
    }

    return errors;
  },

  // Prepare request form data
  prepareRequestFormData: (formData) => {
    return {
      course_id: parseInt(formData.course_id),
      semester_id: parseInt(formData.semester_id),
      staff_id: parseInt(formData.staff_id),
      section_code: formData.section_code || null,
      preferred_schedule: formData.preferred_schedule || null,
      reason: formData.reason.trim(),
    };
  },

  // Check if course is requestable (based on availability, workload, etc.)
  checkRequestability: (course, staffWorkload, rankLimits) => {
    const checks = {
      isAvailable: course.status === "active",
      hasCapacity: course.max_students > course.current_students || true, // Adjust based on your logic
      workloadCheck: true, // Add workload calculation
      timeConflict: false, // Add schedule conflict check
    };

    return {
      ...checks,
      isRequestable: Object.values(checks).every((check) => check === true),
      issues: Object.entries(checks)
        .filter(([key, value]) => value === false)
        .map(([key]) => key),
    };
  },

  // Calculate processing time
  calculateProcessingTime: (createdAt, processedDate) => {
    if (!processedDate) return "Still pending";

    const created = new Date(createdAt);
    const processed = new Date(processedDate);
    const diffHours = Math.abs(processed - created) / 36e5;

    if (diffHours < 1) {
      return `${Math.round(diffHours * 60)} minutes`;
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)} hours`;
    } else {
      return `${Math.round(diffHours / 24)} days`;
    }
  },

  // Generate request summary for notifications
  generateRequestSummary: (request) => {
    return {
      title: `Course Request: ${request.course_code}`,
      details: {
        Course: `${request.course_code} - ${request.course_title}`,
        Semester: request.semester_name,
        RequestedBy: `${request.requested_by_first_name} ${request.requested_by_last_name}`,
        Reason:
          request.reason.substring(0, 100) +
          (request.reason.length > 100 ? "..." : ""),
        Status: courseRequestUtils.formatRequestStatus(request.status).text,
        Submitted: new Date(request.created_at).toLocaleDateString(),
      },
    };
  },
};

// ================ HOOKS FOR REACT COMPONENTS ================
export const useCourseRequest = () => {
  // Custom hooks can be defined here
  return {
    // Hook implementations
  };
};
