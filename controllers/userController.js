const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const APIError = require('../utils/APIError');

// Filtering req.body data to only update allowed fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get current User Data form collection
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: 'Success',
    data: {
      user,
    },
  });
});

// Update Current User Data
exports.updateMe = catchAsync(async (req, res, next) => {
  // Check if user posts password update data and ask him to user password Update route
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new APIError(
        'Please use this route :/updateMyPassword to update your password',
        400
      )
    );
  }

  // Update User Data
  const filteredBody = filterObj(req.body, 'email', 'name');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: 'Success',
    data: {
      updatedUser,
    },
  });
});

// Get All Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  await User.find();

  res.status(200).json(res.APIFeatures);
});

// Get single User
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new APIError('No user found with this id', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: {
      user,
    },
  });
});

// Update User
exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.userId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!this.updateUser) {
    return next(new APIError('No user found with this id', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: {
      updatedUser,
    },
  });
});

// Delete User
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) {
    return next(new APIError('No user found with this id', 404));
  }

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});
