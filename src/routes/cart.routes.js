const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

/**
 * GET /api/cart
 * Get current user's cart - requires user login
 */
router.get('/', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await cartController.getCart(req.user.id);
    if (!result) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/cart/add
 * Add menu item to cart
 * Body: { menuId, quantity }
 */
router.post('/add', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await cartController.addToCart(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/cart/item/:itemId
 * Update cart item quantity
 * Body: { quantity }
 */
router.put('/item/:itemId', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await cartController.updateCartItem(req.user.id, req.params.itemId, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/cart/item/:itemId
 * Remove item from cart
 */
router.delete('/item/:itemId', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await cartController.removeFromCart(req.user.id, req.params.itemId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/cart/clear
 * Clear entire cart
 */
router.delete('/clear', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await cartController.clearCart(req.user.id);
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
