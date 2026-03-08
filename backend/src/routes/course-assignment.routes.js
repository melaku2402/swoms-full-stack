
//  // routes/course-assignment.routes.js - COMPLETE FIXED VERSION
// import express from "express";
// import CourseAssignmentController from "../controllers/CourseAssignmentController.js";
// import { auth, requireRole } from "../middleware/auth.js";

// const router = express.Router();

// // All routes require authentication
// router.use(auth);

// // ==================== CORE ASSIGNMENT ROUTES ====================

// // Create new course assignment (with overload checking)
// router.post(
//   "/",
//   requireRole("department_head"),
//   CourseAssignmentController.createAssignment
// );

// // Check assignment feasibility without creating it
// router.post(
//   "/check-feasibility",
//   requireRole("department_head"),
//   CourseAssignmentController.checkAssignmentFeasibility
// );

// // Add to routes/course-assignment.routes.js

// // Update assignment details
// router.put(
//   "/:id/update",
//   requireRole("admin", "department_head", "instructor"),
//   CourseAssignmentController.updateAssignment
// );
// // Get staff workload details
// router.get(
//   "/staff/:id/workload",
//   requireRole("department_head", "instructor", "admin"),
//   CourseAssignmentController.getStaffWorkload
// );

// // Get my assignments (for instructors)
// router.get(
//   "/my",
//   requireRole("instructor"),
//   CourseAssignmentController.getMyAssignments
// );

// // Get department assignments (for department heads)
// router.get(
//   "/department",
//   requireRole("department_head"),
//   CourseAssignmentController.getDepartmentAssignments
// );

// // Get staff availability for assignments
// router.get(
//   "/availability",
//   requireRole("department_head"),
//   CourseAssignmentController.getStaffAvailability
// );

// // Get assignment statistics
// router.get(
//   "/stats",
//   requireRole("department_head", "admin"),
//   CourseAssignmentController.getAssignmentStats
// );

// // ==================== SINGLE ASSIGNMENT OPERATIONS ====================

// // Get assignment by ID
// router.get(
//   "/:id",
//   requireRole("admin", "department_head", "instructor"),
//   CourseAssignmentController.getAssignmentById
// );

// // Accept assignment (instructor)
// router.put(
//   "/:id/accept",
//   requireRole("instructor"),
//   CourseAssignmentController.acceptAssignment
// );

// // Decline assignment (instructor)
// router.put(
//   "/:id/decline",
//   requireRole("instructor"),
//   CourseAssignmentController.declineAssignment
// );

// // Withdraw assignment (department head)
// router.put(
//   "/:id/withdraw",
//   requireRole("department_head"),
//   CourseAssignmentController.withdrawAssignment
// );

// // ==================== CURRICULUM-BASED ROUTES ====================

// // Get curriculum structure
// router.get(
//   "/curriculum/structure",
//   requireRole("department_head", "dean", "admin"),
//   CourseAssignmentController.getCurriculumStructure
// );

// // Get curriculum dashboard
// router.get(
//   "/curriculum/dashboard",
//   requireRole("department_head"),
//   CourseAssignmentController.getCurriculumDashboard
// );

// // Get courses for assignment with filters
// router.get(
//   "/curriculum/courses",
//   requireRole("department_head"),
//   CourseAssignmentController.getCoursesForAssignment
// );

// // Create curriculum-based assignment
// router.post(
//   "/curriculum/assign",
//   requireRole("department_head"),
//   CourseAssignmentController.createCurriculumAssignment
// );

// // Batch assign multiple courses
// router.post(
//   "/curriculum/batch-assign",
//   requireRole("department_head"),
//   CourseAssignmentController.batchAssignCourses
// );

// // Import curriculum data
// router.post(
//   "/curriculum/import",
//   requireRole("department_head", "admin"),
//   CourseAssignmentController.importCurriculum
// );

// // Get available years and semesters for curriculum
// router.get(
//   "/curriculum/years-semesters",
//   requireRole("department_head", "dean", "admin"),
//   CourseAssignmentController.getAvailableYearsSemesters
// );

// export default router;


// routes/course-assignment.routes.js - UPDATED VERSION
import express from "express";
import CourseAssignmentController from "../controllers/CourseAssignmentController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// ==================== FORM DATA ROUTES ====================

