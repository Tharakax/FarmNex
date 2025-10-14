// controllers/receiptController.js - Updated with FarmNex branding
import Order from '../models/order.js';

// Generate receipt PDF with FarmNex branding and professional layout
export const generateReceiptPDF = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Return order data for frontend to generate PDF with FarmNex branding
    res.json({
      success: true,
      order: order,
      message: 'Order data retrieved for PDF generation'
    });
    
  } catch (error) {
    console.error('Error retrieving order for receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving order data',
      error: error.message
    });
  }
};

// Generate Credit Note PDF with FarmNex branding
export const generateCreditNotePDF = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const refunded = Number(order.refundAmount || 0);
    if (refunded <= 0) {
      return res.status(400).json({ success: false, message: 'No refund recorded for this order' });
    }

    // Return order data for frontend to generate PDF with FarmNex branding
    res.json({
      success: true,
      order: order,
      message: 'Order data retrieved for credit note PDF generation'
    });
    
  } catch (error) {
    console.error('Error retrieving order for credit note:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving order data',
      error: error.message
    });
  }
};
