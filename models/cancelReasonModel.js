const mongoose = require('mongoose');

const CancelReasonSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const CancelReason = mongoose.model('CancelReason', CancelReasonSchema);

module.exports = CancelReason;
