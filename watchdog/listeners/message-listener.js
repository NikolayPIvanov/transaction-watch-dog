/* eslint-disable no-underscore-dangle */
const Rascal = require('rascal');
const watchdogConfig = require('../config');
const rascalConfig = require('../../shared/config/rabbitmq');
const logger = require('../../shared/logging');

const { rabbitMqUser, rabbitMqPassword } = watchdogConfig;
const { RuleSet } = require('../models');

const createBroker = async () => {
  const brokerConfig = rascalConfig({ user: rabbitMqUser, password: rabbitMqPassword }).rascal;
  const broker = await Rascal.BrokerAsPromised.create(Rascal.withDefaultConfig(brokerConfig));
  broker.on('error', logger.error);
  return broker;
};

const subscribe = async (broker, topic, action) => {
  const subscription = await broker.subscribe(topic);
  subscription
    .on('message', async (message, content, ackOrNack) => {
      action(message, content, ackOrNack);
    })
    .on('error', logger.error);
};

const parseContent = (content) => {
  const { body } = JSON.parse(content);
  const result = {};
  Object.keys(body).forEach((property) => {
    if (!property.startsWith('_')) {
      result[property] = body[property];
    }
  });
  return result;
};

const addRulesetListener = async (broker, action) => {
  const topic = 'addRuleSet';
  const handler = async (message, content, ackOrNack) => {
    const ruleSetCreate = parseContent(content);
    logger.info(`Adding new ruleset: ${content}`);
    const ruleSet = await RuleSet.create({ ...ruleSetCreate });
    action(ruleSet);
    ackOrNack();
  };

  await subscribe(broker, topic, handler);
};

const updateRulesetListener = async (broker, cb) => {
  const topic = 'updateRuleSet';
  const handler = async (message, content, ackOrNack) => {
    const ruleSetUpdate = parseContent(content);
    logger.info(`Updating ruleset: ${content}`);
    const filter = { externalId: ruleSetUpdate.externalId };
    const update = {
      $set: {
        ...ruleSetUpdate,
      },
    };
    const updatedResult = await RuleSet.findOneAndUpdate(filter, update, { returnDocument: 'after' });
    const ruleSet = updatedResult._doc;
    ruleSet.rules = ruleSet.rules.map((r) => r._doc);
    cb(ruleSet);
    ackOrNack();
  };

  await subscribe(broker, topic, handler);
};

const deleteRulesetListener = async (broker, cb) => {
  const topic = 'deleteRuleSet';
  const handler = async (message, content, ackOrNack) => {
    const ruleSetDelete = parseContent(content);
    logger.info(`Deleting ruleset: ${JSON.stringify(ruleSetDelete)}`);
    const ruleSet = await RuleSet.findOneAndDelete({ externalId: ruleSetDelete.externalId });
    cb(ruleSet);
    ackOrNack();
  };

  await subscribe(broker, topic, handler);
};

exports.broker = createBroker;
exports.add = addRulesetListener;
exports.update = updateRulesetListener;
exports.delete = deleteRulesetListener;
