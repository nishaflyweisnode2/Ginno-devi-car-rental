const mongoose = require('mongoose');

const cancellationPolicySchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

const CancellationPolicy = mongoose.model('CancellationPolicy', cancellationPolicySchema);

module.exports = CancellationPolicy;
