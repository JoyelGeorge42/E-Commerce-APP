const User = require('../model/user');
const Features = require('../utils/features');
const ErrorHandeler = require('../utils/errorhandeler');
const catchAsyncErrors = require('../middlewere/catchAsyncErrors')
const sendEmail = require('../utils/sendEmail');
//importing a variable for send token with cookie
const sendToken = require('../utils/sendToken');
//register a user 
//importing crypto library from nodejs
const crypto = require('crypto'); //no need to install this is prebuild module
const fileUpload = require('../utils/fileUpload');
const { Parser } = require('json2csv');

//register user
exports.registerUser = [
  fileUpload.single('avatar'), 
  catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password,gender} = req.body;
    const existingUser = await User.find({email:email});
    console.log('existing user...',existingUser)
    if(existingUser.length>0){
      return next(new ErrorHandeler(`A user already exist with ${email}`,400))
    }
    const baseUrl = 'http://localhost:3000';
    let fileUrl
    if(req.file){
      fileUrl = baseUrl + '/' + req.file?.path.replace(/\\/g, '/');
    }
    const user = new User({
        name
        ,email
        ,password,
        gender,
        avatar:{
            public_id:req.file?.filename,
            url:fileUrl
        }
    });
   await user.save();
   //writing a reusable functon for sending token
   sendToken(user,201,res)
 })]

 

 //login user
 exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
  const {email, password} = req.body;
  console.log(email, password)
  if(!email||!password){
    return next(new ErrorHandeler('Please enter email and password',400))
  }
 
  const user = await User.findOne({email: email}).select('+password')
  if(!user){
    return next(new ErrorHandeler('invalid email or password',401))
  }
  const isPasswordMatch = await user.passwordMatcher(password);
  if(!isPasswordMatch){
    return next(new ErrorHandeler('invalid email or password',401))
  }

   //writing a reusable functon for sending token

   sendToken(user,200,res)

 })



 //fuction for logout the user 
 exports.logoutUser = catchAsyncErrors(async (req,res,next)=>{
  const user = await req.user;
  console.log('user',user)
  // if (user) {
  //   user.token = null; // Assuming the user object has a 'token' property
  //   await user.save();
  // }

  res.status(200).json({
    success: true,
    message:'Logout successfully'
  })
 })



 //forgot Password
 exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{
  const user  = await User.findOne({ email:req.body.email});
  if(!user){
    return next(new ErrorHandeler('user not found',404));
  }
  // now we want resetToken
  //get resetPassword Token
  const resetToken = user.getResetPasswordToken();
  await user.save({validateBeforeSave:false});

  //creating a reset password Url
  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/password/reset/${resetToken}`;
  const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\n If You have not requested this email then please ignore it.`;
  try{
    await sendEmail({
      email:user.email,
      "subject":"Ecommerce password recovery",
      message
    })
    res.status(200).json({
      success: true,
      message:`Email send to ${user.email} successfully`,
      
    })
  }
  catch(error){
    //if there is an error we have to make user as ot waas previous means with no resetPasswordToken and 
    // no resetPasswordExpire
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.save({validateBeforeSave:false});
    return next(new ErrorHandeler(error.message,500))
  }
 })



 //reset password
 exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{
  const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  //creating a hash token 
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()}
  })
  if(!user){
    return next(new ErrorHandeler('Reset password Token is Invalid or Expired',400));
  }
  if(req.body.password!==req.body.confirmpassword){
    return next(new ErrorHandeler('password doesn`t match',400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.save();
  sendToken(user,200,res);
 })


 //get userDetails for profile
 exports.getUserDetails = catchAsyncErrors(async (req,res,next)=>{
  const user = await User.findOne({_id:req.user.id});
  res.status(200).json({
    success: true,
    user
  })
 })



 //update password 
 exports.updatePassword = catchAsyncErrors(async (req,res,next)=>{
  const user = await User.findOne({_id:req.user.id}).select('+password'); //now making password available through 
  //user
  const isPasswordMatch = await user.passwordMatcher(req.body.oldPassword);

  if(!isPasswordMatch){ //cheking whether old password exist in db
    return next(new ErrorHandeler('old password is incorrect',400))
  }
  // after checking password is in db we will check new and confirm password is same or not 
 if(req.body.newPassword!=req.body.confirmPassword){ //cheking whether old password exist in db
    return next(new ErrorHandeler('password is not matching',400))
  }

// if all is good then we save the password into database
user.password = req.body.newPassword;
await user.save();
sendToken(user,200,res);
 })


  //update profile(insted of password we can update everu thing)
  exports.updateProfile = catchAsyncErrors(async (req,res,next)=>{
   const newUserData = {
    name: req.body.name,
    email: req.body.email
   }
   if(!newUserData.name || !newUserData.email){
    return next(new ErrorHandeler('name or email is not there',400))
   }
   //we will update profile pic on cloudinary
   const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false
   });
   res.status(200).json({
    success:true,
    message: 'user profile updated successfully'
   })
   })



   //get user-- admin
   exports.getUser = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
      return next(new ErrorHandeler('user does not exist',400))
    }
    res.status(200).json({
      success:true,
      user
    })
   })  
  //function for download 
  exports.download = catchAsyncErrors(async (req,res,next)=>{
    try {
      const users = await User.find({}); // Assuming User is your model
      if (!users || users.length === 0) {
        return next(new ErrorHandeler('Users do not exist', 400));
      }
      let usersRes = []
      users.forEach(user => {
        const {name,email,gender,role,createdAt} = user;
        usersRes.push({
          "Name":
          name,
          "Email":email,
          "Gender":gender,"CreatedAt":createdAt,
          "Role":role,});
      })
      const fields = [ 'Name', 'Email', 'Gender', 'CreatedAt', 'Role'];
      const json2csvParser = await new Parser(fields);
      const csv = await json2csvParser.parse(usersRes);
  
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      res.setHeader('Content-Type', 'text/csv');
      res.send(csv); // Send the CSV data as the response
    } catch (error) {
      console.error(error);
      return next(new ErrorHandeler('Internal Server Error', 500));
    }
   }) 

   //get Allusers  --- admin
   exports.getUsers = catchAsyncErrors(async (req,res,next)=>{
    const users = await User.find();
   
    res.status(200).json({
      success:true,
      users
    })
   })

     //update user role -- admin
  exports.updateUserRole = catchAsyncErrors(async (req,res,next)=>{
    const newUserData = {
     name: req.body.name,
     email: req.body.email,
     role: req.body.role
    }
    if(!newUserData.name || !newUserData.email || !newUserData.role){
     return next(new ErrorHandeler('name or email is not there',400))
    }

     const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
     new:true,
     runValidators:true,
     useFindAndModify:false
    });

        res.status(200).json({
        success:true,
        message:'user role updated successfully'
        })
    })
 

  //delete user-- admin
   exports.deleteUser = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
      return next(new ErrorHandeler('user does not exist',400))
    }

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success:true,
      message:'user deleted successfully'
    })
   })

