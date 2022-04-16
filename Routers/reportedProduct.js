const express = require('express');
const router = express.Router();
const ReportProduct = require('../models/ReportProduct');
const rentUser = require('../models/RentUser');
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
router.get("/adminreportDetails", fetchuser, async (req, res) => {
    try {
        const checkAdmin = await rentUser
            .findById({ _id: req.user.id })
            .select('-password');
        if (checkAdmin.role != 'Admin') {
            res.status(400).send({ success: false, message: 'You are not authorized to perform this action' });
        }
        let adminrepDtls = await ReportProduct.find();
        res.status(200).json({ success: true, adminrepDtls });
    } catch (err) {
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
})


module.exports = router;