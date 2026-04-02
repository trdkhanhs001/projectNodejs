const Category = require('../models/category.model');

// Get all categories
exports.getAllCategories = async () => {
  const categories = await Category.find({ isDeleted: false });
  return categories;
};

// Get category by ID
exports.getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (category && !category.isDeleted) {
    return category;
  }
  return null;
};

// Create new category
exports.createCategory = async (data) => {
  const category = new Category(data);
  await category.save();
  return category;
};

// Update category
exports.updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, { new: true });
  return category;
};

// Soft delete category
exports.deleteCategory = async (id) => {
  const category = await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return category;
};
