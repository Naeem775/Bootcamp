const express = require('express');
const router = express.Router();
const {getAllBootcamps, createBootcamp, getBootcampWithinRadius,getBootcamp,uploadBootcampPhoto} = require('../controllers/bootcampController');

router.get('/getBootcampWithinRadius/:zipcode/:distance',getBootcampWithinRadius);
router.patch('/:id/photo', uploadBootcampPhoto);
router.route('/').get(getAllBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp);

module.exports = router;