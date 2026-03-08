// ============================================
// FILE: src/routes/payment.routes.js
// ============================================
import express from "express";
import PaymentController from "../controllers/PaymentController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All payment routes require authentication
router.use(auth);

// Get all payment sheets
router.get(
  "/sheets",
  requireRole("admin", "finance", "cde_director", "vpaf", "hr_director"),
  PaymentController.getAllPaymentSheets
);

// Get payment sheet by ID
router.get(
  "/sheets/:id",
  requireRole(
    "admin",
    "finance",
    "cde_director",
    "vpaf",
    "hr_director",
    "instructor"
  ),
  PaymentController.getPaymentSheetById
);

// Update payment status
router.put(
  "/sheets/:id/status",
  requireRole("admin", "finance"),
  PaymentController.updatePaymentStatus
);

// Export payment sheet
router.get(
  "/sheets/:id/export",
  requireRole("admin", "finance", "cde_director"),
  PaymentController.exportPaymentSheet
);

// Get payment statistics
router.get(
  "/statistics",
  requireRole("admin", "finance", "vpaf", "cde_director"),
  PaymentController.getPaymentStatistics
);

// Bulk update payment status
router.post(
  "/bulk-update",
  requireRole("admin", "finance"),
  PaymentController.bulkUpdatePaymentStatus
);

export default router;
