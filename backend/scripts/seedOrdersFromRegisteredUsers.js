import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from '../models/order.js';
import User from '../models/usermodel.js';

dotenv.config();

// Reuse the same connection approach as the app with sensible fallbacks
const connectDB = async () => {
  const mongoUrls = [
    process.env.MONGO_URL,
    process.env.MONGODB_URI,
    'mongodb://localhost:27017/farmnex',
    'mongodb://127.0.0.1:27017/farmnex'
  ].filter(Boolean);

  for (const url of mongoUrls) {
    try {
      console.log(`Attempting to connect to: ${url.split('@')[1] || url}`);
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✅ Connected to MongoDB: ${url.split('@')[1] || url}`);
      return;
    } catch (error) {
      console.log(`❌ Failed to connect: ${url.split('@')[1] || url}`);
      console.log(`   Error: ${error.message}`);
    }
  }
  throw new Error('Could not connect to any MongoDB instance');
};

const sampleProducts = [
  { name: 'Organic Tomatoes', price: 24.99, image: 'https://via.placeholder.com/150?text=Tomatoes' },
  { name: 'Fresh Lettuce', price: 15.0, image: 'https://via.placeholder.com/150?text=Lettuce' },
  { name: 'Organic Carrots', price: 18.99, image: 'https://via.placeholder.com/150?text=Carrots' },
  { name: 'Fresh Spinach', price: 22.5, image: 'https://via.placeholder.com/150?text=Spinach' },
  { name: 'Organic Potatoes', price: 12.99, image: 'https://via.placeholder.com/150?text=Potatoes' },
  { name: 'Fresh Herbs Bundle', price: 8.99, image: 'https://via.placeholder.com/150?text=Herbs' },
  { name: 'Organic Onions', price: 6.49, image: 'https://via.placeholder.com/150?text=Onions' },
  { name: 'Organic Apples', price: 15.99, image: 'https://via.placeholder.com/150?text=Apples' },
  { name: 'Fresh Berries', price: 12.49, image: 'https://via.placeholder.com/150?text=Berries' },
  { name: 'Organic Wheat', price: 25.99, image: 'https://via.placeholder.com/150?text=Wheat' },
  { name: 'Fresh Corn', price: 8.99, image: 'https://via.placeholder.com/150?text=Corn' }
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = (arr) => arr[randInt(0, arr.length - 1)];

const buildItems = () => {
  const count = randInt(1, 5);
  const items = [];
  const used = new Set();
  while (items.length < count) {
    const p = choice(sampleProducts);
    if (used.has(p.name)) continue;
    used.add(p.name);
    items.push({
      productId: `sku_${p.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: p.name,
      price: p.price,
      quantity: randInt(1, 4),
      image: p.image,
      description: `${p.name} - high quality produce`
    });
  }
  return items;
};

const computeTotals = (items) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Number((subtotal * 0.07).toFixed(2));
  const shipping = subtotal > 150 ? 0 : 10;
  const discount = Number((Math.random() < 0.2 ? subtotal * 0.05 : 0).toFixed(2));
  const total = Number((subtotal + tax + shipping - discount).toFixed(2));
  return { subtotal, tax, shipping, discount, total };
};

const randomDateWithinDays = (days) => {
  const now = Date.now();
  const past = now - randInt(0, days) * 24 * 60 * 60 * 1000 - randInt(0, 86400000);
  return new Date(past);
};

const createOrdersForUsers = async ({ perUser = 2, days = 30, onlyCustomers = true } = {}) => {
  const userQuery = onlyCustomers ? { role: { $in: ['Customer', 'customer'] } } : {};
  const users = await User.find(userQuery).limit(20);
  if (!users.length) {
    console.log('⚠️ No users found to seed orders for.');
    return { created: 0 };
  }

  console.log(`Found ${users.length} users. Creating up to ${perUser} orders each...`);

  const toInsert = [];
  for (const user of users) {
    const count = perUser === 'random' ? randInt(1, 3) : perUser;
    for (let i = 0; i < count; i++) {
      const items = buildItems();
      const totals = computeTotals(items);
      const createdAt = randomDateWithinDays(days);
      const paid = Math.random() < 0.7; // 70% paid
      const statusPool = paid ? ['processing', 'shipped', 'delivered'] : ['pending', 'cancelled'];
      const status = choice(statusPool);

      toInsert.push({
        customerId: user._id,
        items,
        ...totals,
        status,
        paymentMethod: choice(['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']),
        shippingAddress: {
          name: user.fullName || user.username || 'Customer',
          street: `${randInt(1, 999)} ${choice(['Main St', 'Oak Ave', 'Pine Rd', 'Maple Ave'])}`,
          city: choice(['Springfield', 'Chicago', 'Denver', 'Portland', 'Austin']),
          state: choice(['IL', 'CO', 'OR', 'TX', 'CA']),
          zipCode: String(70000 + randInt(0, 999)),
          phone: user.phone || `+1-555-${randInt(1000, 9999)}`
        },
        billingAddress: undefined,
        contactName: user.fullName || user.username || 'Customer',
        contactEmail: user.email,
        contactPhone: user.phone || `+1-555-${randInt(1000, 9999)}`,
        paymentcompleted: paid,
        shippinginfo: true,
        createdAt,
        updatedAt: createdAt
      });
    }
  }

  if (!toInsert.length) {
    console.log('Nothing to insert.');
    return { created: 0 };
  }

  const result = await Order.insertMany(toInsert, { ordered: false });
  console.log(`✅ Inserted ${result.length} orders`);
  return { created: result.length };
};

const main = async () => {
  try {
    await connectDB();

    // CLI args: --perUser=3 --days=45
    const args = Object.fromEntries(process.argv.slice(2).map(arg => {
      const [k, v] = arg.replace(/^--/, '').split('=');
      return [k, v ?? true];
    }));

    const perUser = args.perUser === 'random' ? 'random' : Number(args.perUser || 2);
    const days = Number(args.days || 30);

    const { created } = await createOrdersForUsers({ perUser, days, onlyCustomers: true });
    console.log(`Done. Created ${created} orders.`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
