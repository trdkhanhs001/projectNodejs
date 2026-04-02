const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

/**
 * GET /api/category
 * Get all categories (public)
 */
router.get('/', async function (req, res, next) {
  try {
    const result = await categoryController.getAllCategories();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/category/:id
 * Get category by ID (public)
 */
router.get('/:id', async function (req, res, next) {
  try {
    const result = await categoryController.getCategoryById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/category
 * Create new category - requires admin
 */
router.post('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await categoryController.createCategory(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/category/:id
 * Update category - requires admin
 */
router.put('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await categoryController.updateCategory(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/category/:id
 * Soft delete category - requires admin
 */
router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await categoryController.deleteCategory(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
