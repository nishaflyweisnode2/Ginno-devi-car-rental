const mongoose = require('mongoose');

const adminPackageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
});

const AdminPackage = mongoose.model('AdminPackage', adminPackageSchema);

module.exports = AdminPackage;
