// controllers/receiptController.js (Compact version)
import PDFDocument from 'pdfkit';
import Order from '../models/order.js';

// Generate compact PDF receipt (single page)
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

    // Create a PDF document with very compact layout
    const doc = new PDFDocument({ 
      margin: 20,
      size: 'A4',
      layout: 'portrait'
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${orderId}.pdf`);
    doc.pipe(res);
    
    // Header - very compact
    doc.fontSize(14).font('Helvetica-Bold').text('FarmNex', 50, 20, { align: 'center' });
    doc.fontSize(8).font('Helvetica').text('Farm Supplies & Agricultural Products', 50, 40, { align: 'center' });
    doc.moveTo(50, 55).lineTo(550, 55).stroke();
    
    // Order details - compact inline format
    let yPosition = 65;
    doc.fontSize(9);
    doc.font('Helvetica-Bold').text('Order ID:', 50, yPosition);
    doc.font('Helvetica').text(order._id.toString(), 120, yPosition);
    doc.font('Helvetica-Bold').text('Date:', 300, yPosition);
    doc.font('Helvetica').text(new Date(order.createdAt).toLocaleDateString(), 340, yPosition);
    
    yPosition += 15;
    doc.font('Helvetica-Bold').text('Status:', 50, yPosition);
    doc.font('Helvetica').text(order.status || 'Completed', 120, yPosition);
    doc.font('Helvetica-Bold').text('Payment:', 300, yPosition);
    doc.font('Helvetica').text(order.paymentMethod || 'Credit Card', 340, yPosition);
    
    // Customer info - compact
    yPosition += 25;
    doc.font('Helvetica-Bold').text('Customer:', 50, yPosition);
    doc.font('Helvetica').text(order.contactName || 'N/A', 120, yPosition);
    doc.text(order.contactEmail || 'N/A', 120, yPosition + 12);
    doc.text(order.contactPhone || 'N/A', 120, yPosition + 24);
    
    // Shipping address - compact
    if (order.shippingAddress) {
      doc.font('Helvetica-Bold').text('Shipping:', 300, yPosition);
      doc.font('Helvetica');
      doc.text(order.shippingAddress.name || 'N/A', 350, yPosition, { width: 180 });
      doc.text(order.shippingAddress.street || 'N/A', 350, yPosition + 12, { width: 180 });
      doc.text(`${order.shippingAddress.city || 'N/A'}, ${order.shippingAddress.state || 'N/A'}`, 350, yPosition + 24, { width: 180 });
      doc.text(order.shippingAddress.zipCode || 'N/A', 350, yPosition + 36, { width: 180 });
    }
    
    // Items table - very compact
    yPosition += 50;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    doc.font('Helvetica-Bold').text('ITEMS', 50, yPosition + 5);
    doc.text('QTY', 350, yPosition + 5);
    doc.text('PRICE', 400, yPosition + 5);
    doc.text('TOTAL', 480, yPosition + 5);
    doc.moveTo(50, yPosition + 15).lineTo(550, yPosition + 15).stroke();
    
    // Items list - very compact
    let itemY = yPosition + 20;
    doc.fontSize(8).font('Helvetica');
    
    order.items.forEach((item) => {
      // Truncate very long product names
      const itemName = item.name && item.name.length > 40 
        ? item.name.substring(0, 37) + '...' 
        : item.name || 'Product';
      
      doc.text(itemName, 50, itemY, { width: 280 });
      doc.text((item.quantity || 0).toString(), 350, itemY);
      doc.text(`Rs. ${(item.price || 0).toFixed(2)}`, 400, itemY);
      doc.text(`Rs. ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`, 480, itemY);
      itemY += 12;
    });
    
    // Order summary - positioned appropriately
    const summaryY = Math.min(itemY + 15, 650);
    doc.moveTo(50, summaryY).lineTo(550, summaryY).stroke();
    
    doc.fontSize(9);
    doc.text(`Subtotal: Rs. ${(order.subtotal || 0).toFixed(2)}`, 400, summaryY + 5, { align: 'right' });
    
    if (order.discount > 0) {
      doc.text(`Discount: -Rs. ${(order.discount || 0).toFixed(2)}`, 400, summaryY + 20, { align: 'right' });
    }
    
    doc.text(`Shipping: ${order.shipping === 0 ? 'Free' : `Rs. ${(order.shipping || 0).toFixed(2)}`}`, 400, summaryY + 35, { align: 'right' });
    doc.text(`Tax: Rs. ${(order.tax || 0).toFixed(2)}`, 400, summaryY + 50, { align: 'right' });
    
    doc.font('Helvetica-Bold').text(`Total: Rs. ${(order.total || 0).toFixed(2)}`, 400, summaryY + 70, { align: 'right' });
    
    // Footer - minimal
    const footerY = 750;
    doc.moveTo(50, footerY).lineTo(550, footerY).stroke();
    doc.fontSize(7).text('Thank you for your purchase!', { align: 'right' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
    
    doc.end();
    
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating receipt',
      error: error.message
    });
  }
};  