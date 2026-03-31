const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get('/profile', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await userController.getProfile(req.user.id);
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put('/profile', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await userController.updateProfile(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/user/points
 * Get current loyalty points
 */
router.get('/points', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await userController.getLoyaltyPoints(req.user.id);
    res.status(200).json({ points: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
