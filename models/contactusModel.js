const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    attachment: {
        type: String,
    },
    mobileNumber: {
        type: String,
    },
    email: {
        type: String,
    },
    message: {
        type: String,
    },
});

const ContactUs = mongoose.model('ContactUs', contactUsSchema);

module.exports = ContactUs;
