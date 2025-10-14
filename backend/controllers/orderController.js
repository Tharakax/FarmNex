import Order from '../models/order.js';
import User from '../models/usermodel.js';

// Helper: case-insensitive admin check
// Treat farmer and farmstaff as admin-equivalent per requirements
const isAdminRole = (role) => {
  const r = (role || '').toString().toLowerCase();
  return r === 'admin' || r === 'superadmin' || r === 'farmer' || r === 'farmstaff';
};
// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      contactEmail: bodyContactEmail,
      contactName: bodyContactName
    } = req.body;

    // Get customer ID from authenticated user (if available)
    const customerId = req.user?._id || null;

    // Derive identity from authenticated user when available
    const derivedEmail = req.user?.email || bodyContactEmail;
    const derivedName = req.user?.fullName || req.user?.name || bodyContactName;

    // Create new order
    const newOrder = new Order({
      customerId,
      items,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      contactEmail: derivedEmail,
      contactName: derivedName,
      status: 'pending',
    });

    // Save the order
    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      order: savedOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};




// Get order by ID - SECURED: Only owner or admin can access
export const getOrderById = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 🔒 SECURITY CHECK: Verify user owns this order or is admin
    const isOwner = order.customerId && String(order.customerId._id) === String(req.user._id);
    const isOwnerByEmail = order.contactEmail && order.contactEmail === req.user.email;
    const isAdmin = isAdminRole(req.user.role);

    if (!isOwner && !isOwnerByEmail && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Get orders for a customer
export const getCustomerOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const orders = await Order.find({ customerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name image');

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Update order status - Admins can update any status, customers can only cancel
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // 🔒 SECURITY CHECK: Authentication required
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 🔒 SECURITY CHECK: Verify user owns this order or is admin
    const isOwner = order.customerId && String(order.customerId) === String(req.user._id);
    const isOwnerByEmail = order.contactEmail && order.contactEmail === req.user.email;
    const isAdmin = isAdminRole(req.user.role);

    if (!isOwner && !isOwnerByEmail && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own orders.'
      });
    }

    // 🔒 BUSINESS LOGIC: Customers can only cancel their orders, admins can set any status
    if (!isAdmin) {
      // Customer restrictions
      if (status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Customers can only cancel orders. Other status changes require admin access.'
        });
      }
      
      // Can only cancel pending or processing orders
      if (!['pending', 'processing'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: 'You can only cancel orders that are pending or being processed.'
        });
      }
    }

    // Update the order status
    order.status = status;
    order.updatedAt = new Date();
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      order: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};


export const savePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentCompleted, paymentDetails } = req.body;

    // 🔒 SECURITY CHECK: Authentication required
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 🔒 SECURITY CHECK: Verify user owns this order
    const isOwner = order.customerId && String(order.customerId) === String(req.user._id);
    const isOwnerByEmail = order.contactEmail && order.contactEmail === req.user.email;
    const isAdmin = isAdminRole(req.user.role);

    if (!isOwner && !isOwnerByEmail && !isAdmin) {
      // Graceful linking: if order has no owner yet, link to current user
      if (!order.customerId && !order.contactEmail && req.user && (req.user.role || '').toLowerCase() === 'customer') {
        order.customerId = req.user._id;
        order.contactEmail = req.user.email || order.contactEmail;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own orders.'
        });
      }
    }

    order.paymentMethod = paymentMethod;
    order.paymentcompleted = paymentCompleted;
    if (paymentDetails) {
      order.paymentDetails = paymentDetails;
    }
    order.status = paymentCompleted ? 'processing' : 'pending';
    order.updatedAt = new Date();

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      order: updatedOrder,
      message: 'Payment information saved successfully'
    });
  } catch (error) {
    console.error('Error saving payment information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save payment information',
      error: error.message
    });
  }
};

