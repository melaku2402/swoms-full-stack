// src/routes/academic-year.routes.js
import express from "express";
import AcademicYearController from "../controllers/AcademicYearController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All academic year routes require authentication
router.use(auth);
// Get all academic years (admin, dean, department_head, registrar can view)
router.get(
  "/",
  requireRole("admin", "dean", "department_head", "registrar"),
  AcademicYearController.getAllAcademicYears
);

// Get active academic year
router.get(
  "/active",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  AcademicYearController.getActiveAcademicYear
);

// Get academic year by ID
router.get(
  "/:id",
  requireRole("admin", "dean", "department_head", "registrar"),
  AcademicYearController.getAcademicYearById
);

// Create academic year (admin and registrar only)
router.post(
  "/",
  requireRole("admin", "registrar"),
  AcademicYearController.createAcademicYear
);

// Update academic year (admin and registrar only)
router.put(
  "/:id",
  requireRole("admin", "registrar"),
  AcademicYearController.updateAcademicYear
);

// Delete academic year (admin only)
router.delete(
  "/:id",
  requireRole("admin"),
  AcademicYearController.deleteAcademicYear
);

// Activate academic year (admin and registrar only)
router.put(
  "/:id/activate",
  requireRole("admin", "registrar"),
  AcademicYearController.activateAcademicYear
);

// Get academic year statistics (admin, dean, department_head)
router.get(
  "/:id/statistics",
  requireRole("admin", "dean", "department_head"),
  AcademicYearController.getAcademicYearStats
);

export default router;
