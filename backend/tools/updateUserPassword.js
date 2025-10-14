import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve backend .env path regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

const email = process.env.TARGET_EMAIL || 'shababhanaan22@gmail.com';
const newPassword = process.env.NEW_PASSWORD;

if (!newPassword) {
  console.log('Usage: NEW_PASSWORD="your_password" node updateUserPassword.js');
  process.exit(1);
}

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
      console.log(`[updateUserPassword] Trying: ${redacted}`);
      await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
      console.log('[updateUserPassword] Connected');
      return;
    } catch (err) {
      console.log(`[updateUserPassword] Failed: ${(url.split('@')[1] || url)}`);
    }
  }
  throw new Error('Could not connect to any MongoDB instance');
};

const run = async () => {
  try {
    await connectDB();
    const { default: User } = await import('../models/usermodel.js');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { password: hashedPassword },
      { new: true }
    );

    if (!updated) {
      console.log(JSON.stringify({ success: false, message: 'User not found', email }, null, 2));
      process.exit(1);
    }

    console.log(JSON.stringify({
      success: true,
      message: 'Password updated successfully',
      user: { email: updated.email, role: updated.role, fullName: updated.fullName }
    }, null, 2));
  } catch (e) {
    console.error('[updateUserPassword] Error:', e.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();