const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccessoryCategory',
    },
    image: {
        type: String,
    },
    price: {
        type: Number,
    },
    stock: {
        type: Number,
    },
    size: {
        type: [String],
    },
    status: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const Accessory = mongoose.model('Accessory', accessorySchema);

module.exports = Accessory;
