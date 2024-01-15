const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        enum: ['Long Duration Offer', 'Early Bird Offer', 'Raise the Cost'],
    },
    duration: {
        type: String,
    },
    discount: {
        type: Number,
    },
    isPercent: {
        type: Boolean,
        default: true,
    },
    isLongDurationOffer: {
        type: Boolean,
        default: false,
    },
    isEarlyBirdOffer: {
        type: Boolean,
        default: false,
    },
    isRaiseTheCost: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

const Offer = mongoose.model('HostOffer', offerSchema);

module.exports = Offer;
