import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  const mongoUrls = [
    process.env.MONGO_URL,
    process.env.MONGODB_URI,
    'mongodb://localhost:27017/farmnex',
    'mongodb://127.0.0.1:27017/farmnex'
  ].filter(Boolean);

  for (const url of mongoUrls) {
    try {
      console.log(`Attempting to connect to: ${url.replace(/\/\/.*@/, '//**:**@')}`);
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // 5 second timeout
      });
      console.log(`✅ Database connected successfully to: ${url.split('@')[1] || url}`);
      return;
    } catch (error) {
      console.log(`❌ Failed to connect to: ${url.split('@')[1] || url}`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.error('❌ Could not connect to any MongoDB instance');
  throw new Error('Database connection failed');
};

// Order Schema (simplified)
const orderSchema = new mongoose.Schema({
  contactEmail: String,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, collection: 'orders' });

// User Schema (simplified)  
const userSchema = new mongoose.Schema({
  email: String,
  role: String
}, { collection: 'users' });

const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);

const fixOrder = async () => {
  try {
    await connectDB();
    
    const orderId = '68d6a4f1b26fe53e83cb69f6';
    const targetEmail = 'ahamedshabaab860@gmail.com';
    
    console.log(`Looking for order: ${orderId}`);
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found!');
      return;
    }
    
    console.log(`Current order contactEmail: ${order.contactEmail}`);
    console.log(`Current order customerId: ${order.customerId}`);
    
    // Find the target user
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.log(`User with email ${targetEmail} not found!`);
      return;
    }
    
    console.log(`Found user: ${user._id} (${user.email})`);
    
    // Update the order
    const result = await Order.findByIdAndUpdate(
      orderId,
      { 
        contactEmail: targetEmail,
        customerId: user._id 
      },
      { new: true }
    );
    
    console.log('Order updated successfully!');
    console.log(`New contactEmail: ${result.contactEmail}`);
    console.log(`New customerId: ${result.customerId}`);
    
    mongoose.connection.close();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error fixing order:', error);
    mongoose.connection.close();
  }
};

// Run the fix
fixOrder();