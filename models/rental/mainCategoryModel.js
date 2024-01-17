const mongoose = require("mongoose");

const mainCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("MainCategory", mainCategorySchema);