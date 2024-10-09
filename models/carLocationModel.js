const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    name: {
        type: String,
        required: true,
    },
    coordinates: {
        type: [Number],
        index: '2dsphere',
        required: true,
    },
    type: {
        type: String,
        enum: ['pickup', 'drop'],
        required: true,
    },
}, { timestamps: true });

locationSchema.index({ coordinates: '2dsphere' });

const LocationModel = mongoose.model('Location', locationSchema);

module.exports = LocationModel;
