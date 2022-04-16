const mongoose = require('mongoose');
const { messageSchema } = require('../../shared/models')

module.exports = mongoose.model('Message', messageSchema);
