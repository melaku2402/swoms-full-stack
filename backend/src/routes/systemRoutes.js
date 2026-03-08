// src/routes/systemRoutes.js
import express from "express";
import SystemController from "../controllers/SystemController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/health", SystemController.getSystemHealth);

// Protected routes (authentication required)
router.use(auth);

// Dashboard statistics
router.get("/dashboard-stats", 
  requireRole(["admin", "dean", "department_head", "hr_director", "vpaa", "vpaf", "finance"]), 
  SystemController.getDashboardStats
);

// Recent activities
router.get("/recent-activities", 
  requireRole(["admin", "dean", "department_head", "hr_director"]), 
  SystemController.getRecentActivities
);

// Audit log
router.get("/audit-log", 
  requireRole(["admin"]), 
  SystemController.getAuditLog
);

// System metrics
router.get("/metrics", 
  requireRole(["admin"]), 
  SystemController.getSystemMetrics
);

// Database operations (admin only)
router.post("/backup", 
  requireRole(["admin"]), 
  SystemController.backupDatabase
);

router.post("/restore", 
  requireRole(["admin"]), 
  SystemController.restoreDatabase
);

// Cache operations
router.post("/clear-cache", 
  requireRole(["admin"]), 
  SystemController.clearCache
);

// Server status
router.get("/server-status", 
  requireRole(["admin", "dean", "hr_director"]), 
  SystemController.getServerStatus
);

// Database statistics
router.get("/database-stats", 
  requireRole(["admin"]), 
  SystemController.getDatabaseStats
);

// Download backup
router.get("/download-backup/:filename", 
  requireRole(["admin"]), 
  async (req, res) => {
    try {
      const { filename } = req.params;
      const backupPath = path.join(process.cwd(), "backups", filename);
      
      res.download(backupPath, filename, (err) => {
        if (err) {
          console.error("Download backup error:", err);
          res.status(500).json({ error: "Failed to download backup" });
        }
      });
    } catch (error) {
      console.error("Download backup error:", error);
      res.status(500).json({ error: "Failed to download backup" });
    }
  }
);

export default router;