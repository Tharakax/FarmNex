import axios from 'axios';

async function testCheckout() {
  console.log('🛒 TESTING CART CHECKOUT FUNCTIONALITY');
  console.log('═'.repeat(50));

  const testOrderData = {
    items: [
      {
        productId: 'test-product-1',
        name: 'Organic Carrots',
        price: 350,
        quantity: 3,
        image: 'carrot-image.jpg',
        description: 'Fresh organic carrots from local farm'
      },
      {
        productId: 'test-product-2', 
        name: 'Red Apple',
        price: 550,
        quantity: 2,
        image: 'apple-image.jpg',
        description: 'Crispy red apples'
      }
    ],
    subtotal: 2150,
    tax: 172,
    shipping: 0,
    discount: 0,
    total: 2322,
    status: 'pending'
  };

  try {
    console.log('📦 Test order data:');
    console.log(`   Items: ${testOrderData.items.length}`);
    console.log(`   Subtotal: LKR ${testOrderData.subtotal}`);
    console.log(`   Total: LKR ${testOrderData.total}`);
    console.log('');

    console.log('🚀 Making checkout request...');
    const response = await axios.post('http://localhost:3000/api/order', testOrderData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Checkout Success!');
    console.log(`   Order ID: ${response.data.order._id}`);
    console.log(`   Status: ${response.data.order.status}`);
    console.log(`   Total: LKR ${response.data.order.total}`);
    console.log(`   Message: ${response.data.message}`);

    // Test order retrieval
    console.log('\n📋 Testing order retrieval...');
    const orderResponse = await axios.get(`http://localhost:3000/api/order/${response.data.order._id}`);
    
    if (orderResponse.data.success) {
      console.log('✅ Order retrieval successful!');
      console.log(`   Retrieved order ID: ${orderResponse.data.order._id}`);
      console.log(`   Retrieved total: LKR ${orderResponse.data.order.total}`);
    } else {
      console.log('❌ Order retrieval failed');
    }

  } catch (error) {
    console.log('❌ CHECKOUT FAILED');
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }

  console.log('\n🎯 CHECKOUT TEST COMPLETED');
}

testCheckout().catch(console.error);