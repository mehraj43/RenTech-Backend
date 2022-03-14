const express = require('express');
const router = express.Router();
const ProductDetail = require('../models/ProductDetails');
const rentUser = require('../models/RentUser');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const RentUser = require('../models/RentUser');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

const port = 8500;

// ROUTE 1: Add product to my account using : POST "api/productDetail/addProduct"   -Login required
router.post(
  '/addProduct',
  fetchuser,
  upload.single('productImage'),
  [
    body('productName', 'Enter a valid product name').isLength({ min: 2 }),
    body('price', 'Enter a positive number').isNumeric(),
    body('category', 'Enter a correct category').isLength({ min: 5 }),
    body('model', 'Enter a correct category').isLength({ min: 2 }),
    body('location', 'Enter a correct value').isLength({ min: 2 }),
    body('proDesc', 'Enter a correct value').isLength({ min: 5 }),
  ],
  async (req, res) => {
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    if (req.body.price < 0) {
      return res
        .status(401)
        .json({ message: 'Price must be a positive number' });
    }
    try {
      const { duration, noOfProduct } = req.body;
      let newProduct = {
        userId: req.user.id,
        productName: req.body.productName,
        category: req.body.category,
        model: req.body.model,
        price: req.body.price,
        proDesc: req.body.proDesc,
        location: req.body.location,
        productImage: req.file
          ? `http://localhost:${port}/uploads/${req.file.filename}`
          : null,
      };
      if (duration) {
        newProduct.duration = duration;
      }
      if (noOfProduct) {
        newProduct.noOfProduct = noOfProduct;
      }

      const product = await ProductDetail.create(newProduct);
      res.status(200).json({ success: true, message: 'Your product is post successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Some error occured' });
    }
  }
);

// ROUTE 2 is for the show the product to none login user
// ROUTE 2: Get product using : GET "api/productDetail/getProduct"  -Login not required
router.get('/getProduct/:category', async (req, res) => {
  try {
    let products = {};
    let search = req.header('search');
    if (search) {
      search = new RegExp(`${search}`, "i");
      products = await ProductDetail.find({ $and: [{ category: req.params.category }, { productName: { $regex: search } }] });
    } else {
      products = await ProductDetail.find({ category: req.params.category });
    }
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Some error occured' });
  }
});

