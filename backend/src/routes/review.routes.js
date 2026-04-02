const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

/**
 * GET /api/review/menu/:menuId
 * Get all reviews for a menu item (public)
 */
router.get('/menu/:menuId', async function (req, res, next) {
  try {
    const result = await reviewController.getMenuReviews(req.params.menuId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/review/:id
 * Get review by ID (public)
 */
router.get('/:id', async function (req, res, next) {
  try {
    const result = await reviewController.getReviewById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/review
 * Create new review - requires user login
 * Body: { menuId, rating, comment }
 */
router.post('/', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await reviewController.createReview(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/review/:id
 * Update own review - requires user login
 */
router.put('/:id', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await reviewController.updateReview(req.params.id, req.user.id, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Review not found or access denied' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/review/:id
 * Delete own review - requires user login (or admin)
 */
router.delete('/:id', checkLogin, checkRole('USER', 'ADMIN'), async function (req, res, next) {
  try {
    const result = await reviewController.deleteReview(req.params.id, req.user);
    if (!result) {
      return res.status(404).json({ message: 'Review not found or access denied' });
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
