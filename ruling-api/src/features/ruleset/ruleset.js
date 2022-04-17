const RuleSet = require('./ruleset-model')
const Message = require('./message')
const ApiError = require('../../utils/api-error')
const messageAction = require('./message-actions')
const logger = require('../../../../shared/logging')

const createMessageBody = (ruleSet) => {
    return {
        ...ruleSet._doc,
        externalId: ruleSet._doc._id.toString(),
        _id: null
    }
}

const sendMessage = async (action, ruleSet) => {
    const messageData = { command: action, body: createMessageBody(ruleSet) };
    logger.info(messageData)
    const message = new Message({
        ts: Date.now(),
        data: JSON.stringify(messageData),
        read: false,
        sent: false
    })
    await message.save()
}

exports.getRuleSets = async (req, res, next) => {
    try {
        const ruleSets = await RuleSet.find()
        return res.status(200).json(ruleSets)
    }
    catch (err) {
        next(err)
    }
}

exports.getRuleSet = async (req, res, next) => {
    try {
        const id = req.params.id
        const ruleSet = await RuleSet.findById(id)
        if (!ruleSet) {
            throw new ApiError(`Ruleset with id:${id} could not be found.`)
        }
        return res.json(ruleSet)
    }
    catch (err) {
        next(err)
    }
}

exports.createRuleSet = async (req, res, next) => {
    try {
        let ruleSet = new RuleSet({ ...req.body })
        ruleSet = await ruleSet.save()
        await sendMessage(messageAction.ADD, ruleSet)
        return res.status(201).json({ id: ruleSet._id })
    } catch (error) {
        next(error)
    }
}

exports.updateRuleSet = async (req, res, next) => {
    try {
        const id = req.params.id
        const update = { ...req.body }
        const ruleSet = await RuleSet.findByIdAndUpdate(id, update, { returnDocument: 'after' })
        if (!ruleSet) {
            throw new ApiError(`Ruleset with id:${id} could not be found.`)
        }
        await sendMessage(messageAction.UPDATE, ruleSet)
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

exports.deleteRuleSet = async (req, res, next) => {
    try {
        const id = req.params.id
        const ruleSet = await RuleSet.findByIdAndDelete(id)
        if (!ruleSet) {
            throw new ApiError(`Ruleset with id:${id} could not be found.`)
        }
        await sendMessage(messageAction.DELETE, ruleSet)
        return res.status(204).json()
    }
    catch (err) {
        next(err)
    }
}