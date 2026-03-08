// ============================================
// FILE: src/routes/workload-nrp.routes.js (Simplified)
// ============================================
import express from "express";
import WorkloadNRPController from "../controllers/WorkloadNRPController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// ===== CREATE =====
router.post(
  "/",
  requireRole("instructor", "department_head", "dean", "admin", "cde_director"),
  WorkloadNRPController.createNRPWorkload
);

// ===== READ =====
// Get all NRP workloads (role-based filtering in controller)
router.get(
  "/",
  requireRole(
    "instructor",
    "department_head",
    "dean",
    "admin",
    "registrar",
    "cde_director",
    "hr_director",
    "vpaf",
    "finance"
  ),
  WorkloadNRPController.getAllNRPWorkloads
);

// Get single NRP workload
router.get(
  "/:id",
  requireRole(
    "instructor",
    "department_head",
    "dean",
    "admin",
    "registrar",
    "cde_director",
    "hr_director",
    "vpaf",
    "finance"
  ),
  WorkloadNRPController.getNRPWorkloadById
);

// ===== UPDATE =====
router.put(
  "/:id",
  requireRole("instructor", "department_head", "dean", "admin"),
  WorkloadNRPController.updateNRPWorkload
);

// ===== SUBMIT FOR APPROVAL =====
router.post(
  "/:id/submit",
  requireRole("instructor"),
  WorkloadNRPController.submitForApproval
);

// ===== STATISTICS =====
router.get(
  "/statistics/dashboard",
  requireRole("admin", "dean", "department_head", "cde_director"),
  WorkloadNRPController.getNRPStatistics
);

export default router;
