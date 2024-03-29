const mongoose = require("mongoose");
const schema = mongoose.Schema;
const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
        },
        answer: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SubScriptionFAQ", faqSchema);