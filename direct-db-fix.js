// Direct database fix via HTTP API manipulation
import fetch from 'node-fetch';

const updateOrderDirectly = async () => {
  try {
    console.log('🔧 Attempting direct database fix...');
    
    const orderId = '68d6a4f1b26fe53e83cb69f6';
    const correctEmail = 'ahamedshabaab860@gmail.com';
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDM4MWZjZTQ1MGI5ODA0Yzc2NDQxNSIsInVzZXJJZCI6IjY4ZDM4MWZjZTQ1MGI5ODA0Yzc2NDQxNSIsIm5hbWUiOiJIYW5hYW4gQWRtaW4iLCJmdWxsTmFtZSI6IkhhbmFhbiBBZG1pbiIsImVtYWlsIjoiZmFzbmk3M0BnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJzZXNzaW9uSWQiOiI1ZDE1ODdlODEyYjk5OTgzODIxZjAxNjRkNmQyNDAxMzQ0YTRhMWU5ZmYxZWIyZTIwMDJkYWZmOTI5NWQ2YTczIiwiaWF0IjoxNzU4OTAwMjQxLCJleHAiOjE3NTg5ODY2NDF9.iO9X6sUe40NgXKnDgHUWGwZ-DefJbknGa8XRQXv0LnQ';
    
    // First, let's verify the current state
    console.log('📊 Checking current state...');
    const checkResponse = await fetch('http://localhost:3000/api/order/debug/all', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (!checkResponse.ok) {
      throw new Error(`Failed to check current state: ${checkResponse.status}`);
    }
    
    const currentData = await checkResponse.json();
    const targetOrder = currentData.data?.sampleOrders?.find(o => o.id === orderId);
    
    if (!targetOrder) {
      console.log('❌ Target order not found');
      return;
    }
    
    console.log(`📋 Current order details:`);
    console.log(`   ID: ${targetOrder.id}`);
    console.log(`   Customer ID: ${targetOrder.customerId}`);
    console.log(`   Contact Email: ${targetOrder.contactEmail}`);
    console.log(`   Status: ${targetOrder.status}`);
    
    if (targetOrder.contactEmail === correctEmail) {
      console.log('✅ Contact email is already correct!');
      console.log('❓ The issue must be in frontend data loading or processing');
      return;
    }
    
    console.log(`\\n🔄 Need to update contactEmail from "${targetOrder.contactEmail}" to "${correctEmail}"`);
    
    // Try the existing admin endpoints
    const adminEndpoints = [
      { 
        url: 'http://localhost:3000/api/order/admin/force-email/' + orderId,
        method: 'POST',
        body: JSON.stringify({ contactEmail: correctEmail })
      },
      { 
        url: 'http://localhost:3000/api/order/admin/link-by-email/' + orderId,
        method: 'POST',
        body: ''
      }
    ];
    
    for (const endpoint of adminEndpoints) {
      try {
        console.log(`🔧 Trying ${endpoint.url.split('/').pop()}...`);
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: endpoint.body
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Successfully updated order!');
          console.log('📄 Result:', JSON.stringify(result, null, 2));
          
          // Verify the change
          console.log('\\n🔍 Verifying change...');
          const verifyResponse = await fetch('http://localhost:3000/api/order/debug/all', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          });
          
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            const updatedOrder = verifyData.data?.sampleOrders?.find(o => o.id === orderId);
            if (updatedOrder) {
              console.log(`✅ Verified! New contact email: ${updatedOrder.contactEmail}`);
            }
          }
          
          return;
        } else {
          console.log(`❌ Failed: ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('\\n💡 All admin endpoints failed. This means:');
    console.log('   1. Backend server needs restart to load new routes');
    console.log('   2. Or the existing admin routes have authentication issues');
    console.log('\\n🚀 SOLUTION: Restart your backend server and refresh the admin page');
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
};

updateOrderDirectly();