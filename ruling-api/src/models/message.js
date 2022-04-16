const mongoose = require('mongoose');
const messageSchema = require('../../../shared/models/message-schema')

module.exports = mongoose.model('Message', messageSchema);
