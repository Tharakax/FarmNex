// Update order via existing API endpoints
import fetch from 'node-fetch';

async function updateOrderViaAPI() {
  const orderId = '68d6a4f1b26fe53e83cb69f6';
  const userEmail = 'ahamedshabaab860@gmail.com';
  const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDM4MWZjZTQ1MGI5ODA0Yzc2NDQxNSIsInVzZXJJZCI6IjY4ZDM4MWZjZTQ1MGI5ODA0Yzc2NDQxNSIsIm5hbWUiOiJIYW5hYW4gQWRtaW4iLCJmdWxsTmFtZSI6IkhhbmFhbiBBZG1pbiIsImVtYWlsIjoiZmFzbmk3M0BnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJzZXNzaW9uSWQiOiI1ZDE1ODdlODEyYjk5OTgzODIxZjAxNjRkNmQyNDAxMzQ0YTRhMWU5ZmYxZWIyZTIwMDJkYWZmOTI5NWQ2YTczIiwiaWF0IjoxNzU4OTAwMjQxLCJleHAiOjE3NTg5ODY2NDF9.iO9X6sUe40NgXKnDgHUWGwZ-DefJbknGa8XRQXv0LnQ';
  
  try {
    console.log('🔍 Checking current order state...');
    
    // Get current state
    const response = await fetch(`http://localhost:3000/api/order/debug/all`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const targetOrder = data.data.sampleOrders.find(o => o.id === orderId);
    
    if (!targetOrder) {
      console.log('❌ Order not found in current orders');
      return;
    }
    
    console.log('📊 Current order state:');
    console.log(`   ID: ${targetOrder.id}`);
    console.log(`   Customer ID: ${targetOrder.customerId}`);
    console.log(`   Contact Email: ${targetOrder.contactEmail}`);
    console.log(`   Status: ${targetOrder.status}`);
    
    if (targetOrder.contactEmail === userEmail) {
      console.log('✅ Order already has the correct contactEmail!');
      console.log('🔍 The issue might be in the frontend logic.');
      console.log('   Since the order is linked to customerId: ' + targetOrder.customerId);
      console.log('   Your frontend should prefer the customer email over contactEmail');
      return;
    }
    
    console.log('❌ Order needs contactEmail update');
    console.log('💡 Since admin routes are not accessible, try one of:');
    console.log('   1. Restart backend server to load admin routes');
    console.log('   2. Check if frontend logic works despite wrong contactEmail');
    console.log('   3. Manual database update');
    
    // Try to make the actual fix call
    console.log('\\n🔧 Attempting to fix via admin API...');
    try {
      const fixResponse = await fetch(`http://localhost:3000/api/order/admin/force-email/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contactEmail: userEmail })
      });
      
      if (fixResponse.ok) {
        const fixData = await fixResponse.json();
        console.log('✅ Successfully updated order!', fixData);
      } else {
        console.log(`❌ Admin API not accessible: ${fixResponse.status}`);
      }
    } catch (adminError) {
      console.log('❌ Admin routes not loaded:', adminError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateOrderViaAPI();