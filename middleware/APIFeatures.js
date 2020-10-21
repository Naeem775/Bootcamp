const { populate } = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const APIFeatures = Model => catchAsync(async (req,res,next) => {

    // Filtering
    let query;
    
    const queryObj = {...req.query}
    const excludedFields = ['page','fields','sort', 'limit'];
    excludedFields.forEach(el => delete queryObj[el]);
    
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|eq)\b/g, match => `$${match}`);
    
    query = Model.find(JSON.parse(queryStr));
    
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
    const total = await Model.countDocuments();
    query = query.skip(startIndex).limit(limit);


    const results = await query;

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

    res.APIFeatures = {
        status:'Success',
        results: results.length,
        pagination,
        data:{
            results
        } 
    }

    next();

});

module.exports = APIFeatures;