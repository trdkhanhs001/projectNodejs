const Review = require('../models/review.model');
const Menu = require('../models/menu.model');

exports.getMenuReviews = async (menuId) => {
  const reviews = await Review.find({ menu: menuId, isDeleted: false })
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 });
  return reviews;
};

// Get review by ID
exports.getReviewById = async (id) => {
  const review = await Review.findById(id)
    .populate('user', 'fullName email')
    .populate('menu', 'name');
  if (review && !review.isDeleted) {
    return review;
  }
  return null;
};

// Create new review
exports.createReview = async (userId, { menuId, rating, comment, order }) => {
  // Check if menu exists
  const menu = await Menu.findById(menuId);
  if (!menu) {
    throw new Error('Menu item not found');
  }

  const review = new Review({
    user: userId,
    menu: menuId,
    order: order,
    rating,
    order,
    comment
  });

  await review.save();
  await review.populate('user', 'fullName email');
  return review;
};

// Update review
exports.updateReview = async (reviewId, userId, { rating, comment }) => {
  const review = await Review.findById(reviewId);
  
  if (!review) {
    return null;
  }

  // Check if user owns the review
  if (review.user.toString() !== userId) {
    return null;
  }

  if (rating) review.rating = rating;
  if (comment) review.comment = comment;

  await review.save();
  await review.populate('user', 'fullName email');
  return review;
};

// Delete review
exports.deleteReview = async (reviewId, user) => {
  const review = await Review.findById(reviewId);
  
  if (!review) {
    return null;
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== user.id && user.role !== 'ADMIN') {
    return null;
  }

  review.isDeleted = true;
  await review.save();
  return review;
};
