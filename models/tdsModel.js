const mongoose = require('mongoose');

const TdsSchema = new mongoose.Schema({
    percentage: {
        type: Number,
        default: 0,
    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const TDS = mongoose.model('Tds', TdsSchema);

module.exports = TDS;
