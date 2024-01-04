const mongoose = require('mongoose');

const carBrandSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
    },
    image: {
        type: String,
        trim: true,
    },
    status: {
        type: Boolean,
        default: false,
    },

});

const CarBrand = mongoose.model('Brand', carBrandSchema);

module.exports = CarBrand;
