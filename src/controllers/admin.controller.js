const Admin = require('../models/admin.model');

// Get admin profile
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
