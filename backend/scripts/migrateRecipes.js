import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Recipe from '../models/recipe.js';

dotenv.config();

const MONGO_URLS = [
  process.env.MONGO_URL,
  process.env.MONGODB_URI,
  'mongodb://localhost:27017/farmnex',
  'mongodb://127.0.0.1:27017/farmnex'
].filter(Boolean);

async function connect() {
  for (const url of MONGO_URLS) {
    try {
      await mongoose.connect(url);
      console.log('✅ Connected to', url);
      return;
    } catch (e) {
      console.warn('❌ Failed to connect:', url, e.message);
    }
  }
  throw new Error('Could not connect to any MongoDB instance');
}

async function ensureCounter(maxId) {
  // Counter model is defined inside recipe model as mongoose.models.Counter
  const Counter = mongoose.models.Counter;
  const doc = await Counter.findById('recipeId');
  if (!doc) {
    await Counter.create({ _id: 'recipeId', seq: maxId || 0 });
    console.log('🆕 Created counter with seq =', maxId || 0);
  } else if (doc.seq < (maxId || 0)) {
    doc.seq = maxId;
    await doc.save();
    console.log('🔧 Bumped counter to seq =', maxId);
  } else {
    console.log('ℹ️ Counter OK at seq =', doc.seq);
  }
}

function toTimeString(obj) {
  const fields = ['time', 'cookTime', 'cooktime', 'duration'];
  for (const f of fields) {
    const v = obj?.[f];
    if (!v) continue;
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return `${v} mins`;
  }
  return '30 mins';
}

async function migrate() {
  await connect();

  // Determine current max numeric recipeId
  const max = await Recipe.aggregate([
    { $match: { recipeId: { $type: 'number' } } },
    { $group: { _id: null, max: { $max: '$recipeId' } } }
  ]);
  const maxId = max[0]?.max || 0;
  await ensureCounter(maxId);

  const Counter = mongoose.models.Counter;

  const cursor = Recipe.find({ $or: [ { recipeId: { $exists: false } }, { recipeId: null }, { recipeId: { $type: 'string' } } ] }).cursor();
  let updatedCount = 0;
  for await (const doc of cursor) {
    const c = await Counter.findByIdAndUpdate('recipeId', { $inc: { seq: 1 } }, { new: true, upsert: true });
    doc.recipeId = c.seq;
    if (!doc.time) {
      doc.time = toTimeString(doc);
    }
    await doc.save();
    updatedCount++;
  }

  // Add default time to any docs missing it
  const timeRes = await Recipe.updateMany({ $or: [{ time: { $exists: false } }, { time: '' }, { time: null }] }, { $set: { time: '30 mins' } });

  console.log(`✅ Migration complete. Assigned IDs to ${updatedCount} recipes. Time updated in ${timeRes.modifiedCount} docs.`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});