
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
};