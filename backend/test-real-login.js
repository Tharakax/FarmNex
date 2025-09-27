// Test a real login to understand the session issue
import axios from 'axios';

const testRealLogin = async () => {
  try {
    console.log('🔐 Testing real login process...');
    
    // Step 1: Request OTP
    console.log('Step 1: Requesting OTP...');
    const otpResponse = await axios.post('http://localhost:3000/users/login-otp-step1', {
      email: 'shababhanaan22@gmail.com'
    });
    
    console.log('OTP Response:', otpResponse.data);
    
    if (otpResponse.data.success) {
      console.log('✅ OTP sent successfully');
      console.log('📱 Check your email for the OTP code');
      console.log('');
      console.log('⏳ Once you get the OTP, run this in a separate script:');
      console.log(`
// Step 2: Verify OTP (replace 'YOUR_OTP' with actual OTP from email)
import axios from 'axios';

const verifyOTP = async () => {
  try {
    const response = await axios.post('http://localhost:3000/users/verify-otp', {
      email: 'shababhanaan22@gmail.com',
      otp: 'YOUR_OTP_HERE'  // Replace with actual OTP
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
    
    // Test session status with real token
    const sessionResponse = await axios.get('http://localhost:3000/users/session/status', {
      headers: {
        'Authorization': \`Bearer \${response.data.token}\`
      }
    });
    
    console.log('Session Status:', sessionResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
};

verifyOTP();
      `);
    } else {
      console.log('❌ Failed to send OTP:', otpResponse.data.message);
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Request failed:');
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data?.message || error.response.statusText);
      console.log('Data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to server - make sure backend is running on port 3000');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
};

testRealLogin();