
// export default router;
import express from "express";
import WorkloadRPController from "../controllers/WorkloadRPController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All workload routes require authentication
router.use(auth);

// ===== INSTRUCTOR ROUTES =====

// Get my workload
router.get(
  "/me",
  requireRole("instructor", "department_head", "dean"),
  WorkloadRPController.getMyWorkload
);

// Get my workload dashboard
router.get(
  "/me/dashboard",
  requireRole("instructor", "department_head", "dean"),
  WorkloadRPController.getWorkloadDashboard
);

// Create or update my workload
router.post(
  "/me",
  requireRole("instructor", "department_head", "dean"),
  WorkloadRPController.createOrUpdateWorkload
);

// Calculate workload from my sections
router.post(
  "/me/calculate-from-sections",
  requireRole("instructor", "department_head", "dean"),
  WorkloadRPController.calculateFromSections
);

// Submit my workload for approval
router.post(
  "/me/:id/submit",
  requireRole("instructor", "department_head", "dean"),
  WorkloadRPController.submitForApproval
);

// ===== APPROVAL WORKFLOW ROUTES =====

// Get my pending approvals
router.get(
  "/approvals/pending",
  requireRole(
    "department_head",
    "dean",
    "hr_director",
    "vpaa",
    "vpaf",
    "finance"
  ),
  WorkloadRPController.getMyPendingApprovals
);

// Get approval workflow for a workload
router.get(
  "/:id/approvals",
  requireRole(
    "admin",
    "department_head",
    "dean",
    "hr_director",
    "vpaa",
    "vpaf",
    "finance",
    "instructor"
  ),
  WorkloadRPController.getApprovalWorkflow
);

// Approve a step
router.post(
  "/approvals/:approvalId/approve",
  requireRole(
    "department_head",
    "dean",
    "hr_director",
    "vpaa",
    "vpaf",
    "finance"
  ),
  WorkloadRPController.approveStep
);

// Reject a workload
router.post(
  "/:id/reject",
  requireRole(
    "department_head",
    "dean",
    "hr_director",
    "vpaa",
    "vpaf",
    "finance"
  ),
  WorkloadRPController.rejectWorkload
);

// Return workload for correction
router.post(
  "/:id/return",
  requireRole(
    "department_head",
    "dean",
    "hr_director",
    "vpaa",
    "vpaf",
    "finance"
  ),
  WorkloadRPController.returnForCorrection
);

// ===== MANAGEMENT ROUTES =====

// Get all workloads (with filters) - ALLOW INSTRUCTORS
router.get(
  "/",
  requireRole(
    "admin",
    "dean",
    "department_head",
    "hr_director",
    "vpaa",
    "vpaf",
    "finance",
    "registrar",
    "instructor"
  ),
  WorkloadRPController.getAllWorkloads
);

// Get workload by ID
router.get(
  "/:id",
  requireRole(
    "admin",
    "dean",
    "department_head",
    "hr_director",
    "vpaa",
    "vpaf",
    "finance",
    "instructor"
  ),
  WorkloadRPController.getWorkloadById
);

// Get workload statistics
router.get(
  "/statistics/overview",
  requireRole("admin", "dean", "department_head", "hr_director"),
  WorkloadRPController.getWorkloadStatistics
);

// Get department workload summary
router.get(
  "/department/:departmentId/summary",
  requireRole("admin", "dean", "department_head", "hr_director"),
  WorkloadRPController.getDepartmentWorkloadSummary
);

// Create or update workload (admin/HR can create for others)
router.post(
  "/",
  requireRole("admin", "hr_director"),
  WorkloadRPController.createOrUpdateWorkload
);

// Calculate workload from sections (admin/HR/dept head)
router.post(
  "/calculate-from-sections",
  requireRole("admin", "hr_director", "department_head"),
  WorkloadRPController.calculateFromSections
);

// Delete workload (admin only)
router.delete(
  "/:id",
  requireRole("admin"),
  WorkloadRPController.deleteWorkload
);

export default router;