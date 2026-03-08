import apiClient from "./client";

// ================ SEMESTER API ================
export const semesterAPI = {
  // Get all semesters
  getAllSemesters: (params = {}) => apiClient.get("/api/semesters", { params }),

  // Get active semester
  getActiveSemester: () => apiClient.get("/api/semesters/active"),

  // Get current semester (based on date)
  getCurrentSemester: () => apiClient.get("/api/semesters/current"),

  // Get semester by ID
  getSemesterById: (semesterId) =>
    apiClient.get(`/api/semesters/${semesterId}`),

  // Get semesters by academic year
  getSemestersByAcademicYear: (academicYearId) =>
    apiClient.get(`/api/semesters/academic-year/${academicYearId}`),

  // Create semester
  createSemester: (semesterData) =>
    apiClient.post("/api/semesters", semesterData),

  // Update semester
  updateSemester: (semesterId, updateData) =>
    apiClient.put(`/api/semesters/${semesterId}`, updateData),

  // Delete semester
  deleteSemester: (semesterId) =>
    apiClient.delete(`/api/semesters/${semesterId}`),

  // Activate semester
  activateSemester: (semesterId) =>
    apiClient.put(`/api/semesters/${semesterId}/activate`),

  // Get semester statistics
  getSemesterStats: (semesterId) =>
    apiClient.get(`/api/semesters/${semesterId}/statistics`),
};

// ================ SEMESTER UTILITIES ================
export const semesterUtils = {
  // Format semester type
  formatSemesterType: (type) => {
    const typeMap = {
      semester_i: "Semester I",
      semester_ii: "Semester II",
      summer: "Summer",
      distance: "Distance",
      extension: "Extension",
      weekend: "Weekend",
    };
    return typeMap[type] || type.replace(/_/g, " ").toUpperCase();
  },

  // Check if semester is active
  isSemesterActive: (semester) => {
    if (!semester) return false;

    const now = new Date();
    const startDate = new Date(semester.start_date);
    const endDate = new Date(semester.end_date);

    return now >= startDate && now <= endDate && semester.is_active;
  },

  // Get semester status
  getSemesterStatus: (semester) => {
    if (!semester) return "unknown";

    const now = new Date();
    const startDate = new Date(semester.start_date);
    const endDate = new Date(semester.end_date);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "completed";
    if (semester.is_active) return "active";
    return "inactive";
  },

  // Get status color
  getStatusColor: (status) => {
    const colors = {
      active: "success",
      upcoming: "warning",
      completed: "secondary",
      inactive: "danger",
      unknown: "default",
    };
    return colors[status] || "default";
  },

  // Validate semester data
  validateSemesterData: (semesterData) => {
    const errors = {};

    if (!semesterData.academic_year_id) {
      errors.academic_year_id = "Academic year is required";
    }

    if (!semesterData.semester_code?.trim()) {
      errors.semester_code = "Semester code is required";
    }

    if (!semesterData.semester_name?.trim()) {
      errors.semester_name = "Semester name is required";
    }

    if (!semesterData.semester_type) {
      errors.semester_type = "Semester type is required";
    }

    if (!semesterData.start_date) {
      errors.start_date = "Start date is required";
    }

    if (!semesterData.end_date) {
      errors.end_date = "End date is required";
    }

    if (semesterData.start_date && semesterData.end_date) {
      const start = new Date(semesterData.start_date);
      const end = new Date(semesterData.end_date);

      if (start >= end) {
        errors.end_date = "End date must be after start date";
      }
    }

    return errors;
  },

  // Prepare semester form data
  prepareSemesterFormData: (formData) => {
    return {
      academic_year_id: parseInt(formData.academic_year_id),
      semester_code: formData.semester_code.trim().toUpperCase(),
      semester_name: formData.semester_name.trim(),
      semester_type: formData.semester_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active || false,
    };
  },

  // Get academic year options from semesters
  getAcademicYearsFromSemesters: (semesters) => {
    const years = {};

    semesters.forEach((semester) => {
      if (semester.year_code) {
        years[semester.year_code] = {
          id: semester.academic_year_id,
          code: semester.year_code,
          name: semester.year_name,
        };
      }
    });

    return Object.values(years).sort((a, b) => b.code.localeCompare(a.code));
  },

  // Filter semesters by type
  filterSemestersByType: (semesters, type) => {
    return semesters.filter((semester) => semester.semester_type === type);
  },

  // Group semesters by academic year
  groupSemestersByAcademicYear: (semesters) => {
    const grouped = {};

    semesters.forEach((semester) => {
      const yearKey = `${semester.year_code} - ${semester.year_name}`;

      if (!grouped[yearKey]) {
        grouped[yearKey] = {
          academic_year_id: semester.academic_year_id,
          year_code: semester.year_code,
          year_name: semester.year_name,
          semesters: [],
        };
      }

      grouped[yearKey].semesters.push(semester);
    });

    return Object.values(grouped).sort((a, b) =>
      b.year_code.localeCompare(a.year_code)
    );
  },

  // Calculate semester duration in weeks
  calculateSemesterDuration: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  },

  // Get semester timeline data for charts
  getSemesterTimeline: (semesters, limit = 10) => {
    const sortedSemesters = [...semesters]
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      .slice(0, limit);

    return sortedSemesters.map((semester) => ({
      id: semester.semester_id,
      code: semester.semester_code,
      name: semester.semester_name,
      type: semesterUtils.formatSemesterType(semester.semester_type),
      start_date: new Date(semester.start_date).toLocaleDateString(),
      end_date: new Date(semester.end_date).toLocaleDateString(),
      duration: semesterUtils.calculateSemesterDuration(
        semester.start_date,
        semester.end_date
      ),
      is_active: semester.is_active,
      status: semesterUtils.getSemesterStatus(semester),
    }));
  },
};
