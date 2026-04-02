const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

/**
 * GET /api/menu
 * Get all menu items (public, active only)
 */
router.get('/', async function (req, res, next) {
  try {
    const result = await menuController.getAllMenus();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/menu/:id
 * Get menu item by ID (public)
 */
router.get('/:id', async function (req, res, next) {
  try {
    const result = await menuController.getMenuById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/menu
 * Create new menu item - requires admin
 * Body: { name, description, ingredients, price, category, prepTime, isActive }
 */
router.post('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await menuController.createMenu(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/menu/:id
 * Update menu item - requires admin
 */
router.put('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await menuController.updateMenu(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/menu/:id
 * Soft delete menu item - requires admin
 */
router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await menuController.deleteMenu(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(200).json({ message: 'Menu deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
