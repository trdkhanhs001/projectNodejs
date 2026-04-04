/**
 * Main seed script to initialize all default accounts
 * Run: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../src/models/admin.model');
const Staff = require('../src/models/staff.model');

const MONGODB_URI = process.env.MONGODB_URI;

// Admin credentials from .env
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Staff credentials from .env
const POS_USERNAME = process.env.POS_USERNAME;
const POS_PASSWORD = process.env.POS_PASSWORD;
const POS_EMAIL = process.env.POS_EMAIL;

async function seed() {
  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let createdCount = 0;

    // ============ SEED ADMIN ============
    console.log('📝 Checking admin account...');
    const existingAdmin = await Admin.findOne({
      $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin account already exists (skipping):');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}\n`);
    } else {
      const hashedAdminPwd = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const defaultAdmin = new Admin({
        username: ADMIN_USERNAME,
        password: hashedAdminPwd,
        email: ADMIN_EMAIL,
        fullName: 'Administrator',
        phone: '0000000001',
        address: 'Restaurant',
        role: 'ADMIN',
        isActive: true,
        createdBy: 'system'
      });
      await defaultAdmin.save();
      createdCount++;
      console.log('✅ Admin account created:');
      console.log(`   Username: ${ADMIN_USERNAME}`);
      console.log(`   Email: ${ADMIN_EMAIL}\n`);
    }

    // ============ SEED STAFF ============
    console.log('📝 Checking staff account...');
    const existingStaff = await Staff.findOne({
      $or: [{ username: POS_USERNAME }, { email: POS_EMAIL }]
    });

    if (existingStaff) {
      console.log('⚠️  Staff account already exists (skipping):');
      console.log(`   Username: ${existingStaff.username}`);
      console.log(`   Email: ${existingStaff.email}\n`);
    } else {
      const hashedStaffPwd = await bcrypt.hash(POS_PASSWORD, 10);
      const defaultStaff = new Staff({
        username: POS_USERNAME,
        password: hashedStaffPwd,
        email: POS_EMAIL,
        fullName: 'Default Staff Account',
        phone: '0000000000',
        position: 'CASHIER',
        salary: 0,
        role: 'STAFF',
        isActive: true,
        createdBy: null
      });
      await defaultStaff.save();
      createdCount++;
      console.log('✅ Staff account created:');
      console.log(`   Username: ${POS_USERNAME}`);
      console.log(`   Email: ${POS_EMAIL}\n`);
    }

    // ============ SUMMARY ============
    console.log('═'.repeat(50));
    if (createdCount > 0) {
      console.log(`✅ ${createdCount} new account(s) created successfully!\n`);
    } else {
      console.log('ℹ️  All default accounts already exist. Nothing created.\n');
    }

    console.log('📋 Next steps:');
    console.log(`   Admin Login:  username="${ADMIN_USERNAME}", password="${ADMIN_PASSWORD}"`);
    console.log(`   Staff Login:  username="${POS_USERNAME}", password="${POS_PASSWORD}"`);
    console.log('═'.repeat(50) + '\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
}

seed();
