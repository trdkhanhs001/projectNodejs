const User = require('../models/user.model');

// Get user profile
exports.getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  return user;
};

// Update user profile
exports.updateProfile = async (userId, updateData) => {
  const allowedFields = ['fullName', 'email', 'phone', 'address'];
  const updateFields = {};
  
  allowedFields.forEach(field => {
    if (updateData[field]) {
      updateFields[field] = updateData[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select('-password');
  return user;
};

// Get loyalty points
exports.getLoyaltyPoints = async (userId) => {
  const user = await User.findById(userId);
  return user ? user.loyaltyPoints : 0;
};
