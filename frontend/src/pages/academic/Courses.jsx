// // // // // // // Example: src/pages/Courses/Courses.jsx
// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { courseAPI, courseUtils } from "../../api";
// // // // // // import {
// // // // // //   Search,
// // // // // //   Filter,
// // // // // //   Plus,
// // // // // //   Edit,
// // // // // //   Trash2,
// // // // // //   Eye,
// // // // // //   CheckCircle,
// // // // // //   Clock,
// // // // // //   MoreVertical,
// // // // // // } from "lucide-react";

// // // // // // function CoursesPage() {
// // // // // //   const [courses, setCourses] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [error, setError] = useState(null);
// // // // // //   const [searchQuery, setSearchQuery] = useState("");
// // // // // //   const [departmentFilter, setDepartmentFilter] = useState("All Departments");

// // // // // //   // Mock departments - replace with actual API call
// // // // // //   const departments = [
// // // // // //     "All Departments",
// // // // // //     "Computer Science",
// // // // // //     "Mathematics",
// // // // // //     "English Dept",
// // // // // //     "General Ed",
// // // // // //   ];

// // // // // //   // Fetch courses
// // // // // //   const fetchCourses = async (params = {}) => {
// // // // // //     try {
// // // // // //       setLoading(true);
// // // // // //       const response = await courseAPI.getAllCourses(params);
// // // // // //       if (response.success) {
// // // // // //         setCourses(response.data.courses || []);
// // // // // //       } else {
// // // // // //         setError(response.message);
// // // // // //       }
// // // // // //     } catch (err) {
// // // // // //       setError(err.message);
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   // Safe string conversion for filtering
// // // // // //   const safeToString = (value) => {
// // // // // //     if (value === null || value === undefined) return "";
// // // // // //     if (typeof value === "string") return value.toLowerCase();
// // // // // //     if (typeof value === "number") return value.toString().toLowerCase();
// // // // // //     if (typeof value === "object") return JSON.stringify(value).toLowerCase();
// // // // // //     return String(value).toLowerCase();
// // // // // //   };

// // // // // //   // Filter and search courses
// // // // // //   const filteredCourses = courses.filter((course) => {
// // // // // //     const searchLower = searchQuery.toLowerCase();

// // // // // //     // Check course ID (could be string or number)
// // // // // //     const courseIdStr = safeToString(
// // // // // //       course.course_id || course.code || course.id
// // // // // //     );

// // // // // //     // Check course title
// // // // // //     const courseTitleStr = safeToString(
// // // // // //       course.courseTitle || course.title || course.name
// // // // // //     );

// // // // // //     // Check department
// // // // // //     const courseDeptStr = safeToString(course.department);

// // // // // //     // Check program
// // // // // //     const courseProgramStr = safeToString(course.program);

// // // // // //     const matchesSearch =
// // // // // //       courseIdStr.includes(searchLower) ||
// // // // // //       courseTitleStr.includes(searchLower) ||
// // // // // //       courseDeptStr.includes(searchLower) ||
// // // // // //       courseProgramStr.includes(searchLower);

// // // // // //     const matchesDept =
// // // // // //       departmentFilter === "All Departments" ||
// // // // // //       (course.department && course.department === departmentFilter);

// // // // // //     return matchesSearch && matchesDept;
// // // // // //   });

// // // // // //   const handleSearch = (e) => {
// // // // // //     setSearchQuery(e.target.value);
// // // // // //   };

// // // // // //   const handleCreateCourse = async (courseData) => {
// // // // // //     try {
// // // // // //       const errors = courseUtils.validateCourseData(courseData);
// // // // // //       if (Object.keys(errors).length > 0) {
// // // // // //         return { success: false, errors };
// // // // // //       }
// // // // // //       const preparedData = courseUtils.prepareCourseFormData(courseData);
// // // // // //       const response = await courseAPI.createCourse(preparedData);
// // // // // //       if (response.success) {
// // // // // //         fetchCourses(); // Refresh the list
// // // // // //       }
// // // // // //       return response;
// // // // // //     } catch (err) {
// // // // // //       return { success: false, message: err.message };
// // // // // //     }
// // // // // //   };

// // // // // //   const handleDeleteCourse = async (id) => {
// // // // // //     if (window.confirm("Are you sure you want to delete this course?")) {
// // // // // //       try {
// // // // // //         const response = await courseAPI.deleteCourse(id);
// // // // // //         if (response.success) {
// // // // // //           fetchCourses(); // Refresh the list
// // // // // //         }
// // // // // //         return response;
// // // // // //       } catch (err) {
// // // // // //         return { success: false, message: err.message };
// // // // // //       }
// // // // // //     }
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     fetchCourses();
// // // // // //   }, []);

// // // // // //   const getStatusBadge = (status) => {
// // // // // //     const statusStr = safeToString(status);

// // // // // //     if (statusStr.includes("active")) {
// // // // // //       return (
// // // // // //         <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1 w-fit">
// // // // // //           <CheckCircle size={12} />
// // // // // //           Active
// // // // // //         </span>
// // // // // //       );
// // // // // //     }

// // // // // //     if (statusStr.includes("review")) {
// // // // // //       return (
// // // // // //         <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1 w-fit">
// // // // // //           <Clock size={12} />
// // // // // //           Review
// // // // // //         </span>
// // // // // //       );
// // // // // //     }

// // // // // //     // Default case
// // // // // //     return (
// // // // // //       <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
// // // // // //         {status || "Draft"}
// // // // // //       </span>
// // // // // //     );
// // // // // //   };

// // // // // //   // Format course ID display
// // // // // //   const formatCourseId = (course) => {
// // // // // //     const id = course.course_id || course.code || course.id;
// // // // // //     if (!id) return "N/A";
// // // // // //     if (typeof id === "number") return id.toString();
// // // // // //     return id;
// // // // // //   };

// // // // // //   // Format course title display
// // // // // //   const formatCourseTitle = (course) => {
// // // // // //     return (
// // // // // //       course.courseTitle || course.title || course.name || "Untitled Course"
// // // // // //     );
// // // // // //   };

// // // // // //   // Format department display
// // // // // //   const formatDepartment = (course) => {
// // // // // //     return course.department || course.dept || "Not Specified";
// // // // // //   };

// // // // // //   // Format program display
// // // // // //   const formatProgram = (course) => {
// // // // // //     return course.program || course.courseProgram || "";
// // // // // //   };

// // // // // //   // Format hours display
// // // // // //   const formatHours = (course) => {
// // // // // //     if (course.hours) return course.hours;
// // // // // //     if (
// // // // // //       course.lecture_hours !== undefined &&
// // // // // //       course.lab_hours !== undefined &&
// // // // // //       course.tutorial_hours !== undefined
// // // // // //     ) {
// // // // // //       return `${course.lecture_hours || 0} - ${course.lab_hours || 0} - ${
// // // // // //         course.tutorial_hours || 0
// // // // // //       } (${course.credit_hours || 0})`;
// // // // // //     }
// // // // // //     return "3 - 0 - 0 (3)"; // Default
// // // // // //   };

// // // // // //   // Get total sections
// // // // // //   const getSections = (course) => {
// // // // // //     return course.sections || course.activeSections || 0;
// // // // // //   };

// // // // // //   // Get course type
// // // // // //   const getCourseType = (course) => {
// // // // // //     return course.type || course.courseType || "Regular";
// // // // // //   };

// // // // // //   if (loading)
// // // // // //     return (
// // // // // //       <div className="flex items-center justify-center min-h-[400px]">
// // // // // //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
// // // // // //       </div>
// // // // // //     );

// // // // // //   if (error)
// // // // // //     return (
// // // // // //       <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
// // // // // //         <strong>Error:</strong> {error}
// // // // // //       </div>
// // // // // //     );

// // // // // //   return (
// // // // // //     <div className="p-6 bg-gray-50 min-h-screen">
// // // // // //       {/* Header */}
// // // // // //       <div className="mb-8">
// // // // // //         <h1 className="text-2xl font-bold text-gray-900 mb-2">
// // // // // //           Courses Catalogue
// // // // // //         </h1>
// // // // // //         <p className="text-gray-600">Browse and manage all available courses</p>
// // // // // //       </div>

// // // // // //       {/* Controls */}
// // // // // //       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
// // // // // //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// // // // // //           <div className="flex flex-col sm:flex-row gap-3 flex-1">
// // // // // //             <div className="relative flex-1 max-w-md">
// // // // // //               <Search
// // // // // //                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
// // // // // //                 size={20}
// // // // // //               />
// // // // // //               <input
// // // // // //                 type="text"
// // // // // //                 placeholder="Search courses by title or code..."
// // // // // //                 value={searchQuery}
// // // // // //                 onChange={handleSearch}
// // // // // //                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
// // // // // //               />
// // // // // //             </div>

// // // // // //             <div className="flex gap-3">
// // // // // //               <select
// // // // // //                 value={departmentFilter}
// // // // // //                 onChange={(e) => setDepartmentFilter(e.target.value)}
// // // // // //                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // // // // //               >
// // // // // //                 {departments.map((dept) => (
// // // // // //                   <option key={dept} value={dept}>
// // // // // //                     {dept}
// // // // // //                   </option>
// // // // // //                 ))}
// // // // // //               </select>

// // // // // //               <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
// // // // // //                 <Filter size={18} />
// // // // // //                 Filter
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           </div>

// // // // // //           <button
// // // // // //             onClick={() => {
// // // // // //               /* Open create modal */
// // // // // //             }}
// // // // // //             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
// // // // // //           >
// // // // // //             <Plus size={20} />
// // // // // //             New Course
// // // // // //           </button>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Courses Table */}
// // // // // //       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
// // // // // //         <div className="overflow-x-auto">
// // // // // //           <table className="min-w-full divide-y divide-gray-200">
// // // // // //             <thead className="bg-gray-50">
// // // // // //               <tr>
// // // // // //                 <th
// // // // // //                   scope="col"
// // // // // //                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
// // // // // //                 >
// // // // // //                   Code
// // // // // //                 </th>
// // // // // //                 <th
// // // // // //                   scope="col"
// // // // // //                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
// // // // // //                 >
// // // // // //                   Course Title
// // // // // //                 </th>
// // // // // //                 <th
// // // // // //                   scope="col"
// // // // // //                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
// // // // // //                 >
// // // // // //                   Department & Program
// // // // // //                 </th>
// // // // // //                 <th
// // // // // //                   scope="col"
// // // // // //                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
// // // // // //                 >
// // // // // //                   Hours (L-L-T)
// // // // // //                 </th>
// // // // // //                 <th
// // // // // //                   scope="col"
// // // // // //                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
// // // // // //                 >
// // // // // //                   Type
// // // // // //                 </th>
// // // // // //                 <th
// // // // // //                   scope="col"
// // // // // //                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
// // // // // //                 >
// // // // // //                   Sections
// // // // // //                 </th>
// // // // // //                 <th
// // // // // //                   scope="col"
// // // // // //                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
// // // // // //                 >
// // // // // //                   Status
// // // // // //                 </th>
// // // // // //                 <th
// // // // // //                   scope="col"
// // // // // //                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
// // // // // //                 >
// // // // // //                   Actions
// // // // // //                 </th>
// // // // // //               </tr>
// // // // // //             </thead>
// // // // // //             <tbody className="bg-white divide-y divide-gray-200">
// // // // // //               {filteredCourses.length > 0 ? (
// // // // // //                 filteredCourses.map((course, index) => (
// // // // // //                   <tr
// // // // // //                     key={course.course_id || course.id || `course-${index}`}
// // // // // //                     className="hover:bg-gray-50 transition-colors"
// // // // // //                   >
// // // // // //                     <td className="px-6 py-4 whitespace-nowrap">
// // // // // //                       <span className="font-mono font-semibold text-blue-600">
// // // // // //                         {formatCourseId(course)}
// // // // // //                       </span>
// // // // // //                     </td>
// // // // // //                     <td className="px-6 py-4">
// // // // // //                       <div>
// // // // // //                         <div className="font-medium text-gray-900">
// // // // // //                           {formatCourseTitle(course)}
// // // // // //                         </div>
// // // // // //                         <div className="text-sm text-gray-500 mt-1">
// // // // // //                           Credit hours: {course.credit_hours || 0}
// // // // // //                         </div>
// // // // // //                       </div>
// // // // // //                     </td>
// // // // // //                     <td className="px-6 py-4">
// // // // // //                       <div>
// // // // // //                         <div className="font-medium text-gray-900">
// // // // // //                           {formatDepartment(course)}
// // // // // //                         </div>
// // // // // //                         <div className="text-sm text-gray-500">
// // // // // //                           {formatProgram(course)}
// // // // // //                         </div>
// // // // // //                       </div>
// // // // // //                     </td>
// // // // // //                     <td className="px-6 py-4 whitespace-nowrap">
// // // // // //                       <div className="text-gray-900">{formatHours(course)}</div>
// // // // // //                       <div className="text-sm text-gray-500">
// // // // // //                         Total:{" "}
// // // // // //                         {courseUtils.calculateTotalHours
// // // // // //                           ? courseUtils.calculateTotalHours(course)
// // // // // //                           : "N/A"}
// // // // // //                         h
// // // // // //                       </div>
// // // // // //                     </td>
// // // // // //                     <td className="px-6 py-4">
// // // // // //                       <span
// // // // // //                         className={`px-3 py-1 rounded-full text-sm font-medium ${
// // // // // //                           getCourseType(course) === "Regular"
// // // // // //                             ? "bg-blue-100 text-blue-800"
// // // // // //                             : "bg-purple-100 text-purple-800"
// // // // // //                         }`}
// // // // // //                       >
// // // // // //                         {getCourseType(course)}
// // // // // //                       </span>
// // // // // //                     </td>
// // // // // //                     <td className="px-6 py-4">
// // // // // //                       <div className="font-medium text-gray-900">
// // // // // //                         {getSections(course)} Active
// // // // // //                       </div>
// // // // // //                       <div className="text-sm text-gray-500">
// // // // // //                         Total sections
// // // // // //                       </div>
// // // // // //                     </td>
// // // // // //                     <td className="px-6 py-4">
// // // // // //                       {getStatusBadge(course.status || course.courseStatus)}
// // // // // //                     </td>
// // // // // //                     <td className="px-6 py-4">
// // // // // //                       <div className="flex items-center space-x-2">
// // // // // //                         <button
// // // // // //                           onClick={() => {
// // // // // //                             /* View details */
// // // // // //                           }}
// // // // // //                           className="p-1 text-gray-400 hover:text-blue-600 transition"
// // // // // //                           title="View"
// // // // // //                         >
// // // // // //                           <Eye size={18} />
// // // // // //                         </button>
// // // // // //                         <button
// // // // // //                           onClick={() => {
// // // // // //                             /* Edit course */
// // // // // //                           }}
// // // // // //                           className="p-1 text-gray-400 hover:text-green-600 transition"
// // // // // //                           title="Edit"
// // // // // //                         >
// // // // // //                           <Edit size={18} />
// // // // // //                         </button>
// // // // // //                         <button
// // // // // //                           onClick={() =>
// // // // // //                             handleDeleteCourse(course.course_id || course.id)
// // // // // //                           }
// // // // // //                           className="p-1 text-gray-400 hover:text-red-600 transition"
// // // // // //                           title="Delete"
// // // // // //                         >
// // // // // //                           <Trash2 size={18} />
// // // // // //                         </button>
// // // // // //                         <button className="p-1 text-gray-400 hover:text-gray-600 transition">
// // // // // //                           <MoreVertical size={18} />
// // // // // //                         </button>
// // // // // //                       </div>
// // // // // //                     </td>
// // // // // //                   </tr>
// // // // // //                 ))
// // // // // //               ) : (
// // // // // //                 <tr>
// // // // // //                   <td colSpan="8" className="px-6 py-12 text-center">
// // // // // //                     <div className="text-gray-500">
// // // // // //                       {searchQuery
// // // // // //                         ? "No courses match your search."
// // // // // //                         : "No courses found."}
// // // // // //                     </div>
// // // // // //                   </td>
// // // // // //                 </tr>
// // // // // //               )}
// // // // // //             </tbody>
// // // // // //           </table>
// // // // // //         </div>

