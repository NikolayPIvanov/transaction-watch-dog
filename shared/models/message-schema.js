const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  ts: {
    type: Date,
    required: true
  },
  data: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    required: true
  },
  sent: {
    type: Boolean,
    required: true
  }
});

module.exports = messageSchema