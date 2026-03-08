
// import express from "express";
// import RulesController from "../controllers/RulesController.js";
// import { auth, requireRole } from "../middleware/auth.js";

// const router = express.Router();

// // All routes require authentication
// router.use(auth);

// // ==================== CRUD ROUTES ====================
// // Get all rules (Admin, Finance, HR, Dean, Department Head)
// router.get(
//   "/",
//   requireRole("admin", "finance", "hr_director", "dean", "department_head"),
//   RulesController.getAllRules
// );

// // Get rule by ID
// router.get(
//   "/:id",
//   requireRole("admin", "finance", "hr_director", "dean", "department_head"),
//   RulesController.getRuleById
// );

// // Create rule (Admin and Finance only)
// router.post("/", requireRole("admin", "finance"), RulesController.createRule);

// // Update rule (Admin and Finance only)
// router.put("/:id", requireRole("admin", "finance"), RulesController.updateRule);

// // Delete rule (Admin only)
// router.delete("/:id", requireRole("admin"), RulesController.deleteRule);

// // Activate rule
// router.post(
//   "/:id/activate",
//   requireRole("admin", "finance"),
//   RulesController.activateRule
// );

// // Deactivate rule
// router.post(
//   "/:id/deactivate",
//   requireRole("admin", "finance"),
//   RulesController.deactivateRule
// );

// // ==================== BUSINESS LOGIC ROUTES ====================
// // Evaluate rule (All authenticated users)
// router.post("/evaluate", auth, RulesController.evaluateRule);

// // Calculate load
// router.post("/calculate-load", auth, RulesController.calculateLoad);

// // Validate rank load
// router.post("/validate-rank-load", auth, RulesController.validateRankLoad);

// // Calculate NRP payment
// router.post(
//   "/calculate-nrp-payment",
//   auth,
//   RulesController.calculateNRPPayment
// );

// // Calculate overload payment
// router.post(
//   "/calculate-overload-payment",
//   auth,
//   RulesController.calculateOverloadPayment
// );

// // Get correction rates
// router.get("/correction-rates", auth, RulesController.getCorrectionRates);

// // Apply summer distribution
// router.post(
//   "/apply-summer-distribution",
//   requireRole("admin", "finance", "cde_director"),
//   RulesController.applySummerDistribution
// );

// // ==================== QUERY ROUTES ====================
// // Get rule by name
// router.get("/name/:name", auth, RulesController.getRuleByName);

// // Get rules by type
// router.get("/type/:type", auth, RulesController.getRulesByType);

// // Get rule history
// router.get(
//   "/history/:name",
//   requireRole("admin", "finance", "hr_director", "dean"),
//   RulesController.getRuleHistory
// );

// // Get rank load limits
// router.get("/rank-limits/:rank", auth, RulesController.getRankLoadLimits);

// // Get all rank load limits
// router.get("/rank-limits", auth, RulesController.getAllRankLoadLimits);

// // Get load factors
// router.get("/load-factors", auth, RulesController.getLoadFactors);

// // Get payment rates
// router.get(
//   "/payment-rates/:program_type",
//   auth,
//   RulesController.getPaymentRates
// );

// // Get summer distribution
// router.get("/summer-distribution", auth, RulesController.getSummerDistribution);

// // ==================== UTILITY ROUTES ====================
// // Validate workload
// router.post("/validate-workload", auth, RulesController.validateWorkload);

// // Bulk update rules
// router.post(
//   "/bulk-update",
//   requireRole("admin", "finance"),
//   RulesController.bulkUpdateRules
// );

// // Get rules dashboard
// router.get(
//   "/dashboard/summary",
//   requireRole("admin", "finance", "hr_director", "dean"),
//   RulesController.getRulesDashboard
// );

// // Get active rate tables
// router.get("/rate-tables/active", auth, RulesController.getActiveRateTables);

// // Get active tax rules
// router.get("/tax-rules/active", auth, RulesController.getActiveTaxRules);

// // Clear cache (Admin only)
// router.post("/cache/clear", requireRole("admin"), RulesController.clearCache);

// export default router;

