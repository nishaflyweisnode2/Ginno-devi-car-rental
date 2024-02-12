const mongoose = require('mongoose');

const ReferralBonusSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });

const ReferralBonus = mongoose.model('ReferralBonus', ReferralBonusSchema);

module.exports = ReferralBonus;
