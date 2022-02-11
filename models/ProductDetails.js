const mongoose = require('mongoose');

// Schema for ProductDetail Collection
const ProductDetailSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userId',
  },
  productName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
  },
  model: {
    type: String,
  },
  proDesc: {
    type: String,
  },
  duration: {
    type: Number,
    default: null,
  },
  noOfProduct: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  ratingOfProduct: {
    type: Number,
    default: 0,
  },
  numberOfPeople: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now, // Seting Default Date to save the post/add time of users
  },
});

// Creating Collection ProductDetail or using
const ProductDetail = mongoose.model('productDetail', ProductDetailSchema);

module.exports = ProductDetail;
