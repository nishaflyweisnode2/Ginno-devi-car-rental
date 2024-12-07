const mongoose = require('mongoose');

const HrKmSchema = new mongoose.Schema({
    hr: { type: Number, required: true, default: 0 },
    km: { type: Number, required: true, default: 0 },
    description: { type: String, default: '' },
}, { timestamps: true });

const HrKm = mongoose.model('HrKm', HrKmSchema);
module.exports = HrKm;
