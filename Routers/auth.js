// It's use for the user Authentication or verification

const express = require('express');
const router = express.Router();
const rentUser = require('../models/RentUser');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser')
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'RentUser'  // My sign value


// ROUTE 1: Creating a User using : POST '/api/auth/createuser'  -Login not required
router.post('/createuser',[
    body('name','Enter a vlid name').isLength({min:3}),
    body('location','Enter a valid Loacation').isLength({min:2}),
    body('email','Enter a valid Email').isEmail(),
    body('password','Enter a Password at least 5 character').isLength({min:5})
],async(req,res)=>{
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try{

        // Check whether the user with email exists already
        let user = await rentUser.findOne({email:req.body.email});
        if(user){
            return res.status(500).json({error : "Sorry a user with this email already exists"});
        }

        // Securing password 
        const salt = bcrypt.genSaltSync(10);
        var secPass = bcrypt.hashSync(req.body.password,salt);

        // creating document of user or inserting a data of a new user
        user = await rentUser.create({
            name : req.body.name,
            location : req.body.location,
            email : req.body.email,
            password : secPass
        })

        // Creating JsonWebToken
        const data = {
            user : {
                id:user.id
            }
        }

        const authToken = jwt.sign(data,JWT_SECRET);
        res.json({authToken});
    }catch(err){
        console.error(err.message);
        res.status(500).send("Some Error occured");
    }
});

// ROUTE 2: Login User id using : POST "/api/auth/login" -Loing not required 
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password can not be blank').exists(),
],async(req,res)=>{
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    
    const {email , password} = req.body;
    try{
        // Checking whether user with this email is exists or not
        let user = await rentUser.findOne({email});
        if(!user){
            return res.status(400).json({error : "Please try to login with correct credentials"})
        }
        
        // Comparing the password with their hash
        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({error : "Please try to login with correct credentials"})
        }
        
        // To create a token
        const payload = {
            user : {
                id : user.id
            }
        }
        const authToken = jwt.sign(payload, JWT_SECRET);
        console.log(authToken);
        
        res.json({authToken});
    }catch(err){
        console.error(err.message);
        res.status(500).send("Some Error occured");
    }
})

// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser',fetchuser,async(req,res)=>{
    try{
        const userId = req.user.id;
        const user = await rentUser.findById(userId).select("-password");
        res.send(user);
    }catch(err){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: To update user Details using : PUT "/api/auth/updateDetail" .Login required
router.put('/updateDetail',fetchuser,async(req,res)=>{
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {name,location} = req.body;
    const newUser = {};
    if(name){newUser.name = name};
    if(location){newUser.location = location};
    try{
        const userId = req.user.id;
        const user = await rentUser.findByIdAndUpdate(userId,{$set : newUser},{new:true}).select("-password");
        res.send(user);
    }catch(err){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 5: To delete user details or account using : DELETE "/api/auth/deleteUser"  -Login required
router.delete('/deleteUser',fetchuser,async(req,res)=>{
    try{
        const userId = req.user.id;
        const user = await rentUser.findByIdAndDelete(userId).select("-password");
        res.send(user);
    }catch(err){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


module.exports = router;