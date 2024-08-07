const mongoose = require('mongoose');

const sharedCarSchema = new mongoose.Schema({
    mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainCategory',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
    },
    pickupLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
    },
    dropOffLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
    },
    availableFrom: {
        type: Date,
    },
    availableTo: {
        type: Date,
    },
    startTime: {
        type: String,
    },
    endTime: {
        type: String,
    },
    pickupCoordinates: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        },
    },
    dropCoordinates: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        },
    },
    stopCity: [{
        type: String,
    }],
    passengerPickupTime: {
        type: String,
    },
    noOfPassenger: {
        type: Number,
    },
    seatprice: {
        type: Number,
    },
    route: {
        type: String,
    },
    uniqueBookinId: {
        type: String,
    },
    type: {
        type: String,
        enum: ['Rental', 'Sharing', 'Subscription', 'GovernmentTendor', 'BikeRental', 'TractorRental']
    },
    booking: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    }],

}, { timestamps: true });

const SharedCar = mongoose.model('SharedCar', sharedCarSchema);

module.exports = SharedCar;
