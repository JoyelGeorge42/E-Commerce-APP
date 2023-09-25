const Product = require('../model/product');
const Features = require('../utils/features');
const ErrorHandeler = require('../utils/errorhandeler');
const catchAsyncErrors = require('../middlewere/catchAsyncErrors');

const fileUpload = require('../utils/fileUpload');
//create product
exports.creatProduct = [
    fileUpload.single('image'), 
    catchAsyncErrors(async (req,res)=>{
    req.body.user = req.user.id
    const baseUrl = 'http://localhost:3000';
    const fileUrl = baseUrl + '/' + req.file.path.replace(/\\/g, '/');
    let product =  new Product(req.body);
    console.log('name',req.file.filename,'url',fileUrl,')))');
    product.image = [{
        public_id: req.file.filename,
        url: fileUrl
      }];
    await  product.save();
   res.status(201).json({
    success:true,
    product
   })
   })]


//get all products
exports.getAllProducts= catchAsyncErrors(async (req,res)=>{
    const resultPerPage = req.query.per_page;
    let products = []
    const productCount = await Product.countDocuments()
    if(Object.keys(req.query).length !== 0){
   const apifeature = new Features(Product.find(),req.query)
   .search()
   .filter()
   .pagination(resultPerPage);
   products = await apifeature.query;
    }else{
        products = await Product.find()
    }
  if(!products){
    return next(new ErrorHandeler('product not found',404))
  }
res.status(200).json({
    success:true,
    products,
    productCount
   
})
})
//single products
exports.getProduct= catchAsyncErrors(async (req,res)=>{
    const id = req.params.id
    const product = await Product.find({_id:id});
    console.log(product)
    if(!product){
        return next(new ErrorHandeler('product not found',404))
    }
  res.status(200).json({
      success:true,
      product,
  })
  })
//modify product
exports.modifyProduct= [
    fileUpload.single('image'),
    catchAsyncErrors(async (req,res,next)=>{
        const id = req.params.id;
        const product = await Product.findByIdAndUpdate({_id:id},req.body,{new:true})
        console.log('updated product..',id)
        if(!product){
            return next(new ErrorHandeler('product not found',404))
        }
        if(req.file){
            const baseUrl = 'http://localhost:3000';
            const fileUrl = baseUrl + '/' + req.file?.path.replace(/\\/g, '/');
            product.image = [{
            public_id: req.file.filename,
            url: fileUrl
          }];
        }
    res.status(200).json({
        success: true,
        product
    })
})]

//delete product
exports.deleteProdut = catchAsyncErrors(async (req,res)=>{
    const id = req.params.id;
   
     const product = await Product.findOneAndDelete({_id:id});
     if(!product){
        return next(new ErrorHandeler('product not found',404))
    }
      // Delete the associated image file
      if (product.image && product.image.public_id) {
        const imagePath = path.join(__dirname, '..', 'uploads', product.image.public_id);
  
        // Delete the file using the 'fs' module
        fs.unlinkSync(imagePath);
      }
    res.status(200).json({
        success: true,
        product
    })
})

//order analitics 
exports.productAnalitics= catchAsyncErrors(async (req,res)=>{
    const product = await Product.find({});
    if(!product){
        return next(new ErrorHandeler('product not found',204))
    }
     const productName = product.map(val=>val.name)
     const stock = product.map(val=>val.stock.toString())
  res.status(200).json({
      analiticsData:{
        product_name:productName,
        stock:stock
      },
  })
  })

//create review and update review
exports.createProductReview = catchAsyncErrors(async (req,res,next)=>{
    const {rating,comment,productId} = req.body;
    if(!rating){
        return next(new ErrorHandeler('rating is required',500))
    }
    const review ={
        user: req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }
    const product  = await Product.findById(productId);
    if(!product){
        return next(new ErrorHandeler('no product found',404))
    }
    const isReviewed = product.reviews.find(rev=>rev.user.toString()===req.user._id.toString())
    if(isReviewed){
        product.reviews.forEach(rev=>{
        if(rev.user.toString()===req.user._id.toString()){
            rev.comment = comment;
            rev.rating = rating;
        }
    })
    }else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }
    let avg = 0 
    product.reviews.forEach(rev=>{
        avg += rev.rating
    })
    product.ratings = avg/product.reviews.length;
    await product.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
        message:'thanks for review'
    })
})

//get all reviews for the a product
exports.getProductReview = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.query.id);
    if(!product){
        return next(new ErrorHandeler('no product found',404))
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})

//delete a review for a product
exports.deleteProductReview = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
        return next(new ErrorHandeler('no product found',404))
    }
    const reviews = product.reviews.filter(rev=>rev._id.toString()!==req.query.id.toString())
    //now we have to change the rating 

    let avg = 0 
    reviews.forEach(rev=>{
        avg += rev.rating 
    })
   const ratings = isNaN(avg/reviews.length)?0:avg/reviews.length;
   const numOfReviews = reviews.length;
//    await Product.findByIdAndUpdate(req.query.productId,{reviews,
//     ratings,numOfReviews},{
//         new:true,
//         runValidator:true,
//         useFindAndModify:false 
//     }
//     )
    product.reviews=reviews;
    product.ratings=ratings;
    product.numOfReviews=numOfReviews;
    await product.save({runValidator:true,})
    res.status(200).json({
        success:true,
    })
})

exports.getcategories = catchAsyncErrors(async (req,res,next)=>{
    let categories = new Set();
    const products = await Product.find();
    if(!products){
        return next(new ErrorHandeler('no product found',404))
    }
    products.forEach(prod=>{
        category = prod.category.trim().toLocaleLowerCase();
        categories.add(category);
    })
    const uniqueCategories = Array.from(categories);
    res.status(200).json({
        success:true,
        uniqueCategories
    })
})