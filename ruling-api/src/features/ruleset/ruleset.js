const RuleSet = require('./ruleset-model');
const Message = require('./message');
const ApiError = require('../../utils/api-error');
const messageAction = require('./message-actions');
const logger = require('../../../../shared/logging');
const httpStatusCodes = require('../../utils/http-codes');

const createMessageBody = (ruleSet) => ({
  ...ruleSet,
  // eslint-disable-next-line no-underscore-dangle
  externalId: ruleSet._id.toString(),
});

const sendMessage = async (action, ruleSet) => {
  const messageData = { command: action, body: createMessageBody(ruleSet) };
  logger.info(JSON.stringify(messageData));
  await Message.create({
    ts: Date.now(),
    data: JSON.stringify(messageData),
    read: false,
    sent: false,
  });
};

exports.getRuleSets = async (req, res, next) => {
  try {
    const ruleSets = await RuleSet.find();
    return res.status(200).json(ruleSets);
  } catch (err) {
    return next(err);
  }
};

exports.getRuleSet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ruleSet = await RuleSet.findById(id);
    if (!ruleSet) {
      throw new ApiError(`Ruleset with id:${id} could not be found.`);
    }
    return res.json(ruleSet);
  } catch (err) {
    return next(err);
  }
};

exports.createRuleSet = async (req, res, next) => {
  try {
    if (req.body.isActive) {
      const existingActive = await RuleSet.exists({ isActive: true });
      if (existingActive) {
        throw new ApiError('An active ruleset is already set', httpStatusCodes.BAD_REQUEST, 'Invalid request');
      }
    }

    const ruleSet = await RuleSet.create({ ...req.body });
    await sendMessage(messageAction.ADD, ruleSet);
    return res.status(201).json({ id: ruleSet.id });
  } catch (error) {
    return next(error);
  }
};

exports.updateRuleSet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    if (update.isActive) {
      const active = await RuleSet.findOne({ isActive: true }, '_id');
      if (active && active.id !== id) {
        throw new ApiError('An active ruleset is already set', httpStatusCodes.BAD_REQUEST, 'Invalid request');
      }
    }

    const ruleSet = await RuleSet.findByIdAndUpdate(id, update, { returnDocument: 'after', lean: true });
    if (!ruleSet) {
      throw new ApiError(`Ruleset with id:${id} could not be found.`);
    }
    await sendMessage(messageAction.UPDATE, ruleSet);
    return res.status(204).json();
  } catch (error) {
    return next(error);
  }
};

exports.deleteRuleSet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ruleSet = await RuleSet.findByIdAndDelete(id, { lean: true });
    if (!ruleSet) {
      throw new ApiError(`Ruleset with id:${id} could not be found.`);
    }
    await sendMessage(messageAction.DELETE, ruleSet);
    return res.status(204).json();
  } catch (err) {
    return next(err);
  }
};
