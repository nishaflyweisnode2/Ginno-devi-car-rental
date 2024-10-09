const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainCategory',
    },
    name: {
        type: String,
    },
    image: {
        type: String,
    },
    price: {
        type: Number,
    },
    status: {
        type: Boolean,
        default: false,
    },

},{ timestamps: true });

module.exports = mongoose.model("Category", categorySchema);