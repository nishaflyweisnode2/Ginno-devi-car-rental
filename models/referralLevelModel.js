const mongoose = require('mongoose');

const ReferralLevelSchema = new mongoose.Schema({
    referralBonus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReferralBonus',
    },
    allLevels: [{
        level: String,
        percentage: String,
    }],
    type: {
        type: String,
    },

}, { timestamps: true });

const ReferralLevel = mongoose.model('ReferralLevel', ReferralLevelSchema);

module.exports = ReferralLevel;
