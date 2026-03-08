// import express from "express";
// import WorkloadReportController from "../controllers/WorkloadReportController.js";
// import { auth, requireRole } from "../middleware/auth.js";

// const router = express.Router();

// // All routes require authentication
// router.use(auth);

// // Test endpoint to verify route is working
// router.get("/test", (req, res) => {
//   res.json({
//     success: true,
//     message: "Workload report API is working",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Generate comprehensive report
// router.get(
//   "/generate",
//   requireRole(
//     "instructor",
//     "department_head",
//     "dean",
//     "admin",
//     "hr_director",
//     "cde_director",
//     "finance"
//   ),
//   WorkloadReportController.generateReport
// );

// // Export report
// router.post(
//   "/export",
//   requireRole(
//     "instructor",
//     "department_head",
//     "dean",
//     "admin",
//     "hr_director",
//     "cde_director",
//     "finance"
//   ),
//   WorkloadReportController.exportReport
// );

// // Get available semesters
// router.get(
//   "/semesters",
//   requireRole("instructor", "department_head", "dean", "admin"),
//   WorkloadReportController.getAvailableSemesters
// );

// // Get department statistics
// router.get(
//   "/department/:departmentId/stats",
//   requireRole("department_head", "dean", "admin", "hr_director"),
//   WorkloadReportController.getDepartmentStats
// );

// // Get staff performance
// router.get(
//   "/staff/:staffId/performance",
//   requireRole("instructor", "department_head", "dean", "admin", "hr_director"),
//   WorkloadReportController.getStaffPerformance
// );

// // Get dashboard summary
// router.get(
//   "/dashboard",
//   requireRole(
//     "instructor",
//     "department_head",
//     "dean",
//     "admin",
//     "hr_director",
//     "cde_director"
//   ),
//   WorkloadReportController.getDashboardSummary
// );

// export default router;
import express from "express";
import WorkloadReportController from "../controllers/WorkloadReportController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Test endpoint to verify route is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Workload report API is working",
    timestamp: new Date().toISOString(),
  });
});

// Generate comprehensive report
router.get(
  "/generate",
  requireRole(
    "instructor",
    "department_head",
    "dean",
    "admin",
    "hr_director",
    "cde_director",
    "finance"
  ),
  WorkloadReportController.generateReport
);

// Export report
router.post(
  "/export",
  requireRole(
    "instructor",
    "department_head",
    "dean",
    "admin",
    "hr_director",
    "cde_director",
    "finance"
  ),
  WorkloadReportController.exportReport
);

// Get available semesters
router.get(
  "/semesters",
  requireRole("instructor", "department_head", "dean", "admin"),
  WorkloadReportController.getAvailableSemesters
);

// Get department statistics
router.get(
  "/department/:departmentId/stats",
  requireRole("department_head", "dean", "admin", "hr_director"),
  WorkloadReportController.getDepartmentStats
);

// Get staff performance
router.get(
  "/staff/:staffId/performance",
  requireRole("instructor", "department_head", "dean", "admin", "hr_director"),
  WorkloadReportController.getStaffPerformance
);

// Get dashboard summary
router.get(
  "/dashboard",
  requireRole(
    "instructor",
    "department_head",
    "dean",
    "admin",
    "hr_director",
    "cde_director"
  ),
  WorkloadReportController.getDashboardSummary
);

export default router;