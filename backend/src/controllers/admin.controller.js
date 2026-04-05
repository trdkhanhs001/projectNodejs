const Admin = require('../models/admin.model');
const User = require('../models/user.model');
const Menu = require('../models/menu.model');
const Order = require('../models/order.model');
const mongoose = require('mongoose');
const { buildSafeSearchQuery } = require('../utils/security');

exports.getProfile = async (adminId) => {
  const admin = await Admin.findById(adminId).select('-password');
  return admin;
};

// Update admin profile
exports.updateProfile = async (adminId, updateData) => {
  const allowedFields = ['fullName', 'email', 'phone'];
  const updateFields = {};
  
  allowedFields.forEach(field => {
    if (updateData[field]) {
      updateFields[field] = updateData[field];
    }
  });

  const admin = await Admin.findByIdAndUpdate(adminId, updateFields, { new: true }).select('-password');
  return admin;
};

// ========== USER MANAGEMENT (4.2) ==========
// Get all users with pagination and filters
exports.getAllUsers = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const query = {};
  if (filters.role) query.role = filters.role;
  
  // Use safe search query builder to prevent NoSQL injection
  if (filters.search) {
    const searchQuery = buildSafeSearchQuery(filters.search, ['username', 'email', 'fullName']);
    Object.assign(query, searchQuery);
  }

  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return {
    users,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
};

// Get user details
exports.getUserDetails = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

// Create new user (via admin)
exports.createUser = async (userData) => {
  const { username, email, password, fullName, role = 'USER', phone } = userData;

  // Validate required fields
  if (!username || !email || !password) {
    throw new Error('Username, email, and password are required');
  }

  // Check if user exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error('User with this email or username already exists');
  }

  // Create new user
  const newUser = new User({
    username,
    email,
    password,
    fullName: fullName || username,
    role: ['ADMIN', 'STAFF', 'USER'].includes(role) ? role : 'USER',
    phone
  });

  await newUser.save();
  return newUser.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } });
};

// Update user
exports.updateUser = async (userId, updateData) => {
  const allowedFields = ['fullName', 'email', 'phone', 'role'];
  const updateFields = {};

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined && updateData[field] !== null) {
      updateFields[field] = updateData[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select('-password');
  if (!updatedUser) throw new Error('User not found');
  return updatedUser;
};

// Delete user
exports.deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error('User not found');
  return user;
};

// ========== MENU MANAGEMENT (4.3) ==========
exports.getAllMenus = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const menus = await Menu.find(query)
    .populate('category')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Menu.countDocuments(query);

  return {
    menus,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
};

// Get menu details
exports.getMenuDetails = async (menuId) => {
  const menu = await Menu.findById(menuId).populate('category');
  if (!menu) throw new Error('Menu not found');
  return menu;
};

// Create new menu
exports.createMenu = async (menuData) => {
  const { name, description, price, category, image, isAvailable = true } = menuData;

  if (!name || !price) {
    throw new Error('Name and price are required');
  }

  const newMenu = new Menu({
    name,
    description,
    price,
    category,
    image,
    isAvailable
  });

  await newMenu.save();
  await newMenu.populate('category');
  return newMenu;
};

// Update menu
exports.updateMenu = async (menuId, updateData) => {
  const allowedFields = ['name', 'description', 'price', 'category', 'image', 'isAvailable'];
  const updateFields = {};

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined && updateData[field] !== null) {
      updateFields[field] = updateData[field];
    }
  });

  const updatedMenu = await Menu.findByIdAndUpdate(menuId, updateFields, { new: true }).populate('category');
  if (!updatedMenu) throw new Error('Menu not found');
  return updatedMenu;
};

// Delete menu
exports.deleteMenu = async (menuId) => {
  const menu = await Menu.findByIdAndDelete(menuId);
  if (!menu) throw new Error('Menu not found');
  return menu;
};

// ========== ORDER MANAGEMENT (4.4) ==========
exports.getAllOrders = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query.status = { $in: filters.status };
    } else {
      query.status = filters.status;
    }
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  const orders = await Order.find(query)
    .populate('user', 'username email fullName')
    .populate({
      path: 'items',
      populate: {
        path: 'menu',
        select: 'name price'
      }
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(query);

  return {
    orders,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
};

// Get order details
exports.getOrderDetails = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('user', 'username email fullName phone')
    .populate({
      path: 'items',
      populate: { path: 'menu' }
    });
  if (!order) throw new Error('Order not found');
  return order;
};

// Update order status
exports.updateOrderStatus = async (orderId, newStatus, staffId = null) => {
  const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED', 'COMPLETED'];
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  order.status = newStatus;
  
  // Set staff references for status transitions (only set if not already set)
  if (newStatus === 'PREPARING' && staffId && !order.preparedBy) {
    order.preparedBy = staffId;
  }
  if (newStatus === 'READY' && staffId && !order.servedBy) {
    order.servedBy = staffId;
  }
  if (newStatus === 'DELIVERED' || newStatus === 'COMPLETED') {
    order.completedAt = new Date();
  }

  await order.save();
  return order;
};

// Cancel order
exports.cancelOrder = async (orderId, reason) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
    throw new Error(`Cannot cancel order with status: ${order.status}`);
  }

  order.status = 'CANCELLED';
  order.cancellationReason = reason;
  order.cancelledAt = new Date();
  
  await order.save();
  return order;
};

// ========== DASHBOARD STATISTICS (4.6) ==========
// Get dashboard statistics
exports.getDashboardStats = async (dateRange = 'month') => {
  let startDate = new Date();

  // Set start date based on range
  if (dateRange === 'day') {
    startDate.setHours(0, 0, 0, 0);
  } else if (dateRange === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (dateRange === 'month') {
    startDate.setDate(1);
  } else if (dateRange === 'year') {
    startDate.setMonth(0, 1);
  }

  const dateQuery = { createdAt: { $gte: startDate } };

  // Revenue and orders stats
  const orders = await Order.find(dateQuery);
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

  // Order status breakdown
  const statusBreakdown = {
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    preparing: orders.filter(o => o.status === 'PREPARING').length,
    ready: orders.filter(o => o.status === 'READY').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length
  };

  // Average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // New users
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate },
    role: 'USER'
  });

  // Top menus
  const allOrders = await Order.find(dateQuery).populate({
    path: 'items',
    populate: { path: 'menu' }
  });

  const menuSales = {};
  allOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.menu) {
        menuSales[item.menu._id] = (menuSales[item.menu._id] || 0) + item.quantity;
      }
    });
  });

  const topMenus = Object.entries(menuSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Get menu details for top items
  const topMenuDetails = await Promise.all(
    topMenus.map(async ([menuId, quantity]) => {
      const menu = await Menu.findById(menuId);
      return { menu, quantity };
    })
  );

  return {
    dateRange,
    period: {
      start: startDate,
      end: new Date()
    },
    revenue: {
      total: totalRevenue,
      average: averageOrderValue
    },
    orders: {
      total: totalOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
      byStatus: statusBreakdown
    },
    users: {
      new: newUsers
    },
    topMenus: topMenuDetails
  };
};
