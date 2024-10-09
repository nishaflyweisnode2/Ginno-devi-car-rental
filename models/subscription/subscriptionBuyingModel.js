const mongoose = require('mongoose');

const SubscriptionVsBuyingSchema = new mongoose.Schema({
    option: {
        type: String,
        enum: ['Subscribe', 'Buy']
    },
    zeroDownPayment: {
        type: Boolean,
        default: false
    },
    annualInsuranceIncluded: {
        type: Boolean,
        default: false
    },
    freeServiceAndMaintenance: {
        type: Boolean,
        default: false
    },
    returnOrExtendAnytime: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const SubscriptionVsBuying = mongoose.model('SubscriptionVsBuying', SubscriptionVsBuyingSchema);

module.exports = SubscriptionVsBuying;
