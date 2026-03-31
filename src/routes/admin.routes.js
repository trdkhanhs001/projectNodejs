const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { checkLogin, checkRole } = require('../middleware/auth');
const { validateResult } = require('../middleware/validation');

/**
 * GET /api/admin/profile
 * Get admin profile - requires admin login
 */
router.get('/profile', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.getProfile(req.user.id);
    if (!result) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/admin/profile
 * Update admin profile
 */
router.put('/profile', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.updateProfile(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
