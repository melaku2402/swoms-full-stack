// src/routes/staff.routes.js
import express from "express";
import StaffController from "../controllers/StaffController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All staff routes require authentication
router.use(auth);

// ===== PUBLIC STAFF ROUTES (for instructors to view their own data) =====

// Get my staff profile
router.get(
  "/me",
  requireRole(
    "instructor",
    "department_head",
    "dean",
    "cde_director",
    "hr_director",
    "vpaa",
    "vpaf"
  ),
  StaffController.getMyProfile


);

// Add to staff.routes.js
router.get("/me/profile-check", auth, StaffController.checkMyStaffProfile);
// Update my profile
router.put(
  "/me",
  requireRole(
    "instructor",
    "department_head",
    "dean",
    "cde_director",
    "hr_director",
    "vpaa",
    "vpaf"
  ),
  StaffController.updateMyProfile
);

// Get my workload summary
router.get(
  "/me/workload-summary",
  requireRole(
    "instructor",
    "department_head",
    "dean",
    "cde_director",
    "hr_director",
    "vpaa",
    "vpaf"
  ),
  StaffController.getStaffWorkloadSummary
);

// ===== ADMIN/MANAGEMENT ROUTES =====

// Get all staff with filters
router.get(
  "/",
  requireRole("admin", "registrar", "hr_director", "dean", "department_head"),
  StaffController.getAllStaff
);

// Search staff
router.get(
  "/search",
  requireRole("admin", "registrar", "hr_director", "dean", "department_head"),
  StaffController.searchStaff
);

// Get staff statistics
router.get(
  "/statistics",
  requireRole("admin", "hr_director", "dean"),
  StaffController.getStaffStatistics
);

// Create new staff (admin, registrar, HR only)
router.post(
  "/",
  requireRole("admin", "registrar", "hr_director"),
  StaffController.createStaff
);

// ===== SPECIFIC STAFF ROUTES =====

// Get staff by ID
router.get(
  "/:id",
  requireRole("admin", "registrar", "hr_director", "dean", "department_head"),
  StaffController.getStaffById
);

// Update staff
router.put(
  "/:id",
  requireRole("admin", "registrar", "hr_director"),
  StaffController.updateStaff
);

// Delete staff (soft delete)
router.delete(
  "/:id",
  requireRole("admin", "hr_director"),
  StaffController.deleteStaff
);

// Get staff by user ID
router.get(
  "/user/:userId",
  requireRole("admin", "registrar", "hr_director"),
  StaffController.getStaffByUserId
);

// Get staff by department
router.get(
  "/department/:departmentId",
  requireRole("admin", "registrar", "hr_director", "dean", "department_head"),
  StaffController.getStaffByDepartment
);

// Get staff workload summary
router.get(
  "/:id/workload-summary",
  requireRole("admin", "hr_director", "dean", "department_head"),
  StaffController.getStaffWorkloadSummary
);

// Update staff rank
router.put(
  "/:id/rank",
  requireRole("admin", "hr_director"),
  StaffController.updateStaffRank
);

// Assign staff to department
router.put(
  "/:id/assign-department",
  requireRole("admin", "hr_director", "dean"),
  StaffController.assignToDepartment
);

// Get staff by rank
router.get(  "/rank/:rank",
  requireRole("admin", "hr_director", "dean", "department_head"),
  StaffController.getStaffByRank
);

export default router;
