const mongoose = require('mongoose');

const adminCarPriceSchema = new mongoose.Schema({
    mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainCategory',
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    adminHourlyRate: {
        type: Number,
    },
    adminHourlyRateDiscountPrice: {
        type: Number,
    },
    adminHourlyRateDiscountPercentage: {
        type: Number,
    },
    adminMinPricePerHour: {
        type: Number,
    },
    adminMinPricePerHourDiscountPrice: {
        type: Number,
    },
    adminMinPricePerHourDiscountPercentage: {
        type: Number,
    },
    adminMaxPricePerHour: {
        type: Number,
    },
    adminMaxPricePerHourDiscountPrice: {
        type: Number,
    },
    adminMaxPricePerHourDiscountPercentage: {
        type: Number,
    },
    price: {
        type: Number,
    },
    priceDiscountPrice: {
        type: Number,
    },
    priceDiscountPercentage: {
        type: Number,
    },
    autoPricing: {
        type: Boolean,
        default: true,
    },
    hostHourlyRate: {
        type: Number,
    },
    hostHourlyRateDiscountPrice: {
        type: Number,
    },
    hostHourlyRateDiscountPercentage: {
        type: Number,
    },
    isHostPricing: {
        type: Boolean,
        default: false,
    },
    hostMinPricePerHour: {
        type: Number,
    },
    hostMinPricePerHourDiscountPrice: {
        type: Number,
    },
    hostMinPricePerHourDiscountPercentage: {
        type: Number,
    },
    hostMaxPricePerHour: {
        type: Number,
    },
    hostMaxPricePerHourDiscountPrice: {
        type: Number,
    },
    hostMaxPricePerHourDiscountPercentage: {
        type: Number,
    },
    depositedMoney: {
        type: Number,
    },
    depositedMoneyDiscountPrice: {
        type: Number,
    },
    depositedMoneyDiscountPercentage: {
        type: Number,
    },
    extendPrice: {
        type: Number,
    },
    extendPriceDiscountPrice: {
        type: Number,
    },
    extendPriceDiscountPercentage: {
        type: Number,
    },
    qcPointUsed: {
        type: Number,
    },

}, { timestamps: true });

const AdminCarPrice = mongoose.model('AdminCarPrice', adminCarPriceSchema);

module.exports = AdminCarPrice;
