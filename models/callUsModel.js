const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
    },
    email: {
        type: String,
    },
    reason: {
        type: String,
    },
});

const ContactUs = mongoose.model('CallUs', contactUsSchema);

module.exports = ContactUs;
