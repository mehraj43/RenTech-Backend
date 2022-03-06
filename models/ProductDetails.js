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
    default: 28,
  },
  noOfProduct: {
    type: Number,
    default: 1,
  },
  noOfClick: {
    type: Number,
    default: 0
  },
  noOfBookMarked: {
    type: Number,
    default: 0
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
    type: String,
    default: '[]',
  },
  userOfProduct:{
    type: String,
    default: null
  },
  // To check the product is already ranted or not or when
  dateOfRent:{
    type: Date,
    default: Date.now,
  },
  dateOfRentExp:{
    type: Date,
    default: Date.now,
  },
  date: {
    type: Date,
    default: Date.now, // Seting Default Date to save the post/add time of productDetails
  },
});

// Creating Collection ProductDetail or using
const ProductDetail = mongoose.model('productDetail', ProductDetailSchema);

module.exports = ProductDetail;
