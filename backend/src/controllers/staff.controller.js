const Staff = require('../models/staff.model');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcrypt');

// Get all staff
exports.getAllStaff = async () => {
  try {
    const staff = await Staff.find({ isDeleted: false })
      .select('fullName email phone position salary address avatar role isActive startDate');
    return staff;
  } catch (error) {
    console.error('[STAFF] Error fetching staff:', error);
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
