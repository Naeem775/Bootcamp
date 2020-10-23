const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// A user can only write one review for a bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to calculate average ratings for a bootcamp
ReviewSchema.statics.calcAverageRatings = async function (bootcampId) {
  const ratings = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        nRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  if (ratings.length > 0) {
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      totalRatings: ratings[0].nRatings,
      averageRating: ratings[0].averageRating,
    });
  }
};

// Calling calculate Average static method
ReviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.bootcamp);
});

// middleware to get id of the course which is being updated or deleted
ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.findOne();
  next();
});

// Middleware to update the average Cost of the course after deleting or updating a course
ReviewSchema.post(/^findOneAnd/, function () {
  this.review.constructor.calcAverageRatings(this.review.bootcamp._id);
});

//Middleware to Populate the bootcamps and users data for a review
ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'bootcamp',
    select: 'name description',
  }).populate({
    path: 'user',
    select: 'name',
  });
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
