const mongoose = require('mongoose');

const CancellationChargeSchema = new mongoose.Schema({
    hourRange: {
        start: { type: Number, required: true },
        end: { type: Number, required: true },
    },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
}, { timestamps: true });

const CancellationCharge = mongoose.model('CancellationCharge', CancellationChargeSchema);
module.exports = CancellationCharge;
