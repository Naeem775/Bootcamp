const APIError = require('../utils/APIError');

// Handling JSON web token error for invalid signature
const JsonWebTokenError = err => new APIError('Invalid token,Please log in again',401);

// Handling Expired Token Error
const TokenExpiredError = err => new APIError('Your token has expired,Please log in again', 401);

// Handling Duplicate Field Errors
const duplicateFieldError = err => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `duplicate filed value: ${value} Please use another value`;
    return new APIError(message,400);
}

//Handling CastError
const castError = err => {
        const message = `Invalid ${err.path} : ${err.value} `;
        return new APIError(message,400);
}

// Handling Validation Errors
const ValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
  
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new APIError(message, 400);
  };


const sendErrorDev = (err,res) => {
    res.status(err.statusCode).json({
        status:err.status,
        name:err.name,
        message:err.message,
        errStack:err.stack,
        error:err
    });
}

const sendErrorProd = (err,res) => {
    if(err.isOperational){

        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        });
    }else{
        console.log(err);

        res.status(500).json({
            status:'Fail',
            message:'Something went wrong'
        });
    }
}

const errorHandler = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'Error'

    
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,res)
    } else if(process.env.NODE_ENV === 'production'){
        let error = { ...err }
        error.message = err.message;
        error.name = err.name;
        // Checking Errors
        if(error.name === 'CastError') error = castError (error);
        if(error.code === 11000) error = duplicateFieldError(error);
        if (error.name === 'ValidationError') error = ValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = JsonWebTokenError(error);
        if(error.name === 'TokenExpiredError') error = TokenExpiredError(error);
        sendErrorProd(error,res);
    }
    
}

module.exports = errorHandler;