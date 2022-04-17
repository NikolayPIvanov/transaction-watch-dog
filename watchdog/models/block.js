const mongoose = require('mongoose');

const { Schema } = mongoose;

const transactionSchema = new Schema({
  number: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('BlockNumber', transactionSchema);
