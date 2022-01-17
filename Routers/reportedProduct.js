const express = require('express');
const router = express.Router();
const ReportProduct = require('../models/ReportProduct');
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

// Route 1: To add a Report : POST "/api/reportProduct/ReportProduct:id" -login required
router.post('/ReportProduct/:id',fetchuser,[
    body('descOfReport','Enter a more on report').isLength({min:3})
], async(req,res)=>{
    const newReport = {
        userId: req.user.id,
        descOfReport: req.body.descOfReport
    }
    res.send(newReport)
})


module.exports = router;