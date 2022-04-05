const express = require('express');
const router = express.Router();
const ReportProduct = require('../models/ReportProduct');
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

// Route 1: To add a Report : POST "/api/reportProduct/ReportProduct" -login required
router.post('/ReportProduct', fetchuser, [
    body('descOfReport', 'Enter a more on report').isLength({ min: 3 })
], async (req, res) => {
    // If there are errors, return Bad requrest and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    try {
        const newReport = {
            userId: req.user.id,
            proOwnId: req.body.proOwnId,
            proID: req.body.proID,
            descOfReport: req.body.descOfReport
        }
        const Report = await ReportProduct.create(newReport);
        res.status(200).json({ success: true, message: 'Report successfully submitted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Some Error' })
    }
})

// to send report details to admin
router.get("/adminreportDetails", async (req, res) => {
    try {
        let adminrepDtls = await ReportProduct.find({}, {});
        res.status(200).json({ success: true, adminrepDtls });
    } catch (err) {
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
})


module.exports = router;