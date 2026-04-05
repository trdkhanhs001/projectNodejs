const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

// Create payment (user, admin can create payments)
router.post('/', checkLogin, async (req, res) => {
  try {
    await paymentController.createPayment(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all payments (admin only)
router.get('/', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await paymentController.getAllPayments(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user's payments
router.get('/my-payments', checkLogin, async (req, res) => {
  try {
    await paymentController.getUserPayments(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get payments for specific order
router.get('/order/:orderId', checkLogin, async (req, res) => {
  try {
    await paymentController.getOrderPayments(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get payment by ID
router.get('/:paymentId', checkLogin, async (req, res) => {
  try {
    await paymentController.getPaymentById(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update payment status (admin only)
router.put('/:paymentId/status', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await paymentController.updatePaymentStatus(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Refund payment (admin only)
router.post('/:paymentId/refund', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await paymentController.refundPayment(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get payment statistics (admin only)
router.get('/stats/overview', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await paymentController.getPaymentStats(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete payment (admin only)
router.delete('/:paymentId', checkLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    await paymentController.deletePayment(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
