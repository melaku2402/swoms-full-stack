// src/utils/auditLogger.js
import { query } from "../config/database.js";

class AuditLogger {
  // Log user action
  static async logAction(
    userId,
    action,
    entity,
    entityId = null,
    details = null
  ) {
    try {
      await query(
        `INSERT INTO audit_log (user_id, action, entity, entity_id, new_value, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          action,
          entity,
          entityId,
          JSON.stringify(details),
          this.getClientIP(),
        ]
      );
    } catch (error) {
      console.error("Audit log error:", error);
    }
  }

  // Log create action
  static async logCreate(userId, entity, entityId, data) {
    return this.logAction(userId, "CREATE", entity, entityId, { data });
  }

  // Log update action
  static async logUpdate(userId, entity, entityId, oldData, newData) {
    return this.logAction(userId, "UPDATE", entity, entityId, {
      old: oldData,
      new: newData,
    });
  }

  // Log delete action
  static async logDelete(userId, entity, entityId, data) {
    return this.logAction(userId, "DELETE", entity, entityId, { data });
  }

  // Get client IP (simplified)
  static getClientIP() {
    // In real app, get from request headers
    return "127.0.0.1";
  }
}

// export default AuditLogger;
// Step 7: Update server.js to include audit logger
// javascript
// // server.js - Add this after imports
// import AuditLogger from "./src/utils/auditLogger.js";

// // Add to startServer function after initializing database
// app.locals.auditLogger = AuditLogger;