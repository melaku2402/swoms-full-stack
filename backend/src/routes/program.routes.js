// src/routes/program.routes.js
import express from "express";
import ProgramController from "../controllers/ProgramController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All program routes require authentication
router.use(auth);

// Get all programs
router.get(
  "/",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  ProgramController.getAllPrograms
);

// Get program by ID
router.get(
  "/:id",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  ProgramController.getProgramById
);

// Get programs by department
router.get(
  "/department/:departmentId",
  requireRole("admin", "dean", "department_head", "registrar"),
  ProgramController.getProgramsByDepartment
);

// Get programs by type
router.get(
  "/type/:type",
  requireRole("admin", "dean", "department_head", "registrar"),
  ProgramController.getProgramsByType
);

// Get program types
router.get(
  "/types/all",
  requireRole("admin", "dean", "department_head", "registrar"),
  ProgramController.getProgramTypes
);

// Get program statistics
router.get(
  "/statistics/overview",
  requireRole("admin", "dean", "department_head"),
  ProgramController.getProgramStats
);

// Get program types dashboard
router.get(
  "/dashboard/types",
  requireRole("admin", "dean"),
  ProgramController.getProgramTypesDashboard
);

// Create program (admin and registrar only)
router.post(
  "/",
  requireRole("admin", "registrar"),
  ProgramController.createProgram
);

// Update program (admin and registrar only)
router.put(
  "/:id",
  requireRole("admin", "registrar"),
  ProgramController.updateProgram
);

// Delete program (admin only)
router.delete("/:id", requireRole("admin"), ProgramController.deleteProgram);

// Assign courses to program
router.post(
  "/:id/assign-courses",
  requireRole("admin", "registrar"),
  ProgramController.assignCourses
);

export default router;
