// src/routes/exportRoutes.js
import express from "express";
import ExportController from "../controllers/ExportController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Dashboard export
router.get(
  "/dashboard/:format",
  requireRole([
    "admin",
    "dean",
    "department_head",
    "hr_director",
    "vpaa",
    "vpaf",
  ]),
  ExportController.exportDashboard
);

// Workloads export
router.get(
  "/workloads",
  requireRole(["admin", "dean", "department_head", "hr_director"]),
  ExportController.exportWorkloads
);

// Payments export
router.get(
  "/payments",
  requireRole(["admin", "finance", "vpaf", "hr_director"]),
  ExportController.exportPayments
);

// Users export
router.get(
  "/users",
  requireRole(["admin", "hr_director", "dean"]),
  ExportController.exportUsers
);

// Custom reports
router.get(
  "/reports/:type",
  requireRole([
    "admin",
    "dean",
    "department_head",
    "hr_director",
    "finance",
    "vpaa",
    "vpaf",
  ]),
  ExportController.generateReport
);

// NRP contracts export
router.get(
  "/nrp-contracts",
  requireRole([
    "admin",
    "cde_director",
    "hr_director",
    "dean",
    "department_head",
  ]),
  ExportController.exportNRPContracts
);

// Staff directory export
router.get(
  "/staff-directory",
  requireRole(["admin", "hr_director", "dean", "department_head"]),
  (req, res) => ExportController.exportUsers(req, res) // Reuse exportUsers
);

// Course catalog export
router.get(
  "/course-catalog",
  requireRole(["admin", "dean", "department_head", "registrar"]),
  ExportController.exportWorkloads // Reuse with different filters
);

// Financial report export
router.get(
  "/financial-report",
  requireRole(["admin", "finance", "vpaf", "vpaa"]),
  (req, res) =>
    ExportController.generateReport(req, {
      ...req,
      params: { type: "financial-summary" },
    })
);

// Overload report export
router.get(
  "/overload-report",
  requireRole(["admin", "hr_director", "dean", "department_head"]),
  (req, res) =>
    ExportController.generateReport(req, {
      ...req,
      params: { type: "workload-analysis" },
    })
);

export default router;
