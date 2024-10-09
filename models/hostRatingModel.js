const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    },
    hostRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    hostComment: {
        type: String,
    },
    numOfHostReviews: {
        type: Number,
        default: 0,
    },
    averageHostRating: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Review = mongoose.model('HostReview', reviewSchema);

module.exports = Review;
