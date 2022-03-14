const express = require('express');
const router = express.Router();
const NotifyData = require('../models/NotifyData');
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

// Route 1: to post notification use - '/notifyUS/sendNotify'  --Login required
router.post('/sendNotify/:id', fetchuser, [
  body('messageNote', "message must be more than 5 length").isLength({ min: 2 }),
], async (req, res) => {
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array() });
  }
  try {
    const { role, proID, messageNote } = req.body;
    let data = {
      userId: req.user.id,
      messageNote: messageNote,
      RecId: req.params.id
    }
    if (role) {
      data.role = role;
    }
    if (proID) {
      data.proID = proID;
    }
    console.log(data);
    const Notify = await NotifyData.create(data);
    console.log("Success");
    res.status(200).json({ success: true, Notify })
  } catch (err) {
    res.status(500).json({ success: false, message: "Something happen" })
  }
})

router.get('/notification', fetchuser, async (req, res) => {
  const notification = await NotifyData.find({ RecId: req.user.id });
  res.status(200).json({ success: true, notification })
});

module.exports = router;