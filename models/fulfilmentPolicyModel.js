const mongoose = require('mongoose');

const fulfilmentPolicySchema = new mongoose.Schema({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
}, { timestamps: true });

const FulfilmentPolicy = mongoose.model('FulfilmentPolicy', fulfilmentPolicySchema);

module.exports = FulfilmentPolicy;
