import express from "express";
import RoleRegistrationController from "../controllers/RoleRegistrationController.js";
import { auth, requireRole } from "../middleware/auth.js";
import { ALL_ROLES } from "../config/constants.js"; // Import ALL_ROLES

const router = express.Router();

// All routes require authentication
router.use(auth);

// ===== ROLE-BASED USER CREATION =====

// Create user following Phase 1 hierarchy (Generic endpoint)
router.post(
  "/create",
  requireRole("admin", "vpaa", "dean", "hr_director"),
  RoleRegistrationController.createUserByRole
);

// Get users I have created
router.get(
  "/my-created-users",
  requireRole("admin", "vpaa", "dean", "hr_director"),
  RoleRegistrationController.getMyCreatedUsers
);

// Get users by specific role
router.get(
  "/role/:role",
  requireRole("admin", "vpaa", "hr_director", "dean", "department_head"),
  RoleRegistrationController.getUsersByRole
);

// ===== PERMISSIONS AND STATUS =====

// Get my role creation permissions
router.get("/permissions", auth, RoleRegistrationController.getMyPermissions);

// Get admin creatable roles
router.get(
  "/admin/creatable-roles",
  requireRole("admin"),
  RoleRegistrationController.getAdminCreatableRoles
);

// ===== SPECIFIC ROLE CREATION ENDPOINTS =====

// Admin creates ANY role (no restrictions)
router.post(
  "/admin/create-executives",
  requireRole("admin"),
  RoleRegistrationController.createUserByRole
);

// VPAA creates Deans and Registrar
router.post(
  "/vpaa/create-deans-registrar",
  requireRole("vpaa"),
  (req, res, next) => {
    req.body.role = req.body.role || "";
    if (!["dean", "registrar"].includes(req.body.role)) {
      return res.status(400).json({
        success: false,
        message: "VPAA can only create: dean, registrar",
      });
    }
    next();
  },
  RoleRegistrationController.createUserByRole
);

// Dean creates Department Heads
router.post(
  "/dean/create-department-heads",
  requireRole("dean"),
  (req, res, next) => {
    req.body.role = "department_head"; // Force role to department_head
    next();
  },
  RoleRegistrationController.createUserByRole
);

// HR Director creates Instructors
router.post(
  "/hr/create-instructors",
  requireRole("hr_director"),
  (req, res, next) => {
    req.body.role = "instructor"; // Force role to instructor
    next();
  },
  RoleRegistrationController.createUserByRole
);

export default router;
