const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { checkLogin } = require('../middleware/auth');

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
 * Register new user (USER role only)
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

module.exports = router;
