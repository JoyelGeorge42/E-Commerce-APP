const Message = require('../model/user-chat');
const catchAsyncErrors = require('../middlewere/catchAsyncErrors')

 //fuction for getting all chat msg 
 exports.getAllChat = catchAsyncErrors(async (req,res,next)=>{
    const chatmsg = await Message.find()
    res.status(200).json({
      success: true,
      chatmsg
    })
   })
// function for storing chat messages
 //login user
//  exports.storeMsg = catchAsyncErrors(async(req,res,next)=>{
//     const {email, password} = req.body;
//    })