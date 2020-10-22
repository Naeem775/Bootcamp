const catchAsync = require('../utils/catchAsync');
const APIError = require('../utils/APIError');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// Create a review
exports.createReview = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new APIError('No bootcamp found with this id', 404));
  }

  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;

  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'Success',
    data: {
      review,
    },
  });
});

// Get All Reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = Review.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Review.find();
  }
  const reviews = await query;
  if (!reviews) {
    return next(new APIError('No reviews found for this bootcamp', 404));
  }
  res.status(200).json(res.APIFeatures);
});

// Get a Single Review
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return next(new APIError('No review found with this id', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: {
      review,
    },
  });
});

// Update A Review
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return next(new APIError('Review does not found with this id', 404));
  }
  if (req.user.id !== review.user._id.toString() && req.user.role !== 'admin') {
    return next(
      new APIError('You are not authorized to update this review', 401)
    );
  }
  const updateReview = await Review.findByIdAndUpdate(
    req.params.reviewId,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  res.status(200).json({
    status: 'Success',
    data: {
      updateReview,
    },
  });
});

// Delete Review
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return next(new APIError('Review does not found with this id', 404));
  }
  if (req.user.id !== review.user._id.toString() && req.user.role !== 'admin') {
    return next(
      new APIError('You are not authorized to update this review', 401)
    );
  }

  await Review.findByIdAndDelete(req.params.reviewId);
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});
