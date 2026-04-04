const mongoose = require('mongoose');
require('dotenv').config();

const DiningTable = require('../src/models/diningTable.model');
const Admin = require('../src/models/admin.model');

const seedTables = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // Get admin ID
    const admin = await Admin.findOne({ email: 'admin@restaurant.com' });
    if (!admin) {
      throw new Error('Admin account not found. Run seed:admin first.');
    }

    // Clear old tables
    await DiningTable.deleteMany({});
    console.log('🗑️ Cleared old tables');

    // Create tables
    const tables = [];

    // Area 1: Tầng 1 (Ground Floor) - 10 tables
    for (let i = 1; i <= 10; i++) {
      tables.push({
        tableNumber: `T1-${i}`,
        capacity: i <= 4 ? 2 : i <= 7 ? 4 : 6,
        area: 'Tầng 1',
        status: 'AVAILABLE',
        createdBy: admin._id
      });
    }

    // Area 2: Tầng 2 (Floor 2) - 8 tables
    for (let i = 1; i <= 8; i++) {
      tables.push({
        tableNumber: `T2-${i}`,
        capacity: i <= 3 ? 2 : i <= 6 ? 4 : 6,
        area: 'Tầng 2',
        status: 'AVAILABLE',
        createdBy: admin._id
      });
    }

    // Area 3: Khu thưởng thức (Lounge) - 5 tables
    for (let i = 1; i <= 5; i++) {
      tables.push({
        tableNumber: `L-${i}`,
        capacity: 4,
        area: 'Khu thưởng thức',
        status: 'AVAILABLE',
        createdBy: admin._id
      });
    }

    await DiningTable.insertMany(tables);
    console.log(`✅ Created ${tables.length} tables`);

    // Show statistics
    const stats = {
      total: await DiningTable.countDocuments(),
      available: await DiningTable.countDocuments({ status: 'AVAILABLE' }),
      area1: await DiningTable.countDocuments({ area: 'Tầng 1' }),
      area2: await DiningTable.countDocuments({ area: 'Tầng 2' }),
      lounge: await DiningTable.countDocuments({ area: 'Khu thưởng thức' })
    };

    console.log('📊 Table Statistics:', stats);
    console.log('✅ Seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedTables();
