const Menu = require('../models/menu.model');
const cloudinary = require('../config/cloudinary');

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
exports.createMenu = async (data, adminId, file) => {
  const { name, description, ingredients, price, category } = data;

  let imageUrl = null;

  // Upload image to Cloudinary if provided
  if (file) {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'restaurant/menu',
            resource_type: 'auto',
            public_id: `menu_${Date.now()}`,
            format: 'jpg',
            quality: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      throw new Error('Image upload failed: ' + uploadError.message);
    }
  }

  const menu = new Menu({
    name,
    description,
    ingredients: ingredients || null,
    price,
    category,
    image: imageUrl,
    createdBy: adminId
  });

  await menu.save();
  await menu.populate('category', 'name');
  return menu;
};

// Update menu
exports.updateMenu = async (id, data, adminId, file) => {
  const { name, description, ingredients, price, category, preparationTime, isActive } = data;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (ingredients !== undefined) updateData.ingredients = ingredients;
  if (price !== undefined) updateData.price = price;
  if (category !== undefined) updateData.category = category;
  if (preparationTime !== undefined) updateData.preparationTime = preparationTime;
  if (isActive !== undefined) updateData.isActive = isActive;
  updateData.updatedBy = adminId;

  // Handle image upload
  if (file) {
    try {
      // Get current menu to find old image
      const menu = await Menu.findById(id);
      
      // Delete old image from Cloudinary if exists
      if (menu && menu.image) {
        try {
          const url = menu.image;
          const publicId = url.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(`restaurant/menu/${publicId}`);
        } catch (err) {
          // Silently handle deletion errors
        }
      }

      // Upload new image
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'restaurant/menu',
            resource_type: 'auto',
            public_id: `menu_${Date.now()}`,
            format: 'jpg',
            quality: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      updateData.image = uploadResult.secure_url;
    } catch (uploadError) {
      throw new Error('Image upload failed: ' + uploadError.message);
    }
  }

  const menu = await Menu.findByIdAndUpdate(id, updateData, { new: true })
    .populate('category', 'name');
  return menu;
}

// Soft delete menu
exports.deleteMenu = async (id) => {
  const menu = await Menu.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return menu;
};
