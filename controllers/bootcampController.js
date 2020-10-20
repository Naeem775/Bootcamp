const zipCode = require('zipcodes');
const Bootcamp = require('../models/Bootcamp');
const catchAsync = require('../utils/catchAsync');
const APIError = require('../utils/APIError');
const path = require('path');

exports.getAllBootcamps =catchAsync( async (req,res,next) => {
    
    // Filtering
    let query;
    
    const queryObj = {...req.query}
    const excludedFields = ['page','fields','sort', 'limit'];
    excludedFields.forEach(el => delete queryObj[el]);
    
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|eq)\b/g, match => `$${match}`);
    
    query = Bootcamp.find(JSON.parse(queryStr));
    
    // Selecting
    if(req.query.fields){
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    }else{
        query = query.select('-__v');
    }

    // Sorting
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();
    query = query.skip(startIndex).limit(limit);


    const bootcamps = await query;

    // Pagination Result
    const pagination = {}

    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page: page -1,
            limit
        }
    }

    res.status(200).json({
        results:bootcamps.length,
        status:'Success',
        pagination,
        data:{
            bootcamps
        }
    });
});

exports.createBootcamp = catchAsync(async (req,res,next) => {
    // console.log(req.body);
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
