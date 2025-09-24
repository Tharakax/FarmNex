import fetch from 'node-fetch';

const testDirectLogin = async () => {
  try {
    console.log('🧪 Testing direct login API...');
    
    const response = await fetch('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'shababhanaan22@gmail.com',
        password: 'password123'
      }),
    });
    
    const data = await response.json();
    
    console.log('📡 API Response Status:', response.status);
    console.log('📄 API Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.token) {
      console.log('✅ Direct login working - JWT token received!');
      console.log('👤 User role:', data.user.role);
      console.log('🎫 Token starts with:', data.token.substring(0, 50) + '...');
      
      // Test authenticated API call
      console.log('\n🔐 Testing authenticated API call...');
      const usersResponse = await fetch('http://localhost:3000/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const usersData = await usersResponse.json();
      console.log('👥 Users API Response Status:', usersResponse.status);
      
      if (usersResponse.ok) {
        console.log('✅ Authenticated API call successful!');
        console.log('👥 Number of users found:', usersData.users ? usersData.users.length : 'No users array');
      } else {
        console.log('❌ Authenticated API call failed:', usersData);
      }
      
    } else {
      console.log('❌ Direct login failed:', data.message);
    }
    
  } catch (error) {
    console.error('🚨 Error testing direct login:', error.message);
  }
};

testDirectLogin();