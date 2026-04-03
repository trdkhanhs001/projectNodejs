const Category = require('../models/category.model');
const cloudinary = require('../config/cloudinary');

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
exports.createCategory = async (data, adminId, file) => {
  const { name, description, displayOrder, isActive } = data;

  let imageUrl = null;

  // Upload image to Cloudinary if provided
  if (file) {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'restaurant/category',
            resource_type: 'auto',
            public_id: `category_${Date.now()}`,
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

  const category = new Category({
    name,
    description: description || null,
    image: imageUrl,
    displayOrder: displayOrder || 0,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: adminId
  });

  await category.save();
  return category;
};

// Update category
exports.updateCategory = async (id, data, adminId, file) => {
  const { name, description, displayOrder, isActive } = data;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
  if (isActive !== undefined) updateData.isActive = isActive;
  updateData.updatedBy = adminId;

  // Handle image upload
  if (file) {
    try {
      // Get current category to find old image
      const category = await Category.findById(id);
      
      // Delete old image from Cloudinary if exists
      if (category && category.image) {
        try {
          const url = category.image;
          const publicId = url.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(`restaurant/category/${publicId}`);
        } catch (err) {
          // Silently handle deletion errors
        }
      }

      // Upload new image
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'restaurant/category',
            resource_type: 'auto',
            public_id: `category_${Date.now()}`,
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

  const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
  return category;
};

// Soft delete category
exports.deleteCategory = async (id) => {
  const category = await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return category;
};
