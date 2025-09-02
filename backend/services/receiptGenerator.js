export const generateReceipt = (order, paymentIntent) => {
  const receiptDate = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - Order #${order._id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .details { margin-bottom: 20px; }
        .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; font-size: 1.2em; }
        .footer { margin-top: 40px; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FarmNex Receipt</h1>
        <p>Order #${order._id}</p>
        <p>Date: ${receiptDate}</p>
      </div>
      
      <div class="details">
        <p><strong>Customer:</strong> ${order.contactName}</p>
        <p><strong>Email:</strong> ${order.contactEmail}</p>
        <p><strong>Phone:</strong> ${order.contactPhone}</p>
      </div>
      
      <table class="items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>Rs. ${item.price.toFixed(2)}</td>
              <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        <p>Subtotal: Rs. ${order.subtotal.toFixed(2)}</p>
        ${order.discount > 0 ? `<p>Discount: -Rs. ${order.discount.toFixed(2)}</p>` : ''}
        <p>Shipping: ${order.shipping === 0 ? 'Free' : `Rs. ${order.shipping.toFixed(2)}`}</p>
        <p>Tax: Rs. ${order.tax.toFixed(2)}</p>
        <p>Total: Rs. ${order.total.toFixed(2)}</p>
      </div>
      
      <div class="details">
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Payment ID:</strong> ${paymentIntent.id}</p>
      </div>
      
      <div class="footer">
        <p>Thank you for your purchase!</p>
        <p>FarmNex - Fresh products delivered to your door</p>
        <p>Contact: support@farmnex.com</p>
      </div>
    </body>
    </html>
  `;
};