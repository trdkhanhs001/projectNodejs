/**
 * Seed script to initialize default staff account from .env
 * Run: node scripts/seedStaff.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Staff = require('../src/models/staff.model');

const MONGODB_URI = process.env.MONGODB_URI;
const POS_USERNAME = process.env.POS_USERNAME;
const POS_PASSWORD = process.env.POS_PASSWORD;
const POS_EMAIL = process.env.POS_EMAIL;

async function seedStaff() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if staff already exists
    const existingStaff = await Staff.findOne({
      $or: [{ username: POS_USERNAME }, { email: POS_EMAIL }]
    });

    if (existingStaff) {
      console.log('⚠️  Default staff account already exists:');
      console.log(`   Username: ${existingStaff.username}`);
      console.log(`   Email: ${existingStaff.email}`);
      console.log('   Skipping seed...');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(POS_PASSWORD, 10);

      // Create default staff
      const defaultStaff = new Staff({
        username: POS_USERNAME,
        password: hashedPassword,
        email: POS_EMAIL,
        fullName: 'Default Staff Account',
        phone: '0000000000',
        position: 'CASHIER',
        salary: 0,
        role: 'STAFF',
        isActive: true,
        createdBy: null // System-created account
      });

      await defaultStaff.save();
      console.log('✅ Default staff account created successfully!');
      console.log(`   Username: ${POS_USERNAME}`);
      console.log(`   Email: ${POS_EMAIL}`);
      console.log(`   Position: CASHIER`);
    }

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding staff:', error.message);
    process.exit(1);
  }
}

seedStaff();