// routes/rules.js - Fix permissions
import express from "express";
import RulesController from "../controllers/RulesController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ==================== ALL ROUTES REQUIRE AUTHENTICATION ====================
router.use(auth); // Apply auth middleware to all routes

// ==================== PUBLIC ROUTES (All authenticated users) ====================
// Get all rank load limits - Make this available to all authenticated users
router.get("/rank-limits", RulesController.getAllRankLoadLimits);

// Get rank load limits by rank - Available to all authenticated users
router.get("/rank-limits/:rank", RulesController.getRankLoadLimits);

// Evaluate rule (All authenticated users)
router.post("/evaluate", RulesController.evaluateRule);

// Calculate load (All authenticated users)
router.post("/calculate-load", RulesController.calculateLoad);

// Validate rank load (All authenticated users)
router.post("/validate-rank-load", RulesController.validateRankLoad);

// Calculate NRP payment (All authenticated users)
router.post("/calculate-nrp-payment", RulesController.calculateNRPPayment);

// Calculate overload payment (All authenticated users)
router.post("/calculate-overload-payment", RulesController.calculateOverloadPayment);

// Get correction rates (All authenticated users)
router.get("/correction-rates", RulesController.getCorrectionRates);

// Get load factors (All authenticated users)
router.get("/load-factors", RulesController.getLoadFactors);

// Get payment rates (All authenticated users)
router.get("/payment-rates/:program_type", RulesController.getPaymentRates);

// Get summer distribution (All authenticated users)
router.get("/summer-distribution", RulesController.getSummerDistribution);

// Get rule by name (All authenticated users)
router.get("/name/:name", RulesController.getRuleByName);

// Get rules by type (All authenticated users)
router.get("/type/:type", RulesController.getRulesByType);

// Validate workload (All authenticated users)
router.post("/validate-workload", RulesController.validateWorkload);

// ==================== ADMIN/MANAGEMENT ROUTES ====================
// Get all rules (Admin, Finance, HR, Dean, Department Head)
router.get(
  "/",
  requireRole("admin", "finance", "hr_director", "dean", "department_head"),
  RulesController.getAllRules
);

// Get rule by ID
router.get(
  "/:id",
  requireRole("admin", "finance", "hr_director", "dean", "department_head"),
  RulesController.getRuleById
);

// Create rule (Admin and Finance only)
router.post("/", requireRole("admin", "finance"), RulesController.createRule);

// Update rule (Admin and Finance only)
router.put("/:id", requireRole("admin", "finance"), RulesController.updateRule);

// Delete rule (Admin only)
router.delete("/:id", requireRole("admin"), RulesController.deleteRule);

// Activate rule (Admin and Finance only)
router.post(
  "/:id/activate",
  requireRole("admin", "finance"),
  RulesController.activateRule
);

// Deactivate rule (Admin and Finance only)
router.post(
  "/:id/deactivate",
  requireRole("admin", "finance"),
  RulesController.deactivateRule
);

// Apply summer distribution (Admin, Finance, CDE Director only)
router.post(
  "/apply-summer-distribution",
  requireRole("admin", "finance", "cde_director"),
  RulesController.applySummerDistribution
);

// Get rule history (Admin, Finance, HR, Dean only)
router.get(
  "/history/:name",
  requireRole("admin", "finance", "hr_director", "dean"),
  RulesController.getRuleHistory
);

// Bulk update rules (Admin and Finance only)
router.post(
  "/bulk-update",
  requireRole("admin", "finance"),
  RulesController.bulkUpdateRules
);

// Get rules dashboard (Admin, Finance, HR, Dean only)
router.get(
  "/dashboard/summary",
  requireRole("admin", "finance", "hr_director", "dean"),
  RulesController.getRulesDashboard
);

// Get active rate tables (All authenticated users with specific roles)
router.get(
  "/rate-tables/active",
  requireRole("admin", "finance", "hr_director", "dean", "department_head"),
  RulesController.getActiveRateTables
);

// Get active tax rules (All authenticated users with specific roles)
router.get(
  "/tax-rules/active",
  requireRole("admin", "finance", "hr_director", "dean", "department_head"),
  RulesController.getActiveTaxRules
);

// Clear cache (Admin only)
router.post("/cache/clear", requireRole("admin"), RulesController.clearCache);

export default router;