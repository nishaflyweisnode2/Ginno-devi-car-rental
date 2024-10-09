const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
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
    },
    transctionId: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed', 'Canceled'],
        default: 'Pending'
    },
}, { timestamps: true });

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);

module.exports = PaymentTransaction;
