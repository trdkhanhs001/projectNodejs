const { Admin, Staff, User, OTP } = require('../config/database');
const { generateToken, generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { generateRefreshToken } = require('../utils/jwt');
const { comparePassword, hashPassword } = require('../utils/password');
const { generateOTP, validateOTP } = require('../utils/otp');
const { sendOTP, sendWelcomeEmail } = require('../utils/email');

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

  // Generate token pair
  const tokenPayload = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: role
  };
  const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

  return {
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: role,
      fullName: user.fullName || null
    }
  };
};

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

  // Generate token pair
  const tokenPayload = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: 'ADMIN'
  };
  const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

  return {
    message: 'Admin login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: 'ADMIN',
      fullName: user.fullName || null
    }
  };
};

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

  // Generate token pair
  const tokenPayload = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: 'STAFF'
  };
  const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

  return {
    message: 'Staff login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: 'STAFF',
      fullName: user.fullName || null
    }
  };
};

const requestLoginOTP = async (username, password) => {
  // Find user
  const user = await User.findOne({ username }).select('+password +otpSentAt +otpVerificationAttempts');

  if (!user) {
    throw new Error('Invalid login credentials');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid login credentials');
  }

  // Check OTP verification attempts
  if (user.otpVerificationAttempts >= 5) {
    throw new Error('Too many OTP verification attempts. Please try again later.');
  }

  // Generate OTP
  const otp = generateOTP(6);
  
  // Save OTP to database (hashed)
  user.otpCode = otp;
  user.otpSentAt = new Date();
  await user.save();

  // Send OTP via email
  await sendOTP(user.email, otp, 'login');

  return {
    message: 'OTP sent to email successfully',
    email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
    userId: user._id.toString()
  };
};

const verifyLoginOTP = async (userId, otp) => {
  // Find user
  const user = await User.findById(userId).select('+otpCode +otpSentAt +otpVerificationAttempts');

  if (!user) {
    throw new Error('User not found');
  }

  // Validate OTP format
  if (!validateOTP(otp)) {
    throw new Error('Invalid OTP format');
  }

  // Check if OTP exists and is still valid
  if (!user.otpCode || !user.otpSentAt) {
    throw new Error('No OTP requested. Please request OTP first.');
  }

  // Check OTP expiration (10 minutes)
  const otpExpiry = new Date(user.otpSentAt.getTime() + 10 * 60 * 1000);
  if (new Date() > otpExpiry) {
    user.otpCode = null;
    user.otpSentAt = null;
    user.otpVerificationAttempts = 0;
    await user.save();
    throw new Error('OTP has expired. Please request a new one.');
  }

  // Check OTP verification attempts
  if (user.otpVerificationAttempts >= 5) {
    throw new Error('Too many OTP verification attempts. Please request a new OTP.');
  }

  // Verify OTP
  if (user.otpCode !== otp) {
    user.otpVerificationAttempts += 1;
    await user.save();
    throw new Error('Invalid OTP');
  }

  // Clear OTP
  user.otpCode = null;
  user.otpSentAt = null;
  user.otpVerificationAttempts = 0;
  user.otpVerified = true;
  await user.save();

  // Generate token pair
  const tokenPayload = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: 'USER'
  };
  const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

  return {
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: 'USER',
      fullName: user.fullName || null
    }
  };
};

const loginUser = async (username, password) => {
  // This endpoint is deprecated - use requestLoginOTP + verifyLoginOTP instead
  throw new Error('This endpoint is deprecated. Use /auth/user/request-login-otp and /auth/user/verify-login-otp');
};

const registerUser = async (username, email, password, fullName, phone, address = '') => {
  // Free registration is disabled - users must use OTP flow
  throw new Error('Free registration is disabled. Please use the OTP verification flow: /auth/user/request-otp -> /auth/user/verify-otp');
};

const requestSignupOTP = async (email) => {
  try {
    // Check if email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Delete old OTP if exists
    await OTP.deleteOne({ email, purpose: 'signup' });

    // Generate new OTP
    const otp = generateOTP(6);

    // Save OTP to database
    const newOTP = new OTP({
      email,
      code: otp,
      purpose: 'signup'
    });
    await newOTP.save();

    // Send OTP via email
    await sendOTP(email, otp, 'signup');

    return {
      message: 'OTP sent to email successfully',
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email for security
    };
  } catch (error) {
    throw error;
  }
};

const verifyOTPAndRegister = async (email, otp, username, password, fullName, phone, address = '') => {
  try {
    // Validate OTP format
    if (!validateOTP(otp)) {
      throw new Error('Invalid OTP format');
    }

    // Check if email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      email,
      code: otp,
      purpose: 'signup',
      isUsed: false
    });

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

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
      role: 'USER',
      emailVerified: true // Mark as verified since OTP was verified
    });

    await newUser.save();

    // Send welcome email
    await sendWelcomeEmail(email, fullName);

    // Generate token pair
    const tokenPayload = {
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      role: 'USER'
    };
    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    return {
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: 'USER',
        fullName: newUser.fullName
      }
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  login,
  loginAdmin,
  loginStaff,
  loginUser,
  getCurrentUser,
  registerUser,
  requestSignupOTP,
  verifyOTPAndRegister,
  requestLoginOTP,
  verifyLoginOTP
};
