const Course = require("../models/Course");
const catchAsync = require("../utils/catchAsync");
const APIError = require("../utils/APIError");
const Bootcamp = require("../models/Bootcamp");

exports.createCourse = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new APIError("No bootcamp found with this id", 401));
  }
  if (req.body.user !== bootcamp.user.toString() && req.user.role !== "admin") {
    return next(new APIError("You are not authorized to create  course", 401));
  }

  const course = await Course.create(req.body);
  res.status(201).json({
    status: "Success",
    data: {
      course,
    },
  });
});

// Get all courses for a bootcamp
exports.getCourses = catchAsync(async (req, res, next) => {
  let courses;
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
  } else {
    const courses = await Course.find();
  }

  if (!courses) {
    return next(new APIError("No courses found for this bootcamp", 401));
  }

  res.status(200).json({
    status: "Success",
    data: {
      courses,
    },
  });
});
