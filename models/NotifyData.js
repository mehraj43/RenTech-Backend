const mongoose = require('mongoose');

// Schema for ProductDetail Collection
const NotifyDataSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userId',
    },
    RecId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recId',
    },
    proId:{
        type: String,
        default: ''
    },
    messageNote: {
        type: String,
    },
    role: {
        type: String,
        default: 'Normal'
    },
    statusNo: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now, // Seting Default Date to save the post/add time of productDetails
    },
});

// Creating Collection ProductDetail or using
const NotifyData = mongoose.model('notifyData', NotifyDataSchema);

module.exports = NotifyData;
