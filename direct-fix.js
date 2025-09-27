// Direct database update via the running server
import fetch from 'node-fetch';

const updateOrderEmail = async () => {
  try {
    const orderId = '68d6a4f1b26fe53e83cb69f6';
    const targetEmail = 'ahamedshabaab860@gmail.com';
    
    // Use the test endpoint to verify current state
    console.log('Checking current order state...');
    const checkResponse = await fetch(`http://localhost:3000/api/order/test-orders/${targetEmail}`);
    const checkData = await checkResponse.json();
    
    const currentOrder = checkData.orders.find(o => o._id === orderId);
    if (!currentOrder) {
      console.log('Order not found in user orders');
      return;
    }
    
    console.log(`Current contactEmail: ${currentOrder.contactEmail}`);
    console.log(`Target email: ${targetEmail}`);
    
    if (currentOrder.contactEmail === targetEmail) {
      console.log('✅ Order already has the correct contactEmail!');
      return;
    }
    
    console.log('❌ Order needs to be updated');
    console.log('Since admin routes are not accessible, please do one of the following:');
    console.log('1. Restart the backend server and try the admin endpoints again');
    console.log('2. Manually update the database');
    console.log('3. Check if the frontend changes are working despite the contactEmail');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

updateOrderEmail();