const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    code: {
        type: String,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    validUntil: {
        type: Date,
        required: true,
    },

}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
