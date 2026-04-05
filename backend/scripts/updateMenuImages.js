require('dotenv').config();
const mongoose = require('mongoose');
const Menu = require('../src/models/menu.model');
const { batchUploadImages, getUploadSummary } = require('../src/utils/imageUpload');

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Menu items with image URLs for uploading
 * These URLs are used for downloading and uploading to Cloudinary
 */
const menuImages = [
  { name: 'Chả Cuốn', imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500' },
  { name: 'Gỏi Cuốn', imageUrl: 'https://images.unsplash.com/photo-1583224964978-2e2a9b71c9f7?w=500' },
  { name: 'Cánh Gà Nước Mắm', imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500' },
  { name: 'Canh Chua Cá', imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54d1?w=500' },
  { name: 'Canh Gà Sâm', imageUrl: 'https://images.unsplash.com/photo-1604908177522-040c3a3fdaaf?w=500' },
  { name: 'Canh Chua Tôm', imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500' },
  { name: 'Cơm Tấm Sườn Nướng', imageUrl: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=500' },
  { name: 'Cơm Gà Hoa Tây', imageUrl: 'https://images.unsplash.com/photo-1604908176992-125f25cc6f3d?w=500' },
  { name: 'Cơm Tộp Mâm', imageUrl: 'https://images.unsplash.com/photo-1625944525237-8a1f5c5e8f7b?w=500' },
  { name: 'Phở Bò', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500' },
  { name: 'Bún Riêu Cua', imageUrl: 'https://images.unsplash.com/photo-1625944525225-2a6c8c5d7c2c?w=500' },
  { name: 'Mì Xào Hải Sản', imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500' },
  { name: 'Thịt Xiên Nướng', imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500' },
  { name: 'Bò Nướng Muối Ớt', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500' },
  { name: 'Gà Nướng Sả', imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500' },
  { name: 'Tôm Nướng Muối', imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500' },
  { name: 'Cua Nướng Dừa', imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500' },
  { name: 'Cá Nướng Giấy', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500' },
  { name: 'Rau Luộc Nước Mắm', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500' },
  { name: 'Đậu Phụ Chiên', imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500' },
  { name: 'Canh Rau Cải', imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500' },
  { name: 'Nước Cam Tươi', imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a90b0c87?w=500' },
  { name: 'Cà Phê Đen', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500' },
  { name: 'Trà Đá', imageUrl: 'https://images.unsplash.com/photo-1527169401691-feff5539e52c?w=500' },
];

/**
 * Main update function
 * Uploads images for all menu items in parallel using Promise.all
 */
async function updateMenuImages() {
  try {
    console.log('\n🔌 Connecting to MongoDB...'); 
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all menu items from database
    const menus = await Menu.find({ isActive: true });
    console.log(`📊 Found ${menus.length} menu items in database\n`);

    if (menus.length === 0) {
      console.log('⚠️  No menu items found. Please run "npm run seed:menu" first.\n');
      await mongoose.connection.close();
      return;
    }

    // Build upload tasks - only for menus that exist in the database
    const uploadTasks = [];
    for (const menuFromDB of menus) {
      const menuData = menuImages.find(m => m.name === menuFromDB.name);
      if (menuData) {
        uploadTasks.push({
          name: menuFromDB.name,
          imageUrl: menuData.imageUrl,
          dbId: menuFromDB._id
        });
      }
    }

    console.log(`📝 Uploading images for ${uploadTasks.length} menu items in parallel...\n`);

    // Batch upload with 5 concurrent uploads
    const uploadResults = await batchUploadImages(
      uploadTasks.map(t => ({ name: t.name, imageUrl: t.imageUrl })),
      { concurrency: 5 }
    );

    // Update database with uploaded image URLs
    console.log('\n💾 Updating database with image URLs...\n');
    let updatedCount = 0;

    for (let i = 0; i < uploadTasks.length; i++) {
      const result = uploadResults[i];
      const task = uploadTasks[i];

      if (result.success) {
        await Menu.findByIdAndUpdate(
          task.dbId,
          { image: result.url },
          { new: true }
        );
        updatedCount++;
        console.log(`   ✅ Updated: ${task.name}`);
      } else {
        console.log(`   ❌ Failed to update ${task.name}: ${result.error}`);
      }
    }

    // Print summary
    const summary = getUploadSummary(uploadResults);
    console.log('\n' + '═'.repeat(50));
    console.log('✅ Update completed!\n');
    console.log(`📊 Upload Summary:`);
    console.log(`   Total: ${summary.total}`);
    console.log(`   Successful: ${summary.successful}`);
    console.log(`   With Fallback: ${summary.withFallback}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Success Rate: ${summary.successRate}`);
    console.log(`   Database Updated: ${updatedCount}/${uploadTasks.length}`);
    console.log('═'.repeat(50) + '\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the update
updateMenuImages();
