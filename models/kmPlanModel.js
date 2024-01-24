const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainCategory',
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    klLimit: {
        type: Number,
    },
    price: {
        type: Number,
    },
    extendPrice: {
        type: Number,
    },
    
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
