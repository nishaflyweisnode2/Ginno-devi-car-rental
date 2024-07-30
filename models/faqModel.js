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
        userType: {
            type: String,
            enum: ["ADMIN", "USER", "PARTNER", "SUB-ADMIN"],
        },
        type: {
            type: String,
            enum: ["RENTAL", "SHARING", "SUBSCRIPTION", "GOVERNMENT"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("FAQ", faqSchema);