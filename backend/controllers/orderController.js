import Order from '../models/order.js';
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

     
    } = req.body;

    // Get customer ID from authenticated user (if available)
    const customerId = req.user?._id || null;

    // Create new order
    const newOrder = new Order({
      customerId,
      items,
      subtotal,
      tax,
      shipping,
      discount,
      total,
 
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




// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
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

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order,
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

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
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

// Updated saveShipping controller function
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

    // Update order with shipping details
    order.contactEmail = contactEmail;
    order.contactPhone = contactPhone;
    order.shippingAddress = shippingAddress;
    order.billingAddress = billingAddress || shippingAddress; // Use shipping if billing not provided
    order.notes = notes || '';
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

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
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

    // Since your order schema doesn't have customerId field (it's commented out),
    // we'll need to match by contact email or you'll need to add customerId back
    const orders = await Order.find({ 
      contactEmail: req.user.email 
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

// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow deletion if order is pending or cancelled
    if (!['pending', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete order that is being processed or completed'
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