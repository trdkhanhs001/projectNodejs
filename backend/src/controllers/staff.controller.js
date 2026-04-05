const Staff = require('../models/staff.model');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcrypt');
const { buildSafeSearchQuery } = require('../utils/security');

exports.getAllStaff = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Use safe search query builder to prevent NoSQL injection
    if (filters.search) {
      const searchQuery = buildSafeSearchQuery(filters.search, ['fullName', 'email', 'phone', 'position']);
      Object.assign(query, searchQuery);
    }

    console.log('[STAFF CONTROLLER] Query:', query);

    // Use .select('+isDeleted') to explicitly include the field that has select: false
    let staff = await Staff.find(query)
      .select('fullName email phone position salary address avatar role isActive startDate')
      .select('+isDeleted')  // Explicitly include isDeleted field
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Filter out soft-deleted records
    staff = staff.filter(doc => doc.isDeleted !== true);

    console.log('[STAFF CONTROLLER] Found active staff:', staff.length);

    // Get total count
    const allDocs = await Staff.find(query).select('+isDeleted').lean();
    const total = allDocs.filter(doc => doc.isDeleted !== true).length;

    return {
      staff,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('[STAFF CONTROLLER] Error fetching staff:', error);
    throw error;
  }
};

// Get staff by ID
exports.getStaffById = async (id) => {
  try {
    const staff = await Staff.findById(id)
      .select('fullName email phone position salary address avatar role isActive startDate');
    if (staff && !staff.isDeleted) {
      return staff;
    }
    return null;
  } catch (error) {
    console.error('[STAFF] Error fetching staff by ID:', error);
    throw error;
  }
};

// Create new staff - only profile without login credentials
exports.createStaff = async (data, adminId, file) => {
  const { email, phone, fullName, position, salary, address } = data;

  let avatarUrl = null;

  // Upload avatar to Cloudinary if provided
  if (file) {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'restaurant/staff',
            resource_type: 'auto',
            public_id: `staff_${Date.now()}`,
            format: 'jpg',
            quality: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      avatarUrl = uploadResult.secure_url;
    } catch (uploadError) {
      throw new Error('Avatar upload failed: ' + uploadError.message);
    }
  }

  const staff = new Staff({
    email,
    phone,
    fullName,
    position,
    salary,
    address: address || null,
    avatar: avatarUrl,
    createdBy: adminId
  });

  await staff.save();
  return staff.toObject();
};

// Update staff
exports.updateStaff = async (id, data, file) => {
  const allowedFields = ['email', 'phone', 'fullName', 'position', 'salary', 'address', 'status'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  // Handle avatar upload
  if (file) {
    try {
      // Get current staff to find old avatar
      const staff = await Staff.findById(id);
      
      // Delete old avatar from Cloudinary if exists
      if (staff && staff.avatar) {
        try {
          const url = staff.avatar;
          const publicId = url.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(`restaurant/staff/${publicId}`);
        } catch (err) {
          // Silently handle deletion errors
        }
      }

      // Upload new avatar
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'restaurant/staff',
            resource_type: 'auto',
            public_id: `staff_${Date.now()}`,
            format: 'jpg',
            quality: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      updateData.avatar = uploadResult.secure_url;
    } catch (uploadError) {
      throw new Error('Avatar upload failed: ' + uploadError.message);
    }
  }

  const staff = await Staff.findByIdAndUpdate(id, updateData, { new: true })
    .select('fullName email phone position salary address avatar role isActive startDate');
  return staff;
};

// Soft delete staff
exports.deleteStaff = async (id) => {
  const staff = await Staff.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return staff;
};

// Reset staff password (Not used - staff use hardcoded POS account)
exports.resetStaffPassword = async (id, newPassword) => {
  throw new Error('Staff do not have individual login accounts. Use hardcoded POS account.');
};

// Get today's revenue statistics
exports.getTodayStats = async () => {
  const Order = require('../models/order.model');
  
  // Get today's date range (start of day to end of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  try {
    // Query completed orders from today
    const completedOrders = await Order.find({
      status: 'COMPLETED',
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = completedOrders.length;
    const averagePerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      averagePerOrder: Math.round(averagePerOrder),
      date: today.toISOString().split('T')[0]
    };
  } catch (error) {
    throw new Error('Failed to fetch today stats: ' + error.message);
  }
};
