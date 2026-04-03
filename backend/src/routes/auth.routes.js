const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { checkLogin } = require('../middleware/auth');
const { verifyRefreshToken } = require('../utils/jwt');
const { generateTokenPair } = require('../utils/jwt');

/**
 * Rate limiter for login endpoint
 * Max 5 attempts per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /api/auth/admin/login
 * Login for admin only
 * Body: { username, password }
 */
router.post('/admin/login', loginLimiter, async function (req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    if (username.length > 50 || password.length > 100) {
      return res.status(400).json({ message: 'Invalid username or password format' });
    }

    const result = await authController.loginAdmin(username, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

/**
 * POST /api/auth/staff/login
 * Login for staff only
 * Body: { username, password }
 */
router.post('/staff/login', loginLimiter, async function (req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    if (username.length > 50 || password.length > 100) {
      return res.status(400).json({ message: 'Invalid username or password format' });
    }

    const result = await authController.loginStaff(username, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

/**
 * POST /api/auth/user/login
 * Login for user only
 * Body: { username, password }
 */
router.post('/user/login', loginLimiter, async function (req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    if (username.length > 50 || password.length > 100) {
      return res.status(400).json({ message: 'Invalid username or password format' });
    }

    const result = await authController.loginUser(username, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

/**
 * POST /api/auth/login
 * Login for admin and staff
 * Body: { username, password }
 */
router.post('/login', loginLimiter, async function (req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Validate input length (prevent brute force with very long strings)
    if (username.length > 50 || password.length > 100) {
      return res.status(400).json({ message: 'Invalid username or password format' });
    }

    const result = await authController.login(username, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile - requires login
 */
router.get('/profile', checkLogin, async function (req, res, next) {
  try {
    const result = await authController.getCurrentUser(req.user);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/auth/register
 * Register new user (USER role only) - Old method (kept for backward compatibility)
 * Body: { username, email, password, fullName, phone, address }
 */
router.post('/register', async function (req, res, next) {
  try {
    const { username, email, password, fullName, phone, address } = req.body;
    
    if (!username || !email || !password || !fullName || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await authController.registerUser(username, email, password, fullName, phone, address);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/auth/request-otp
 * Request OTP for email verification (signup)
 * Body: { email }
 */
router.post('/request-otp', async function (req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const result = await authController.requestSignupOTP(email);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Body: { refreshToken }
 */
router.post('/refresh', async function (req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new token pair
    const newTokenPair = generateTokenPair({
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    });

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and register user
 * Body: { email, otp, username, password, fullName, phone, address }
 */
router.post('/verify-otp', async function (req, res, next) {
  try {
    const { email, otp, username, password, fullName, phone, address } = req.body;

    if (!email || !otp || !username || !password || !fullName || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const result = await authController.verifyOTPAndRegister(email, otp, username, password, fullName, phone, address);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
