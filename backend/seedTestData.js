import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/order.js';
import Payment from './models/payment.js';
import User from './models/usermodel.js';
import Product from './models/product.js';

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

// Sample test data
const createTestData = async () => {
  try {
    console.log('🌱 Starting to seed test data...');

    // Clear existing test data (optional)
    console.log('🧹 Clearing existing test data...');
    await Order.deleteMany({});
    await Payment.deleteMany({});

    // Create a test user if doesn't exist
    let testUser = await User.findOne({ email: 'test@farmnex.com' });
    if (!testUser) {
      testUser = await User.create({
        fullName: 'Test Customer',
        email: 'test@farmnex.com',
        username: 'testcustomer',
        password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', // hashed password
        age: 30,
        role: 'Customer',
        phone: '555-0123',
        address: '123 Farm Road, Agriculture City, CA 90210',
        isVerified: true
      });
      console.log('👤 Created test user');
    }

    // Get some products from database for realistic orders
    const products = await Product.find().limit(10);
    console.log(`📦 Found ${products.length} products for test orders`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Creating sample products...');
      const sampleProducts = [
        {
          name: 'Organic Tomato Seeds',
          description: 'Premium organic tomato seeds for farming',
          price: 25.99,
          category: 'seeds',
          stock: 100,
          image: 'https://via.placeholder.com/300x300/4ade80/ffffff?text=Tomato+Seeds',
          rating: 4.5
        },
        {
          name: 'Fertilizer NPK 10-10-10',
          description: 'Balanced NPK fertilizer for all crops',
          price: 45.99,
          category: 'fertilizers',
          stock: 50,
          image: 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=Fertilizer',
          rating: 4.8
        },
        {
          name: 'Garden Hose 50ft',
          description: 'Durable garden hose for irrigation',
          price: 89.99,
          category: 'tools',
          stock: 25,
          image: 'https://via.placeholder.com/300x300/f59e0b/ffffff?text=Garden+Hose',
          rating: 4.3
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('✅ Created sample products');
    }

    const updatedProducts = await Product.find().limit(10);

    // Create test payment methods
    const paymentMethods = [
      {
        user: testUser._id,
        paymentMethodId: 'pm_test_visa_1234',
        cardBrand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
        billingDetails: {
          name: 'Test Customer',
          email: 'test@farmnex.com',
          address: {
            line1: '123 Farm Road',
            city: 'Agriculture City',
            state: 'CA',
            postal_code: '90210',
            country: 'US'
          }
        },
        isDefault: true
      },
      {
        user: testUser._id,
        paymentMethodId: 'pm_test_mastercard_5678',
        cardBrand: 'mastercard',
        last4: '5555',
        expMonth: 8,
        expYear: 2026,
        billingDetails: {
          name: 'Test Customer',
          email: 'test@farmnex.com'
        },
        isDefault: false
      }
    ];

    const createdPayments = await Payment.insertMany(paymentMethods);
    console.log('💳 Created test payment methods');

    // Create test orders with various statuses and dates
    const testOrders = [];
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const paymentMethodTypes = ['credit_card', 'paypal', 'bank_transfer'];

    for (let i = 0; i < 15; i++) {
      const orderItems = [];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      let subtotal = 0;

      // Create random items for this order
      for (let j = 0; j < numItems; j++) {
        const randomProduct = updatedProducts[Math.floor(Math.random() * updatedProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = randomProduct.price * quantity;
        
        orderItems.push({
          productId: randomProduct._id,
          name: randomProduct.name,
          price: randomProduct.price,
          quantity: quantity,
          image: randomProduct.image || 'https://via.placeholder.com/150x150/gray/white?text=Product',
          description: randomProduct.description
        });
        
        subtotal += itemTotal;
      }

      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
      const total = subtotal + tax + shipping;

      // Create order with date spreading over last 3 months
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));

      const order = {
        customerId: testUser._id,
        items: orderItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentMethod: paymentMethodTypes[Math.floor(Math.random() * paymentMethodTypes.length)],
        paymentcompleted: Math.random() > 0.2, // 80% of orders have completed payment
        shippingAddress: {
          name: 'Test Customer',
          street: `${100 + i} Farm Street`,
          city: 'Agriculture City',
          state: 'CA',
          zipCode: '90210',
          phone: '555-0123'
        },
        billingAddress: {
          name: 'Test Customer',
          street: `${100 + i} Farm Street`,
          city: 'Agriculture City',
          state: 'CA',
          zipCode: '90210',
          country: 'US'
        },
        contactName: 'Test Customer',
        contactEmail: 'test@farmnex.com',
        contactPhone: '555-0123',
        notes: i % 3 === 0 ? 'Please handle with care' : '',
        createdAt: createdDate,
        updatedAt: createdDate,
        shippinginfo: true
      };

      testOrders.push(order);
    }

    const createdOrders = await Order.insertMany(testOrders);
    console.log(`🛍️  Created ${createdOrders.length} test orders`);

    console.log('\n✅ Test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Users: 1 test user (test@farmnex.com)`);
    console.log(`💳 Payment Methods: ${createdPayments.length}`);
    console.log(`🛍️  Orders: ${createdOrders.length}`);
    console.log(`📦 Products: ${updatedProducts.length}`);
    
    // Display some statistics
    const totalSpent = createdOrders.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = createdOrders.filter(order => order.paymentcompleted).length;
    
    console.log(`\n💰 Total Order Value: $${totalSpent.toFixed(2)}`);
    console.log(`✅ Completed Payments: ${completedOrders}/${createdOrders.length}`);
    console.log(`📈 Average Order Value: $${(totalSpent / createdOrders.length).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  }
};

// Run the seeder
const runSeeder = async () => {
  await connectDB();
  await createTestData();
  mongoose.disconnect();
  console.log('🔐 Database connection closed');
  process.exit(0);
};

runSeeder().catch(error => {
  console.error('❌ Seeder failed:', error);
  process.exit(1);
});