// import express from "express";
// import DepartmentController from "../controllers/DepartmentController.js";
// import { auth, requireRole } from "../middleware/auth.js";

// const router = express.Router();

// // All department routes require authentication
// router.use(auth);

// // Get all departments
// router.get(
//   "/",
//   requireRole("admin", "dean", "department_head"),
//   DepartmentController.getAllDepartments
// );

// // Get departments by college
// router.get(
//   "/college/:collegeId",
//   requireRole("admin", "dean", "department_head"),
//   DepartmentController.getDepartmentsByCollege
// );

// // Get department by ID
// router.get(
//   "/:id",
//   requireRole("admin", "dean", "department_head", "instructor"),
//   DepartmentController.getDepartmentById
// );

// // Create department (admin only)
// router.post("/", requireRole("admin"), DepartmentController.createDepartment);

// // Update department (admin and department head of that department)
// router.put(
//   "/:id",
//   requireRole("admin", "department_head"),
//   DepartmentController.updateDepartment
// );

// // Delete department (admin only)
// router.delete(
//   "/:id",
//   requireRole("admin"),
//   DepartmentController.deleteDepartment
// );

// // Get department statistics
// router.get(
//   "/:id/statistics",
//   requireRole("admin", "dean", "department_head"),
//   DepartmentController.getDepartmentStats
// );

// // Assign head to department (admin and dean)
// router.post(
//   "/:id/assign-head",
//   requireRole("admin", "dean"),
//   DepartmentController.assignHead
// );

// export default router;

import express from "express";
import DepartmentController from "../controllers/DepartmentController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All department routes require authentication
router.use(auth);

// ==================== CORE CRUD OPERATIONS ====================

// Get all departments
router.get(
  "/",
  requireRole("admin", "dean", "department_head"),
  DepartmentController.getAllDepartments
);

// Get departments by college
router.get(
  "/college/:collegeId",
  requireRole("admin", "dean", "department_head"),
  DepartmentController.getDepartmentsByCollege
);

// Get department by ID
router.get(
  "/:id",
  requireRole("admin", "dean", "department_head", "instructor"),
  DepartmentController.getDepartmentById
);

// Create department (admin only)
router.post("/", requireRole("admin"), DepartmentController.createDepartment);

// Update department (admin and department head of that department)
router.put(
  "/:id",
  requireRole("admin", "department_head"),
  DepartmentController.updateDepartment
);

// Delete department (admin only)
router.delete(
  "/:id",
  requireRole("admin"),
  DepartmentController.deleteDepartment
);

// Get department statistics
router.get(
  "/:id/statistics",
  requireRole("admin", "dean", "department_head"),
  DepartmentController.getDepartmentStats
);

// Assign head to department (admin and dean)
router.post(
  "/:id/assign-head",
  requireRole("admin", "dean"),
  DepartmentController.assignHead
);

// ==================== DASHBOARD & ANALYTICS ====================

// Get department dashboard data
router.get(
  "/:id/dashboard",
  requireRole("admin", "dean", "department_head"),
  DepartmentController.getDepartmentDashboard
);

// Get department workload summary
router.get(
  "/:id/workload-summary",
  requireRole("admin", "dean", "department_head"),
  DepartmentController.getDepartmentWorkloadSummary
);

// ==================== DEPARTMENT DATA ====================

// Get department staff
router.get(
  "/:id/staff",
  requireRole("admin", "dean", "department_head"),
  DepartmentController.getDepartmentStaff
);

// Get department courses
router.get(
  "/:id/courses",
  requireRole("admin", "dean", "department_head", "instructor"),
  DepartmentController.getDepartmentCourses
);

// ==================== ADDITIONAL OPERATIONS ====================

// Export department data
router.get(
  "/:id/export",
  requireRole("admin", "dean", "department_head"),
  DepartmentController.exportDepartmentData
);

// Advanced search
router.get(
  "/search/advanced",
  requireRole("admin", "dean", "department_head"),
  DepartmentController.advancedSearch
);

// Update department status
router.post(
  "/:id/status",
  requireRole("admin", "dean"),
  DepartmentController.updateDepartmentStatus
);

// Merge departments
router.post(
  "/merge",
  requireRole("admin"),
  DepartmentController.mergeDepartments
);

// Bulk update departments
router.post(
  "/bulk/update",
  requireRole("admin"),
  DepartmentController.bulkUpdateDepartments
);
// Add to src/routes/department.routes.js
router.get(
  "/my",
  auth,
  requireRole("department_head"),
  DepartmentController.getMyDepartment
);

export default router;