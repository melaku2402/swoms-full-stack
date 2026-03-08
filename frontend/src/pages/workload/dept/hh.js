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

// import apiClient from "./client";
// // ================ COURSE API (UPDATED TO MATCH BACKEND) ================
//  const courseAPI = {
//   // Create course (matches CourseController.createCourse)
//   createCourse: (data) => apiClient.post("/api/courses", data),

//   // Get all courses (matches CourseController.getAllCourses)
//   getAllCourses: (params) => apiClient.get("/api/courses", { params }),

//   // Get course by ID (matches CourseController.getCourseById)
//   getCourseById: (id) => apiClient.get(`/api/courses/${id}`),

//   // Get course statistics (matches CourseController.getCourseStats)
//   getCourseStats: (params) =>
//     apiClient.get("/api/courses/statistics/overview", { params }),

//   // Get courses by department (matches CourseController.getCoursesByDepartment)
//   getCoursesByDepartment: (departmentId, params) =>
//     apiClient.get(`/api/courses/department/${departmentId}`, { params }),

//   // Get courses by program (matches CourseController.getCoursesByProgram)
//   getCoursesByProgram: (programId, params) =>
//     apiClient.get(`/api/courses/program/${programId}`, { params }),

//   // Update course (matches CourseController.updateCourse)
//   updateCourse: (id, data) => apiClient.put(`/api/courses/${id}`, data),

//   // Delete course (matches CourseController.deleteCourse)
//   deleteCourse: (id) => apiClient.delete(`/api/courses/${id}`),

//   // Search courses (matches CourseController.searchCourses)
//   searchCourses: (params) => apiClient.get("/api/courses/search", { params }),

//   // Get course offerings (matches CourseController.getCourseOfferings)
//   getCourseOfferings: (id) => apiClient.get(`/api/courses/${id}/offerings`),

//   // Get course sections (matches CourseController.getCourseSections)
//   getCourseSections: (id, params) =>
//     apiClient.get(`/api/courses/${id}/sections`, { params }),

//   // Get related courses (matches CourseController.getRelatedCourses)
//   getRelatedCourses: (id) => apiClient.get(`/api/courses/${id}/related`),

//   // Calculate course load (matches CourseController.calculateCourseLoad)
//   calculateCourseLoad: (id, params) =>
//     apiClient.get(`/api/courses/${id}/calculate-load`, { params }),

//   // Get courses by program type (matches CourseController.getCoursesByProgramType)
//   getCoursesByProgramType: (type, params) =>
//     apiClient.get(`/api/courses/type/${type}`, { params }),
// };

// // ================ COURSE UTILITY FUNCTIONS (For React Components) ================
// const courseUtils = {
//   // Format course code and title for display
//   formatCourseDisplay: (course) => {
//     if (!course) return "";
//     return `${course.course_code} - ${course.course_title}`;
//   },

//   // Calculate total hours for a course
//   calculateTotalHours: (course) => {
//     if (!course) return 0;
//     const lecture = course.lecture_hours || 0;
//     const lab = course.lab_hours || 0;
//     const tutorial = course.tutorial_hours || 0;
//     return lecture + lab + tutorial;
//   },

//   // Get course status color
//   getStatusColor: (status) => {
//     switch (status) {
//       case "active":
//         return "success";
//       case "inactive":
//         return "danger";
//       case "archived":
//         return "secondary";
//       default:
//         return "default";
//     }
//   },

//   // Validate course data before submission
//   validateCourseData: (courseData) => {
//     const errors = {};

//     if (!courseData.course_code?.trim()) {
//       errors.course_code = "Course code is required";
//     }

//     if (!courseData.course_title?.trim()) {
//       errors.course_title = "Course title is required";
//     }

//     if (!courseData.department_id) {
//       errors.department_id = "Department is required";
//     }

//     if (!courseData.credit_hours || courseData.credit_hours <= 0) {
//       errors.credit_hours = "Credit hours must be greater than 0";
//     }

//     if (!courseData.lecture_hours || courseData.lecture_hours <= 0) {
//       errors.lecture_hours = "Lecture hours must be greater than 0";
//     }

//     if (courseData.lab_hours < 0) {
//       errors.lab_hours = "Lab hours cannot be negative";
//     }

//     if (courseData.tutorial_hours < 0) {
//       errors.tutorial_hours = "Tutorial hours cannot be negative";
//     }

//     return errors;
//   },

//   // Prepare course form data for submission
//   prepareCourseFormData: (formData) => {
//     return {
//       course_code: formData.course_code?.trim(),
//       course_title: formData.course_title?.trim(),
//       department_id: parseInt(formData.department_id),
//       program_id: formData.program_id ? parseInt(formData.program_id) : null,
//       credit_hours: parseFloat(formData.credit_hours),
//       lecture_hours: parseFloat(formData.lecture_hours),
//       lab_hours: parseFloat(formData.lab_hours || 0),
//       tutorial_hours: parseFloat(formData.tutorial_hours || 0),
//       program_type: formData.program_type || "regular",
//       status: formData.status || "active",
//       course_year: formData.course_year ? parseInt(formData.course_year) : null,
//       course_semester: formData.course_semester
//         ? parseInt(formData.course_semester)
//         : null,
//       is_core_course: formData.is_core_course !== false,
//       prerequisites: formData.prerequisites || null,
//       max_students: formData.max_students
//         ? parseInt(formData.max_students)
//         : 60,
//       min_students: formData.min_students
//         ? parseInt(formData.min_students)
//         : 15,
//     };
//   },
// };


// export { courseAPI, courseUtils };


import apiClient from "./client";

export const courseAPI = {
  createCourse: (data) => apiClient.post("/api/courses", data),
  getAllCourses: (params) => apiClient.get("/api/courses", { params }),
  getCourseById: (id) => apiClient.get(`/api/courses/${id}`),
  getCourseStats: (params) =>
    apiClient.get("/api/courses/statistics/overview", { params }),
  getCoursesByDepartment: (departmentId, params) =>
    apiClient.get(`/api/courses/department/${departmentId}`, { params }),
  getCoursesByProgram: (programId, params) =>
    apiClient.get(`/api/courses/program/${programId}`, { params }),
  updateCourse: (id, data) => apiClient.put(`/api/courses/${id}`, data),
  deleteCourse: (id) => apiClient.delete(`/api/courses/${id}`),
  searchCourses: (params) => apiClient.get("/api/courses/search", { params }),
  getCourseOfferings: (id) => apiClient.get(`/api/courses/${id}/offerings`),
  getCourseSections: (id, params) =>
    apiClient.get(`/api/courses/${id}/sections`, { params }),
  getRelatedCourses: (id) => apiClient.get(`/api/courses/${id}/related`),
  calculateCourseLoad: (id, params) =>
    apiClient.get(`/api/courses/${id}/calculate-load`, { params }),
  getCoursesByProgramType: (type, params) =>
    apiClient.get(`/api/courses/type/${type}`, { params }),
};

export const courseUtils = {
  formatCourseDisplay: (course) => {
    if (!course) return "";
    return `${course.course_code} - ${course.course_title}`;
  },

  calculateTotalHours: (course) => {
    if (!course) return 0;
    const lecture = course.lecture_hours || 0;
    const lab = course.lab_hours || 0;
    const tutorial = course.tutorial_hours || 0;
    return lecture + lab + tutorial;
  },

  getStatusColor: (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "danger";
      case "archived":
        return "secondary";
      default:
        return "default";
    }
  },

  validateCourseData: (courseData) => {
    const errors = {};

    if (!courseData.course_code?.trim()) {
      errors.course_code = "Course code is required";
    }

    if (!courseData.course_title?.trim()) {
      errors.course_title = "Course title is required";
    }

    if (!courseData.department_id) {
      errors.department_id = "Department is required";
    }

    if (!courseData.credit_hours || courseData.credit_hours <= 0) {
      errors.credit_hours = "Credit hours must be greater than 0";
    }

    if (!courseData.lecture_hours || courseData.lecture_hours <= 0) {
      errors.lecture_hours = "Lecture hours must be greater than 0";
    }

    if (courseData.lab_hours < 0) {
      errors.lab_hours = "Lab hours cannot be negative";
    }

    if (courseData.tutorial_hours < 0) {
      errors.tutorial_hours = "Tutorial hours cannot be negative";
    }

    return errors;
  },

  prepareCourseFormData: (formData) => {
    return {
      course_code: formData.course_code?.trim(),
      course_title: formData.course_title?.trim(),
      department_id: parseInt(formData.department_id),
      program_id: formData.program_id ? parseInt(formData.program_id) : null,
      credit_hours: parseFloat(formData.credit_hours),
      lecture_hours: parseFloat(formData.lecture_hours),
      lab_hours: parseFloat(formData.lab_hours || 0),
      tutorial_hours: parseFloat(formData.tutorial_hours || 0),
      program_type: formData.program_type || "regular",
      status: formData.status || "active",
      course_year: formData.course_year ? parseInt(formData.course_year) : null,
      course_semester: formData.course_semester
        ? parseInt(formData.course_semester)
        : null,
      is_core_course: formData.is_core_course !== false,
      prerequisites: formData.prerequisites || null,
      max_students: formData.max_students
        ? parseInt(formData.max_students)
        : 60,
      min_students: formData.min_students
        ? parseInt(formData.min_students)
        : 15,
    };
  },
};// src/api/staff.js
import apiClient from "./client";

// ================ STAFF API (COMPLETE FRONTEND CLIENT) ================
export const staffAPI = {
  // ===== PUBLIC STAFF ROUTES (for instructors to view their own data) =====

  // Get my staff profile
  getMyProfile: () => apiClient.get("/api/staff/me"),

  // Check if I have a staff profile
  checkMyStaffProfile: () => apiClient.get("/api/staff/me/profile-check"),

  // Update my profile
  updateMyProfile: (data) => apiClient.put("/api/staff/me", data),

  // Get my workload summary
  getMyWorkloadSummary: (params) =>
    apiClient.get("/api/staff/me/workload-summary", { params }),

  // ===== ADMIN/MANAGEMENT ROUTES =====

  // Get all staff with filters
  getAllStaff: (params) => apiClient.get("/api/staff", { params }),

  // Search staff
  searchStaff: (params) => apiClient.get("/api/staff/search", { params }),

  // Get staff statistics
  getStaffStatistics: (params) =>
    apiClient.get("/api/staff/statistics", { params }),

  // Create new staff (admin, registrar, HR only)
  createStaff: (data) => apiClient.post("/api/staff", data),

  // ===== SPECIFIC STAFF ROUTES =====

  // Get staff by ID
  getStaffById: (id) => apiClient.get(`/api/staff/${id}`),

  // Update staff
  updateStaff: (id, data) => apiClient.put(`/api/staff/${id}`, data),

  // Delete staff (soft delete)
  deleteStaff: (id) => apiClient.delete(`/api/staff/${id}`),

  // Get staff by user ID
  getStaffByUserId: (userId) => apiClient.get(`/api/staff/user/${userId}`),

  // Get staff by department
  getStaffByDepartment: (departmentId, params) =>
    apiClient.get(`/api/staff/department/${departmentId}`, { params }),

  // Get staff workload summary
  getStaffWorkloadSummary: (id, params) =>
    apiClient.get(`/api/staff/${id}/workload-summary`, { params }),

  // Update staff rank
  updateStaffRank: (id, data) => apiClient.put(`/api/staff/${id}/rank`, data),

  // Assign staff to department
  assignToDepartment: (id, data) =>
    apiClient.put(`/api/staff/${id}/assign-department`, data),

  // Get staff by rank
  getStaffByRank: (rank, params) =>
    apiClient.get(`/api/staff/rank/${rank}`, { params }),

  // ===== HIERARCHY-BASED ROUTES (for role-based creation) =====

  // Create staff with hierarchy validation
  createStaffWithHierarchy: (data) =>
    apiClient.post("/api/staff/with-hierarchy", data),

  // Get staff by creator
  getStaffByCreator: (creatorId, params) =>
    apiClient.get(`/api/staff/creator/${creatorId}`, { params }),

  // Get role-based statistics
  getRoleBasedStatistics: (role) =>
    apiClient.get(`/api/staff/role-statistics/${role}`),

  // Get staff rank history
  getStaffRankHistory: (staffId) =>
    apiClient.get(`/api/staff/${staffId}/rank-history`),
};

