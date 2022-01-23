const express = require('express');
const router = express.Router();
const ReportProduct = require('../models/ReportProduct');
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

// Route 1: To add a Report : POST "/api/reportProduct/ReportProduct:id" -login required
router.post('/ReportProduct/:id',fetchuser,[
    body('descOfReport','Enter a more on report').isLength({min:3})
], async(req,res)=>{
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const newReport = {
        userId: req.user.id,
        proOwnId: req.params.id,
        descOfReport: req.body.descOfReport
    }
    const Report = await ReportProduct.create(newReport);
    res.send(Report);
})


module.exports = router;