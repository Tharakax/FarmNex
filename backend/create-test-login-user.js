import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/usermodel.js';

dotenv.config();

const createTestUser = async () => {
  try {
    // Use the same connection logic as the main server
    const mongoUrls = [
      process.env.MONGO_URL,
      process.env.MONGODB_URI,
      'mongodb://localhost:27017/farmnex',
      'mongodb://127.0.0.1:27017/farmnex'
    ].filter(Boolean);

    let connected = false;
    for (const url of mongoUrls) {
      try {
        console.log(`Attempting to connect to: ${url.replace(/\/\/.*@/, '//**:**@')}`);
        await mongoose.connect(url, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000
        });
        console.log(`✅ Connected to MongoDB: ${url.split('@')[1] || url}`);
        connected = true;
        break;
      } catch (error) {
        console.log(`❌ Failed to connect to: ${url.split('@')[1] || url}`);
      }
    }

    if (!connected) {
      console.error('❌ Could not connect to any MongoDB instance');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'shababhanaan22@gmail.com' });
    
    if (existingUser) {
      console.log('👤 User already exists:', existingUser.email);
      console.log('   Role:', existingUser.role);
      console.log('   Full Name:', existingUser.fullName);
      process.exit(0);
    }

    // Create test user with admin role
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = new User({
      fullName: 'Shabab Hanaan',
      email: 'shababhanaan22@gmail.com',
      phone: '1234567890',
      age: 25,
      username: 'shababhanaan',
      password: hashedPassword,
      role: 'Admin',
      address: 'Test Address',
      isVerified: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: shababhanaan22@gmail.com');
    console.log('🔑 Password: password123');
    console.log('👑 Role: Admin');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestUser();