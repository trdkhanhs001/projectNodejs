const Cart = require('../models/cart.model');
const Menu = require('../models/menu.model');

// Get user's cart
exports.getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.menu');
  return cart;
};

// Add item to cart - Using atomic operations to prevent race conditions
exports.addToCart = async (userId, { menuId, quantity }) => {
  // Verify menu item exists
  const menuItem = await Menu.findById(menuId);
  if (!menuItem) {
    throw new Error('Menu item not found');
  }

  // Use atomic update operator to prevent race conditions
  let cart = await Cart.findOneAndUpdate(
    { user: userId, 'items.menu': menuId },
    { $inc: { 'items.$.quantity': quantity } },
    { new: true }
  ).populate('items.menu');

  // If item doesn't exist, add it
  if (!cart || cart.items.length === 0) {
    cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $push: { items: { menu: menuId, quantity } } },
      { new: true, upsert: true }
    ).populate('items.menu');
  }

  return cart;
};

// Update cart item quantity - Using atomic operations
exports.updateCartItem = async (userId, itemId, { quantity }) => {
  if (quantity <= 0) {
    // Remove item if quantity becomes 0 or negative
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    ).populate('items.menu');
    return cart;
  }

  const cart = await Cart.findOneAndUpdate(
    { user: userId, 'items._id': itemId },
    { $set: { 'items.$.quantity': quantity } },
    { new: true }
  ).populate('items.menu');

  if (!cart) {
    throw new Error('Cart or item not found');
  }

  return cart;
};

// Remove item from cart
exports.removeFromCart = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(item => item._id.toString() !== itemId);
  await cart.save();
  await cart.populate('items.menu');
  return cart;
};

// Clear cart
exports.clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    throw new Error('Cart not found');
  }

  cart.items = [];
  await cart.save();
  return cart;
};
