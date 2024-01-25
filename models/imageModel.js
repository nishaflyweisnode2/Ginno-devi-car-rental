const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
    {
        images: [
            {
                img: {
                    type: String
                }
            }
        ],
    },
    { timestamps: true }
);

const Refund = mongoose.model('overAllImage', refundSchema);

module.exports = Refund;
