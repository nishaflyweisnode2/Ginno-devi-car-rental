const mongoose = require('mongoose');

const DriverPriceSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    description: {
        type: String
    },
    price: {
        type: Number,
    },
    nightCharge: {
        type: Number,
    },
}, { timestamps: true });

const DriverPrice = mongoose.model('DriverPrice', DriverPriceSchema);

module.exports = DriverPrice;
