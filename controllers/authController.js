const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const APIError = require('../utils/APIError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (res, user, statusCode) => {
  const token = signToken(user.id);
  // Setting up cookie
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // if code is in production then cookies will be sent on only https connections
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // sending cookie
  res.cookie('jwt', token, cookieOptions);

  // preventing user password to show up in response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};

// Signing Up a user
exports.Signup = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return next(
      new APIError(
        'A user already exist with this email id,please use another one',
        400
      )
    );
  }

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  createSendToken(res, newUser, 201);
});

// Sining In User
exports.Login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new APIError(`Please Enter Your Email and Password`, 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new APIError(`Email or Password is not correct`));
  }

  createSendToken(res, user, 200);
});

// Logging out a user
exports.logOut = catchAsync(async (req, res, next) => {
  res.cookie('jwt', '', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'Success',
    data: {},
  });
});

// Protect Middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Getting token and check of it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new APIError('You are not logged in,please log in to get access', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new APIError(`The user belongs to this token does not exist anymore`, 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new APIError(
        'User changed password after token issued,please log in again',
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

// Restricting roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new APIError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new APIError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new APIError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  //  1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  // 2) if token has not expired and there is user, set the new password
  if (!user) {
    return next(new APIError('Token is invalid or has expired', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  // 3) Log the user in, Send jwt
  createSendToken(res, user, 200);
});
