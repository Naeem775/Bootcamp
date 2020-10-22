const express = require('express');
const APIFeatures = require('../middleware/APIFeatures');
const Course = require('../models/Course');

const router = express.Router({ mergeParams: true });
const { protect, restrictTo } = require('../controllers/authController');
const {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

router
  .route('/')
  .get(APIFeatures(Course), getAllCourses)
  .post(protect, restrictTo('publisher', 'admin'), createCourse);

router
  .route('/:courseId')
  .get(getCourse)
  .patch(protect, restrictTo('admin', 'publisher'), updateCourse)
  .delete(protect, restrictTo('admin', 'publisher'), deleteCourse);

module.exports = router;
