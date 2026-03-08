import express from "express";
import OverloadDetectionController from "../controllers/OverloadDetectionController.js";
// import { authenticate, authorize } from "../middleware/auth.js";
import {
  auth as authenticate,
  requireRole as authorize,
} from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Instructor routes
router.get("/my", authorize("instructor"), OverloadDetectionController.checkMyOverload);

// Department Head routes
router.get("/department/:departmentId/:semesterId", authorize("department_head", "admin", "hr_director", "dean"), 
  OverloadDetectionController.checkDepartmentOverload);
router.get(
  "/alerts",
  authorize("department_head", "admin", "hr_director", "dean", "instructor"),
  OverloadDetectionController.getOverloadAlerts
);

// Admin/HR/Dean routes
router.get("/staff/:staffId/:semesterId", authorize("admin", "hr_director", "dean", "department_head"), 
  OverloadDetectionController.checkStaffOverload);
router.post("/predict/:staffId", authorize("admin", "hr_director", "dean", "department_head"), 
  OverloadDetectionController.predictOverloadTrend);
router.get("/report/:staffId/:semesterId", authorize("admin", "hr_director", "department_head"), 
  OverloadDetectionController.generateOverloadReport);

export default router;