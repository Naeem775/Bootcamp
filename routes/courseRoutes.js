const express = require('express');
const router = express.Router({mergeParams:true});
const {protect,restrictTo} = require('../controllers/authController');
const {createCourse,getCourses} = require('../controllers/courseController');

router.route('/').get(getCourses)
      .post(protect,restrictTo('publisher','admin'),createCourse);


module.exports = router;