// // // // // //         {/* Footer */}
// // // // // //         <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
// // // // // //           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
// // // // // //             <div className="text-sm text-gray-500 mb-2 sm:mb-0">
// // // // // //               Showing{" "}
// // // // // //               <span className="font-medium">{filteredCourses.length}</span> of{" "}
// // // // // //               <span className="font-medium">{courses.length}</span> courses
// // // // // //             </div>
// // // // // //             <div className="flex items-center space-x-2">
// // // // // //               <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
// // // // // //                 Previous
// // // // // //               </button>
// // // // // //               <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-blue-50 text-blue-600 border-blue-200">
// // // // // //                 1
// // // // // //               </button>
// // // // // //               <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
// // // // // //                 2
// // // // // //               </button>
// // // // // //               <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
// // // // // //                 3
// // // // // //               </button>
// // // // // //               <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
// // // // // //                 Next
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Stats Summary */}
// // // // // //       <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
// // // // // //         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
// // // // // //           <div className="text-sm text-gray-500">Total Courses</div>
// // // // // //           <div className="text-2xl font-bold text-gray-900">
// // // // // //             {courses.length}
// // // // // //           </div>
// // // // // //         </div>
// // // // // //         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
// // // // // //           <div className="text-sm text-gray-500">Active Courses</div>
// // // // // //           <div className="text-2xl font-bold text-green-600">
// // // // // //             {
// // // // // //               courses.filter((c) => safeToString(c.status).includes("active"))
// // // // // //                 .length
// // // // // //             }
// // // // // //           </div>
// // // // // //         </div>
// // // // // //         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
// // // // // //           <div className="text-sm text-gray-500">In Review</div>
// // // // // //           <div className="text-2xl font-bold text-yellow-600">
// // // // // //             {
// // // // // //               courses.filter((c) => safeToString(c.status).includes("review"))
// // // // // //                 .length
// // // // // //             }
// // // // // //           </div>
// // // // // //         </div>
// // // // // //         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
// // // // // //           <div className="text-sm text-gray-500">Total Sections</div>
// // // // // //           <div className="text-2xl font-bold text-blue-600">
// // // // // //             {courses.reduce((acc, course) => acc + getSections(course), 0)}
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // }

// // // // // // export default CoursesPage;


// // // // // src/pages/Courses/Courses.jsx
// // import React, { useState, useEffect, useCallback, useMemo } from "react";
// // import {
// //   Search,
// //   Plus,
// //   Edit,
// //   Trash2,
// //   Eye,
// //   CheckCircle,
// //   Clock,
// //   MoreVertical,
// //   ChevronLeft,
// //   ChevronRight,
// //   RefreshCw,
// //   ChevronDown,
// //   ChevronUp,
// //   AlertCircle,
// //   Filter,
// //   Users,
// //   BookOpen,
// //   BarChart3,
// //   Calendar,
// //   ExternalLink,
// //   Building,
// //   Tag,
// //   Hash
// // } from "lucide-react";
// // import { courseAPI, courseUtils } from "../../api";
// // import { useNavigate } from "react-router-dom";
// // import apiClient from "../../api/client"; // Import apiClient for department API

// // function CoursesPage() {
// //   const navigate = useNavigate();
  
// //   // State Management
// //   const [courses, setCourses] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [departmentFilter, setDepartmentFilter] = useState("all");
// //   const [statusFilter, setStatusFilter] = useState("all");
// //   const [typeFilter, setTypeFilter] = useState("all");
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [totalCourses, setTotalCourses] = useState(0);
// //   const [departments, setDepartments] = useState([{ id: "all", name: "All Departments" }]);
// //   const [programs, setPrograms] = useState([]);
// //   const [isRefreshing, setIsRefreshing] = useState(false);
// //   const [sortConfig, setSortConfig] = useState({ key: 'course_code', direction: 'ascending' });
// //   const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
// //   const [stats, setStats] = useState({
// //     total: 0,
// //     active: 0,
// //     inactive: 0,
// //     by_type: {}
// //   });

// //   // Constants
// //   const ITEMS_PER_PAGE = 10;
  
// //   // Status options from database ENUM
// //   const statusOptions = [
// //     { value: "all", label: "All Status" },
// //     { value: "active", label: "Active" },
// //     { value: "inactive", label: "Inactive" },
// //     { value: "archived", label: "Archived" }
// //   ];
  
// //   // Program types from database ENUM
// //   const typeOptions = [
// //     { value: "all", label: "All Types" },
// //     { value: "regular", label: "Regular" },
// //     { value: "extension", label: "Extension" },
// //     { value: "weekend", label: "Weekend" },
// //     { value: "summer", label: "Summer" },
// //     { value: "distance", label: "Distance" }
// //   ];

// //   // Fetch departments for filter
// //   const fetchDepartments = useCallback(async () => {
// //     try {
// //       console.log("Fetching departments...");
// //       const response = await apiClient.get("/api/departments");
// //       console.log("Departments response:", response);
      
// //       if (response && response.data) {
// //         const data = response.data;
// //         const departmentsData = data.departments || data.data?.departments || data;
        
// //         if (Array.isArray(departmentsData)) {
// //           const formattedDepts = [
// //             { id: "all", name: "All Departments" },
// //             ...departmentsData.map(dept => ({
// //               id: dept.department_id || dept.id,
// //               name: dept.department_name || dept.department_code || `Department ${dept.department_id || dept.id}`
// //             }))
// //           ];
// //           setDepartments(formattedDepts);
// //           console.log("Departments loaded:", formattedDepts.length);
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Error fetching departments:", err);
// //       // If department API fails, extract from courses later
// //       console.log("Will extract departments from courses");
// //     }
// //   }, []);

// //   // Fetch course statistics
// //   const fetchCourseStats = useCallback(async () => {
// //     try {
// //       const response = await courseAPI.getCourseStats();
// //       console.log("Stats response:", response);
      
// //       if (response && response.data) {
// //         const statsData = response.data;
        
// //         // If statsData is an array (from getCourseStats)
// //         let calculatedStats = {
// //           total: totalCourses,
// //           active: 0,
// //           inactive: 0,
// //           by_type: {}
// //         };

// //         // Count from current courses
// //         const activeCount = courses.filter(c => c.status === 'active').length;
// //         const inactiveCount = courses.filter(c => c.status === 'inactive').length;
// //         const archivedCount = courses.filter(c => c.status === 'archived').length;
        
// //         // Calculate by type from current courses
// //         const byType = {};
// //         courses.forEach(course => {
// //           if (course.program_type) {
// //             byType[course.program_type] = (byType[course.program_type] || 0) + 1;
// //           }
// //         });
        
// //         calculatedStats = {
// //           total: totalCourses,
// //           active: activeCount,
// //           inactive: inactiveCount,
// //           archived: archivedCount,
// //           by_type: byType
// //         };
        
// //         // If backend returns aggregated stats, use them
// //         if (Array.isArray(statsData)) {
// //           statsData.forEach(stat => {
// //             if (stat.program_type) {
// //               calculatedStats.by_type[stat.program_type] = stat.course_count || 0;
// //             }
// //             if (stat.status === 'active') calculatedStats.active = stat.course_count || 0;
// //             if (stat.status === 'inactive') calculatedStats.inactive = stat.course_count || 0;
// //             if (stat.status === 'archived') calculatedStats.archived = stat.course_count || 0;
// //           });
// //         } else if (typeof statsData === 'object') {
// //           // If it's an object with counts
// //           Object.assign(calculatedStats, statsData);
// //         }
        
// //         setStats(calculatedStats);
// //       }
// //     } catch (err) {
// //       console.error("Error fetching course stats:", err);
// //       // Fallback to calculating from current courses
// //       const activeCount = courses.filter(c => c.status === 'active').length;
// //       const inactiveCount = courses.filter(c => c.status === 'inactive').length;
// //       const archivedCount = courses.filter(c => c.status === 'archived').length;
      
// //       const byType = {};
// //       courses.forEach(course => {
// //         if (course.program_type) {
// //           byType[course.program_type] = (byType[course.program_type] || 0) + 1;
// //         }
// //       });
      
// //       setStats({
// //         total: totalCourses,
// //         active: activeCount,
// //         inactive: inactiveCount,
// //         archived: archivedCount,
// //         by_type: byType
// //       });
// //     }
// //   }, [courses, totalCourses]);

// //   // Fetch courses with proper API usage
// //   const fetchCourses = useCallback(async (page = 1, search = "", filters = {}) => {
// //     try {
// //       setLoading(true);
// //       setError(null);
// //       setIsRefreshing(true);

// //       // Build params object matching backend CourseController.getAllCourses
// //       const params = {
// //         page: page,
// //         limit: ITEMS_PER_PAGE,
// //         ...(search && { search: search }), // 'search' parameter for backend
// //         ...(filters.department && filters.department !== "all" && { department_id: filters.department }),
// //         ...(filters.status && filters.status !== "all" && { status: filters.status }),
// //         ...(filters.type && filters.type !== "all" && { program_type: filters.type })
// //       };

// //       console.log("Fetching courses with params:", params);
      
// //       // Use the courseAPI directly
// //       const response = await courseAPI.getAllCourses(params);
// //       console.log("Courses API response:", response);
      
// //       if (response && response.data) {
// //         const data = response.data;
        
// //         // Handle different response structures from backend
// //         let coursesData = [];
// //         let total = 0;
// //         let pagination = {};
        
// //         if (data.courses && Array.isArray(data.courses)) {
// //           // Structure: { courses: [], pagination: { page, limit, total, pages } }
// //           coursesData = data.courses;
// //           total = data.pagination?.total || data.total || 0;
// //           pagination = data.pagination || { page: page, total: total, pages: Math.ceil(total / ITEMS_PER_PAGE) };
// //         } else if (Array.isArray(data)) {
// //           // Structure: [] (direct array)
// //           coursesData = data;
// //           total = data.length;
// //           pagination = { page: 1, total: data.length, pages: 1 };
// //         } else if (data.items && Array.isArray(data.items)) {
// //           // Structure: { items: [], total: X }
// //           coursesData = data.items;
// //           total = data.total || 0;
// //           pagination = { page: page, total: total, pages: Math.ceil(total / ITEMS_PER_PAGE) };
// //         } else {
// //           // Default: assume data is the courses array
// //           coursesData = Array.isArray(data) ? data : [];
// //           total = coursesData.length;
// //           pagination = { page: 1, total: total, pages: 1 };
// //         }

// //         console.log(`Loaded ${coursesData.length} courses, total: ${total}`);
        
// //         setCourses(coursesData);
// //         setTotalCourses(total);
// //         setTotalPages(pagination.pages || Math.ceil(total / ITEMS_PER_PAGE) || 1);
        
// //         // Extract unique departments from courses if department API failed
// //         if (departments.length <= 1 && coursesData.length > 0) {
// //           const deptMap = new Map();
// //           deptMap.set("all", "All Departments");
          
