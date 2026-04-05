const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('../models/admin.model');
const Staff = require('../models/staff.model');
const Menu = require('../models/menu.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const OTP = require('../models/otp.model');

const { hashPassword } = require('../utils/password');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_app', {
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

const initializeDefaultData = async () => {
  try {
    const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    if (adminExists) return;

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

module.exports = {
  connectDB,
  Admin,
  Staff,
  Menu,
  Order,
  User,
  OTP
};
