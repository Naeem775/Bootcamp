const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const APIError = require('../utils/APIError');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');

const signToken = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (res,user,statusCode) => {
    const token = signToken(user.id);
    // console.log(token);
    res.status(statusCode).json({
        status:'Success',
        token,
        data:{
            user
        }
    })
}

// Signing Up a user
exports.Signup = catchAsync(async (req,res,next) => {
    // console.log(req.body);
    const {name,email,password,passwordConfirm} = req.body
    const user  = await User.findOne({email});
    if(user){
        return next(new APIError('A user already exist with this email id,please use another one',400));
    }

    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
    });

    createSendToken(res,newUser,201);

});

// Sining In User
exports.Login = catchAsync(async(req,res,next) => {
    const {email,password} = req.body
    if(!email || !password){
        return next(new APIError(`Please Enter Your Email and Password`,400));
    }

    const user  = await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new APIError(`Email or Password is not correct`));
    }

    createSendToken(res,user,200);
});

// Protect Middleware
exports.protect = catchAsync(async(req,res,next) => {
    let token;
    // 1) Getting token and check of it's there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        // console.log(req.headers);
        token = req.headers.authorization.split(' ')[1];
        // console.log(token)
    }
    if(!token){
        return next(new APIError('You are not logged in,please log in to get access',401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    // console.log(decoded);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new APIError(`The user belongs to this token does not exist anymore`,401))
    }

    // 4) Check if user changed password after the token was issued
    if(currentUser.passwordChangedAfter(decoded.iat)){
        return next(new APIError('User changed password after token issued,please log in again',401));
    }

    req.user = currentUser;
    next();

});

exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new APIError('You do not have permission to perform this action',403));
        }
        next();
    }
}