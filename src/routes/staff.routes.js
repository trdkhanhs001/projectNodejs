const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

/**
 * GET /api/staff
 * Get all staff members - requires admin
 */
router.get('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await staffController.getAllStaff();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/staff/:id
 * Get staff member by ID - requires admin or staff self
 */
router.get('/:id', checkLogin, checkRole('ADMIN', 'STAFF'), async function (req, res, next) {
  try {
    // Staff can only view their own profile
    if (req.user.role === 'STAFF' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const result = await staffController.getStaffById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/staff
 * Create new staff account - requires admin
 * Body: { username, password, email, phone, fullName, position, salary }
 */
router.post('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await staffController.createStaff(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/staff/:id
 * Update staff profile - requires admin or staff self
 */
router.put('/:id', checkLogin, checkRole('ADMIN', 'STAFF'), async function (req, res, next) {
  try {
    // Staff can only update their own profile
    if (req.user.role === 'STAFF' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await staffController.updateStaff(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/staff/:id
 * Soft delete staff account - requires admin
 */
router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await staffController.deleteStaff(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json({ message: 'Staff account deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



module.exports = router;
