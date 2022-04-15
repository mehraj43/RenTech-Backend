const express = require('express');
const router = express.Router();
const NotifyData = require('../models/NotifyData');
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');
const nodemailer = require('../config/nodemailer.config');
const RentUser = require('../models/RentUser');

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
    if(req.user.id == req.params.id){
      return res.status(400).json({ success: false, message: "You Can't Request" });
    }
    let data = {
      userId: req.user.id,
      messageNote: messageNote,
      RecId: req.params.id
    }
    if (role) {
      data.role = role;
    }
    if (proID) {
      data.proId = proID;
    }
    const Notify = await NotifyData.create(data);
    res.status(200).json({ success: true, Notify })
  } catch (err) {
    res.status(500).json({ success: false, message: "Something happen" })
  }
})

// Router 2: to get the notification use - '/notifyUS/notification' --Login required
router.get('/notification', fetchuser, async (req, res) => {
  try {
    const notification = await NotifyData.find({ RecId: req.user.id });
    res.status(200).json({ success: true, notification })
  } catch (error) {
    res.status(500).json({ success: false, message: "Some error" });
  }
});

router.put('/replyNotific/Confirm/:notId', fetchuser, async (req, res) => {
  try {
    let notification = await NotifyData.findById({ _id: req.params.notId });
    notification.role = "user";
    const userInfo = await RentUser.findById({ _id: notification.userId });
    notification = await NotifyData.findByIdAndUpdate({ _id: req.params.notId }, { $set: { role: notification.role } })
    notification.messageNote = "Your request is accepted, check your mail";
    notification = await NotifyData.create({
      userId: req.user.id,
      role: "user",
      messageNote: notification.messageNote,
      RecId: notification.userId,
      proId: notification.proId
    })
    const ownInfo = await RentUser.findById({ _id: req.user.id });

    nodemailer.sendConfirmProduct(ownInfo.email, userInfo.email, "Your Request is confirm,Now You can Contact Owner", notification.proId);
    res.status(200).json({ success: true, message: "Confirm" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Some error" })
  }
})


router.put('/replyNotific/Reject/:notId', fetchuser, async (req, res) => {
  try {
    let notification = await NotifyData.findById({ _id: req.params.notId });
    notification.role = "user";
    notification = await NotifyData.findByIdAndDelete({ _id: req.params.notId })
    notification.messageNote = "Your request is Rejected";
    notification = await NotifyData.create({
      userId: req.user.id,
      role: "user",
      messageNote: notification.messageNote,
      RecId: notification.userId,
      proId: notification.proId
    })
    res.status(200).json({ success: true, message: "Product Rejected" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Some error" })
  }
})

module.exports = router;