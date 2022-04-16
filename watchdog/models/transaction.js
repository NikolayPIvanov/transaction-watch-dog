const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    ruleSetId: { type: Schema.Types.ObjectId, required: true, ref: 'RuleSet' },
    ruleId: { type: Schema.Types.ObjectId, required: true },
    blackHash: { type: String, required: false },
    blockNumber: { type: Number, required: false },
    from: { type: String, required: true },
    to: { type: String, required: false },
    gas: { type: Number, required: true },
    gasPrice: { type: String, required: true },
    hash: { type: String, required: true },
    input: { type: String, required: true },
    nonce: { type: Number, required: true },
    r: { type: String, required: true },
    s: { type: String, required: true },
    v: { type: String, required: true },
    transactionIndex: { type: String, required: false },
    type: { type: Number, required: true },
    value: { type: String, required: true }
});

module.exports = mongoose.model('Transaction', transactionSchema);