const express = require('express');
const router = express.Router();
const NotifyData = require('../models/NotifyData');
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

// Route 1: to post notification use - '/notifyData/sendNotify'  --Login required
router.post('/sendNotify',fetchuser,[
    body('messageNote',"message must be more than 5 length").isLength({ min: 2 }),
], async(req, res)=>{
    try {
        
    } catch (err) {
        
    }
})

module.exports = router;