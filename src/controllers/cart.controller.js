const Cart = require('../models/cart.model');
const Menu = require('../models/menu.model');

// Get user's cart
exports.getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.menu');
  return cart;
};

// Add item to cart
exports.addToCart = async (userId, { menuId, quantity }) => {
  let cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const menuItem = await Menu.findById(menuId);
  if (!menuItem) {
    throw new Error('Menu item not found');
  }

  const existingItem = cart.items.find(item => item.menu.toString() === menuId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ menu: menuId, quantity });
  }

  await cart.save();
  await cart.populate('items.menu');
  return cart;
};

// Update cart item quantity
exports.updateCartItem = async (userId, itemId, { quantity }) => {
  const cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    throw new Error('Cart not found');
  }

  const item = cart.items.find(i => i._id.toString() === itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity > 0) {
    item.quantity = quantity;
  } else {
    cart.items = cart.items.filter(i => i._id.toString() !== itemId);
  }

  await cart.save();
  await cart.populate('items.menu');
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
