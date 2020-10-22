const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const APIFeatures = require('../middleware/APIFeatures');
const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protect, restrictTo('user', 'admin'), createReview)
  .get(APIFeatures(Review), getAllReviews);

router
  .route('/:reviewId')
  .get(getReview)
  .patch(protect, restrictTo('user', 'admin'), updateReview)
  .delete(protect, restrictTo('user', 'admin'), deleteReview);

module.exports = router;
