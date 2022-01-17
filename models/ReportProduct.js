const mongoose = require('mongoose');

// Schema for RequestProduct Collection 
const ReportProductSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userId',
    },
    proOwnId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'proOwnId',
    },
    descOfReport: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// Creating Collection RequestProduct or using
const ReportProduct = mongoose.model('reportProduct', ReportProductSchema);

module.exports = ReportProduct; 
