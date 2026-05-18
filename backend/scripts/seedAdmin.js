import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

const seedAdmin = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required in .env file');
    process.exit(1);
  }

  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'sataninirajkumar0503@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'Jaygirnari@19';

  await mongoose.connect(uri);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    if (process.env.ADMIN_PASSWORD) {
      existing.password = await bcrypt.hash(password, 12);
    }
    await existing.save({ validateBeforeSave: false });
    console.log(`Admin updated: ${email}`);
  } else {
    await User.create({
      username,
      email,
      password,
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
  }

  console.log('Default credentials (change after first login):');
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log('Note: Admin role can only be assigned via this script or MongoDB directly.');

  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
