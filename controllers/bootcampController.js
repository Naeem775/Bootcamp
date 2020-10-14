const Bootcamp = require('../models/Bootcamp');
const catchAsync = require('../utils/catchAsync');

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
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);


    const bootcamps = await query;

    res.status(200).json({
        results:bootcamps.length,
        status:'Success',
        data:{
            bootcamps
        }
    });
});