// src/routes/course.routes.js
import express from "express";
import CourseController from "../controllers/CourseController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All course routes require authentication
router.use(auth);

// Get all courses
router.get(  "/",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.getAllCourses
);

// Search courses
router.get(  "/search",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.searchCourses
);

// Get course by ID
router.get(  "/:id",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.getCourseById
);

// Get courses by department
router.get(  "/department/:departmentId",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.getCoursesByDepartment
);

// Get courses by program
router.get(  "/program/:programId",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.getCoursesByProgram
);

// Get courses by program type
router.get(
  "/type/:type",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.getCoursesByProgramType
);

// Get course offerings
router.get(
  "/:id/offerings",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.getCourseOfferings
);

// Get course sections
router.get(
  "/:id/sections",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.getCourseSections
);

// Calculate course load
router.get(
  "/:id/calculate-load",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.calculateCourseLoad
);

// Get related courses
router.get(  "/:id/related",
  requireRole("admin", "dean", "department_head", "registrar", "instructor"),
  CourseController.getRelatedCourses
);

// Get course statistics
router.get("/statistics/overview",
  requireRole("admin", "dean", "department_head"),
  CourseController.getCourseStats
);

// Create course (admin and registrar only)
router.post(
  "/",
  requireRole("admin", "registrar"),
  CourseController.createCourse
);

// Update course (admin and registrar only)
router.put(
  "/:id",
  requireRole("admin", "registrar"),
  CourseController.updateCourse
);

// Delete course (admin only)
router.delete("/:id", requireRole("admin"), CourseController.deleteCourse);

export default router;
