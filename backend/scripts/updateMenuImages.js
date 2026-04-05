require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Menu = require('../src/models/menu.model');
const cloudinary = require('../src/config/cloudinary');

const MONGODB_URI = process.env.MONGODB_URI;

const menuImages = [
  { name: 'Chả Cuốn', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop' },
  { name: 'Gỏi Cuốn', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop' },
  { name: 'Cánh Gà Nước Mắm', imageUrl: 'https://images.unsplash.com/photo-1598675502828-92f2fb2ff625?w=500&h=500&fit=crop' },
  { name: 'Canh Chua Cá', imageUrl: 'https://images.unsplash.com/photo-1618164436241-4473940571cd?w=500&h=500&fit=crop' },
  { name: 'Canh Gà Sâm', imageUrl: 'https://images.unsplash.com/photo-1585962311921-c3400ca199e7?w=500&h=500&fit=crop' },
  { name: 'Canh Chua Tôm', imageUrl: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=500&h=500&fit=crop' },
  { name: 'Cơm Tấm Sườn Nướng', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop' },
  { name: 'Cơm Gà Hoa Tây', imageUrl: 'https://images.unsplash.com/photo-1609335314727-a542d1b9b6b0?w=500&h=500&fit=crop' },
  { name: 'Cơm Tộp Mâm', imageUrl: 'https://images.unsplash.com/photo-1609301869903-f4b7b5fe229c?w=500&h=500&fit=crop' },
  { name: 'Phở Bò', imageUrl: 'https://images.unsplash.com/photo-1569718212b34293a32a9f3e6c69dd1f1ae9e96e?w=500&h=500&fit=crop' },
  { name: 'Bún Riêu Cua', imageUrl: 'https://images.unsplash.com/photo-1596855927850-ae3bfb17ea10?w=500&h=500&fit=crop' },
  { name: 'Mì Xào Hải Sản', imageUrl: 'https://images.unsplash.com/photo-1583521214271-41b2a1443f9f?w=500&h=500&fit=crop' },
  { name: 'Thịt Xiên Nướng', imageUrl: 'https://images.unsplash.com/photo-1599599810694-e3f08b7dff18?w=500&h=500&fit=crop' },
  { name: 'Bò Nướng Muối Ớt', imageUrl: 'https://images.unsplash.com/photo-1599599810983-90a6fc8e9b7a?w=500&h=500&fit=crop' },
  { name: 'Gà Nướng Sả', imageUrl: 'https://images.unsplash.com/photo-1596740505207-eb995a837f50?w=500&h=500&fit=crop' },
  { name: 'Tôm Nướng Muối', imageUrl: 'https://images.unsplash.com/photo-1599599810922-c35521bb037b?w=500&h=500&fit=crop' },
  { name: 'Cua Nướng Dừa', imageUrl: 'https://images.unsplash.com/photo-1599599909612-a36a32e0e5c0?w=500&h=500&fit=crop' },
  { name: 'Cá Nướng Giấy', imageUrl: 'https://images.unsplash.com/photo-1599599810744-1b6f7e6eb3e1?w=500&h=500&fit=crop' },
  { name: 'Rau Luộc Nước Mắm', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop' },
  { name: 'Đậu Phụ Chiên', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop' },
  { name: 'Canh Rau Cải', imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=500&fit=crop' },
  { name: 'Nước Cam Tươi', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop' },
  { name: 'Cà Phê Đen', imageUrl: 'https://images.unsplash.com/photo-1559518773-7c1f78ca6e38?w=500&h=500&fit=crop' },
  { name: 'Trà Đá', imageUrl: 'https://images.unsplash.com/photo-1597318866302-02d6e53f6e13?w=500&h=500&fit=crop' },
];

async function uploadImageToCloudinary(imageUrl, menuName) {
  try {
    console.log(`   📥 Downloading image from Unsplash...`);
    
    const response = await axios.get(imageUrl, {
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
            console.error(`   ❌ Upload failed: ${error.message}`);
            reject(error);
          } else {
            console.log(`   ✅ Image uploaded`);
            resolve(result.secure_url);
          }
        }
      );
      
      uploadStream.end(response.data);
    });
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function updateImages() {
  try {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📝 Updating Menu Images...\n');
    
    for (const menuData of menuImages) {
      console.log(`Processing: ${menuData.name}`);
      
      const menu = await Menu.findOne({ name: menuData.name });
      if (!menu) {
        console.log(`   ⚠️  Menu not found\n`);
        continue;
      }

      try {
        const imageUrl = await uploadImageToCloudinary(menuData.imageUrl, menuData.name);
        
        if (imageUrl) {
          menu.image = imageUrl;
          await menu.save();
          console.log(`   ✅ Updated: ${menuData.name}\n`);
        } else {
          console.log(`   ⚠️  Could not upload image\n`);
        }
      } catch (error) {
        console.error(`   ❌ Error updating menu: ${error.message}\n`);
      }
    }

    console.log('\n═'.repeat(50));
    console.log('✅ Update completed successfully!\n');

    const menuCount = await Menu.countDocuments();
    const withImages = await Menu.countDocuments({ image: { $ne: null } });
    console.log(`📊 Database Stats:`);
    console.log(`   Total Menus: ${menuCount}`);
    console.log(`   With Images: ${withImages}`);
    console.log('═'.repeat(50) + '\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateImages();
