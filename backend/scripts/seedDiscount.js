// Seed discount codes in MongoDB
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Discount = require('../src/models/discount.models');

const seedDiscounts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing discounts
    await Discount.deleteMany({});
    console.log('Cleared existing discounts');

    const now = new Date();
    const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

    const discounts = [
      {
        code: 'WELCOME20',
        type: 'PERCENTAGE',
        value: 20,
        description: 'Welcome discount - 20% off for new customers',
        minOrderAmount: 50000,
        usageLimit: 100,
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE',
        createdBy: 'system'
      },
      {
        code: 'SAVE50K',
        type: 'FIXED',
        value: 50000,
        description: 'Save 50k on orders over 200k',
        minOrderAmount: 200000,
        usageLimit: null, // Unlimited
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE',
        createdBy: 'system'
      },
      {
        code: 'SUMMER15',
        type: 'PERCENTAGE',
        value: 15,
        description: 'Summer promotion - 15% off',
        maxDiscountAmount: 100000,
        minOrderAmount: 0,
        usageLimit: 50,
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE',
        createdBy: 'system'
      },
      {
        code: 'FIRST100K',
        type: 'FIXED',
        value: 100000,
        description: 'First order - Get 100k discount',
        minOrderAmount: 300000,
        usageLimit: 200,
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE',
        createdBy: 'system'
      },
      {
        code: 'VIP50',
        type: 'PERCENTAGE',
        value: 50,
        description: 'VIP member exclusive - 50% off',
        maxDiscountAmount: 500000,
        minOrderAmount: 100000,
        usageLimit: 10,
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE',
        createdBy: 'system'
      },
      {
        code: 'LOYALTY25',
        type: 'PERCENTAGE',
        value: 25,
        description: 'Loyalty reward - 25% discount',
        minOrderAmount: 150000,
        usageLimit: null,
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE',
        createdBy: 'system'
      },
      {
        code: 'BULK10PERCENT',
        type: 'PERCENTAGE',
        value: 10,
        description: 'Bulk order discount - 10% off',
        minOrderAmount: 1000000,
        usageLimit: 30,
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE',
        createdBy: 'system'
      },
      {
        code: 'EXPIRED2024',
        type: 'PERCENTAGE',
        value: 30,
        description: 'Old expired discount',
        minOrderAmount: 50000,
        usageLimit: 100,
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // expired 5 days ago
        status: 'EXPIRED',
        createdBy: 'system'
      }
    ];

    await Discount.insertMany(discounts);
    console.log(`✅ Successfully seeded ${discounts.length} discount codes`);

    // Display the created discounts
    const created = await Discount.find({});
    console.log('\nCreated Discounts:');
    created.forEach(d => {
      console.log(`  - ${d.code}: ${d.type} ${d.value}${d.type === 'PERCENTAGE' ? '%' : 'đ'} (Uses: ${d.usedCount}/${d.usageLimit || 'Unlimited'})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Seeding completed');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDiscounts();
