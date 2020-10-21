const express = require('express');
const router = express.Router();
const {getAllBootcamps, createBootcamp,
     getBootcampWithinRadius,getBootcamp,
     uploadBootcampPhoto, updateBootcamp, 
     deleteBootcamp} = require('../controllers/bootcampController');
const {protect,restrictTo} = require('../controllers/authController');
const APIFeatures = require('../middleware/APIFeatures');
const Bootcamp = require('../models/Bootcamp');


router.get('/getBootcampWithinRadius/:zipcode/:distance',getBootcampWithinRadius);
router.route('/').get(APIFeatures(Bootcamp),getAllBootcamps);
router.get('/:id',getBootcamp);

// protect router middleware
router.use(protect, restrictTo('publisher','admin'));

// All these routes are protected
router.post('/',createBootcamp);
router.patch('/:id/photo', uploadBootcampPhoto);

router.patch('/:id',updateBootcamp)
router.delete('/:id',deleteBootcamp);

module.exports = router;