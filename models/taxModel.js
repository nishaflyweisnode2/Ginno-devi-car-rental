const mongoose = require('mongoose');

const TaxSchema = new mongoose.Schema({
    percentage: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Tax = mongoose.model('Tax', TaxSchema);

module.exports = Tax;
