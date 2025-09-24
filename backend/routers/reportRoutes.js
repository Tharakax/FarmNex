import express from 'express';
import {
  getSalesReport,
  getInventoryReport,
  getProductPerformanceReport,
  getSuppliesReport,
  getOverviewReport,
  getReportStats,
  exportReport
} from '../controllers/reportController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Report Routes
 * All endpoints for report generation and data retrieval
 */

// Sales Reports - SECURED: Admin only
router.get('/sales', authMiddleware, getSalesReport);

// Inventory Reports - SECURED: Admin only
router.get('/inventory', authMiddleware, getInventoryReport);

// Product Performance Reports - SECURED: Admin only
router.get('/products', authMiddleware, getProductPerformanceReport);

// Farm Supplies Reports - SECURED: Admin only
router.get('/supplies', authMiddleware, getSuppliesReport);

// Overview Dashboard Data - SECURED: Admin only
router.get('/overview', authMiddleware, getOverviewReport);

// Report Statistics - SECURED: Admin only
router.get('/stats', authMiddleware, getReportStats);

// Export Reports (PDF, Excel, etc.) - SECURED: Admin only
router.get('/export', authMiddleware, exportReport);

export default router;
