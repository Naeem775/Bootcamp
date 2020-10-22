const Course = require('../models/Course');
const catchAsync = require('../utils/catchAsync');
const APIError = require('../utils/APIError');
const Bootcamp = require('../models/Bootcamp');

exports.createCourse = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new APIError('No bootcamp found with this id', 401));
  }
  if (req.body.user !== bootcamp.user.toString() && req.user.role !== 'admin') {
    return next(new APIError('You are not authorized to create  course', 401));
  }

  const course = await Course.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      course,
    },
  });
});

// Get all courses for a bootcamp
exports.getAllCourses = catchAsync(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = await Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = await Course.find();
  }

  const courses = await query;

  if (!courses) {
    return next(new APIError('No courses found for this bootcamp', 404));
  }

  res.status(200).json(res.APIFeatures);
});

exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new APIError('No course found with this id', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: {
      course,
    },
  });
});

// Update Course
exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return next(new APIError('No course found with this id', 404));
  }

  if (req.user.id !== course.user._id.toString() && req.user.role !== 'admin') {
    return next(
      new APIError('You are not authorized to update this course', 401)
    );
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.courseId,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  res.status(200).json({
    status: 'Success',
    data: {
      updatedCourse,
    },
  });
});

// Delete Course
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return next(new APIError('No course found with this id', 404));
  }

  if (req.user.id !== course.user._id.toString() && req.user.role !== 'admin') {
    return next(
      new APIError('You are not authorized to update this course', 401)
    );
  }

  await Course.findByIdAndDelete(req.params.courseId);

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});
