// Test the session status for the current user
import axios from 'axios';

const testSessionStatus = async () => {
  try {
    console.log('🧪 Testing session status...');
    
    // Use the token with session ID
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTViYjBhZGM0NmZkNWFkYjBiYjNlZSIsInVzZXJJZCI6IjY3NTViYjBhZGM0NmZkNWFkYjBiYjNlZSIsIm5hbWUiOiJTaGFiYWIgSGFuYWFuIiwiZnVsbE5hbWUiOiJTaGFiYWIgSGFuYWFuIiwiZW1haWwiOiJzaGFiYWJoYW5hYW4yMkBnbWFpbC5jb20iLCJyb2xlIjoiRmFybVN0YWZmIiwic2Vzc2lvbklkIjoiMDQ2MGY3YWU5OTUyMGFjYTU0YjkyZWI1ZDFlZTc5ZWRhODdhMzIyNTMwMzMwNzNiZjY2YzI3MTYzYTc3ZWNiMSIsImlhdCI6MTc1ODg4NDY5MSwiZXhwIjoxNzU4OTcxMDkxfQ.invalid-signature';
    
    const response = await axios.get('http://localhost:3000/users/session/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    console.log('✅ Session status response:', response.data);
    
    if (response.data.success) {
      console.log('🎉 Session is VALID!');
      console.log('User:', response.data.user);
      console.log('Session Info:', response.data.sessionInfo);
    } else {
      console.log('❌ Session is invalid:', response.data.message);
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Session check failed:');
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data?.message || error.response.statusText);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to server - make sure backend is running on port 3000');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
};

testSessionStatus();