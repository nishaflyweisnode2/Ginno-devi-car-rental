const mongoose = require('mongoose');

const DoorstepDeliveryPriceSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    description: {
        type: String
    },
    distance: {
        type: String
    },
    extendPrice: {
        type: Number,
    },
    price: {
        type: Number,
    },
}, { timestamps: true });

const DoorstepDeliveryPrice = mongoose.model('DoorstepDeliveryPrice', DoorstepDeliveryPriceSchema);

module.exports = DoorstepDeliveryPrice;
