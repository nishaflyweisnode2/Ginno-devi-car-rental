const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    upiId: {
        type: String,
    },
    accountNumber: {
        type: String,
    },
    ifscCode: {
        type: String,
    },
    branchName: {
        type: String,
    }
}, { timestamps: true });

const UserDetails = mongoose.model('UserDetails', userDetailsSchema);

module.exports = UserDetails;
