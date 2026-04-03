const { Admin, Staff, User } = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { comparePassword, hashPassword } = require('../utils/password');

/**
 * Login - Admin, Staff & User
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

  // If not found, find user
  if (!user) {
    user = await User.findOne({ username }).select('+password');
    role = 'USER';
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
  } else if (role === 'STAFF') {
    user = await Staff.findById(id);
  } else if (role === 'USER') {
    user = await User.findById(id);
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

/**
 * Login - Admin only
 */
const loginAdmin = async (username, password) => {
  // Find admin
  const user = await Admin.findOne({ username }).select('+password');

  if (!user) {
    throw new Error('Invalid admin credentials');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid admin credentials');
  }

  // Generate token
  const token = generateToken({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: 'ADMIN'
  });

  return {
    message: 'Admin login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: 'ADMIN',
      fullName: user.fullName || null
    }
  };
};

/**
 * Login - Staff only
 */
const loginStaff = async (username, password) => {
  // Find staff
  const user = await Staff.findOne({ username }).select('+password');

  if (!user) {
    throw new Error('Invalid staff credentials');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid staff credentials');
  }

  // Check if staff is active
  if (!user.isActive) {
    throw new Error('Your account is inactive. Please contact admin.');
  }

  // Generate token
  const token = generateToken({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: 'STAFF'
  });

  return {
    message: 'Staff login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: 'STAFF',
      fullName: user.fullName || null
    }
  };
};

/**
 * Login - User only
 */
const loginUser = async (username, password) => {
  // Find user
  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    throw new Error('Invalid login credentials');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid login credentials');
  }

  // Generate token
  const token = generateToken({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: 'USER'
  });

  return {
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: 'USER',
      fullName: user.fullName || null
    }
  };
};

/**
 * Register - User only
 */
const registerUser = async (username, email, password, fullName, phone, address = '') => {
  // Check if username exists (any role)
  let existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Check if email exists (any role)
  existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    fullName,
    phone,
    address: address || '',
    role: 'USER'
  });

  await newUser.save();

  // Generate token
  const token = generateToken({
    id: newUser._id.toString(),
    username: newUser.username,
    email: newUser.email,
    role: 'USER'
  });

  return {
    message: 'Registration successful',
    token,
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: 'USER',
      fullName: newUser.fullName
    }
  };
};

module.exports = {
  login,
  loginAdmin,
  loginStaff,
  loginUser,
  getCurrentUser,
  registerUser
};
