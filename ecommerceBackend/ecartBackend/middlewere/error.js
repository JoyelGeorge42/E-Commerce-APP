const ErrorHandeler = require('../utils/errorhandeler');
const error = require('../utils/errorhandeler');
 module.exports = (err,req,res,next)=>{
err.statusCode = err.statusCode || 500;
err.message = err.message || 'enternal server error';
if(err.name == 'CastError'){
    const message = `resource not found ${err.path}`
    err = new ErrorHandeler(message,400)
}

//if  we register with same user two times we get error  "E11000 duplicate key error collection:
// to handel this we will handel the mongoose duplicate key error 
if(err.code === 11000){
    const message = `duplicate ${Object.keys(err.keyValue)} entered `
    err = new ErrorHandeler(message,400)
}

//if wrong JWT entered 
if(err.name == 'JsonWebTokenError'){
    const message = `json web token is invalid try again`;
    err = new ErrorHandeler(message,401)
}

//jwt expire error 
if(err.name == 'TokenExpiredError'){
    const message = `json web token is expired try again`;
    err = new ErrorHandeler(message,400)
}

res.status(err.statusCode).json({
    success:false,
    message: err.message
})
 }