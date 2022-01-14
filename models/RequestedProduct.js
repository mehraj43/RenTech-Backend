const mongoose = require('mongoose');

// Schema for RequestProduct Collection 
const RequestProductSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'userId'
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'productId'
    },
    description : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        default : Date.now   // Seting Default Date to save the post time of users
    }
});

// Creating Collection RequestProduct or using
const RequestProduct = mongoose.model('requestProduct',RequestProductSchema);

module.exports = RequestProduct; 
