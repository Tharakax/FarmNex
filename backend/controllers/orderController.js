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
      paymentMethod,
      contactPhone,
      contactEmail,
     
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
      paymentMethod,
      contactPhone,
      contactEmail,
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



// Save shipping information to an existing order
export const saveShipping = async (req, res) => {
  console.log('Saving shipping information:', req.body);
  try {
    const { id } = req.params;
    const {
      contactName,
      shippingAddress,
      contactEmail,
      contactPhone,
      notes
    } = req.body;

    

    // Find the order by ID
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order with shipping details
    order.contactName = contactName || order.contactName;
    order.shippingAddress = shippingAddress;
    order.contactEmail = contactEmail;
    order.contactPhone = contactPhone;
    order.notes = notes || '';
    order.updatedAt = new Date();
    order.shippinginfo = true; // Mark shipping info as saved 
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