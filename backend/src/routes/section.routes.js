// src/routes/section.routes.js
import express from "express";
import SectionController from "../controllers/SectionController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All section routes require authentication
router.use(auth);

// Get all sections
router.get(
  "/",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  SectionController.getAllSections
);

// Get section by ID
router.get(
  "/:id",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  SectionController.getSectionById
);

// Get sections by course and semester
router.get(
  "/course/:courseId/semester/:semesterId",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  SectionController.getSectionsByCourseAndSemester
);

// Get sections by instructor
router.get(
  "/instructor/:instructorId",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  SectionController.getSectionsByInstructor
);

// Get sections by department
router.get(
  "/department/:departmentId",
  requireRole("admin", "dean", "department_head", "registrar"),
  SectionController.getSectionsByDepartment
);

// Get unassigned sections
router.get(
  "/unassigned/list",
  requireRole("admin", "dean", "department_head", "registrar"),
  SectionController.getUnassignedSections
);

// Get sections by date range
router.get(
  "/date-range/filter",
  requireRole("admin", "dean", "department_head", "registrar"),
  SectionController.getSectionsByDateRange
);

// Get section statistics
router.get(
  "/statistics/overview",
  requireRole("admin", "dean", "department_head"),
  SectionController.getSectionStats
);

// Get dashboard summary
router.get(
  "/dashboard/summary",
  requireRole("admin", "dean", "department_head"),
  SectionController.getDashboardSummary
);

// Create section (admin and registrar only)
router.post(
  "/",
  requireRole("admin", "registrar"),
  SectionController.createSection
);

// Update section (admin and registrar only)
router.put(
  "/:id",
  requireRole("admin", "registrar"),
  SectionController.updateSection
);

// Delete section (admin only)
router.delete("/:id", requireRole("admin"), SectionController.deleteSection);

// Assign instructor to section
router.post(
  "/:id/assign-instructor",
  requireRole("admin", "registrar", "department_head"),
  SectionController.assignInstructor
);

// Remove instructor from section
router.delete(
  "/:id/remove-instructor",
  requireRole("admin", "registrar", "department_head"),
  SectionController.removeInstructor
);

// Update student count
router.put(
  "/:id/student-count",
  requireRole("admin", "registrar", "department_head"),
  SectionController.updateStudentCount
);

export default router;
