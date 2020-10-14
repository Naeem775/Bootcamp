const express = require('express');
const router = express.Router();
const {getAllBootcamps} = require('../controllers/bootcampController');

router.route('/').get(getAllBootcamps);

module.exports = router;