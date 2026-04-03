const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

/**
 * GET /api/order
 * Get orders based on role
 * Admin: all orders, User: personal orders, Staff: assigned orders
 */
router.get('/', checkLogin, async function (req, res, next) {
  try {
    let result;
    if (req.user.role === 'ADMIN') {
      result = await orderController.getAllOrders();
    } else if (req.user.role === 'USER') {
      result = await orderController.getUserOrders(req.user.id);
    } else if (req.user.role === 'STAFF') {
      result = await orderController.getStaffOrders(req.user.id);
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/order/:id
 * Get order details by ID
 */
router.get('/:id', checkLogin, async function (req, res, next) {
  try {
    const result = await orderController.getOrderById(req.params.id, req.user);
    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/order
 * Create new order from cart - requires user login
 * Body: { deliveryAddress, deliveryPhone, notes, paymentMethod }
 */
router.post('/', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await orderController.createOrder(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/order/guest
 * Create guest order (no login required)
 * Body: { 
 *   items: [{menuId, quantity}],
 *   guestInfo: {name, email, phone, address},
 *   notes, paymentMethod
 * }
 */
router.post('/guest', async function (req, res, next) {
  try {
    const result = await orderController.createGuestOrder(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/order/:id/status
 * Update order status - requires admin or staff
 * Body: { status, itemId (optional for item status update) }
 */
router.put('/:id/status', checkLogin, checkRole('ADMIN', 'STAFF'), async function (req, res, next) {
  try {
    const result = await orderController.updateOrderStatus(req.params.id, req.body, req.user);
    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/order/:id/payment
 * Update payment status - requires admin
 * Body: { paymentStatus }
 */
router.put('/:id/payment', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await orderController.updatePaymentStatus(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/order/pending/list
 * Get pending orders for POS staff - requires staff or admin
 */
router.get('/pending/list', checkLogin, checkRole('STAFF', 'ADMIN'), async function (req, res, next) {
  try {
    const result = await orderController.getPendingOrders();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/order/stats/dashboard
 * Get order statistics for dashboard - requires staff or admin
 */
router.get('/stats/dashboard', checkLogin, checkRole('STAFF', 'ADMIN'), async function (req, res, next) {
  try {
    const result = await orderController.getOrderStats();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/order/filter/status
 * Get orders by status - requires staff or admin
 * Query: ?status=PENDING,CONFIRMED,PREPARING
 */
router.get('/filter/status', checkLogin, checkRole('STAFF', 'ADMIN'), async function (req, res, next) {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ message: 'Status parameter required' });
    }
    const result = await orderController.getOrdersByStatus(status);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/order/:id
 * Soft delete order - requires admin
 */
router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await orderController.deleteOrder(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
