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

const router = express.Router();

/**
 * Report Routes
 * All endpoints for report generation and data retrieval
 */

// Sales Reports
router.get('/sales', getSalesReport);

// Inventory Reports
router.get('/inventory', getInventoryReport);

// Product Performance Reports
router.get('/products', getProductPerformanceReport);

// Farm Supplies Reports
router.get('/supplies', getSuppliesReport);

// Overview Dashboard Data
router.get('/overview', getOverviewReport);

// Report Statistics
router.get('/stats', getReportStats);

// Export Reports (PDF, Excel, etc.)
router.get('/export', exportReport);

export default router;
