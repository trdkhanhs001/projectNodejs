require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Category = require('../src/models/category.model');
const Menu = require('../src/models/menu.model');
const Admin = require('../src/models/admin.model');
const cloudinary = require('../src/config/cloudinary');

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

async function uploadImageToCloudinary(imagePath, menuName) {
  try {
    console.log(`   📥 Downloading image from: ${imagePath}`);
    
    const response = await axios.get(imagePath, {
      responseType: 'arraybuffer',
      timeout: 10000
    });

    console.log(`   ☁️  Uploading to Cloudinary...`);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'restaurant/menus',
          resource_type: 'auto',
          public_id: `menu_${menuName.toLowerCase().replace(/\s+/g, '_')}`,
          format: 'jpg',
          quality: 'auto',
          overwrite: true
        },
        (error, result) => {
          if (error) {
            console.error(`❌ Upload failed: ${error.message}`);
            reject(error);
          } else {
            console.log(`✅ Uploaded: ${menuName}`);
            resolve(result.secure_url);
          }
        }
      );
      
      uploadStream.end(response.data);
    });
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

const menus = [
  {
    name: 'Chả Cuốn',
    description: 'Chả cuốn tôm nằm gạo, nước mắm',
    price: 45000,
    calories: 150,
    isVegan: false,
    isSpicy: false,
    preparationTime: 10,
    category: 'Khai Vị',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1598675502828-92f2fb2ff625?w=500&h=500&fit=crop'
  },
  {
    name: 'Canh Chua Cá',
    description: 'Canh chua cá tươi, dứa, cà chua',
    price: 85000,
    calories: 180,
    isVegan: false,
    isSpicy: true,
    preparationTime: 20,
    category: 'Canh & Súp',
    imageUrl: 'https://images.unsplash.com/photo-1618164436241-4473940571cd?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1585962311921-c3400ca199e7?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=500&h=500&fit=crop'
  },
  {
    name: 'Cơm Tấm Sườn Nướng',
    description: 'Cơm tấm kỵ, sườn nướng, trứng',
    price: 55000,
    calories: 450,
    isVegan: false,
    isSpicy: false,
    preparationTime: 15,
    category: 'Cơm',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1609335314727-a542d1b9b6b0?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1609301869903-f4b7b5fe229c?w=500&h=500&fit=crop'
  },
  {
    name: 'Phở Bò',
    description: 'Phở tươi, thịt bò nạm, nước dùng',
    price: 55000,
    calories: 380,
    isVegan: false,
    isSpicy: false,
    preparationTime: 12,
    category: 'Mì & Bún',
    imageUrl: 'https://images.unsplash.com/photo-1569718212b34293a32a9f3e6c69dd1f1ae9e96e?w=500&h=500&fit=crop'
  },
  {
    name: 'Bún Riêu Cua',
    description: 'Bún, nước riêu cua cà chua',
    price: 45000,
    calories: 320,
    isVegan: false,
    isSpicy: true,
    preparationTime: 15,
    category: 'Mì & Bún',
    imageUrl: 'https://images.unsplash.com/photo-1596855927850-ae3bfb17ea10?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1583521214271-41b2a1443f9f?w=500&h=500&fit=crop'
  },
  {
    name: 'Thịt Xiên Nướng',
    description: 'Thịt lợn nướng, tỏi, tiêu',
    price: 75000,
    calories: 380,
    isVegan: false,
    isSpicy: true,
    preparationTime: 20,
    category: 'Thịt',
    imageUrl: 'https://images.unsplash.com/photo-1599599810694-e3f08b7dff18?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1599599810983-90a6fc8e9b7a?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1596740505207-eb995a837f50?w=500&h=500&fit=crop'
  },
  {
    name: 'Tôm Nướng Muối',
    description: 'Tôm tươi nướng, muối tiêu',
    price: 120000,
    calories: 280,
    isVegan: false,
    isSpicy: false,
    preparationTime: 18,
    category: 'Hải Sản',
    imageUrl: 'https://images.unsplash.com/photo-1599599810922-c35521bb037b?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1599599909612-a36a32e0e5c0?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1599599810744-1b6f7e6eb3e1?w=500&h=500&fit=crop'
  },
  {
    name: 'Rau Luộc Nước Mắm',
    description: 'Rau xanh luộc, nước mắm tỏi',
    price: 25000,
    calories: 80,
    isVegan: true,
    isSpicy: false,
    preparationTime: 5,
    category: 'Rau & Chay',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=500&fit=crop'
  },
  {
    name: 'Nước Cam Tươi',
    description: 'Nước cam vắt tươi, không đường',
    price: 15000,
    calories: 80,
    isVegan: true,
    isSpicy: false,
    preparationTime: 3,
    category: 'Đồ Uống',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1559518773-7c1f78ca6e38?w=500&h=500&fit=crop'
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
    imageUrl: 'https://images.unsplash.com/photo-1597318866302-02d6e53f6e13?w=500&h=500&fit=crop'
  },
];

async function seed() {
  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const admin = await Admin.findOne();
    if (!admin) {
      throw new Error('No admin account found. Please run "npm run seed" first.');
    }
    const adminId = admin._id;
    console.log(`✅ Using admin: ${admin.username}\n`);

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

    console.log('📝 Seeding Menu Items with Images...\n');
    
    for (const menuData of menus) {
      const existing = await Menu.findOne({ name: menuData.name });
      if (existing) {
        console.log(`⚠️  Menu exists: ${menuData.name}`);
      } else {
        let menuImage = null;
        
        if (menuData.imageUrl) {
          menuImage = await uploadImageToCloudinary(menuData.imageUrl, menuData.name);
        }
        
        const newMenu = new Menu({
          name: menuData.name,
          description: menuData.description,
          price: menuData.price,
          category: categoryMap[menuData.category],
          calories: menuData.calories,
          isVegan: menuData.isVegan,
          isSpicy: menuData.isSpicy,
          preparationTime: menuData.preparationTime,
          image: menuImage,
          isActive: true,
          createdBy: adminId
        });
        await newMenu.save();
        console.log(`✅ Created menu: ${menuData.name}\n`);
      }
    }
    console.log('\n');

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
