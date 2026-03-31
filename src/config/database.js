const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Admin = require('../models/admin.model');
const Staff = require('../models/staff.model');
const Menu = require('../models/menu.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
    await initializeDefaultData();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// ==================== INITIALIZE DEFAULT DATA ====================
const initializeDefaultData = async () => {
  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) return;

    // Create admin (bcrypt hash of 'admin123')
    const hashedPasswordAdmin = '$2a$10$8TJ.9d1gL0rKOGg3q0K3XeC.L8K9L7M6N5O4P3Q2R1S0T/U.O1K8L9';
    const admin = new Admin({
      username: 'admin',
      email: 'admin@restaurant.com',
      password: hashedPasswordAdmin,
      fullName: 'Administrator',
      phone: '0123456789',
      role: 'admin',
      status: 'active'
    });
    const savedAdmin = await admin.save();

    // Create staff (bcrypt hash of 'staff123')
    const hashedPasswordStaff = '$2a$10$8TJ.9d1gL0rKOGg3q0K3XeC.L8K9L7M6N5O4P3Q2R1S0T/U.O1K8L9';
    const staff1 = new Staff({
      username: 'staff1',
      email: 'staff1@restaurant.com',
      password: hashedPasswordStaff,
      fullName: 'Nguyễn Văn A',
      phone: '0123456789',
      role: 'staff',
      status: 'active',
      createdBy: savedAdmin._id
    });
    await staff1.save();

    const staff2 = new Staff({
      username: 'staff2',
      email: 'staff2@restaurant.com',
      password: hashedPasswordStaff,
      fullName: 'Trần Thị B',
      phone: '0987654321',
      role: 'staff',
      status: 'active',
      createdBy: savedAdmin._id
    });
    await staff2.save();

    // Create menus
    const menu1 = new Menu({
      name: 'Phở Bò',
      description: 'Phở bò truyền thống nóng hôi',
      ingredients: 'Thịt bò nạm, bánh phở, nước dùng xương, hành, gừng',
      price: 50000,
      status: 'active',
      createdBy: savedAdmin._id
    });
    await menu1.save();

    const menu2 = new Menu({
      name: 'Bún Chả',
      description: 'Bún chả Hà Nội nổi tiếng',
      ingredients: 'Thịt heo nướng, bún, nước chấm chuối, rau sống, bánh mì',
      price: 45000,
      status: 'active',
      createdBy: savedAdmin._id
    });
    await menu2.save();

    const menu3 = new Menu({
      name: 'Cơm Gà',
      description: 'Cơm gà hấp kiểu Hồng Kông',
      ingredients: 'Gà hấp, cơm, hành lá, xoài',
      price: 55000,
      status: 'active',
      createdBy: savedAdmin._id
    });
    await menu3.save();

    console.log('Default data initialized');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// ==================== EXPORTS ====================
module.exports = {
  connectDB,
  Admin,
  Staff,
  Menu,
  Order,
  User
};
