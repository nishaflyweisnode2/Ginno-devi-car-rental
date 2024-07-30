const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    cr: {
        type: Boolean,
        default: false,
    },
    dr: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['Booking', 'Wallet', 'Qc', 'Referral', 'Transfer']
    },
    amount: {
        type: Number,
    },
    details: {
        type: String,
    }
}, { timestamps: true });

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);

module.exports = PaymentTransaction;
