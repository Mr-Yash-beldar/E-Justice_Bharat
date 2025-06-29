
const globalErrorHandler=(err ,req,res,next)=>{
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'

    });
    next();

}

module.exports = globalErrorHandler;