const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu name is required'],
      trim: true,
      minlength: [2, 'Menu name must be at least 2 characters'],
      maxlength: [100, 'Menu name must not exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description must not exceed 500 characters']
    },
    ingredients: {
      type: String,
      required: [true, 'Ingredients are required'],
      maxlength: [500, 'Ingredients must not exceed 500 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    image: {
      type: String,
      default: null
    },
    preparationTime: {
      type: Number,
      default: 15,
      min: [1, 'Preparation time must be at least 1 minute']
    },
    calories: {
      type: Number,
      default: null,
      min: [0, 'Calories cannot be negative']
    },
    isVegan: {
      type: Boolean,
      default: false
    },
    isSpicy: {
      type: Boolean,
      default: false
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    },
    quantitySold: {
      type: Number,
      default: 0,
      min: [0, 'Quantity sold cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

// Index for query optimization
menuSchema.index({ name: 1 });
menuSchema.index({ category: 1 });
menuSchema.index({ isDeleted: 1 });
menuSchema.index({ isPopular: 1 });
menuSchema.index({ rating: -1 });

module.exports = mongoose.model('Menu', menuSchema);
