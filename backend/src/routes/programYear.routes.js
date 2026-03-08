import express from "express";
import { auth, requireRole } from "../middleware/auth.js";
import ProgramYearController from "../controllers/ProgramYearController.js"; // You need to create this controller

const router = express.Router();

// All program year routes require authentication
router.use(auth);

// Get program years by program
router.get(
  "/program/:programId",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  ProgramYearController.getProgramYearsByProgram
);

// Get program year by ID
router.get(
  "/:id",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  ProgramYearController.getProgramYearById
);

// Create program year (admin and registrar only)
router.post(
  "/",
  requireRole("admin", "registrar"),
  ProgramYearController.createProgramYear
);

// Update program year (admin and registrar only)
router.put(
  "/:id",
  requireRole("admin", "registrar"),
  ProgramYearController.updateProgramYear
);

// Delete program year (admin only)
router.delete(
  "/:id",
  requireRole("admin"),
  ProgramYearController.deleteProgramYear
);

// Get year statistics
router.get(
  "/statistics/:programId",
  requireRole("admin", "dean", "department_head"),
  ProgramYearController.getYearStatistics
);

export default router;
