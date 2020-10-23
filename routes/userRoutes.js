const express = require('express');
const User = require('../models/User');
const APIFeatures = require('../middleware/APIFeatures');
const { protect, restrictTo } = require('../controllers/authController');

const {
  Signup,
  Login,
  logOut,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const {
  getMe,
  updateMe,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.post('/signup', Signup);
router.post('/login', Login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Middleware to protect routes
router.use(protect);

router.get('/logout', logOut);
router.get('/getMe', getMe);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', updateMe);

// Middleware to allow only admin to access these routes
router.use(protect, restrictTo('admin'));

router.get('/', APIFeatures(User), getAllUsers);
router.get('/:userId', getUser);
router.patch('/:userId', updateUser);
router.delete('/:userId', deleteUser);

module.exports = router;
