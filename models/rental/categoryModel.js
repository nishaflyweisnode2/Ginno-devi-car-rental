const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainCategory',
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("Category", categorySchema);