const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { checkLogin } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Login for admin and staff
 * Body: { username, password }
 */
router.post('/login', async function (req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
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