// //           coursesData.forEach(course => {
// //             if (course.department_id && course.department_name && !deptMap.has(course.department_id)) {
// //               deptMap.set(course.department_id, course.department_name);
// //             } else if (course.department_id && !deptMap.has(course.department_id)) {
// //               deptMap.set(course.department_id, `Department ${course.department_id}`);
// //             }
// //           });
          
// //           const deptList = Array.from(deptMap.entries()).map(([id, name]) => ({ id, name }));
// //           setDepartments(deptList);
// //         }
        
// //       } else {
// //         throw new Error("Invalid response format from server");
// //       }
      
// //     } catch (err) {
// //       console.error("Error fetching courses:", err);
      
// //       // Provide detailed error information
// //       let errorMessage = "Failed to load courses";
// //       let errorDetails = "";
      
// //       if (err.response) {
// //         // Backend responded with error status
// //         errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
// //         errorDetails = err.response.data?.error || "";
// //       } else if (err.request) {
// //         // Request made but no response
// //         errorMessage = "Network error - unable to reach server";
// //         errorDetails = "Please check your internet connection and try again";
// //       } else {
// //         // Other errors
// //         errorMessage = err.message || "Unknown error occurred";
// //       }
      
// //       setError({
// //         message: errorMessage,
// //         details: errorDetails,
// //         status: err.response?.status
// //       });
      
// //       // Set empty state
// //       setCourses([]);
// //       setTotalCourses(0);
// //       setTotalPages(1);
// //     } finally {
// //       setLoading(false);
// //       setIsRefreshing(false);
// //     }
// //   }, [ITEMS_PER_PAGE, departments.length]);

// //   // Handle search input change
// //   const handleSearchChange = (e) => {
// //     setSearchQuery(e.target.value);
// //   };

// //   // Handle search submission
// //   const handleSearchSubmit = useCallback(() => {
// //     setCurrentPage(1);
// //     fetchCourses(1, searchQuery, {
// //       department: departmentFilter,
// //       status: statusFilter,
// //       type: typeFilter
// //     });
// //   }, [searchQuery, departmentFilter, statusFilter, typeFilter, fetchCourses]);

// //   // Handle search on Enter key
// //   const handleKeyPress = (e) => {
// //     if (e.key === 'Enter') {
// //       handleSearchSubmit();
// //     }
// //   };

// //   // Handle filter changes
// //   const handleFilterChange = useCallback((filterType, value) => {
// //     console.log(`Filter changed: ${filterType} = ${value}`);
    
// //     // Update state immediately
// //     if (filterType === "department") {
// //       setDepartmentFilter(value);
// //     } else if (filterType === "status") {
// //       setStatusFilter(value);
// //     } else if (filterType === "type") {
// //       setTypeFilter(value);
// //     }
    
// //     // Reset to page 1 when filters change
// //     setCurrentPage(1);
    
// //     // Fetch courses with new filters
// //     const newFilters = {
// //       department: filterType === "department" ? value : departmentFilter,
// //       status: filterType === "status" ? value : statusFilter,
// //       type: filterType === "type" ? value : typeFilter
// //     };
    
// //     console.log("Fetching with filters:", newFilters);
// //     fetchCourses(1, searchQuery, newFilters);
// //   }, [searchQuery, departmentFilter, statusFilter, typeFilter, fetchCourses]);

// //   // Clear all filters
// //   const handleClearFilters = useCallback(() => {
// //     console.log("Clearing all filters");
// //     setSearchQuery("");
// //     setDepartmentFilter("all");
// //     setStatusFilter("all");
// //     setTypeFilter("all");
// //     setCurrentPage(1);
// //     fetchCourses();
// //   }, [fetchCourses]);

// //   // Handle sort
// //   const handleSort = (key) => {
// //     let direction = 'ascending';
// //     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
// //       direction = 'descending';
// //     }
// //     setSortConfig({ key, direction });
    
// //     // Re-fetch with sorting if backend supports it
// //     // For now, we'll just sort locally
// //   };

// //   // Handle page change
// //   const handlePageChange = (page) => {
// //     if (page < 1 || page > totalPages) return;
// //     setCurrentPage(page);
// //     fetchCourses(page, searchQuery, {
// //       department: departmentFilter,
// //       status: statusFilter,
// //       type: typeFilter
// //     });
// //   };

// //   // Handle refresh
// //   const handleRefresh = () => {
// //     setIsRefreshing(true);
// //     fetchCourses(currentPage, searchQuery, {
// //       department: departmentFilter,
// //       status: statusFilter,
// //       type: typeFilter
// //     });
// //     fetchCourseStats();
// //   };

// //   // Handle delete course
// //   const handleDeleteCourse = async (id) => {
// //     try {
// //       const response = await courseAPI.deleteCourse(id);
      
// //       if (response && (response.status === 200 || response.status === 204 || response.success)) {
// //         alert("Course deleted successfully!");
        
// //         // Refresh the course list
// //         handleRefresh();
// //       } else {
// //         throw new Error(response?.data?.message || "Failed to delete course");
// //       }
// //     } catch (err) {
// //       console.error("Error deleting course:", err);
// //       alert(err.response?.data?.message || err.message || "Failed to delete course. Please try again.");
// //     } finally {
// //       setShowDeleteConfirm(null);
// //     }
// //   };

// //   // Handle view course details
// //   const handleViewCourse = (courseId) => {
// //     navigate(`/courses/${courseId}`);
// //   };

// //   // Handle edit course
// //   const handleEditCourse = (courseId) => {
// //     navigate(`/courses/${courseId}/edit`);
// //   };

// //   // Handle create new course
// //   const handleCreateCourse = () => {
// //     navigate("/courses/new");
// //   };

// //   // Get status badge
// //   const getStatusBadge = (status) => {
// //     if (!status) return null;
    
// //     switch (status.toLowerCase()) {
// //       case "active":
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1 w-fit">
// //             <CheckCircle size={12} />
// //             Active
// //           </span>
// //         );
// //       case "inactive":
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
// //             Inactive
// //           </span>
// //         );
// //       case "archived":
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
// //             Archived
// //           </span>
// //         );
// //       default:
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
// //             {status}
// //           </span>
// //         );
// //     }
// //   };

// //   // Get program type badge
// //   const getTypeBadge = (type) => {
// //     if (!type) return null;
    
// //     const typeLower = type.toLowerCase();
    
// //     switch (typeLower) {
// //       case 'regular':
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
// //             Regular
// //           </span>
// //         );
// //       case 'extension':
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
// //             Extension
// //           </span>
// //         );
// //       case 'weekend':
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
// //             Weekend
// //           </span>
// //         );
// //       case 'summer':
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
// //             Summer
// //           </span>
// //         );
// //       case 'distance':
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
// //             Distance
// //           </span>
// //         );
// //       default:
// //         return (
// //           <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
// //             {type}
// //           </span>
// //         );
// //     }
// //   };

// //   // Get sort icon
// //   const getSortIcon = (key) => {
// //     if (sortConfig.key !== key) {
// //       return <ChevronDown size={12} className="opacity-30" />;
// //     }
// //     return sortConfig.direction === 'ascending' ? 
// //       <ChevronUp size={12} /> : <ChevronDown size={12} />;
// //   };

// //   // Sort courses locally based on sortConfig
// //   const sortedCourses = useMemo(() => {
// //     if (!sortConfig.key) return courses;

// //     return [...courses].sort((a, b) => {
// //       let aValue = a[sortConfig.key];
// //       let bValue = b[sortConfig.key];

// //       // Handle null/undefined values
// //       if (aValue == null && bValue == null) return 0;
// //       if (aValue == null) return 1;
// //       if (bValue == null) return -1;

// //       // Handle string comparison
// //       if (typeof aValue === 'string' && typeof bValue === 'string') {
// //         aValue = aValue.toLowerCase();
// //         bValue = bValue.toLowerCase();
// //       }

// //       if (aValue < bValue) {
// //         return sortConfig.direction === 'ascending' ? -1 : 1;
// //       }
// //       if (aValue > bValue) {
// //         return sortConfig.direction === 'ascending' ? 1 : -1;
// //       }
// //       return 0;
// //     });
// //   }, [courses, sortConfig]);

// //   // Get course type count for stats
// //   const getTypeCount = (type) => {
// //     return stats.by_type[type] || courses.filter(c => c.program_type === type).length;
// //   };

// //   // Initialize - fetch data on component mount
// //   useEffect(() => {
// //     fetchCourses();
// //     fetchDepartments();
// //   }, []);

// //   // Update stats when courses change
// //   useEffect(() => {
// //     if (courses.length > 0) {
// //       fetchCourseStats();
// //     }
// //   }, [courses, totalCourses]);

// //   // Loading state
// //   if (loading && !isRefreshing) return (
// //     <div className="flex flex-col items-center justify-center min-h-[400px]">
// //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
// //       <p className="text-gray-600">Loading courses...</p>
// //     </div>
// //   );

// //   return (
// //     <div className="p-6 bg-gray-50 min-h-screen">
// //       {/* Header */}
// //       <div className="mb-8">
// //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //           <div>
// //             <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Management</h1>
// //             <p className="text-gray-600">Manage all courses in the system</p>
// //           </div>
// //           <div className="flex items-center gap-3">
// //             <button 
// //               onClick={handleRefresh}
// //               disabled={isRefreshing}
// //               className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
// //               title="Refresh"
// //             >
// //               <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
// //             </button>
// //             <button 
// //               onClick={handleCreateCourse}
// //               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
// //             >
// //               <Plus size={20} />
// //               Add New Course
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Active Filters Display */}
// //       {(searchQuery || departmentFilter !== "all" || statusFilter !== "all" || typeFilter !== "all") && (
// //         <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
// //           <div className="flex items-center justify-between">
// //             <div className="flex items-center gap-2">
// //               <span className="text-blue-800 font-medium">Active Filters:</span>
// //               <div className="flex flex-wrap gap-2">
// //                 {searchQuery && (
// //                   <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
// //                     <Search size={12} />
// //                     Search: "{searchQuery}"
// //                   </span>
// //                 )}
// //                 {departmentFilter !== "all" && (
// //                   <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
// //                     <Building size={12} />
// //                     Department: {departments.find(d => d.id === departmentFilter)?.name}
// //                   </span>
// //                 )}
// //                 {statusFilter !== "all" && (
// //                   <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
// //                     <Tag size={12} />
// //                     Status: {statusFilter}
// //                   </span>
// //                 )}
// //                 {typeFilter !== "all" && (
// //                   <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
// //                     <Hash size={12} />
// //                     Type: {typeFilter}
// //                   </span>
// //                 )}
// //               </div>
// //             </div>
// //             <button 
// //               onClick={handleClearFilters}
// //               className="text-blue-600 hover:text-blue-800 text-sm font-medium"
// //             >
// //               Clear All
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* Stats Cards */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
// //         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-500">Total Courses</p>
// //               <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
// //             </div>
// //             <div className="p-2 bg-blue-50 rounded-lg">
// //               <BookOpen className="text-blue-600" size={24} />
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-500">Active Courses</p>
// //               <p className="text-2xl font-bold text-green-600">{stats.active}</p>
// //             </div>
// //             <div className="p-2 bg-green-50 rounded-lg">
// //               <CheckCircle className="text-green-600" size={24} />
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-500">Inactive Courses</p>
// //               <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
// //             </div>
// //             <div className="p-2 bg-red-50 rounded-lg">
// //               <Clock className="text-red-600" size={24} />
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-500">Regular Courses</p>
// //               <p className="text-2xl font-bold text-purple-600">
// //                 {getTypeCount('regular')}
// //               </p>
// //             </div>
// //             <div className="p-2 bg-purple-50 rounded-lg">
// //               <Users className="text-purple-600" size={24} />
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Additional Stats Row */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
// //         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-500">Extension Courses</p>
// //               <p className="text-2xl font-bold text-yellow-600">{getTypeCount('extension')}</p>
// //             </div>
// //             <div className="p-2 bg-yellow-50 rounded-lg">
// //               <Calendar className="text-yellow-600" size={24} />
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-500">Weekend Courses</p>
// //               <p className="text-2xl font-bold text-indigo-600">{getTypeCount('weekend')}</p>
// //             </div>
// //             <div className="p-2 bg-indigo-50 rounded-lg">
// //               <Calendar className="text-indigo-600" size={24} />
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-sm text-gray-500">Distance Courses</p>
// //               <p className="text-2xl font-bold text-pink-600">{getTypeCount('distance')}</p>
// //             </div>
// //             <div className="p-2 bg-pink-50 rounded-lg">
// //               <ExternalLink className="text-pink-600" size={24} />
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Error Alert */}
// //       {error && (
// //         <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6">
// //           <div className="flex items-start">
// //             <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />
// //             <div className="flex-1">
// //               <strong className="font-bold">Error Loading Courses</strong>
// //               <p className="mt-1">{error.message}</p>
// //               {error.details && <p className="text-sm mt-1">{error.details}</p>}
// //               <div className="mt-3">
// //                 <button 
// //                   onClick={handleRefresh}
// //                   className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 flex items-center gap-2 text-sm"
// //                 >
// //                   <RefreshCw size={16} />
// //                   Try Again
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Controls */}
// //       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
// //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //           <div className="flex flex-col sm:flex-row gap-3 flex-1">
// //             <div className="relative flex-1 max-w-md">
// //               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
// //               <input
// //                 type="text"
// //                 placeholder="Search courses by title, code, or department..."
// //                 value={searchQuery}
// //                 onChange={handleSearchChange}
// //                 onKeyPress={handleKeyPress}
// //                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
// //               />
// //             </div>
            
