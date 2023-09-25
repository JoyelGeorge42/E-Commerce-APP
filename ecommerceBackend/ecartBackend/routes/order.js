const express = require('express');
const router = express.Router();
const Authentication = require('../utils/auth');
const {autherizedRole} = require('../utils/authRole');
const orderController = require('../controller/order');

 router.post('/order/new',Authentication,orderController.newOrder)
 router.get('/order/:id',Authentication,orderController.getOrder);
 router.get('/myorders',Authentication,orderController.myOrders);
 router.get('/orders',Authentication,autherizedRole("admin"),orderController.getAllOrders);
 router.get('/analitics',Authentication,autherizedRole("admin"),orderController.orderAnalitics);
 router.put('/order/:id',Authentication,autherizedRole("admin"),orderController.updateOrder);
 router.delete('/order/:id',Authentication,autherizedRole("admin"),orderController.deleteOrder);
module.exports = router;