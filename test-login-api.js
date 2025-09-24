import fetch from 'node-fetch';

const testLoginAPI = async () => {
  try {
    console.log('🧪 Testing login API...');
    
    const response = await fetch('http://localhost:3000/users/login-otp-step1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'shababhanaan22@gmail.com'
      }),
    });
    
    const data = await response.json();
    
    console.log('📡 API Response Status:', response.status);
    console.log('📄 API Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login API working - user exists');
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('🚨 Error testing login API:', error.message);
  }
};

testLoginAPI();