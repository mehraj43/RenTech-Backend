const mongoose = require('mongoose');

// Schema for RequestProduct Collection 
const RequestProductSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userId',
    },
    productName: {
        type: String,
        required: true,
    },
    descOfProduct: {
        type: String,
        required: true,
    },
    modelName: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// Creating Collection RequestProduct or using
const RequestProduct = mongoose.model('requestProduct', RequestProductSchema);

module.exports = RequestProduct; 
