/**
 * Seed categories and menu items
 * Run: node scripts/seedMenu.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/category.model');
const Menu = require('../src/models/menu.model');
const Admin = require('../src/models/admin.model');

const MONGODB_URI = process.env.MONGODB_URI;

const categories = [
  { name: 'Khai Vị', description: 'Các món khai vị', displayOrder: 1 },
  { name: 'Canh & Súp', description: 'Canh, súp nóng', displayOrder: 2 },
  { name: 'Cơm', description: 'Các loại cơm', displayOrder: 3 },
  { name: 'Mì & Bún', description: 'Mì, bún, phở', displayOrder: 4 },
  { name: 'Thịt', description: 'Các món thịt nướng, chiên', displayOrder: 5 },
  { name: 'Hải Sản', description: 'Cá, tôm, mực', displayOrder: 6 },
  { name: 'Rau & Chay', description: 'Món chay, rau luộc', displayOrder: 7 },
  { name: 'Đồ Uống', description: 'Nước, nước ngọt', displayOrder: 8 },
];

const menus = [
  // Khai vị
  {
    name: 'Chả Cuốn',
    description: 'Chả cuốn tôm nằm gạo, nước mắm',
    price: 45000,
    calories: 150,
    isVegan: false,
    isSpicy: false,
    preparationTime: 10,
    category: 'Khai Vị',
  },
  {
    name: 'Gỏi Cuốn',
    description: 'Gỏi cuốn tôm thịt, rau sống',
    price: 35000,
    calories: 120,
    isVegan: false,
    isSpicy: false,
    preparationTime: 5,
    category: 'Khai Vị',
  },
  {
    name: 'Cánh Gà Nước Mắm',
    description: 'Cánh gà chiên, nước mắm gừng',
    price: 65000,
    calories: 250,
    isVegan: false,
    isSpicy: true,
    preparationTime: 15,
    category: 'Khai Vị',
  },
  // Canh & Súp
  {
    name: 'Canh Chua Cá',
    description: 'Canh chua cá tươi, dứa, cà chua',
    price: 85000,
    calories: 180,
    isVegan: false,
    isSpicy: true,
    preparationTime: 20,
    category: 'Canh & Súp',
  },
  {
    name: 'Canh Gà Sâm',
    description: 'Canh gà sâm, nấm hương',
    price: 95000,
    calories: 200,
    isVegan: false,
    isSpicy: false,
    preparationTime: 25,
    category: 'Canh & Súp',
  },
  {
    name: 'Canh Chua Tôm',
    description: 'Canh chua tôm, rau cải, dứa',
    price: 75000,
    calories: 160,
    isVegan: false,
    isSpicy: true,
    preparationTime: 18,
    category: 'Canh & Súp',
  },
  // Cơm
  {
    name: 'Cơm Tấm Sườn Nướng',
    description: 'Cơm tấm kỵ, sườn nướng, trứng',
    price: 55000,
    calories: 450,
    isVegan: false,
    isSpicy: false,
    preparationTime: 15,
    category: 'Cơm',
  },
  {
    name: 'Cơm Gà Hoa Tây',
    description: 'Cơm, gà nướng, cơm saffron',
    price: 65000,
    calories: 420,
    isVegan: false,
    isSpicy: false,
    preparationTime: 20,
    category: 'Cơm',
  },
  {
    name: 'Cơm Tộp Mâm',
    description: 'Cơm trắng với các loại topping',
    price: 45000,
    calories: 380,
    isVegan: true,
    isSpicy: false,
    preparationTime: 10,
    category: 'Cơm',
  },
  // Mì & Bún
  {
    name: 'Phở Bò',
    description: 'Phở tươi, thịt bò nạm, nước dùng',
    price: 55000,
    calories: 380,
    isVegan: false,
    isSpicy: false,
    preparationTime: 12,
    category: 'Mì & Bún',
  },
  {
    name: 'Bún Riêu Cua',
    description: 'Bún, nướng riêu cua cà chua',
    price: 45000,
    calories: 320,
    isVegan: false,
    isSpicy: true,
    preparationTime: 15,
    category: 'Mì & Bún',
  },
  {
    name: 'Mì Xào Hải Sản',
    description: 'Mì xào, tôm, mực, rau mix',
    price: 65000,
    calories: 420,
    isVegan: false,
    isSpicy: true,
    preparationTime: 18,
    category: 'Mì & Bún',
  },
  // Thịt
  {
    name: 'Thịt Xiên Nướng',
    description: 'Thịt lợn nướng, tỏi, tiêu',
    price: 75000,
    calories: 380,
    isVegan: false,
    isSpicy: true,
    preparationTime: 20,
    category: 'Thịt',
  },
  {
    name: 'Bò Nướng Muối Ớt',
    description: 'Bò nướng, muối ớt, chanh',
    price: 150000,
    calories: 450,
    isVegan: false,
    isSpicy: true,
    preparationTime: 25,
    category: 'Thịt',
  },
  {
    name: 'Gà Nướng Sả',
    description: 'Gà nướng sả, riêu, tương',
    price: 95000,
    calories: 420,
    isVegan: false,
    isSpicy: false,
    preparationTime: 22,
    category: 'Thịt',
  },
  // Hải sản
  {
    name: 'Tôm Nướng Muối',
    description: 'Tôm tươi nướng, muối tiêu',
    price: 120000,
    calories: 280,
    isVegan: false,
    isSpicy: false,
    preparationTime: 18,
    category: 'Hải Sản',
  },
  {
    name: 'Cua Nướng Dừa',
    description: 'Cua nướng, sốt dừa, rau sống',
    price: 180000,
    calories: 320,
    isVegan: false,
    isSpicy: false,
    preparationTime: 25,
    category: 'Hải Sản',
  },
  {
    name: 'Cá Nướng Giấy',
    description: 'Cá nướng giấy bạc, nước mắm',
    price: 95000,
    calories: 280,
    isVegan: false,
    isSpicy: true,
    preparationTime: 20,
    category: 'Hải Sản',
  },
  // Rau & Chay
  {
    name: 'Rau Luộc Nước Mắm',
    description: 'Rau xanh luộc, nước mắm tỏi',
    price: 25000,
    calories: 80,
    isVegan: true,
    isSpicy: false,
    preparationTime: 5,
    category: 'Rau & Chay',
  },
  {
    name: 'Đậu Phụ Chiên',
    description: 'Đậu phụ chiên vàng, sốt cà chua',
    price: 35000,
    calories: 150,
    isVegan: true,
    isSpicy: true,
    preparationTime: 12,
    category: 'Rau & Chay',
  },
  {
    name: 'Canh Rau Cải',
    description: 'Canh rau cải xanh, nấm',
    price: 28000,
    calories: 90,
    isVegan: true,
    isSpicy: false,
    preparationTime: 10,
    category: 'Rau & Chay',
  },
  // Đồ uống
  {
    name: 'Nước Cam Tươi',
    description: 'Nước cam vắt tươi, không đường',
    price: 15000,
    calories: 80,
    isVegan: true,
    isSpicy: false,
    preparationTime: 3,
    category: 'Đồ Uống',
  },
  {
    name: 'Cà Phê Đen',
    description: 'Cà phê đen đậm, đá',
    price: 12000,
    calories: 5,
    isVegan: true,
    isSpicy: false,
    preparationTime: 5,
    category: 'Đồ Uống',
  },
  {
    name: 'Trà Đá',
    description: 'Trà ô long đá, không đường',
    price: 10000,
    calories: 0,
    isVegan: true,
    isSpicy: false,
    preparationTime: 2,
    category: 'Đồ Uống',
  },
];

async function seed() {
  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin account for createdBy field
    const admin = await Admin.findOne();
    if (!admin) {
      throw new Error('No admin account found. Please run "npm run seed" first.');
    }
    const adminId = admin._id;
    console.log(`✅ Using admin: ${admin.username}\n`);

    // ============ SEED CATEGORIES ============
    console.log('📝 Seeding Categories...');
    const categoryMap = {};
    
    for (const catData of categories) {
      const existing = await Category.findOne({ name: catData.name });
      if (existing) {
        console.log(`⚠️  Category exists: ${catData.name}`);
        categoryMap[catData.name] = existing._id;
      } else {
        const newCat = new Category({
          name: catData.name,
          description: catData.description,
          displayOrder: catData.displayOrder,
          isActive: true,
          createdBy: adminId
        });
        await newCat.save();
        categoryMap[catData.name] = newCat._id;
        console.log(`✅ Created category: ${catData.name}`);
      }
    }
    console.log('\n');

    // ============ SEED MENUS ============
    console.log('📝 Seeding Menu Items...');
    
    for (const menuData of menus) {
      const existing = await Menu.findOne({ name: menuData.name });
      if (existing) {
        console.log(`⚠️  Menu exists: ${menuData.name}`);
      } else {
        const newMenu = new Menu({
          name: menuData.name,
          description: menuData.description,
          price: menuData.price,
          category: categoryMap[menuData.category],
          calories: menuData.calories,
          isVegan: menuData.isVegan,
          isSpicy: menuData.isSpicy,
          preparationTime: menuData.preparationTime,
          isActive: true,
          createdBy: adminId
        });
        await newMenu.save();
        console.log(`✅ Created menu: ${menuData.name}`);
      }
    }
    console.log('\n');

    // ============ SUMMARY ============
    console.log('═'.repeat(50));
    console.log('✅ Seeding completed successfully!\n');

    const catCount = await Category.countDocuments();
    const menuCount = await Menu.countDocuments();
    console.log(`📊 Database Stats:`);
    console.log(`   Categories: ${catCount}`);
    console.log(`   Menu Items: ${menuCount}`);
    console.log('═'.repeat(50) + '\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
}

seed();
