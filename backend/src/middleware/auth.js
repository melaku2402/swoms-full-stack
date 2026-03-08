import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";
import { query } from "../config/database.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Check if user exists and is active
    const users = await query(
      "SELECT user_id, username, email, role, is_active FROM users WHERE user_id = ?",
      [decoded.user_id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return sendError(res, "User not found or inactive.", 401);
    }

    req.user = users[0];
    req.token = token;
    next();
  } catch (error) {
    return sendError(res, "Invalid token.", 401);
  }
};

// Role-based middleware
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("Checking role access:");
    console.log("  User role:", req.user?.role);
    console.log("  Allowed roles:", allowedRoles);
    console.log("  Path:", req.path);
    console.log("  Method:", req.method);

    if (!req.user) {
      return sendError(res, "Authentication required.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log("  ❌ Access denied for role:", req.user.role);
      return sendError(res, "Access denied. Insufficient permissions.", 403);
    }

    console.log("  ✅ Access granted");
    next();
  };
};