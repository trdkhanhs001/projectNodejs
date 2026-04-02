// Script để xóa index cũ username khỏi staffs collection
const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndex() {
  let connection = null;
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    console.log('📡 Kết nối tới MongoDB...');
    
    connection = await mongoose.connect(mongoUri);
    console.log('✅ Đã kết nối tới MongoDB thành công!');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Không thể lấy database object');
    }

    console.log('📂 Lấy collection staffs...');
    const collection = db.collection('staffs');

    // Lấy danh sách index hiện tại
    console.log('🔍 Đang quét các indexes...');
    const indexes = await collection.indexInformation();
    console.log('📋 Các index hiện tại:', Object.keys(indexes));

    // Xóa index username_1 nếu tồn tại
    if (indexes.username_1) {
      console.log('\n🔨 Đang xóa index username_1...');
      await collection.dropIndex('username_1');
      console.log('✅ Đã xóa index username_1 thành công!');
    } else {
      console.log('\n⚠️ Index username_1 không tồn tại (có thể đã được xóa)');
    }

    console.log('\n✅ Fix hoàn tất! Bạn có thể tạo staff mới mà không bị lỗi.');
    await mongoose.connection.close();
    console.log('✅ Đã đóng kết nối MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Lỗi:', err.message);
    console.error('📍 Stack:', err.stack);
    if (connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

dropIndex();
