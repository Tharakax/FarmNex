import express from 'express';
import { 
  createOrder, 
  savePayment, 
  saveShipping, 
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getMyOrders,
  deleteOrder,
  claimOrder,
  adminDeleteOrder,
  refundOrder
} from '../controllers/orderController.js';
import { backfillOrderContacts, linkOrderByEmail, bulkLinkUnownedByEmail, adminForceSetEmail } from '../controllers/orderController.js';
import { generateReceiptPDF, generateCreditNotePDF } from '../controllers/receiptController.js';
import JWTauth from '../middleware/auth.js';

const router = express.Router();

// Attach lightweight auth to make req.user available when a token is provided
// Note: This middleware is permissive and will not block unauthenticated requests
router.use(JWTauth);

// Order CRUD operations
router.post("/", createOrder);
router.get("/", getAllOrders); // Admin only - get all orders
router.get("/my-orders", getMyOrders); // Get current user's orders

// Working admin dashboard endpoint with populated customer data (MUST be before /:id)
router.get('/admin-orders', async (req, res) => {
  try {
    const Order = (await import('../models/order.js')).default;
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('customerId', 'fullName email role')
      .limit(50);
    
    const totalOrdersCount = await Order.countDocuments();
    
    res.json({ 
      success: true, 
      count: totalOrdersCount,
      displayedCount: orders.length,
      orders: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Specific admin routes must come before generic :id routes to avoid shadowing
router.delete('/admin/delete/:id', adminDeleteOrder);
// Refund endpoint (admin/farmer)
import('../controllers/orderController.js');
router.post('/refund/:id', refundOrder);

router.get("/:id", getOrderById);
router.delete("/:id", deleteOrder);
router.delete('/admin/delete/:id', adminDeleteOrder);

// Order updates
router.put('/shipping/:id', saveShipping);
router.put('/payment/:id', savePayment);
router.put('/status/:id', updateOrderStatus);
router.put('/claim/:id', claimOrder); // Link guest order to authenticated user

// Receipt generation
router.get('/receipt/:orderId/pdf', generateReceiptPDF);
router.get('/credit-note/:orderId/pdf', generateCreditNotePDF);

// Working admin data endpoint with populated customer info
router.get('/working-admin-data', async (req, res) => {
  try {
    const Order = (await import('../models/order.js')).default;
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('customerId', 'fullName email role')
      .limit(10);
    
    const totalOrdersCount = await Order.countDocuments();
    
    // Return in format expected by frontend admin (success: true, orders: [])
    res.json({ 
      success: true, 
      count: totalOrdersCount,
      displayedCount: orders.length,
      orders: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// Admin endpoint for dashboard - simplified access
router.get('/admin/dashboard', async (req, res) => {
  try {
    const Order = (await import('../models/order.js')).default;
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('customerId', 'fullName email role')
      .limit(50); // Limit to recent 50 orders for performance
    
    const totalOrdersCount = await Order.countDocuments();
    
    res.json({ 
      success: true, 
      count: totalOrdersCount,
      displayedCount: orders.length,
      orders: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Admin maintenance: backfill missing contact emails/names from user records
router.post('/admin/backfill-contacts', backfillOrderContacts);
router.post('/admin/link-by-email/:id', linkOrderByEmail);
router.post('/admin/link-unowned-by-email', bulkLinkUnownedByEmail);
router.post('/admin/force-email/:id', adminForceSetEmail);



export default router;
