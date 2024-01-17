const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    targetUsers: {
        type: String,
        enum: ['AllUsers', 'NewUsers'],
        required: true,
    },
    validUntil: {
        type: Date,
        required: true,
    },

}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
