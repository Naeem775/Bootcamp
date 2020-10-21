const express = require('express');
const router = express.Router({mergeParams:true});
const {protect,restrictTo} = require('../controllers/authController');
const {createCourse} = require('../controllers/courseController');

router.route('/').post(protect,restrictTo('publisher','admin'),createCourse);

module.exports = router;