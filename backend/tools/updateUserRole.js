import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve backend .env path regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

const email = process.env.TARGET_EMAIL || 'shababhanaan22@gmail.com';
const newRole = process.env.NEW_ROLE || 'farmer';

const connectDB = async () => {
  const mongoUrls = [
    process.env.MONGO_URL,
    process.env.MONGODB_URI,
    'mongodb://localhost:27017/farmnex',
    'mongodb://127.0.0.1:27017/farmnex'
  ].filter(Boolean);

  for (const url of mongoUrls) {
    try {
      const redacted = url.replace(/:\/\/.+?@/, '://**:**@');
      console.log(`[updateUserRole] Trying: ${redacted}`);
      await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
      console.log('[updateUserRole] Connected');
      return;
    } catch (err) {
      console.log(`[updateUserRole] Failed: ${(url.split('@')[1] || url)}`);
    }
  }
  throw new Error('Could not connect to any MongoDB instance');
};

const run = async () => {
  try {
    await connectDB();
    const { default: User } = await import('../models/usermodel.js');

    const updated = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: newRole.toLowerCase() },
      { new: true }
    );

    if (!updated) {
      console.log(JSON.stringify({ success: false, message: 'User not found', email }, null, 2));
      process.exit(1);
    }

    console.log(JSON.stringify({
      success: true,
      message: 'Role updated',
      user: { email: updated.email, role: updated.role, fullName: updated.fullName }
    }, null, 2));
  } catch (e) {
    console.error('[updateUserRole] Error:', e.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
