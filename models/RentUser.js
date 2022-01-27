const mongoose = require('mongoose');

// Schema for RentUser Collection 
const RentUserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true    // Every users email is unique for other users
    },
    password: {
        type: String,
        required: true
    },
    bookMarkProducts: {
        type: String,
        default: '[]'
    },
    date: {
        type: Date,
        default: Date.now   // Seting Default Date to save the register time of users
    }
});

// Creating Collection RentUser or using
const RentUser = mongoose.model('rentUser', RentUserSchema);

RentUser.createIndexes();  // To create unique index for all users
module.exports = RentUser; 
