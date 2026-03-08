import apiClient from "./client";

// ================ SECTION API ================
export const sectionAPI = {
  // Get all sections
  getAllSections: (params = {}) => apiClient.get("/api/sections", { params }),

  // Get section by ID
  getSectionById: (sectionId) => apiClient.get(`/api/sections/${sectionId}`),

  // Get sections by course and semester
  getSectionsByCourseAndSemester: (courseId, semesterId) =>
    apiClient.get(`/api/sections/course/${courseId}/semester/${semesterId}`),

  // Get sections by instructor
  getSectionsByInstructor: (instructorId, params = {}) =>
    apiClient.get(`/api/sections/instructor/${instructorId}`, { params }),

  // Get sections by department
  getSectionsByDepartment: (departmentId, params = {}) =>
    apiClient.get(`/api/sections/department/${departmentId}`, { params }),

  // Get unassigned sections
  getUnassignedSections: (params = {}) =>
    apiClient.get("/api/sections/unassigned/list", { params }),

  // Get sections by date range
  getSectionsByDateRange: (startDate, endDate, departmentId) =>
    apiClient.get("/api/sections/date-range/filter", {
      params: {
        start_date: startDate,
        end_date: endDate,
        department_id: departmentId,
      },
    }),

  // Get section statistics
  getSectionStats: (params = {}) =>
    apiClient.get("/api/sections/statistics/overview", { params }),

  // Get dashboard summary
  getDashboardSummary: () => apiClient.get("/api/sections/dashboard/summary"),

  // Create section
  createSection: (sectionData) => apiClient.post("/api/sections", sectionData),

  // Update section
  updateSection: (sectionId, updateData) =>
    apiClient.put(`/api/sections/${sectionId}`, updateData),

  // Delete section
  deleteSection: (sectionId) => apiClient.delete(`/api/sections/${sectionId}`),

  // Assign instructor to section
  assignInstructor: (sectionId, instructorId) =>
    apiClient.post(`/api/sections/${sectionId}/assign-instructor`, {
      instructor_id: instructorId,
    }),

  // Remove instructor from section
  removeInstructor: (sectionId) =>
    apiClient.delete(`/api/sections/${sectionId}/remove-instructor`),

  // Update student count
  updateStudentCount: (sectionId, studentCount) =>
    apiClient.put(`/api/sections/${sectionId}/student-count`, {
      student_count: studentCount,
    }),
};

// ================ SECTION UTILITIES ================
export const sectionUtils = {
  // Format section code for display
  formatSectionCode: (courseCode, sectionCode) => {
    return `${courseCode} - ${sectionCode}`;
  },

  // Check if section is full
  isSectionFull: (studentCount, maxCapacity) => {
    return studentCount >= maxCapacity;
  },

  // Calculate capacity percentage
  calculateCapacityPercentage: (studentCount, maxCapacity) => {
    return (studentCount / maxCapacity) * 100;
  },

  // Get capacity status
  getCapacityStatus: (percentage) => {
    if (percentage < 60) return { status: "Available", color: "success" };
    if (percentage < 80) return { status: "Moderate", color: "warning" };
    if (percentage < 100) return { status: "High", color: "danger" };
    return { status: "Full", color: "danger" };
  },

  // Validate section data
  validateSectionData: (sectionData) => {
    const errors = {};

    if (!sectionData.course_id) {
      errors.course_id = "Course is required";
    }

    if (!sectionData.semester_id) {
      errors.semester_id = "Semester is required";
    }

    if (!sectionData.section_code?.trim()) {
      errors.section_code = "Section code is required";
    }

    if (sectionData.student_count < 0) {
      errors.student_count = "Student count cannot be negative";
    }

    if (sectionData.max_capacity <= 0) {
      errors.max_capacity = "Max capacity must be greater than 0";
    }

    if (sectionData.student_count > sectionData.max_capacity) {
      errors.student_count = "Student count cannot exceed max capacity";
    }

    return errors;
  },

  // Prepare section form data
  prepareSectionFormData: (formData) => {
    return {
      course_id: parseInt(formData.course_id),
      semester_id: parseInt(formData.semester_id),
      section_code: formData.section_code.trim().toUpperCase(),
      instructor_id: formData.instructor_id
        ? parseInt(formData.instructor_id)
        : null,
      student_count: parseInt(formData.student_count || 0),
      max_capacity: parseInt(formData.max_capacity || 60),
      is_active: formData.is_active !== false,
    };
  },

  // Group sections by course
  groupSectionsByCourse: (sections) => {
    const grouped = {};

    sections.forEach((section) => {
      const courseKey = `${section.course_code} - ${section.course_title}`;

      if (!grouped[courseKey]) {
        grouped[courseKey] = {
          course_id: section.course_id,
          course_code: section.course_code,
          course_title: section.course_title,
          sections: [],
          total_students: 0,
          total_sections: 0,
        };
      }

      grouped[courseKey].sections.push(section);
      grouped[courseKey].total_students += section.student_count || 0;
      grouped[courseKey].total_sections += 1;
    });

    return Object.values(grouped);
  },

  // Filter sections by instructor assignment
  filterSectionsByInstructor: (sections, assigned = true) => {
    return sections.filter((section) =>
      assigned ? section.instructor_id : !section.instructor_id
    );
  },

  // Get section statistics for display
  calculateSectionStats: (sections) => {
    const stats = {
      total_sections: sections.length,
      total_students: sections.reduce(
        (sum, section) => sum + (section.student_count || 0),
        0
      ),
      assigned_sections: sections.filter((s) => s.instructor_id).length,
      unassigned_sections: sections.filter((s) => !s.instructor_id).length,
      average_students:
        sections.length > 0
          ? Math.round(
              sections.reduce(
                (sum, section) => sum + (section.student_count || 0),
                0
              ) / sections.length
            )
          : 0,
    };

    // Calculate capacity utilization
    const capacityUtilization = sections.reduce(
      (acc, section) => {
        const utilization =
          section.max_capacity > 0
            ? ((section.student_count || 0) / section.max_capacity) * 100
            : 0;

        if (utilization < 50) acc.low++;
        else if (utilization < 80) acc.medium++;
        else if (utilization < 100) acc.high++;
        else acc.full++;

        return acc;
      },
      { low: 0, medium: 0, high: 0, full: 0 }
    );

    stats.capacity_utilization = capacityUtilization;

    return stats;
  },
};
