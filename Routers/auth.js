// It's use for the user Authentication or verification

const otpGenerator = require('otp-generator');

const express = require('express');
const router = express.Router();
const rentUser = require('../models/RentUser');
const ProductDetail = require('../models/ProductDetails');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth.config');
// const JWT_SECRET = 'RentUser'; // My sign value

const nodemailer = require('../config/nodemailer.config');

// ROUTE 1: Creating a User using : POST '/api/a  uth/createuser'  -Login not required
router.post(
  '/createuser',
  [
    body('name', 'Enter a vlid name').isLength({ min: 3 }),
    body('location', 'Enter a valid Loacation').isLength({ min: 2 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Enter a Password at least 5 character').isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Check whether the user with email exists already
      let user = await rentUser.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(500)
          .json({ error: 'Sorry a user with this email already exists' });
      }

      // Securing password
      const salt = bcrypt.genSaltSync(10);
      var secPass = bcrypt.hashSync(req.body.password, salt);

      // creating document of user or inserting a data of a new user
      user = await rentUser.create({
        name: req.body.name,
        location: req.body.location,
        email: req.body.email,
        password: secPass,
      });

      // Creating JsonWebToken
      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      res.status(200).json({
        success: true,
        authToken,
        message: 'You have SignUp successfully',
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Some Error occured' });
    }
  }
);

// ROUTE 2: Login User id using : POST "/api/auth/login" -Loing not required
router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password can not be blank').exists(),
  ],
  async (req, res) => {
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { email, password } = req.body;
    try {
      // Checking whether user with this email is exists or not
      let user = await rentUser.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ message: 'Please try to login with correct credentials' });
      }

      // Comparing the password with their hash
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ message: 'Please try to login with correct credentials' });
      }

      // To create a token
      const payload = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(payload, JWT_SECRET);

      res.json({ success: true, authToken, message: 'Login Successful' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Some Error occured' });
    }
  }
);

// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.get('/getuser', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await rentUser.findById(userId).select('-password');
    res.send(user);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Some Error occured' });
  }
});

// ROUTE 4: To update user Details using : PUT "/api/auth/updateDetail" .Login required
router.put('/updateDetail', fetchuser, async (req, res) => {
  // If there are errors, return Bad requrest and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  const { name, location } = req.body;
  const newUser = {};
  if (name) {
    newUser.name = name;
  }
  if (location) {
    newUser.location = location;
  }
  try {
    const userId = req.user.id;
    const user = await rentUser
      .findByIdAndUpdate(userId, { $set: newUser }, { new: true })
      .select('-password');
    res.send(user);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Some Error occured' });
  }
});

// ROUTE 5: To delete user details or account using : DELETE "/api/auth/deleteUser"  -only Admin can use this
router.delete('/deleteUser:id', fetchuser, async (req, res) => {
  try {
    const userId = req.params.id;
    await ProductDetail.deleteMany({ userId });
    const user = await rentUser.findByIdAndDelete(userId).select('-password');
    res.send(user);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Some Error occured' });
  }
});

// ROUTE 6: To add BookMark Products : PUT "/api/auth/addBookMarkProduct"  -->Login required
router.put('/addBookMarkProducts', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    let User = await rentUser.findById(userId);
    if (User) {
      let bookMarkProducts = JSON.parse(User.bookMarkProducts);
      bookMarkProducts.push(req.body.productID);
      bookMarkProducts = JSON.stringify(bookMarkProducts);
      const user = await rentUser
        .findByIdAndUpdate(
          userId,
          { $set: { bookMarkProducts } },
          { new: true }
        )
        .select('-password');
      let { noOfBookMarked } = await ProductDetail.findById(req.body.productID);
      noOfBookMarked++;
      const updateNoOfBookMarked = await ProductDetail.findByIdAndUpdate(
        { _id: req.body.productID },
        { $set: { noOfBookMarked } }
      ).select('noOfBookMarked');
      res.send({ success: true, user, updateNoOfBookMarked });
    } else {
      console.log('Not');
      return res.status(404).send('Not Allowed');
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Some Error occured' });
  }
});

