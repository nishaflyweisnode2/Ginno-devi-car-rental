const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
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