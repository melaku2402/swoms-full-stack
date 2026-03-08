import express from "express";
import AuthController from "../controllers/AuthController.js";
import { auth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/login", AuthController.login);

// PROTECTED ROUTES (All authenticated users)
router.get("/profile", auth, AuthController.getProfile);
router.put("/profile", auth, AuthController.updateProfile);
router.put("/change-password", auth, AuthController.changePassword);
router.post("/logout", auth, AuthController.logout);

// USER MANAGEMENT ROUTES (Admin/Registrar/HR only)
router.post(
  "/users",
  auth,
  requireRole("admin", "registrar", "hr_director"),
  AuthController.createUser
);
router.get(
  "/users",
  auth,
  requireRole("admin", "registrar", "hr_director"),
  AuthController.getAllUsers
);


// router.get(
//   "/users/:id",
//   auth,
//   requireRole("admin", "registrar", "hr_director"),
//   AuthController.getUserById // Changed from inline function to controller method
// );

// router.get("/users/:id", auth, requireRole("admin", "registrar", "hr_director"), async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     console.log(`🔍 Fetching user with ID: ${id}`); // Debug log
    
//     // 1. Validate ID
//     const userId = parseInt(id);
//     if (isNaN(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID'
//       });
//     }

//     // 2. Get user from database
//     const [rows] = await query(
//       `SELECT user_id, username, email, role, is_active, 
//               last_login, created_at, updated_at, created_by
//        FROM users 
//        WHERE user_id = ?`,
//       [userId]
//     );
    
//     console.log(`📊 Database result:`, rows); // Debug log
    
//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     const user = rows[0];
    
//     // 3. Get staff profile if exists
//     let staffProfile = null;
//     try {
//       const [staffRows] = await query(
//         `SELECT * FROM staff_profiles WHERE user_id = ?`,
//         [userId]
//       );
//       staffProfile = staffRows[0] || null;
//     } catch (staffError) {
//       console.warn(`No staff profile for user ${userId}:`, staffError.message);
//     }

//     // 4. Return successful response
//     return res.json({
//       success: true,
//       data: {
//         ...user,
//         staff_profile: staffProfile
//       },
//       message: 'User retrieved successfully'
//     });
    
//   } catch (error) {
//     console.error('❌ Get user error:', error);
    
//     // Return more detailed error for debugging
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve user',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }});


  // src/routes/auth.js - Add this route
router.get(
  "/users/stats",
  auth,
  requireRole("admin", "registrar", "hr_director"),
  AuthController.getUserStats
);
router.put(
  "/users/:id",
  auth,
  requireRole("admin", "registrar", "hr_director"),
  AuthController.updateUser
);
router.put(
  "/users/:id/deactivate",
  auth,
  requireRole("admin", "hr_director"),
  AuthController.deactivateUser
);
router.put(
  "/users/:id/activate",
  auth,
  requireRole("admin", "hr_director"),
  AuthController.activateUser
);
router.put(
  "/users/:id/reset-password",
  auth,
  requireRole("admin"),
  AuthController.resetPassword
);
// src/routes/auth.js - Update the routes section
router.get(
  "/users/stats",
  auth,
  requireRole("admin", "registrar", "hr_director"),
  AuthController.getUserStats
);

router.get(
  "/users/:id",
  auth,
  requireRole("admin", "registrar", "hr_director"),
  AuthController.getUserById
);

// In src/routes/auth.js
// Add DELETE route
router.delete(
  "/users/:id",
  auth,
  requireRole("admin"),
  AuthController.deleteUser
);

// Update existing PUT route
router.put(
  "/users/:id",
  auth,
  requireRole("admin", "registrar", "hr_director"),
  AuthController.updateUser
);

// Add this route for bulk operations if needed
router.post(
  "/users/bulk-status",
  auth,
  requireRole("admin", "hr_director"),
  async (req, res) => {
    try {
      const { userIds, is_active } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "User IDs are required" 
        });
      }

      const placeholders = userIds.map(() => '?').join(',');
      await query(
        `UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id IN (${placeholders})`,
        [is_active ? 1 : 0, ...userIds]
      );

      return res.json({
        success: true,
        message: `Users ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error("Bulk status update error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to update users" 
      });
    }
  }
);
export default router;
