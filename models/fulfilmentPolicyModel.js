const mongoose = require('mongoose');

const fulfilmentPolicySchema = new mongoose.Schema({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});

const FulfilmentPolicy = mongoose.model('FulfilmentPolicy', fulfilmentPolicySchema);

module.exports = FulfilmentPolicy;
