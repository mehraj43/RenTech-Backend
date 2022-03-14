const express = require('express');
const router = express.Router();
const NotifyData = require('../models/NotifyData');
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

// Route 1: to post notification use - '/notifyData/sendNotify'  --Login required
router.post('/sendNotify/:id', fetchuser, [
  body('messageNote', "message must be more than 5 length").isLength({ min: 2 }),
], async (req, res) => {
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success:false, message: errors.array() });
  }
  try {
    
  } catch (err) {

  }
})

module.exports = router;