// //             <div className="flex flex-wrap gap-3">
// //               <select
// //                 value={departmentFilter}
// //                 onChange={(e) => handleFilterChange("department", e.target.value)}
// //                 className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[180px]"
// //               >
// //                 {departments.map(dept => (
// //                   <option key={dept.id} value={dept.id}>{dept.name}</option>
// //                 ))}
// //               </select>
              
// //               <select
// //                 value={statusFilter}
// //                 onChange={(e) => handleFilterChange("status", e.target.value)}
// //                 className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// //               >
// //                 {statusOptions.map(status => (
// //                   <option key={status.value} value={status.value}>{status.label}</option>
// //                 ))}
// //               </select>
              
// //               <select
// //                 value={typeFilter}
// //                 onChange={(e) => handleFilterChange("type", e.target.value)}
// //                 className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// //               >
// //                 {typeOptions.map(type => (
// //                   <option key={type.value} value={type.value}>{type.label}</option>
// //                 ))}
// //               </select>
              
// //               <button 
// //                 onClick={handleSearchSubmit}
// //                 className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
// //               >
// //                 <Search size={18} />
// //                 Search
// //               </button>
// //             </div>
// //           </div>
          
// //           <div className="flex items-center gap-2">
// //             <button 
// //               onClick={handleClearFilters}
// //               className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
// //             >
// //               <Filter size={18} />
// //               Clear Filters
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Courses Table */}
// //       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
// //         <div className="overflow-x-auto">
// //           <table className="min-w-full divide-y divide-gray-200">
// //             <thead className="bg-gray-50">
// //               <tr>
// //                 <th 
// //                   scope="col" 
// //                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
// //                   onClick={() => handleSort('course_code')}
// //                 >
// //                   <div className="flex items-center gap-1">
// //                     Course Code
// //                     {getSortIcon('course_code')}
// //                   </div>
// //                 </th>
// //                 <th 
// //                   scope="col" 
// //                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
// //                   onClick={() => handleSort('course_title')}
// //                 >
// //                   <div className="flex items-center gap-1">
// //                     Course Title
// //                     {getSortIcon('course_title')}
// //                   </div>
// //                 </th>
// //                 <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                   Department
// //                 </th>
// //                 <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                   Credit Hours
// //                 </th>
// //                 <th 
// //                   scope="col" 
// //                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
// //                   onClick={() => handleSort('program_type')}
// //                 >
// //                   <div className="flex items-center gap-1">
// //                     Program Type
// //                     {getSortIcon('program_type')}
// //                   </div>
// //                 </th>
// //                 <th 
// //                   scope="col" 
// //                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
// //                   onClick={() => handleSort('status')}
// //                 >
// //                   <div className="flex items-center gap-1">
// //                     Status
// //                     {getSortIcon('status')}
// //                   </div>
// //                 </th>
// //                 <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                   Actions
// //                 </th>
// //               </tr>
// //             </thead>
// //             <tbody className="bg-white divide-y divide-gray-200">
// //               {sortedCourses.length > 0 ? (
// //                 sortedCourses.map((course) => (
// //                   <tr key={course.course_id || course.id} className="hover:bg-gray-50 transition-colors">
// //                     <td className="px-6 py-4 whitespace-nowrap">
// //                       <span className="font-mono font-semibold text-blue-600">
// //                         {course.course_code || "N/A"}
// //                       </span>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <div>
// //                         <div className="font-medium text-gray-900">
// //                           {course.course_title || "Untitled Course"}
// //                         </div>
// //                         <div className="text-sm text-gray-500 mt-1">
// //                           Sections: {course.section_count || 0}
// //                         </div>
// //                       </div>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <div>
// //                         <div className="font-medium text-gray-900">
// //                           {course.department_name || `Department ${course.department_id}`}
// //                         </div>
// //                         {course.college_name && (
// //                           <div className="text-sm text-gray-500">
// //                             {course.college_name}
// //                           </div>
// //                         )}
// //                       </div>
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap">
// //                       <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
// //                         {course.credit_hours || 0} credits
// //                       </span>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       {getTypeBadge(course.program_type)}
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       {getStatusBadge(course.status)}
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <div className="flex items-center space-x-2">
// //                         <button 
// //                           onClick={() => handleViewCourse(course.course_id || course.id)}
// //                           className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
// //                           title="View Details"
// //                         >
// //                           <Eye size={18} />
// //                         </button>
// //                         <button 
// //                           onClick={() => handleEditCourse(course.course_id || course.id)}
// //                           className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
// //                           title="Edit Course"
// //                         >
// //                           <Edit size={18} />
// //                         </button>
// //                         <button 
// //                           onClick={() => setShowDeleteConfirm(course.course_id || course.id)}
// //                           className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
// //                           title="Delete Course"
// //                         >
// //                           <Trash2 size={18} />
// //                         </button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 ))
// //               ) : (
// //                 <tr>
// //                   <td colSpan="7" className="px-6 py-12 text-center">
// //                     <div className="text-gray-500 text-center">
// //                       <div className="mb-4">
// //                         <Search size={48} className="mx-auto text-gray-300" />
// //                       </div>
// //                       {searchQuery || departmentFilter !== "all" || statusFilter !== "all" || typeFilter !== "all" ? (
// //                         <>
// //                           <p className="text-lg font-medium mb-2">No courses found</p>
// //                           <p className="mb-4">Try adjusting your search or filter criteria</p>
// //                           <button 
// //                             onClick={handleClearFilters}
// //                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //                           >
// //                             Clear all filters
// //                           </button>
// //                         </>
// //                       ) : (
// //                         <>
// //                           <p className="text-lg font-medium mb-2">No courses available</p>
// //                           <p className="mb-4">Get started by creating your first course</p>
// //                           <button 
// //                             onClick={handleCreateCourse}
// //                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
// //                           >
// //                             <Plus size={18} />
// //                             Add New Course
// //                           </button>
// //                         </>
// //                       )}
// //                     </div>
// //                   </td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>

// //         {/* Delete Confirmation Modal */}
// //         {showDeleteConfirm && (
// //           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// //             <div className="bg-white rounded-xl p-6 max-w-md w-full">
// //               <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Course</h3>
// //               <p className="text-gray-600 mb-6">
// //                 Are you sure you want to delete this course? This action cannot be undone.
// //               </p>
// //               <div className="flex justify-end gap-3">
// //                 <button
// //                   onClick={() => setShowDeleteConfirm(null)}
// //                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   onClick={() => handleDeleteCourse(showDeleteConfirm)}
// //                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
// //                 >
// //                   Delete Course
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Pagination Footer */}
// //         {courses.length > 0 && (
// //           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
// //             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
// //               <div className="text-sm text-gray-500 mb-2 sm:mb-0">
// //                 Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
// //                 <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCourses)}</span> of{' '}
// //                 <span className="font-medium">{totalCourses}</span> courses
// //               </div>
// //               <div className="flex items-center space-x-2">
// //                 <button 
// //                   onClick={() => handlePageChange(currentPage - 1)}
// //                   disabled={currentPage === 1}
// //                   className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
// //                 >
// //                   <ChevronLeft size={16} />
// //                   Previous
// //                 </button>
                
// //                 {/* Page numbers */}
// //                 {(() => {
// //                   const pages = [];
// //                   const maxVisiblePages = 5;
// //                   let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
// //                   let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
// //                   if (endPage - startPage + 1 < maxVisiblePages) {
// //                     startPage = Math.max(1, endPage - maxVisiblePages + 1);
// //                   }
                  
// //                   for (let i = startPage; i <= endPage; i++) {
// //                     pages.push(
// //                       <button
// //                         key={i}
// //                         onClick={() => handlePageChange(i)}
// //                         className={`px-3 py-1.5 border rounded text-sm min-w-[40px] transition-colors ${
// //                           currentPage === i
// //                             ? 'bg-blue-50 text-blue-600 border-blue-200'
// //                             : 'border-gray-300 hover:bg-gray-50'
// //                         }`}
// //                       >
// //                         {i}
// //                       </button>
// //                     );
// //                   }
                  
// //                   return pages;
// //                 })()}
                
// //                 <button 
// //                   onClick={() => handlePageChange(currentPage + 1)}
// //                   disabled={currentPage === totalPages}
// //                   className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
// //                 >
// //                   Next
// //                   <ChevronRight size={16} />
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // export default CoursesPage;

// // // src/pages/Courses/Courses.jsx
// // import React, { useState, useEffect, useCallback, useMemo } from "react";
// // import {
// //   Search,
// //   Plus,
// //   Edit,
// //   Trash2,
// //   Eye,
// //   Filter,
// //   ChevronLeft,
// //   ChevronRight,
// //   RefreshCw,
// //   Download,
// //   FileText,
// //   Calendar,
// //   BookOpen,
// //   Users,
// //   Clock,
// //   AlertCircle,
// //   MoreVertical,
// //   ChevronDown,
// //   ChevronUp,
// //   CheckCircle,
// //   XCircle,
// //   Archive,
// //   Loader2,
// //   X,
// //   Database,
// //   BarChart3
// // } from "lucide-react";
// // import { courseAPI, courseUtils } from "../../api";

// // function CoursesPage() {
// //   // State Management
// //   const [courses, setCourses] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [totalCourses, setTotalCourses] = useState(0);
// //   const [selectedCourses, setSelectedCourses] = useState([]);
// //   const [isRefreshing, setIsRefreshing] = useState(false);
// //   const [isExporting, setIsExporting] = useState(false);
// //   const [stats, setStats] = useState({
// //     total: 0,
// //     active: 0,
// //     inactive: 0,
// //     archived: 0,
// //     totalSections: 0
// //   });

// //   // Filters State
// //   const [filters, setFilters] = useState({
// //     search: "",
// //     department: "all",
// //     program: "all",
// //     status: "all",
// //     type: "all",
// //     year: "all",
// //     semester: "all",
// //     creditHours: "all"
// //   });

// //   // Sorting State
// //   const [sortConfig, setSortConfig] = useState({
// //     key: "course_code",
// //     direction: "asc"
// //   });

// //   // Dropdowns State
// //   const [departments, setDepartments] = useState([
// //     { id: "all", name: "All Departments" },
// //     { id: "1", name: "Computer Science" },
// //     { id: "2", name: "Mathematics" },
// //     { id: "3", name: "Engineering" },
// //     { id: "4", name: "Business" }
// //   ]);

// //   const [programs, setPrograms] = useState([
// //     { id: "all", name: "All Programs" },
// //     { id: "1", name: "B.Sc. Computer Science" },
// //     { id: "2", name: "B.Sc. Mathematics" },
// //     { id: "3", name: "B.Eng. Electrical" },
// //     { id: "4", name: "MBA" }
// //   ]);

// //   // Constants
// //   const ITEMS_PER_PAGE = 10;

// //   // Filter options
// //   const statusOptions = [
// //     { value: "all", label: "All Status" },
// //     { value: "active", label: "Active" },
// //     { value: "inactive", label: "Inactive" },
// //     { value: "archived", label: "Archived" }
// //   ];

// //   const typeOptions = [
// //     { value: "all", label: "All Types" },
// //     { value: "regular", label: "Regular" },
// //     { value: "service", label: "Service" },
// //     { value: "elective", label: "Elective" },
// //     { value: "core", label: "Core" }
// //   ];

// //   const yearOptions = [
// //     { value: "all", label: "All Years" },
// //     { value: "1", label: "Year 1" },
// //     { value: "2", label: "Year 2" },
// //     { value: "3", label: "Year 3" },
// //     { value: "4", label: "Year 4" }
// //   ];

// //   const semesterOptions = [
// //     { value: "all", label: "All Semesters" },
// //     { value: "1", label: "Semester 1" },
// //     { value: "2", label: "Semester 2" },
// //     { value: "3", label: "Semester 3" },
// //     { value: "4", label: "Semester 4" }
// //   ];

// //   const creditOptions = [
// //     { value: "all", label: "All Credits" },
// //     { value: "1-2", label: "1-2 Credits" },
// //     { value: "3-4", label: "3-4 Credits" },
// //     { value: "5+", label: "5+ Credits" }
// //   ];

// //   // Format hours display
// //   const formatHours = (course) => {
// //     if (!course) return "0 - 0 - 0 (0)";
// //     const lecture = course.lecture_hours || 0;
// //     const lab = course.lab_hours || 0;
// //     const tutorial = course.tutorial_hours || 0;
// //     const credits = course.credit_hours || 0;
// //     return `${lecture}L - ${lab}Lb - ${tutorial}T (${credits} Cr)`;
// //   };

// //   // Calculate total hours
// //   const calculateTotalHours = (course) => {
// //     if (!course) return 0;
// //     return (course.lecture_hours || 0) + (course.lab_hours || 0) + (course.tutorial_hours || 0);
// //   };

// //   // Get status badge
// //   const getStatusBadge = (status) => {
// //     switch (status) {
// //       case 'active':
// //         return (
// //           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
// //             <span className="mr-1">●</span>
// //             Active
// //           </span>
// //         );
// //       case 'inactive':
// //         return (
// //           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
// //             <span className="mr-1">●</span>
// //             Inactive
// //           </span>
// //         );
// //       case 'archived':
// //         return (
// //           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
// //             <span className="mr-1">●</span>
// //             Archived
// //           </span>
// //         );
// //       default:
// //         return (
// //           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
// //             <span className="mr-1">●</span>
// //             {status || 'Unknown'}
// //           </span>
// //         );
// //     }
// //   };

