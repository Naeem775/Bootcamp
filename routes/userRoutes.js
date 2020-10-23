const express = require('express');
const {
  Signup,
  Login,
  logOut,
  forgotPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', Signup);
router.post('/login', Login);
router.get('/logout', logOut);
router.post('/forgotPassword', forgotPassword);

module.exports = router;
