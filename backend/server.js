
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import env from "./src/config/env.js";
import {
  initializeDatabase,
  testConnection,
  getDatabaseStats,
  isDatabaseInitialized,
  getConnection, // Add this import
} from "./src/config/database.js";
import routes from "./src/routes/index.js";
import errorHandler from "./src/middleware/errorHandler.js";
import CourseController from "./src/controllers/CourseController.js";
import { auth, requireRole } from "./src/middleware/auth.js";
import { ROLES } from "./src/config/constants.js";
import { insertExactData } from "./src/config/database.js";
import insertTestData from "./src/config/AllData.js";

const app = express();
const PORT = env.PORT;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api", routes);
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "SWOMS Backend",
    university: env.UNIVERSITY_NAME,
    version: "1.0.0",
  });
});


// Database status endpoint
app.get("/api/db/status", async (req, res) => {
  try {
    const isInitialized = await isDatabaseInitialized();
    const stats = await getDatabaseStats();

    res.json({
      success: true,
      database: env.DB_NAME,
      host: env.DB_HOST,
      port: env.DB_PORT,
      initialized: isInitialized,
      stats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking database status",
      error: error.message,
    });
  }
});

// Database backup endpoint (admin only)
app.get("/api/db/backup", async (req, res) => {
  try {
    // In production, add authentication here
    const backup = await backupDatabase();

    res.setHeader("Content-Type", "application/sql");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${backup.filename}"`
    );
    res.send(backup.sql);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Backup failed",
      error: error.message,
    });
  }
});

// // Database reset endpoint (protected - for development only)
app.post("/api/db/reset", async (req, res) => {
  try {
    // In production, remove this endpoint or add strong authentication
    if (env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Reset not allowed in production",
      });
    }

    await resetDatabase();

    res.json({
      success: true,
      message: "Database reset completed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Reset failed",
      error: error.message,
    });
  }
});



// Add these routes ABOVE the error handler in server.js
// ================= COURSE ROUTES =================
app.get("/api/courses", auth, CourseController.getAllCourses);
app.get("/api/courses/search", auth, CourseController.searchCourses);
app.get("/api/courses/stats", auth, CourseController.getCourseStats);
app.get("/api/courses/:id", auth, CourseController.getCourseById);
app.get("/api/courses/:id/offerings", auth, CourseController.getCourseOfferings);
app.get("/api/courses/:id/sections", auth, CourseController.getCourseSections);
app.get("/api/courses/:id/related", auth, CourseController.getRelatedCourses);
app.get("/api/courses/:id/calculate-load", auth, CourseController.calculateCourseLoad);
app.get("/api/courses/department/:departmentId", auth, CourseController.getCoursesByDepartment);
app.get("/api/courses/program/:programId", auth, CourseController.getCoursesByProgram);
app.get("/api/courses/program-type/:type", auth, CourseController.getCoursesByProgramType);

// Admin/Registrar/Department Head only routes
app.post("/api/courses", auth, requireRole(ROLES.ADMIN, ROLES.REGISTRAR, ROLES.DEPARTMENT_HEAD), CourseController.createCourse);
app.put("/api/courses/:id", auth, requireRole(ROLES.ADMIN, ROLES.REGISTRAR, ROLES.DEPARTMENT_HEAD), CourseController.updateCourse);
app.delete("/api/courses/:id", auth, requireRole(ROLES.ADMIN, ROLES.REGISTRAR, ROLES.DEPARTMENT_HEAD), CourseController.deleteCourse);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
// Start server
const startServer = async () => {
  try {
    console.log("🚀 Starting SWOMS Server...");
    console.log(`📚 University: ${env.UNIVERSITY_NAME}`);
    console.log(`🌐 Environment: ${env.NODE_ENV}`);

    // Initialize database
    console.log("\n📦 Initializing database...");
    await initializeDatabase();
    
    console.log("\n🔗 Testing database connection...");
    const connectionTest = await testConnection();
    if (!connectionTest) {
      throw new Error("Database connection test failed");
    }

    // Insert test data
    console.log("\n📝 Inserting test data...");
    try {
      const connection = await getConnection();
      await insertTestData(connection);
      connection.release();
      console.log("✅ Test data inserted successfully!");
    } catch (testDataError) {
      console.warn("⚠️ Could not insert test data:", testDataError.message);
      console.log("Continuing without test data...");
    }

    // Get database stats
    const stats = await getDatabaseStats();
    console.log("\n📊 Database Statistics:");
    console.log(`   Tables: ${Object.keys(stats).length} tables`);
    console.log(`   Users: ${stats.users || 0} users`);
    console.log(`   Colleges: ${stats.colleges || 0} colleges`);
    console.log(`   Departments: ${stats.departments || 0} departments`);
    console.log(`   Staff: ${stats.staff_profiles || 0} staff profiles`);
    console.log(`   Courses: ${stats.courses || 0} courses`);

    app.listen(PORT, () => {
      console.log("\n🎉 Server Started Successfully!");
      console.log(`========================================`);
      console.log(`🔗 Server URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
      console.log(`💾 Database: ${env.DB_NAME}@${env.DB_HOST}:${env.DB_PORT}`);
      console.log(`\n🔐 Default Login Credentials:`);
      console.log(`   Admin: admin / admin123`);
      console.log(`   Registrar: registrar / registrar123`);
      console.log(`   HR: hr_director / hr123`);
      console.log(`   Finance: finance / finance123`);
      console.log(`\n⚠️  Warning: Change default passwords immediately!`);
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error("\n❌ Failed to start server:", error.message);
    console.error("💡 Check your database connection and .env file");
    process.exit(1);
  }
};

startServer();




//.........................................................................................................