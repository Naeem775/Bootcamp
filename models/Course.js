const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a course title'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    weeks: {
      type: String,
      required: [true, 'Please add number of weeks'],
    },
    tuition: {
      type: Number,
      required: [true, 'Please add a tuition cost'],
    },
    minimumSkill: {
      type: String,
      required: [true, 'Please add a minimum skill'],
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Static method to calculate average cost for a bootcamp
CourseSchema.statics.calcAverageCost = async function (bootcampId) {
  const cost = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);
  console.log(cost);
  if (cost.length > 0) {
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageCost: Math.round(cost[0].averageCost / 10) * 10,
    });
  }
};

// Middleware to call the calculateAverage method
CourseSchema.post('save', function () {
  this.constructor.calcAverageCost(this.bootcamp);
});

// middleware to get id of the course which is being updated or deleted
CourseSchema.pre(/^findOneAnd/, async function (next) {
  this.course = await this.findOne();
  // console.log(this.course);
  next();
});

// Middleware to update the average Cost of the course after deleting or updating a course
CourseSchema.post(/^findOneAnd/, async function () {
  this.course.constructor.calcAverageCost(this.course.bootcamp._id);
});

//Middleware to Populate the bootcamps and users data for a course
CourseSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'bootcamp',
    select: 'name description',
  }).populate({
    path: 'user',
    select: 'name',
  });

  next();
});

module.exports = mongoose.model('Course', CourseSchema);
