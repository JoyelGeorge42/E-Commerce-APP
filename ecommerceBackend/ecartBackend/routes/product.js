const express = require('express');
const router = express.Router();
const Authentication = require('../utils/auth');
const {autherizedRole} = require('../utils/authRole');
const productController = require('../controller/product');

 router.get('/products',productController.getAllProducts)
 .get('/products/:id',productController.getProduct)
 .get('/categories',productController.getcategories)
 .get('/product/analitics',Authentication,autherizedRole('admin'),productController.productAnalitics)
 .post('/products/new',Authentication,autherizedRole('admin'),productController.creatProduct)
 .put('/products/:id',Authentication,autherizedRole('admin'),productController.modifyProduct)
 .delete('/products/:id',Authentication,autherizedRole('admin'),productController.deleteProdut)
 .put('/review',Authentication,productController.createProductReview)
 .get('/reviews',productController.getProductReview)
 .delete('/reviews',Authentication,productController.deleteProductReview)
module.exports = router;