// //   // Get type badge
// //   const getTypeBadge = (type) => {
// //     switch (type) {
// //       case 'regular':
// //         return (
// //           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
// //             Regular
// //           </span>
// //         );
// //       case 'service':
// //         return (
// //           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
// //             Service
// //           </span>
// //         );
// //       case 'elective':
// //         return (
// //           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
// //             Elective
// //           </span>
// //         );
// //       case 'core':
// //         return (
// //           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
// //             Core
// //           </span>
// //         );
// //       default:
// //         return (
// //           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
// //             {type || 'N/A'}
// //           </span>
// //         );
// //     }
// //   };

// //   // Fetch courses
// //   const fetchCourses = useCallback(async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);

// //       // Build API params from filters
// //       const params = {
// //         page: currentPage,
// //         limit: ITEMS_PER_PAGE,
// //         sort_by: sortConfig.key,
// //         sort_order: sortConfig.direction,
// //         ...(filters.search && { search: filters.search }),
// //         ...(filters.department !== "all" && { department_id: filters.department }),
// //         ...(filters.program !== "all" && { program_id: filters.program }),
// //         ...(filters.status !== "all" && { status: filters.status }),
// //         ...(filters.type !== "all" && { program_type: filters.type }),
// //         ...(filters.year !== "all" && { course_year: filters.year }),
// //         ...(filters.semester !== "all" && { course_semester: filters.semester })
// //       };

// //       console.log("Fetching courses with params:", params);
      
// //       // Fetch courses using the API
// //       const response = await courseAPI.getAllCourses(params);
      
// //       // Handle response data
// //       let coursesData = [];
// //       let total = 0;
      
// //       if (response.data) {
// //         const data = response.data;
        
// //         if (Array.isArray(data)) {
// //           coursesData = data;
// //           total = data.length;
// //         } else if (data.courses) {
// //           coursesData = data.courses;
// //           total = data.total || data.courses.length;
// //         } else if (data.items) {
// //           coursesData = data.items;
// //           total = data.total || data.items.length;
// //         } else {
// //           coursesData = [];
// //           total = 0;
// //         }
// //       }

// //       // Fetch statistics
// //       try {
// //         const statsResponse = await courseAPI.getCourseStats();
// //         if (statsResponse.data) {
// //           setStats({
// //             total: statsResponse.data.total_courses || total,
// //             active: statsResponse.data.active_courses || 0,
// //             inactive: statsResponse.data.inactive_courses || 0,
// //             archived: statsResponse.data.archived_courses || 0,
// //             totalSections: statsResponse.data.total_sections || 0
// //           });
// //         }
// //       } catch (statsErr) {
// //         console.log("Stats API not available, calculating locally");
// //         // Calculate stats locally
// //         setStats({
// //           total: total,
// //           active: coursesData.filter(c => c.status === "active").length,
// //           inactive: coursesData.filter(c => c.status === "inactive").length,
// //           archived: coursesData.filter(c => c.status === "archived").length,
// //           totalSections: coursesData.reduce((sum, course) => sum + (course.total_sections || 0), 0)
// //         });
// //       }

// //       setCourses(coursesData);
// //       setTotalCourses(total);
// //       setTotalPages(Math.ceil(total / ITEMS_PER_PAGE) || 1);
      
// //     } catch (err) {
// //       console.error("Error fetching courses:", err);
// //       setError({
// //         message: err.response?.data?.message || err.message || "Failed to fetch courses",
// //         details: "Please check your connection and try again",
// //         status: err.response?.status
// //       });
// //       setCourses([]);
// //       setTotalCourses(0);
// //       setTotalPages(1);
      
// //       // Set default stats on error
// //       setStats({
// //         total: 0,
// //         active: 0,
// //         inactive: 0,
// //         archived: 0,
// //         totalSections: 0
// //       });
// //     } finally {
// //       setLoading(false);
// //       setIsRefreshing(false);
// //     }
// //   }, [currentPage, filters, sortConfig]);

// //   // Search handler
// //   const handleSearch = (searchTerm) => {
// //     setFilters(prev => ({ ...prev, search: searchTerm }));
// //     setCurrentPage(1);
// //   };

// //   // Filter change handler
// //   const handleFilterChange = (filterType, value) => {
// //     setFilters(prev => ({ ...prev, [filterType]: value }));
// //     setCurrentPage(1);
// //   };

// //   // Sort handler
// //   const handleSort = (key) => {
// //     setSortConfig(prev => ({
// //       key,
// //       direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
// //     }));
// //   };

// //   // Get sort icon
// //   const getSortIcon = (key) => {
// //     if (sortConfig.key !== key) {
// //       return <ChevronDown size={12} className="opacity-30" />;
// //     }
// //     return sortConfig.direction === "asc" ? 
// //       <ChevronUp size={12} /> : <ChevronDown size={12} />;
// //   };

// //   // Page change handler
// //   const handlePageChange = (page) => {
// //     if (page < 1 || page > totalPages) return;
// //     setCurrentPage(page);
// //   };

// //   // Refresh handler
// //   const handleRefresh = () => {
// //     setIsRefreshing(true);
// //     fetchCourses();
// //   };

// //   // Course selection handlers
// //   const handleSelectCourse = (courseId) => {
// //     setSelectedCourses(prev =>
// //       prev.includes(courseId)
// //         ? prev.filter(id => id !== courseId)
// //         : [...prev, courseId]
// //     );
// //   };

// //   const handleSelectAll = () => {
// //     const courseIds = courses.map(course => course.id).filter(id => id);
// //     if (selectedCourses.length === courseIds.length) {
// //       setSelectedCourses([]);
// //     } else {
// //       setSelectedCourses(courseIds);
// //     }
// //   };

// //   // Course action handlers
// //   const handleDeleteCourse = async (courseId) => {
// //     if (!window.confirm("Are you sure you want to delete this course?")) return;
    
// //     try {
// //       await courseAPI.deleteCourse(courseId);
// //       fetchCourses();
// //       // Show success message
// //       alert("Course deleted successfully!");
// //     } catch (err) {
// //       alert(err.response?.data?.message || "Failed to delete course");
// //     }
// //   };

// //   const handleBulkDelete = async () => {
// //     if (selectedCourses.length === 0) return;
    
// //     if (!window.confirm(`Delete ${selectedCourses.length} selected courses?`)) return;
    
// //     try {
// //       const deletePromises = selectedCourses.map(id => courseAPI.deleteCourse(id));
// //       await Promise.all(deletePromises);
// //       setSelectedCourses([]);
// //       fetchCourses();
// //       alert(`${selectedCourses.length} courses deleted successfully!`);
// //     } catch (err) {
// //       alert("Some courses could not be deleted. Please try again.");
// //     }
// //   };

// //   const handleViewCourse = (courseId) => {
// //     window.open(`/courses/${courseId}`, '_blank');
// //   };

// //   const handleEditCourse = (courseId) => {
// //     window.open(`/courses/${courseId}/edit`, '_blank');
// //   };

// //   const handleCreateCourse = () => {
// //     window.open('/courses/new', '_blank');
// //   };

// //   const handleExportCourses = () => {
// //     setIsExporting(true);
// //     // Simulate export process
// //     setTimeout(() => {
// //       const dataStr = JSON.stringify(courses, null, 2);
// //       const dataBlob = new Blob([dataStr], { type: 'application/json' });
// //       const url = URL.createObjectURL(dataBlob);
// //       const link = document.createElement('a');
// //       link.href = url;
// //       link.download = `courses_export_${new Date().toISOString().split('T')[0]}.json`;
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //       setIsExporting(false);
// //       alert("Courses exported successfully!");
// //     }, 1000);
// //   };

// //   // Clear all filters
// //   const handleClearFilters = () => {
// //     setFilters({
// //       search: "",
// //       department: "all",
// //       program: "all",
// //       status: "all",
// //       type: "all",
// //       year: "all",
// //       semester: "all",
// //       creditHours: "all"
// //     });
// //     setCurrentPage(1);
// //   };

// //   // Check if any filters are active
// //   const hasActiveFilters = () => {
// //     const { search, ...otherFilters } = filters;
// //     return search || Object.values(otherFilters).some(f => f !== "all");
// //   };

// //   // Generate pagination buttons
// //   const renderPageNumbers = () => {
// //     const pages = [];
// //     const maxVisiblePages = 5;
    
// //     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
// //     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
// //     if (endPage - startPage + 1 < maxVisiblePages) {
// //       startPage = Math.max(1, endPage - maxVisiblePages + 1);
// //     }
    
// //     for (let i = startPage; i <= endPage; i++) {
// //       pages.push(
// //         <button
// //           key={i}
// //           onClick={() => handlePageChange(i)}
// //           className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
// //             currentPage === i
// //               ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
// //               : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
// //           } border`}
// //         >
// //           {i}
// //         </button>
// //       );
// //     }
    
// //     return pages;
// //   };

// //   // Initialize
// //   useEffect(() => {
// //     fetchCourses();
// //   }, [fetchCourses]);

// //   // Loading state
// //   if (loading && !isRefreshing) {
// //     return (
// //       <div className="flex flex-col items-center justify-center min-h-[400px]">
// //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
// //         <p className="text-gray-600">Loading courses...</p>
// //       </div>
// //     );
// //   }

// //   // Statistics cards
// //   const statCards = [
// //     {
// //       title: "Total Courses",
// //       value: stats.total,
// //       icon: BookOpen,
// //       color: "bg-blue-50 text-blue-600",
// //       iconColor: "text-blue-600"
// //     },
// //     {
// //       title: "Active",
// //       value: stats.active,
// //       icon: CheckCircle,
// //       color: "bg-green-50 text-green-600",
// //       iconColor: "text-green-600"
// //     },
// //     {
// //       title: "Inactive",
// //       value: stats.inactive,
// //       icon: XCircle,
// //       color: "bg-red-50 text-red-600",
// //       iconColor: "text-red-600"
// //     },
// //     {
// //       title: "Archived",
// //       value: stats.archived,
// //       icon: Archive,
// //       color: "bg-gray-50 text-gray-600",
// //       iconColor: "text-gray-600"
// //     },
// //     {
// //       title: "Total Sections",
// //       value: stats.totalSections,
// //       icon: Users,
// //       color: "bg-purple-50 text-purple-600",
// //       iconColor: "text-purple-600"
// //     }
// //   ];

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Header Section */}
// //       <div className="border-b border-gray-200 bg-white px-6 py-4">
// //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //           <div>
// //             <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
// //             <p className="text-gray-600 mt-1">
// //               Manage and organize your academic courses efficiently
// //             </p>
// //           </div>
          
// //           <div className="flex items-center gap-3">
// //             <button
// //               onClick={handleRefresh}
// //               disabled={isRefreshing}
// //               className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
// //             >
// //               <RefreshCw size={16} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
// //               Refresh
// //             </button>
            
// //             <button
// //               onClick={handleExportCourses}
// //               disabled={isExporting || courses.length === 0}
// //               className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
// //             >
// //               {isExporting ? (
// //                 <Loader2 size={16} className="mr-2 animate-spin" />
// //               ) : (
// //                 <Download size={16} className="mr-2" />
// //               )}
// //               Export
// //             </button>
            
// //             <button
// //               onClick={handleCreateCourse}
// //               className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
// //             >
// //               <Plus size={16} className="mr-2" />
// //               New Course
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="px-6 py-6">
// //         {/* Error Alert */}
// //         {error && (
// //           <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
// //             <div className="flex">
// //               <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
// //               <div className="ml-3">
// //                 <h3 className="text-sm font-medium text-red-800">Error Loading Courses</h3>
// //                 <div className="mt-2 text-sm text-red-700">
// //                   <p>{error.message}</p>
// //                   <p className="mt-1">{error.details}</p>
// //                 </div>
// //                 <div className="mt-3">
// //                   <button
// //                     onClick={handleRefresh}
// //                     className="text-sm font-medium text-red-800 hover:text-red-900"
// //                   >
// //                     Try again →
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Statistics Cards */}
// //         <div className="mb-6">
// //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
// //             {statCards.map((stat, index) => (
// //               <div
// //                 key={index}
// //                 className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
// //               >
// //                 <div className="flex items-center">
// //                   <div className={`p-2 rounded-lg ${stat.color}`}>
// //                     <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
// //                   </div>
// //                   <div className="ml-4">
// //                     <p className="text-sm font-medium text-gray-600">{stat.title}</p>
// //                     <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Filters Section */}
// //         <div className="mb-6 space-y-4">
// //           {/* Search Bar */}
// //           <div className="relative">
// //             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //               <Search className="h-5 w-5 text-gray-400" />
// //             </div>
// //             <input
// //               type="text"
// //               value={filters.search}
// //               onChange={(e) => handleSearch(e.target.value)}
// //               placeholder="Search courses by code, title, or description..."
// //               className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
// //             />
// //           </div>

// //           {/* Advanced Filters */}
// //           <div className="bg-gray-50 rounded-lg p-4">
// //             <div className="flex items-center justify-between mb-3">
// //               <div className="flex items-center">
// //                 <Filter className="h-5 w-5 text-gray-500 mr-2" />
// //                 <span className="text-sm font-medium text-gray-700">Advanced Filters</span>
// //               </div>
// //               {hasActiveFilters() && (
// //                 <button
// //                   onClick={handleClearFilters}
// //                   className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
// //                 >
// //                   <X className="h-4 w-4 mr-1" />
// //                   Clear all
// //                 </button>
// //               )}
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //               {/* Status Filter */}
// //               <div>
// //                 <label className="block text-xs font-medium text-gray-700 mb-1">
// //                   Status
// //                 </label>
// //                 <select
// //                   value={filters.status}
// //                   onChange={(e) => handleFilterChange("status", e.target.value)}
// //                   className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
// //                 >
// //                   {statusOptions.map((option) => (
// //                     <option key={option.value} value={option.value}>
// //                       {option.label}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               {/* Type Filter */}
// //               <div>
// //                 <label className="block text-xs font-medium text-gray-700 mb-1">
// //                   Course Type
// //                 </label>
// //                 <select
// //                   value={filters.type}
// //                   onChange={(e) => handleFilterChange("type", e.target.value)}
// //                   className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
// //                 >
// //                   {typeOptions.map((option) => (
// //                     <option key={option.value} value={option.value}>
// //                       {option.label}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               {/* Department Filter */}
// //               <div>
// //                 <label className="block text-xs font-medium text-gray-700 mb-1">
// //                   Department
// //                 </label>
// //                 <select
// //                   value={filters.department}
// //                   onChange={(e) => handleFilterChange("department", e.target.value)}
// //                   className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
// //                 >
// //                   {departments.map((dept) => (
// //                     <option key={dept.id} value={dept.id}>
// //                       {dept.name}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               {/* Program Filter */}
// //               <div>
// //                 <label className="block text-xs font-medium text-gray-700 mb-1">
// //                   Program
// //                 </label>
// //                 <select
// //                   value={filters.program}
// //                   onChange={(e) => handleFilterChange("program", e.target.value)}
// //                   className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
// //                 >
// //                   {programs.map((program) => (
// //                     <option key={program.id} value={program.id}>
// //                       {program.name}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Bulk Actions Bar */}
// //         {selectedCourses.length > 0 && (
// //           <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
// //             <div className="flex items-center justify-between">
// //               <div className="flex items-center space-x-4">
// //                 <span className="text-blue-800 font-medium">
// //                   {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
// //                 </span>
// //                 <button
// //                   onClick={handleBulkDelete}
// //                   className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
// //                 >
// //                   <Trash2 size={16} className="mr-2" />
// //                   Delete Selected
// //                 </button>
// //                 <button
// //                   onClick={() => setSelectedCourses([])}
// //                   className="text-sm text-blue-600 hover:text-blue-800 font-medium"
// //                 >
// //                   Clear selection
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Courses Table */}
// //         <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
// //           <div className="overflow-x-auto">
// //             <table className="min-w-full divide-y divide-gray-200">
// //               <thead className="bg-gray-50">
// //                 <tr>
// //                   <th scope="col" className="relative w-12 px-6 py-3">
// //                     <input
// //                       type="checkbox"
// //                       className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
// //                       checked={courses.length > 0 && selectedCourses.length === courses.length}
// //                       onChange={handleSelectAll}
// //                     />
// //                   </th>
// //                   <th scope="col" className="px-6 py-3 text-left">
// //                     <button
// //                       onClick={() => handleSort('course_code')}
// //                       className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 focus:outline-none"
// //                     >
// //                       <span>Code</span>
// //                       {getSortIcon('course_code')}
// //                     </button>
// //                   </th>
// //                   <th scope="col" className="px-6 py-3 text-left">
// //                     <button
// //                       onClick={() => handleSort('course_title')}
// //                       className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 focus:outline-none"
// //                     >
// //                       <span>Course Title</span>
// //                       {getSortIcon('course_title')}
// //                     </button>
// //                   </th>
// //                   <th scope="col" className="px-6 py-3 text-left">
// //                     <button
// //                       onClick={() => handleSort('department_name')}
// //                       className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 focus:outline-none"
// //                     >
// //                       <span>Department</span>
// //                       {getSortIcon('department_name')}
// //                     </button>
// //                   </th>
// //                   <th scope="col" className="px-6 py-3 text-left">
// //                     <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</span>
// //                   </th>
// //                   <th scope="col" className="px-6 py-3 text-left">
// //                     <button
// //                       onClick={() => handleSort('program_type')}
// //                       className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 focus:outline-none"
// //                     >
// //                       <span>Type</span>
// //                       {getSortIcon('program_type')}
// //                     </button>
// //                   </th>
// //                   <th scope="col" className="px-6 py-3 text-left">
// //                     <button
// //                       onClick={() => handleSort('status')}
// //                       className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 focus:outline-none"
// //                     >
// //                       <span>Status</span>
// //                       {getSortIcon('status')}
// //                     </button>
// //                   </th>
// //                   <th scope="col" className="relative px-6 py-3">
// //                     <span className="sr-only">Actions</span>
// //                   </th>
// //                 </tr>
// //               </thead>
// //               <tbody className="bg-white divide-y divide-gray-200">
// //                 {courses.length > 0 ? (
// //                   courses.map((course) => (
// //                     <tr key={course.id} className="hover:bg-gray-50">
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <input
// //                           type="checkbox"
// //                           className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
// //                           checked={selectedCourses.includes(course.id)}
// //                           onChange={() => handleSelectCourse(course.id)}
// //                         />
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="font-mono font-semibold text-gray-900">
// //                           {course.course_code}
// //                         </div>
// //                         <div className="text-sm text-gray-500">
// //                           {course.credit_hours || 0} Credits
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4">
// //                         <div className="font-medium text-gray-900">
// //                           {course.course_title}
// //                         </div>
// //                         {course.program_name && (
// //                           <div className="text-sm text-gray-500">
// //                             {course.program_name}
// //                           </div>
// //                         )}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="text-sm text-gray-900">
// //                           {course.department_name || `Dept ${course.department_id}`}
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="text-sm text-gray-900">
// //                           {formatHours(course)}
// //                         </div>
// //                         <div className="text-xs text-gray-500">
// //                           Total: {calculateTotalHours(course)}h
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         {getTypeBadge(course.program_type)}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         {getStatusBadge(course.status)}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
// //                         <div className="flex items-center justify-end space-x-2">
// //                           <button
// //                             onClick={() => handleViewCourse(course.id)}
// //                             className="text-gray-400 hover:text-blue-600"
// //                             title="View"
// //                           >
// //                             <Eye className="h-4 w-4" />
// //                           </button>
// //                           <button
// //                             onClick={() => handleEditCourse(course.id)}
// //                             className="text-gray-400 hover:text-green-600"
// //                             title="Edit"
// //                           >
// //                             <Edit className="h-4 w-4" />
// //                           </button>
// //                           <button
// //                             onClick={() => handleDeleteCourse(course.id)}
// //                             className="text-gray-400 hover:text-red-600"
// //                             title="Delete"
// //                           >
// //                             <Trash2 className="h-4 w-4" />
// //                           </button>
// //                           <button className="text-gray-400 hover:text-gray-600">
// //                             <MoreVertical className="h-4 w-4" />
// //                           </button>
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   ))
// //                 ) : (
// //                   <tr>
// //                     <td colSpan="8" className="px-6 py-12 text-center">
// //                       <div className="text-gray-500 text-center">
// //                         <div className="mb-4">
// //                           <Search size={48} className="mx-auto text-gray-300" />
// //                         </div>
// //                         {hasActiveFilters() ? (
// //                           <>
// //                             <p className="text-lg font-medium mb-2">No courses found</p>
// //                             <p className="mb-4">Try adjusting your search or filters to find what you're looking for.</p>
// //                             <button
// //                               onClick={handleClearFilters}
// //                               className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
// //                             >
// //                               Clear all filters
// //                             </button>
// //                           </>
// //                         ) : (
// //                           <>
// //                             <p className="text-lg font-medium mb-2">No courses available</p>
// //                             <p className="mb-4">Get started by creating your first course.</p>
// //                             <button
// //                               onClick={handleCreateCourse}
// //                               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
// //                             >
// //                               Create Course
// //                             </button>
// //                           </>
// //                         )}
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>

// //           {/* Pagination */}
// //           {courses.length > 0 && (
// //             <div className="border-t border-gray-200 px-6 py-4">
// //               <div className="flex items-center justify-between">
// //                 <div className="flex-1 flex justify-between sm:hidden">
// //                   <button
// //                     onClick={() => handlePageChange(currentPage - 1)}
// //                     disabled={currentPage === 1}
// //                     className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
// //                   >
// //                     Previous
// //                   </button>
// //                   <button
// //                     onClick={() => handlePageChange(currentPage + 1)}
// //                     disabled={currentPage === totalPages}
// //                     className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
// //                   >
// //                     Next
// //                   </button>
// //                 </div>
                
// //                 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
// //                   <div>
// //                     <p className="text-sm text-gray-700">
// //                       Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
// //                       <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCourses)}</span> of{' '}
// //                       <span className="font-medium">{totalCourses}</span> results
// //                     </p>
// //                   </div>
                  
// //                   <div>
// //                     <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
// //                       <button
// //                         onClick={() => handlePageChange(currentPage - 1)}
// //                         disabled={currentPage === 1}
// //                         className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
// //                       >
// //                         <span className="sr-only">Previous</span>
// //                         <ChevronLeft className="h-5 w-5" />
// //                       </button>
                      
// //                       {renderPageNumbers()}
                      
// //                       <button
// //                         onClick={() => handlePageChange(currentPage + 1)}
// //                         disabled={currentPage === totalPages}
// //                         className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
// //                       >
// //                         <span className="sr-only">Next</span>
// //                         <ChevronRight className="h-5 w-5" />
// //                       </button>
// //                     </nav>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default CoursesPage;


// // src/pages/Courses/Courses.jsx
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   Search,
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   Filter,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
//   Download,
//   FileText,
//   Calendar,
//   BookOpen,
//   Users,
//   Clock,
//   AlertCircle,
//   MoreVertical,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle,
//   XCircle,
//   Archive,
//   Loader2,
//   X,
//   Database,
//   BarChart3,
//   Building
// } from "lucide-react";
// import { courseAPI, courseUtils } from "../../api";
// import { useNavigate } from "react-router-dom";

// function CoursesPage() {
//   const navigate = useNavigate();
  
//   // State Management
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalCourses, setTotalCourses] = useState(0);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isExporting, setIsExporting] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     inactive: 0,
//     archived: 0,
//     totalSections: 0,
//     byType: {}
//   });

//   // Filters State - Using exact matching
//   const [filters, setFilters] = useState({
//     search: "",
//     department: "",
//     program: "",
//     status: "",
//     type: "",
//     year: "",
//     semester: "",
//     creditHours: ""
//   });

//   // Sorting State
//   const [sortConfig, setSortConfig] = useState({
//     key: "course_code",
//     direction: "asc"
//   });

//   // Constants
//   const ITEMS_PER_PAGE = 10;

//   // Filter options - Simplified for exact matching
//   const statusOptions = [
//     { value: "", label: "All Status" },
//     { value: "active", label: "Active" },
//     { value: "inactive", label: "Inactive" },
//     { value: "archived", label: "Archived" }
//   ];

//   const typeOptions = [
//     { value: "", label: "All Types" },
//     { value: "regular", label: "Regular" },
//     { value: "extension", label: "Extension" },
//     { value: "weekend", label: "Weekend" },
//     { value: "summer", label: "Summer" },
//     { value: "distance", label: "Distance" }
//   ];

//   // Format hours display
//   const formatHours = (course) => {
//     if (!course) return "0 - 0 - 0 (0)";
//     const lecture = course.lecture_hours || 0;
//     const lab = course.lab_hours || 0;
//     const tutorial = course.tutorial_hours || 0;
//     const credits = course.credit_hours || 0;
//     return `${lecture}L - ${lab}Lb - ${tutorial}T (${credits} Cr)`;
//   };

//   // Get status badge
//   const getStatusBadge = (status) => {
//     if (!status) return null;
    
//     switch (status.toLowerCase()) {
//       case 'active':
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1 w-fit">
//             <CheckCircle size={12} />
//             Active
//           </span>
//         );
//       case 'inactive':
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
//             Inactive
//           </span>
//         );
//       case 'archived':
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
//             Archived
//           </span>
//         );
//       default:
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
//             {status}
//           </span>
//         );
//     }
//   };

//   // Get program type badge
//   const getTypeBadge = (type) => {
//     if (!type) return null;
    
//     const typeLower = type.toLowerCase();
    
//     switch (typeLower) {
//       case 'regular':
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
//             Regular
//           </span>
//         );
//       case 'extension':
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
//             Extension
//           </span>
//         );
//       case 'weekend':
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
//             Weekend
//           </span>
//         );
//       case 'summer':
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
//             Summer
//           </span>
//         );
//       case 'distance':
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
//             Distance
//           </span>
//         );
//       default:
//         return (
//           <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
//             {type}
//           </span>
//         );
//     }
//   };

//   // Fetch courses with exact filtering
//   const fetchCourses = useCallback(async (page = 1, filterParams = {}) => {
//     try {
//       setLoading(true);
//       setError(null);
//       setIsRefreshing(true);

//       // Build params object matching backend CourseController.getAllCourses
//       const params = {
//         page: page,
//         limit: ITEMS_PER_PAGE,
//         sort_by: sortConfig.key,
//         sort_order: sortConfig.direction,
//         ...(filterParams.search && { search: filterParams.search }),
//         ...(filterParams.department && { department_id: filterParams.department }),
//         ...(filterParams.status && { status: filterParams.status }),
//         ...(filterParams.type && { program_type: filterParams.type })
//       };

//       console.log("Fetching courses with exact params:", params);
      
//       // Use the courseAPI directly
//       const response = await courseAPI.getAllCourses(params);
//       console.log("Courses API response:", response);
      
//       if (response && response.data) {
//         const data = response.data;
        
//         // Handle different response structures from backend
//         let coursesData = [];
//         let total = 0;
//         let pagination = {};
        
//         if (data.courses && Array.isArray(data.courses)) {
//           // Structure: { courses: [], pagination: { page, limit, total, pages } }
//           coursesData = data.courses;
//           total = data.pagination?.total || data.total || 0;
//           pagination = data.pagination || { page: page, total: total, pages: Math.ceil(total / ITEMS_PER_PAGE) };
//         } else if (Array.isArray(data)) {
//           // Structure: [] (direct array)
//           coursesData = data;
//           total = data.length;
//           pagination = { page: 1, total: data.length, pages: 1 };
//         } else if (data.items && Array.isArray(data.items)) {
//           // Structure: { items: [], total: X }
//           coursesData = data.items;
//           total = data.total || 0;
//           pagination = { page: page, total: total, pages: Math.ceil(total / ITEMS_PER_PAGE) };
//         } else {
//           // Default: assume data is the courses array
//           coursesData = Array.isArray(data) ? data : [];
//           total = coursesData.length;
//           pagination = { page: 1, total: total, pages: 1 };
//         }

//         console.log(`Loaded ${coursesData.length} courses, total: ${total}`);
        
//         setCourses(coursesData);
//         setTotalCourses(total);
//         setTotalPages(pagination.pages || Math.ceil(total / ITEMS_PER_PAGE) || 1);
        
//         // Calculate statistics
//         const activeCount = coursesData.filter(c => c.status === 'active').length;
//         const inactiveCount = coursesData.filter(c => c.status === 'inactive').length;
//         const archivedCount = coursesData.filter(c => c.status === 'archived').length;
        
//         const byType = {};
//         coursesData.forEach(course => {
//           if (course.program_type) {
//             byType[course.program_type] = (byType[course.program_type] || 0) + 1;
//           }
//         });
        
//         setStats({
//           total: total,
//           active: activeCount,
//           inactive: inactiveCount,
//           archived: archivedCount,
//           byType: byType,
//           totalSections: coursesData.reduce((sum, c) => sum + (c.section_count || 0), 0)
//         });
        
//       } else {
//         throw new Error("Invalid response format from server");
//       }
      
//     } catch (err) {
//       console.error("Error fetching courses:", err);
      
//       // Provide detailed error information
//       let errorMessage = "Failed to load courses";
//       let errorDetails = "";
      
//       if (err.response) {
//         // Backend responded with error status
//         errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
//         errorDetails = err.response.data?.error || "";
//       } else if (err.request) {
//         // Request made but no response
//         errorMessage = "Network error - unable to reach server";
//         errorDetails = "Please check your internet connection and try again";
//       } else {
//         // Other errors
//         errorMessage = err.message || "Unknown error occurred";
//       }
      
//       setError({
//         message: errorMessage,
//         details: errorDetails,
//         status: err.response?.status
//       });
      
//       // Set empty state
//       setCourses([]);
//       setTotalCourses(0);
//       setTotalPages(1);
//       setStats({
//         total: 0,
//         active: 0,
//         inactive: 0,
//         archived: 0,
//         byType: {},
//         totalSections: 0
//       });
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [ITEMS_PER_PAGE, sortConfig]);

//   // Handle search input change
//   const handleSearchChange = (e) => {
//     setFilters(prev => ({ ...prev, search: e.target.value }));
//   };

//   // Handle search submission
//   const handleSearchSubmit = useCallback(() => {
//     setCurrentPage(1);
//     fetchCourses(1, filters);
//   }, [filters, fetchCourses]);

//   // Handle search on Enter key
//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSearchSubmit();
//     }
//   };

//   // Handle exact filter changes
//   const handleFilterChange = useCallback((filterType, value) => {
//     console.log(`Filter changed: ${filterType} = ${value}`);
    
//     setFilters(prev => ({ ...prev, [filterType]: value }));
//     setCurrentPage(1);
    
//     fetchCourses(1, { ...filters, [filterType]: value });
//   }, [filters, fetchCourses]);

//   // Clear all filters
//   const handleClearFilters = useCallback(() => {
//     console.log("Clearing all filters");
//     setFilters({
//       search: "",
//       department: "",
//       program: "",
//       status: "",
//       type: "",
//       year: "",
//       semester: "",
//       creditHours: ""
//     });
//     setCurrentPage(1);
//     fetchCourses(1);
//   }, [fetchCourses]);

//   // Handle sort
//   const handleSort = (key) => {
//     let direction = 'asc';
//     if (sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     const newSortConfig = { key, direction };
//     setSortConfig(newSortConfig);
    
//     // Re-fetch with sorting
//     fetchCourses(currentPage, { ...filters, sort_by: key, sort_order: direction });
//   };

//   // Handle page change
//   const handlePageChange = (page) => {
//     if (page < 1 || page > totalPages) return;
//     setCurrentPage(page);
//     fetchCourses(page, filters);
//   };

//   // Handle refresh
//   const handleRefresh = () => {
//     setIsRefreshing(true);
//     fetchCourses(currentPage, filters);
//   };

//   // Handle delete course
//   const handleDeleteCourse = async (id) => {
//     try {
//       const response = await courseAPI.deleteCourse(id);
      
//       if (response && (response.status === 200 || response.status === 204 || response.success)) {
//         alert("Course deleted successfully!");
        
//         // Refresh the course list
//         handleRefresh();
//       } else {
//         throw new Error(response?.data?.message || "Failed to delete course");
//       }
//     } catch (err) {
//       console.error("Error deleting course:", err);
//       alert(err.response?.data?.message || err.message || "Failed to delete course. Please try again.");
//     } finally {
//       setShowDeleteConfirm(null);
//     }
//   };

//   // Handle view course details
//   const handleViewCourse = (courseId) => {
//     navigate(`/courses/${courseId}`);
//   };

//   // Handle edit course
//   const handleEditCourse = (courseId) => {
//     navigate(`/courses/${courseId}/edit`);
//   };

//   // Handle create new course
//   const handleCreateCourse = () => {
//     navigate("/courses/new");
//   };

//   // Get sort icon
//   const getSortIcon = (key) => {
//     if (sortConfig.key !== key) {
//       return <ChevronDown size={12} className="opacity-30" />;
//     }
//     return sortConfig.direction === 'asc' ? 
//       <ChevronUp size={12} /> : <ChevronDown size={12} />;
//   };

//   // Get course type count for stats
//   const getTypeCount = (type) => {
//     return stats.byType[type] || 0;
//   };

//   // Initialize - fetch data on component mount
//   useEffect(() => {
//     fetchCourses(1);
//   }, []);

//   // Loading state
//   if (loading && !isRefreshing) return (
//     <div className="flex flex-col items-center justify-center min-h-[400px]">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
//       <p className="text-gray-600">Loading courses...</p>
//     </div>
//   );

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Management</h1>
//             <p className="text-gray-600">Manage all courses in the system</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button 
//               onClick={handleRefresh}
//               disabled={isRefreshing}
//               className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
//               title="Refresh"
//             >
//               <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
//             </button>
//             <button 
//               onClick={handleCreateCourse}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
//             >
//               <Plus size={20} />
//               Add New Course
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Active Filters Display */}
//       {(filters.search || filters.department || filters.status || filters.type) && (
//         <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <span className="text-blue-800 font-medium">Active Filters:</span>
//               <div className="flex flex-wrap gap-2">
//                 {filters.search && (
//                   <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
//                     <Search size={12} />
//                     Search: "{filters.search}"
//                   </span>
//                 )}
//                 {filters.department && (
//                   <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
//                     <Building size={12} />
//                     Department ID: {filters.department}
//                   </span>
//                 )}
//                 {filters.status && (
//                   <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
//                     <CheckCircle size={12} />
//                     Status: {filters.status}
//                   </span>
//                 )}
//                 {filters.type && (
//                   <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
//                     <BookOpen size={12} />
//                     Type: {filters.type}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <button 
//               onClick={handleClearFilters}
//               className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//             >
//               Clear All
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Total Courses</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//             </div>
//             <div className="p-2 bg-blue-50 rounded-lg">
//               <BookOpen className="text-blue-600" size={24} />
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Active Courses</p>
//               <p className="text-2xl font-bold text-green-600">{stats.active}</p>
//             </div>
//             <div className="p-2 bg-green-50 rounded-lg">
//               <CheckCircle className="text-green-600" size={24} />
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Inactive Courses</p>
//               <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
//             </div>
//             <div className="p-2 bg-red-50 rounded-lg">
//               <Clock className="text-red-600" size={24} />
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Regular Courses</p>
//               <p className="text-2xl font-bold text-purple-600">
//                 {getTypeCount('regular')}
//               </p>
//             </div>
//             <div className="p-2 bg-purple-50 rounded-lg">
//               <Users className="text-purple-600" size={24} />
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Total Sections</p>
//               <p className="text-2xl font-bold text-indigo-600">{stats.totalSections}</p>
//             </div>
//             <div className="p-2 bg-indigo-50 rounded-lg">
//               <Database className="text-indigo-600" size={24} />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Error Alert */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6">
//           <div className="flex items-start">
//             <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />
//             <div className="flex-1">
//               <strong className="font-bold">Error Loading Courses</strong>
//               <p className="mt-1">{error.message}</p>
//               {error.details && <p className="text-sm mt-1">{error.details}</p>}
//               <div className="mt-3">
//                 <button 
//                   onClick={handleRefresh}
//                   className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 flex items-center gap-2 text-sm"
//                 >
//                   <RefreshCw size={16} />
//                   Try Again
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Controls */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div className="flex flex-col sm:flex-row gap-3 flex-1">
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search courses by title, code, or department..."
//                 value={filters.search}
//                 onChange={handleSearchChange}
//                 onKeyPress={handleKeyPress}
//                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//               />
//             </div>
            
//             <div className="flex flex-wrap gap-3">
//               <div className="flex flex-col">
//                 <label className="text-xs text-gray-500 mb-1">Department ID</label>
//                 <input
//                   type="text"
//                   placeholder="Department ID"
//                   value={filters.department}
//                   onChange={(e) => handleFilterChange("department", e.target.value)}
//                   className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[150px]"
//                 />
//               </div>
              
//               <div className="flex flex-col">
//                 <label className="text-xs text-gray-500 mb-1">Status</label>
//                 <select
//                   value={filters.status}
//                   onChange={(e) => handleFilterChange("status", e.target.value)}
//                   className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 >
//                   {statusOptions.map(status => (
//                     <option key={status.value} value={status.value}>{status.label}</option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="flex flex-col">
//                 <label className="text-xs text-gray-500 mb-1">Program Type</label>
//                 <select
//                   value={filters.type}
//                   onChange={(e) => handleFilterChange("type", e.target.value)}
//                   className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 >
//                   {typeOptions.map(type => (
//                     <option key={type.value} value={type.value}>{type.label}</option>
//                   ))}
//                 </select>
//               </div>
              
//               <button 
//                 onClick={handleSearchSubmit}
//                 className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors self-end"
//               >
//                 <Search size={18} />
//                 Search
//               </button>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-2">
//             <button 
//               onClick={handleClearFilters}
//               className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
//             >
//               <Filter size={18} />
//               Clear Filters
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Courses Table - No Checkboxes */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th 
//                   scope="col" 
//                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                   onClick={() => handleSort('course_code')}
//                 >
//                   <div className="flex items-center gap-1">
//                     Course Code
//                     {getSortIcon('course_code')}
//                   </div>
//                 </th>
//                 <th 
//                   scope="col" 
//                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                   onClick={() => handleSort('course_title')}
//                 >
//                   <div className="flex items-center gap-1">
//                     Course Title
//                     {getSortIcon('course_title')}
//                   </div>
//                 </th>
//                 <th 
//                   scope="col" 
//                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                   onClick={() => handleSort('department_id')}
//                 >
//                   <div className="flex items-center gap-1">
//                     Department
//                     {getSortIcon('department_id')}
//                   </div>
//                 </th>
//                 <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Credit Hours
//                 </th>
//                 <th 
//                   scope="col" 
//                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                   onClick={() => handleSort('program_type')}
//                 >
//                   <div className="flex items-center gap-1">
//                     Program Type
//                     {getSortIcon('program_type')}
//                   </div>
//                 </th>
//                 <th 
//                   scope="col" 
//                   className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                   onClick={() => handleSort('status')}
//                 >
//                   <div className="flex items-center gap-1">
//                     Status
//                     {getSortIcon('status')}
//                   </div>
//                 </th>
//                 <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {courses.length > 0 ? (
//                 courses.map((course) => (
//                   <tr key={course.course_id || course.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="font-mono font-semibold text-blue-600">
//                         {course.course_code || "N/A"}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div>
//                         <div className="font-medium text-gray-900">
//                           {course.course_title || "Untitled Course"}
//                         </div>
//                         <div className="text-sm text-gray-500 mt-1">
//                           Sections: {course.section_count || 0}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div>
//                         <div className="font-medium text-gray-900">
//                           {course.department_name || `Department ${course.department_id}`}
//                         </div>
//                         {course.college_name && (
//                           <div className="text-sm text-gray-500">
//                             {course.college_name}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
//                         {course.credit_hours || 0} credits
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       {getTypeBadge(course.program_type)}
//                     </td>
//                     <td className="px-6 py-4">
//                       {getStatusBadge(course.status)}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center space-x-2">
//                         <button 
//                           onClick={() => handleViewCourse(course.course_id || course.id)}
//                           className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
//                           title="View Details"
//                         >
//                           <Eye size={18} />
//                         </button>
//                         <button 
//                           onClick={() => handleEditCourse(course.course_id || course.id)}
//                           className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
//                           title="Edit Course"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button 
//                           onClick={() => setShowDeleteConfirm(course.course_id || course.id)}
//                           className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
//                           title="Delete Course"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="px-6 py-12 text-center">
//                     <div className="text-gray-500 text-center">
//                       <div className="mb-4">
//                         <Search size={48} className="mx-auto text-gray-300" />
//                       </div>
//                       {filters.search || filters.department || filters.status || filters.type ? (
//                         <>
//                           <p className="text-lg font-medium mb-2">No courses found</p>
//                           <p className="mb-4">Try adjusting your search or filter criteria</p>
//                           <button 
//                             onClick={handleClearFilters}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                           >
//                             Clear all filters
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <p className="text-lg font-medium mb-2">No courses available</p>
//                           <p className="mb-4">Get started by creating your first course</p>
//                           <button 
//                             onClick={handleCreateCourse}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
//                           >
//                             <Plus size={18} />
//                             Add New Course
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Delete Confirmation Modal */}
//         {showDeleteConfirm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-xl p-6 max-w-md w-full">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Course</h3>
//               <p className="text-gray-600 mb-6">
//                 Are you sure you want to delete this course? This action cannot be undone.
//               </p>
//               <div className="flex justify-end gap-3">
//                 <button
//                   onClick={() => setShowDeleteConfirm(null)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeleteCourse(showDeleteConfirm)}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                 >
//                   Delete Course
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Pagination Footer */}
//         {courses.length > 0 && (
//           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//               <div className="text-sm text-gray-500 mb-2 sm:mb-0">
//                 Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
//                 <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCourses)}</span> of{' '}
//                 <span className="font-medium">{totalCourses}</span> courses
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button 
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
//                 >
//                   <ChevronLeft size={16} />
//                   Previous
//                 </button>
                
