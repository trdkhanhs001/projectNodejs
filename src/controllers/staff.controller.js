const Staff = require('../models/staff.model');
const bcrypt = require('bcrypt');

// Get all staff
exports.getAllStaff = async () => {
  const staff = await Staff.find({ isDeleted: false }).select('-password');
  return staff;
};

// Get staff by ID
exports.getStaffById = async (id) => {
  const staff = await Staff.findById(id).select('-password');
  if (staff && !staff.isDeleted) {
    return staff;
  }
  return null;
};

// Create new staff
exports.createStaff = async (data, adminId) => {
  const { username, password, email, phone, fullName, position, salary } = data;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const staff = new Staff({
    username,
    password: hashedPassword,
    email,
    phone,
    fullName,
    position,
    salary,
    createdBy: adminId
  });

  await staff.save();
  const staffData = staff.toObject();
  delete staffData.password;
  return staffData;
};

// Update staff
exports.updateStaff = async (id, data) => {
  const allowedFields = ['email', 'phone', 'fullName', 'position', 'salary', 'status'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const staff = await Staff.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  return staff;
};

// Soft delete staff
exports.deleteStaff = async (id) => {
  const staff = await Staff.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return staff;
};

// Reset staff password
exports.resetStaffPassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const staff = await Staff.findByIdAndUpdate(
    id,
    { password: hashedPassword },
    { new: true }
  ).select('-password');
  return staff;
};
