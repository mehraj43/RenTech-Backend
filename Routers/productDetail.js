const express = require('express');
const router = express.Router();
const ProductDetail = require('../models/ProductDetails');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const multer = require('multer');

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
  ],
  async (req, res) => {
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (req.body.price < 0) {
      return res
        .status(400)
        .json({ errors: 'Price must be a positive number' });
    }
    try {
      const { duration, noOfProduct } = req.body;
      let newProduct = {
        userId: req.user.id,
        productName: req.body.productName,
        category: req.body.category,
        model: req.body.model,
        price: req.body.price,
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
      res.send(product);
    } catch (err) {
      res.status(500).send('Some error occured');
    }
  }
);

// ROUTE 2 is for the show the product to none login user
// ROUTE 2: Get product using : GET "api/productDetail/getProduct"  -Login not required
router.get('/getProduct/:category', async (req, res) => {
  try {
    const myProduct = await ProductDetail.find({ category: req.params.category });
    res.send(myProduct);
  } catch (err) {
    res.status(500).send('Some error occured');
  }
});

// ROUTE 3: Get my product using : GET "api/productDetail/myProduct" --Login required
router.get('/myProduct', fetchuser, async (req, res) => {
  try {
    const myProduct = await ProductDetail.find({ userId: req.user.id });
    res.send(myProduct);
  } catch (err) {
    res.status(500).send('Some error occured');
  }
});

// ROUTE 4: Update my product details using : PUT "api/productDetail/updateProduct" --Login required
router.put('/updateProduct/:id', fetchuser, async (req, res) => {
  // If there are errors, return Bad requrest and the errors
  if (req.body.price < 0) {
    return res.status(400).json({ errors: 'Price must be a positive number' });
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
      res.status(404).send('Not found');
    }

    if (Product.userId.toString() !== req.user.id) {
      return res.status(404).send('Not Allowed');
    }

    // Updating the product
    Product = await ProductDetail.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: updateProduct },
      { new: true }
    );
    res.send(Product);
  } catch (err) {
    res.status(500).send('Some error occured');
  }
});

// ROUTE 5: Deleting the product using : DELETE "api/productDetail/deleteProduct" --Login required
router.delete('/deleteProduct/:id', fetchuser, async (req, res) => {
  try {
    // Find the product to be Delete
    let product = await ProductDetail.findById(req.params.id);
    if (!product) {
      res.status(404).send('Not found');
    }

    // Allow deletion only if user owns this product
    if (product.userId.toString() !== req.user.id) {
      return res.status(404).send('Not Allowed');
    }

    product = await ProductDetail.findByIdAndDelete(req.params.id);
    res.json({ Success: 'Note has been successfully deleted', product });
  } catch (err) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
