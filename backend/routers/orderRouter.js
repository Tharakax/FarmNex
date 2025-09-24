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
import { generateReceiptPDF } from '../controllers/receiptController.js';

const router = express.Router();

// Order CRUD operations
router.post("/", createOrder);
router.get("/", getAllOrders); // Admin only - get all orders
router.get("/my-orders", getMyOrders); // Get current user's orders
router.get("/:id", getOrderById);
router.delete("/:id", deleteOrder);

// Order updates
router.put('/shipping/:id', saveShipping);
router.put('/payment/:id', savePayment);
router.put('/status/:id', updateOrderStatus);
router.put('/claim/:id', claimOrder); // Link guest order to authenticated user

// Receipt generation
router.get('/receipt/:orderId/pdf', generateReceiptPDF);

// Debug endpoint - remove in production
router.get('/debug/all', async (req, res) => {
  try {
    const Order = (await import('../models/order.js')).default;
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10);
    
    const summary = {
      totalOrders: orders.length,
      completedPayments: orders.filter(o => o.paymentcompleted).length,
      sampleOrders: orders.slice(0, 3).map(order => ({
        id: order._id,
        customerId: order.customerId,
        contactEmail: order.contactEmail,
        total: order.total,
        paymentCompleted: order.paymentcompleted,
        status: order.status,
        createdAt: order.createdAt
      }))
    };
    
    res.json({ success: true, data: summary });
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

export default router;
