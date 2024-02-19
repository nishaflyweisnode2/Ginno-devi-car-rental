const mongoose = require('mongoose');

const ReferralBonusSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    type: {
        type: String,
        enum: ['CarReferral', 'UserReferral', 'RoyalityReward'],
    },
    percentage: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const ReferralBonus = mongoose.model('ReferralBonus', ReferralBonusSchema);

module.exports = ReferralBonus;
