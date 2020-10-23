const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    // select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password do not match,please confirm your password',
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  passwordChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hashing Password
UserSchema.pre('save', async function (next) {
  // run only if user update or create new password
  if (!this.isModified('password')) return next();

  // bcrypt password
  this.password = await bcrypt.hash(this.password, 12);

  // do not store confirm password in database
  this.passwordConfirm = undefined;

  next();
});

// Comparing Password
UserSchema.methods.correctPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

// User changed password after token
UserSchema.methods.passwordChangedAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }

  return false;
};

// Password Reset Token
UserSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log(resetToken, this.resetPasswordToken);
  this.resetPasswordExpire = Date.now() + 10 * 1000;
};

module.exports = mongoose.model('User', UserSchema);
