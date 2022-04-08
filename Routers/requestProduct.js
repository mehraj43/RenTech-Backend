const express = require('express');
const router = express.Router();
const RequestProduct = require('../models/RequestedProduct');
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

// ROUTE 1: To add the requestDetail of product using : POST "/api/requestProduct/addRequestProduct"
router.post('/addRequestProduct', fetchuser, [
    body('productName', 'Name must be more than one word').isLength({ min: 2 }),
    body('descOfProduct', 'Enter a valid description').isLength({ min: 2 }),
    body('category', 'Enter a valid category').isLength({ min: 2 }),
], async (req, res) => {
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (req.body.price < 0) {
        return res.status(400).json({ errors: 'Price must be a positive number' });
    }
    try {
        let newReqProduct = {
            userId: req.user.id,
            productName: req.body.productName,
            descOfProduct: req.body.descOfProduct,
            category: req.body.category
        }
        if (req.body.modelName) {
            newReqProduct.modelName = req.body.modelName;
        }
        console.log(newReqProduct);
        const product = await RequestProduct.create(newReqProduct);
        res.send(product);
    } catch (err) {
        res.status(500).send("Some error occured in");
    }
})

// ROUTE 2: To get all requestedProduct using : GET "/api/requestProduct/getAllRequestedProduct"
router.get('/getAllRequestedProduct', async (req, res) => {
    try {
        const allProduct = await RequestProduct.find();
        res.send(allProduct);
    } catch (err) {
        res.status(500).send("Some error occured");
    }
})

// to view requested product
router.get('/viewReqProd', async (req, res) => {
    try {
        const requestedProd = await RequestProduct.find();
        res.status(200).send({ success: true, requestedProd })
    } catch (err) {
        res.status(500).send({ success: false, message: "Some error occured" });
    }
});

module.exports = router;