import express from "express";
import CollegeController from "../controllers/CollegeController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All college routes require authentication
router.use(auth);

// Get all colleges (admin, dean, department_head can view)
router.get(
  "/",
  requireRole("admin", "dean", "department_head"),
  CollegeController.getAllColleges
);

// Get college by ID
router.get(
  "/:id",
  requireRole("admin", "dean", "department_head"),
  CollegeController.getCollegeById
);

// Create college (admin only)
router.post("/", requireRole("admin"), CollegeController.createCollege);

// Update college (admin only)
router.put("/:id", requireRole("admin"), CollegeController.updateCollege);

// Delete college (admin only)
router.delete("/:id", requireRole("admin"), CollegeController.deleteCollege);

// Get college statistics
router.get(
  "/:id/statistics",
  requireRole("admin", "dean"),
  CollegeController.getCollegeStats
);

// Assign dean to college (admin only)
router.post(
  "/:id/assign-dean",
  requireRole("admin"),
  CollegeController.assignDean
);

export default router;
