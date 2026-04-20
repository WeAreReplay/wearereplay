import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

/**
 * Seed script to create a default admin user
 * Run this script with: node src/seedAdmin.js
 */
const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/replay';
    await mongoose.connect(mongoURI);
    console.log('📦 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log('\n📝 To create a new admin, delete the existing one first or use the register endpoint with role: admin');
      process.exit(0);
    }

    // Create default admin user
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@replay.com',
      password: 'AdminPass123!', // Change this after first login
      role: 'admin',
    };

    const admin = await User.create(adminData);

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   ID: ${admin._id}`);
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    console.log('   Default password: AdminPass123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();