// ROUTE 7: to remove from BookMark
router.put('/removeFromBookMark', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    let User = await rentUser.findById(userId);
    if (User) {
      let bookMarkProducts = JSON.parse(User.bookMarkProducts);
      if (bookMarkProducts.includes(req.body.proId)) {
        const index = bookMarkProducts.indexOf(req.body.proId);
        if (index > -1) {
          bookMarkProducts.splice(index, 1);
        }
        bookMarkProducts = JSON.stringify(bookMarkProducts);
        const user = await rentUser
          .findByIdAndUpdate(
            userId,
            { $set: { bookMarkProducts } },
            { new: true }
          )
          .select('-password');
        let { noOfBookMarked } = await ProductDetail.findById(req.body.proId);
        noOfBookMarked--;
        const updateNoOfBookMarked = await ProductDetail.findByIdAndUpdate(
          { _id: req.body.proId },
          { $set: { noOfBookMarked } }
        ).select('noOfBookMarked');
        res.send({ success: true, user, updateNoOfBookMarked });
      } else {
        res.send({ success: false, message: 'Product is already removed' });
      }
    } else {
      return res.status(404).json({ success: false, message: 'Not Allowed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Some Error occured' });
  }
});

// Sending OTP to verify email
router.post('/getOTP', async (req, res) => {
  try {
    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      specialChars: true,
    });
    nodemailer.sendConfirmationEmail(req.body.email, req.body.email, OTP);
    res.status(200).send({ success: true, OTP });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

// checkMail if exist or not as well as Activiation then Send the OTP
router.post('/resPassOTP', async (req, res) => {
  try {
    let user = await rentUser.findOne({ email: req.body.email });
    if (!user || !user.active) {
      return res
        .status(400)
        .json({ message: 'Please try to login with correct credentials' });
    }
    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      specialChars: true,
    });
    nodemailer.sendConfirmationEmail(req.body.email, req.body.email, OTP);
    res.status(200).send({ success: true, OTP });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// To reset password
router.put('/changePass', async (req, res) => {
  try {
    let user = await rentUser.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(400)
        .json({ error: 'Please try to login with correct credentials' });
    }
    const salt = bcrypt.genSaltSync(10);
    var secPass = bcrypt.hashSync(req.body.newPassword, salt);
    user = await rentUser.findOneAndUpdate(
      { email: req.body.email },
      { $set: { password: secPass } }
    );

    res.status(200).send({
      success: true,
      message: 'Your Password is changed Successfully',
    });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

// to send user data to admin
router.get('/adminUserDetails', async (req, res) => {
  try {
    console.log('Run');
    let adminUsrDtls = await rentUser
      .find({ role: { $ne: 'Admin' } })
      .select('-password');
    res.status(200).json({ success: true, adminUsrDtls });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

// to send product detail to admin
router.get('/adminProductDetails', async (req, res) => {
  try {
    let adminprodDtls = await ProductDetail.find(
      {},
      {
        productImage: 0,
        proDesc: 0,
        ratingOfProduct: 0,
        dateOfRent: 0,
        dateOfRentExp: 0,
      }
    );
    // let adminprodDtls = await productdetails.find();
    res.status(200).json({ success: true, adminprodDtls });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

// To diactivate or activate the user  ---Not verified yet
router.put('/activeUSer/:id', fetchuser, async (req, res) => {
  try {
    const adminDetail = await rentUser
      .findById({ _id: req.user.id })
      .select('-password');
    if (adminDetail.role != 'Admin') {
      res
        .status(400)
        .send({ success: false, message: 'You are not autherized person' });
    }
    const value = req.body.value;
    const updateUser = await rentUser.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { active: value } }
    );
    res.status(200).send({ success: true, message: updateUser.active });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

// To delete product
router.delete('/deleteProd/:id', fetchuser, async (req, res) => {
  try {
    const checkAdmin = await rentUser
      .findById({ _id: req.user.id })
      .select('-password');
    if (checkAdmin.role != 'Admin') {
      res.status(400).send({
        success: false,
        message: 'You are not authorized to perform this action',
      });
    }
    await ProductDetail.findByIdAndDelete({
      _id: req.params.id,
    });
    res
      .status(200)
      .send({ success: true, message: 'Product successfully Deleted' });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
