const { Admin, Staff } = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { comparePassword } = require('../utils/password');

/**
 * Login - Admin & Staff
 */
const login = async (username, password) => {
  // Find admin
  let user = await Admin.findOne({ username }).select('+password');
  let role = 'ADMIN';

  // If not found, find staff
  if (!user) {
    user = await Staff.findOne({ username }).select('+password');
    role = 'STAFF';
  }

  // Check if user exists
  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  // For staff, check if active
  if (role === 'STAFF' && !user.isActive) {
    throw new Error('Your account is inactive');
  }

  // Generate token
  const token = generateToken({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: role
  });

  return {
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: role,
      fullName: user.fullName || null
    }
  };
};

/**
 * Get current user info
 */
const getCurrentUser = async (userInfo) => {
  const { id, role } = userInfo;
  let user;

  if (role === 'ADMIN') {
    user = await Admin.findById(id);
  } else {
    user = await Staff.findById(id);
  }

  if (!user) {
    throw new Error('User not found');
  }

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: role,
      fullName: user.fullName || null
    }
  };
};

module.exports = {
  login,
  getCurrentUser
};
