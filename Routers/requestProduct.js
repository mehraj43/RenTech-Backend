const express = require('express');
const router = express.Router();
const RequestProduct = require('../models/RequestedProduct');
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

// ROUTE 1: To add the requestDetail of product using : POST "/api/requestProduct/addRequestProduct"
router.post('/addRequestProduct/:id', fetchuser,[
    body('description','Enter a valid description').isLength({min:2})
],async(req,res)=>{
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (req.body.price < 0) {
        return res.status(400).json({ errors: 'Price must be a positive number' });
    }
    try{
        const product = await RequestProduct.create({
            userId: req.user.id,
            productId: req.params.id,
            description: req.body.description
        });
        res.send(product);
    }catch(err){
        res.status(500).send("Some error occured");
    }
})

// ROUTE 2: To get all requestedProduct using : GET "/api/requestProduct/getAllRequestedProduct"
router.get('/getAllRequestedProduct',async(req,res)=>{
    try{
        const allProduct = await RequestProduct.find();
        res.send(allProduct);
    }catch(err){
        res.status(500).send("Some error occured");
    }
})

module.exports = router;