import express from "express";
import CourseRequestController from "../controllers/CourseRequestController.js";
import {
  auth as authenticate,
  requireRole as authorize,
} from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Instructor routes
router.post(
  "/",
  authorize("instructor"),
  CourseRequestController.createRequest
);
router.get(
  "/my",
  authorize("instructor"),
  CourseRequestController.getMyRequests
);
router.get(
  "/available",
  authorize("instructor"),
  CourseRequestController.getAvailableCourses
);
router.put(
  "/:id/cancel",
  authorize("instructor"),
  CourseRequestController.cancelRequest
);

// Department Head routes
router.get(
  "/department",
  authorize("department_head"),
  CourseRequestController.getDepartmentRequests
);
router.get(
  "/pending",
  authorize("department_head"),
  CourseRequestController.getPendingRequests
);
router.put(
  "/:id/approve",
  authorize("department_head"),
  CourseRequestController.approveRequest
);
router.put(
  "/:id/reject",
  authorize("department_head"),
  CourseRequestController.rejectRequest
);
router.get(
  "/stats",
  authorize("department_head", "admin"),
  CourseRequestController.getRequestStats
);

// Common routes
router.get(
  "/:id",
  authorize("admin", "department_head", "instructor"),
  CourseRequestController.getRequestById
);

export default router;
