

// src/routes/index.js - CLEANED VERSION
import express from "express";
import authRoutes from "./auth.routes.js";
import collegeRoutes from "./college.routes.js";
import departmentRoutes from "./department.routes.js";
import academicYearRoutes from "./academic-year.routes.js";
import semesterRoutes from "./semester.routes.js";
import staffRoutes from "./staff.routes.js";
import programRoutes from "./program.routes.js";
import courseRoutes from "./course.routes.js";
import sectionRoutes from "./section.routes.js";
import workloadRPRoutes from "./workload-rp.routes.js";
import workloadNRPRoutes from "./workload-nrp.routes.js";
import rulesRoutes from "./rules.routes.js";
import roleRegistrationRoutes from "./role-registration.routes.js";
import courseAssignmentRoutes from "./course-assignment.routes.js";
import courseRequestRoutes from "./course-request.routes.js";
import overloadDetectionRoutes from "./overload-detection.routes.js";
import exportRoutes from "./exportRoutes.js";
import systemRoutes from "./systemRoutes.js";
import programYearRoutes from "./programYear.routes.js";
import workloadReportRoutes from "./workload-report.routes.js";
const router = express.Router();

// API Documentation
router.get("/", (req, res) => {
  res.json({
    message: "SWOMS API v1.0",
    university: "Injibara University",
    endpoints: {
      auth: "/api/auth",
      colleges: "/api/colleges",
      departments: "/api/departments",
      academic_years: "/api/academic-years",
      semesters: "/api/semesters",
      staff: "/api/staff",
      programs: "/api/programs",
      courses: "/api/courses",
      sections: "/api/sections",
      workload: {
        regular: "/api/workload/rp",
        npr: "/api/workload/nrp",
      },
      rules: "/api/rules",
      role_registration: "/api/role-registration",
      course_assignments: "/api/course-assignments",
      course_requests: "/api/course-requests",
      overload_detection: "/api/overload-detection",
    },
  });
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/colleges", collegeRoutes);
router.use("/departments", departmentRoutes);
router.use("/academic-years", academicYearRoutes);
router.use("/semesters", semesterRoutes);
router.use("/staff", staffRoutes);
router.use("/programs", programRoutes);
router.use("/courses", courseRoutes);
router.use("/sections", sectionRoutes);
router.use("/workload-rp", workloadRPRoutes);
router.use("/workload-nrp", workloadNRPRoutes);
router.use("/rules", rulesRoutes);
router.use("/role-registration", roleRegistrationRoutes);
router.use("/course-assignments", courseAssignmentRoutes);
router.use("/course-requests", courseRequestRoutes);
router.use("/overload-detection", overloadDetectionRoutes);
// New routes
router.use("/export", exportRoutes);
router.use("/system", systemRoutes);
// Add to your main routes file
router.use("/program-years", programYearRoutes);
router.use("/workload-report", workloadReportRoutes);

export default router;
