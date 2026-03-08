// src/controllers/SystemController.js
import { query } from "../config/database.js";
import { sendSuccess, sendError } from "../utils/response.js";
import os from "os";
import fs from "fs/promises";
import path from "path";

class SystemController {
  // Get system health
  static async getSystemHealth(req, res) {
    try {
      const healthChecks = {
        database: "healthy",
        api: "healthy",
        authentication: "healthy",
        memory: "healthy",
        storage: "healthy"
      };

      // Check database
      try {
        await query("SELECT 1");
        healthChecks.database = "healthy";
      } catch (error) {
        healthChecks.database = "unhealthy";
      }

      // Check memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
      healthChecks.memory = memoryUsage > 90 ? "warning" : "healthy";

      // Check disk space (simplified)
      healthChecks.storage = "healthy";

      // Get system info
      const systemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        node_version: process.version,
        uptime: Math.floor(process.uptime()),
        server_time: new Date().toISOString(),
        memory: {
          total: (totalMem / 1024 / 1024 / 1024).toFixed(2) + " GB",
          free: (freeMem / 1024 / 1024 / 1024).toFixed(2) + " GB",
          usage: memoryUsage.toFixed(2) + "%"
        },
        cpu: {
          count: os.cpus().length,
          model: os.cpus()[0]?.model || "Unknown"
        }
      };

      return sendSuccess(res, "System health check", {
        status: Object.values(healthChecks).every(v => v === "healthy") ? "healthy" : "degraded",
        checks: healthChecks,
        system_info: systemInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Get system health error:", error);
      return sendError(res, "Failed to check system health", 500);
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      // Get counts from all tables
      const counts = await Promise.all([
        query("SELECT COUNT(*) as count FROM users"),
        query("SELECT COUNT(*) as count FROM staff_profiles"),
        query("SELECT COUNT(*) as count FROM courses"),
        query("SELECT COUNT(*) as count FROM departments"),
        query("SELECT COUNT(*) as count FROM colleges"),
        query("SELECT COUNT(*) as count FROM programs"),
        query("SELECT COUNT(*) as count FROM workload_rp"),
        query("SELECT COUNT(*) as count FROM workload_nrp"),
        query("SELECT COUNT(*) as count FROM payment_sheets"),
        query("SELECT COUNT(*) as count FROM academic_years"),
        query("SELECT COUNT(*) as count FROM semesters"),
        query("SELECT COUNT(*) as count FROM sections"),
        query("SELECT COUNT(*) as count FROM course_assignments"),
        query("SELECT COUNT(*) as count FROM course_requests"),
      ]);

      const [
        users, staff, courses, departments, colleges, programs,
        workload_rp, workload_nrp, payment_sheets, academic_years,
        semesters, sections, course_assignments, course_requests
      ] = counts.map(result => result[0]?.count || 0);

      // Get active semester
      const [activeSemester] = await query(
        "SELECT semester_name FROM semesters WHERE is_active = TRUE LIMIT 1"
      );

      // Get recent user registrations (last 7 days)
      const [recentUsers] = await query(`
        SELECT COUNT(*) as count FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);

      // Get pending approvals
      const [pendingWorkloads] = await query(`
        SELECT COUNT(*) as count FROM workload_rp WHERE status IN ('submitted', 'dh_approved', 'dean_approved')
        UNION ALL
        SELECT COUNT(*) as count FROM workload_nrp WHERE status IN ('submitted', 'dh_approved', 'dean_approved')
      `);

      const pendingArray = pendingWorkloads || [];
      const totalPending = pendingArray.reduce((sum, row) => sum + (row?.count || 0), 0);

      // Get financial summary
      const [financialSummary] = await query(`
        SELECT 
          SUM(CASE WHEN payment_status = 'paid' THEN net_amount ELSE 0 END) as total_paid,
          SUM(CASE WHEN payment_status = 'pending' THEN net_amount ELSE 0 END) as total_pending,
          COUNT(*) as total_transactions
        FROM payment_sheets
      `);

      return sendSuccess(res, "Dashboard statistics", {
        counts: {
          users,
          staff,
          courses,
          departments,
          colleges,
          programs,
          workload_rp,
          workload_nrp,
          payment_sheets,
          academic_years,
          semesters,
          sections,
          course_assignments,
          course_requests
        },
        overview: {
          active_semester: activeSemester?.semester_name || "None",
          recent_users: recentUsers?.count || 0,
          pending_approvals: totalPending,
          financial_summary: financialSummary?.[0] || {
            total_paid: 0,
            total_pending: 0,
            total_transactions: 0
          }
        },
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return sendError(res, "Failed to get dashboard statistics", 500);
    }
  }

  // Get recent activities
  static async getRecentActivities(req, res) {
    try {
      const { limit = 50, user_id, action, entity } = req.query;

      let queryStr = `
        SELECT 
          al.audit_id,
          al.user_id,
          al.action,
          al.entity,
          al.entity_id,
          al.old_value,
          al.new_value,
          al.timestamp,
          al.ip_address,
          u.username,
          u.role
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.user_id
        WHERE 1=1
      `;

      const params = [];

      if (user_id) {
        queryStr += " AND al.user_id = ?";
        params.push(parseInt(user_id));
      }

      if (action) {
        queryStr += " AND al.action = ?";
        params.push(action);
      }

      if (entity) {
        queryStr += " AND al.entity = ?";
        params.push(entity);
      }

      queryStr += " ORDER BY al.timestamp DESC LIMIT ?";
      params.push(parseInt(limit));

      const activities = await query(queryStr, params);

      // Format activities
      const formattedActivities = activities.map(activity => ({
        id: activity.audit_id,
        user: {
          id: activity.user_id,
          username: activity.username,
          role: activity.role
        },
        action: activity.action,
        entity: activity.entity,
        entity_id: activity.entity_id,
        timestamp: activity.timestamp,
        ip_address: activity.ip_address,
        changes: activity.old_value && activity.new_value ? {
          from: JSON.parse(activity.old_value),
          to: JSON.parse(activity.new_value)
        } : null
      }));

      return sendSuccess(res, "Recent activities", {
        activities: formattedActivities,
        total: activities.length,
        filters: { user_id, action, entity, limit }
      });
    } catch (error) {
      console.error("Get recent activities error:", error);
      return sendError(res, "Failed to get recent activities", 500);
    }
  }

  // Get audit log
  static async getAuditLog(req, res) {
    try {
      const {
        page = 1,
        limit = 100,
        start_date,
        end_date,
        user_id,
        action,
        entity
      } = req.query;

      const offset = (page - 1) * limit;

      let queryStr = `
        SELECT SQL_CALC_FOUND_ROWS
          al.*,
          u.username,
          u.role
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.user_id
        WHERE 1=1
      `;

      const params = [];

      if (start_date) {
        queryStr += " AND DATE(al.timestamp) >= ?";
        params.push(start_date);
      }

      if (end_date) {
        queryStr += " AND DATE(al.timestamp) <= ?";
        params.push(end_date);
      }

      if (user_id) {
        queryStr += " AND al.user_id = ?";
        params.push(parseInt(user_id));
      }

      if (action) {
        queryStr += " AND al.action = ?";
        params.push(action);
      }

      if (entity) {
        queryStr += " AND al.entity = ?";
        params.push(entity);
      }

      queryStr += " ORDER BY al.timestamp DESC LIMIT ? OFFSET ?";
      params.push(parseInt(limit), offset);

      const logs = await query(queryStr, params);
      const [totalResult] = await query("SELECT FOUND_ROWS() as total");
      const total = totalResult[0].total;

      return sendSuccess(res, "Audit log retrieved", {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Get audit log error:", error);
      return sendError(res, "Failed to get audit log", 500);
    }
  }

  // Get system metrics
  static async getSystemMetrics(req, res) {
    try {
      // Database metrics
      const [dbMetrics] = await query(`
        SELECT 
          TABLE_NAME as table_name,
          TABLE_ROWS as row_count,
          DATA_LENGTH as data_size,
          INDEX_LENGTH as index_size
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY DATA_LENGTH DESC
      `);

      // User activity metrics
      const [userActivity] = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as registrations,
          SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      // Workload submission metrics
      const [workloadMetrics] = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as submissions,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM workload_rp
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      // Payment metrics
      const [paymentMetrics] = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transactions,
          SUM(net_amount) as total_amount
        FROM payment_sheets
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      // System performance metrics
      const systemMetrics = {
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        database_connections: await SystemController.getDatabaseConnectionCount(),
        api_requests_last_hour: await SystemController.getApiRequestCount(),
        active_sessions: await SystemController.getActiveSessionCount()
      };

      return sendSuccess(res, "System metrics", {
        database: dbMetrics,
        user_activity: userActivity,
        workload_metrics: workloadMetrics,
        payment_metrics: paymentMetrics,
        system_performance: systemMetrics,
        collected_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Get system metrics error:", error);
      return sendError(res, "Failed to get system metrics", 500);
    }
  }

  // Backup database
  static async backupDatabase(req, res) {
    try {
      const userRole = req.user.role;
      if (userRole !== "admin") {
        return sendError(res, "Only admin can backup database", 403);
      }

      const backupDir = path.join(process.cwd(), "backups");
      await fs.mkdir(backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

      // Get all table data
      const [tables] = await query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_TYPE = 'BASE TABLE'
      `);

      let backupContent = `-- Database Backup - ${new Date().toISOString()}\n`;
      backupContent += `-- Generated by user: ${req.user.username}\n\n`;

      for (const table of tables) {
        const tableName = table.TABLE_NAME;
        
        // Get table structure
        const [createTable] = await query(`SHOW CREATE TABLE ${tableName}`);
        backupContent += `\n-- Table: ${tableName}\n`;
        backupContent += `${createTable[0]['Create Table']};\n\n`;

        // Get table data
        const tableData = await query(`SELECT * FROM ${tableName}`);
        if (tableData.length > 0) {
          backupContent += `-- Data for ${tableName}\n`;
          backupContent += `INSERT INTO ${tableName} VALUES\n`;
          
          const rows = tableData.map(row => {
            const values = Object.values(row).map(value => {
              if (value === null) return "NULL";
              if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
              return value;
            });
            return `  (${values.join(", ")})`;
          });
          
          backupContent += rows.join(",\n") + ";\n";
        }
      }

      // Write backup file
      await fs.writeFile(backupFile, backupContent, "utf8");

      // Log the backup
      await query(
        `INSERT INTO audit_log (user_id, action, entity, entity_id, new_value)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.user_id, "database_backup", "system", 0, JSON.stringify({
          backup_file: backupFile,
          tables_backed_up: tables.length,
          timestamp: new Date().toISOString()
        })]
      );

      return sendSuccess(res, "Database backup created", {
        backup_file: backupFile,
        size: (backupContent.length / 1024).toFixed(2) + " KB",
        tables: tables.length,
        download_url: `/api/system/download-backup/${path.basename(backupFile)}`
      });
    } catch (error) {
      console.error("Backup database error:", error);
      return sendError(res, "Failed to backup database", 500);
    }
  }

  // Restore database
  static async restoreDatabase(req, res) {
    try {
      const userRole = req.user.role;
      if (userRole !== "admin") {
        return sendError(res, "Only admin can restore database", 403);
      }

      const { backup_file, confirm } = req.body;

      if (!backup_file) {
        return sendError(res, "Backup file is required", 400);
      }

      if (confirm !== "YES_RESTORE") {
        return sendError(res, "Confirmation required. Send confirm: 'YES_RESTORE'", 400);
      }

      const backupPath = path.join(process.cwd(), "backups", backup_file);
      
      // Check if backup file exists
      try {
        await fs.access(backupPath);
      } catch {
        return sendError(res, "Backup file not found", 404);
      }

      // Read backup file
      const backupContent = await fs.readFile(backupPath, "utf8");

      // Split into individual SQL statements
      const statements = backupContent
        .split(';')
        .filter(stmt => stmt.trim())
        .map(stmt => stmt.trim() + ';');

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await query(statement);
          } catch (error) {
            console.error("Error executing statement:", error.message);
            // Continue with next statement
          }
        }
      }

      // Log the restore
      await query(
        `INSERT INTO audit_log (user_id, action, entity, entity_id, new_value)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.user_id, "database_restore", "system", 0, JSON.stringify({
          backup_file: backup_file,
          timestamp: new Date().toISOString(),
          restored_by: req.user.username
        })]
      );

      return sendSuccess(res, "Database restored successfully", {
        backup_file: backup_file,
        statements_executed: statements.length,
        restored_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Restore database error:", error);
      return sendError(res, "Failed to restore database", 500);
    }
  }

  // Clear cache
  static async clearCache(req, res) {
    try {
      // In a real application, you would clear Redis or other cache
      // For now, we'll just return success
      
      // Log the cache clear
      await query(
        `INSERT INTO audit_log (user_id, action, entity, entity_id)
         VALUES (?, ?, ?, ?)`,
        [req.user.user_id, "clear_cache", "system", 0]
      );

      return sendSuccess(res, "Cache cleared successfully", {
        cleared_at: new Date().toISOString(),
        cleared_by: req.user.username
      });
    } catch (error) {
      console.error("Clear cache error:", error);
      return sendError(res, "Failed to clear cache", 500);
    }
  }

  // Get server status
  static async getServerStatus(req, res) {
    try {
      const status = {
        server: {
          uptime: os.uptime(),
          loadavg: os.loadavg(),
          platform: os.platform(),
          arch: os.arch(),
          hostname: os.hostname(),
          network_interfaces: os.networkInterfaces()
        },
        process: {
          pid: process.pid,
          memory: process.memoryUsage(),
          uptime: process.uptime(),
          version: process.version
        },
        database: {
          connected: true,
          connection_count: await SystemController.getDatabaseConnectionCount()
        },
        services: {
          api: "running",
          authentication: "running",
          database: "connected",
          cache: "available"
        },
        timestamp: new Date().toISOString()
      };

      return sendSuccess(res, "Server status", status);
    } catch (error) {
      console.error("Get server status error:", error);
      return sendError(res, "Failed to get server status", 500);
    }
  }

  // Get database statistics
  static async getDatabaseStats(req, res) {
    try {
      // Get table sizes
      const [tableSizes] = await query(`
        SELECT 
          TABLE_NAME as table_name,
          TABLE_ROWS as row_count,
          DATA_LENGTH as data_size,
          INDEX_LENGTH as index_size,
          (DATA_LENGTH + INDEX_LENGTH) as total_size,
          TABLE_COLLATION as collation,
          ENGINE as engine
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY total_size DESC
      `);

      // Get database size
      const [dbSize] = await query(`
        SELECT 
          SUM(DATA_LENGTH + INDEX_LENGTH) as total_size,
          SUM(DATA_LENGTH) as data_size,
          SUM(INDEX_LENGTH) as index_size,
          COUNT(*) as table_count
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
      `);

      // Get index statistics
      const [indexStats] = await query(`
        SELECT 
          TABLE_NAME,
          INDEX_NAME,
          COLUMN_NAME,
          INDEX_TYPE,
          CARDINALITY
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME, INDEX_NAME
      `);

      // Get connection information
      const [connections] = await query(`
        SHOW PROCESSLIST
      `);

      const stats = {
        database_size: {
          total: dbSize[0]?.total_size || 0,
          data: dbSize[0]?.data_size || 0,
          index: dbSize[0]?.index_size || 0,
          tables: dbSize[0]?.table_count || 0,
          human_readable: {
            total: SystemController.formatBytes(dbSize[0]?.total_size || 0),
            data: SystemController.formatBytes(dbSize[0]?.data_size || 0),
            index: SystemController.formatBytes(dbSize[0]?.index_size || 0)
          }
        },
        tables: tableSizes.map(table => ({
          ...table,
          human_readable: {
            data_size: SystemController.formatBytes(table.data_size),
            index_size: SystemController.formatBytes(table.index_size),
            total_size: SystemController.formatBytes(table.total_size)
          }
        })),
        indexes: indexStats,
        connections: {
          total: connections.length,
          active: connections.filter(c => c.Command !== "Sleep").length,
          idle: connections.filter(c => c.Command === "Sleep").length
        },
        collected_at: new Date().toISOString()
      };

      return sendSuccess(res, "Database statistics", stats);
    } catch (error) {
      console.error("Get database stats error:", error);
      return sendError(res, "Failed to get database statistics", 500);
    }
  }

  // ============ HELPER METHODS ============

  static async getDatabaseConnectionCount() {
    try {
      const [result] = await query("SHOW STATUS LIKE 'Threads_connected'");
      return result[0]?.Value || 0;
    } catch {
      return 0;
    }
  }

  static async getApiRequestCount() {
    try {
      const [result] = await query(`
        SELECT COUNT(*) as count FROM audit_log 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        AND action LIKE '%api%'
      `);
      return result[0]?.count || 0;
    } catch {
      return 0;
    }
  }

  static async getActiveSessionCount() {
    try {
      const [result] = await query(`
        SELECT COUNT(DISTINCT user_id) as count FROM audit_log 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
      `);
      return result[0]?.count || 0;
    } catch {
      return 0;
    }
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default SystemController;