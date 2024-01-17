const mongoose = require("mongoose");

const subscriptionCategorySchema = new mongoose.Schema({
    mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainCategory',
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("SubscriptionCategory", subscriptionCategorySchema);