



import apiClient from "./client";


export const academicAPI = {


  // Colleges
  getColleges: (params) => apiClient.get("/api/colleges", { params }),
  getCollegeById: (id) => apiClient.get(`/api/colleges/${id}`),
  createCollege: (data) => apiClient.post("/api/colleges", data),
  updateCollege: (id, data) => apiClient.put(`/api/colleges/${id}`, data),
  deleteCollege: (id) => apiClient.delete(`/api/colleges/${id}`),
  getCollegeStats: (id) => apiClient.get(`/api/colleges/${id}/statistics`),
  assignDeanToCollege: (id, userId) =>
    apiClient.post(`/api/colleges/${id}/assign-dean`, { user_id: userId }),

  // Departments
  getDepartments: (params) => apiClient.get("/api/departments", { params }),
  getDepartmentsByCollege: (collegeId, params) =>
    apiClient.get(`/api/departments/college/${collegeId}`, { params }),
  getDepartmentById: (id) => apiClient.get(`/api/departments/${id}`),
  createDepartment: (data) => apiClient.post("/api/departments", data),
  updateDepartment: (id, data) => apiClient.put(`/api/departments/${id}`, data),
  deleteDepartment: (id) => apiClient.delete(`/api/departments/${id}`),
  getDepartmentStats: (id) =>
    apiClient.get(`/api/departments/${id}/statistics`),
  assignHeadToDepartment: (id, userId) =>
    apiClient.post(`/api/departments/${id}/assign-head`, { user_id: userId }),

  // Programs
  getPrograms: (params) => apiClient.get("/api/programs", { params }),
  getProgramById: (id) => apiClient.get(`/api/programs/${id}`),
  getProgramsByDepartment: (departmentId, params) =>
    apiClient.get(`/api/programs/department/${departmentId}`, { params }),
  getProgramsByType: (type, params) =>
    apiClient.get(`/api/programs/type/${type}`, { params }),
  getProgramTypes: () => apiClient.get("/api/programs/types/all"),
  getProgramStats: (params) =>
    apiClient.get("/api/programs/statistics/overview", { params }),
  getProgramTypesDashboard: () =>
    apiClient.get("/api/programs/dashboard/types"),
  createProgram: (data) => apiClient.post("/api/programs", data),
  updateProgram: (id, data) => apiClient.put(`/api/programs/${id}`, data),
  deleteProgram: (id) => apiClient.delete(`/api/programs/${id}`),
  assignCoursesToProgram: (id, courseIds) =>
    apiClient.post(`/api/programs/${id}/assign-courses`, {
      course_ids: courseIds,
    }),

  // Courses
  getCourses: (params) => apiClient.get("/api/courses", { params }),
  searchCourses: (params) => apiClient.get("/api/courses/search", { params }),
  getCourseById: (id) => apiClient.get(`/api/courses/${id}`),
  getCoursesByDepartment: (departmentId, params) =>
    apiClient.get(`/api/courses/department/${departmentId}`, { params }),
  getCoursesByProgram: (programId, params) =>
    apiClient.get(`/api/courses/program/${programId}`, { params }),
  getCoursesByProgramType: (type, params) =>
    apiClient.get(`/api/courses/type/${type}`, { params }),
  getCourseOfferings: (id) => apiClient.get(`/api/courses/${id}/offerings`),
  getCourseSections: (id, semesterId = null) =>
    apiClient.get(`/api/courses/${id}/sections`, {
      params: { semester_id: semesterId },
    }),
  calculateCourseLoad: (id, params = {}) =>
    apiClient.get(`/api/courses/${id}/calculate-load`, { params }),
  getRelatedCourses: (id) => apiClient.get(`/api/courses/${id}/related`),
  getCourseStats: (params) =>
    apiClient.get("/api/courses/statistics/overview", { params }),
  createCourse: (data) => apiClient.post("/api/courses", data),
  updateCourse: (id, data) => apiClient.put(`/api/courses/${id}`, data),
  deleteCourse: (id) => apiClient.delete(`/api/courses/${id}`),

  // Sections
  getSections: (params) => apiClient.get("/api/sections", { params }),
  getSectionById: (id) => apiClient.get(`/api/sections/${id}`),
  getSectionsByCourseAndSemester: (courseId, semesterId) =>
    apiClient.get(`/api/sections/course/${courseId}/semester/${semesterId}`),
  getSectionsByInstructor: (instructorId, params) =>
    apiClient.get(`/api/sections/instructor/${instructorId}`, { params }),
  getSectionsByDepartment: (departmentId, params) =>
    apiClient.get(`/api/sections/department/${departmentId}`, { params }),
  getUnassignedSections: (params) =>
    apiClient.get("/api/sections/unassigned/list", { params }),
  getSectionsByDateRange: (params) =>
    apiClient.get("/api/sections/date-range/filter", { params }),
  getSectionStats: (params) =>
    apiClient.get("/api/sections/statistics/overview", { params }),
  getDashboardSummary: () => apiClient.get("/api/sections/dashboard/summary"),
  createSection: (data) => apiClient.post("/api/sections", data),
  updateSection: (id, data) => apiClient.put(`/api/sections/${id}`, data),
  deleteSection: (id) => apiClient.delete(`/api/sections/${id}`),
  assignInstructorToSection: (id, instructorId) =>
    apiClient.post(`/api/sections/${id}/assign-instructor`, {
      instructor_id: instructorId,
    }),
  removeInstructorFromSection: (id) =>
    apiClient.delete(`/api/sections/${id}/remove-instructor`),
  updateStudentCount: (id, studentCount) =>
    apiClient.put(`/api/sections/${id}/student-count`, {
      student_count: studentCount,
    }),

  // Semesters (if you have semester routes, add them here)
  getSemesters: (params) => apiClient.get("/api/semesters", { params }),
  getSemesterById: (id) => apiClient.get(`/api/semesters/${id}`),
  getActiveSemester: () => apiClient.get("/api/semesters/active"),
  getSemestersByAcademicYear: (academicYearId, includeStats = false) =>
    apiClient.get(`/api/semesters/academic-year/${academicYearId}`, {
      params: { include_stats: includeStats },
    }),
  createSemester: (data) => apiClient.post("/api/semesters", data),
  updateSemester: (id, data) => apiClient.put(`/api/semesters/${id}`, data),
  deleteSemester: (id) => apiClient.delete(`/api/semesters/${id}`),
  activateSemester: (id) => apiClient.put(`/api/semesters/${id}/activate`),
  getSemesterStats: (id) => apiClient.get(`/api/semesters/${id}/statistics`),
  getCurrentSemester: () => apiClient.get("/api/semesters/current"),
};



export default academicAPI;
