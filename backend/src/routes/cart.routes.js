const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

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

router.post('/add', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await cartController.addToCart(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/item/:itemId', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await cartController.updateCartItem(req.user.id, req.params.itemId, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/item/:itemId', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await cartController.removeFromCart(req.user.id, req.params.itemId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/clear', checkLogin, checkRole('USER'), async function (req, res, next) {
  try {
    const result = await cartController.clearCart(req.user.id);
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
