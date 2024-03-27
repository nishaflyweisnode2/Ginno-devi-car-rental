const mongoose = require('mongoose');

const GPSSchema = new mongoose.Schema({
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
        }
    },

}, { timestamps: true });

GPSSchema.index({ location: '2dsphere' });

const GPSData = mongoose.model('GPSData', GPSSchema);

module.exports = GPSData;
