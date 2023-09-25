const express = require('express');
// const app = require('./app');
const {app,server} = require('./app');
const ErrorMiddlewere = require('./middlewere/error');
var cookieParser = require('cookie-parser');
//connecting mongoose
const mongoose = require('mongoose');
const ErrorHandeler = require('./utils/errorhandeler');
//handeling uncought error 
process.on('uncaughtException',(err)=>{
  console.log(err)
    process.exit(1);
})
main().catch(err => console.log(err));

async function main() {
  // await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
  await mongoose.connect('mongodb+srv://rahul:SLAvds0ppjoELQjM@cluster0.x82uvpt.mongodb.net/EcommerceDatabase',{ useNewUrlParser: true,useUnifiedTopology: true,});
 
  console.log('db connected')
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


//enabeling cors

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
//using cookieparser to pase the cookie in req.cookie
app.use(cookieParser())
///
//this is the middlewere which is used to parsed the data indside body 
app.use(express.json());
//getting the reference for the product routes
const productsRoute = require('./routes/product')
const userRoute = require('./routes/user');
const ordersRoute = require('./routes/order');
const chatMsgRoutes = require('./routes/chat-route');
//setting up the dotenv file 
require('dotenv').config();
app.use('/api/',productsRoute);
app.use('/api/',userRoute);
app.use('/api/',ordersRoute);
app.use('/api/',chatMsgRoutes);
//middlewere for error 
app.use(ErrorMiddlewere)
try{
  //app.listen(3000,()=>{  //change in case of socket implemetation
  server.listen(3000,()=>{
      console.log(`server is running on ${process.env.PORT}`);
  })
} catch (error) {
  return next(new ErrorHandeler('server error',500))
}
//unhandeled promise rejection error 
process.on('unhandledRejection',(err)=>{
  // app.close(()=>{
    process.exit(1);
  // })
})