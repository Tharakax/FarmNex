import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  const mongoUrls = [
    process.env.MONGO_URL,
    process.env.MONGODB_URI,
    'mongodb://localhost:27017/farmnex',
    'mongodb://127.0.0.1:27017/farmnex'
  ].filter(Boolean);

  for (const url of mongoUrls) {
    try {
      await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
      console.log(`Connected to: ${url.split('@')[1] || url}`);
      return;
    } catch (err) {
      console.log(`Failed to connect to ${url}: ${err.message}`);
    }
  }
  console.error('Could not connect to any MongoDB instance');
  process.exit(1);
};

const run = async () => {
  const Order = (await import('../models/order.js')).default;
  const limit = Number(process.env.LIMIT || 50);
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  console.log(`Listing ${orders.length} most recent orders:`);
  for (const o of orders) {
    const id = o._id.toString();
    const tail = id.slice(-8);
    const name = o.contactName || 'N/A';
    const email = o.contactEmail || 'N/A';
    const total = o.total;
    const status = o.status;
    const created = new Date(o.createdAt).toISOString();
    console.log(`${id} tail=${tail} | ${name} | ${email} | ${status} | ${total} | ${created}`);
  }
};

connectDB().then(run).then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