// ================ STAFF UTILITY FUNCTIONS (For React Components) ================
export const staffUtils = {
  // Format full name
  formatFullName: (staff) => {
    if (!staff) return "";
    if (staff.middle_name) {
      return `${staff.first_name} ${staff.middle_name} ${staff.last_name}`;
    }
    return `${staff.first_name} ${staff.last_name}`;
  },

  // Format academic rank for display
  formatAcademicRank: (rank) => {
    const rankMap = {
      graduate_assistant: "Graduate Assistant",
      assistant_lecturer: "Assistant Lecturer",
      lecturer: "Lecturer",
      assistant_professor: "Assistant Professor",
      associate_professor: "Associate Professor",
      professor: "Professor",
    };
    return rankMap[rank] || rank;
  },

  // Format employment type for display
  formatEmploymentType: (type) => {
    const typeMap = {
      full_time: "Full Time",
      part_time: "Part Time",
      contract: "Contract",
    };
    return typeMap[type] || type;
  },

  // Get staff status color
  getStatusColor: (isActive) => {
    return isActive ? "success" : "danger";
  },

  // Calculate years of service
  calculateYearsOfService: (hireDate) => {
    if (!hireDate) return "N/A";
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    return months < 0 ? years - 1 : years;
  },

  // Validate staff data before submission
  validateStaffData: (staffData, isUpdate = false) => {
    const errors = {};

    if (!isUpdate) {
      if (!staffData.username?.trim()) {
        errors.username = "Username is required";
      }

      if (!staffData.email?.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(staffData.email)) {
        errors.email = "Email is invalid";
      }

      if (!staffData.password?.trim()) {
        errors.password = "Password is required";
      } else if (staffData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }

    if (!staffData.first_name?.trim()) {
      errors.first_name = "First name is required";
    }

    if (!staffData.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!staffData.employee_id?.trim()) {
      errors.employee_id = "Employee ID is required";
    }

    if (!staffData.department_id) {
      errors.department_id = "Department is required";
    }

    if (staffData.phone && !/^\+?[\d\s\-()]+$/.test(staffData.phone)) {
      errors.phone = "Phone number is invalid";
    }

    if (staffData.date_of_birth) {
      const dob = new Date(staffData.date_of_birth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();

      if (dob > now) {
        errors.date_of_birth = "Date of birth cannot be in the future";
      } else if (age < 18) {
        errors.date_of_birth = "Staff must be at least 18 years old";
      }
    }

    return errors;
  },

  // Prepare staff form data for submission
  prepareStaffFormData: (formData) => {
    const data = {
      username: formData.username?.trim(),
      email: formData.email?.trim(),
      password: formData.password?.trim(),
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      middle_name: formData.middle_name?.trim() || null,
      employee_id: formData.employee_id?.trim(),
      department_id: parseInt(formData.department_id),
      academic_rank: formData.academic_rank || "lecturer",
      employment_type: formData.employment_type || "full_time",
      role: formData.role || "instructor",
      phone: formData.phone?.trim() || null,
      address: formData.address?.trim() || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
    };

    // Only include hire_date if provided
    if (formData.hire_date) {
      data.hire_date = formData.hire_date;
    }

    return data;
  },

  // Prepare staff update data (excludes sensitive fields)
  prepareStaffUpdateData: (formData) => {
    const data = {
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      middle_name: formData.middle_name?.trim() || null,
      employee_id: formData.employee_id?.trim(),
      department_id: formData.department_id
        ? parseInt(formData.department_id)
        : undefined,
      academic_rank: formData.academic_rank,
      employment_type: formData.employment_type,
      phone: formData.phone?.trim() || null,
      address: formData.address?.trim() || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
    };

    // Only include hire_date if changed
    if (formData.hire_date) {
      data.hire_date = formData.hire_date;
    }

    // Remove undefined values
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key]
    );

    return data;
  },

  // Get allowed roles for creation based on current user role
  getAllowedRolesForCreation: (currentUserRole) => {
    const roleHierarchy = {
      admin: [
        "admin",
        "vpaa",
        "hr_director",
        "finance",
        "cde_director",
        "vpaf",
        "dean",
        "registrar",
        "department_head",
        "instructor",
      ],
      vpaa: ["dean", "registrar", "vpaf"],
      dean: ["department_head"],
      hr_director: ["instructor"],
      department_head: [],
      instructor: [],
      registrar: [],
      cde_director: [],
      vpaf: [],
      finance: [],
    };

    return roleHierarchy[currentUserRole] || [];
  },

  // Get valid academic ranks
  getValidAcademicRanks: () => [
    { value: "graduate_assistant", label: "Graduate Assistant" },
    { value: "assistant_lecturer", label: "Assistant Lecturer" },
    { value: "lecturer", label: "Lecturer" },
    { value: "assistant_professor", label: "Assistant Professor" },
    { value: "associate_professor", label: "Associate Professor" },
    { value: "professor", label: "Professor" },
  ],

  // Get employment type options
  getEmploymentTypes: () => [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
  ],

  // Get gender options
  getGenderOptions: () => [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ],

  // Check if user can create staff
  canCreateStaff: (currentUserRole) => {
    const allowedRoles = ["admin", "registrar", "hr_director"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can update staff
  canUpdateStaff: (currentUserRole) => {
    const allowedRoles = ["admin", "registrar", "hr_director"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can delete staff
  canDeleteStaff: (currentUserRole) => {
    const allowedRoles = ["admin", "hr_director"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can view staff statistics
  canViewStatistics: (currentUserRole) => {
    const allowedRoles = ["admin", "hr_director", "dean"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can assign departments
  canAssignDepartment: (currentUserRole) => {
    const allowedRoles = ["admin", "hr_director", "dean"];
    return allowedRoles.includes(currentUserRole);
  },

  // Check if user can update staff rank
  canUpdateRank: (currentUserRole) => {
    const allowedRoles = ["admin", "hr_director"];
    return allowedRoles.includes(currentUserRole);
  },

  // Generate CSV data for export
  generateStaffCSVData: (staffList) => {
    const headers = [
      "Employee ID",
      "Full Name",
      "Email",
      "Role",
      "Department",
      "College",
      "Academic Rank",
      "Employment Type",
      "Gender",
      "Phone",
      "Hire Date",
      "Years of Service",
      "Status",
    ];

    const rows = staffList.map((staff) => [
      staff.employee_id,
      staffUtils.formatFullName(staff),
      staff.email,
      staff.role,
      staff.department_name,
      staff.college_name,
      staffUtils.formatAcademicRank(staff.academic_rank),
      staffUtils.formatEmploymentType(staff.employment_type),
      staff.gender?.charAt(0).toUpperCase() + staff.gender?.slice(1) || "N/A",
      staff.phone || "N/A",
      staff.hire_date ? new Date(staff.hire_date).toLocaleDateString() : "N/A",
      staffUtils.calculateYearsOfService(staff.hire_date),
      staff.is_active ? "Active" : "Inactive",
    ]);

    return [headers, ...rows];
  },

  // Filter staff by various criteria
  filterStaff: (staffList, filters) => {
    return staffList.filter((staff) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          staff.first_name,
          staff.last_name,
          staff.employee_id,
          staff.email,
          staff.username,
          staff.department_name,
          staff.college_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableFields.includes(searchTerm)) {
          return false;
        }
      }

      // Department filter
      if (
        filters.department_id &&
        staff.department_id !== parseInt(filters.department_id)
      ) {
        return false;
      }

      // College filter
      if (
        filters.college_id &&
        staff.college_id !== parseInt(filters.college_id)
      ) {
        return false;
      }

      // Academic rank filter
      if (
        filters.academic_rank &&
        staff.academic_rank !== filters.academic_rank
      ) {
        return false;
      }

      // Employment type filter
      if (
        filters.employment_type &&
        staff.employment_type !== filters.employment_type
      ) {
        return false;
      }

      // Status filter
      if (
        filters.is_active !== undefined &&
        staff.is_active !== (filters.is_active === "true")
      ) {
        return false;
      }

      return true;
    });
  },

  // Sort staff by various fields
  sortStaff: (staffList, sortBy, sortDirection = "asc") => {
    return [...staffList].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = staffUtils.formatFullName(a).toLowerCase();
          bValue = staffUtils.formatFullName(b).toLowerCase();
          break;
        case "employee_id":
          aValue = a.employee_id;
          bValue = b.employee_id;
          break;
        case "department":
          aValue = a.department_name;
          bValue = b.department_name;
          break;
        case "college":
          aValue = a.college_name;
          bValue = b.college_name;
          break;
        case "rank":
          aValue = a.academic_rank;
          bValue = b.academic_rank;
          break;
        case "hire_date":
          aValue = new Date(a.hire_date || 0);
          bValue = new Date(b.hire_date || 0);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  },

  // Calculate pagination metadata
  calculatePagination: (totalItems, currentPage, itemsPerPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      totalPages,
      startItem,
      endItem,
      totalItems,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  },
};

// ================ STAFF REACT HOOKS (Custom Hooks) ================
import { useState, useEffect, useCallback } from "react";

// Hook for fetching staff data with pagination and filters
export const useStaffData = (initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState(initialFilters);

  const fetchStaff = useCallback(
    async (page = 1, customFilters = null) => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          limit: pagination.limit,
          ...(customFilters || filters),
        };

        const response = await staffAPI.getAllStaff(params);
        setData(response.data?.staff || []);
        setPagination(
          response.data?.pagination || {
            page,
            limit: pagination.limit,
            total: 0,
            pages: 0,
          }
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch staff data");
        console.error("Fetch staff error:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const changePage = useCallback(
    (page) => {
      fetchStaff(page);
    },
    [fetchStaff]
  );

  useEffect(() => {
    fetchStaff(1);
  }, [fetchStaff]);

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    fetchStaff,
    updateFilters,
    changePage,
    refetch: () => fetchStaff(pagination.page),
  };
};

// Hook for staff search
export const useStaffSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchStaff = useCallback(async (searchTerm, limit = 50) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await staffAPI.searchStaff({ q: searchTerm, limit });
      setResults(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
      console.error("Staff search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    searchStaff,
    clearResults: () => setResults([]),
  };
};

// Hook for staff statistics
export const useStaffStatistics = (params = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(
    async (customParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await staffAPI.getStaffStatistics({
          ...params,
          ...customParams,
        });
        setStats(response.data || {});
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch statistics");
        console.error("Fetch staff statistics error:", err);
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook for my staff profile
export const useMyStaffProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First check if profile exists
      const checkResponse = await staffAPI.checkMyStaffProfile();
      setHasProfile(checkResponse.data?.has_staff_profile || false);

      if (checkResponse.data?.has_staff_profile) {
        const profileResponse = await staffAPI.getMyProfile();
        setProfile(profileResponse.data || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile");
      console.error("Fetch my profile error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await staffAPI.updateMyProfile(data);
      setProfile(response.data || null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error("Update profile error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    hasProfile,
    fetchProfile,
    updateProfile,
  };
};

export default staffAPI;

// src/api/workload.js
import apiClient from "./client";

export const workloadAPI = {
  // RP Workload endpoints
  rp: {
    createOrUpdate: (data) => apiClient.post("/workload-rp", data),
    getWorkloads: (params) => apiClient.get("/workload-rp", { params }),
    getWorkloadById: (id) => apiClient.get(`/workload-rp/${id}`),
    getMyWorkload: (params) => apiClient.get("/workload-rp/me", { params }),
    submitForApproval: (id) => apiClient.post(`/workload-rp/${id}/submit`),
    calculateFromSections: (data) => apiClient.post("/workload-rp/calculate-from-sections", data),
    getStatistics: (params) => apiClient.get("/workload-rp/statistics", { params }),
    getPendingApprovals: () => apiClient.get("/workload-rp/approvals/pending")
  },
  
  // NRP Workload endpoints
  nrp: {
    createOrUpdate: (data) => apiClient.post("/workload-nrp", data),
    getWorkloads: (params) => apiClient.get("/workload-nrp", { params }),
    getWorkloadById: (id) => apiClient.get(`/workload-nrp/${id}`),
    getMyWorkloads: (params) => apiClient.get("/workload-nrp/me", { params }),
    submitForApproval: (id) => apiClient.post(`/workload-nrp/${id}/submit`),
    calculatePayment: (id) => apiClient.get(`/workload-nrp/${id}/calculate-payment`),
    getStatistics: (params) => apiClient.get("/workload-nrp/statistics", { params }),
    getPendingApprovals: () => apiClient.get("/workload-nrp/approvals/pending")
  },
  
  // Report endpoints
  report: {
    generate: (params) => apiClient.get("/workload-report/generate", { params }),
    export: (data, format) => apiClient.post(`/workload-report/export?format=${format}`, data),
    getDashboard: () => apiClient.get("/workload-report/dashboard"),
    getSemesters: () => apiClient.get("/workload-report/semesters")
  }
};

export default workloadAPI;// src/api/workloadReportAPI.js
import apiClient from "./client";

export const workloadReportAPI = {
  // Generate comprehensive report
  generateReport: (params) =>
    apiClient.get("/api/workload-report/generate", params),

  // Export report
  exportReport: (data, format) =>
    apiClient.post(`/api/workload-report/export?format=${format}`, data, {
      responseType: format === "json" ? "json" : "blob",
    }),

  // Get available semesters
  getAvailableSemesters: () => apiClient.get("/api/workload-report/semesters"),

  // Get department statistics
  getDepartmentStats: (departmentId) =>
    apiClient.get(`/api/workload-report/department/${departmentId}/stats`),

  // Get staff performance
  getStaffPerformance: (staffId, params) =>
    apiClient.get(`/api/workload-report/staff/${staffId}/performance`, { params }),

  // Get dashboard summary
  getDashboardSummary: () => apiClient.get("/api/workload-report/dashboard"),
};

export default workloadReportAPI;
// src/api/workloadRPAPI.js
import apiClient from "./client";

export const workloadRPAPI = {
  // Instructor (My) Workload
  getMyWorkload: (params) => apiClient.get("/api/workload-rp/me", { params }),
  getMyWorkloadDashboard: (params) =>
    apiClient.get("/api/workload-rp/me/dashboard", { params }),
  createOrUpdateMyWorkload: (data) =>
    apiClient.post("/api/workload-rp/me", data),
  calculateFromMySections: (data) =>
    apiClient.post("/api/workload-rp/me/calculate-from-sections", data),
  submitMyWorkload: (id) => apiClient.post(`/api/workload-rp/me/${id}/submit`),

  // All Workloads (Management)
  getAllWorkloads: (params) => apiClient.get("/api/workload-rp", { params }),
  getWorkloadById: (id) => apiClient.get(`/api/workload-rp/${id}`),
  createOrUpdateWorkload: (data) => apiClient.post("/api/workload-rp", data),
  calculateFromSections: (data) =>
    apiClient.post("/api/workload-rp/calculate-from-sections", data),
  deleteWorkload: (id) => apiClient.delete(`/workload-rp/${id}`),

  // Statistics & Reports
  getWorkloadStatistics: (params) =>
    apiClient.get("/api/workload-rp/statistics/overview", { params }),
  getDepartmentWorkloadSummary: (departmentId, params) =>
    apiClient.get(`/api/workload-rp/department/${departmentId}/summary`, {
      params,
    }),

  // Approval Workflow
  getMyPendingApprovals: () =>
    apiClient.get("/api/workload-rp/approvals/pending"),
  getApprovalWorkflow: (id) =>
    apiClient.get(`/api/workload-rp/${id}/approvals`),
  approveStep: (approvalId, data) =>
    apiClient.post(`/api/workload-rp/approvals/${approvalId}/approve`, data),
  rejectWorkload: (id, data) =>
    apiClient.post(`/api/workload-rp/${id}/reject`, data),
  returnForCorrection: (id, data) =>
    apiClient.post(`/api/workload-rp/${id}/return`, data),
};

export default workloadRPAPI;
// src/api/workloadNRPAPI.js

import apiClient from "./client";
export const workloadNRPAPI = {
  // Create & Update
  createNRPWorkload: (data) => apiClient.post("/workload-nrp", data),
  updateNRPWorkload: (id, data) => apiClient.put(`/workload-nrp/${id}`, data),

  // Read
  getAllNRPWorkloads: (params) => apiClient.get("/workload-nrp", { params }),
  getNRPWorkloadById: (id) => apiClient.get(`/workload-nrp/${id}`),
  getMyNRPWorkloads: (params) => apiClient.get("/workload-nrp/me", { params }),

  // Submit & Approvals
  submitForApproval: (id) => apiClient.post(`/workload-nrp/${id}/submit`),
  getApprovalWorkflow: (id) => apiClient.get(`/workload-nrp/${id}/approvals`),
  approveWorkloadStep: (id, data) =>
    apiClient.post(`/workload-nrp/${id}/approve`, data),
  rejectWorkload: (id, data) =>
    apiClient.post(`/workload-nrp/${id}/reject`, data),
  returnForCorrection: (id, data) =>
    apiClient.post(`/workload-nrp/${id}/return`, data),

  // Statistics & Dashboard
  getNRPStatistics: (params) =>
    apiClient.get("/workload-nrp/statistics/dashboard", { params }),
  getMyPendingApprovals: () => apiClient.get("/workload-nrp/approvals/pending"),

  // Payment Calculation
  calculatePayment: (id) => apiClient.get(`/workload-nrp/${id}/calculate`),

  // From Course (if implemented)
  calculateFromCourse: (staffId, semesterId, courseId, programType) =>
    apiClient.post("/workload-nrp/calculate-from-course", {
      staff_id: staffId,
      semester_id: semesterId,
      course_id: courseId,
      program_type: programType,
    }),
};

export default workloadNRPAPI;
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
import apiClient from "./client";
import { PROGRAM_TYPES } from "../../../../backend/src/config/constants"; 

// ================ PROGRAM API - COMPLETE VERSION ================
export const programAPI = {
 
  getAllPrograms: (params = {}) => {
    const defaultParams = { page: 1, limit: 20 };
    return apiClient.get("/api/programs", {
      params: { ...defaultParams, ...params },
    });
  },

  getProgramById: (id) => {
    return apiClient.get(`/api/programs/${id}`);
  },

 
  getProgramsByDepartment: (departmentId, params = {}) => {
    return apiClient.get(`/api/programs/department/${departmentId}`, {
      params: { page: 1, limit: 20, ...params },
    });
  },

  
  getProgramsByType: (type, params = {}) => {
    // Validate program type
    const validTypes = Object.values(PROGRAM_TYPES);
    if (!validTypes.includes(type)) {
      return Promise.reject(
        new Error(
          `Invalid program type. Must be one of: ${validTypes.join(", ")}`
        )
      );
    }

    return apiClient.get(`/api/programs/type/${type}`, {
      params: { page: 1, limit: 20, ...params },
    });
  },

  getProgramTypes: () => {
    return apiClient.get("/api/programs/types/all");
  },

  getProgramStats: (params = {}) => {
    return apiClient.get("/api/programs/statistics/overview", { params });
  },

  getProgramTypesDashboard: () => {
    return apiClient.get("/api/programs/dashboard/types");
  },

  createProgram: (data) => {
    // Validate required fields
    const required = [
      "program_code",
      "program_name",
      "department_id",
      "program_type",
    ];
    const missing = required.filter((field) => !data[field]);

    if (missing.length > 0) {
      return Promise.reject(
        new Error(`Missing required fields: ${missing.join(", ")}`)
      );
    }

    // Validate program type
    const validTypes = Object.values(PROGRAM_TYPES);
    if (!validTypes.includes(data.program_type)) {
      return Promise.reject(
        new Error(
          `Invalid program type. Must be one of: ${validTypes.join(", ")}`
        )
      );
    }

    // Set default status if not provided
    const programData = {
      status: "active",
      ...data,
    };

    return apiClient.post("/api/programs", programData);
  },

  updateProgram: (id, data) => {
    // Validate program type if provided
    if (data.program_type) {
      const validTypes = Object.values(PROGRAM_TYPES);
      if (!validTypes.includes(data.program_type)) {
        return Promise.reject(
          new Error(
            `Invalid program type. Must be one of: ${validTypes.join(", ")}`
          )
        );
      }
    }

    return apiClient.put(`/api/programs/${id}`, data);
  },

  deleteProgram: (id) => {
    return apiClient.delete(`/api/programs/${id}`);
  },

  assignCoursesToProgram: (id, courseIds) => {
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return Promise.reject(
        new Error("Course IDs array is required and cannot be empty")
      );
    }

    return apiClient.post(`/api/programs/${id}/assign-courses`, {
      course_ids: courseIds,
    });
  },


  createProgramYear: (data) => {
    const required = ["program_id", "year_number"];
    const missing = required.filter((field) => !data[field]);

    if (missing.length > 0) {
      return Promise.reject(
        new Error(`Missing required fields: ${missing.join(", ")}`)
      );
    }

    return apiClient.post("/api/program-years", data);
  },

  /**
   * Get program year by ID
   */
  getProgramYearById: (id) => {
    return apiClient.get(`/api/program-years/${id}`);
  },

  /*
  getProgramYearsByProgram: (programId) => {
    return apiClient.get(`/api/program-years/program/${programId}`);
  },

  /**
   * Update program year
   */
  updateProgramYear: (id, data) => {
    return apiClient.put(`/api/program-years/${id}`, data);
  },

  /**
   * Delete program year
   */
  deleteProgramYear: (id) => {
    return apiClient.delete(`/api/program-years/${id}`);
  },

  /**
   * Get year statistics for program
   */
  getProgramYearStatistics: (programId) => {
    return apiClient.get(`/api/program-years/statistics/${programId}`);
  },

  // ===============================
  // BULK OPERATIONS
  // ===============================

  /**
   * Get all programs without pagination (for dropdowns)
   */
  // getAllProgramsList: async (filters = {}) => {
  //   // try {
  //   //   // First get total count with filters
  //   //   const response = await apiClient.get("/api/programs", {
  //   //     params: { ...filters, page: 1, limit: 1 },
  //   //   });

  //   //   const total = response.data?.pagination?.total || 0;

  //   //   // Then fetch all records
  //   //   if (total > 0) {
  //   //     const allResponse = await apiClient.get("/api/programs", {
  //   //       params: { ...filters, page: 1, limit: total },
  //   //     });
  //   //     return allResponse.data;
  //   //   }

  //   //   return { programs: [], pagination: { total: 0 } };
  //   // } catch (error) {
  //   //   throw error;
  //   // }
  // },

  /**
   * Get programs for dropdown (id, name, code)
   */
  // getProgramsForDropdown: async (filters = {}) => {
  //   try {
  //     const response = await programAPI.getAllProgramsList(filters);
  //     const programs = response.programs || [];

  //     return programs.map((program) => ({
  //       id: program.program_id,
  //       value: program.program_id,
  //       label: `${program.program_code} - ${program.program_name}`,
  //       code: program.program_code,
  //       name: program.program_name,
  //       type: program.program_type,
  //       department_id: program.department_id,
  //       status: program.status,
  //     }));
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  /**
   * Bulk update program status
   */
  bulkUpdateStatus: (programIds, status) => {
    if (!Array.isArray(programIds) || programIds.length === 0) {
      return Promise.reject(new Error("Program IDs array is required"));
    }

    if (!["active", "inactive"].includes(status)) {
      return Promise.reject(new Error("Status must be 'active' or 'inactive'"));
    }

    // Execute updates in parallel with limit
    const updatePromises = programIds.map((id) =>
      programAPI.updateProgram(id, { status })
    );

    return Promise.allSettled(updatePromises);
  },

  // ===============================
  // VALIDATION & HELPER FUNCTIONS
  // ===============================

  /**
   * Validate program data
   */
  validateProgramData: (data, isUpdate = false) => {
    const errors = {};

    if (!isUpdate || data.program_code !== undefined) {
      if (!data.program_code?.trim()) {
        errors.program_code = "Program code is required";
      } else if (data.program_code.length > 20) {
        errors.program_code = "Program code must be 20 characters or less";
      }
    }

    if (!isUpdate || data.program_name !== undefined) {
      if (!data.program_name?.trim()) {
        errors.program_name = "Program name is required";
      } else if (data.program_name.length > 150) {
        errors.program_name = "Program name must be 150 characters or less";
      }
    }

    if (!isUpdate || data.department_id !== undefined) {
      if (!data.department_id) {
        errors.department_id = "Department is required";
      }
    }

    if (!isUpdate || data.program_type !== undefined) {
      if (!data.program_type) {
        errors.program_type = "Program type is required";
      } else {
        const validTypes = Object.values(PROGRAM_TYPES);
        if (!validTypes.includes(data.program_type)) {
          errors.program_type = `Invalid program type. Must be one of: ${validTypes.join(
            ", "
          )}`;
        }
      }
    }

    return errors;
  },

  /**
   * Validate program year data
   */
  validateProgramYearData: (data, isUpdate = false) => {
    const errors = {};

    if (!isUpdate || data.program_id !== undefined) {
      if (!data.program_id) {
        errors.program_id = "Program is required";
      }
    }

    if (!isUpdate || data.year_number !== undefined) {
      if (!data.year_number || data.year_number < 1 || data.year_number > 10) {
        errors.year_number = "Year number must be between 1 and 10";
      }
    }

    if (data.year_name && data.year_name.length > 100) {
      errors.year_name = "Year name must be 100 characters or less";
    }

    if (
      data.total_credits &&
      (data.total_credits < 0 || data.total_credits > 200)
    ) {
      errors.total_credits = "Total credits must be between 0 and 200";
    }

    return errors;
  },

  /**
   * Get program type display name
   */
  getProgramTypeDisplay: (type) => {
    const typeMap = {
      UG: "Undergraduate",
      PG: "Postgraduate",
      PHD: "Doctorate",
      DIPLOMA: "Diploma",
      CERTIFICATE: "Certificate",
      regular: "Regular",
      extension: "Extension",
      weekend: "Weekend",
      summer: "Summer",
      distance: "Distance",
    };

    return typeMap[type] || type;
  },

  /**
   * Get program type color for UI
   */
  getProgramTypeColor: (type) => {
    const colors = {
      regular: "primary",
      extension: "success",
      weekend: "warning",
      summer: "info",
      distance: "secondary",
      UG: "primary",
      PG: "success",
      PHD: "warning",
      DIPLOMA: "info",
      CERTIFICATE: "secondary",
    };

    return colors[type] || "default";
  },

  /**
   * Get program status display
   */
  getProgramStatusDisplay: (status) => {
    const statusMap = {
      active: { text: "Active", color: "success", variant: "success" },
      inactive: { text: "Inactive", color: "danger", variant: "danger" },
      draft: { text: "Draft", color: "warning", variant: "warning" },
      archived: { text: "Archived", color: "secondary", variant: "secondary" },
    };

    return (
      statusMap[status] || {
        text: status,
        color: "default",
        variant: "default",
      }
    );
  },

  /**
   * Check if program can be deleted
   */
  canDeleteProgram: (program) => {
    return program && program.course_count === 0;
  },

  /**
   * Check if program is active
   */
  isProgramActive: (program) => {
    return program && program.status === "active";
  },

  // ===============================
  // STATISTICS & ANALYTICS
  // ===============================

  /**
   * Calculate program metrics
   */
  calculateProgramMetrics: (programs) => {
    if (!Array.isArray(programs)) return null;

    const metrics = {
      totalPrograms: programs.length,
      activePrograms: 0,
      inactivePrograms: 0,
      totalCourses: 0,
      averageCoursesPerProgram: 0,
      programsByType: {},
      coursesByType: {},
      totalStudents: 0, // Estimated from sections
      totalSections: 0,
    };

    programs.forEach((program) => {
      // Count status
      if (program.status === "active") {
        metrics.activePrograms++;
      } else {
        metrics.inactivePrograms++;
      }

      // Count courses
      const courseCount = program.course_count || 0;
      metrics.totalCourses += courseCount;

      // Group by type
      const type = program.program_type;
      metrics.programsByType[type] = (metrics.programsByType[type] || 0) + 1;
      metrics.coursesByType[type] =
        (metrics.coursesByType[type] || 0) + courseCount;

      // Add other statistics if available
      if (program.section_count) {
        metrics.totalSections += program.section_count;
      }
      if (program.student_count) {
        metrics.totalStudents += program.student_count;
      }
    });

    // Calculate averages
    metrics.averageCoursesPerProgram =
      metrics.totalPrograms > 0
        ? (metrics.totalCourses / metrics.totalPrograms).toFixed(1)
        : 0;

    // Calculate percentages
    metrics.activePercentage =
      metrics.totalPrograms > 0
        ? ((metrics.activePrograms / metrics.totalPrograms) * 100).toFixed(1)
        : 0;

    return metrics;
  },

  /**
   * Prepare program data for charts
   */
  prepareProgramChartData: (programs) => {
    if (!Array.isArray(programs) || programs.length === 0) {
      return null;
    }

    // Group by type
    const typeData = {};
    programs.forEach((program) => {
      const type = program.program_type;
      const typeDisplay = programAPI.getProgramTypeDisplay(type);

      if (!typeData[typeDisplay]) {
        typeData[typeDisplay] = {
          count: 0,
          courses: 0,
          color: programAPI.getProgramTypeColor(type),
        };
      }

      typeData[typeDisplay].count++;
      typeData[typeDisplay].courses += program.course_count || 0;
    });

    // Convert to arrays for charts
    const labels = Object.keys(typeData);
    const counts = labels.map((label) => typeData[label].count);
    const courses = labels.map((label) => typeData[label].courses);
    const colors = labels.map((label) => typeData[label].color);

    return {
      labels,
      datasets: [
        {
          label: "Programs by Type",
          data: counts,
          backgroundColor: colors,
        },
        {
          label: "Courses by Type",
          data: courses,
          backgroundColor: colors.map((color) => `${color}80`), // Add transparency
        },
      ],
    };
  },

  // ===============================
  // TRANSFORMERS (for UI display)
  // ===============================

  /**
   * Transform program for display in UI
   */
  transformProgramForDisplay: (program) => {
    if (!program) return null;

    const typeDisplay = programAPI.getProgramTypeDisplay(program.program_type);
    const statusInfo = programAPI.getProgramStatusDisplay(program.status);

    return {
      ...program,
      display_name: `${program.program_code} - ${program.program_name}`,
      short_name: program.program_name,
      type_display: typeDisplay,
      type_color: programAPI.getProgramTypeColor(program.program_type),
      status_display: statusInfo.text,
      status_color: statusInfo.color,
      is_active: programAPI.isProgramActive(program),
      can_delete: programAPI.canDeleteProgram(program),
      department_display: program.department_name
        ? `${program.department_code} - ${program.department_name}`
        : "N/A",
      college_display: program.college_name
        ? `${program.college_code} - ${program.college_name}`
        : "N/A",
      course_count: program.course_count || 0,
      course_count_display: `${program.course_count || 0} course${
        program.course_count !== 1 ? "s" : ""
      }`,
      created_date: program.created_at
        ? new Date(program.created_at).toLocaleDateString()
        : "",
      updated_date: program.updated_at
        ? new Date(program.updated_at).toLocaleDateString()
        : "",
      actions: {
        canEdit: true,
        canDelete: programAPI.canDeleteProgram(program),
        canView: true,
        canAssign: true,
        canActivate: program.status !== "active",
        canDeactivate: program.status === "active",
      },
    };
  },

  /**
   * Transform program list for table display
   */
  transformProgramListForTable: (programs) => {
    if (!Array.isArray(programs)) return [];

    return programs.map((program) => ({
      id: program.program_id,
      code: program.program_code,
      name: program.program_name,
      type: program.program_type,
      type_display: programAPI.getProgramTypeDisplay(program.program_type),
      type_color: programAPI.getProgramTypeColor(program.program_type),
      department: program.department_name,
      department_code: program.department_code,
      college: program.college_name,
      courses: program.course_count || 0,
      status: program.status,
      status_display: programAPI.getProgramStatusDisplay(program.status).text,
      status_color: programAPI.getProgramStatusDisplay(program.status).color,
      is_active: program.status === "active",
      created_at: program.created_at,
      updated_at: program.updated_at,
      actions: {
        canEdit: true,
        canDelete: programAPI.canDeleteProgram(program),
        canView: true,
        canAssign: true,
        canActivate: program.status !== "active",
        canDeactivate: program.status === "active",
      },
    }));
  },

  /**
   * Transform program year for display
   */
  transformProgramYearForDisplay: (programYear) => {
    if (!programYear) return null;

    return {
      ...programYear,
      display_name: `Year ${programYear.year_number}${
        programYear.year_name ? ` - ${programYear.year_name}` : ""
      }`,
      short_name: programYear.year_name || `Year ${programYear.year_number}`,
      course_count: programYear.course_count || 0,
      total_credits: programYear.total_credits || 0,
      created_date: programYear.created_at
        ? new Date(programYear.created_at).toLocaleDateString()
        : "",
      updated_date: programYear.updated_at
        ? new Date(programYear.updated_at).toLocaleDateString()
        : "",
    };
  },

  // ===============================
  // ERROR HANDLING
  // ===============================

  /**
   * Handle program API errors
   */
  handleProgramError: (error) => {
    if (!error.response) {
      return {
        message: "Network error. Please check your connection.",
        type: "network",
        severity: "error",
      };
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return {
          message: data.message || "Invalid request data",
          type: "validation",
          severity: "warning",
          details: data.errors,
          field: programAPI.extractFieldFromError(data.message),
        };
      case 401:
        return {
          message: "You are not authorized to perform this action",
          type: "auth",
          severity: "error",
        };
      case 403:
        return {
          message: "You don't have permission to access this resource",
          type: "permission",
          severity: "error",
        };
      case 404:
        return {
          message: "Program not found",
          type: "not_found",
          severity: "warning",
        };
      case 409:
        return {
          message: data.message || "Program code already exists",
          type: "conflict",
          severity: "warning",
        };
      case 422:
        return {
          message:
            data.message || "Cannot delete program with existing courses",
          type: "business_rule",
          severity: "warning",
        };
      case 500:
        return {
          message: "Server error. Please try again later.",
          type: "server",
          severity: "error",
        };
      default:
        return {
          message: "An unexpected error occurred",
          type: "unknown",
          severity: "error",
        };
    }
  },

  /**
   * Extract field name from error message
   */
  extractFieldFromError: (message) => {
    if (!message) return null;

    const fieldMap = {
      program_code: "code",
      program_name: "name",
      department_id: "department",
      program_type: "type",
      year_number: "year",
      total_credits: "credits",
    };

    for (const [field, displayName] of Object.entries(fieldMap)) {
      if (message.toLowerCase().includes(field)) {
        return displayName;
      }
    }

    return null;
  },

  // ===============================
  // CACHE MANAGEMENT
  // ===============================

  /**
   * Cache key for programs
   */
  cacheKeys: {
    PROGRAMS_LIST: (params = {}) => {
      const key = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");
      return `programs_list_${key}`;
    },
    PROGRAM_DETAIL: (id) => `program_detail_${id}`,
    PROGRAMS_BY_DEPARTMENT: (deptId) => `programs_by_dept_${deptId}`,
    PROGRAMS_BY_TYPE: (type) => `programs_by_type_${type}`,
    PROGRAM_TYPES: "program_types_list",
    PROGRAM_STATS: "program_statistics",
    PROGRAM_YEARS: (programId) => `program_years_${programId}`,
  },

  /**
   * Clear program cache
   */
  clearProgramCache: () => {
    // This would depend on your caching implementation
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("program_")) {
        localStorage.removeItem(key);
      }
    });
  },
};

// ================ PROGRAM YEAR API ================
export const programYearAPI = {
  /**
   * Create program year
   */
  createProgramYear: (data) => {
    return apiClient.post("/api/program-years", data);
  },

  /**
   * Get program year by ID
   */
  getProgramYearById: (id) => {
    return apiClient.get(`/api/program-years/${id}`);
  },

  /**
   * Get years by program
   */
  getProgramYearsByProgram: (programId) => {
    return apiClient.get(`/api/program-years/program/${programId}`);
  },

  
   //Update program year
   
  updateProgramYear: (id, data) => {
    return apiClient.put(`/api/program-years/${id}`, data);
  },

  
   // Delete program year
   
  deleteProgramYear: (id) => {
    return apiClient.delete(`/api/program-years/${id}`);
  },

  
    //Get year statistics
   
  getYearStatistics: (programId) => {
    return apiClient.get(`/api/program-years/statistics/${programId}`);
  },

  /**
   * Validate program year data
   */
  validateData: (data) => {
    return programAPI.validateProgramYearData(data, false);
  },

  
   // Transform for display
   
  transformForDisplay: (programYear) => {
    return programAPI.transformProgramYearForDisplay(programYear);
  },
};

// ================ PROGRAM UTILITIES ================
export const programUtils = {
  /**
   * Format program code for display
   */
  formatProgramCode: (code, name) => {
    return code && name ? `${code} - ${name}` : code || name || "";
  },

  /**
   * Get program abbreviation
   */
  getProgramAbbreviation: (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  },

  /**
   * Calculate program duration in years
   */
  calculateProgramDuration: (program) => {
    // Logic to calculate duration based on program type
    const durationMap = {
      UG: 4,
      PG: 2,
      PHD: 3,
      DIPLOMA: 2,
      CERTIFICATE: 1,
      regular: 4,
      extension: 5,
      weekend: 4,
      summer: 4,
      distance: 4,
    };

    return durationMap[program.program_type] || 4;
  },

  /**
   * Check if program has required years
   */
  hasCompleteYears: (years, expectedCount) => {
    if (!Array.isArray(years)) return false;
    if (years.length !== expectedCount) return false;

    // Check if years are sequential
    const yearNumbers = years.map((y) => y.year_number).sort((a, b) => a - b);
    for (let i = 0; i < yearNumbers.length; i++) {
      if (yearNumbers[i] !== i + 1) return false;
    }

    return true;
  },

  /**
   * Generate year options for dropdown
   */
  generateYearOptions: (maxYears = 5) => {
    const years = [];
    for (let i = 1; i <= maxYears; i++) {
      years.push({
        value: i,
        label: `Year ${i}`,
      });
    }
    return years;
  },

  /**
   * Prepare program data for export
   */
  prepareForExport: (programs) => {
    if (!Array.isArray(programs)) return [];

    return programs.map((program) => ({
      "Program Code": program.program_code,
      "Program Name": program.program_name,
      Type: programAPI.getProgramTypeDisplay(program.program_type),
      Department: program.department_name,
      College: program.college_name,
      Status: program.status,
      "Course Count": program.course_count || 0,
      "Created Date": program.created_at
        ? new Date(program.created_at).toLocaleDateString()
        : "",
      "Last Updated": program.updated_at
        ? new Date(program.updated_at).toLocaleDateString()
        : "",
    }));
  },

  /**
   * Generate CSV content
   */
  generateCSV: (programs) => {
    const data = programUtils.prepareForExport(programs);
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes
            const escaped = ("" + value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  },
};

// ================ HOOKS FOR REACT COMPONENTS ================


 // Custom hook for program operations
 
export const useProgram = () => {
  // You can implement React hooks here
  return {
    // Hook implementations
  };
};

// Export everything
export default {
  program: programAPI,
  programYear: programYearAPI,
  utils: programUtils,
};


// // src/utils/api/index.js - COMPLETE MATCHING VERSION
// import apiClient from './client';
// import workloadAPI from './workload';
// import academicAPI from './academic';
// import { courseAPI, courseUtils } from './course';
// import collegeAPI from './college';
// import authAPI from './auth';
// import departmentAPI from './department';
// import { courseAssignmentAPI, courseAssignmentUtils } from "./courseAssignment";
// import { courseRequestAPI, courseRequestUtils  } from "./courseRequest";
// import { exportAPI } from './export';
// import { programAPI } from './program';
// import {
//   overloadDetectionAPI,
//   overloadDetectionUtils,
// } from "./overloadDetection";
// import workloadRPAPI from './workloadRPAPI';
// import workloadNRPAPI from './workloadNRPAPI';
// import { paymentAPI } from './payment';
// import { systemAPI } from './system';
// import { rulesAPI } from './rules';
// import { staffAPI } from './staffAPI';
// import {semesterAPI,semesterUtils} from './semester'
// export default apiClient;

// // ================ COURSE API (UPDATED 

// export {
//   authAPI,
//   academicAPI,
//   collegeAPI,
//   courseAPI,          // Updated course API
//   courseUtils,        // Added course utilities
//   courseAssignmentAPI,
//   courseAssignmentUtils,
//   courseRequestAPI,
//   courseRequestUtils,
//   departmentAPI,
//   overloadDetectionAPI,
//   overloadDetectionUtils,
//   workloadNRPAPI,
//   workloadRPAPI,
//   paymentAPI,
//   systemAPI,
//   exportAPI,
//   programAPI ,
//  // roleRegistrationAPI,
//   rulesAPI,
//   staffAPI,
//   workloadAPI,
//   semesterAPI,
//   semesterUtils
// };

// src/api/index.js (Updated API integration)
import apiClient from "./client";

// Import all API modules
import workloadAPI from "./workload";
import academicAPI from "./academic";
import { courseAPI, courseUtils } from "./course";
import collegeAPI from "./college";
import authAPI from "./auth";
import departmentAPI from "./department";
import { courseAssignmentAPI, courseAssignmentUtils,useCourseAssignment } from "./courseAssignment";
import { courseRequestAPI, courseRequestUtils } from "./courseRequest";
import { exportAPI } from './export';
import { programAPI } from './program';
import { overloadDetectionAPI, overloadDetectionUtils } from "./overloadDetection";
import workloadRPAPI from './workloadRPAPI';
import workloadNRPAPI from './workloadNRPAPI';
import { paymentAPI } from './payment';
import { systemAPI } from './system';
import { rulesAPI } from './rules';
import { staffAPI, staffUtils } from "./staffAPI";
import { semesterAPI, semesterUtils } from './semester';
import { workloadDeptAPI,workloadDeptUtils } from "./workloadDeptAPI";
import workloadReportAPI from "./workloadReportAPI";
export default apiClient;

export {
  authAPI,
  academicAPI,
  collegeAPI,
  courseAPI,
  courseUtils,
  courseAssignmentAPI,
  courseAssignmentUtils,
  courseRequestAPI,
  courseRequestUtils,
  departmentAPI,
  overloadDetectionAPI,
  overloadDetectionUtils,
  workloadNRPAPI,
  workloadRPAPI,
  paymentAPI,
  systemAPI,
  exportAPI,
  programAPI,
  rulesAPI,
  staffAPI,
  staffUtils,
  workloadAPI,
  semesterAPI,
  semesterUtils,
  workloadDeptAPI,
  workloadDeptUtils,
 useCourseAssignment,
 workloadReportAPI
};fix this code based on this code 
// src/pages/workload/CompleteWorkloadManager.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Calendar,
  BookOpen,
  DollarSign,
  ChevronDown,
  Save,
  Send,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Database as DatabaseIcon,
  Settings,
  HelpCircle,
  Info,
  ExternalLink,
  UserCircle,
  Bell,
  Star,
  Copy,
  Image,
  Camera,
  Server,
  Cpu,
  Battery,
  Power,
  Cloud,
  Home,
  MapPin,
  Navigation,
  Flag,
  Zap,
  MessageSquare,
  Mail,
  Folder,
  File,
  Package,
  Box,
//   Cube,
  Sidebar,
  Menu,
  Bold,
  Italic,
  Underline,
  Code,
  ShoppingCart,
  Truck,
  Archive,
  Mouse,
  Keyboard,
  Headphones,
  Speaker,
  Video,
  Smartphone,
  Tablet,
  Gamepad,
  Palette,
  PaintBucket,
  Brush,
  Crop,
  Scissors,
  Eraser,
  Ruler,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List as ListIcon,
  Omega,
  Sigma,
  Euro,
  PoundSterling,
//   Yen,
  Bitcoin,
  Monitor,
  Printer,
//   Cut,
//   Font,
  Minus,
  Shield,
  Lock,
  Key,
  Heart,
  ThumbsUp,
  Share2,
  Film,
  Mic,
  Thermometer,
  Droplet,
  Umbrella,
  Anchor,
  Compass,
  Phone,
  MessageCircle,
  Music,
  BellOff,
  MicOff,
  VolumeX,
  VideoOff,
  CameraOff,
  PhoneOff,
  Voicemail
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";

// API imports
import workloadAPI from "../../api/";
import semesterAPI from "../../api/";
import courseAPI from "../../api/";
import staffAPI from "../../api/";

// Rest of your component code remains the same...

const CompleteWorkloadManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { workloadId, workloadType } = useParams();

  // State for workload type (RP or NRP)
  const [activeTab, setActiveTab] = useState(workloadType || "rp");
  const [loading, setLoading] = useState({
    workloads: true,
    semesters: true,
    courses: true,
    form: false,
  });

  // Data states
  const [workloads, setWorkloads] = useState({
    rp: [],
    nrp: [],
  });
  const [filteredWorkloads, setFilteredWorkloads] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWorkload, setCurrentWorkload] = useState(null);

  // RP Form fields
  const [rpForm, setRpForm] = useState({
    staff_id: "",
    semester_id: "",
    course_code: "",
    course_credit_hours: "",
    lecture_credit_hours: "",
    tutorial_credit_hours: "",
    lab_credit_hours: "",
    student_department: "",
    academic_year: "",
    number_of_sections: 1,
    each_section_course_load: "",
    variety_of_course_load: "",
    research_load: "",
    community_service_load: "",
    elip_load: "",
    hdp_load: "",
    course_chair_load: "",
    section_advisor_load: "",
    advising_load: "",
    position_load: "",
    total_load: "",
    over_payment_birr: "",
    status: "draft",
  });

  // NRP Form fields
  const [nrpForm, setNrpForm] = useState({
    staff_id: "",
    semester_id: "",
    program_type: "extension",
    contract_number: "",
    academic_year: "",
    academic_year_ec: "",
    contract_type: "teaching",
    course_id: "",
    course_code: "",
    course_title: "",
    credit_hours: "",
    lecture_credit_hours: "",
    lab_credit_hours: "",
    tutorial_credit_hours: "",
    lecture_sections: 0,
    lab_sections: 0,
    teaching_hours: "",
    module_hours: "",
    student_count: 0,
    assignment_students: 0,
    exam_students: 0,
    project_advising: "",
    project_groups: 0,
    rate_category: "default",
    rate_per_rank: "",
    assignment_rate: "25.00",
    exam_rate: "20.00",
    tutorial_rate_per_hour: "100.00",
    teaching_payment: "",
    tutorial_payment: "",
    assignment_payment: "",
    exam_payment: "",
    project_payment: "",
    total_payment: "",
    total_hours_worked: "",
    contract_duration_from: "",
    contract_duration_to: "",
    is_overload: false,
    overload_hours: "",
    overload_payment: "",
    status: "draft",
  });

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    semester: "all",
    search: "",
    program_type: "all",
  });

  // Stats
  const [stats, setStats] = useState({
    rp: {
      total: 0,
      draft: 0,
      submitted: 0,
      approved: 0,
      totalHours: 0,
      totalPayment: 0,
    },
    nrp: {
      total: 0,
      draft: 0,
      submitted: 0,
      approved: 0,
      totalHours: 0,
      totalPayment: 0,
    },
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedWorkload, setSelectedWorkload] = useState(null);

  // Refs
  const formRef = useRef(null);

  // Load initial data
  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter workloads when filters change
  useEffect(() => {
    filterWorkloads();
  }, [workloads, filters, activeTab]);

  // Set edit mode if workloadId is provided
  useEffect(() => {
    if (workloadId) {
      handleEditWorkload(workloadId);
    }
  }, [workloadId]);

  const fetchAllData = async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        workloads: true,
        semesters: true,
        courses: true,
      }));

      // Fetch semesters
      const semestersResponse = await semesterAPI.getAllSemesters();
      setSemesters(semestersResponse.data || []);

      // Fetch active semester
      if (semestersResponse.data?.length > 0) {
        const active =
          semestersResponse.data.find((s) => s.is_active) ||
          semestersResponse.data[0];
        setActiveSemester(active);
      }

      // Fetch courses
      const coursesResponse = await courseAPI.getAll();
      setCourses(coursesResponse.data || []);

      // Fetch staff members (for admin/dept head)
      if (["admin", "department_head", "dean"].includes(user?.role)) {
        const staffResponse = await staffAPI.getAll();
        setStaffMembers(staffResponse.data || []);
      }

      // Fetch workloads
      await fetchWorkloads();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading((prev) => ({
        ...prev,
        workloads: false,
        semesters: false,
        courses: false,
      }));
    }
  };

  const fetchWorkloads = async () => {
    try {
      // Fetch RP workloads
      const rpResponse = await workloadAPI.getAllRP({
        staff_id: user?.role === "instructor" ? user.staff_id : undefined,
      });

      // Fetch NRP workloads
      const nrpResponse = await workloadAPI.getAllNRP({
        staff_id: user?.role === "instructor" ? user.staff_id : undefined,
      });

      setWorkloads({
        rp: rpResponse.data?.workloads || [],
        nrp: nrpResponse.data?.workloads || [],
      });

      // Calculate stats
      calculateStats(
        rpResponse.data?.workloads || [],
        nrpResponse.data?.workloads || []
      );
    } catch (error) {
      console.error("Error fetching workloads:", error);
      toast.error("Failed to load workloads");
    }
  };

  const calculateStats = (rpWorkloads, nrpWorkloads) => {
    // RP Stats
    const rpStats = {
      total: rpWorkloads.length,
      draft: rpWorkloads.filter((w) => w.status === "draft").length,
      submitted: rpWorkloads.filter((w) => w.status === "submitted").length,
      approved: rpWorkloads.filter((w) => w.status.includes("approved")).length,
      totalHours: rpWorkloads.reduce(
        (sum, w) => sum + (parseFloat(w.total_load) || 0),
        0
      ),
      totalPayment: rpWorkloads.reduce(
        (sum, w) => sum + (parseFloat(w.over_payment_birr) || 0),
        0
      ),
    };

    // NRP Stats
    const nrpStats = {
      total: nrpWorkloads.length,
      draft: nrpWorkloads.filter((w) => w.status === "draft").length,
      submitted: nrpWorkloads.filter((w) => w.status === "submitted").length,
      approved: nrpWorkloads.filter((w) =>
        ["finance_approved", "paid"].includes(w.status)
      ).length,
      totalHours: nrpWorkloads.reduce(
        (sum, w) => sum + (parseFloat(w.total_hours_worked) || 0),
        0
      ),
      totalPayment: nrpWorkloads.reduce(
        (sum, w) => sum + (parseFloat(w.total_payment) || 0),
        0
      ),
    };

    setStats({ rp: rpStats, nrp: nrpStats });
  };

  const filterWorkloads = () => {
    const currentWorkloads = activeTab === "rp" ? workloads.rp : workloads.nrp;

    let filtered = [...currentWorkloads];

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((w) => w.status === filters.status);
    }

    // Apply semester filter
    if (filters.semester !== "all") {
      filtered = filtered.filter(
        (w) => w.semester_id?.toString() === filters.semester
      );
    }

    // Apply program type filter (for NRP)
    if (activeTab === "nrp" && filters.program_type !== "all") {
      filtered = filtered.filter(
        (w) => w.program_type === filters.program_type
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.course_code?.toLowerCase().includes(searchLower) ||
          w.course_title?.toLowerCase().includes(searchLower) ||
          (activeTab === "nrp" &&
            w.contract_number?.toLowerCase().includes(searchLower))
      );
    }

    setFilteredWorkloads(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowForm(false);
    setEditMode(false);
    setCurrentWorkload(null);
  };

  const handleNewWorkload = () => {
    setShowForm(true);
    setEditMode(false);
    setCurrentWorkload(null);

    // Reset forms
    if (activeTab === "rp") {
      setRpForm({
        staff_id: user?.role === "instructor" ? user.staff_id : "",
        semester_id: activeSemester?.semester_id || "",
        course_code: "",
        course_credit_hours: "",
        lecture_credit_hours: "",
        tutorial_credit_hours: "",
        lab_credit_hours: "",
        student_department: "",
        academic_year: "",
        number_of_sections: 1,
        each_section_course_load: "",
        variety_of_course_load: "",
        research_load: "",
        community_service_load: "",
        elip_load: "",
        hdp_load: "",
        course_chair_load: "",
        section_advisor_load: "",
        advising_load: "",
        position_load: "",
        total_load: "",
        over_payment_birr: "",
        status: "draft",
      });
    } else {
      setNrpForm({
        staff_id: user?.role === "instructor" ? user.staff_id : "",
        semester_id: activeSemester?.semester_id || "",
        program_type: "extension",
        contract_number: `CONTRACT-${Date.now()}`,
        academic_year: new Date().getFullYear().toString(),
        academic_year_ec: "",
        contract_type: "teaching",
        course_id: "",
        course_code: "",
        course_title: "",
        credit_hours: "",
        lecture_credit_hours: "",
        lab_credit_hours: "",
        tutorial_credit_hours: "",
        lecture_sections: 0,
        lab_sections: 0,
        teaching_hours: "",
        module_hours: "",
        student_count: 0,
        assignment_students: 0,
        exam_students: 0,
        project_advising: "",
        project_groups: 0,
        rate_category: "default",
        rate_per_rank: "",
        assignment_rate: "25.00",
        exam_rate: "20.00",
        tutorial_rate_per_hour: "100.00",
        teaching_payment: "",
        tutorial_payment: "",
        assignment_payment: "",
        exam_payment: "",
        project_payment: "",
        total_payment: "",
        total_hours_worked: "",
        contract_duration_from: "",
        contract_duration_to: "",
        is_overload: false,
        overload_hours: "",
        overload_payment: "",
        status: "draft",
      });
    }

    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleEditWorkload = (id) => {
    const workload = (activeTab === "rp" ? workloads.rp : workloads.nrp).find(
      (w) => w[activeTab === "rp" ? "workload_id" : "nrp_id"] === parseInt(id)
    );

    if (workload) {
      setCurrentWorkload(workload);
      setEditMode(true);
      setShowForm(true);

      if (activeTab === "rp") {
        setRpForm({
          staff_id: workload.staff_id,
          semester_id: workload.semester_id,
          course_code: workload.course_code,
          course_credit_hours: workload.course_credit_hours,
          lecture_credit_hours: workload.lecture_credit_hours,
          tutorial_credit_hours: workload.tutorial_credit_hours,
          lab_credit_hours: workload.lab_credit_hours,
          student_department: workload.student_department,
          academic_year: workload.academic_year,
          number_of_sections: workload.number_of_sections,
          each_section_course_load: workload.each_section_course_load,
          variety_of_course_load: workload.variety_of_course_load,
          research_load: workload.research_load,
          community_service_load: workload.community_service_load,
          elip_load: workload.elip_load,
          hdp_load: workload.hdp_load,
          course_chair_load: workload.course_chair_load,
          section_advisor_load: workload.section_advisor_load,
          advising_load: workload.advising_load,
          position_load: workload.position_load,
          total_load: workload.total_load,
          over_payment_birr: workload.over_payment_birr,
          status: workload.status,
        });
      } else {
        setNrpForm({
          staff_id: workload.staff_id,
          semester_id: workload.semester_id,
          program_type: workload.program_type,
          contract_number: workload.contract_number,
          academic_year: workload.academic_year,
          academic_year_ec: workload.academic_year_ec,
          contract_type: workload.contract_type,
          course_id: workload.course_id,
          course_code: workload.course_code,
          course_title: workload.course_title,
          credit_hours: workload.credit_hours,
          lecture_credit_hours: workload.lecture_credit_hours,
          lab_credit_hours: workload.lab_credit_hours,
          tutorial_credit_hours: workload.tutorial_credit_hours,
          lecture_sections: workload.lecture_sections,
          lab_sections: workload.lab_sections,
          teaching_hours: workload.teaching_hours,
          module_hours: workload.module_hours,
          student_count: workload.student_count,
          assignment_students: workload.assignment_students,
          exam_students: workload.exam_students,
          project_advising: workload.project_advising,
          project_groups: workload.project_groups,
          rate_category: workload.rate_category,
          rate_per_rank: workload.rate_per_rank,
          assignment_rate: workload.assignment_rate,
          exam_rate: workload.exam_rate,
          tutorial_rate_per_hour: workload.tutorial_rate_per_hour,
          teaching_payment: workload.teaching_payment,
          tutorial_payment: workload.tutorial_payment,
          assignment_payment: workload.assignment_payment,
          exam_payment: workload.exam_payment,
          project_payment: workload.project_payment,
          total_payment: workload.total_payment,
          total_hours_worked: workload.total_hours_worked,
          contract_duration_from: workload.contract_duration_from,
          contract_duration_to: workload.contract_duration_to,
          is_overload: workload.is_overload,
          overload_hours: workload.overload_hours,
          overload_payment: workload.overload_payment,
          status: workload.status,
        });
      }

      // Scroll to form
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleViewDetails = (workload) => {
    setSelectedWorkload(workload);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (workload) => {
    setSelectedWorkload(workload);
    setShowDeleteModal(true);
  };

  const handleSubmitClick = (workload) => {
    setSelectedWorkload(workload);
    setShowSubmitModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWorkload) return;

    try {
      setLoading((prev) => ({ ...prev, form: true }));

      if (activeTab === "rp") {
        await workloadAPI.deleteRP(selectedWorkload.workload_id);
      } else {
        await workloadAPI.deleteNRP(selectedWorkload.nrp_id);
      }

      toast.success("Workload deleted successfully");
      await fetchWorkloads();
      setShowDeleteModal(false);
      setSelectedWorkload(null);
    } catch (error) {
      console.error("Error deleting workload:", error);
      toast.error("Failed to delete workload");
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const handleSubmitConfirm = async () => {
    if (!selectedWorkload) return;

    try {
      setLoading((prev) => ({ ...prev, form: true }));

      if (activeTab === "rp") {
        await workloadAPI.submitRP(selectedWorkload.workload_id);
      } else {
        await workloadAPI.submitNRP(selectedWorkload.nrp_id);
      }

      toast.success("Workload submitted for approval");
      await fetchWorkloads();
      setShowSubmitModal(false);
      setSelectedWorkload(null);
    } catch (error) {
      console.error("Error submitting workload:", error);
      toast.error("Failed to submit workload");
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const handleRpFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRpForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-calculate total load if component values change
    if (name.includes("load") && name !== "total_load") {
      setTimeout(calculateRpTotalLoad, 100);
    }
  };

  const calculateRpTotalLoad = () => {
    const courseLoad =
      (parseFloat(rpForm.each_section_course_load) || 0) *
      (parseInt(rpForm.number_of_sections) || 1);
    const varietyLoad = parseFloat(rpForm.variety_of_course_load) || 0;
    const researchLoad = parseFloat(rpForm.research_load) || 0;
    const communityLoad = parseFloat(rpForm.community_service_load) || 0;
    const elipLoad = parseFloat(rpForm.elip_load) || 0;
    const hdpLoad = parseFloat(rpForm.hdp_load) || 0;
    const courseChairLoad = parseFloat(rpForm.course_chair_load) || 0;
    const sectionAdvisorLoad = parseFloat(rpForm.section_advisor_load) || 0;
    const advisingLoad = parseFloat(rpForm.advising_load) || 0;
    const positionLoad = parseFloat(rpForm.position_load) || 0;

    const totalLoad =
      courseLoad +
      varietyLoad +
      researchLoad +
      communityLoad +
      elipLoad +
      hdpLoad +
      courseChairLoad +
      sectionAdvisorLoad +
      advisingLoad +
      positionLoad;

    setRpForm((prev) => ({
      ...prev,
      total_load: totalLoad.toFixed(2),
    }));
  };

  const handleNrpFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNrpForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-calculate if payment-related fields change
    if (
      name.includes("payment") ||
      name.includes("hours") ||
      name === "rate_per_rank"
    ) {
      setTimeout(calculateNrpPayments, 100);
    }
  };

  const calculateNrpPayments = () => {
    // Calculate teaching payment based on hours and rate
    const teachingHours = parseFloat(nrpForm.teaching_hours) || 0;
    const moduleHours = parseFloat(nrpForm.module_hours) || 0;
    const ratePerRank = parseFloat(nrpForm.rate_per_rank) || 500;

    let teachingPayment = 0;
    let totalHours = 0;

    switch (nrpForm.program_type) {
      case "extension":
      case "weekend":
        const creditHours = parseFloat(nrpForm.credit_hours) || 0;
        teachingPayment = creditHours * ratePerRank;
        totalHours = creditHours * 15; // Assuming 15 hours per credit
        break;
      case "summer":
        teachingPayment = teachingHours * ratePerRank;
        totalHours = teachingHours;
        break;
      case "distance":
        teachingPayment = moduleHours * ratePerRank;
        totalHours = moduleHours;
        break;
    }

    // Calculate additional payments
    const assignmentPayment =
      (parseInt(nrpForm.assignment_students) || 0) *
      (parseFloat(nrpForm.assignment_rate) || 25);
    const examPayment =
      (parseInt(nrpForm.exam_students) || 0) *
      (parseFloat(nrpForm.exam_rate) || 20);
    const tutorialPayment =
      (parseFloat(nrpForm.tutorial_credit_hours) || 0) *
      (parseFloat(nrpForm.tutorial_rate_per_hour) || 100);
    const overloadPayment =
      (parseFloat(nrpForm.overload_hours) || 0) * (ratePerRank * 1.5); // 150% for overload

    const totalPayment =
      teachingPayment +
      assignmentPayment +
      examPayment +
      tutorialPayment +
      overloadPayment;

    setNrpForm((prev) => ({
      ...prev,
      teaching_payment: teachingPayment.toFixed(2),
      assignment_payment: assignmentPayment.toFixed(2),
      exam_payment: examPayment.toFixed(2),
      tutorial_payment: tutorialPayment.toFixed(2),
      overload_payment: overloadPayment.toFixed(2),
      total_payment: totalPayment.toFixed(2),
      total_hours_worked: totalHours.toFixed(2),
    }));
  };

  const handleRpSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading((prev) => ({ ...prev, form: true }));

      const formData = {
        ...rpForm,
        staff_id: user?.role === "instructor" ? user.staff_id : rpForm.staff_id,
        course_credit_hours: parseFloat(rpForm.course_credit_hours) || 0,
        lecture_credit_hours: parseFloat(rpForm.lecture_credit_hours) || 0,
        tutorial_credit_hours: parseFloat(rpForm.tutorial_credit_hours) || 0,
        lab_credit_hours: parseFloat(rpForm.lab_credit_hours) || 0,
        number_of_sections: parseInt(rpForm.number_of_sections) || 1,
        each_section_course_load:
          parseFloat(rpForm.each_section_course_load) || 0,
        variety_of_course_load: parseFloat(rpForm.variety_of_course_load) || 0,
        research_load: parseFloat(rpForm.research_load) || 0,
        community_service_load: parseFloat(rpForm.community_service_load) || 0,
        elip_load: parseFloat(rpForm.elip_load) || 0,
        hdp_load: parseFloat(rpForm.hdp_load) || 0,
        course_chair_load: parseFloat(rpForm.course_chair_load) || 0,
        section_advisor_load: parseFloat(rpForm.section_advisor_load) || 0,
        advising_load: parseFloat(rpForm.advising_load) || 0,
        position_load: parseFloat(rpForm.position_load) || 0,
        total_load: parseFloat(rpForm.total_load) || 0,
        over_payment_birr: parseFloat(rpForm.over_payment_birr) || 0,
      };

      if (editMode && currentWorkload) {
        await workloadAPI.updateRP(currentWorkload.workload_id, formData);
        toast.success("RP workload updated successfully");
      } else {
        await workloadAPI.createRP(formData);
        toast.success("RP workload created successfully");
      }

      // Reset and refresh
      setShowForm(false);
      setEditMode(false);
      setCurrentWorkload(null);
      await fetchWorkloads();
    } catch (error) {
      console.error("Error saving RP workload:", error);
      toast.error(error.response?.data?.message || "Failed to save workload");
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const handleNrpSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading((prev) => ({ ...prev, form: true }));

      const formData = {
        ...nrpForm,
        staff_id:
          user?.role === "instructor" ? user.staff_id : nrpForm.staff_id,
        credit_hours: parseFloat(nrpForm.credit_hours) || 0,
        lecture_credit_hours: parseFloat(nrpForm.lecture_credit_hours) || 0,
        lab_credit_hours: parseFloat(nrpForm.lab_credit_hours) || 0,
        tutorial_credit_hours: parseFloat(nrpForm.tutorial_credit_hours) || 0,
        lecture_sections: parseInt(nrpForm.lecture_sections) || 0,
        lab_sections: parseInt(nrpForm.lab_sections) || 0,
        teaching_hours: parseFloat(nrpForm.teaching_hours) || 0,
        module_hours: parseFloat(nrpForm.module_hours) || 0,
        student_count: parseInt(nrpForm.student_count) || 0,
        assignment_students: parseInt(nrpForm.assignment_students) || 0,
        exam_students: parseInt(nrpForm.exam_students) || 0,
        project_groups: parseInt(nrpForm.project_groups) || 0,
        rate_per_rank: parseFloat(nrpForm.rate_per_rank) || 0,
        assignment_rate: parseFloat(nrpForm.assignment_rate) || 25.0,
        exam_rate: parseFloat(nrpForm.exam_rate) || 20.0,
        tutorial_rate_per_hour:
          parseFloat(nrpForm.tutorial_rate_per_hour) || 100.0,
        teaching_payment: parseFloat(nrpForm.teaching_payment) || 0,
        tutorial_payment: parseFloat(nrpForm.tutorial_payment) || 0,
        assignment_payment: parseFloat(nrpForm.assignment_payment) || 0,
        exam_payment: parseFloat(nrpForm.exam_payment) || 0,
        project_payment: parseFloat(nrpForm.project_payment) || 0,
        total_payment: parseFloat(nrpForm.total_payment) || 0,
        total_hours_worked: parseFloat(nrpForm.total_hours_worked) || 0,
        overload_hours: parseFloat(nrpForm.overload_hours) || 0,
        overload_payment: parseFloat(nrpForm.overload_payment) || 0,
        is_overload: nrpForm.is_overload ? 1 : 0,
      };

      if (editMode && currentWorkload) {
        await workloadAPI.updateNRP(currentWorkload.nrp_id, formData);
        toast.success("NRP workload updated successfully");
      } else {
        await workloadAPI.createNRP(formData);
        toast.success("NRP workload created successfully");
      }

      // Reset and refresh
      setShowForm(false);
      setEditMode(false);
      setCurrentWorkload(null);
      await fetchWorkloads();
    } catch (error) {
      console.error("Error saving NRP workload:", error);
      toast.error(error.response?.data?.message || "Failed to save workload");
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const handleCourseSelect = (courseId) => {
    const course = courses.find((c) => c.course_id === parseInt(courseId));
    if (course) {
      if (activeTab === "rp") {
        setRpForm((prev) => ({
          ...prev,
          course_code: course.course_code,
          course_credit_hours: course.credit_hours,
          lecture_credit_hours: course.lecture_hours,
          lab_credit_hours: course.lab_hours,
          tutorial_credit_hours: course.tutorial_hours,
        }));
      } else {
        setNrpForm((prev) => ({
          ...prev,
          course_id: course.course_id,
          course_code: course.course_code,
          course_title: course.course_title,
          credit_hours: course.credit_hours,
          lecture_credit_hours: course.lecture_hours,
          lab_credit_hours: course.lab_hours,
          tutorial_credit_hours: course.tutorial_hours,
        }));
      }
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      draft: { bg: "bg-gray-100", text: "text-gray-800", icon: Clock },
      submitted: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: AlertCircle,
      },
      dh_approved: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        icon: CheckCircle,
      },
      dean_approved: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: CheckCircle,
      },
      hr_approved: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        icon: CheckCircle,
      },
      vpaa_approved: {
        bg: "bg-pink-100",
        text: "text-pink-800",
        icon: CheckCircle,
      },
      vpaf_approved: {
        bg: "bg-rose-100",
        text: "text-rose-800",
        icon: CheckCircle,
      },
      finance_approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
      },
      cde_approved: {
        bg: "bg-teal-100",
        text: "text-teal-800",
        icon: CheckCircle,
      },
      paid: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        icon: CheckCircle,
      },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    };

    return statusMap[status] || statusMap.draft;
  };

  const getStatusText = (status) => {
    const statusMap = {
      draft: "Draft",
      submitted: "Submitted",
      dh_approved: "Dept Head Approved",
      dean_approved: "Dean Approved",
      hr_approved: "HR Approved",
      vpaa_approved: "VPAA Approved",
      vpaf_approved: "VPAF Approved",
      finance_approved: "Finance Approved",
      cde_approved: "CDE Approved",
      paid: "Paid",
      rejected: "Rejected",
    };

    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0.00";
    return parseFloat(amount).toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Loading state
  if (loading.workloads && loading.semesters) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workload manager...</p>
        </div>
      </div>
    );
  }

  const currentStats = activeTab === "rp" ? stats.rp : stats.nrp;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-b-2xl shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {activeTab === "rp" ? "Regular Program" : "Non-Regular Program"}{" "}
                Workload Management
              </h1>
              <p className="text-blue-100">
                {activeTab === "rp"
                  ? "Manage your regular teaching workload and administrative duties"
                  : "Manage extension, weekend, summer, and distance program workloads"}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={fetchWorkloads}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleNewWorkload}
                className="px-4 py-2 bg-white hover:text-blue-600 text-blue-600 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={loading.form}
              >
                <Plus className="h-4 w-4" />
                <span>New Workload</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-6 py-6 -mt-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => handleTabChange("rp")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "rp"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Regular Program (RP)</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange("nrp")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "nrp"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Non-Regular Program (NRP)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Workloads
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {currentStats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {currentStats.draft}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {currentStats.submitted}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total {activeTab === "rp" ? "Hours" : "Payment"}
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {activeTab === "rp"
                    ? `${currentStats.totalHours.toFixed(1)}h`
                    : `ETB ${formatCurrency(currentStats.totalPayment)}`}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                {activeTab === "rp" ? (
                  <Clock className="h-6 w-6 text-emerald-600" />
                ) : (
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Workload Form */}
        {showForm && (
          <div
            ref={formRef}
            className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editMode ? "Edit" : "Create New"}{" "}
                  {activeTab === "rp" ? "RP" : "NRP"} Workload
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditMode(false);
                    setCurrentWorkload(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form
              onSubmit={activeTab === "rp" ? handleRpSubmit : handleNrpSubmit}
              className="p-6"
            >
              {activeTab === "rp" ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Semester *
                        </label>
                        <select
                          name="semester_id"
                          value={rpForm.semester_id}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Semester</option>
                          {semesters.map((semester) => (
                            <option
                              key={semester.semester_id}
                              value={semester.semester_id}
                            >
                              {semester.semester_name} ({semester.semester_code}
                              )
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course *
                        </label>
                        <select
                          name="course_code"
                          value={rpForm.course_code}
                          onChange={(e) => {
                            handleRpFormChange(e);
                            const course = courses.find(
                              (c) => c.course_code === e.target.value
                            );
                            if (course) {
                              setRpForm((prev) => ({
                                ...prev,
                                course_credit_hours: course.credit_hours,
                                lecture_credit_hours: course.lecture_hours,
                                lab_credit_hours: course.lab_hours,
                                tutorial_credit_hours: course.tutorial_hours,
                              }));
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Course</option>
                          {courses.map((course) => (
                            <option
                              key={course.course_id}
                              value={course.course_code}
                            >
                              {course.course_code} - {course.course_title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {["admin", "department_head", "dean"].includes(
                        user?.role
                      ) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Staff Member
                          </label>
                          <select
                            name="staff_id"
                            value={rpForm.staff_id}
                            onChange={handleRpFormChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Staff</option>
                            {staffMembers.map((staff) => (
                              <option
                                key={staff.staff_id}
                                value={staff.staff_id}
                              >
                                {staff.first_name} {staff.last_name} (
                                {staff.employee_id})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student Department
                        </label>
                        <input
                          type="text"
                          name="student_department"
                          value={rpForm.student_department}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Software Engineering"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Academic Year
                        </label>
                        <input
                          type="text"
                          name="academic_year"
                          value={rpForm.academic_year}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 2024-2025"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Sections
                        </label>
                        <input
                          type="number"
                          name="number_of_sections"
                          value={rpForm.number_of_sections}
                          onChange={handleRpFormChange}
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Credit Hours */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Credit Hours
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Credit Hours
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="course_credit_hours"
                          value={rpForm.course_credit_hours}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lecture Hours
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="lecture_credit_hours"
                          value={rpForm.lecture_credit_hours}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lab Hours
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="lab_credit_hours"
                          value={rpForm.lab_credit_hours}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tutorial Hours
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="tutorial_credit_hours"
                          value={rpForm.tutorial_credit_hours}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Load Distribution */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Load Distribution
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Per Section Course Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="each_section_course_load"
                          value={rpForm.each_section_course_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variety of Course Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="variety_of_course_load"
                          value={rpForm.variety_of_course_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Research Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="research_load"
                          value={rpForm.research_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Community Service Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="community_service_load"
                          value={rpForm.community_service_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Administrative Load */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Administrative Load
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ELIP Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="elip_load"
                          value={rpForm.elip_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          HDP Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="hdp_load"
                          value={rpForm.hdp_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Chair Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="course_chair_load"
                          value={rpForm.course_chair_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Advisor Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="section_advisor_load"
                          value={rpForm.section_advisor_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Advising Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="advising_load"
                          value={rpForm.advising_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="position_load"
                          value={rpForm.position_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Load
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="total_load"
                          value={rpForm.total_load}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Over Payment (Birr)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="over_payment_birr"
                          value={rpForm.over_payment_birr}
                          onChange={handleRpFormChange}
                          className="w-full px-4 py-2 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Program Type *
                        </label>
                        <select
                          name="program_type"
                          value={nrpForm.program_type}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="extension">Extension</option>
                          <option value="weekend">Weekend</option>
                          <option value="summer">Summer</option>
                          <option value="distance">Distance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Semester *
                        </label>
                        <select
                          name="semester_id"
                          value={nrpForm.semester_id}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Semester</option>
                          {semesters.map((semester) => (
                            <option
                              key={semester.semester_id}
                              value={semester.semester_id}
                            >
                              {semester.semester_name} ({semester.semester_code}
                              )
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contract Number
                        </label>
                        <input
                          type="text"
                          name="contract_number"
                          value={nrpForm.contract_number}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Auto-generated"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Academic Year
                        </label>
                        <input
                          type="text"
                          name="academic_year"
                          value={nrpForm.academic_year}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 2024-2025"
                        />
                      </div>

                      {["admin", "department_head", "dean"].includes(
                        user?.role
                      ) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Staff Member
                          </label>
                          <select
                            name="staff_id"
                            value={nrpForm.staff_id}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Staff</option>
                            {staffMembers.map((staff) => (
                              <option
                                key={staff.staff_id}
                                value={staff.staff_id}
                              >
                                {staff.first_name} {staff.last_name} (
                                {staff.employee_id})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contract Type
                        </label>
                        <select
                          name="contract_type"
                          value={nrpForm.contract_type}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="teaching">Teaching</option>
                          <option value="tutorial_correction">
                            Tutorial/Correction
                          </option>
                          <option value="combined">Combined</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Course Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Course
                        </label>
                        <select
                          value={nrpForm.course_id}
                          onChange={(e) => handleCourseSelect(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Course</option>
                          {courses.map((course) => (
                            <option
                              key={course.course_id}
                              value={course.course_id}
                            >
                              {course.course_code} - {course.course_title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Code
                        </label>
                        <input
                          type="text"
                          name="course_code"
                          value={nrpForm.course_code}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., SEng4021"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Title
                        </label>
                        <input
                          type="text"
                          name="course_title"
                          value={nrpForm.course_title}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Database Systems"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Credit Hours
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="credit_hours"
                          value={nrpForm.credit_hours}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hours Breakdown */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Hours Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lecture Credit Hours
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="lecture_credit_hours"
                          value={nrpForm.lecture_credit_hours}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lab Credit Hours
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="lab_credit_hours"
                          value={nrpForm.lab_credit_hours}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tutorial Credit Hours
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="tutorial_credit_hours"
                          value={nrpForm.tutorial_credit_hours}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teaching Hours
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="teaching_hours"
                          value={nrpForm.teaching_hours}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Module Hours (Distance)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="module_hours"
                          value={nrpForm.module_hours}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Hours Worked
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="total_hours_worked"
                          value={nrpForm.total_hours_worked}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Student Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Students
                        </label>
                        <input
                          type="number"
                          name="student_count"
                          value={nrpForm.student_count}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assignment Students
                        </label>
                        <input
                          type="number"
                          name="assignment_students"
                          value={nrpForm.assignment_students}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Students
                        </label>
                        <input
                          type="number"
                          name="exam_students"
                          value={nrpForm.exam_students}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Advising
                        </label>
                        <input
                          type="text"
                          name="project_advising"
                          value={nrpForm.project_advising}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Final year project groups"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Groups
                        </label>
                        <input
                          type="number"
                          name="project_groups"
                          value={nrpForm.project_groups}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rates & Payments */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Rates & Payments
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rate Category
                        </label>
                        <select
                          name="rate_category"
                          value={nrpForm.rate_category}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="default">Default</option>
                          <option value="A">Category A</option>
                          <option value="B">Category B</option>
                          <option value="C">Category C</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rate per Rank (ETB)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="rate_per_rank"
                          value={nrpForm.rate_per_rank}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 500.00"
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Is Overload?
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="is_overload"
                                checked={nrpForm.is_overload}
                                onChange={handleNrpFormChange}
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Yes</span>
                            </div>
                          </div>
                          {nrpForm.is_overload && (
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Overload Hours
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                name="overload_hours"
                                value={nrpForm.overload_hours}
                                onChange={handleNrpFormChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assignment Rate
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="assignment_rate"
                          value={nrpForm.assignment_rate}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Rate
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="exam_rate"
                          value={nrpForm.exam_rate}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tutorial Rate/Hour
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="tutorial_rate_per_hour"
                          value={nrpForm.tutorial_rate_per_hour}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Overload Payment
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="overload_payment"
                          value={nrpForm.overload_payment}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Payment
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="total_payment"
                          value={nrpForm.total_payment}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contract Duration */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Contract Duration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Date
                        </label>
                        <input
                          type="date"
                          name="contract_duration_from"
                          value={nrpForm.contract_duration_from}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          To Date
                        </label>
                        <input
                          type="date"
                          name="contract_duration_to"
                          value={nrpForm.contract_duration_to}
                          onChange={handleNrpFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditMode(false);
                    setCurrentWorkload(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading.form}
                >
                  Cancel
                </button>
                {rpForm.status === "draft" && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    disabled={loading.form}
                  >
                    {loading.form ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{editMode ? "Update" : "Save"} as Draft</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "rp") {
                      setRpForm((prev) => ({ ...prev, status: "submitted" }));
                    } else {
                      setNrpForm((prev) => ({ ...prev, status: "submitted" }));
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  disabled={loading.form}
                >
                  <Send className="h-4 w-4" />
                  <span>Save & Submit for Approval</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${
                    activeTab === "rp" ? "RP" : "NRP"
                  } workloads...`}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.semester}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      semester: e.target.value,
                    }))
                  }
                >
                  <option value="all">All Semesters</option>
                  {semesters.map((semester) => (
                    <option
                      key={semester.semester_id}
                      value={semester.semester_id}
                    >
                      {semester.semester_code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {activeTab === "nrp" && (
                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.program_type}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        program_type: e.target.value,
                      }))
                    }
                  >
                    <option value="all">All Programs</option>
                    <option value="extension">Extension</option>
                    <option value="weekend">Weekend</option>
                    <option value="summer">Summer</option>
                    <option value="distance">Distance</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              )}

              <button
                onClick={() => {
                  setFilters({
                    status: "all",
                    semester: "all",
                    search: "",
                    program_type: "all",
                  });
                }}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Workloads List */}
        <div className="space-y-6">
          {filteredWorkloads.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab === "rp" ? "RP" : "NRP"} Workloads Found
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.search ||
                filters.status !== "all" ||
                filters.semester !== "all"
                  ? "Try adjusting your filters"
                  : `You haven't created any ${
                      activeTab === "rp" ? "RP" : "NRP"
                    } workloads yet`}
              </p>
              <button
                onClick={handleNewWorkload}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Workload</span>
              </button>
            </div>
          ) : (
            filteredWorkloads.map((workload) => (
              <WorkloadCard
                key={
                  activeTab === "rp" ? workload.workload_id : workload.nrp_id
                }
                workload={workload}
                type={activeTab}
                onView={handleViewDetails}
                onEdit={handleEditWorkload}
                onDelete={handleDeleteClick}
                onSubmit={handleSubmitClick}
                userRole={user?.role}
              />
            ))
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedWorkload && (
        <DetailsModal
          workload={selectedWorkload}
          type={activeTab}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedWorkload(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWorkload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Workload
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this{" "}
                {activeTab === "rp" ? "RP" : "NRP"} workload? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedWorkload(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  disabled={loading.form}
                >
                  {loading.form ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && selectedWorkload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Submit for Approval
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you ready to submit this {activeTab === "rp" ? "RP" : "NRP"}{" "}
                workload for approval? Once submitted, you won't be able to edit
                it without approval.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedWorkload(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitConfirm}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  disabled={loading.form}
                >
                  {loading.form ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Workload Card Component
const WorkloadCard = ({
  workload,
  type,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  userRole,
}) => {
  const statusConfig = getStatusColor(workload.status);
  const StatusIcon = statusConfig.icon;

  const canEdit =
    workload.status === "draft" &&
    (userRole === "admin" ||
      (userRole === "instructor" && workload.staff_id === workload.staff_id) ||
      (userRole === "department_head" &&
        workload.department_id === workload.department_id));

  const canDelete =
    workload.status === "draft" &&
    (userRole === "admin" ||
      (userRole === "instructor" && workload.staff_id === workload.staff_id));

  const canSubmit =
    workload.status === "draft" &&
    userRole === "instructor" &&
    workload.staff_id === workload.staff_id;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 ${statusConfig.bg} rounded-lg`}>
                <StatusIcon className={`h-5 w-5 ${statusConfig.text}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {workload.course_code} -{" "}
                  {workload.course_title || "Untitled Workload"}
                </h3>
                {type === "nrp" && (
                  <div className="flex items-center space-x-4 mt-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getProgramTypeColor(
                        workload.program_type
                      )}`}
                    >
                      {workload.program_type?.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      Contract: {workload.contract_number}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-3">
              <span className="text-sm text-gray-600">
                Semester: {workload.semester_name || "N/A"}
              </span>
              {type === "rp" ? (
                <>
                  <span className="text-sm text-gray-600">
                    Sections: {workload.number_of_sections || 1}
                  </span>
                  <span className="text-sm text-gray-600">
                    Hours: {parseFloat(workload.total_load || 0).toFixed(1)}h
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-600">
                    Students: {workload.student_count || 0}
                  </span>
                  <span className="text-sm text-gray-600">
                    Hours:{" "}
                    {parseFloat(workload.total_hours_worked || 0).toFixed(1)}h
                  </span>
                </>
              )}
            </div>

            {type === "rp" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Credit Hours</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(workload.course_credit_hours || 0).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Student Department
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {workload.student_department || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Over Payment</p>
                  <p className="text-sm font-medium text-emerald-600">
                    ETB{" "}
                    {parseFloat(
                      workload.over_payment_birr || 0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {type === "nrp" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Credit Hours</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(workload.credit_hours || 0).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Teaching Hours</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(workload.teaching_hours || 0).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Module Hours</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(workload.module_hours || 0).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Payment</p>
                  <p className="text-sm font-medium text-emerald-600">
                    ETB{" "}
                    {parseFloat(workload.total_payment || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="ml-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
            >
              {getStatusText(workload.status)}
            </span>
          </div>
        </div>

        {/* Load Breakdown for RP */}
        {type === "rp" && workload.total_load > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Load Distribution
              </span>
              <span className="text-xs text-gray-500">
                Total: {parseFloat(workload.total_load).toFixed(1)}h
              </span>
            </div>
            <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-blue-500"
                style={{
                  width: `${
                    ((workload.each_section_course_load *
                      workload.number_of_sections) /
                      workload.total_load) *
                      100 || 0
                  }%`,
                }}
                title="Course Load"
              ></div>
              <div
                className="bg-green-500"
                style={{
                  width: `${
                    (workload.research_load / workload.total_load) * 100 || 0
                  }%`,
                }}
                title="Research Load"
              ></div>
              <div
                className="bg-purple-500"
                style={{
                  width: `${
                    (workload.community_service_load / workload.total_load) *
                      100 || 0
                  }%`,
                }}
                title="Community Service"
              ></div>
              <div
                className="bg-amber-500"
                style={{
                  width: `${
                    ((workload.elip_load +
                      workload.hdp_load +
                      workload.course_chair_load +
                      workload.section_advisor_load +
                      workload.advising_load +
                      workload.position_load) /
                      workload.total_load) *
                      100 || 0
                  }%`,
                }}
                title="Administrative Load"
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Course</span>
              <span>Research</span>
              <span>Community</span>
              <span>Admin</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onView(workload)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {canEdit && (
              <button
                onClick={() =>
                  onEdit(type === "rp" ? workload.workload_id : workload.nrp_id)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            {canSubmit && (
              <button
                onClick={() => onSubmit(workload)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(workload)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Details Modal Component
const DetailsModal = ({ workload, type, onClose }) => {
  const statusConfig = getStatusColor(workload.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Workload Details
              </h3>
              <p className="text-gray-600">
                {workload.course_code} -{" "}
                {workload.course_title || "Untitled Workload"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <StatusIcon className={`h-4 w-4 ${statusConfig.text}`} />
                    <span className={`font-medium ${statusConfig.text}`}>
                      {getStatusText(workload.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Semester</p>
                  <p className="text-gray-900 mt-1">{workload.semester_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Academic Year
                  </p>
                  <p className="text-gray-900 mt-1">
                    {workload.year_name || workload.academic_year}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Course Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Course Code
                  </p>
                  <p className="text-gray-900 mt-1">{workload.course_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Course Title
                  </p>
                  <p className="text-gray-900 mt-1">{workload.course_title}</p>
                </div>
                {type === "rp" ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Student Department
                      </p>
                      <p className="text-gray-900 mt-1">
                        {workload.student_department || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Academic Year
                      </p>
                      <p className="text-gray-900 mt-1">
                        {workload.academic_year || "N/A"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Program Type
                      </p>
                      <p className="text-gray-900 mt-1 capitalize">
                        {workload.program_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Contract Number
                      </p>
                      <p className="text-gray-900 mt-1">
                        {workload.contract_number}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Load/Payment Details */}
            {type === "rp" ? (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Load Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">
                      Total Load
                    </p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {parseFloat(workload.total_load || 0).toFixed(1)} hours
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-700">
                      Number of Sections
                    </p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {workload.number_of_sections || 1}
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-emerald-700">
                      Over Payment
                    </p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">
                      ETB{" "}
                      {parseFloat(
                        workload.over_payment_birr || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Load Breakdown */}
                <div className="mt-6">
                  <h5 className="text-md font-medium text-gray-900 mb-3">
                    Load Breakdown
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Course Load</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {parseFloat(
                          workload.each_section_course_load *
                            workload.number_of_sections || 0
                        ).toFixed(1)}
                        h
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Research Load</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {parseFloat(workload.research_load || 0).toFixed(1)}h
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Community Service</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {parseFloat(
                          workload.community_service_load || 0
                        ).toFixed(1)}
                        h
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Administrative</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {parseFloat(
                          (workload.elip_load || 0) +
                            (workload.hdp_load || 0) +
                            (workload.course_chair_load || 0) +
                            (workload.section_advisor_load || 0) +
                            (workload.advising_load || 0) +
                            (workload.position_load || 0)
                        ).toFixed(1)}
                        h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">
                      Total Hours
                    </p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {parseFloat(workload.total_hours_worked || 0).toFixed(1)}{" "}
                      hours
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-700">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {workload.student_count || 0}
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-emerald-700">
                      Total Payment
                    </p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">
                      ETB{" "}
                      {parseFloat(workload.total_payment || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="mt-6">
                  <h5 className="text-md font-medium text-gray-900 mb-3">
                    Payment Breakdown
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Teaching</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ETB{" "}
                        {parseFloat(
                          workload.teaching_payment || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Tutorial</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ETB{" "}
                        {parseFloat(
                          workload.tutorial_payment || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Assignment</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ETB{" "}
                        {parseFloat(
                          workload.assignment_payment || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Exam</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ETB{" "}
                        {parseFloat(
                          workload.exam_payment || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Overload</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ETB{" "}
                        {parseFloat(
                          workload.overload_payment || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Dates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Created At
                  </p>
                  <p className="text-gray-900 mt-1">
                    {formatDate(workload.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Updated At
                  </p>
                  <p className="text-gray-900 mt-1">
                    {formatDate(workload.updated_at)}
                  </p>
                </div>
                {type === "nrp" && workload.contract_duration_from && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Contract Duration
                    </p>
                    <p className="text-gray-900 mt-1">
                      {formatDate(workload.contract_duration_from)} to{" "}
                      {formatDate(workload.contract_duration_to)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {workload.status === "draft" && (
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Edit Workload
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for program type colors
const getProgramTypeColor = (type) => {
  const colors = {
    extension: "bg-blue-100 text-blue-800",
    weekend: "bg-purple-100 text-purple-800",
    summer: "bg-amber-100 text-amber-800",
    distance: "bg-teal-100 text-teal-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

export default CompleteWorkloadManager;
import and use give full functional code not lose any functionalty