const express = require('express');
const router = express.Router();
const {getAllBootcamps, createBootcamp, getBootcampWithinRadius,getBootcamp,uploadBootcampPhoto, updateBootcamp, deleteBootcamp} = require('../controllers/bootcampController');
const {protect,restrictTo} = require('../controllers/authController');

router.get('/getBootcampWithinRadius/:zipcode/:distance',getBootcampWithinRadius);
router.patch('/:id/photo', uploadBootcampPhoto);
router.route('/').get(getAllBootcamps).post(protect, restrictTo('publisher','admin'),createBootcamp);

router.route('/:id').get(getBootcamp).patch(updateBootcamp).delete(deleteBootcamp);

module.exports = router;