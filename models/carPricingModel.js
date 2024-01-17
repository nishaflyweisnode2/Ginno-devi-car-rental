const mongoose = require('mongoose');

const carPricingSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        unique: true,
    },
    adminHourlyRate: {
        type: Number,
        required: true,
    },
    hostHourlyRate: {
        type: Number,
    },
    isHostPricing: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

const CarPricing = mongoose.model('CarPricing', carPricingSchema);

module.exports = CarPricing;
