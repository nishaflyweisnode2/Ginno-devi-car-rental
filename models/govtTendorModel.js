const mongoose = require('mongoose');

const TenderApplicationSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    apply: {
        type: String,
    }
});

const TenderApplication = mongoose.model('GovtTendors', TenderApplicationSchema);

module.exports = TenderApplication;
