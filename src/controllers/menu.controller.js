const Menu = require('../models/menu.model');

// Get all menus
exports.getAllMenus = async () => {
  const menus = await Menu.find({ isDeleted: false })
    .populate('category', 'name');
  return menus;
};

// Get menu by ID
exports.getMenuById = async (id) => {
  const menu = await Menu.findById(id).populate('category', 'name');
  if (menu && !menu.isDeleted) {
    return menu;
  }
  return null;
};

// Create new menu
exports.createMenu = async (data) => {
  const menu = new Menu(data);
  await menu.save();
  await menu.populate('category', 'name');
  return menu;
};

// Update menu
exports.updateMenu = async (id, data) => {
  const allowedFields = ['name', 'description', 'ingredients', 'price', 'category', 'prepTime', 'isActive'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const menu = await Menu.findByIdAndUpdate(id, updateData, { new: true })
    .populate('category', 'name');
  return menu;
};

// Soft delete menu
exports.deleteMenu = async (id) => {
  const menu = await Menu.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return menu;
};
