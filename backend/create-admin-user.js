import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/usermodel.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@farmnex.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admin@farmnex.com',
      phone: '1234567890',
      age: 30,
      username: 'admin',
      password: hashedPassword,
      role: 'Admin',
      address: 'Admin Office',
      isVerified: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@farmnex.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: Admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser();