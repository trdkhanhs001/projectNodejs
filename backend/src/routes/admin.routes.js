const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { checkLogin, checkRole } = require('../middleware/auth');
const { validateResult } = require('../middleware/validation');

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

router.put('/profile', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.updateProfile(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ========== USER MANAGEMENT (4.2) ==========
router.get('/users', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const result = await adminController.getAllUsers(
      { role, search },
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/users/:userId', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.getUserDetails(req.params.userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/users', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.createUser(req.body);
    res.status(201).json({ message: 'User created successfully', user: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/users/:userId', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.updateUser(req.params.userId, req.body);
    res.status(200).json({ message: 'User updated successfully', user: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/users/:userId', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.deleteUser(req.params.userId);
    res.status(200).json({ message: 'User deleted successfully', user: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ========== MENU MANAGEMENT (4.3) ==========
router.get('/menus', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    const result = await adminController.getAllMenus(
      { category, search },
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/menus/:menuId', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.getMenuDetails(req.params.menuId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/menus', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.createMenu(req.body);
    res.status(201).json({ message: 'Menu created successfully', menu: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/menus/:menuId', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.updateMenu(req.params.menuId, req.body);
    res.status(200).json({ message: 'Menu updated successfully', menu: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/menus/:menuId', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await adminController.deleteMenu(req.params.menuId);
    res.status(200).json({ message: 'Menu deleted successfully', menu: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ========== ORDER MANAGEMENT (4.4) ==========
router.get('/orders', checkLogin, checkRole('ADMIN', 'STAFF'), async function (req, res, next) {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    const statusFilter = status ? status.split(',') : undefined;
    
    const result = await adminController.getAllOrders(
      { status: statusFilter, startDate, endDate },
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/orders/:orderId', checkLogin, checkRole('ADMIN', 'STAFF'), async function (req, res, next) {
  try {
    const result = await adminController.getOrderDetails(req.params.orderId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/orders/:orderId/status', checkLogin, checkRole('ADMIN', 'STAFF'), async function (req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const result = await adminController.updateOrderStatus(req.params.orderId, status);
    res.status(200).json({ message: 'Order status updated successfully', order: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/orders/:orderId/cancel', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const { reason } = req.body;
    
    const result = await adminController.cancelOrder(req.params.orderId, reason);
    res.status(200).json({ message: 'Order cancelled successfully', order: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ========== DASHBOARD STATISTICS (4.6) ==========
router.get('/dashboard/stats', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const { range = 'month' } = req.query;
    const validRanges = ['day', 'week', 'month', 'year'];
    
    if (!validRanges.includes(range)) {
      return res.status(400).json({ message: `Valid ranges: ${validRanges.join(', ')}` });
    }
    
    const result = await adminController.getDashboardStats(range);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
