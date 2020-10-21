const Course = require('../models/Course');
const catchAsync = require('../utils/catchAsync');
const APIError = require('../utils/APIError');
const Bootcamp = require('../models/Bootcamp');

exports.createCourse = catchAsync(async (req,res,next) => {
    if(!req.body.user) req.body.user = req.user.id;
    if(!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;
    console.log(req.body.user);

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    console.log(bootcamp.user);
    if(req.body.user !== bootcamp.user.toString()){
        return next(new APIError('You are not authorized to create  course',401));
    }

    const course = await Course.create(req.body);
    res.status(201).json({
        status:'Success',
        data:{
            course
        }
    });
});