const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discount.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

// Validate discount code (public endpoint)
router.post('/validate', async (req, res) => {
  try {
    await discountController.validateDiscount(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get active discounts (public endpoint)
router.get('/active', async (req, res) => {
  try {
    await discountController.getActiveDiscounts(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get discount by code (public endpoint)
router.get('/code/:code', async (req, res) => {
  try {
    await discountController.getDiscountByCode(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Apply discount to order (user endpoint)
router.post('/apply', checkLogin, async (req, res) => {
  try {
    await discountController.applyDiscountToOrder(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin only endpoints

// Create new discount (admin only)
router.post('/', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await discountController.createDiscount(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all discounts (admin only)
router.get('/', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await discountController.getAllDiscounts(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get discount statistics (admin only)
router.get('/stats/overview', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await discountController.getDiscountStats(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update discount (admin only)
router.put('/:discountId', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await discountController.updateDiscount(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete discount (admin only)
router.delete('/:discountId', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await discountController.deleteDiscount(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
