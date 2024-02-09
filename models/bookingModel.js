const mongoose = require('mongoose');

const upcomingPaymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    }
});

const bookingSchema = new mongoose.Schema(
    {
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car',
        },
        mainCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MainCategory',
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
        },
        tripPackage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdminPackage',
        },
        accessories: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Accessory',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        pickupLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
        },
        dropOffLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
        },
        carChoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        pickupDate: {
            type: Date,
        },
        dropOffDate: {
            type: Date,
        },
        pickupTime: {
            type: String,
        },
        dropOffTime: {
            type: String,
        },
        destinationLocation: {
            type: String,
        },
        pickupCoordinates: {
            type: {
                type: String,
            },
            coordinates: {
                type: [Number],
            },
        },
        dropCoordinates: {
            type: {
                type: String,
            },
            coordinates: {
                type: [Number],
            },
        },
        seat: {
            type: Number,
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'CANCELLED', 'COMPLETED'],
            default: 'PENDING',
        },
        tripProtctionMoney: {
            type: Number,
        },
        carChoicePrice: {
            type: Number,
        },
        depositedMoney: {
            type: Number,
        },
        price: {
            type: Number,
        },
        totalPrice: {
            type: Number,
        },
        subscriptionMonthlyPaymentAmount: {
            type: Number,
        },
        accessoriesPrice: {
            type: Number,
        },
        walletAmount: {
            type: Number,
        },
        isWalletUsed: {
            type: Boolean,
            default: false,
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'FAILED', 'PAID'],
            default: 'PENDING',
        },
        referenceId: {
            type: String,
        },
        isTimeExtended: {
            type: Boolean,
            default: false,
        },
        extendedDropOffDate: {
            type: Date,
            default: null,
        },
        extendedDropOffTime: {
            type: String,
            default: null,
        },
        extendedPrice: {
            type: Number,
        },
        totalExtendedPrice: {
            type: Number,
        },
        isExtendedPricePaid: {
            type: Boolean,
            default: false
        },
        offerCode: {
            type: String,
        },
        discountPrice: {
            type: Number,
        },
        isCouponApplied: {
            type: Boolean,
            default: false
        },
        coinAmount: {
            type: Number,
        },
        isQuackCoinApplied: {
            type: Boolean,
            default: false
        },
        tripStartTime: {
            type: Date,
        },
        tripEndTime: {
            type: Date,
        },
        isTripCompleted: {
            type: Boolean,
            default: false,
        },
        tripStartKm: {
            type: Number,
        },
        approvedOtp: {
            type: String,
        },
        isApprovedOtp: {
            type: Boolean,
            default: false
        },
        approvedImage: {
            type: String,
        },
        vechileNo: {
            type: String,
        },
        tripEndKm: {
            type: Number,
        },
        remarks: {
            type: String,
        },
        rejectRemarks: {
            type: String,
        },
        rejectOtp: {
            type: String,
        },
        isRejectOtp: {
            type: Boolean,
            default: false
        },
        tripEndOtp: {
            type: String,
        },
        isTripEndOtp: {
            type: Boolean,
            default: false
        },
        isSubscription: {
            type: Boolean,
            default: false,
        },
        subscriptionMonths: {
            type: Number,
            default: 0,
        },
        refundPreference: {
            type: String,
            enum: ['UPI', 'WALLET'],
            default: 'WALLET',
        },
        upiId: {
            type: String,
        },
        cancelReason: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CancelReason',
        },
        isPlanExtend: {
            type: Boolean,
            default: false
        },
        driverPrice: {
            type: Number,
        },
        uniqueBookinId: {
            type: String,
        },
        upcomingPayments: {
            type: [upcomingPaymentSchema],
            default: []
        }


    },
    { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
