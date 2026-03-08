// src/routes/semester.routes.js
import express from "express";
import SemesterController from "../controllers/SemesterController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All semester routes require authentication
router.use(auth);

// Get all semesters (admin, dean, department_head, registrar can view)
router.get(
  "/",
  requireRole("admin", "dean", "department_head", "registrar","instructor"),
  SemesterController.getAllSemesters
);

// Get active semester
router.get(
  "/active",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  SemesterController.getActiveSemester
);

// Get current semester (based on date)
router.get(
  "/current",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  SemesterController.getCurrentSemester
);

// Get semester by ID
router.get(
  "/:id",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  SemesterController.getSemesterById
);

// Get semesters by academic year
router.get(
  "/academic-year/:academicYearId",
  requireRole("admin", "dean", "department_head", "registrar"),
  SemesterController.getSemestersByAcademicYear
);

// Create semester (admin and registrar only)
router.post(
  "/",
  requireRole("admin", "registrar"),
  SemesterController.createSemester
);

// Update semester (admin and registrar only)
router.put(
  "/:id",
  requireRole("admin", "registrar"),
  SemesterController.updateSemester
);

// Delete semester (admin only)
router.delete("/:id", requireRole("admin"), SemesterController.deleteSemester);

// Activate semester (admin and registrar only)
router.put(
  "/:id/activate",
  requireRole("admin", "registrar"),
  SemesterController.activateSemester
);

// Get semester statistics (admin, dean, department_head)
router.get(
  "/:id/statistics",
  requireRole("admin", "dean", "department_head"),
  SemesterController.getSemesterStats
);

export default router;