// ROUTE 3: Get my product using : GET "api/productDetail/myProduct" --Login required
router.get('/myProduct', fetchuser, async (req, res) => {
  try {
    const myProduct = await ProductDetail.find({ userId: req.user.id });
    res.status(200).json({ success: true, myProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Some Error' });
  }
});

// ROUTE 4: Update my product details using : PUT "api/productDetail/updateProduct" --Login required
router.put('/updateProduct/:id', fetchuser, async (req, res) => {
  // If there are errors, return Bad request and the errors
  if (req.body.price < 0) {
    return res.status(400).json({ message: 'Price must be a positive number' });
  }
  try {
    const { productName, model, price, location, duration, noOfProduct } = req.body;
    let updateProduct = {};
    // if(productName){updateProduct.productName=productName};
    if (productName) {
      updateProduct.productName = productName;
    }
    if (model) {
      updateProduct.model = model;
    }
    if (price) {
      updateProduct.price = price;
    }
    if (location) {
      updateProduct.location = location;
    }
    if (duration) {
      updateProduct.duration = duration;
    }
    if (noOfProduct) {
      updateProduct.noOfProduct = noOfProduct;
    }
    // Find the product to be Updated
    let Product = await ProductDetail.findById(req.params.id);
    if (!Product) {
      res.status(404).json({ success: false, message: 'Not found' });
    }

    if (Product.userId.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Not Allowed' });
    }

    // Updating the product
    Product = await ProductDetail.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: updateProduct },
      { new: true }
    );
    res.status(200).json({ success: true, message: 'Your Product details is successfully updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ROUTE 5: Deleting the product using : DELETE "api/productDetail/deleteProduct" --Login required
router.delete('/deleteProduct/:id', fetchuser, async (req, res) => {
  try {
    // Find the product to be Delete
    let product = await ProductDetail.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Not found' });
    }

    // Allow deletion only if user owns this product
    if (product.userId.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Not allowed' });
    }

    if (product.dateOfRentExp > new Date()) {
      return res.status(200).send('Not allowed')
    }
    product = await ProductDetail.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product has been successfully deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// To getBookMarkedPrdoucts
router.get('/getBookMarkProducts', fetchuser, async (req, res) => {
  try {
    const User = await rentUser.findById(req.user.id);
    let bookMarkProducts = JSON.parse(User.bookMarkProducts);
    const myBookMarkProducts = await ProductDetail.find({ _id: { $in: bookMarkProducts } });
    res.status(200).json({ success: true, myBookMarkProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
})

// To count the number of Click on Product
router.put('/increaseClick/:id', async (req, res) => {
  try {
    let count = await ProductDetail.find({ _id: req.params.id }, { _id: 0, noOfClick: 1 })
    let noOfClickCount = count[0].noOfClick + 1;
    let resPo = await ProductDetail.findByIdAndUpdate({ _id: req.params.id }, { $set: { noOfClick: noOfClickCount } })
    res.status(200).json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
})

// To get the number of product
router.get('/totalProduct', async (req, res) => {
  try {
    const NoOfProducts = await ProductDetail.aggregate(
      [
        { $sort: { productName: 1 } },
        {
          $group: {
            _id: "$productName",
            TotalProduct: { $sum: "$noOfProduct" },
            MostPopular: { $sum: '$noOfClick' }
          }
        },
      ]
    )

    let productNames = [];
    let totalProducts = [];
    let popularityOfProducts = [];

    NoOfProducts.forEach(element => {
      productNames.push(element._id);
      totalProducts.push(element.TotalProduct);
      popularityOfProducts.push(element.MostPopular);
    });

    res.status(200).json({ success: true, productNames, totalProducts, popularityOfProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
})

// For user Data Analysis
router.get('/myProductAna', fetchuser, async (req, res) => {
  try {
    let products = await ProductDetail.find({ userId: req.user.id }, { productName: 1, ratingOfProduct: 1, noOfClick: 1, noOfBookMarked: 1 })
    let productNames = [];
    let ratingOfProducts = [];
    let noOfClicks = [];
    let noOfBookMarked = [];

    products.forEach(element => {
      productNames.push(element.productName);
      const rating = JSON.parse(element.ratingOfProduct);
      let allRating = 0;
      rating.forEach(rate => {
        allRating += rate.rating;
      });
      if (allRating == '') {
        ratingOfProducts.push(0);
      } else {
        ratingOfProducts.push(allRating / rating.length);
      }
      noOfClicks.push(element.noOfClick);
      noOfBookMarked.push(element.noOfBookMarked);
    });

    res.status(200).json({ success: true, productNames, ratingOfProducts, noOfClicks, noOfBookMarked });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
})

// To get individual product 
router.get('/getProductDe/:id', async (req, res) => {
  try {
    const product = await ProductDetail.findById({ _id: req.params.id });
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
})

// To give rating to the product
router.put('/ratePorduct/:id', fetchuser, [
  body('ratingDesc', 'reason must be more than 2 length').isLength({ min: 2 }),
  body('rating', 'Must be Number').isNumeric()
], async (req, res) => {
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: true, message: errors.array() });
  }
  if (req.body.rating <= 0 && req.body.rating > 5) {
    return res.status(400).json({ message: "rating must be greater than 0 or less than 5" });
  }
  try {
    const { rating, ratingDesc } = req.body;
    const userID = req.user.id;
    const { name } = await RentUser.findById({ _id: userID });
    let { ratingOfProduct, userId } = await ProductDetail.findById({ _id: req.params.id });
    if (userID == userId || ratingOfProduct.includes(`${userID}`)) {
      res.status(400).json({ success: false, message: "You are not allowed to rate this product" });
    } else {
      ratingOfProduct = JSON.parse(ratingOfProduct);
      ratingOfProduct.push({ userID, userName: name, rating, ratingDesc })
      ratingOfProduct = JSON.stringify(ratingOfProduct);
      let resp = await ProductDetail.findByIdAndUpdate({ _id: req.params.id }, { $set: { ratingOfProduct: ratingOfProduct } });
      res.status(200).json({ success: true, ratingOfProduct });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
})

module.exports = router;
