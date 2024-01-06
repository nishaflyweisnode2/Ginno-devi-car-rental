const mongoose = require('mongoose');

const carImageSchema = new mongoose.Schema({
    tips: [{
        type: String,
    }],
    images: [
        {
            img: {
                type: String
            }
        }
    ],
    url: {
        type: String,
    },
}, { timestamps: true });

const CarImage = mongoose.model('CarImage', carImageSchema);

module.exports = CarImage;
