// Debug script to test session management
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/usermodel.js';
import sessionService from './backend/services/sessionService.js';

dotenv.config();

const debugSession = async () => {
  try {
    // Connect to database
    const mongoUrl = process.env.MONGO_URL || 'mongodb+srv://demo:demo123@cluster0.mongodb.net/farmnex';
    console.log('Connecting to:', mongoUrl.replace(/:\/\/.*@/, '://**:**@'));
    await mongoose.connect(mongoUrl);
    console.log('✅ Database connected');

    // Find users with active sessions
    const usersWithSessions = await User.find({
      'currentSession.sessionId': { $ne: null }
    }).select('fullName email currentSession');

    console.log('\n🔍 Users with active sessions:');
    console.log('Total:', usersWithSessions.length);
    
    usersWithSessions.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.fullName} (${user.email})`);
      console.log(`   Session ID: ${user.currentSession?.sessionId}`);
      console.log(`   Login Time: ${user.currentSession?.loginTime}`);
      console.log(`   Last Activity: ${user.currentSession?.lastActivity}`);
      console.log(`   IP: ${user.currentSession?.ipAddress}`);
    });

    // Test session validation for the first user if exists
    if (usersWithSessions.length > 0) {
      const testUser = usersWithSessions[0];
      console.log(`\n🧪 Testing session validation for ${testUser.fullName}:`);
      
      const isValid = await sessionService.validateSession(
        testUser._id, 
        testUser.currentSession.sessionId
      );
      
      console.log(`Session valid: ${isValid}`);
      
      if (!isValid) {
        console.log('❌ Session is invalid - this might be the issue!');
        
        // Check why it's invalid
        const now = new Date();
        const loginTime = new Date(testUser.currentSession.loginTime);
        const sessionAge = now - loginTime;
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
        
        console.log(`Current time: ${now}`);
        console.log(`Login time: ${loginTime}`);
        console.log(`Session age: ${Math.round(sessionAge / 1000 / 60)} minutes`);
        console.log(`Max age: ${Math.round(maxSessionAge / 1000 / 60)} minutes`);
        console.log(`Expired: ${sessionAge > maxSessionAge}`);
      }
    }

    // Check for any database connection issues
    const dbState = mongoose.connection.readyState;
    console.log(`\n📊 Database connection state: ${dbState} (1=connected, 0=disconnected)`);

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected');
  }
};

debugSession();