const zipCode = require('zipcodes');
const Bootcamp = require('../models/Bootcamp');
const catchAsync = require('../utils/catchAsync');
const APIError = require('../utils/APIError');
const path = require('path');


exports.getAllBootcamps =catchAsync( async (req,res,next) => {

    res.status(200).json(res.APIFeatures);
});

exports.createBootcamp = catchAsync(async (req,res,next) => {
    // Add user to req.body
    req.body.user = req.user.id

    // Check published bootcamps for a user
    const publishedBootcamp = await Bootcamp.findOne({user:req.user.id});

    if(publishedBootcamp && req.user.role !== 'admin' ){
        return next(new APIError('This publisher has already published a bootcamp',401));
    }

    const newBootcamp = await Bootcamp.create(req.body);
    // console.log(newBootcamp);
    res.status(201).json({
        status:'Success',
        data:{
            newBootcamp
        }
    });
});

exports.getBootcamp = catchAsync(async (req,res,next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(new APIError('No Bootcamp found with this id',404));
    }
    res.status(200).json({
        status:'Success',
        data:{
            bootcamp
        }
    });
});

exports.getBootcampWithinRadius = catchAsync(async (req,res,next) => {
    const {zipcode,distance} = req.params
    console.log(zipcode)
    const loc = await zipCode.lookup(zipcode);
    const lat = loc.latitude;
    const lang = loc.longitude

    const radius = distance/3963;

    const bootcamps = await Bootcamp.find({
        location: {$geoWithin:{ $centerSphere:[[lang,lat],radius]}}
    });

    res.status(200).json({
        status:'Success',
        results: bootcamps.length,
        data:{
            bootcamps
        }
    });
    
});


// Upload a photo for bootcamp
exports.uploadBootcampPhoto =catchAsync(async (req,res,next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp){
        return next(new APIError(`No bootcamp found with this id ${req.params.id}`,400));
    }


    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new APIError('You are not authorized to update bootcamp',401));
    }
    
    if(!req.files){
        return next(new APIError(`Please upload a file`,400));
    }
    
    // console.log(req.files);
    const file = req.files.file

    if(!file.mimetype.startsWith('image')){
        return next(new APIError('Please upload an image file', 400));
    }

    if(file.size > process.env.MAX_UPLOAD_SIZE){
        return next(new APIError(`please upload file with size less than 1MB`,400));
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    
    file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err => {
        if (err){
            return next(new APIError('problem with file upload,please try again',500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            status:'Success',
            data:{
                data:file.name
            }
        });
    });
});

exports.updateBootcamp = catchAsync(async (req,res,next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new APIError('No bootcamp found with this id',404));
    }

    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new APIError('You are not authorized to update bootcamp',401));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });

    res.status(200).json({
        status:'Success',
        data:{
            bootcamp
        }
    });
});


exports.deleteBootcamp = catchAsync(async (req,res,next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(new APIError(`No bootcamp found with this id ${req.params.id}`,400));
    }

    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new APIError('You are not authorized to Delete bootcamp',404));
    }


    bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status:'Success',
        data: null
    });
});