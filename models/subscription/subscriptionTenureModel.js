const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    tenure: {
        type: Number,
    },
    duration: {
        type: String,
    },
    status: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
