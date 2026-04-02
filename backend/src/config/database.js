const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Admin = require('../models/admin.model');
const Staff = require('../models/staff.model');
const Menu = require('../models/menu.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

// Import password utility
const { hashPassword } = require('../utils/password');

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
    const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    if (adminExists) return;

    // Create admin account from .env variables
    const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD);
    const admin = new Admin({
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      fullName: 'Administrator',
      phone: '0123456789',
      address: '123 Restaurant Street',
      role: 'ADMIN',
      isActive: true
    });
    await admin.save();

    console.log(`Admin account initialized: ${process.env.ADMIN_USERNAME}`);
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
