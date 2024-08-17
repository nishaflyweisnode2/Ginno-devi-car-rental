const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
        },
        accountNo: {
            type: String,
            default: null
        },
        upiId: {
            type: String,
            default: null
        },
        branchName: {
            type: String,
            default: null
        },
        ifscCode: {
            type: String,
            default: null
        },
        refundAmount: {
            type: Number,
        },
        cancelationCharges: {
            type: Number,
        },
        totalRefundAmount: {
            type: Number,
        },
        totalBookingAmount: {
            type: Number,
        },
        type: {
            type: String,
            enum: ['UPI', 'WALLET', 'OTHER'],
            default: 'WALLET',
        },
        refundType: {
            type: String,
            enum: ['SECURITY-DEPOSITE', 'CANCELLATION', 'PENDING', 'WITHDRAW'],
            default: 'PENDING',
        },
        refundStatus: {
            type: String,
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
            default: 'PENDING',
        },
        userPaymentDetails: {
            type: String,
        },
        refundTransactionId: {
            type: String,
        },
        refundRemarks: {
            type: String,
        },
        refundTransactionDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

const Refund = mongoose.model('Refund', refundSchema);

module.exports = Refund;
