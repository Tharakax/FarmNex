// Comprehensive session system diagnosis
import axios from 'axios';

const diagnoseSession = async () => {
  console.log('🔍 COMPREHENSIVE SESSION DIAGNOSIS');
  console.log('==================================');
  
  // Test 1: Backend Health
  console.log('\n1. 🏥 Testing Backend Health...');
  try {
    const healthResponse = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Backend is running:', healthResponse.data);
  } catch (error) {
    console.log('❌ Backend is not accessible:', error.message);
    return;
  }

  // Test 2: Direct Login (without OTP)
  console.log('\n2. 🔐 Testing Direct Login...');
  try {
    const loginResponse = await axios.post('http://localhost:3000/api/user/login', {
      email: 'shababhanaan22@gmail.com',
      password: 'your-password-here'  // You'll need to replace this
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Direct login successful!');
      console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
      console.log('User data:', loginResponse.data.user);
      
      // Test 3: Session Status with Fresh Token
      console.log('\n3. 🔍 Testing Session Status with Fresh Token...');
      try {
        const sessionResponse = await axios.get('http://localhost:3000/users/session/status', {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          }
        });
        
        if (sessionResponse.data.success) {
          console.log('✅ Session validation successful!');
          console.log('Session info:', sessionResponse.data.sessionInfo);
          console.log('User info:', sessionResponse.data.user);
          
          console.log('\n🎉 SESSION MANAGEMENT IS WORKING CORRECTLY!');
          console.log('The issue must be in the frontend or browser.');
          
        } else {
          console.log('❌ Session validation failed:', sessionResponse.data.message);
        }
        
      } catch (sessionError) {
        console.log('❌ Session validation error:', sessionError.response?.data || sessionError.message);
      }
      
    } else {
      console.log('❌ Direct login failed:', loginResponse.data.message);
    }
    
  } catch (loginError) {
    if (loginError.response?.status === 404) {
      console.log('⚠️ Direct login endpoint not found - trying OTP login...');
      
      // Test 4: OTP Login Process
      console.log('\n4. 📱 Testing OTP Login Process...');
      try {
        const otpResponse = await axios.post('http://localhost:3000/users/login-otp-step1', {
          email: 'shababhanaan22@gmail.com'
        });
        
        console.log('OTP Request Result:', otpResponse.data);
        
        if (otpResponse.data.success) {
          console.log('✅ OTP request successful - check your email');
          console.log('📝 To complete the test, get your OTP and run:');
          console.log('   node verify-otp-test.js YOUR_OTP_HERE');
        }
        
      } catch (otpError) {
        console.log('❌ OTP login failed:', otpError.response?.data || otpError.message);
      }
      
    } else {
      console.log('❌ Login error:', loginError.response?.data || loginError.message);
    }
  }

  // Test 5: JWT Secret Check
  console.log('\n5. 🔑 Checking JWT Configuration...');
  if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET is configured');
  } else {
    console.log('❌ JWT_SECRET is missing - this could cause issues');
  }

  console.log('\n📋 DIAGNOSIS SUMMARY:');
  console.log('- If backend health passed but session validation failed = Database/Session issue');
  console.log('- If login worked but session validation failed = Session service issue'); 
  console.log('- If everything works here but frontend shows errors = Frontend issue');
  console.log('- Check browser console for frontend session manager logs');
};

diagnoseSession();