// Updated saveShipping controller function - SECURED
export const saveShipping = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      contactName,
      contactEmail,
      contactPhone,
      shippingAddress,
      billingAddress,
      notes
    } = req.body;

    // 🔒 SECURITY CHECK: Authentication required (relaxed for first-time shipping on guest orders)
    if (!req.user) {
      // Allow setting shipping once for orders that are not yet linked and have no email
      const tempOrder = await Order.findById(id);
      if (!tempOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if (tempOrder.customerId || tempOrder.contactEmail) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      // proceed without req.user: we will not link customerId, but we will set contactEmail from payload
    }

    // Validate required fields
    if (!contactName || !contactEmail || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Contact information is required'
      });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.street || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || 
        !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    // Find the order by ID
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 🔒 SECURITY CHECK: Verify user owns this order
    const isOwner = order.customerId && String(order.customerId) === String(req.user._id);
    const isOwnerByEmail = order.contactEmail && order.contactEmail === req.user.email;
    const isAdmin = isAdminRole(req.user.role);

    if (!isOwner && !isOwnerByEmail && !isAdmin) {
      // Graceful linking: if order has no owner yet, link to current user
      if (!order.customerId && !order.contactEmail && req.user && (req.user.role || '').toLowerCase() === 'customer') {
        order.customerId = req.user._id;
        if (!contactEmail && req.user.email) {
          // Use authenticated user's email if not provided
          order.contactEmail = req.user.email;
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own orders.'
        });
      }
    }

    // Update order with shipping details
    order.contactEmail = contactEmail || order.contactEmail || req.user?.email || order.contactEmail;
    order.contactPhone = contactPhone || order.contactPhone;
    order.shippingAddress = shippingAddress || order.shippingAddress;
    order.billingAddress = billingAddress || shippingAddress || order.billingAddress; // Use shipping if billing not provided
    order.notes = notes || order.notes || '';
    order.updatedAt = new Date();
    order.shippinginfo = true; // Mark shipping info as completed

    // Save the updated order
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      order: updatedOrder,
      message: 'Shipping information saved successfully'
    });
  } catch (error) {
    console.error('Error saving shipping information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save shipping information',
      error: error.message
    });
  }
};
// Add these functions to your orderController.js

// Get all orders - SECURED: Admin only
export const getAllOrders = async (req, res) => {
  try {
    // 🔒 CRITICAL SECURITY CHECK: Only admins can view all orders
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('customerId', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get orders for current user
export const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find orders by customerId (preferred method) or fallback to contactEmail
    const orders = await Order.find({ 
      $or: [
        { customerId: req.user._id },
        { contactEmail: req.user.email }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Delete an order - SECURED
export const deleteOrder = async (req, res) => {
  try {
    // 🔒 SECURITY CHECK: Authentication required
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 🔒 SECURITY CHECK: Verify user owns this order or is admin
    const isOwner = order.customerId && String(order.customerId) === String(req.user._id);
    const isOwnerByEmail = order.contactEmail && order.contactEmail === req.user.email;
    const isAdmin = isAdminRole(req.user.role);

    if (!isOwner && !isOwnerByEmail && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own orders.'
      });
    }

    // Only allow deletion if order is pending/cancelled OR user is admin
    if (!isAdmin && !['pending', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete order that is being processed or completed. Admin access required.'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

// Admin hard delete (bypass ownership and status) – restricted to admins only
export const adminDeleteOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const { id } = req.params;
    const existing = await Order.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await Order.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Order permanently deleted' });
  } catch (error) {
    console.error('Admin delete order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete order', error: error.message });
  }
};

// Process a refund for an order - Admin/farmer only
export const refundOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const { id } = req.params;
    const { amount, method, note } = req.body || {};

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only allow refunds for Stripe/credit card payments
    if (!order.paymentMethod || order.paymentMethod !== 'credit_card') {
      return res.status(400).json({ 
        success: false, 
        message: 'Refunds are only supported for credit card payments processed through Stripe' 
      });
    }

    // Validate Stripe payment details exist
    const p = order.paymentDetails || {};
    const pi = p.paymentIntentId || p.payment_intent_id || p.payment_intent || p.stripePaymentIntentId || null;
    const chargeId = p.chargeId || p.charge || null;
    
    if (!pi && !chargeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot refund: No Stripe payment reference found for this order' 
      });
    }

    // Validate Stripe is configured
    const hasStripeKey = !!process.env.STRIPE_SECRET;
    if (!hasStripeKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Refunds are not available: Stripe is not configured' 
      });
    }

    // Determine remaining refundable amount
    const alreadyRefunded = Number(order.refundAmount || 0);
    const total = Number(order.total || 0);
    const remaining = Math.max(0, total - alreadyRefunded);

    let amt = amount != null ? Number(amount) : remaining;
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid refund amount' });
    }
    if (amt > remaining) amt = remaining;

    // Process Stripe refund (guaranteed to work since we validated above)
    let txnId = `rf_${order._id.toString().slice(-8)}_${Date.now()}`;
    let providerStatus = 'succeeded';

    try {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET);
      const amountCents = Math.round(amt * 100);
      let refund;
      
      if (pi) {
        refund = await stripe.refunds.create({ payment_intent: pi, amount: amountCents });
      } else {
        refund = await stripe.refunds.create({ charge: chargeId, amount: amountCents });
      }
      
      txnId = refund.id || txnId;
      providerStatus = refund.status || providerStatus;
      
      console.log(`✅ Stripe refund successful: ${refund.id}, amount: ${amt}, status: ${refund.status}`);
      
    } catch (stripeErr) {
      console.error('❌ Stripe refund error:', stripeErr?.message || stripeErr);
      return res.status(502).json({ 
        success: false, 
        message: `Stripe refund failed: ${stripeErr?.message || 'Unknown error'}` 
      });
    }

    // Record refund
    order.refundAmount = alreadyRefunded + amt;
    order.refundStatus = order.refundAmount >= total ? 'processed' : 'partial';
    order.refundMethod = 'credit_card'; // Always credit card since that's all we support
    order.refundTxnId = txnId;
    order.refundAt = new Date();
    order.refundNote = note || order.refundNote;

    await order.save();

    // Email customer (best-effort)
    try {
      const { default: sendMail } = await import('../utils/sendMail.js');
      const to = order.contactEmail || '';
      if (to) {
        const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:3000';
        const creditUrl = `${baseUrl}/api/order/credit-note/${order._id}/pdf`;
        const subject = 'Your refund has been processed';
        const text = `Hello ${order.contactName || ''},\n\nWe have processed your refund for order ${order._id.toString()}.\n\nAmount: LKR ${amt.toFixed(2)}\nMethod: ${order.refundMethod}\nTransaction: ${txnId}\nStatus: ${order.refundStatus} (${providerStatus})\n\nYou can download your credit note here:\n${creditUrl}\n\nThank you,\nFarmNex Team`;
        await sendMail(to, subject, text);
      }
    } catch (mailErr) {
      console.warn('Refund email failed (non-blocking):', mailErr?.message || mailErr);
    }

    return res.status(200).json({ success: true, message: 'Refund recorded', order });
  } catch (error) {
    console.error('Refund order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process refund', error: error.message });
  }
};

