const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please enter a product name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please enter a product price'],
    maxLength: [8, 'Price cannot exceed more than 8 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter a product description']
  },
  ratings: {
    type: Number,
    default: 0
  },
  image: [
    {
      public_id: {
        type: String,
        // required: true
      },
      url: {
        type: String,
        // required: true
      }
    }
  ],
  category: {
    type: String,
    required: [true, 'Please enter a product category']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    maxLength: [4, 'Stock cannot exceed 4 characters'],
    default: 1
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: [true,'rating is required'],
        
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user:{
    type:mongoose.Schema.ObjectId,
    ref:"User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);