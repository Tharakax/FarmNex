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

const parseArgTails = () => {
  // Prefer explicit arg
  const arg = process.argv.find(a => a.startsWith('--tails='));
  if (arg) return arg.replace('--tails=', '').split(',').map(s => s.trim()).filter(Boolean);
  // Support npm passing as npm_config_tails
  if (process.env.npm_config_tails) {
    return String(process.env.npm_config_tails).split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
  }
  // Support env var TAILS
  if (process.env.TAILS) {
    return String(process.env.TAILS).split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const run = async () => {
  const Order = (await import('../models/order.js')).default;
  const tails = parseArgTails();
  if (!tails.length) {
    console.log('Usage: node scripts/deleteOrdersByTail.js --tails=tail1,tail2,... [--apply]');
    process.exit(1);
  }
  const apply = process.argv.includes('--apply') || Boolean(process.env.npm_config_apply) || String(process.env.APPLY||'').toLowerCase()==='true';

  const all = await Order.find({}).sort({ createdAt: -1 }).lean();
  const matches = all.filter(o => tails.some(t => o._id.toString().endsWith(t)));

  if (matches.length === 0) {
    console.log('No matching orders found for tails:', tails);
    return;
  }

  console.log(`Found ${matches.length} matching orders:`);
  for (const m of matches) {
    const id = m._id.toString();
    console.log(`${id} tail=${id.slice(-8)} | ${m.contactName || 'N/A'} | ${m.contactEmail || 'N/A'} | ${m.status} | ${m.total} | ${new Date(m.createdAt).toISOString()}`);
  }

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to delete.');
    return;
  }

  const ids = matches.map(m => m._id);
  const res = await Order.deleteMany({ _id: { $in: ids } });
  console.log(`\nDeleted ${res.deletedCount} orders.`);
};

connectDB().then(run).then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
