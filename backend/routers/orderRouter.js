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
  claimOrder
} from '../controllers/orderController.js';
import { backfillOrderContacts, linkOrderByEmail, bulkLinkUnownedByEmail, adminForceSetEmail } from '../controllers/orderController.js';
import { generateReceiptPDF } from '../controllers/receiptController.js';
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

router.get("/:id", getOrderById);
router.delete("/:id", deleteOrder);

// Order updates
router.put('/shipping/:id', saveShipping);
router.put('/payment/:id', savePayment);
router.put('/status/:id', updateOrderStatus);
router.put('/claim/:id', claimOrder); // Link guest order to authenticated user

// Receipt generation
router.get('/receipt/:orderId/pdf', generateReceiptPDF);

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

// TEMP: Test populated admin dashboard data
router.get('/temp-admin-data', async (req, res) => {
  try {
    const Order = (await import('../models/order.js')).default;
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('customerId', 'fullName email role')
      .limit(10);
    
    res.json({ 
      success: true, 
      message: 'Populated admin dashboard data for testing',
      orders: orders.map(order => ({
        _id: order._id,
        contactEmail: order.contactEmail,
        customerId: order.customerId,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint - remove in production - Modified to return proper admin format
router.get('/debug/all', async (req, res) => {
  try {
    const Order = (await import('../models/order.js')).default;
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10)
      .populate('customerId', 'fullName email role'); // Populate customer data
    
    const totalOrdersCount = await Order.countDocuments();
    
    // Return in the format expected by frontend admin (success: true, orders: [])
    res.json({ 
      success: true, 
      count: totalOrdersCount,
      displayedCount: orders.length,
      orders: orders // Full order objects with populated customerId
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

// Test endpoint for payment history without auth - remove in production
router.get('/test-payment-history/:email', async (req, res) => {
  try {
    const Order = (await import('../models/order.js')).default;
    const User = (await import('../models/usermodel.js')).default;
    
    const rawEmail = req.params.email || '';
    const email = rawEmail.toLowerCase().trim();

    // Try to find a user by email, but proceed even if not found (guest checkout support)
    let user = null;
    try {
      user = await User.findOne({ email });
    } catch {}
    
    // Build query: always include contactEmail match; include customerId if user exists
    const orConditions = [{ contactEmail: email }];
    if (user?._id) {
      orConditions.unshift({ customerId: user._id });
    }

    const orders = await Order.find({ $or: orConditions }).sort({ createdAt: -1 });
    
    // Filter only orders with completed payments (for payment history)
    const paymentHistory = orders
      .filter(order => order.paymentcompleted === true)
      .map(order => ({
        id: order._id,
        orderId: order._id,
        date: order.createdAt,
        amount: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        items: order.items,
        transactionId: `txn_${order._id.toString().slice(-8)}`,
        description: `Payment for order ${order._id.toString().slice(-8)}`
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      success: true,
      orders: paymentHistory,
      count: paymentHistory.length,
      user: user ? { email: user.email, name: user.fullName, id: user._id } : { email }
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

// Test endpoint for all orders without auth - remove in production
router.get('/test-orders/:email', async (req, res) => {
  try {
    const Order = (await import('../models/order.js')).default;
    const User = (await import('../models/usermodel.js')).default;
    
    const { email } = req.params;
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find orders by customerId or contactEmail
    const orders = await Order.find({ 
      $or: [
        { customerId: user._id },
        { contactEmail: user.email }
      ]
    }).sort({ createdAt: -1 });
    
    // Return all orders (not just completed payments)
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderId: order._id,
      createdAt: order.createdAt,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentcompleted: order.paymentcompleted,
      items: order.items,
      shippingAddress: order.shippingAddress,
      contactName: order.contactName,
      contactEmail: order.contactEmail,
      contactPhone: order.contactPhone,
      notes: order.notes,
      // Add fields needed for order display
      totalAmount: order.total, // For compatibility with getDashboardStats
      orderDate: order.createdAt // For compatibility
    }));
    
    res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
      user: {
        email: user.email,
        name: user.fullName,
        id: user._id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// TEMPORARY: Fix specific order email
router.post('/temp-fix-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { targetEmail } = req.body;
    
    const Order = (await import('../models/order.js')).default;
    const User = (await import('../models/usermodel.js')).default;
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Find the target user
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update the order
    order.contactEmail = targetEmail;
    order.customerId = user._id;
    await order.save();
    
    res.json({ 
      success: true, 
      message: 'Order updated successfully',
      order: {
        _id: order._id,
        contactEmail: order.contactEmail,
        customerId: order.customerId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
