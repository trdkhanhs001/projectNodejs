const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

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

router.post('/', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await orderController.createOrder(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/guest', async function (req, res, next) {
  try {
    const result = await orderController.createGuestOrder(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/pos', checkLogin, checkRole('STAFF'), async function (req, res, next) {
  try {
    const result = await orderController.createPosOrder(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

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

router.get('/pending/list', checkLogin, checkRole('STAFF', 'ADMIN'), async function (req, res, next) {
  try {
    const result = await orderController.getPendingOrders();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/daily-summary', async function (req, res, next) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter required (format: YYYY-MM-DD)' });
    }
    const result = await orderController.getDailySummary(date);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/stats/dashboard', checkLogin, checkRole('STAFF', 'ADMIN'), async function (req, res, next) {
  try {
    const result = await orderController.getOrderStats();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

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
