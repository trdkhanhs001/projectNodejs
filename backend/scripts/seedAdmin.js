/**
 * Seed script to initialize default admin account from .env
 * Run: node scripts/seedAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../src/models/admin.model');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function seedAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
    });

    if (existingAdmin) {
      console.log('⚠️  Default admin account already exists:');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('   Skipping seed...');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

      // Create default admin
      const defaultAdmin = new Admin({
        username: ADMIN_USERNAME,
        password: hashedPassword,
        email: ADMIN_EMAIL,
        fullName: 'Administrator',
        phone: '0000000001',
        address: 'Restaurant',
        role: 'ADMIN',
        isActive: true,
        createdBy: 'system'
      });

      await defaultAdmin.save();
      console.log('✅ Default admin account created successfully!');
      console.log(`   Username: ${ADMIN_USERNAME}`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Role: ADMIN`);
    }

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
