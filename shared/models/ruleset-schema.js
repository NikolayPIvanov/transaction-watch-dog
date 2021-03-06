const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ruleSetSchema = new Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, required: true },
  rules: [
    {
      name: { type: String, required: true },

      // From / To
      from: { type: String, required: false },
      to: { type: String, required: false },

      // Value in ether
      lowerValueThreshold: { type: Number, required: false },
      upperValueThreshold: { type: Number, required: false },

      // Gas Price in ether
      lowerGasThreshold: { type: Number, required: false },
      upperGasThreshold: { type: Number, required: false },

      // Input
      input: { type: String, require: false },

      // Status
      status: { type: Boolean, required: false }
    }
  ]
});

ruleSetSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ruleSetSchema.index({ isActive: 1 }, {
  unique: true,
  partialFilterExpression: {
    'isActive': { $exists: true, $eq: true }
  }
})

module.exports = {
  ruleSetSchema
}