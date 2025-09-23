import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/order.js';
import User from './models/usermodel.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Try local first
    try {
      await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/farmnex');
      console.log('✅ Connected to local MongoDB');
    } catch (localError) {
      console.log('❌ Local MongoDB connection failed, trying Atlas...');
      await mongoose.connect(process.env.MONGODB_ATLAS_URI);
      console.log('✅ Connected to MongoDB Atlas');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixOrderCustomerIds = async () => {
  try {
    console.log('🔧 Starting to fix order customer IDs...');

    // Get the test user
    const testUser = await User.findOne({ email: 'test@farmnex.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`👤 Found test user: ${testUser.fullName} (${testUser.email}) - ID: ${testUser._id}`);

    // Find orders that need fixing
    const ordersToFix = await Order.find({ 
      contactEmail: 'test@farmnex.com',
      customerId: { $in: [null, undefined] }
    });

    console.log(`📋 Found ${ordersToFix.length} orders to fix`);

    if (ordersToFix.length === 0) {
      console.log('✅ No orders need fixing');
      return;
    }

    // Update the orders
    const result = await Order.updateMany(
      { 
        contactEmail: 'test@farmnex.com',
        customerId: { $in: [null, undefined] }
      },
      { 
        $set: { customerId: testUser._id }
      }
    );

    console.log(`✅ Fixed ${result.modifiedCount} orders`);

    // Verify the fix
    const verifyOrders = await Order.find({ contactEmail: 'test@farmnex.com' });
    console.log('\n📊 Verification:');
    verifyOrders.forEach((order, index) => {
      console.log(`  Order ${index + 1}: ${order._id}`);
      console.log(`    CustomerID: ${order.customerId}`);
      console.log(`    Contact Email: ${order.contactEmail}`);
      console.log(`    Payment Completed: ${order.paymentcompleted}`);
      console.log(`    Total: $${order.total}`);
      console.log(`    Status: ${order.status}`);
      console.log('');
    });

    // Summary stats
    const totalOrders = await Order.countDocuments();
    const completedPayments = await Order.countDocuments({ paymentcompleted: true });
    const testUserOrders = await Order.countDocuments({ customerId: testUser._id });

    console.log('📈 Final Summary:');
    console.log(`  Total Orders: ${totalOrders}`);
    console.log(`  Completed Payments: ${completedPayments}`);
    console.log(`  Orders linked to test user: ${testUserOrders}`);

  } catch (error) {
    console.error('❌ Error fixing order customer IDs:', error);
  }
};

// Run the fix
const runFix = async () => {
  await connectDB();
  await fixOrderCustomerIds();
  mongoose.disconnect();
  console.log('🔐 Database connection closed');
  process.exit(0);
};

runFix().catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});