//                 {/* Page numbers */}
//                 {(() => {
//                   const pages = [];
//                   const maxVisiblePages = 5;
//                   let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//                   let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
//                   if (endPage - startPage + 1 < maxVisiblePages) {
//                     startPage = Math.max(1, endPage - maxVisiblePages + 1);
//                   }
                  
//                   for (let i = startPage; i <= endPage; i++) {
//                     pages.push(
//                       <button
//                         key={i}
//                         onClick={() => handlePageChange(i)}
//                         className={`px-3 py-1.5 border rounded text-sm min-w-[40px] transition-colors ${
//                           currentPage === i
//                             ? 'bg-blue-50 text-blue-600 border-blue-200'
//                             : 'border-gray-300 hover:bg-gray-50'
//                         }`}
//                       >
//                         {i}
//                       </button>
//                     );
//                   }
                  
//                   return pages;
//                 })()}
                
//                 <button 
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
//                 >
//                   Next
//                   <ChevronRight size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CoursesPage;

// src/pages/Courses/Courses.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  FileText,
  Calendar,
  BookOpen,
  Users,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Archive,
  Loader2,
  X,
  Database,
  BarChart3,
  Building
} from "lucide-react";
import { courseAPI, courseUtils } from "../../api";
import { useNavigate } from "react-router-dom";

function CoursesPage() {
  const navigate = useNavigate();
  
  // State Management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
    totalSections: 0,
    byType: {}
  });

  // Filters State - Using exact matching
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    program: "",
    status: "",
    type: "",
    year: "",
    semester: "",
    creditHours: ""
  });

  // Sorting State
  const [sortConfig, setSortConfig] = useState({
    key: "course_code",
    direction: "asc"
  });

  // Constants
  const ITEMS_PER_PAGE = 10;

  // Filter options - Simplified for exact matching
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" }
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "regular", label: "Regular" },
    { value: "extension", label: "Extension" },
    { value: "weekend", label: "Weekend" },
    { value: "summer", label: "Summer" },
    { value: "distance", label: "Distance" }
  ];

  // Format hours display
  const formatHours = (course) => {
    if (!course) return "0 - 0 - 0 (0)";
    const lecture = course.lecture_hours || 0;
    const lab = course.lab_hours || 0;
    const tutorial = course.tutorial_hours || 0;
    const credits = course.credit_hours || 0;
    return `${lecture}L - ${lab}Lb - ${tutorial}T (${credits} Cr)`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'active':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle size={12} />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            Inactive
          </span>
        );
      case 'archived':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Archived
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {status}
          </span>
        );
    }
  };

  // Get program type badge
  const getTypeBadge = (type) => {
    if (!type) return null;
    
    const typeLower = type.toLowerCase();
    
    switch (typeLower) {
      case 'regular':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Regular
          </span>
        );
      case 'extension':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            Extension
          </span>
        );
      case 'weekend':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Weekend
          </span>
        );
      case 'summer':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
            Summer
          </span>
        );
      case 'distance':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
            Distance
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {type}
          </span>
        );
    }
  };

  // Fetch courses with exact filtering
  const fetchCourses = useCallback(async (page = 1, filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      setIsRefreshing(true);

      // Build params object matching backend CourseController.getAllCourses
      const params = {
        page: page,
        limit: ITEMS_PER_PAGE,
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
        ...(filterParams.search && { search: filterParams.search }),
        ...(filterParams.department && { department_id: filterParams.department }),
        ...(filterParams.status && { status: filterParams.status }),
        ...(filterParams.type && { program_type: filterParams.type })
      };

      console.log("Fetching courses with exact params:", params);
      
      // Use the courseAPI directly
      const response = await courseAPI.getAllCourses(params);
      console.log("Courses API response:", response);
      
      if (response && response.data) {
        const data = response.data;
        
        // Handle different response structures from backend
        let coursesData = [];
        let total = 0;
        let pagination = {};
        
        if (data.courses && Array.isArray(data.courses)) {
          // Structure: { courses: [], pagination: { page, limit, total, pages } }
          coursesData = data.courses;
          total = data.pagination?.total || data.total || 0;
          pagination = data.pagination || { page: page, total: total, pages: Math.ceil(total / ITEMS_PER_PAGE) };
        } else if (Array.isArray(data)) {
          // Structure: [] (direct array)
          coursesData = data;
          total = data.length;
          pagination = { page: 1, total: data.length, pages: 1 };
        } else if (data.items && Array.isArray(data.items)) {
          // Structure: { items: [], total: X }
          coursesData = data.items;
          total = data.total || 0;
          pagination = { page: page, total: total, pages: Math.ceil(total / ITEMS_PER_PAGE) };
        } else {
          // Default: assume data is the courses array
          coursesData = Array.isArray(data) ? data : [];
          total = coursesData.length;
          pagination = { page: 1, total: total, pages: 1 };
        }

        console.log(`Loaded ${coursesData.length} courses, total: ${total}`);
        
        setCourses(coursesData);
        setTotalCourses(total);
        setTotalPages(pagination.pages || Math.ceil(total / ITEMS_PER_PAGE) || 1);
        
        // Calculate statistics
        const activeCount = coursesData.filter(c => c.status === 'active').length;
        const inactiveCount = coursesData.filter(c => c.status === 'inactive').length;
        const archivedCount = coursesData.filter(c => c.status === 'archived').length;
        
        const byType = {};
        coursesData.forEach(course => {
          if (course.program_type) {
            byType[course.program_type] = (byType[course.program_type] || 0) + 1;
          }
        });
        
        setStats({
          total: total,
          active: activeCount,
          inactive: inactiveCount,
          archived: archivedCount,
          byType: byType,
          totalSections: coursesData.reduce((sum, c) => sum + (c.section_count || 0), 0)
        });
        
      } else {
        throw new Error("Invalid response format from server");
      }
      
    } catch (err) {
      console.error("Error fetching courses:", err);
      
      // Provide detailed error information
      let errorMessage = "Failed to load courses";
      let errorDetails = "";
      
      if (err.response) {
        // Backend responded with error status
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        errorDetails = err.response.data?.error || "";
      } else if (err.request) {
        // Request made but no response
        errorMessage = "Network error - unable to reach server";
        errorDetails = "Please check your internet connection and try again";
      } else {
        // Other errors
        errorMessage = err.message || "Unknown error occurred";
      }
      
      setError({
        message: errorMessage,
        details: errorDetails,
        status: err.response?.status
      });
      
      // Set empty state
      setCourses([]);
      setTotalCourses(0);
      setTotalPages(1);
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        archived: 0,
        byType: {},
        totalSections: 0
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [ITEMS_PER_PAGE, sortConfig]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  // Handle search submission
  const handleSearchSubmit = useCallback(() => {
    setCurrentPage(1);
    fetchCourses(1, filters);
  }, [filters, fetchCourses]);

  // Handle search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Handle exact filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    console.log(`Filter changed: ${filterType} = ${value}`);
    
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
    
    fetchCourses(1, { ...filters, [filterType]: value });
  }, [filters, fetchCourses]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    console.log("Clearing all filters");
    setFilters({
      search: "",
      department: "",
      program: "",
      status: "",
      type: "",
      year: "",
      semester: "",
      creditHours: ""
    });
    setCurrentPage(1);
    fetchCourses(1);
  }, [fetchCourses]);

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    
    // Re-fetch with sorting
    fetchCourses(currentPage, { ...filters, sort_by: key, sort_order: direction });
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchCourses(page, filters);
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCourses(currentPage, filters);
  };

  // Handle delete course
  const handleDeleteCourse = async (id) => {
    try {
      const response = await courseAPI.deleteCourse(id);
      
      if (response && (response.status === 200 || response.status === 204 || response.success)) {
        alert("Course deleted successfully!");
        
        // Refresh the course list
        handleRefresh();
      } else {
        throw new Error(response?.data?.message || "Failed to delete course");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete course. Please try again.");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // Handle view course details
  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  // Handle edit course
  const handleEditCourse = (courseId) => {
    navigate(`/courses/${courseId}/edit`);
  };

  // Handle create new course
  const handleCreateCourse = () => {
    navigate("/courses/new");
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronDown size={12} className="opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  // Get course type count for stats
  const getTypeCount = (type) => {
    return stats.byType[type] || 0;
  };

  // Initialize - fetch data on component mount
  useEffect(() => {
    fetchCourses(1);
  }, []);

  // Loading state
  if (loading && !isRefreshing) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading courses...</p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Management</h1>
            <p className="text-gray-600">Manage all courses in the system</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={handleCreateCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
            >
              <Plus size={20} />
              Add New Course
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search || filters.department || filters.status || filters.type) && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-800 font-medium">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                    <Search size={12} />
                    Search: "{filters.search}"
                  </span>
                )}
                {filters.department && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                    <Building size={12} />
                    Department ID: {filters.department}
                  </span>
                )}
                {filters.status && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                    <CheckCircle size={12} />
                    Status: {filters.status}
                  </span>
                )}
                {filters.type && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                    <BookOpen size={12} />
                    Type: {filters.type}
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Courses</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive Courses</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <Clock className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Regular Courses</p>
              <p className="text-2xl font-bold text-purple-600">
                {getTypeCount('regular')}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sections</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalSections}</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Database className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6">
          <div className="flex items-start">
            <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <strong className="font-bold">Error Loading Courses</strong>
              <p className="mt-1">{error.message}</p>
              {error.details && <p className="text-sm mt-1">{error.details}</p>}
              <div className="mt-3">
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 flex items-center gap-2 text-sm"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses by title, code, or department..."
                value={filters.search}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Department ID</label>
                <input
                  type="text"
                  placeholder="Department ID"
                  value={filters.department}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[150px]"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Program Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {typeOptions.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={handleSearchSubmit}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors self-end"
              >
                <Search size={18} />
                Search
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleClearFilters}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Filter size={18} />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Courses Table - No Checkboxes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('course_code')}
                >
                  <div className="flex items-center gap-1">
                    Course Code
                    {getSortIcon('course_code')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('course_title')}
                >
                  <div className="flex items-center gap-1">
                    Course Title
                    {getSortIcon('course_title')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('department_id')}
                >
                  <div className="flex items-center gap-1">
                    Department
                    {getSortIcon('department_id')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Hours
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('program_type')}
                >
                  <div className="flex items-center gap-1">
                    Program Type
                    {getSortIcon('program_type')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.course_id || course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-blue-600">
                        {course.course_code || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {course.course_title || "Untitled Course"}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Sections: {course.section_count || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {course.department_name || `Department ${course.department_id}`}
                        </div>
                        {course.college_name && (
                          <div className="text-sm text-gray-500">
                            {course.college_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                        {course.credit_hours || 0} credits
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(course.program_type)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(course.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewCourse(course.course_id || course.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditCourse(course.course_id || course.id)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                          title="Edit Course"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(course.course_id || course.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Delete Course"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500 text-center">
                      <div className="mb-4">
                        <Search size={48} className="mx-auto text-gray-300" />
                      </div>
                      {filters.search || filters.department || filters.status || filters.type ? (
                        <>
                          <p className="text-lg font-medium mb-2">No courses found</p>
                          <p className="mb-4">Try adjusting your search or filter criteria</p>
                          <button 
                            onClick={handleClearFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Clear all filters
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium mb-2">No courses available</p>
                          <p className="mb-4">Get started by creating your first course</p>
                          <button 
                            onClick={handleCreateCourse}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                          >
                            <Plus size={18} />
                            Add New Course
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Course</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this course? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCourse(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        {courses.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCourses)}</span> of{' '}
                <span className="font-medium">{totalCourses}</span> courses
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                
                {/* Page numbers */}
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-1.5 border rounded text-sm min-w-[40px] transition-colors ${
                          currentPage === i
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;