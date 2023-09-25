const Product = require('../model/product');
const Order = require('../model/order');
const ErrorHandeler = require('../utils/errorhandeler');
const catchAsyncErrors = require('../middlewere/catchAsyncErrors');
var _ = require('lodash');

//create new order
exports.newOrder = catchAsyncErrors(async(req,res,next)=>{
    const{shipingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shipingPrice,totalPrice} = req.body;
    const order = new Order({shipingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shipingPrice,totalPrice 
    ,paidAt:Date.now(),
    user:req.user._id });
    await order.save();
    res.status(201 ).json({
    success:true,
    order
});
})

//getting the single orcer
exports.getOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );
    if(!order){
        return next(new ErrorHandeler('order not found',404))
    }
    res.status(200).json({
        success:true,
        order
    });
})


//get logedin user order
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({user:req.user._id})

    res.status(200).json({
        success:true,
        orders
    });
})

//get all orders --admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find().populate(
        "user",
        "name email"
    );
    let totalAmmount = 0
    orders.forEach((order) =>{
        totalAmmount+=order.totalPrice
    })
    res.status(200).json({
        success:true,
        orders,
        totalAmmount
    });
})

//update order status --admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if(!order){
        return next(new ErrorHandeler('order not found',404))
    }
    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandeler('You have already daelivered this order',400))
    }

    order.orderItems.forEach(async item=>{
        await updateStock(item.product, item.quantity)
    })
    order.orderStatus = req.body.status;
    if(req.body.status === "Delivered"){
        order.deliveredAt=Date.now();
    }
    await order.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        message:"order status changed successfully"
    });
})

async function updateStock(id, quantity){
const product = await Product.findById(id);
product.stock-= quantity
await product.save({validateBeforeSave:false});
}

exports.orderAnalitics = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();
    const processingOrders = _.filter(orders, { orderStatus: 'Proccessing'});
    const deveredOrder  = _.filter(orders, { orderStatus: 'Delivered'});
    const tatal_revenue_tll_now = deveredOrder.reduce((accumulator, data) => accumulator + data.totalPrice,0)
    res.status(200).json({
        order_statics:{
        totalOrder:orders.length,
        proccessing: processingOrders.length,
        deleveredOrders:deveredOrder.length
        },
        total_revenue:tatal_revenue_tll_now

    });
});
//delete order  --admin

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandeler('order not found',404))
    }
    
    await Order.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success:true,
        message:"order deleted successfully",
    });
})