// Claim a guest order and link it to the current authenticated user
export const claimOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If already linked to this user, return OK
    if (order.customerId && String(order.customerId) === String(req.user._id)) {
      return res.status(200).json({ success: true, order, message: 'Order already linked to your account' });
    }

    // If linked to another user, do not allow claiming
    if (order.customerId && String(order.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Order is already linked to another account' });
    }

    // Link the order to the current user
    order.customerId = req.user._id;
    if (!order.contactEmail && req.user.email) {
      order.contactEmail = req.user.email;
    }
    if (!order.contactName && (req.user.fullName || req.user.name)) {
      order.contactName = req.user.fullName || req.user.name;
    }
    order.updatedAt = new Date();

    const updated = await order.save();
    return res.status(200).json({ success: true, order: updated, message: 'Order linked to your account' });
  } catch (error) {
    console.error('Error claiming order:', error);
    return res.status(500).json({ success: false, message: 'Failed to claim order', error: error.message });
  }
};

// Admin-only: Backfill contactEmail/contactName for orders with a customerId but missing contact info
export const backfillOrderContacts = async (req, res) => {
  try {
    const role = (req.user?.role || '').toString().toLowerCase();
    if (!req.user || !(role === 'admin' || role === 'superadmin' || role === 'admin'.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const dryRun = String(req.query.dryRun || req.body?.dryRun || 'false').toLowerCase() === 'true';

    // Find candidate orders
    const criteria = {
      customerId: { $ne: null },
      $or: [
        { contactEmail: { $exists: false } },
        { contactEmail: null },
        { contactEmail: '' }
      ]
    };

    const orders = await Order.find(criteria).limit(5000); // safety cap
    if (!orders.length) {
      return res.status(200).json({ success: true, message: 'No orders require backfill', checked: 0, updated: 0 });
    }

    let updated = 0;
    const updates = [];

    for (const order of orders) {
      try {
        const user = await User.findById(order.customerId).select('email fullName role');
        if (!user || !user.email) continue;
        if ((user.role || '').toLowerCase() !== 'customer') continue;
        const updateDoc = {
          contactEmail: order.contactEmail || user.email,
          contactName: order.contactName || user.fullName || order.contactName,
          updatedAt: new Date()
        };
        if (!dryRun) {
          await Order.updateOne({ _id: order._id }, { $set: updateDoc });
        }
        updated += 1;
        updates.push({ id: order._id, email: updateDoc.contactEmail, name: updateDoc.contactName });
      } catch {}
    }

    return res.status(200).json({
      success: true,
      dryRun,
      checked: orders.length,
      updated,
      sample: updates.slice(0, 10)
    });
  } catch (error) {
    console.error('Backfill contacts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to backfill order contacts', error: error.message });
  }
};

// Admin-only: Link an order to a registered user when contactEmail matches user.email
export const linkOrderByEmail = async (req, res) => {
  try {
    const role = (req.user?.role || '').toString().toLowerCase();
    if (!req.user || !(role === 'admin' || role === 'superadmin')) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.customerId) {
      return res.status(200).json({ success: true, order, message: 'Order already linked to a user' });
    }

    const email = (order.contactEmail || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ success: false, message: 'Order has no contactEmail to link' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No registered user with that email' });

    order.customerId = user._id;
    if (!order.contactName && user.fullName) order.contactName = user.fullName;
    if (!order.contactEmail) order.contactEmail = user.email;
    order.updatedAt = new Date();
    const updated = await order.save();

    return res.status(200).json({ success: true, order: updated, message: 'Order linked by email' });
  } catch (error) {
    console.error('Link by email error:', error);
    return res.status(500).json({ success: false, message: 'Failed to link order by email', error: error.message });
  }
};

// Admin-only: Bulk link all unowned orders where contactEmail matches user.email
export const bulkLinkUnownedByEmail = async (req, res) => {
  try {
    const role = (req.user?.role || '').toString().toLowerCase();
    if (!req.user || !(role === 'admin' || role === 'superadmin')) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const dryRun = String(req.query.dryRun || req.body?.dryRun || 'false').toLowerCase() === 'true';
    const candidates = await Order.find({ customerId: { $eq: null }, contactEmail: { $type: 'string', $ne: '' } }).limit(5000);

    let updated = 0;
    const samples = [];

    for (const order of candidates) {
      try {
        const email = order.contactEmail.toLowerCase().trim();
        const user = await User.findOne({ email });
        if (!user) continue;
        if (!dryRun) {
          order.customerId = user._id;
          if (!order.contactName && user.fullName) order.contactName = user.fullName;
          order.updatedAt = new Date();
          await order.save();
        }
        updated += 1;
        samples.push({ id: order._id, email: user.email });
      } catch {}
    }

    return res.status(200).json({ success: true, dryRun, checked: candidates.length, updated, sample: samples.slice(0, 10) });
  } catch (error) {
    console.error('Bulk link by email error:', error);
    return res.status(500).json({ success: false, message: 'Failed to bulk link orders', error: error.message });
  }
};

// Admin-only: Force set contactEmail on an order and link to registered user with that email (if exists)
export const adminForceSetEmail = async (req, res) => {
  try {
    const role = (req.user?.role || '').toString().toLowerCase();
    if (!req.user || !(role === 'admin' || role === 'superadmin')) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const { id } = req.params;
    const { contactEmail } = req.body || {};
    if (!contactEmail) {
      return res.status(400).json({ success: false, message: 'contactEmail is required' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.contactEmail = contactEmail.toLowerCase().trim();

    // Try to link to a registered user with that email
    const user = await User.findOne({ email: order.contactEmail });
    if (user) {
      order.customerId = user._id;
      if (!order.contactName && user.fullName) order.contactName = user.fullName;
    }
    order.updatedAt = new Date();
    const updated = await order.save();

    return res.status(200).json({ success: true, order: updated, linked: !!user, message: user ? 'Email set and order linked' : 'Email set (no matching user found)' });
  } catch (error) {
    console.error('Admin force set email error:', error);
    return res.status(500).json({ success: false, message: 'Failed to set email', error: error.message });
  }
};
