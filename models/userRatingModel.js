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
    userRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    userComment: {
        type: String,
    },
    numOfUserReviews: {
        type: Number,
        default: 0,
    },
    averageUserRating: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Review = mongoose.model('UserReview', reviewSchema);

module.exports = Review;
