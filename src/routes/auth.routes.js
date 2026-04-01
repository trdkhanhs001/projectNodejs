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

module.exports = router;