// Get assignment form data (dropdowns)
router.get(
  "/form-data",
  requireRole("department_head"),
  CourseAssignmentController.getAssignmentFormData
);

// Get program types
router.get(
  "/program-types",
  requireRole("department_head"),
  CourseAssignmentController.getProgramTypes
);

// Get student years
router.get(
  "/student-years",
  requireRole("department_head"),
  CourseAssignmentController.getStudentYears
);

// Get available sections
router.get(
  "/available-sections",
  requireRole("department_head"),
  CourseAssignmentController.getAvailableSections
);

// ==================== ASSIGNMENT DATA ROUTES ====================

// Get courses for assignment form
router.get(
  "/courses",
  requireRole("department_head"),
  CourseAssignmentController.getCoursesForAssignmentForm
);

// Get instructors for assignment
router.get(
  "/instructors",
  requireRole("department_head"),
  CourseAssignmentController.getInstructorsForAssignment
);

// ==================== CORE ASSIGNMENT ROUTES ====================

// Create new course assignment
router.post(
  "/",
  requireRole("department_head"),
  CourseAssignmentController.createAssignment
);

// Check assignment feasibility
router.post(
  "/check-feasibility",
  requireRole("department_head"),
  CourseAssignmentController.checkAssignmentFeasibility
);

// Update assignment
router.put(
  "/:id",
  requireRole("admin", "department_head", "instructor"),
  CourseAssignmentController.updateAssignment
);

// ==================== WORKLOAD & ASSIGNMENT ROUTES ====================

// Get staff workload
router.get(
  "/staff/:id/workload",
  requireRole("department_head", "instructor", "admin"),
  CourseAssignmentController.getStaffWorkload
);

// Get my assignments
router.get(
  "/my",
  requireRole("instructor"),
  CourseAssignmentController.getMyAssignments
);

// Get department assignments
router.get(
  "/department",
  requireRole("department_head"),
  CourseAssignmentController.getDepartmentAssignments
);

// Get staff availability
router.get(
  "/availability",
  requireRole("department_head"),
  CourseAssignmentController.getStaffAvailability
);

// Get assignment statistics
router.get(
  "/stats",
  requireRole("department_head", "admin"),
  CourseAssignmentController.getAssignmentStats
);

// ==================== SINGLE ASSIGNMENT OPERATIONS ====================

// Get assignment by ID
router.get(
  "/:id",
  requireRole("admin", "department_head", "instructor"),
  CourseAssignmentController.getAssignmentById
);

// Accept assignment
router.put(
  "/:id/accept",
  requireRole("instructor"),
  CourseAssignmentController.acceptAssignment
);

// Decline assignment
router.put(
  "/:id/decline",
  requireRole("instructor"),
  CourseAssignmentController.declineAssignment
);

// Withdraw assignment
router.put(
  "/:id/withdraw",
  requireRole("department_head"),
  CourseAssignmentController.withdrawAssignment
);

// ==================== CURRICULUM ROUTES ====================

// Get curriculum structure
router.get(
  "/curriculum/structure",
  requireRole("department_head", "dean", "admin"),
  CourseAssignmentController.getCurriculumStructure
);

// Get curriculum dashboard
router.get(
  "/curriculum/dashboard",
  requireRole("department_head"),
  CourseAssignmentController.getCurriculumDashboard
);

// Get courses for curriculum assignment
router.get(
  "/curriculum/courses",
  requireRole("department_head"),
  CourseAssignmentController.getCoursesForAssignment
);

// Create curriculum-based assignment
router.post(
  "/curriculum/assign",
  requireRole("department_head"),
  CourseAssignmentController.createCurriculumAssignment
);

// Batch assign multiple courses
router.post(
  "/curriculum/batch-assign",
  requireRole("department_head"),
  CourseAssignmentController.batchAssignCourses
);

// Import curriculum data
router.post(
  "/curriculum/import",
  requireRole("department_head", "admin"),
  CourseAssignmentController.importCurriculum
);

// Get available years and semesters
router.get(
  "/curriculum/years-semesters",
  requireRole("department_head", "dean", "admin"),
  CourseAssignmentController.getAvailableYearsSemesters
);


// routes/course-assignment.routes.js
router.get(
  "/:id/details",
  requireRole("admin", "department_head", "instructor"),
  CourseAssignmentController.getAssignmentWithDetails
);
export default router;