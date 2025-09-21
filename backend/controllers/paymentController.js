import Payment from '../models/payment.js';
import User from '../models/user.js';

// Get all payment methods for a user
export const getUserPaymentMethods = async (req, res) => {
  try {
    if (!req.user) {
      req.user = { id: '65d5e8f9a8b4c5d3e8f7a1b1' }; // Use a real user ID from your DB
    }    
    const paymentMethods = await Payment.find({ user: req.user.id })
      .sort('-isDefault -createdAt');
    
    res.status(200).json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment methods',
      error: error.message
    });
  }
};

// Get a specific payment method
export const getPaymentMethod = async (req, res) => {
  try {
    if (!req.user) {
      req.user = { id: '65d5e8f9a8b4c5d3e8f7a1b1' }; // Use a real user ID from your DB
    }    
    const paymentMethod = await Payment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment method',
      error: error.message
    });
  }
};

// Add a new payment method
export const addPaymentMethod = async (req, res) => {
  try {
 if (!req.user) {
      req.user = { id: '65d5e8f9a8b4c5d3e8f7a1b1' }; // Use a real user ID from your DB
    }    
    const {
      paymentMethodId,
      cardBrand,
      last4,
      expMonth,
      expYear,
      billingDetails,
      isDefault
    } = req.body;

    // Check if payment method already exists
    const existingPayment = await Payment.findOne({ paymentMethodId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment method already exists'
      });
    }

    // Create new payment method
    const paymentMethod = await Payment.create({
      user: req.user.id,
      paymentMethodId,
      cardBrand,
      last4,
      expMonth,
      expYear,
      billingDetails,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding payment method',
      error: error.message
    });
  }
};

// Update a payment method
export const updatePaymentMethod = async (req, res) => {
  try {
    if (!req.user) {
      req.user = { id: '65d5e8f9a8b4c5d3e8f7a1b1' }; // Use a real user ID from your DB
    }    
    const {
      billingDetails,
      isDefault
    } = req.body;

    // Find payment method and ensure it belongs to the user
    let paymentMethod = await Payment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Update fields
    if (billingDetails) paymentMethod.billingDetails = billingDetails;
    if (typeof isDefault !== 'undefined') paymentMethod.isDefault = isDefault;

    // Save changes
    paymentMethod = await paymentMethod.save();

    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully',
      data: paymentMethod
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating payment method',
      error: error.message
    });
  }
};

// Delete a payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    if (!req.user) {
      req.user = { id: '65d5e8f9a8b4c5d3e8f7a1b1' }; // Use a real user ID from your DB
    }    
    const paymentMethod = await Payment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payment method',
      error: error.message
    });
  }
};

// Set a payment method as default
export const setDefaultPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await Payment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.status(200).json({
      success: true,
      message: 'Payment method set as default',
      data: paymentMethod
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting default payment method',
      error: error.message
    });
  }
};

// Get user's default payment method
export const getDefaultPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await Payment.getDefault(req.user.id);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'No default payment method found'
      });
    }

    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving default payment method',
      error: error.message
    });
  }
};