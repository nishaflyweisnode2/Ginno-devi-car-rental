const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
    },
    numOfUserReviews: {
        type: Number,
        default: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
