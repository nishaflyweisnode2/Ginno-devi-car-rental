const mongoose = require('mongoose');

const adminCarPriceSchema = new mongoose.Schema({
    mainCategory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainCategory',
    }],
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    adminHourlyRate: {
        type: Number,
    },
    adminMinPricePerHour: {
        type: Number,
    },
    adminMaxPricePerHour: {
        type: Number,
    },
    price: {
        type: Number,
    },
    autoPricing: {
        type: Boolean,
        default: true,
    },
    hostHourlyRate: {
        type: Number,
    },
    isHostPricing: {
        type: Boolean,
        default: false,
    },
    hostMinPricePerHour: {
        type: Number,
    },
    hostMaxPricePerHour: {
        type: Number,
    },
    depositedMoney: {
        type: Number,
    },
    extendPrice: {
        type: Number,
    },

}, { timestamps: true });

const AdminCarPrice = mongoose.model('AdminCarPrice', adminCarPriceSchema);

module.exports = AdminCarPrice;
