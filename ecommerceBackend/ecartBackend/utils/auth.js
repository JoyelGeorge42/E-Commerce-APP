const catchAsyncErrors = require('../middlewere/catchAsyncErrors')
const ErrorHandeler = require('../utils/errorhandeler');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
Authentication = catchAsyncErrors(async (req,res,next)=>{
    // const {token} = req.cookies;
    // console.log()
    // if(!token){
    //   return next(new ErrorHandeler('please login to access that page',401))
    // }

    const { authorization } = req.headers;
    console.log('-------------', authorization);
    if (!authorization || !authorization.startsWith('Bearer')) {
      return next(new ErrorHandeler('Please provide a valid authorization token', 401));
    }
    
    const token = authorization.split(' ')[1];
      const decodedData = jwt.verify(token,process.env.JWT_SECRET_KEY);
    if (Date.now() >= decodedData.exp * 1000) {
      return next(new ErrorHandeler('Token has expired', 401));
    }


    // const decodedData =  jwt.verify(token,process.env.JWT_SECRET_KEY);
    console.log('decoded data',decodedData);
 req.user = await User.findById(decodedData.id);
 next();
})
module.exports = Authentication;

// autherizedRole = catchAsyncErrors((roles)=>{
//   return (req,res,next)=>{
//       console.log('getting the roles',roles,req)
//       if(!roles.includes(req.user.role)){
//           return next(new ErrorHandeler('please login to access that page',403))
//          }
//          next();
//      } 
//  });

// module.exports = autherizedRole;



// req.user = await User.findById(decodedData.id);
// next();
